-- Dalga 2 content store: entries with a draft and a published copy, media, releases, the deploy
-- queue, editable forms, translation runs and the private bucket for uploaded masters.
--
-- Rules (dalga2-sozlesme §5): anon reaches nothing; staff read and write drafts through RLS with
-- content.edit; only service_role (publish-content -> apply_content_release) writes published
-- copies, status, slug history, releases and the projection into events. Every grant is explicit.

create type public.content_type as enum (
  'event', 'subgroup', 'category_page', 'service_offer', 'product', 'post', 'team_member', 'testimonial', 'rich_page', 'home'
);
create type public.content_status as enum ('draft', 'published', 'archived');
create type public.media_storage as enum ('repo', 'upload');
create type public.site_deploy_status as enum ('queued', 'sending', 'triggered', 'failed', 'skipped');

-- ---------------------------------------------------------------------------------------------
-- content_entries
-- ---------------------------------------------------------------------------------------------

create table public.content_entries (
  id uuid primary key default gen_random_uuid(),
  type public.content_type not null,
  -- The record id (event, post, ...) or page key (diving, about, home); never changes.
  key text not null
    constraint content_entries_key_format check (key ~ '^[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*$' and length(key) <= 100),
  draft jsonb not null
    constraint content_entries_draft_object check (jsonb_typeof(draft) = 'object')
    constraint content_entries_draft_size check (octet_length(draft::text) < 524288),
  draft_revision integer not null default 1,
  -- TranslationMeta (shared/content/translation.ts), keyed by JSON Pointer.
  translation_meta jsonb not null default '{}'::jsonb
    constraint content_entries_translation_meta_object check (jsonb_typeof(translation_meta) = 'object'),
  published jsonb
    constraint content_entries_published_object check (published is null or jsonb_typeof(published) = 'object'),
  -- draft_revision at the last publish; differs from draft_revision when the draft has unpublished changes.
  published_revision integer,
  status public.content_status not null default 'draft',
  -- Earlier public slugs: [{locale, slug, category?}] (category for events only).
  slug_history jsonb not null default '[]'::jsonb
    constraint content_entries_slug_history_array check (jsonb_typeof(slug_history) = 'array'),
  created_at timestamptz not null default now(),
  created_by uuid references public.staff_members (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff_members (id) on delete set null,
  published_at timestamptz,
  published_by uuid references public.staff_members (id) on delete set null,
  constraint content_entries_type_key_unique unique (type, key),
  -- The document's own id/key (when it has one) is the entry key.
  constraint content_entries_draft_key check (coalesce(draft ->> 'id', draft ->> 'key', key) = key),
  constraint content_entries_published_state check (
    (status = 'draft') or (published is not null and published_revision is not null)
  )
);

comment on table public.content_entries is
  'Site content. draft is edited in the panel; published, status and slug_history are written only by apply_content_release.';

/**
 * Stamps who and when, keeps type and key fixed, and bumps draft_revision whenever the draft or
 * its translation meta change (the panel saves with .eq(''draft_revision'', n)).
 */
create function private.stamp_content_entry()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_staff uuid := private.current_staff_id();
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := now();
    new.created_by := coalesce(v_staff, new.created_by);
    new.updated_by := coalesce(v_staff, new.updated_by);
    return new;
  end if;

  if new.type <> old.type or new.key <> old.key then
    raise exception 'content entry type and key never change' using errcode = '22023';
  end if;
  if new.draft is distinct from old.draft or new.translation_meta is distinct from old.translation_meta then
    new.draft_revision := old.draft_revision + 1;
    new.updated_at := now();
    new.updated_by := coalesce(v_staff, new.updated_by);
  end if;
  return new;
end;
$$;

revoke all on function private.stamp_content_entry() from public, anon, authenticated;

create trigger content_entries_stamp
  before insert or update on public.content_entries
  for each row execute function private.stamp_content_entry();

create index content_entries_status_idx on public.content_entries (type, status);

-- ---------------------------------------------------------------------------------------------
-- media_assets (no draft state: a change ships with the next release; no delete in Dalga 2)
-- ---------------------------------------------------------------------------------------------

create table public.media_assets (
  id text primary key
    constraint media_assets_id_slug check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(id) <= 100),
  storage public.media_storage not null default 'upload',
  -- upload: the master in media-originals, <id>/<sha256>.jpg.
  object_path text,
  sha256 text
    constraint media_assets_sha256_hex check (sha256 ~ '^[0-9a-f]{64}$'),
  -- repo: the file name in the image source folder and the derivative widths in public/media.
  source_file text,
  widths integer[],
  width integer not null
    constraint media_assets_width_positive check (width > 0),
  height integer not null
    constraint media_assets_height_positive check (height > 0),
  bytes integer
    constraint media_assets_bytes_positive check (bytes > 0),
  alt jsonb not null
    constraint media_assets_alt_localized check (jsonb_typeof(alt) = 'object' and coalesce(btrim(alt ->> 'tr'), '') <> ''),
  topic text not null
    constraint media_assets_topic_present check (btrim(topic) <> ''),
  rights text not null default 'unverified'
    constraint media_assets_rights_known check (rights in ('unverified', 'confirmed')),
  rights_confirmed_by uuid references public.staff_members (id) on delete set null,
  rights_confirmed_at timestamptz,
  placeholder boolean not null default false,
  translation_meta jsonb not null default '{}'::jsonb
    constraint media_assets_translation_meta_object check (jsonb_typeof(translation_meta) = 'object'),
  revision integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid references public.staff_members (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff_members (id) on delete set null,
  constraint media_assets_storage_shape check (
    case storage
      when 'upload' then object_path is not null and sha256 is not null
        and object_path = id || '/' || sha256 || '.jpg'
        and source_file is null and widths is null and not placeholder
      else object_path is null and sha256 is null
        and source_file is not null and coalesce(cardinality(widths), 0) > 0
    end
  )
);

/**
 * Stamps audit columns and the rights confirmation, bumps revision on every change, and keeps a
 * repo image's files and storage fixed (only alt, topic, rights and translations are editable).
 */
create function private.stamp_media_asset()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_staff uuid := private.current_staff_id();
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.created_by := coalesce(v_staff, new.created_by);
  else
    if new.id <> old.id or new.storage <> old.storage then
      raise exception 'media id and storage never change' using errcode = '22023';
    end if;
    if old.storage = 'repo' and (
      new.source_file is distinct from old.source_file or new.widths is distinct from old.widths
      or new.width <> old.width or new.height <> old.height or new.bytes is distinct from old.bytes
      or new.placeholder <> old.placeholder
    ) then
      raise exception 'repo media files cannot be changed' using errcode = '22023';
    end if;
    new.revision := old.revision + 1;
  end if;

  if tg_op = 'INSERT' or new.rights is distinct from old.rights then
    if new.rights = 'confirmed' then
      new.rights_confirmed_by := coalesce(v_staff, new.rights_confirmed_by);
      new.rights_confirmed_at := now();
    else
      new.rights_confirmed_by := null;
      new.rights_confirmed_at := null;
    end if;
  end if;

  new.updated_at := now();
  new.updated_by := coalesce(v_staff, new.updated_by);
  return new;
end;
$$;

revoke all on function private.stamp_media_asset() from public, anon, authenticated;

create trigger media_assets_stamp
  before insert or update on public.media_assets
  for each row execute function private.stamp_media_asset();

-- ---------------------------------------------------------------------------------------------
-- content_releases (immutable snapshots; the last 20 keep their snapshot)
-- ---------------------------------------------------------------------------------------------

create table public.content_releases (
  id bigint generated by default as identity primary key,
  created_at timestamptz not null default now(),
  created_by uuid references public.staff_members (id) on delete set null,
  action text not null
    constraint content_releases_action_known check (action in ('seed', 'publish', 'archive', 'unpublish', 'reorder', 'publish_form')),
  entry_ids uuid[] not null default '{}',
  note text
    constraint content_releases_note_length check (char_length(note) <= 200),
  snapshot jsonb,
  snapshot_sha256 text not null
    constraint content_releases_snapshot_sha256_hex check (snapshot_sha256 ~ '^[0-9a-f]{64}$')
);

-- ---------------------------------------------------------------------------------------------
-- site_deploys (the coalescing Coolify queue; at most one queued and one sending row)
-- ---------------------------------------------------------------------------------------------

create table public.site_deploys (
  id bigint generated always as identity primary key,
  status public.site_deploy_status not null default 'queued',
  release_id bigint references public.content_releases (id),
  first_requested_at timestamptz not null default now(),
  not_before timestamptz not null default now(),
  sending_at timestamptz,
  triggered_at timestamptz,
  attempts integer not null default 0
    constraint site_deploys_attempts_non_negative check (attempts >= 0),
  last_error text,
  coolify_deployment_uuid text,
  updated_at timestamptz not null default now()
);

create unique index site_deploys_one_queued_idx on public.site_deploys (status) where status = 'queued';
create unique index site_deploys_one_sending_idx on public.site_deploys (status) where status = 'sending';
create index site_deploys_triggered_at_idx on public.site_deploys (triggered_at desc) where triggered_at is not null;

create trigger site_deploys_touch_updated_at
  before update on public.site_deploys
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------------------------
-- Editable forms: a draft per kind, immutable published versions, the version on each request
-- ---------------------------------------------------------------------------------------------

create table public.form_versions (
  kind public.request_kind not null,
  version integer not null
    constraint form_versions_version_positive check (version > 0),
  definition jsonb not null
    constraint form_versions_definition_object check (jsonb_typeof(definition) = 'object'),
  published_at timestamptz not null default now(),
  published_by uuid references public.staff_members (id) on delete set null,
  primary key (kind, version)
);

/** Published form versions are immutable: each request keeps the version it was sent with. */
create function private.form_versions_immutable()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'published form versions are immutable' using errcode = '55000';
end;
$$;

revoke all on function private.form_versions_immutable() from public, anon, authenticated;

create trigger form_versions_immutable
  before update or delete on public.form_versions
  for each row execute function private.form_versions_immutable();

create table public.form_definitions (
  kind public.request_kind primary key,
  draft jsonb not null
    constraint form_definitions_draft_object check (jsonb_typeof(draft) = 'object')
    constraint form_definitions_draft_size check (octet_length(draft::text) < 131072),
  draft_revision integer not null default 1,
  translation_meta jsonb not null default '{}'::jsonb
    constraint form_definitions_translation_meta_object check (jsonb_typeof(translation_meta) = 'object'),
  published_version integer,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff_members (id) on delete set null,
  constraint form_definitions_published_version_fk
    foreign key (kind, published_version) references public.form_versions (kind, version)
);

/** Same optimistic-save rule as content entries. */
create function private.stamp_form_definition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.draft is distinct from old.draft or new.translation_meta is distinct from old.translation_meta then
    new.draft_revision := old.draft_revision + 1;
    new.updated_at := now();
    new.updated_by := coalesce(private.current_staff_id(), new.updated_by);
  end if;
  return new;
end;
$$;

revoke all on function private.stamp_form_definition() from public, anon, authenticated;

create trigger form_definitions_stamp
  before update on public.form_definitions
  for each row execute function private.stamp_form_definition();

alter table public.requests add column form_version integer;
alter table public.requests add constraint requests_form_version_fk
  foreign key (kind, form_version) references public.form_versions (kind, version);

-- ---------------------------------------------------------------------------------------------
-- translation_runs (written by translate-content)
-- ---------------------------------------------------------------------------------------------

create table public.translation_runs (
  id bigint generated always as identity primary key,
  target_kind text not null
    constraint translation_runs_target_kind_known check (target_kind in ('content', 'media', 'form')),
  target_id text not null
    constraint translation_runs_target_id_present check (btrim(target_id) <> ''),
  locales text[] not null
    constraint translation_runs_locales_known check (cardinality(locales) > 0 and locales <@ array['en', 'fr', 'de']::text[]),
  source_chars integer not null default 0
    constraint translation_runs_source_chars_non_negative check (source_chars >= 0),
  status text not null
    constraint translation_runs_status_known check (status in ('ok', 'failed')),
  error_code text,
  deepl_trace_id text,
  created_at timestamptz not null default now(),
  created_by uuid references public.staff_members (id) on delete set null
);

create index translation_runs_target_idx on public.translation_runs (target_kind, target_id, created_at desc);

-- ---------------------------------------------------------------------------------------------
-- app_settings: the Dalga 2 keys (absent rows mean the defaults in the functions)
-- ---------------------------------------------------------------------------------------------

alter table public.app_settings
  add constraint app_settings_deploy_debounce_range check (
    case
      when key <> 'deploy_debounce_seconds' then true
      when jsonb_typeof(value) <> 'number' then false
      else (value::text)::numeric between 30 and 900 and (value::text)::numeric % 1 = 0
    end
  ),
  add constraint app_settings_deploy_max_wait_range check (
    case
      when key <> 'deploy_max_wait_seconds' then true
      when jsonb_typeof(value) <> 'number' then false
      else (value::text)::numeric between 60 and 3600 and (value::text)::numeric % 1 = 0
    end
  ),
  add constraint app_settings_deploy_min_gap_range check (
    case
      when key <> 'deploy_min_gap_seconds' then true
      when jsonb_typeof(value) <> 'number' then false
      else (value::text)::numeric between 0 and 3600 and (value::text)::numeric % 1 = 0
    end
  ),
  -- coalesce: a missing member makes jsonb_typeof null, which a CHECK would let through.
  add constraint app_settings_deepl_usage_shape check (
    key <> 'deepl_usage' or coalesce(
      jsonb_typeof(value) = 'object'
      and jsonb_typeof(value -> 'count') = 'number'
      and jsonb_typeof(value -> 'limit') = 'number'
      and jsonb_typeof(value -> 'checkedAt') = 'string',
      false
    )
  ),
  add constraint app_settings_deepl_glossary_shape check (
    key <> 'deepl_glossary' or coalesce(
      jsonb_typeof(value) = 'object'
      and jsonb_typeof(value -> 'id') = 'string'
      and jsonb_typeof(value -> 'hash') = 'string',
      false
    )
  );

/** A Dalga 2 integer setting, or its default when the row is absent. */
create function private.setting_seconds(p_key text, p_default integer)
returns integer
language sql
stable
set search_path = ''
as $$
  select coalesce((select (s.value::text)::integer from public.app_settings as s where s.key = p_key), p_default)
$$;

revoke all on function private.setting_seconds(text, integer) from public, anon, authenticated;
grant execute on function private.setting_seconds(text, integer) to service_role;

-- ---------------------------------------------------------------------------------------------
-- content_entry_list (the panel's list page)
-- ---------------------------------------------------------------------------------------------

create view public.content_entry_list
with (security_invoker = true)
as
select
  e.id,
  e.type,
  e.key,
  e.status,
  coalesce(
    e.draft #>> '{title,tr}',
    e.draft ->> 'name',
    e.draft ->> 'author',
    e.draft #>> '{hero,heading,tr}',
    e.key
  ) as title_tr,
  (e.published is not null and e.draft_revision is distinct from e.published_revision) as has_changes,
  e.updated_at,
  s.full_name as updated_by_name
from public.content_entries as e
left join public.staff_members as s on s.id = e.updated_by;

-- ---------------------------------------------------------------------------------------------
-- RLS and grants
-- ---------------------------------------------------------------------------------------------

alter table public.content_entries enable row level security;
alter table public.media_assets enable row level security;
alter table public.content_releases enable row level security;
alter table public.site_deploys enable row level security;
alter table public.form_versions enable row level security;
alter table public.form_definitions enable row level security;
alter table public.translation_runs enable row level security;

revoke all on table
  public.content_entries, public.media_assets, public.content_releases, public.site_deploys,
  public.form_versions, public.form_definitions, public.translation_runs, public.content_entry_list
  from public, anon, authenticated;

grant all on table
  public.content_entries, public.media_assets, public.content_releases, public.site_deploys,
  public.form_versions, public.form_definitions, public.translation_runs, public.content_entry_list
  to service_role;

revoke all on sequence
  public.content_releases_id_seq, public.site_deploys_id_seq, public.translation_runs_id_seq
  from public, anon, authenticated;

-- content_entries: drafts only. published, status, slug_history and published_* have no write grant.
grant select on table public.content_entries to authenticated;
grant insert (type, key, draft, translation_meta) on table public.content_entries to authenticated;
grant update (draft, translation_meta) on table public.content_entries to authenticated;
grant delete on table public.content_entries to authenticated;
grant select on table public.content_entry_list to authenticated;

create policy content_entries_select_content on public.content_entries
  for select to authenticated
  using ((select private.can('content.edit')) or (select private.can('content.publish')));

create policy content_entries_insert_editor on public.content_entries
  for insert to authenticated
  with check ((select private.can('content.edit')));

create policy content_entries_update_editor on public.content_entries
  for update to authenticated
  using ((select private.can('content.edit')))
  with check ((select private.can('content.edit')));

-- Only an entry that never reached the site can be deleted; the rest is archived or unpublished.
create policy content_entries_delete_unpublished on public.content_entries
  for delete to authenticated
  using ((select private.can('content.edit')) and published is null and status = 'draft');

-- media_assets: uploads only (repo rows come from the seed); no delete.
grant select on table public.media_assets to authenticated;
grant insert (id, storage, object_path, sha256, width, height, bytes, alt, topic, rights, translation_meta)
  on table public.media_assets to authenticated;
grant update (object_path, sha256, width, height, bytes, alt, topic, rights, translation_meta)
  on table public.media_assets to authenticated;

create policy media_assets_select_content on public.media_assets
  for select to authenticated
  using ((select private.can('content.edit')) or (select private.can('content.publish')));

create policy media_assets_insert_editor on public.media_assets
  for insert to authenticated
  with check ((select private.can('content.edit')) and storage = 'upload');

-- Repo rows stay editable for alt, topic, rights and translations; the trigger keeps their files fixed.
create policy media_assets_update_editor on public.media_assets
  for update to authenticated
  using ((select private.can('content.edit')))
  with check ((select private.can('content.edit')));

-- content_releases: every column but the snapshot (publish-content and content-release read it as service_role).
grant select (id, created_at, created_by, action, entry_ids, note, snapshot_sha256)
  on table public.content_releases to authenticated;

create policy content_releases_select_content on public.content_releases
  for select to authenticated
  using ((select private.can('content.edit')) or (select private.can('content.publish')));

grant select on table public.site_deploys to authenticated;

create policy site_deploys_select_content on public.site_deploys
  for select to authenticated
  using (
    (select private.can('content.edit')) or (select private.can('content.publish')) or (select private.can('site.deploy'))
  );

grant select on table public.translation_runs to authenticated;

create policy translation_runs_select_translators on public.translation_runs
  for select to authenticated
  using ((select private.can('content.translate')));

grant select on table public.form_definitions to authenticated;
grant update (draft, translation_meta) on table public.form_definitions to authenticated;

create policy form_definitions_select_managers on public.form_definitions
  for select to authenticated
  using ((select private.can('forms.manage')));

create policy form_definitions_update_managers on public.form_definitions
  for update to authenticated
  using ((select private.can('forms.manage')))
  with check ((select private.can('forms.manage')));

grant select on table public.form_versions to authenticated;

create policy form_versions_select_readers on public.form_versions
  for select to authenticated
  using ((select private.can('requests.read')) or (select private.can('forms.manage')));

-- ---------------------------------------------------------------------------------------------
-- Storage: media-originals (private, 10 MiB, JPEG only). Insert and read with content.edit and
-- the <id>/<sha256>.jpg path; no update or delete (a new master gets a new sha, so a new path).
-- ---------------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media-originals', 'media-originals', false, 10485760, array['image/jpeg'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy media_originals_insert_editor on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'media-originals'
    and name ~ '^[a-z0-9]+(-[a-z0-9]+)*/[0-9a-f]{64}\.jpg$'
    and (select private.can('content.edit'))
  );

create policy media_originals_select_editor on storage.objects
  for select to authenticated
  using (
    bucket_id = 'media-originals'
    and name ~ '^[a-z0-9]+(-[a-z0-9]+)*/[0-9a-f]{64}\.jpg$'
    and (select private.can('content.edit'))
  );
