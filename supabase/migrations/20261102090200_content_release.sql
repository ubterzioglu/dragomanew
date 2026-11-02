-- Publishing and deploying (dalga2-sozlesme §1, §5):
--   publish-content -> apply_content_release -> content_releases row -> queue_site_deploy
--   pg_cron (every minute) -> dispatch_site_deploy -> pg_net -> site-deploy function -> Coolify
--
-- apply_content_release and queue_site_deploy run as service_role only; request_site_deploy is the
-- one staff RPC (site.deploy). Errors raised for publish-content use stable messages:
--   conflict, stale_draft:<entry id | form kind>, not_found:<entry id | type/key | form kind>,
--   bad_request:<detail>.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Types whose documents carry status, keep archived copies and have slug history.
-- Types with manual order: event, subgroup, product, team_member, service_offer.

/**
 * Old public addresses after a publish: every locale whose slug (or, for events, category)
 * changed is appended, and any address that is live again is dropped, so a slug that comes back
 * never redirects to itself.
 */
create function private.next_slug_history(
  p_type public.content_type,
  p_history jsonb,
  p_old jsonb,
  p_new jsonb
)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  with old_items as (
    select l.locale, p_old -> 'slug' ->> l.locale as slug,
           case when p_type = 'event' then p_old ->> 'category' end as category
    from unnest(array['tr', 'en', 'fr', 'de']) as l(locale)
    where p_old is not null and p_old -> 'slug' ->> l.locale is not null
  ),
  live as (
    select l.locale, p_new -> 'slug' ->> l.locale as slug,
           case when p_type = 'event' then p_new ->> 'category' end as category
    from unnest(array['tr', 'en', 'fr', 'de']) as l(locale)
  ),
  added as (
    select o.locale, o.slug, o.category
    from old_items as o
    join live as n on n.locale = o.locale
    where n.slug is distinct from o.slug or n.category is distinct from o.category
  ),
  existing as (
    select h ->> 'locale' as locale, h ->> 'slug' as slug, h ->> 'category' as category, ord
    from jsonb_array_elements(coalesce(p_history, '[]'::jsonb)) with ordinality as x(h, ord)
  ),
  merged as (
    select locale, slug, category, ord from existing
    union all
    select a.locale, a.slug, a.category, 1000000 + row_number() over (order by a.locale)
    from added as a
    where not exists (
      select 1 from existing as e
      where e.locale = a.locale and e.slug = a.slug and e.category is not distinct from a.category
    )
  )
  select coalesce(
    jsonb_agg(
      jsonb_strip_nulls(jsonb_build_object('locale', m.locale, 'slug', m.slug, 'category', m.category))
      order by m.ord
    ),
    '[]'::jsonb
  )
  from merged as m
  where p_type in ('event', 'post', 'product')
    and not exists (
      select 1 from live as n
      where n.locale = m.locale and n.slug = m.slug and n.category is not distinct from m.category
    )
$$;

/** The events/event_options projection of one event entry (submit-request prices from it). */
create function private.project_event(p_key text)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_entry public.content_entries;
  v_doc jsonb;
