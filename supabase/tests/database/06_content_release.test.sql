-- apply_content_release: conflict, stale drafts, slug history, the events projection, archive,
-- unpublish, reorder, form versions, snapshot pruning and the deploy it queues.
begin;
create extension if not exists pgtap with schema extensions;

select plan(41);

-- Fixtures (rolled back) ----------------------------------------------------------------------

insert into public.staff_members (id, email, full_name, role)
values ('20000000-0000-4000-8000-000000000001', 'admin@dragoman.test', 'Ana Yönetici', 'main_admin');

-- A new event made from a seeded one, with its own id and slugs.
insert into public.content_entries (id, type, key, draft)
select '50000000-0000-4000-8000-000000000001', 'event', 'pgtap-trip',
       e.draft || jsonb_build_object(
         'id', 'pgtap-trip',
         'slug', jsonb_build_object('tr', 'pgtap-gezi', 'en', 'pgtap-trip', 'fr', 'pgtap-sortie', 'de', 'pgtap-tour'),
         'category', 'diving',
         'options', jsonb_build_array(
           jsonb_build_object('id', 'single', 'name', jsonb_build_object('tr', 'Tek'), 'price', 50, 'currency', 'EUR', 'basis', 'person'),
           jsonb_build_object('id', 'group', 'name', jsonb_build_object('tr', 'Grup', 'xx', 'drop'), 'price', null, 'currency', 'EUR', 'basis', 'group')
         )
       )
from public.content_entries as e
where e.type = 'event'
order by e.key
limit 1;

create function pg_temp.snap(p_release bigint)
returns jsonb
language sql
as $$ select jsonb_build_object('format', 1, 'releaseId', p_release) $$;

set local role service_role;

-- Guards ------------------------------------------------------------------------------------------

select is((select max(id) from public.content_releases), 1::bigint, 'the seed is release 1');

select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 0,
       '[{"op": "publish", "entryId": "50000000-0000-4000-8000-000000000001", "draftRevision": 1}]',
       pg_temp.snap(1), repeat('a', 64), 'publish', null) $$,
  '40001', 'conflict',
  'a stale base release is a conflict'
);
select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 1,
       '[{"op": "publish", "entryId": "50000000-0000-4000-8000-000000000001", "draftRevision": 7}]',
       pg_temp.snap(2), repeat('a', 64), 'publish', null) $$,
  '40001', 'stale_draft:50000000-0000-4000-8000-000000000001',
  'a draft revision mismatch is stale_draft:<id>'
);
select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 1,
       '[{"op": "publish", "entryId": "50000000-0000-4000-8000-000000000001", "draftRevision": 1}]',
       pg_temp.snap(5), repeat('a', 64), 'publish', null) $$,
  '22023', 'bad_request:snapshot.releaseId',
  'the snapshot must carry the id the release gets'
);
select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 1,
       '[{"op": "publish", "entryId": "50000000-0000-4000-8000-0000000000ff", "draftRevision": 1}]',
       pg_temp.snap(2), repeat('a', 64), 'publish', null) $$,
  'P0002', 'not_found:50000000-0000-4000-8000-0000000000ff',
  'an unknown entry is not_found:<id>'
);
select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 1,
       '[{"op": "explode"}]', pg_temp.snap(2), repeat('a', 64), 'publish', null) $$,
  '22023', 'bad_request:op',
  'an unknown op is a bad request'
);
select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 1,
       '[{"op": "archive", "entryId": "50000000-0000-4000-8000-000000000001"}]', pg_temp.snap(2), repeat('a', 64), 'archive', null) $$,
  '22023', 'bad_request:not_published:50000000-0000-4000-8000-000000000001',
  'a never-published entry cannot be archived'
);

-- Publish: published copy, release row, projection, deploy queued -----------------------------------

select is(
  public.apply_content_release('20000000-0000-4000-8000-000000000001', 1,
    '[{"op": "publish", "entryId": "50000000-0000-4000-8000-000000000001", "draftRevision": 1}]',
    pg_temp.snap(2), repeat('b', 64), 'publish', 'ilk yayın'),
  2::bigint,
  'publishing returns the new release id'
);
select results_eq(
  $$ select status, published_revision, published ->> 'status', published - 'status' = draft - 'status', published_by, slug_history
     from public.content_entries where id = '50000000-0000-4000-8000-000000000001' $$,
  $$ values ('published'::public.content_status, 1, 'published', true, '20000000-0000-4000-8000-000000000001'::uuid, '[]'::jsonb) $$,
  'publish copies the draft, sets status in the column and the copy, and records who published'
);
select results_eq(
  $$ select action, entry_ids, note, snapshot_sha256, snapshot is not null, created_by from public.content_releases where id = 2 $$,
  $$ values ('publish'::text, array['50000000-0000-4000-8000-000000000001'::uuid], 'ilk yayın'::text, repeat('b', 64), true,
             '20000000-0000-4000-8000-000000000001'::uuid) $$,
  'the release row records action, entries, note, hash and snapshot'
);
select results_eq(
  $$ select category, status, title ? 'tr' from public.events where id = 'pgtap-trip' $$,
  $$ values ('diving'::text, 'published'::text, true) $$,
  'publishing an event upserts it into events'
);
select results_eq(
  $$ select id, price, sort, name from public.event_options where event_id = 'pgtap-trip' order by sort $$,
  $$ values ('single'::text, 50::numeric(10, 2), 0, '{"tr": "Tek"}'::jsonb), ('group', null, 1, '{"tr": "Grup"}') $$,
  'event options are replaced from the document, unknown locales dropped, null prices kept null'
);
select results_eq(
  $$ select status, release_id, not_before > now() from public.site_deploys $$,
  $$ values ('queued'::public.site_deploy_status, 2::bigint, true) $$,
  'the release queues a deploy'
);

