-- Visitor requests, their activity log, the e-mail outbox, submission throttling and settings.
--
-- Only the submit-request Edge Function (service_role) writes requests, the outbox and the
-- throttle (through throttle_submission). Staff read requests and their activity with requests.read and change them only
-- through the RPCs in the request_workflow migration; no client ever updates a request directly.

-- ---------------------------------------------------------------------------------------------
-- Reference numbers: DRG-000123
-- ---------------------------------------------------------------------------------------------

create sequence public.request_reference_seq as bigint;
revoke all on sequence public.request_reference_seq from public, anon, authenticated;
grant usage on sequence public.request_reference_seq to service_role;

/** At least six digits, never truncated: 123 -> DRG-000123, 1234567 -> DRG-1234567. */
create function private.format_request_reference(p_number bigint)
returns text
language sql
immutable
strict
set search_path = ''
as $$
  select 'DRG-' || lpad(p_number::text, greatest(6, length(p_number::text)), '0')
$$;

-- The column default runs with the inserting role's rights, so the function needs a grant.
revoke all on function private.format_request_reference(bigint) from public, anon, authenticated;
grant execute on function private.format_request_reference(bigint) to service_role;

-- ---------------------------------------------------------------------------------------------
-- requests
-- ---------------------------------------------------------------------------------------------

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique
    default private.format_request_reference(nextval('public.request_reference_seq'))
    constraint requests_reference_format check (reference ~ '^DRG-[0-9]{6,}$'),
  kind public.request_kind not null,
  status public.request_status not null default 'pending',
  locale public.site_locale not null,
  full_name text not null
    constraint requests_full_name_present check (btrim(full_name) <> ''),
  email text not null
    constraint requests_email_shape check (email like '_%@_%'),
  phone text,
  -- The validated kind-specific form values.
  payload jsonb not null
    constraint requests_payload_object check (jsonb_typeof(payload) = 'object'),
  event_id text references public.events (id),
  -- The event as the visitor saw it (title in their locale, chosen options with price), so later
  -- content edits never change what was asked for.
  event_snapshot jsonb,
  price_summary jsonb,
  idempotency_key uuid not null unique,
  assignee_id uuid references public.staff_members (id),
  claimed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint requests_event_kind_has_event check (kind <> 'event' or event_id is not null),
  constraint requests_assignment_matches_status check (
    (status = 'pending' and assignee_id is null and claimed_at is null)
    or (status = 'in_progress' and assignee_id is not null and claimed_at is not null)
  )
);

create index requests_status_created_at_idx on public.requests (status, created_at desc);
create index requests_assignee_id_idx on public.requests (assignee_id) where assignee_id is not null;
create index requests_event_id_idx on public.requests (event_id) where event_id is not null;

create trigger requests_touch_updated_at
  before update on public.requests
  for each row execute function private.touch_updated_at();

-- ---------------------------------------------------------------------------------------------
-- request_activity
-- ---------------------------------------------------------------------------------------------

create table public.request_activity (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.requests (id) on delete cascade,
  actor_id uuid references public.staff_members (id),
  action text not null
    constraint request_activity_action_known check (action in ('created', 'claimed', 'reassigned', 'handed_over')),
  from_staff uuid references public.staff_members (id),
  to_staff uuid references public.staff_members (id),
  created_at timestamptz not null default now()
);

create index request_activity_request_id_created_at_idx on public.request_activity (request_id, created_at);

/** Every request starts its history with "created", whoever inserted it. */
create function private.log_request_created()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  insert into public.request_activity (request_id, action) values (new.id, 'created');
  return null;
end;
$$;

revoke all on function private.log_request_created() from public, anon, authenticated;

create trigger requests_log_created
  after insert on public.requests
  for each row execute function private.log_request_created();

-- ---------------------------------------------------------------------------------------------
-- notifications (outbox): a failed e-mail stays here as 'failed', the request is never lost
-- ---------------------------------------------------------------------------------------------

create table public.notifications (
  id bigint generated always as identity primary key,
  request_id uuid references public.requests (id) on delete cascade,
  kind text not null
    constraint notifications_kind_known check (kind in ('customer_receipt', 'business_new_request', 'staff_digest', 'handover')),
  recipient text not null
    constraint notifications_recipient_present check (btrim(recipient) <> ''),
  locale public.site_locale not null,
  status text not null default 'pending'
    constraint notifications_status_known check (status in ('pending', 'sent', 'failed')),
  attempts integer not null default 0
    constraint notifications_attempts_non_negative check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  sent_at timestamptz
);

create index notifications_unsent_idx on public.notifications (status, created_at) where status <> 'sent';
create index notifications_request_id_idx on public.notifications (request_id) where request_id is not null;

-- ---------------------------------------------------------------------------------------------
-- submission_throttle: one row per accepted submission, keyed by an HMAC of the IP
-- ---------------------------------------------------------------------------------------------

create table public.submission_throttle (
  id bigint generated always as identity primary key,
  ip_hash text not null
    constraint submission_throttle_ip_hash_present check (ip_hash <> ''),
  created_at timestamptz not null default now()
);