begin
  select * into v_entry from public.content_entries as e where e.type = 'event' and e.key = p_key;
  if not found then
    return;
  end if;

  if v_entry.published is null then
    -- Unpublished: an existing event row closes; nothing is created for a never-published draft.
    update public.events as ev set status = 'draft' where ev.id = p_key;
    return;
  end if;

  v_doc := v_entry.published;

  insert into public.events (id, category, title, price_display, health_form, status)
  values (
    p_key,
    v_doc ->> 'category',
    (select jsonb_object_agg(t.key, t.value) from jsonb_each(v_doc -> 'title') as t where t.key in ('tr', 'en', 'fr', 'de')),
    v_doc ->> 'priceDisplay',
    v_doc ->> 'healthForm',
    v_entry.status::text
  )
  on conflict (id) do update set
    category = excluded.category,
    title = excluded.title,
    price_display = excluded.price_display,
    health_form = excluded.health_form,
    status = excluded.status;

  delete from public.event_options as o where o.event_id = p_key;

  insert into public.event_options (event_id, id, name, price, currency, basis, sort)
  select
    p_key,
    opt ->> 'id',
    (select jsonb_object_agg(t.key, t.value) from jsonb_each(opt -> 'name') as t where t.key in ('tr', 'en', 'fr', 'de')),
    case when jsonb_typeof(opt -> 'price') = 'number' then (opt ->> 'price')::numeric end,
    opt ->> 'currency',
    opt ->> 'basis',
    (ord - 1)::integer
  from jsonb_array_elements(coalesce(v_doc -> 'options', '[]'::jsonb)) with ordinality as x(opt, ord);
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- Deploy queue
-- ---------------------------------------------------------------------------------------------

/**
 * Coalesces deploy requests: the queued row moves to now() + debounce, but never past
 * first_requested_at + max wait; without a queued row a new one starts at now() + debounce.
 * Returns the queued row's not_before.
 */
create function private.queue_site_deploy(p_release bigint)
returns timestamptz
language plpgsql
set search_path = ''
as $$
declare
  v_debounce interval := make_interval(secs => private.setting_seconds('deploy_debounce_seconds', 60));
  v_max_wait interval := make_interval(secs => private.setting_seconds('deploy_max_wait_seconds', 300));
  v_not_before timestamptz;
begin
  perform pg_advisory_xact_lock(hashtext('public.site_deploys:queue'));

  update public.site_deploys as d
     set release_id = coalesce(p_release, d.release_id),
         not_before = least(d.first_requested_at + v_max_wait, now() + v_debounce)
   where d.status = 'queued'
  returning d.not_before into v_not_before;

  if not found then
    insert into public.site_deploys (status, release_id, first_requested_at, not_before)
    values ('queued', p_release, now(), now() + v_debounce)
    returning not_before into v_not_before;
  end if;

  return v_not_before;
end;
$$;

/**
 * "Siteyi şimdi yeniden kur" (site.deploy): queues a deploy that is due at once (the min gap
 * after the last trigger still applies). Returns the queued row's id.
 */
create function public.request_site_deploy()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_release bigint;
  v_id bigint;
begin
  if not private.can('site.deploy') then
    raise exception 'site.deploy required' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtext('public.site_deploys:queue'));
  select max(r.id) into v_release from public.content_releases as r;

  update public.site_deploys as d
     set not_before = now(), release_id = coalesce(v_release, d.release_id)
   where d.status = 'queued'
  returning d.id into v_id;

  if not found then
    insert into public.site_deploys (status, release_id, first_requested_at, not_before)
    values ('queued', v_release, now(), now())
    returning id into v_id;
  end if;

  return v_id;
end;
$$;

/**
 * Runs every minute (pg_cron job dragoman-site-deploy):
 *   1. a sending row older than 5 minutes goes back to queued (or fails when a queued row exists);
 *   2. nothing is sent while a row is sending or inside the min gap after the last trigger;
 *   3. the due queued row becomes sending (attempts + 1) and pg_net posts {deployId, releaseId}
 *      to Vault site_deploy_url with header x-dispatch-secret = Vault deploy_dispatch_secret.
 * Without both Vault secrets (the local default) the row is marked skipped / not_configured.
 * Returns the id of the row it handled, or null.
 */
create function private.dispatch_site_deploy()
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  v_min_gap interval := make_interval(secs => private.setting_seconds('deploy_min_gap_seconds', 180));
  v_row public.site_deploys;
  v_url text;
  v_secret text;
