-- Revision requests (panel /revizyonlar): the team writes down what should change on the site or in
-- the panel, follows it through Açık / Devam Ediyor / Tamamlandı, comments and adds screenshots.
--
-- Access is the new permission revisions.use: main_admin has it through the role, anyone else only
-- through extra_permissions. Everyone with it sees every request and its whole thread, not only their
-- own. Only main_admin sets in_progress or done; anyone with revisions.use reopens a done request,
-- which keeps the same record and thread. A comment is edited by its author only; nothing is deleted.
--
--   table                      authenticated (always with revisions.use)              stamped from the session
--   revision_requests          select; insert (description, urgency)                   requester_id
--   revision_comments          select; insert (request_id, body); update own body      author_id, edited_at
--   revision_status_changes    select (rows come from set_revision_status)             changed_by
--   revision_attachments       select; insert (request_id, comment_id, object_path)    uploaded_by
--   revision_notifications     nothing (the revision-notify Edge Function, service_role)
--
-- Screenshots live in the private revision-screenshots bucket at <request id>/<uuid>.<png|jpg|webp>;
-- the bucket itself refuses other types and files over 5 MiB.

-- ---------------------------------------------------------------------------------------------
-- The permission
-- ---------------------------------------------------------------------------------------------

alter table public.staff_members drop constraint staff_members_known_permissions;
alter table public.staff_members add constraint staff_members_known_permissions check (
  extra_permissions <@ array[
    'requests.read', 'requests.work', 'requests.reassign', 'staff.manage', 'settings.manage',
    'content.edit', 'content.translate', 'content.publish', 'forms.manage', 'site.deploy',
    'revisions.use'
  ]::text[]
);

/**
 * The role matrix plus per-person extras. Pure, so it can judge any staff row (for example a
 * hand-over target or a notification recipient), not only the caller.
 */
create or replace function private.role_can(p_role public.staff_role, p_extra text[], p_permission text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select coalesce(
    p_permission = any (coalesce(p_extra, '{}'::text[]))
    or case p_role
      when 'main_admin' then p_permission in (
        'requests.read', 'requests.work', 'requests.reassign', 'staff.manage', 'settings.manage',
        'content.edit', 'content.translate', 'content.publish', 'forms.manage', 'site.deploy',
        'revisions.use'
      )
      when 'reservations' then p_permission in ('requests.read', 'requests.work')
      when 'accounting' then p_permission = 'requests.read'
      when 'content' then p_permission in ('content.edit', 'content.translate')
      else false
    end,
    false
  )
$$;

revoke all on function private.role_can(public.staff_role, text[], text) from public, anon, authenticated;
-- public.revision_recipients() runs as service_role and asks the same matrix.
grant execute on function private.role_can(public.staff_role, text[], text) to service_role;

/** The caller's permissions, sorted; empty without an active staff row or a signed-in session. */
create or replace function public.my_permissions()
returns text[]
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (
      select array_agg(p.permission order by p.permission)
      from public.staff_members as s
      cross join unnest(array[
        'requests.read', 'requests.work', 'requests.reassign', 'staff.manage', 'settings.manage',
        'content.edit', 'content.translate', 'content.publish', 'forms.manage', 'site.deploy',
        'revisions.use'
      ]::text[]) as p(permission)
      where s.id = private.current_staff_id()
        and private.has_aal2()
        and private.role_can(s.role, s.extra_permissions, p.permission)
    ),
    '{}'::text[]
  )
$$;

revoke all on function public.my_permissions() from public, anon;
grant execute on function public.my_permissions() to authenticated;

-- ---------------------------------------------------------------------------------------------
-- revision_requests
-- ---------------------------------------------------------------------------------------------