-- The rate-limit query counts rows for one hash inside a recent window.
create index submission_throttle_ip_hash_created_at_idx on public.submission_throttle (ip_hash, created_at);
-- The daily prune looks at age alone, across every hash.
create index submission_throttle_created_at_idx on public.submission_throttle (created_at);

/**
 * The submit-request rate limit: records one submission for p_ip_hash unless that hash already has
 * p_max rows inside the last p_window_seconds. Returns true when the submission may go ahead.
 * Count and insert run under one per-hash transaction lock; without it, parallel requests from one
 * address could all count below the limit before any of them inserted. Each call also drops rows
 * older than a day, so the table stays small without a scheduled job. SKIP LOCKED leaves rows that
 * another call is already deleting, so two prunes never wait on (or deadlock with) each other, and
 * the batch cap keeps one visitor's request from paying for a long backlog.
 */
create function public.throttle_submission(p_ip_hash text, p_max integer, p_window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recent bigint;
begin
  if p_ip_hash is null or p_ip_hash = '' or length(p_ip_hash) > 128 then
    raise exception 'p_ip_hash must be 1 to 128 characters' using errcode = '22023';
  end if;
  if p_max is null or p_max not between 1 and 100 then
    raise exception 'p_max must be between 1 and 100' using errcode = '22023';
  end if;
  if p_window_seconds is null or p_window_seconds not between 1 and 86400 then
    raise exception 'p_window_seconds must be between 1 and 86400' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('submission_throttle:' || p_ip_hash, 0));

  delete from public.submission_throttle as t
  where t.id in (
    select o.id
    from public.submission_throttle as o
    where o.created_at < now() - interval '1 day'
    limit 1000
    for update skip locked
  );

  select count(*) into v_recent
  from public.submission_throttle as t
  where t.ip_hash = p_ip_hash
    and t.created_at > now() - make_interval(secs => p_window_seconds);

  if v_recent >= p_max then
    return false;
  end if;

  insert into public.submission_throttle (ip_hash, created_at) values (p_ip_hash, now());
  return true;
end;
$$;

revoke all on function public.throttle_submission(text, integer, integer) from public, anon, authenticated;
grant execute on function public.throttle_submission(text, integer, integer) to service_role;

-- ---------------------------------------------------------------------------------------------
-- app_settings
-- ---------------------------------------------------------------------------------------------

create table public.app_settings (
  key text primary key
    constraint app_settings_key_format check (key ~ '^[a-z][a-z0-9_]*$'),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.staff_members (id) on delete set null,
  constraint app_settings_digest_enabled_boolean check (
    key <> 'digest_enabled' or jsonb_typeof(value) = 'boolean'
  ),
  -- Whole minutes, from 5 minutes to a day. CASE keeps the numeric cast away from non-numbers.
  constraint app_settings_digest_interval_range check (
    case
      when key <> 'digest_interval_minutes' then true
      when jsonb_typeof(value) <> 'number' then false
      else (value::text)::numeric between 5 and 1440 and (value::text)::numeric % 1 = 0
    end
  )
);

/** Records who changed a setting; the staff id comes from the session, never from the client. */
create function private.stamp_app_setting()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := private.current_staff_id();
  return new;
end;
$$;

revoke all on function private.stamp_app_setting() from public, anon, authenticated;

create trigger app_settings_stamp
  before update on public.app_settings
  for each row execute function private.stamp_app_setting();

insert into public.app_settings (key, value) values
  ('digest_enabled', 'true'::jsonb),
  ('digest_interval_minutes', '120'::jsonb);

-- ---------------------------------------------------------------------------------------------
-- RLS and grants (new tables are not exposed automatically; every grant is explicit)
-- ---------------------------------------------------------------------------------------------

alter table public.requests enable row level security;
alter table public.request_activity enable row level security;
alter table public.notifications enable row level security;
alter table public.submission_throttle enable row level security;
alter table public.app_settings enable row level security;

revoke all on table
  public.requests, public.request_activity, public.notifications, public.submission_throttle, public.app_settings
  from public, anon, authenticated;

grant select on table public.requests, public.request_activity, public.app_settings to authenticated;
grant update (value) on table public.app_settings to authenticated;

grant all on table
  public.requests, public.request_activity, public.notifications, public.submission_throttle, public.app_settings
  to service_role;

-- The platform's default privileges hand identity sequences to anon and authenticated; neither
-- ever inserts, so take them back.
revoke all on sequence
  public.request_activity_id_seq, public.notifications_id_seq, public.submission_throttle_id_seq
  from public, anon, authenticated;

create policy requests_select_readers on public.requests
  for select to authenticated
  using ((select private.can('requests.read')));

create policy request_activity_select_readers on public.request_activity
  for select to authenticated
  using ((select private.can('requests.read')));

create policy app_settings_select_staff on public.app_settings
  for select to authenticated
  using ((select private.is_staff()));

create policy app_settings_update_manager on public.app_settings
  for update to authenticated
  using ((select private.can('settings.manage')))
  with check ((select private.can('settings.manage')));

-- notifications and submission_throttle have RLS on and no policies: only service_role
-- (which bypasses RLS) reaches them. The function records submissions through
-- public.throttle_submission() rather than writing the throttle table itself.