begin
  perform pg_advisory_xact_lock(hashtext('public.site_deploys:queue'));

  if exists (select 1 from public.site_deploys as d where d.status = 'queued') then
    update public.site_deploys as d
       set status = 'failed', last_error = 'stale_sending'
     where d.status = 'sending' and d.sending_at < now() - interval '5 minutes';
  else
    update public.site_deploys as d
       set status = 'queued', sending_at = null, not_before = now(), last_error = 'stale_sending'
     where d.status = 'sending' and d.sending_at < now() - interval '5 minutes';
  end if;

  if exists (select 1 from public.site_deploys as d where d.status = 'sending')
     or exists (select 1 from public.site_deploys as d where d.triggered_at > now() - v_min_gap) then
    return null;
  end if;

  select * into v_row
  from public.site_deploys as d
  where d.status = 'queued' and d.not_before <= now()
  order by d.not_before
  limit 1
  for update skip locked;

  if not found then
    return null;
  end if;

  if to_regclass('vault.decrypted_secrets') is not null then
    execute $q$ select max(decrypted_secret) filter (where name = 'site_deploy_url'),
                       max(decrypted_secret) filter (where name = 'deploy_dispatch_secret')
                from vault.decrypted_secrets
                where name in ('site_deploy_url', 'deploy_dispatch_secret') $q$
      into v_url, v_secret;
  end if;

  if coalesce(v_url, '') = '' or coalesce(v_secret, '') = '' then
    update public.site_deploys as d
       set status = 'skipped', last_error = 'not_configured'
     where d.id = v_row.id;
    return v_row.id;
  end if;

  update public.site_deploys as d
     set status = 'sending', sending_at = now(), attempts = d.attempts + 1
   where d.id = v_row.id;

  perform net.http_post(
    url := v_url,
    body := jsonb_build_object('deployId', v_row.id, 'releaseId', v_row.release_id),
    headers := jsonb_build_object('content-type', 'application/json', 'x-dispatch-secret', v_secret),
    timeout_milliseconds := 15000
  );

  return v_row.id;
end;
$$;

-- ---------------------------------------------------------------------------------------------
-- apply_content_release
-- ---------------------------------------------------------------------------------------------

/**
 * Applies one validated publish under the release lock and records the release.
 * p_changes is an array of:
 *   {"op":"publish", "entryId":uuid, "draftRevision":int}
 *   {"op":"archive"|"unpublish", "entryId":uuid}
 *   {"op":"reorder", "type":content_type, "keys":[key, ...]}   order = position (1-based), both copies
 *   {"op":"publish_form", "kind":request_kind, "draftRevision":int}
 * p_snapshot.releaseId must be p_base_release + 1, the id this release gets.
 */
create function private.apply_content_release(
  p_staff uuid,
  p_base_release bigint,
  p_changes jsonb,
  p_snapshot jsonb,
  p_snapshot_sha256 text,
  p_action text,
  p_note text
)
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  v_latest bigint;
  v_release bigint;
  v_change jsonb;
  v_op text;
  v_entry public.content_entries;
  v_entry_id uuid;
  v_entry_ids uuid[] := '{}';
  v_events text[] := '{}';
  v_published jsonb;
  v_type public.content_type;
  v_key text;
  v_position integer;
  v_kind public.request_kind;
  v_form public.form_definitions;
  v_version integer;