create table public.revision_requests (
  id uuid primary key default gen_random_uuid(),
  -- "#12" in the list, the detail and the mails.
  number integer generated always as identity unique,
  requester_id uuid not null references public.staff_members (id),
  description text not null
    constraint revision_requests_description_size check (btrim(description) <> '' and length(description) <= 10000),
  urgency smallint not null
    constraint revision_requests_urgency_range check (urgency between 1 and 10),
  status text not null default 'open'
    constraint revision_requests_status_known check (status in ('open', 'in_progress', 'done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint revision_requests_completed_when_done check ((status = 'done') = (completed_at is not null))
);

comment on table public.revision_requests is
  'Revision requests from the panel (/revizyonlar); status changes go through set_revision_status().';

create index revision_requests_status_urgency_idx on public.revision_requests (status, urgency desc, created_at desc);
create index revision_requests_requester_id_idx on public.revision_requests (requester_id);

/**
 * The requester is the signed-in staff member, never a value the client sends (service_role may
 * name one). completed_at follows the status: set when it becomes done, cleared when it leaves done.
 */
create function private.stamp_revision_request()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.requester_id := coalesce(private.current_staff_id(), new.requester_id);
    new.completed_at := case when new.status = 'done' then now() end;
  elsif new.status is distinct from old.status then
    new.completed_at := case when new.status = 'done' then now() end;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.stamp_revision_request() from public, anon, authenticated;

create trigger revision_requests_stamp
  before insert or update on public.revision_requests
  for each row execute function private.stamp_revision_request();

-- ---------------------------------------------------------------------------------------------
-- revision_comments
-- ---------------------------------------------------------------------------------------------

create table public.revision_comments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.revision_requests (id) on delete cascade,
  author_id uuid not null references public.staff_members (id),
  body text not null
    constraint revision_comments_body_size check (btrim(body) <> '' and length(body) <= 10000),
  -- clock_timestamp, not now(): the thread is ordered by it, also within one transaction.
  created_at timestamptz not null default clock_timestamp(),
  -- Set when the author changes the text.
  edited_at timestamptz,
  -- Lets an attachment name its comment and request together (revision_attachments).
  constraint revision_comments_id_request_id_key unique (id, request_id)
);

create index revision_comments_request_id_created_at_idx on public.revision_comments (request_id, created_at);

/** The author is the signed-in staff member; an edit of the text is stamped. */
create function private.stamp_revision_comment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.author_id := coalesce(private.current_staff_id(), new.author_id);
    new.edited_at := null;
  elsif new.body is distinct from old.body then
    new.edited_at := now();
  end if;
  return new;
end;
$$;

revoke all on function private.stamp_revision_comment() from public, anon, authenticated;

create trigger revision_comments_stamp
  before insert or update on public.revision_comments
  for each row execute function private.stamp_revision_comment();

-- ---------------------------------------------------------------------------------------------
-- revision_status_changes: one row per change, written by set_revision_status()
-- ---------------------------------------------------------------------------------------------

create table public.revision_status_changes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.revision_requests (id) on delete cascade,
  from_status text not null
    constraint revision_status_changes_from_known check (from_status in ('open', 'in_progress', 'done')),
  to_status text not null
    constraint revision_status_changes_to_known check (to_status in ('open', 'in_progress', 'done')),
  changed_by uuid not null references public.staff_members (id),
  -- Ordered into the same thread as the comments (see revision_comments.created_at).
  created_at timestamptz not null default clock_timestamp(),
  constraint revision_status_changes_changes check (from_status <> to_status)
);

create index revision_status_changes_request_id_created_at_idx on public.revision_status_changes (request_id, created_at);

-- ---------------------------------------------------------------------------------------------
-- revision_attachments: one screenshot of a request or of one of its comments
-- ---------------------------------------------------------------------------------------------

create table public.revision_attachments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.revision_requests (id) on delete cascade,
  -- Null: the screenshot belongs to the request itself.
  comment_id uuid,
  object_path text not null unique
    constraint revision_attachments_object_path_format check (
      object_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(png|jpg|webp)$'
      and split_part(object_path, '/', 1) = request_id::text
    ),
  uploaded_by uuid not null references public.staff_members (id),
  created_at timestamptz not null default now(),
  -- The comment must be one of this request's comments.
  constraint revision_attachments_comment_fkey foreign key (comment_id, request_id)
    references public.revision_comments (id, request_id) on delete cascade
);

create index revision_attachments_request_id_idx on public.revision_attachments (request_id);
create index revision_attachments_comment_id_idx on public.revision_attachments (comment_id) where comment_id is not null;

/**
 * The uploader comes from the session; one request or comment carries at most 10 screenshots (the
 * lock makes two parallel inserts count one after the other). That the file is really in the bucket,
 * uploaded by the same person, is part of the insert policy below.
 */
