# Builds the site in app/ and the staff panel in panel/, and serves both with nginx
# (Coolify: base directory /, Dockerfile /Dockerfile).
# Kept outside app/ so the stylesheet build, which reads every text file there, never sees these comments.
# The site origin is fixed at build time; pass VITE_SITE_ORIGIN as a build variable when the domain changes.

# The Supabase project the forms post to and the panel signs in to. Both values ship to every browser
# (the project URL and its sb_publishable_ key), so they are not secrets. Never pass a secret or
# service-role key here: it would end up in the public bundles. Override both as build variables
# when the project changes. BuildKit's SecretsUsedInArgOrEnv warning comes from the word KEY in the name.
ARG VITE_SUPABASE_URL=https://usyhwjboxjmjsxlwnqqr.supabase.co
ARG VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_FClV5BfaPresWIUTgfDdIg_2Iq0d5eT

# ---- Site build stage ----
FROM node:24-alpine AS build
WORKDIR /app
ARG VITE_SITE_ORIGIN=https://notyetbro.club
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
# The build writes the Supabase origin into each page's connect-src and switches the forms to it.
ENV VITE_SITE_ORIGIN=$VITE_SITE_ORIGIN \
    VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
COPY app/package.json app/package-lock.json ./
# No install scripts: postinstall only sets up the lint tools, and the build needs no native compile.
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY app/ ./
# Only an sb_publishable_ key may reach the bundles: a secret key would leak, a legacy JWT (eyJ…)
# is not accepted by the function, and anything else is a typo. The panel stage repeats this check.
RUN case "$VITE_SUPABASE_PUBLISHABLE_KEY" in \
      sb_publishable_*) ;; \
      sb_secret_*) echo "VITE_SUPABASE_PUBLISHABLE_KEY is a secret key (sb_secret_); it would be published in the bundles. Use the sb_publishable_ key." >&2; exit 1;; \
      eyJ*) echo "VITE_SUPABASE_PUBLISHABLE_KEY is a legacy JWT (anon/service_role). Use the sb_publishable_ key." >&2; exit 1;; \
      *) echo "VITE_SUPABASE_PUBLISHABLE_KEY must start with sb_publishable_ (it is empty or has another form)." >&2; exit 1;; \
    esac \
    && npm run build && rm -rf dist/.vite

# ---- Panel build stage (its own Vite app and lockfile, served under /panel/) ----
FROM node:24-alpine AS panel
WORKDIR /panel
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
    VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY
COPY panel/package.json panel/package-lock.json ./
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY panel/ ./
# Without both values the panel would build and then show only a settings error. Same key guard as the site stage.
RUN { test -n "$VITE_SUPABASE_URL" && test -n "$VITE_SUPABASE_PUBLISHABLE_KEY"; } \
      || { echo "The panel needs VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY" >&2; exit 1; }; \
    case "$VITE_SUPABASE_PUBLISHABLE_KEY" in \
      sb_publishable_*) ;; \
      sb_secret_*) echo "VITE_SUPABASE_PUBLISHABLE_KEY is a secret key (sb_secret_); it would be published in the bundles. Use the sb_publishable_ key." >&2; exit 1;; \
      eyJ*) echo "VITE_SUPABASE_PUBLISHABLE_KEY is a legacy JWT (anon/service_role). Use the sb_publishable_ key." >&2; exit 1;; \
      *) echo "VITE_SUPABASE_PUBLISHABLE_KEY must start with sb_publishable_ (it is empty or has another form)." >&2; exit 1;; \
    esac \
    && npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine
ARG VITE_SUPABASE_URL
COPY app/deploy/nginx/dragoman.conf /etc/nginx/conf.d/default.conf
# The proxy in front connects over IPv4, and IPv6 may be unavailable in the container.
# The panel's connect-src gets the Supabase origin; an empty or malformed URL stops the build here
# (https only, http just for a local stack), and so does a placeholder left in the file.
RUN set -eu; \
    conf=/etc/nginx/conf.d/default.conf; \
    origin=$(printf '%s' "$VITE_SUPABASE_URL" | sed -E 's|^(https?://[^/?#]+).*$|\1|'); \
    if ! printf '%s' "$origin" | grep -Eq '^(https://[A-Za-z0-9.-]+|http://(localhost|127\.0\.0\.1))(:[0-9]+)?$'; then \
      echo "VITE_SUPABASE_URL must be https://<project>.supabase.co (http only for localhost)" >&2; exit 1; \
    fi; \
    sed -i -e '/listen \[::\]:80;/d' -e "s|__SUPABASE_ORIGIN__|$origin|g" "$conf"; \
    if grep -q '__SUPABASE_ORIGIN__' "$conf"; then echo "Supabase origin placeholder left in $conf" >&2; exit 1; fi; \
    nginx -t
COPY --from=build /app/dist /var/www/dragoman
COPY --from=panel /panel/dist /var/www/dragoman/panel

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