-- Slug history ------------------------------------------------------------------------------------

update public.content_entries
   set draft = jsonb_set(jsonb_set(draft, '{slug,tr}', '"pgtap-yeni-gezi"'), '{options}', '[]')
 where id = '50000000-0000-4000-8000-000000000001';

select is(
  (select draft_revision from public.content_entries where id = '50000000-0000-4000-8000-000000000001'), 2,
  'editing the draft bumps its revision'
);
select is(
  (select has_changes from public.content_entry_list where id = '50000000-0000-4000-8000-000000000001'), true,
  'an edited published entry has unpublished changes'
);
select lives_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 2,
       '[{"op": "publish", "entryId": "50000000-0000-4000-8000-000000000001", "draftRevision": 2}]',
       pg_temp.snap(3), repeat('c', 64), 'publish', null) $$,
  'publishing a changed slug'
);
select is(
  (select slug_history from public.content_entries where id = '50000000-0000-4000-8000-000000000001'),
  '[{"locale": "tr", "slug": "pgtap-gezi", "category": "diving"}]'::jsonb,
  'a changed slug is kept in slug_history (with the event category)'
);
select is_empty(
  $$ select 1 from public.event_options where event_id = 'pgtap-trip' $$,
  'removed options leave the projection'
);

update public.content_entries
   set draft = jsonb_set(jsonb_set(draft, '{slug,tr}', '"pgtap-gezi"'), '{category}', '"outdoor"')
 where id = '50000000-0000-4000-8000-000000000001';
select lives_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 3,
       '[{"op": "publish", "entryId": "50000000-0000-4000-8000-000000000001", "draftRevision": 3}]',
       pg_temp.snap(4), repeat('d', 64), 'publish', null) $$,
  'publishing the old slug again under another category'
);
select results_eq(
  $$ select h ->> 'locale', h ->> 'slug', h ->> 'category'
     from public.content_entries, jsonb_array_elements(slug_history) as h
     where id = '50000000-0000-4000-8000-000000000001' order by 1, 2, 3 $$,
  $$ values ('de'::text, 'pgtap-tour'::text, 'diving'::text), ('en', 'pgtap-trip', 'diving'), ('fr', 'pgtap-sortie', 'diving'),
            ('tr', 'pgtap-gezi', 'diving'), ('tr', 'pgtap-yeni-gezi', 'diving') $$,
  'a category change keeps every old address under the old category'
);
select is(
  private.next_slug_history(
    'post', '[{"locale": "tr", "slug": "eski"}]',
    '{"slug": {"tr": "yeni", "en": "new", "fr": "neuf", "de": "neu"}}',
    '{"slug": {"tr": "eski", "en": "new", "fr": "neuf", "de": "neu"}}'
  ),
  '[{"locale": "tr", "slug": "yeni"}]'::jsonb,
  'a slug that comes back leaves the history, and the one it replaces joins it'
);
select is((select category from public.events where id = 'pgtap-trip'), 'outdoor', 'the projection follows the category');

-- Archive and unpublish close the event ------------------------------------------------------------

select lives_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 4,
       '[{"op": "archive", "entryId": "50000000-0000-4000-8000-000000000001"}]', pg_temp.snap(5), repeat('e', 64), 'archive', null) $$,
  'archiving an event'
);
select results_eq(
  $$ select e.status, e.published ->> 'status', ev.status
     from public.content_entries as e join public.events as ev on ev.id = e.key
     where e.id = '50000000-0000-4000-8000-000000000001' $$,
  $$ values ('archived'::public.content_status, 'archived'::text, 'archived'::text) $$,
  'archive keeps the published copy and closes the event for requests'
);
select lives_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 5,
       '[{"op": "unpublish", "entryId": "50000000-0000-4000-8000-000000000001"}]', pg_temp.snap(6), repeat('f', 64), 'unpublish', null) $$,
  'unpublishing an event'
);
select results_eq(
  $$ select e.status, e.published is null, e.published_revision is null, jsonb_array_length(e.slug_history), ev.status
     from public.content_entries as e join public.events as ev on ev.id = e.key
     where e.id = '50000000-0000-4000-8000-000000000001' $$,
  $$ values ('draft'::public.content_status, true, true, 5, 'draft'::text) $$,
  'unpublish drops the published copy, keeps the slug history and the event row (never deleted)'
);