create function private.stamp_revision_attachment()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.uploaded_by := coalesce(private.current_staff_id(), new.uploaded_by);

  perform pg_advisory_xact_lock(
    hashtextextended('revision_attachments:' || new.request_id::text || ':' || coalesce(new.comment_id::text, ''), 0)
  );
  if (
    select count(*)
    from public.revision_attachments as a
    where a.request_id = new.request_id and a.comment_id is not distinct from new.comment_id
  ) >= 10 then
    raise exception 'at most 10 screenshots per request or comment' using errcode = '54000';
  end if;
  return new;
end;
$$;

revoke all on function private.stamp_revision_attachment() from public, anon, authenticated;

create trigger revision_attachments_stamp
  before insert on public.revision_attachments
  for each row execute function private.stamp_revision_attachment();

-- ---------------------------------------------------------------------------------------------
-- revision_notifications: what the revision-notify function did for each recipient
-- ---------------------------------------------------------------------------------------------

create table public.revision_notifications (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.revision_requests (id) on delete cascade,
  event text not null
    constraint revision_notifications_event_known check (event in ('created', 'commented', 'done')),
  -- The row the mail is about: the request (created), the comment (commented), the status change (done).
  source_id uuid not null,
  actor_id uuid not null references public.staff_members (id),
  recipient_id uuid not null references public.staff_members (id),
  recipient text not null
    constraint revision_notifications_recipient_shape check (recipient like '_%@_%'),
  status text not null default 'pending'
    constraint revision_notifications_status_known check (status in ('pending', 'sent', 'failed', 'smtp_not_configured')),
  error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz,
  -- One mail per event and person, however often the panel asks.
  constraint revision_notifications_once unique (event, source_id, recipient_id)
);

create index revision_notifications_request_id_idx on public.revision_notifications (request_id);

-- ---------------------------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------------------------

/**
 * The only way a status changes. main_admin may set any status; everyone else with revisions.use
 * may only reopen a done request (done -> open). Returns the id of the new status-change row (the
 * "done" notification names it). Errors: 42501 not allowed, 22023 unknown status, P0002 no such
 * request, 55000 the request already has that status or is no longer done.
 */
