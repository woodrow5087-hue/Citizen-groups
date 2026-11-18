-- Private beta: no client can create memberships, admit users or promote roles.
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
revoke create on schema public from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

create type public.group_role as enum ('member', 'leader');
create type public.rsvp_status as enum ('going', 'not_going');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null check (char_length(btrim(display_name)) >= 1 and char_length(display_name) <= 80),
 beta_enabled boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.groups (
 id uuid primary key default gen_random_uuid(),
 name text not null check (char_length(btrim(name)) >= 1 and char_length(name) <= 100),
 description text not null default '' check (char_length(description) <= 2000),
 created_at timestamptz not null default now()
);
create table public.memberships (
 group_id uuid not null references public.groups(id) on delete cascade,
 user_id uuid not null references public.profiles(id) on delete cascade,
 role public.group_role not null default 'member',
 created_at timestamptz not null default now(),
 primary key (group_id, user_id)
);
create index memberships_user on public.memberships(user_id, group_id);
create table private.beta_invitations (
 id uuid primary key default gen_random_uuid(),
 email text not null check (email = lower(btrim(email)) and char_length(email) between 3 and 254),
 group_id uuid not null references public.groups(id) on delete cascade,
 role public.group_role not null default 'member',
 display_name text not null check (char_length(btrim(display_name)) >= 1 and char_length(display_name) <= 80),
 expires_at timestamptz not null default now() + interval '7 days',
 accepted_by uuid references auth.users(id) on delete set null,
 accepted_at timestamptz,
 revoked_at timestamptz,
 created_at timestamptz not null default now(),
 unique (email, group_id)
);
alter table private.beta_invitations enable row level security;
revoke all on private.beta_invitations from public, anon, authenticated;

-- Definer predicates avoid recursive membership policies. No caller-controlled user IDs.
create function private.is_beta_member() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles p where p.id = (select auth.uid()) and p.beta_enabled)
 and exists(select 1 from auth.sessions s where s.id = nullif((select auth.jwt()->>'session_id'),'')::uuid and s.user_id=(select auth.uid()) and (s.not_after is null or s.not_after>now()));