-- Reorder ------------------------------------------------------------------------------------------

select lives_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 6,
       jsonb_build_array(jsonb_build_object('op', 'reorder', 'type', 'subgroup', 'keys',
         (select jsonb_agg(key order by key desc) from (select key from public.content_entries where type = 'subgroup' order by key limit 2) as s))),
       pg_temp.snap(7), repeat('1', 64), 'reorder', null) $$,
  'reordering subgroups'
);
select results_eq(
  $$ select (draft ->> 'order')::int, (published ->> 'order')::int, published_revision = draft_revision
     from public.content_entries where type = 'subgroup' order by key limit 2 $$,
  $$ values (2, 2, true), (1, 1, true) $$,
  'reorder writes order into both copies without leaving unpublished changes'
);
select is(
  (select cardinality(entry_ids) from public.content_releases where id = 7), 2,
  'the reorder release lists the reordered entries'
);
select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 7,
       '[{"op": "reorder", "type": "subgroup", "keys": ["no-such-group"]}]', pg_temp.snap(8), repeat('1', 64), 'reorder', null) $$,
  'P0002', 'not_found:subgroup/no-such-group',
  'reordering an unknown key is not_found:<type>/<key>'
);
select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 7,
       '[{"op": "reorder", "type": "post", "keys": ["x"]}]', pg_temp.snap(8), repeat('1', 64), 'reorder', null) $$,
  '22023', 'bad_request:type',
  'only ordered types can be reordered'
);

-- Forms ------------------------------------------------------------------------------------------

select throws_ok(
  $$ select public.apply_content_release('20000000-0000-4000-8000-000000000001', 7,
       '[{"op": "publish_form", "kind": "contact", "draftRevision": 9}]', pg_temp.snap(8), repeat('2', 64), 'publish_form', null) $$,
  '40001', 'stale_draft:contact',
  'a stale form draft is stale_draft:<kind>'
);
update public.form_definitions set draft = draft || '{"note": "v2"}' where kind = 'contact';
select is(
  public.apply_content_release('20000000-0000-4000-8000-000000000001', 7,
    '[{"op": "publish_form", "kind": "contact", "draftRevision": 2}]', pg_temp.snap(8), repeat('2', 64), 'publish_form', null),
  8::bigint,
  'publishing a form'
);
select results_eq(
  $$ select f.published_version, v.definition ->> 'note', v.published_by
     from public.form_definitions as f join public.form_versions as v on v.kind = f.kind and v.version = f.published_version
     where f.kind = 'contact' $$,
  $$ values (2, 'v2'::text, '20000000-0000-4000-8000-000000000001'::uuid) $$,
  'publish_form adds the next version and points the definition at it'
);
select is(
  (select count(*) from public.form_versions where kind = 'contact'), 2::bigint,
  'the old version stays'
);

-- One deploy row coalesces every release ------------------------------------------------------------

select results_eq(
  $$ select count(*), max(release_id) from public.site_deploys where status = 'queued' $$,
  $$ values (1::bigint, 8::bigint) $$,
  'all releases share one queued deploy pointing at the latest release'
);

-- Pruning: only the last 20 releases keep their snapshot ---------------------------------------------

reset role;
insert into public.content_releases (id, action, snapshot, snapshot_sha256)
select g, 'publish', '{}', repeat('3', 64) from generate_series(9, 30) as g;
set local role service_role;

select is(
  public.apply_content_release('20000000-0000-4000-8000-000000000001', 30,
    '[{"op": "publish", "entryId": "50000000-0000-4000-8000-000000000001", "draftRevision": 3}]',
    pg_temp.snap(31), repeat('4', 64), 'publish', null),
  31::bigint,
  'republishing an unpublished entry'
);
select results_eq(
  $$ select count(*) filter (where snapshot is not null), min(id) filter (where snapshot is not null) from public.content_releases $$,
  $$ values (20::bigint, 12::bigint) $$,
  'snapshots older than the last 20 releases are pruned'
);
select is(
  (select status from public.events where id = 'pgtap-trip'), 'published',
  'republishing reopens the event'
);
select is(
  (select jsonb_array_length(slug_history) from public.content_entries where id = '50000000-0000-4000-8000-000000000001'), 5,
  'republishing after unpublish keeps the history (no live slug added twice)'
);

-- Advisory lock -----------------------------------------------------------------------------------

select isnt_empty(
  $$ select 1 from pg_locks where locktype = 'advisory' and pid = pg_backend_pid() and granted $$,
  'apply_content_release holds the release lock until commit'
);

reset role;
select * from finish();
rollback;
