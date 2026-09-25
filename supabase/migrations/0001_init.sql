-- Lumeova International — initial schema
--
-- Run this against the EXISTING Supabase project (per project rule: never
-- create a new Supabase project for this). Apply it via the Supabase
-- dashboard's SQL Editor, or `supabase db push` if you use the CLI locally
-- with this project linked. This file is idempotent-ish (IF NOT EXISTS
-- guards) but is still meant to be reviewed before running against a
-- project that has other, unrelated tables in it.
--
-- Design notes:
--   * All 11 tables from the spec are here: profiles, supporters,
--     memberships, donations, donation_payments, privacy_consents,
--     admin_notes, admin_users, audit_logs, projects, news.
--   * RLS is ON for every table. Public (anon + authenticated, non-admin)
--     callers can INSERT application data (membership/donation/consent
--     rows) but cannot SELECT anyone else's. Admin access is gated through
--     the `admin_users` table + the `is_admin()` / `admin_role()` helpers
--     below — never through anything the frontend alone decides.
--   * donation_payments (the actual bank-transfer confirmation records) are
--     admin-only to write; a supporter can only read their own.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type membership_type as enum ('regular', 'general');
exception when duplicate_object then null; end $$;

do $$ begin
  create type membership_status as enum ('pending', 'approved', 'rejected', 'inactive', 'withdrawn');
exception when duplicate_object then null; end $$;

do $$ begin
  create type donation_type as enum ('recurring', 'short_term', 'one_time');
exception when duplicate_object then null; end $$;