begin
  if p_action is null or p_action not in ('publish', 'archive', 'unpublish', 'reorder', 'publish_form') then
    raise exception 'bad_request:action' using errcode = '22023';
  end if;
  if p_changes is null or jsonb_typeof(p_changes) <> 'array' or jsonb_array_length(p_changes) = 0 then
    raise exception 'bad_request:changes' using errcode = '22023';
  end if;
  if p_snapshot is null or jsonb_typeof(p_snapshot) <> 'object' then
    raise exception 'bad_request:snapshot' using errcode = '22023';
  end if;
  if p_snapshot_sha256 is null or p_snapshot_sha256 !~ '^[0-9a-f]{64}$' then
    raise exception 'bad_request:snapshot_sha256' using errcode = '22023';
  end if;
  if p_note is not null and char_length(p_note) > 200 then
    raise exception 'bad_request:note' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtext('public.content_releases'));

  select coalesce(max(r.id), 0) into v_latest from public.content_releases as r;
  if p_base_release is distinct from v_latest then
    raise exception 'conflict' using errcode = '40001';
  end if;
  v_release := v_latest + 1;
  if (p_snapshot ->> 'releaseId') is distinct from v_release::text then
    raise exception 'bad_request:snapshot.releaseId' using errcode = '22023';
  end if;

  for v_change in select value from jsonb_array_elements(p_changes) loop
    v_op := v_change ->> 'op';

    if v_op in ('publish', 'archive', 'unpublish') then
      begin
        v_entry_id := (v_change ->> 'entryId')::uuid;
      exception when invalid_text_representation then
        raise exception 'bad_request:entryId' using errcode = '22023';
      end;

      select * into v_entry from public.content_entries as e where e.id = v_entry_id for update;
      if not found then
        raise exception 'not_found:%', coalesce(v_entry_id::text, '') using errcode = 'P0002';
      end if;

      if v_op = 'publish' then
        if (v_change ->> 'draftRevision') is distinct from v_entry.draft_revision::text then
          raise exception 'stale_draft:%', v_entry.id using errcode = '40001';
        end if;

        v_published := v_entry.draft;
        if v_entry.type in ('event', 'post', 'product') and v_published ? 'status' then
          v_published := jsonb_set(v_published, '{status}', '"published"');
        end if;

        update public.content_entries as e
           set published = v_published,
               published_revision = e.draft_revision,
               status = 'published',
               slug_history = private.next_slug_history(e.type, e.slug_history, e.published, v_published),
               published_at = now(),
               published_by = p_staff
         where e.id = v_entry.id;
      elsif v_entry.published is null then
        raise exception 'bad_request:not_published:%', v_entry.id using errcode = '22023';
      elsif v_op = 'archive' then
        update public.content_entries as e
           set status = 'archived',
               published = case when e.published ? 'status' then jsonb_set(e.published, '{status}', '"archived"') else e.published end,
               published_at = now(),
               published_by = p_staff
         where e.id = v_entry.id;
      else
        update public.content_entries as e
           set status = 'draft', published = null, published_revision = null,
               published_at = now(), published_by = p_staff
         where e.id = v_entry.id;
      end if;

      v_entry_ids := v_entry_ids || v_entry.id;
      if v_entry.type = 'event' then
        v_events := v_events || v_entry.key;
      end if;

    elsif v_op = 'reorder' then
      begin
        v_type := (v_change ->> 'type')::public.content_type;
      exception when invalid_text_representation then
        raise exception 'bad_request:type' using errcode = '22023';
      end;
      if v_type is null or v_type not in ('event', 'subgroup', 'product', 'team_member', 'service_offer') then
        raise exception 'bad_request:type' using errcode = '22023';
      end if;
      if jsonb_typeof(v_change -> 'keys') <> 'array' or jsonb_array_length(v_change -> 'keys') = 0 then
        raise exception 'bad_request:keys' using errcode = '22023';
      end if;

      for v_key, v_position in
        select k.value, k.ord::integer from jsonb_array_elements_text(v_change -> 'keys') with ordinality as k(value, ord)
      loop
        update public.content_entries as e
           set draft = jsonb_set(e.draft, '{order}', to_jsonb(v_position)),
               published = case when e.published is null then null else jsonb_set(e.published, '{order}', to_jsonb(v_position)) end,
               -- The draft bump below is the reorder itself, not an unpublished change.
               published_revision = case when e.published_revision = e.draft_revision then e.draft_revision + 1 else e.published_revision end,
               updated_by = p_staff
         where e.type = v_type and e.key = v_key
        returning e.id into v_entry_id;

        if not found then
          raise exception 'not_found:%/%', v_type, v_key using errcode = 'P0002';
        end if;
        v_entry_ids := v_entry_ids || v_entry_id;
      end loop;

    elsif v_op = 'publish_form' then
      begin
        v_kind := (v_change ->> 'kind')::public.request_kind;
      exception when invalid_text_representation then
        raise exception 'bad_request:kind' using errcode = '22023';
      end;

      select * into v_form from public.form_definitions as f where f.kind = v_kind for update;
      if not found then
        raise exception 'not_found:%', coalesce(v_kind::text, '') using errcode = 'P0002';
      end if;
      if (v_change ->> 'draftRevision') is distinct from v_form.draft_revision::text then
        raise exception 'stale_draft:%', v_kind using errcode = '40001';
      end if;

      select coalesce(max(v.version), 0) + 1 into v_version from public.form_versions as v where v.kind = v_kind;
      insert into public.form_versions (kind, version, definition, published_by)
      values (v_kind, v_version, v_form.draft, p_staff);
      update public.form_definitions as f set published_version = v_version where f.kind = v_kind;

    else
      raise exception 'bad_request:op' using errcode = '22023';
    end if;
  end loop;

  -- Projection: affected events (never deleted; archived or unpublished ones refuse requests).
  perform private.project_event(k) from (select distinct unnest(v_events) as k) as x;

  insert into public.content_releases (id, created_by, action, entry_ids, note, snapshot, snapshot_sha256)
  values (
    v_release, p_staff, p_action,
    (select coalesce(array_agg(distinct i), '{}') from unnest(v_entry_ids) as i),
    p_note, p_snapshot, p_snapshot_sha256
  );

  update public.content_releases as r set snapshot = null
   where r.id <= v_release - 20 and r.snapshot is not null;

  perform private.queue_site_deploy(v_release);
  return v_release;