create function public.set_revision_status(p_request uuid, p_status text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.current_staff_id();
  v_main_admin boolean;
  v_from text;
  v_change uuid;
begin
  if v_me is null or not private.can('revisions.use') then
    raise exception 'revisions.use required' using errcode = '42501';
  end if;
  if p_status is null or p_status not in ('open', 'in_progress', 'done') then
    raise exception 'unknown revision status' using errcode = '22023';
  end if;

  v_main_admin := exists (
    select 1 from public.staff_members as s where s.id = v_me and s.role = 'main_admin'
  );

  if not v_main_admin and p_status <> 'open' then
    raise exception 'only the main admin sets this status' using errcode = '42501';
  end if;

  select r.status into v_from
  from public.revision_requests as r
  where r.id = p_request
  for update;

  if not found then
    raise exception 'revision request not found' using errcode = 'P0002';
  end if;
  if v_from = p_status then
    raise exception 'the revision request already has this status' using errcode = '55000';
  end if;
  if not v_main_admin and v_from <> 'done' then
    raise exception 'only a done revision request can be reopened' using errcode = '55000';
  end if;

  update public.revision_requests as r set status = p_status where r.id = p_request;

  insert into public.revision_status_changes (request_id, from_status, to_status, changed_by)
  values (p_request, v_from, p_status, v_me)
  returning id into v_change;

  return v_change;
end;
$$;

revoke all on function public.set_revision_status(uuid, text) from public, anon;
grant execute on function public.set_revision_status(uuid, text) to authenticated;

/**
 * Who gets a revision mail: active staff with revisions.use (main_admin included), minus the person
 * who did the action. Addresses come from staff_members only; service_role (revision-notify) only.
 */
create function public.revision_recipients(p_exclude uuid)
returns table (staff_id uuid, email text, full_name text)
language sql
stable
set search_path = ''
as $$
  select s.id, s.email, s.full_name
  from public.staff_members as s
  where s.active
    and private.role_can(s.role, s.extra_permissions, 'revisions.use')
    and s.id is distinct from p_exclude
  order by s.full_name
$$;

revoke all on function public.revision_recipients(uuid) from public, anon, authenticated;
grant execute on function public.revision_recipients(uuid) to service_role;

-- ---------------------------------------------------------------------------------------------
-- RLS and grants (new tables are not exposed automatically; every grant is explicit)
-- ---------------------------------------------------------------------------------------------

alter table public.revision_requests enable row level security;
alter table public.revision_comments enable row level security;
alter table public.revision_status_changes enable row level security;
alter table public.revision_attachments enable row level security;
alter table public.revision_notifications enable row level security;

revoke all on table
  public.revision_requests, public.revision_comments, public.revision_status_changes,
  public.revision_attachments, public.revision_notifications
  from public, anon, authenticated;

grant all on table
  public.revision_requests, public.revision_comments, public.revision_status_changes,
  public.revision_attachments, public.revision_notifications
  to service_role;

-- The platform's default privileges hand identity sequences to anon and authenticated. Inserts do
-- not need them (identity columns skip the sequence privilege check), so take them back.
revoke all on sequence public.revision_requests_number_seq from public, anon, authenticated;

grant select on table
  public.revision_requests, public.revision_comments, public.revision_status_changes, public.revision_attachments
  to authenticated;
grant insert (description, urgency) on table public.revision_requests to authenticated;
grant insert (request_id, body) on table public.revision_comments to authenticated;
grant update (body) on table public.revision_comments to authenticated;
grant insert (request_id, comment_id, object_path) on table public.revision_attachments to authenticated;

create policy revision_requests_select_users on public.revision_requests
  for select to authenticated
  using ((select private.can('revisions.use')));

create policy revision_requests_insert_users on public.revision_requests
  for insert to authenticated
  with check ((select private.can('revisions.use')) and requester_id = (select private.current_staff_id()));

create policy revision_comments_select_users on public.revision_comments
  for select to authenticated
  using ((select private.can('revisions.use')));

create policy revision_comments_insert_users on public.revision_comments
  for insert to authenticated
  with check ((select private.can('revisions.use')) and author_id = (select private.current_staff_id()));

-- Someone else's comment matches no row, so an edit of it changes nothing.
create policy revision_comments_update_author on public.revision_comments
  for update to authenticated
  using ((select private.can('revisions.use')) and author_id = (select private.current_staff_id()))
  with check ((select private.can('revisions.use')) and author_id = (select private.current_staff_id()));

create policy revision_status_changes_select_users on public.revision_status_changes
  for select to authenticated
  using ((select private.can('revisions.use')));

create policy revision_attachments_select_users on public.revision_attachments
  for select to authenticated
  using ((select private.can('revisions.use')));

-- The requester adds screenshots to their request, a comment's author to their comment, and only
-- for a file they uploaded themselves to that path: a row never points at nothing, and nobody
-- claims someone else's upload.
create policy revision_attachments_insert_owner on public.revision_attachments
  for insert to authenticated
  with check (
    (select private.can('revisions.use'))
    and revision_attachments.uploaded_by = (select private.current_staff_id())
    and exists (
      select 1
      from storage.objects as o
      where o.bucket_id = 'revision-screenshots'
        and o.name = revision_attachments.object_path
        and o.owner_id = (select auth.uid())::text
    )
    and case
      when revision_attachments.comment_id is null then exists (
        select 1
        from public.revision_requests as r
        where r.id = revision_attachments.request_id
          and r.requester_id = (select private.current_staff_id())
      )
      else exists (
        select 1
        from public.revision_comments as c
        where c.id = revision_attachments.comment_id
          and c.request_id = revision_attachments.request_id
          and c.author_id = (select private.current_staff_id())
      )
    end
  );

-- revision_notifications has RLS on and no policies: only service_role reaches it.

-- ---------------------------------------------------------------------------------------------
-- Storage: revision-screenshots (private, 5 MiB, PNG / JPEG / WebP). Read with revisions.use.
-- Upload with revisions.use into the folder of a request one opened or commented on (the panel
-- uploads right after saving the request or the comment). No update or delete.
-- ---------------------------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('revision-screenshots', 'revision-screenshots', false, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy revision_screenshots_insert_users on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'revision-screenshots'
    and objects.name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(png|jpg|webp)$'
    and (select private.can('revisions.use'))
    and exists (
      select 1
      from public.revision_requests as r
      where r.id::text = split_part(objects.name, '/', 1)
        and (
          r.requester_id = (select private.current_staff_id())
          or exists (
            select 1
            from public.revision_comments as c
            where c.request_id = r.id and c.author_id = (select private.current_staff_id())
          )
        )
    )
  );

create policy revision_screenshots_select_users on storage.objects
  for select to authenticated
  using (
    bucket_id = 'revision-screenshots'
    and (select private.can('revisions.use'))
  );
