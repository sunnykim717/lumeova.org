-- Lumeova International — editable homepage content.
--
-- Run after 0001_init.sql. Each row holds one homepage section as JSON
-- (see src/lib/constants/siteContent.ts for the shape). Public visitors can
-- read the rows; only admins can write them. The app falls back to the
-- built-in defaults whenever a row is missing, so this migration is safe to
-- run before any content has been saved.

create table if not exists site_content (
  key text primary key check (key in ('hero', 'about_summary', 'what_we_do', 'get_involved')),
  value jsonb not null default '{}'::jsonb,
  updated_by uuid references admin_users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at on site_content;
create trigger set_updated_at before update on site_content
  for each row execute function public.set_updated_at();

alter table site_content enable row level security;

drop policy if exists site_content_select on site_content;
create policy site_content_select on site_content
  for select using (true);

drop policy if exists site_content_admin_write on site_content;
create policy site_content_admin_write on site_content
  for all using (is_admin()) with check (is_admin());