end;
$$;

/**
 * The same function for PostgREST: Edge Functions reach only exposed schemas, so publish-content
 * calls rpc('apply_content_release', ...). service_role only.
 */
create function public.apply_content_release(
  p_staff uuid,
  p_base_release bigint,
  p_changes jsonb,
  p_snapshot jsonb,
  p_snapshot_sha256 text,
  p_action text,
  p_note text default null
)
returns bigint
language sql
set search_path = ''
as $$
  select private.apply_content_release(p_staff, p_base_release, p_changes, p_snapshot, p_snapshot_sha256, p_action, p_note)
$$;

revoke all on function private.next_slug_history(public.content_type, jsonb, jsonb, jsonb) from public, anon, authenticated;
revoke all on function private.project_event(text) from public, anon, authenticated;
revoke all on function private.queue_site_deploy(bigint) from public, anon, authenticated;
revoke all on function private.dispatch_site_deploy() from public, anon, authenticated;
revoke all on function private.apply_content_release(uuid, bigint, jsonb, jsonb, text, text, text) from public, anon, authenticated;
revoke all on function public.apply_content_release(uuid, bigint, jsonb, jsonb, text, text, text) from public, anon, authenticated;
revoke all on function public.request_site_deploy() from public, anon;

grant execute on function private.next_slug_history(public.content_type, jsonb, jsonb, jsonb) to service_role;
grant execute on function private.project_event(text) to service_role;
grant execute on function private.queue_site_deploy(bigint) to service_role;
grant execute on function private.apply_content_release(uuid, bigint, jsonb, jsonb, text, text, text) to service_role;
grant execute on function public.apply_content_release(uuid, bigint, jsonb, jsonb, text, text, text) to service_role;
grant execute on function public.request_site_deploy() to authenticated;

-- ---------------------------------------------------------------------------------------------
-- pg_cron: the dispatcher, every minute
-- ---------------------------------------------------------------------------------------------

select cron.schedule('dragoman-site-deploy', '* * * * *', 'select private.dispatch_site_deploy()');
