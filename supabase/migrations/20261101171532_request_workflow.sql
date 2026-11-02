-- The only ways staff change a request: claim, hand over, reassign. Plus binding the staff row
-- to the auth account on first sign-in.
--
-- Each RPC is security definer (requests have no UPDATE grant for clients), pins search_path to
-- '' with fully qualified names, re-checks active staff + AAL2 + permission itself, and writes
-- request_activity. Errors use stable SQLSTATEs the panel can map:
--   42501 not allowed, P0002 request not found, 55000 wrong state, 22023 bad target.

/** Hand-over and reassign targets must be active staff who can work requests. */
create function private.assert_assignable(p_staff uuid)
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.staff_members as s
    where s.id = p_staff
      and s.active
      and private.role_can(s.role, s.extra_permissions, 'requests.work')
  ) then
    raise exception 'target must be active staff who can work requests' using errcode = '22023';
  end if;
end;
$$;

revoke all on function private.assert_assignable(uuid) from public, anon, authenticated;

/** pending -> in_progress, with the caller as assignee. */
create function public.claim_request(p_request uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.current_staff_id();
begin
  if v_me is null or not private.can('requests.work') then
    raise exception 'requests.work required' using errcode = '42501';
  end if;

  -- The status condition makes two simultaneous claims safe: only one update matches.
  update public.requests as r
     set status = 'in_progress', assignee_id = v_me, claimed_at = now()
   where r.id = p_request and r.status = 'pending';

  if not found then
    if exists (select 1 from public.requests as r where r.id = p_request) then
      raise exception 'request is already in progress' using errcode = '55000';
    end if;
    raise exception 'request not found' using errcode = 'P0002';
  end if;

  insert into public.request_activity (request_id, actor_id, action, to_staff)
  values (p_request, v_me, 'claimed', v_me);
end;
$$;

/** Only the current assignee can pass their request on. */
create function public.hand_over_request(p_request uuid, p_to uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.current_staff_id();
  v_assignee uuid;
begin
  if v_me is null or not private.can('requests.work') then
    raise exception 'requests.work required' using errcode = '42501';
  end if;

  select r.assignee_id into v_assignee
  from public.requests as r
  where r.id = p_request
  for update;

  if not found then
    raise exception 'request not found' using errcode = 'P0002';
  end if;
  if v_assignee is distinct from v_me then
    raise exception 'only the assignee can hand a request over' using errcode = '42501';
  end if;
  if p_to = v_me then
    raise exception 'the request is already yours' using errcode = '22023';
  end if;
  perform private.assert_assignable(p_to);

  update public.requests as r set assignee_id = p_to where r.id = p_request;

  insert into public.request_activity (request_id, actor_id, action, from_staff, to_staff)
  values (p_request, v_me, 'handed_over', v_me, p_to);
end;
$$;

/** requests.reassign (main_admin) moves any request to someone else; a pending one starts. */
create function public.reassign_request(p_request uuid, p_to uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_me uuid := private.current_staff_id();
  v_from uuid;
begin
  if v_me is null or not private.can('requests.reassign') then
    raise exception 'requests.reassign required' using errcode = '42501';
  end if;

  select r.assignee_id into v_from
  from public.requests as r
  where r.id = p_request
  for update;

  if not found then
    raise exception 'request not found' using errcode = 'P0002';
  end if;
  if v_from = p_to then
    raise exception 'the request is already assigned to that staff member' using errcode = '22023';
  end if;
  perform private.assert_assignable(p_to);

  update public.requests as r
     set status = 'in_progress', assignee_id = p_to, claimed_at = coalesce(r.claimed_at, now())
   where r.id = p_request;

  insert into public.request_activity (request_id, actor_id, action, from_staff, to_staff)
  values (p_request, v_me, 'reassigned', v_from, p_to);
end;
$$;

/**
 * Binds the signed-in account to its staff row on first sign-in, matched by the account's
 * confirmed address (private.confirmed_email), never the bare JWT claim, so an unconfirmed
 * sign-up with a staff address binds nothing. Needs no AAL2: it grants nothing by itself and runs
 * before TOTP enrolment. Returns the staff id, or null when the account is not active staff.
 */
create function public.link_staff_account()
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text := private.confirmed_email();
  v_staff uuid;
begin
  if v_uid is null then
    raise exception 'sign in first' using errcode = '42501';
  end if;

  select s.id into v_staff
  from public.staff_members as s
  where s.user_id = v_uid and s.active;

  if found then
    return v_staff;
  end if;

  update public.staff_members as s
     set user_id = v_uid
   where s.user_id is null
     and s.active
     and s.email = v_email
     and not exists (select 1 from public.staff_members as o where o.user_id = v_uid)
  returning s.id into v_staff;

  return v_staff;
end;
$$;

revoke all on function public.claim_request(uuid) from public, anon;
revoke all on function public.hand_over_request(uuid, uuid) from public, anon;
revoke all on function public.reassign_request(uuid, uuid) from public, anon;
revoke all on function public.link_staff_account() from public, anon;
grant execute on function public.claim_request(uuid) to authenticated;
grant execute on function public.hand_over_request(uuid, uuid) to authenticated;
grant execute on function public.reassign_request(uuid, uuid) to authenticated;
grant execute on function public.link_staff_account() to authenticated;
