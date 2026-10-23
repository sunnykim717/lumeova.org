-- Lumeova International — 현장 이야기 (field stories).
--
-- Stories from the field, entered by admins. A story is public only when it is
-- published AND its privacy review is complete. Photos carry their own consent
-- flag; the public page shows only photos whose consent is true.
-- Run manually in the Supabase SQL Editor. Not run by the app.

create table if not exists field_stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  country text,
  period text not null default 'post_founding'
    check (period in ('past', 'post_founding')),
  activity_date date,
  summary text,
  body text,
  photos jsonb not null default '[]'::jsonb,
  status content_status not null default 'draft',
  source text not null default 'manual'
    check (source in ('manual', 'band')),
  band_url text,
  has_personal_info boolean not null default false,
  privacy_reviewed boolean not null default false,
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on field_stories;
create trigger set_updated_at before update on field_stories
  for each row execute function public.set_updated_at();

create index if not exists idx_field_stories_public
  on field_stories (status, published_at desc);
create index if not exists idx_field_stories_country on field_stories (country);

alter table field_stories enable row level security;

drop policy if exists field_stories_select on field_stories;
create policy field_stories_select on field_stories
  for select using ((status = 'published' and privacy_reviewed) or is_admin());

drop policy if exists field_stories_insert on field_stories;
create policy field_stories_insert on field_stories
  for insert with check (is_admin());

drop policy if exists field_stories_update on field_stories;
create policy field_stories_update on field_stories
  for update using (is_admin()) with check (is_admin());

drop policy if exists field_stories_delete on field_stories;
create policy field_stories_delete on field_stories
  for delete using (is_admin());
