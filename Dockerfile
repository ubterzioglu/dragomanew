# Builds the site in app/ and serves it with nginx (Coolify: base directory /, Dockerfile /Dockerfile).
# Kept outside app/ so the stylesheet build, which reads every text file there, never sees these comments.
# The site origin is fixed at build time; pass VITE_SITE_ORIGIN as a build variable when the domain changes.

# ---- Build stage ----
FROM node:24-alpine AS build
WORKDIR /app
ARG VITE_SITE_ORIGIN=https://notyetbro.club
ENV VITE_SITE_ORIGIN=$VITE_SITE_ORIGIN
COPY app/package.json app/package-lock.json ./
# No install scripts: postinstall only sets up the lint tools, and the build needs no native compile.
RUN npm ci --ignore-scripts --no-audit --no-fund
COPY app/ ./
RUN npm run build && rm -rf dist/.vite

# ---- Runtime stage ----
FROM nginx:1.27-alpine
COPY app/deploy/nginx/dragoman.conf /etc/nginx/conf.d/default.conf
# The proxy in front connects over IPv4, and IPv6 may be unavailable in the container.
RUN sed -i '/listen \[::\]:80;/d' /etc/nginx/conf.d/default.conf && nginx -t
COPY --from=build /app/dist /var/www/dragoman

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