$$;
create function private.is_group_member(gid uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select private.is_beta_member() and exists(select 1 from public.memberships m where m.group_id = gid and m.user_id = (select auth.uid()));
$$;
create function private.is_group_leader(gid uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select private.is_beta_member() and exists(select 1 from public.memberships m where m.group_id = gid and m.user_id = (select auth.uid()) and m.role = 'leader');
$$;
create function private.shares_group(person uuid) returns boolean language sql stable security definer set search_path = '' as $$
 select private.is_beta_member() and exists(select 1 from public.memberships mine join public.memberships theirs on mine.group_id = theirs.group_id where mine.user_id = (select auth.uid()) and theirs.user_id = person);
$$;
revoke all on function private.is_beta_member(), private.is_group_member(uuid), private.is_group_leader(uuid), private.shares_group(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_beta_member(), private.is_group_member(uuid), private.is_group_leader(uuid), private.shares_group(uuid) to authenticated;

-- Only a trusted Auth admin invitation plus a pending DB invitation can create an account.
-- Raw user metadata is never trusted for role, admission, group, or display name.
create function private.require_invitation() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.email is null then
   raise exception 'A private beta administrator invitation is required';
 end if;
 perform 1 from private.beta_invitations i where i.email = lower(new.email) and i.accepted_at is null and i.revoked_at is null and i.expires_at > now() for update;
 if not found then raise exception 'A valid private beta invitation is required'; end if;
 return new;
end;
$$;
create trigger beta_admission before insert on auth.users for each row execute function private.require_invitation();
create function private.accept_invitation() returns trigger language plpgsql security definer set search_path = '' as $$
declare label text;
begin
 -- Auth inserts a user before setting invited_at. Only activate on that trusted
 -- column, never on user_metadata or merely on possession of an email string.
 if new.invited_at is null then return new; end if;
 select i.display_name into label from private.beta_invitations i where i.email=lower(new.email) and i.accepted_at is null and i.revoked_at is null and i.expires_at > now() order by i.created_at limit 1;
 if label is null then raise exception 'Invitation not available'; end if;
 insert into public.profiles(id, display_name) values (new.id, label);
 insert into public.memberships(group_id,user_id,role)
 select i.group_id,new.id,i.role from private.beta_invitations i where i.email=lower(new.email) and i.accepted_at is null and i.revoked_at is null and i.expires_at > now();
 update private.beta_invitations set accepted_by=new.id,accepted_at=now() where email=lower(new.email) and accepted_at is null and revoked_at is null and expires_at > now();
 return new;
end;
$$;
create trigger beta_profile after insert on auth.users for each row execute function private.accept_invitation();
create trigger beta_profile_invited after update of invited_at on auth.users for each row when (old.invited_at is null and new.invited_at is not null) execute function private.accept_invitation();
revoke all on function private.require_invitation(), private.accept_invitation() from public, anon, authenticated;

create table public.posts (
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
 author_id uuid not null default auth.uid() references public.profiles(id),
 body text not null check (char_length(btrim(body)) >= 1 and char_length(body) <= 600),
 created_at timestamptz not null default now(), unique(id, group_id)
);
create index posts_group on public.posts(group_id, created_at desc);
create table public.comments (
 id uuid primary key default gen_random_uuid(), group_id uuid not null,
 post_id uuid not null, author_id uuid not null default auth.uid() references public.profiles(id),
 body text not null check (char_length(btrim(body)) >= 1 and char_length(body) <= 600), created_at timestamptz not null default now(),
 foreign key(post_id,group_id) references public.posts(id,group_id) on delete cascade
);
create index comments_post on public.comments(post_id, created_at);
create index comments_group on public.comments(group_id);
create table public.prayer_requests (
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
 author_id uuid not null default auth.uid() references public.profiles(id),
 body text not null check (char_length(btrim(body)) >= 1 and char_length(body) <= 400), created_at timestamptz not null default now(), unique(id,group_id)
);
create index prayers_group on public.prayer_requests(group_id, created_at desc);
create table public.prayer_acknowledgements (
 request_id uuid not null, group_id uuid not null, user_id uuid not null default auth.uid() references public.profiles(id),
 created_at timestamptz not null default now(), primary key(request_id,user_id),
 foreign key(request_id,group_id) references public.prayer_requests(id,group_id) on delete cascade
);
create index prayer_ack_group on public.prayer_acknowledgements(group_id);
create table public.meetings (
 id uuid primary key default gen_random_uuid(), group_id uuid not null references public.groups(id) on delete cascade,
 created_by uuid not null default auth.uid() references public.profiles(id),
 title text not null check (char_length(btrim(title)) >= 1 and char_length(title) <= 100),
 description text not null default '' check (char_length(description)<=2000),
 location text not null default '' check (char_length(location)<=160), starts_at timestamptz not null,
 created_at timestamptz not null default now(), unique(id,group_id)
);
create index meetings_group on public.meetings(group_id, starts_at);
create table public.rsvps (
 meeting_id uuid not null, group_id uuid not null, user_id uuid not null default auth.uid() references public.profiles(id),
 status public.rsvp_status not null, created_at timestamptz not null default now(), primary key(meeting_id,user_id),
 foreign key(meeting_id,group_id) references public.meetings(id,group_id) on delete cascade
);
create index rsvps_group on public.rsvps(group_id);

-- Explicit grants: no public/private data permissions for anonymous API clients.
revoke all on public.profiles, public.groups, public.memberships, public.posts, public.comments, public.prayer_requests, public.prayer_acknowledgements, public.meetings, public.rsvps from anon, authenticated;
grant select(id,display_name,created_at) on public.profiles to authenticated;
grant update(display_name) on public.profiles to authenticated;
grant select on public.groups, public.memberships, public.posts, public.comments, public.prayer_requests, public.prayer_acknowledgements, public.meetings, public.rsvps to authenticated;
grant update(name,description) on public.groups to authenticated;
grant insert(group_id,body,author_id), delete on public.posts, public.prayer_requests to authenticated;
grant insert(group_id,post_id,body,author_id), delete on public.comments to authenticated;
grant insert(request_id,group_id,user_id), delete on public.prayer_acknowledgements to authenticated;
grant insert(group_id,created_by,title,description,location,starts_at), delete on public.meetings to authenticated;
grant update(title,description,location,starts_at) on public.meetings to authenticated;
grant insert(meeting_id,group_id,user_id,status), delete on public.rsvps to authenticated;
grant update(status) on public.rsvps to authenticated;
grant all on public.profiles, public.groups, public.memberships, public.posts, public.comments, public.prayer_requests, public.prayer_acknowledgements, public.meetings, public.rsvps to service_role;
grant usage on schema private to service_role;
grant all on private.beta_invitations to service_role;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.memberships enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.prayer_requests enable row level security;
alter table public.prayer_acknowledgements enable row level security;
alter table public.meetings enable row level security;
alter table public.rsvps enable row level security;
create policy profiles_read on public.profiles for select to authenticated using (private.is_beta_member() and (id=(select auth.uid()) or private.shares_group(id)));
create policy profiles_self_update on public.profiles for update to authenticated using (id=(select auth.uid()) and private.is_beta_member()) with check (id=(select auth.uid()) and private.is_beta_member());
create policy groups_read on public.groups for select to authenticated using (private.is_group_member(id));
create policy groups_leader_update on public.groups for update to authenticated using (private.is_group_leader(id)) with check(private.is_group_leader(id));
create policy memberships_read on public.memberships for select to authenticated using (private.is_group_member(group_id));
create policy posts_read on public.posts for select to authenticated using (private.is_group_member(group_id));
create policy posts_create on public.posts for insert to authenticated with check (private.is_group_member(group_id) and author_id=(select auth.uid()));
create policy posts_delete on public.posts for delete to authenticated using (private.is_group_member(group_id) and author_id=(select auth.uid()));
create policy comments_read on public.comments for select to authenticated using (private.is_group_member(group_id));
create policy comments_create on public.comments for insert to authenticated with check (private.is_group_member(group_id) and author_id=(select auth.uid()));
create policy comments_delete on public.comments for delete to authenticated using (private.is_group_member(group_id) and author_id=(select auth.uid()));
create policy prayers_read on public.prayer_requests for select to authenticated using (private.is_group_member(group_id));
create policy prayers_create on public.prayer_requests for insert to authenticated with check (private.is_group_member(group_id) and author_id=(select auth.uid()));
create policy prayers_delete on public.prayer_requests for delete to authenticated using (private.is_group_member(group_id) and author_id=(select auth.uid()));
create policy prayer_ack_read on public.prayer_acknowledgements for select to authenticated using (private.is_group_member(group_id));
create policy prayer_ack_create on public.prayer_acknowledgements for insert to authenticated with check (private.is_group_member(group_id) and user_id=(select auth.uid()));
create policy prayer_ack_delete on public.prayer_acknowledgements for delete to authenticated using (private.is_group_member(group_id) and user_id=(select auth.uid()));
create policy meetings_read on public.meetings for select to authenticated using (private.is_group_member(group_id));
create policy meetings_create on public.meetings for insert to authenticated with check (private.is_group_leader(group_id) and created_by=(select auth.uid()));
create policy meetings_update on public.meetings for update to authenticated using (private.is_group_leader(group_id)) with check(private.is_group_leader(group_id));
create policy meetings_delete on public.meetings for delete to authenticated using (private.is_group_leader(group_id));
create policy rsvps_read on public.rsvps for select to authenticated using (private.is_group_member(group_id));
create policy rsvps_create on public.rsvps for insert to authenticated with check (private.is_group_member(group_id) and user_id=(select auth.uid()));
create policy rsvps_update on public.rsvps for update to authenticated using (private.is_group_member(group_id) and user_id=(select auth.uid())) with check(private.is_group_member(group_id) and user_id=(select auth.uid()));
create policy rsvps_delete on public.rsvps for delete to authenticated using (private.is_group_member(group_id) and user_id=(select auth.uid()));

create function public.set_rsvp(p_meeting uuid,p_status public.rsvp_status) returns void language plpgsql security invoker set search_path='' as $$
declare gid uuid;
begin
 select group_id into gid from public.meetings where id=p_meeting;
 if gid is null then raise exception 'Gathering unavailable'; end if;
 insert into public.rsvps(meeting_id,group_id,user_id,status) values(p_meeting,gid,auth.uid(),p_status)
 on conflict(meeting_id,user_id) do update set status=excluded.status;
end;
$$;
revoke all on function public.set_rsvp(uuid,public.rsvp_status) from public,anon;
grant execute on function public.set_rsvp(uuid,public.rsvp_status) to authenticated;

create function private.remove_group_member(p_group uuid,p_member uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if not private.is_group_leader(p_group) then raise exception 'Leader permission required'; end if;
 delete from public.memberships where group_id=p_group and user_id=p_member and role='member';
 if not found then raise exception 'Only ordinary members of this group can be removed'; end if;
end;
$$;
revoke all on function private.remove_group_member(uuid,uuid) from public,anon;
grant execute on function private.remove_group_member(uuid,uuid) to authenticated;
create function public.remove_group_member(p_group uuid,p_member uuid) returns void language sql security invoker set search_path='' as $$ select private.remove_group_member(p_group,p_member); $$;
revoke all on function public.remove_group_member(uuid,uuid) from public,anon;
grant execute on function public.remove_group_member(uuid,uuid) to authenticated;

-- Service-role only; never call from a frontend. Auth Admin invitation is a separate trusted step.
create function private.provision_beta_invitation(p_email text,p_group uuid,p_display_name text,p_role public.group_role default 'member') returns void language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from auth.users where lower(email)=lower(btrim(p_email))) then
   raise exception 'Existing accounts must be assigned through the trusted operator procedure';
 end if;
 insert into private.beta_invitations(email,group_id,display_name,role) values(lower(btrim(p_email)),p_group,btrim(p_display_name),p_role)
 on conflict(email,group_id) do update set display_name=excluded.display_name,role=excluded.role,expires_at=now()+interval '7 days',revoked_at=null where private.beta_invitations.accepted_at is null;
end;
$$;
revoke all on function private.provision_beta_invitation(text,uuid,text,public.group_role) from public,anon,authenticated;
grant execute on function private.provision_beta_invitation(text,uuid,text,public.group_role) to service_role;
create function public.provision_beta_invitation(p_email text,p_group uuid,p_display_name text,p_role public.group_role default 'member') returns void language sql security invoker set search_path='' as $$ select private.provision_beta_invitation(p_email,p_group,p_display_name,p_role); $$;
revoke all on function public.provision_beta_invitation(text,uuid,text,public.group_role) from public,anon,authenticated;
grant execute on function public.provision_beta_invitation(text,uuid,text,public.group_role) to service_role;