do $$ begin
  create type donation_status as enum ('active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending', 'confirmed', 'unpaid', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type content_status as enum ('draft', 'published', 'hidden');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role as enum ('super_admin', 'manager', 'staff', 'viewer');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table if not exists admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  role admin_role not null default 'viewer',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists supporters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  birth_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Links an authenticated Supabase Auth user to their supporter record.
-- Most public applicants will NOT have a login (see spec §12: guest
-- one_time donations should stay possible) — profiles is only created for
-- people who register an account.
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  supporter_id uuid references supporters (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid not null references supporters (id) on delete cascade,
  membership_type membership_type not null,
  status membership_status not null default 'pending',
  approved_at timestamptz,
  approved_by uuid references admin_users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists donations (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid not null references supporters (id) on delete cascade,
  donation_type donation_type not null,
  amount integer not null check (amount > 0),
  start_date date,
  end_date date,
  status donation_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Not a payment gateway record — this is the admin's manual confirmation
-- that a bank transfer was received. See spec §14/§26.
create table if not exists donation_payments (
  id uuid primary key default gen_random_uuid(),
  donation_id uuid not null references donations (id) on delete cascade,
  amount integer not null check (amount > 0),
  payment_date date,
  status payment_status not null default 'pending',
  confirmed_by uuid references admin_users (id),
  confirmed_at timestamptz,
  admin_note text,
  created_at timestamptz not null default now()
);

create table if not exists privacy_consents (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid references supporters (id) on delete cascade,
  privacy_policy_version text not null,
  marketing_opt_in boolean not null default false,
  agreed_at timestamptz not null default now()
);

create table if not exists admin_notes (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid not null references supporters (id) on delete cascade,
  note text not null,
  created_by uuid references admin_users (id),
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references admin_users (id),
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text,
  content text,
  location text,
  start_date date,
  end_date date,
  status content_status not null default 'draft',
  thumbnail text,
  images jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  category text,
  summary text,
  content text,
  thumbnail text,
  published_at timestamptz,
  status content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare
  t text;
begin
  foreach t in array array['admin_users','supporters','profiles','memberships','donations','projects','news']
  loop
    execute format(
      'drop trigger if exists set_updated_at on %I; create trigger set_updated_at before update on %I for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
create index if not exists idx_memberships_supporter on memberships (supporter_id);
create index if not exists idx_donations_supporter on donations (supporter_id);
create index if not exists idx_donation_payments_donation on donation_payments (donation_id);
create index if not exists idx_admin_notes_supporter on admin_notes (supporter_id);
create index if not exists idx_supporters_email on supporters (email);
create index if not exists idx_projects_status on projects (status);
create index if not exists idx_news_status_published on news (status, published_at desc);

-- ---------------------------------------------------------------------------
-- Admin-check helpers (SECURITY DEFINER so they can read admin_users
-- without the caller needing direct SELECT rights on it, avoiding RLS
-- recursion on admin_users' own policies).
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admin_users where id = auth.uid());
$$;

create or replace function public.current_admin_role()
returns admin_role
language sql
stable
security definer
set search_path = public
as $$
  select role from admin_users where id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table admin_users enable row level security;
alter table supporters enable row level security;
alter table profiles enable row level security;
alter table memberships enable row level security;
alter table donations enable row level security;
alter table donation_payments enable row level security;
alter table privacy_consents enable row level security;
alter table admin_notes enable row level security;
alter table audit_logs enable row level security;
alter table projects enable row level security;
alter table news enable row level security;

-- admin_users: admins can see the roster; only a super_admin can change it.
-- (The very first admin_users row has to be inserted via the Supabase
-- dashboard's Table Editor or service_role — there's no public sign-up path
-- into this table, by design.)
drop policy if exists admin_users_select on admin_users;
create policy admin_users_select on admin_users
  for select using (is_admin());

drop policy if exists admin_users_write on admin_users;
create policy admin_users_write on admin_users
  for all using (current_admin_role() = 'super_admin')
  with check (current_admin_role() = 'super_admin');

-- profiles
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles
  for select using (id = auth.uid() or is_admin());

drop policy if exists profiles_insert on profiles;
create policy profiles_insert on profiles
  for insert with check (id = auth.uid());

drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles
  for update using (id = auth.uid() or is_admin());

-- supporters: anyone can submit an application (insert); reading is
-- restricted to admins or the supporter's own linked profile.
drop policy if exists supporters_insert on supporters;
create policy supporters_insert on supporters
  for insert with check (true);

drop policy if exists supporters_select on supporters;
create policy supporters_select on supporters
  for select using (
    is_admin()
    or exists (select 1 from profiles p where p.supporter_id = supporters.id and p.id = auth.uid())
  );

drop policy if exists supporters_update on supporters;
create policy supporters_update on supporters
  for update using (
    is_admin()
    or exists (select 1 from profiles p where p.supporter_id = supporters.id and p.id = auth.uid())
  );

-- memberships
drop policy if exists memberships_insert on memberships;
create policy memberships_insert on memberships
  for insert with check (true);

drop policy if exists memberships_select on memberships;
create policy memberships_select on memberships
  for select using (
    is_admin()
    or exists (select 1 from profiles p where p.supporter_id = memberships.supporter_id and p.id = auth.uid())
  );

drop policy if exists memberships_update on memberships;
create policy memberships_update on memberships
  for update using (is_admin()) with check (is_admin());

-- donations
drop policy if exists donations_insert on donations;
create policy donations_insert on donations
  for insert with check (true);

drop policy if exists donations_select on donations;
create policy donations_select on donations
  for select using (
    is_admin()
    or exists (select 1 from profiles p where p.supporter_id = donations.supporter_id and p.id = auth.uid())
  );

drop policy if exists donations_update on donations;
create policy donations_update on donations
  for update using (is_admin()) with check (is_admin());

-- donation_payments: admin manages entirely; a supporter may read their own.
drop policy if exists donation_payments_admin_all on donation_payments;
create policy donation_payments_admin_all on donation_payments
  for all using (is_admin()) with check (is_admin());

drop policy if exists donation_payments_select_own on donation_payments;
create policy donation_payments_select_own on donation_payments
  for select using (
    exists (
      select 1 from donations d
      join profiles p on p.supporter_id = d.supporter_id
      where d.id = donation_payments.donation_id and p.id = auth.uid()
    )
  );

-- privacy_consents
drop policy if exists privacy_consents_insert on privacy_consents;
create policy privacy_consents_insert on privacy_consents
  for insert with check (true);

drop policy if exists privacy_consents_select on privacy_consents;
create policy privacy_consents_select on privacy_consents
  for select using (
    is_admin()
    or exists (select 1 from profiles p where p.supporter_id = privacy_consents.supporter_id and p.id = auth.uid())
  );

-- admin_notes: admin-only, full stop.
drop policy if exists admin_notes_admin_all on admin_notes;
create policy admin_notes_admin_all on admin_notes
  for all using (is_admin()) with check (is_admin());

-- audit_logs: any admin can write (logging their own action); only
-- super_admin/manager can read the log.
drop policy if exists audit_logs_insert on audit_logs;
create policy audit_logs_insert on audit_logs
  for insert with check (is_admin());

drop policy if exists audit_logs_select on audit_logs;
create policy audit_logs_select on audit_logs
  for select using (current_admin_role() in ('super_admin', 'manager'));

-- projects: public can read published rows; admin can read/write everything.
drop policy if exists projects_select on projects;
create policy projects_select on projects
  for select using (status = 'published' or is_admin());

drop policy if exists projects_insert on projects;
create policy projects_insert on projects
  for insert with check (is_admin());

drop policy if exists projects_update on projects;
create policy projects_update on projects
  for update using (is_admin()) with check (is_admin());

drop policy if exists projects_delete on projects;
create policy projects_delete on projects
  for delete using (is_admin());

-- news: same shape as projects.
drop policy if exists news_select on news;
create policy news_select on news
  for select using (status = 'published' or is_admin());

drop policy if exists news_insert on news;
create policy news_insert on news
  for insert with check (is_admin());

drop policy if exists news_update on news;
create policy news_update on news
  for update using (is_admin()) with check (is_admin());

drop policy if exists news_delete on news;
create policy news_delete on news
  for delete using (is_admin());
