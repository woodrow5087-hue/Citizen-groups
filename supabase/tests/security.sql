-- Portable SQL policy tests. Transactional and fixture-only; emits TAP output.
begin;
create schema beta_test;
grant usage on schema beta_test to anon,authenticated;
create function beta_test.ok(condition boolean,label text) returns text language plpgsql security invoker as $$ begin if condition is not true then raise exception 'FAILED: %',label; end if; return 'ok - '||label; end $$;
create function beta_test.denied(query text,expected text,label text) returns text language plpgsql security invoker as $$ begin begin execute query; exception when others then if sqlstate=expected then return 'ok - '||label; else raise exception 'FAILED: %, unexpected SQLSTATE %',label,sqlstate; end if; end; raise exception 'FAILED: %, operation was allowed',label; end $$;
create function beta_test.rows(query text,expected int,label text) returns text language plpgsql security invoker as $$ declare n int; begin execute query; get diagnostics n=row_count; if n<>expected then raise exception 'FAILED: %, expected % changed rows, got %',label,expected,n; end if; return 'ok - '||label; end $$;
grant execute on all functions in schema beta_test to anon,authenticated;
insert into public.groups(id,name) values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Fictional SQL Group A'),('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Fictional SQL Group B');
insert into private.beta_invitations(email,group_id,display_name,role) values
('sql-a@example.test','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Fictional A','member'),
('sql-b@example.test','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Fictional B','member'),
('sql-leader@example.test','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Fictional Leader','leader'),
('sql-outside@example.test','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','Fictional Outsider','member'),
('sql-coleader@example.test','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Fictional Co-leader','leader'),
('sql-unmarked@example.test','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Unmarked signup','member');
insert into auth.users(id,email,invited_at,raw_user_meta_data) values
('11111111-1111-4111-8111-111111111111','sql-a@example.test',now(),'{"role":"leader","beta_enabled":true}'),
('22222222-2222-4222-8222-222222222222','sql-b@example.test',now(),'{}'),
('33333333-3333-4333-8333-333333333333','sql-leader@example.test',now(),'{}'),
('44444444-4444-4444-8444-444444444444','sql-outside@example.test',now(),'{}'),
('55555555-5555-4555-8555-555555555555','sql-coleader@example.test',now(),'{}');
insert into auth.users(id,email,raw_user_meta_data) values('77777777-7777-4777-8777-777777777777','sql-unmarked@example.test','{"invited_at":"2026-11-01","role":"leader"}');
insert into auth.sessions(id,user_id,aal) values
('11111111-1111-4111-8111-111111111100','11111111-1111-4111-8111-111111111111','aal1'),
('22222222-2222-4222-8222-222222222200','22222222-2222-4222-8222-222222222222','aal1'),
('33333333-3333-4333-8333-333333333300','33333333-3333-4333-8333-333333333333','aal1'),
('44444444-4444-4444-8444-444444444400','44444444-4444-4444-8444-444444444444','aal1');
insert into public.posts(id,group_id,author_id,body) values
('00000000-0000-4000-8000-000000000001','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Fictional A post'),
('00000000-0000-4000-8000-000000000002','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','44444444-4444-4444-8444-444444444444','Fictional B post');
insert into public.prayer_requests(id,group_id,author_id,body) values
('00000000-0000-4000-8000-000000000011','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','Fictional A prayer'),
('00000000-0000-4000-8000-000000000012','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','44444444-4444-4444-8444-444444444444','Fictional B prayer');
insert into public.meetings(id,group_id,created_by,title,starts_at) values
('00000000-0000-4000-8000-000000000021','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','33333333-3333-4333-8333-333333333333','Fictional A gathering',now()+interval '1 day'),
('00000000-0000-4000-8000-000000000022','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','44444444-4444-4444-8444-444444444444','Fictional B gathering',now()+interval '1 day');
select beta_test.ok((select count(*)=9 from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity),'all nine exposed application tables have RLS');
select beta_test.ok((select count(*)=0 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef),'public RPC wrappers do not bypass RLS');
select beta_test.ok(not exists(select 1 from public.profiles where id='77777777-7777-4777-8777-777777777777'),'an unmarked signup cannot activate an invited email or metadata roles');
select beta_test.ok((select role='member' from public.memberships where user_id='11111111-1111-4111-8111-111111111111'),'user metadata cannot assign leader privileges');
select beta_test.denied($q$insert into auth.users(id,email,invited_at) values(gen_random_uuid(),'sql-not-invited@example.test',now())$q$,'P0001','database rejects non-invited accounts');
select beta_test.denied($q$insert into auth.users(id,email,invited_at) values(gen_random_uuid(),'sql-a@example.test',now())$q$,'P0001','accepted invitations cannot be reused');
insert into private.beta_invitations(email,group_id,display_name,expires_at) values('sql-expired@example.test','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Expired',now()-interval '1 second');
select beta_test.denied($q$insert into auth.users(id,email,invited_at) values(gen_random_uuid(),'sql-expired@example.test',now())$q$,'P0001','expired invitations cannot activate accounts');
insert into private.beta_invitations(email,group_id,display_name,revoked_at) values('sql-revoked@example.test','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Revoked',now());
select beta_test.denied($q$insert into auth.users(id,email,invited_at) values(gen_random_uuid(),'sql-revoked@example.test',now())$q$,'P0001','revoked invitations cannot activate accounts');
set local role anon;
select beta_test.denied('select id from public.groups','42501','anonymous cannot read groups');
select beta_test.denied('select id from public.posts','42501','anonymous cannot read posts');
select beta_test.denied('select id from public.comments','42501','anonymous cannot read comments');
select beta_test.denied('select id from public.prayer_requests','42501','anonymous cannot read prayers');
select beta_test.denied('select request_id from public.prayer_acknowledgements','42501','anonymous cannot read acknowledgements');
select beta_test.denied('select id from public.meetings','42501','anonymous cannot read gatherings');
select beta_test.denied('select meeting_id from public.rsvps','42501','anonymous cannot read RSVPs');
select beta_test.denied('select id from public.profiles','42501','anonymous cannot read profiles');
select beta_test.denied('select group_id from public.memberships','42501','anonymous cannot read memberships');
select beta_test.denied('select * from private.beta_invitations','42501','anonymous cannot read invitation emails');
reset role;
set local role authenticated;
set local request.jwt.claims='{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","session_id":"11111111-1111-4111-8111-111111111100"}';
select beta_test.ok((select count(*)=1 from public.groups where id in ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')),'A sees only its group');
select beta_test.ok((select count(*)=1 from public.posts where id in ('00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000002')),'A cannot read B posts');
select beta_test.ok((select count(*)=0 from public.profiles where id='44444444-4444-4444-8444-444444444444'),'A cannot read B profile');
select beta_test.ok((select count(*)=0 from public.memberships where group_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),'A cannot read B memberships');
select beta_test.ok((select count(*)=0 from public.prayer_requests where group_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),'A cannot read B prayers');
select beta_test.ok((select count(*)=0 from public.meetings where group_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),'A cannot read B gatherings');
select beta_test.denied($q$insert into public.posts(group_id,body) values('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','cross group')$q$,'42501','A cannot write B posts');
select beta_test.denied($q$insert into public.posts(group_id,body) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',repeat(' ',601)||'x')$q$,'23514','raw content length is bounded even with whitespace padding');
select beta_test.denied($q$insert into public.posts(group_id,author_id,body) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','spoofed author')$q$,'42501','A cannot spoof a post author');
select beta_test.denied($q$update public.memberships set role='leader' where user_id='11111111-1111-4111-8111-111111111111'$q$,'42501','member cannot promote themselves');
select beta_test.denied($q$insert into public.memberships(group_id,user_id,role) values('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','11111111-1111-4111-8111-111111111111','leader')$q$,'42501','member cannot join or lead another group');
select beta_test.denied('delete from public.memberships','42501','member cannot delete memberships directly');
select beta_test.denied($q$update public.profiles set beta_enabled=true where id='11111111-1111-4111-8111-111111111111'$q$,'42501','member cannot change beta admission');
select beta_test.rows($q$update public.profiles set display_name='Fictional A renamed' where id='11111111-1111-4111-8111-111111111111'$q$,1,'member can edit own display name');
select beta_test.rows($q$update public.profiles set display_name='stolen' where id='22222222-2222-4222-8222-222222222222'$q$,0,'member cannot edit another profile');
select beta_test.rows($q$update public.groups set name='stolen' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$q$,0,'ordinary member cannot edit the group');
select beta_test.denied($q$select public.provision_beta_invitation('intruder@example.test','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','Intruder','leader')$q$,'42501','member cannot issue invitations through RPC');
select beta_test.denied('select * from private.beta_invitations','42501','member cannot enumerate invitation emails');
select beta_test.denied($q$select public.remove_group_member('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222')$q$,'P0001','ordinary member cannot use leader RPC');
select beta_test.denied($q$insert into public.comments(group_id,post_id,body) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-4000-8000-000000000002','wrong parent')$q$,'23503','composite FK prevents cross-group comment parenting');
select beta_test.denied($q$insert into public.prayer_acknowledgements(group_id,request_id) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-4000-8000-000000000012')$q$,'23503','composite FK prevents cross-group prayer acknowledgement');
select beta_test.denied($q$insert into public.prayer_requests(group_id,body) values('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','cross group')$q$,'42501','member cannot submit prayer to another group');
select beta_test.denied($q$select public.set_rsvp('00000000-0000-4000-8000-000000000022','going')$q$,'P0001','member cannot RSVP to another group gathering');
select beta_test.denied($q$insert into public.meetings(group_id,title,starts_at) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','unauthorized',now())$q$,'42501','ordinary member cannot create a gathering');
select beta_test.rows($q$update public.meetings set title='unauthorized' where id='00000000-0000-4000-8000-000000000021'$q$,0,'ordinary member cannot edit gathering');
select beta_test.rows($q$insert into public.comments(group_id,post_id,body) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-4000-8000-000000000001','A comment')$q$,1,'authorized member can comment');
select beta_test.rows($q$insert into public.prayer_acknowledgements(group_id,request_id) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-4000-8000-000000000011')$q$,1,'authorized member can acknowledge prayer');
select public.set_rsvp('00000000-0000-4000-8000-000000000021','going');
select public.set_rsvp('00000000-0000-4000-8000-000000000021','not_going');
select beta_test.ok((select status='not_going' from public.rsvps where user_id='11111111-1111-4111-8111-111111111111' and meeting_id='00000000-0000-4000-8000-000000000021'),'member can persist and change own RSVP');
select beta_test.denied($q$update public.rsvps set user_id='22222222-2222-4222-8222-222222222222'$q$,'42501','member cannot reassign an RSVP');
reset role;
set local role authenticated;
set local request.jwt.claims='{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","session_id":"22222222-2222-4222-8222-222222222200"}';
select beta_test.ok((select count(*)=1 from public.posts where id='00000000-0000-4000-8000-000000000001'),'second account sees A post');
select beta_test.ok((select count(*)=1 from public.comments where body='A comment'),'second account sees A comment');
select beta_test.ok((select count(*)=1 from public.prayer_acknowledgements where request_id='00000000-0000-4000-8000-000000000011'),'second account sees prayer acknowledgement');
select beta_test.ok((select count(*)=1 from public.rsvps where meeting_id='00000000-0000-4000-8000-000000000021'),'second account sees shared RSVP');
select beta_test.rows($q$delete from public.posts where id='00000000-0000-4000-8000-000000000001'$q$,0,'B cannot delete A post');
select beta_test.denied($q$update public.posts set body='stolen' where id='00000000-0000-4000-8000-000000000001'$q$,'42501','posts cannot be reassigned or modified');
select beta_test.rows($q$delete from public.comments where body='A comment'$q$,0,'B cannot delete A comment');
select beta_test.rows($q$delete from public.prayer_requests where id='00000000-0000-4000-8000-000000000011'$q$,0,'B cannot delete A prayer request');
select beta_test.rows($q$delete from public.prayer_acknowledgements where user_id='11111111-1111-4111-8111-111111111111'$q$,0,'B cannot remove A prayer acknowledgement');
select beta_test.rows($q$update public.rsvps set status='going' where user_id='11111111-1111-4111-8111-111111111111'$q$,0,'B cannot modify A RSVP');
select beta_test.rows($q$insert into public.posts(group_id,body) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','B own post')$q$,1,'B can create own post');
select beta_test.rows($q$delete from public.posts where body='B own post'$q$,1,'B can delete own post');
select beta_test.rows($q$insert into public.prayer_requests(group_id,body) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','B own prayer')$q$,1,'B can create own prayer');
select beta_test.rows($q$delete from public.prayer_requests where body='B own prayer'$q$,1,'B can delete own prayer');
select beta_test.rows($q$insert into public.comments(group_id,post_id,body) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','00000000-0000-4000-8000-000000000001','B own comment')$q$,1,'B can create own comment');
select beta_test.rows($q$delete from public.comments where body='B own comment'$q$,1,'B can delete own comment');
reset role;
set local role authenticated;
set local request.jwt.claims='{"sub":"33333333-3333-4333-8333-333333333333","role":"authenticated","session_id":"33333333-3333-4333-8333-333333333300"}';
select beta_test.rows($q$update public.groups set description='Leader update' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'$q$,1,'leader can update own group details');
select beta_test.rows($q$update public.groups set name='stolen' where id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$q$,0,'leader cannot update another group');
select beta_test.rows($q$update public.meetings set title='Leader edit' where id='00000000-0000-4000-8000-000000000021'$q$,1,'leader can edit group gathering');
select beta_test.rows($q$insert into public.meetings(group_id,title,starts_at) values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','New gathering',now())$q$,1,'leader can create a gathering');
select beta_test.denied($q$update public.meetings set group_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'$q$,'42501','leader cannot reassign gathering ownership');
select beta_test.denied($q$select public.remove_group_member('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','44444444-4444-4444-8444-444444444444')$q$,'P0001','leader cannot remove another group member');
select beta_test.denied($q$select public.remove_group_member('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','55555555-5555-4555-8555-555555555555')$q$,'P0001','leader cannot remove another leader');
select beta_test.denied($q$update public.memberships set role='leader' where user_id='22222222-2222-4222-8222-222222222222'$q$,'42501','leader cannot grant leader privileges');
select public.remove_group_member('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222');
select beta_test.ok((select count(*)=0 from public.memberships where user_id='22222222-2222-4222-8222-222222222222'),'leader can remove ordinary member');
reset role;
set local role authenticated;
set local request.jwt.claims='{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated","session_id":"22222222-2222-4222-8222-222222222200"}';
select beta_test.ok((select count(*)=0 from public.posts where group_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),'removed member immediately loses access with existing JWT claims');
reset role;
set local role authenticated;
set local request.jwt.claims='{"sub":"44444444-4444-4444-8444-444444444444","role":"authenticated","session_id":"44444444-4444-4444-8444-444444444400"}';
select beta_test.ok((select count(*)=0 from public.posts where group_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),'unrelated account cannot read A content');
select beta_test.ok((select count(*)=0 from public.comments where group_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),'unrelated account cannot read A comments');
select beta_test.ok((select count(*)=0 from public.rsvps where group_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),'unrelated account cannot read A RSVPs');
reset role;
update public.profiles set beta_enabled=false where id='11111111-1111-4111-8111-111111111111';
set local role authenticated;
set local request.jwt.claims='{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","session_id":"11111111-1111-4111-8111-111111111100"}';
select beta_test.ok((select count(*)=0 from public.posts where group_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),'disabled beta admission revokes data access immediately');
reset role;
update public.profiles set beta_enabled=true where id='11111111-1111-4111-8111-111111111111';
delete from auth.sessions where id='11111111-1111-4111-8111-111111111100';
set local role authenticated;
set local request.jwt.claims='{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated","session_id":"11111111-1111-4111-8111-111111111100"}';
select beta_test.ok((select count(*)=0 from public.posts where group_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),'revoked session cannot reuse a still-unexpired JWT');
reset role;
select '1..78';
rollback;
