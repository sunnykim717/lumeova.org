-- Lumeova International — CMS foundation (phase 1).
--
-- 1. Soft delete (휴지통) for news, projects, and field stories.
-- 2. Role-based write rules. Roles come from admin_users.role:
--      super_admin, manager  → full content and settings access
--      staff                 → may create and edit drafts only
--      viewer                → read only (no writes at all)
-- 3. Members, donations, and payments writes are limited to non-viewer admins.
--
-- Not run by the app. Review, then run in the Supabase SQL Editor.
-- Existing data is not changed; only columns and policies are added or replaced.

-- ---------------------------------------------------------------------------
-- Soft delete columns
-- ---------------------------------------------------------------------------
alter table news add column if not exists deleted_at timestamptz;
alter table projects add column if not exists deleted_at timestamptz;
alter table field_stories add column if not exists deleted_at timestamptz;

-- ---------------------------------------------------------------------------
-- Role helpers (SECURITY DEFINER, same pattern as is_admin())
-- ---------------------------------------------------------------------------
create or replace function public.admin_can_write()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and role in ('super_admin', 'manager', 'staff')
  );
$$;

create or replace function public.admin_can_publish()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and role in ('super_admin', 'manager')
  );
$$;

-- ---------------------------------------------------------------------------
-- Content tables: public reads skip trashed rows; staff write drafts only.
-- ---------------------------------------------------------------------------
drop policy if exists news_select on news;
create policy news_select on news
  for select using ((status = 'published' and deleted_at is null) or is_admin());

drop policy if exists news_insert on news;
create policy news_insert on news
  for insert with check (
    admin_can_publish() or (admin_can_write() and status = 'draft' and deleted_at is null)
  );

drop policy if exists news_update on news;
create policy news_update on news
  for update using (
    admin_can_publish() or (admin_can_write() and status = 'draft')
  ) with check (
    admin_can_publish() or (admin_can_write() and status = 'draft' and deleted_at is null)
  );

drop policy if exists news_delete on news;
create policy news_delete on news
  for delete using (admin_can_publish());

drop policy if exists projects_select on projects;
create policy projects_select on projects
  for select using ((status = 'published' and deleted_at is null) or is_admin());

drop policy if exists projects_insert on projects;
create policy projects_insert on projects
  for insert with check (
    admin_can_publish() or (admin_can_write() and status = 'draft' and deleted_at is null)
  );

drop policy if exists projects_update on projects;
create policy projects_update on projects
  for update using (
    admin_can_publish() or (admin_can_write() and status = 'draft')
  ) with check (
    admin_can_publish() or (admin_can_write() and status = 'draft' and deleted_at is null)
  );

drop policy if exists projects_delete on projects;
create policy projects_delete on projects
  for delete using (admin_can_publish());

drop policy if exists field_stories_select on field_stories;
create policy field_stories_select on field_stories
  for select using (
    (status = 'published' and privacy_reviewed and deleted_at is null) or is_admin()
  );

drop policy if exists field_stories_insert on field_stories;
create policy field_stories_insert on field_stories
  for insert with check (
    admin_can_publish() or (admin_can_write() and status = 'draft' and deleted_at is null)
  );

drop policy if exists field_stories_update on field_stories;
create policy field_stories_update on field_stories
  for update using (
    admin_can_publish() or (admin_can_write() and status = 'draft')
  ) with check (
    admin_can_publish() or (admin_can_write() and status = 'draft' and deleted_at is null)
  );

drop policy if exists field_stories_delete on field_stories;
create policy field_stories_delete on field_stories
  for delete using (admin_can_publish());

-- Homepage content: managers and super admins only.
drop policy if exists site_content_admin_write on site_content;
create policy site_content_admin_write on site_content
  for all using (admin_can_publish()) with check (admin_can_publish());

-- ---------------------------------------------------------------------------
-- Members, donations, and payments: viewers can read, not write.
-- ---------------------------------------------------------------------------
drop policy if exists memberships_update on memberships;
create policy memberships_update on memberships
  for update using (admin_can_write()) with check (admin_can_write());

drop policy if exists donations_update on donations;
create policy donations_update on donations
  for update using (admin_can_write()) with check (admin_can_write());

drop policy if exists donation_payments_admin_all on donation_payments;

drop policy if exists donation_payments_admin_select on donation_payments;
create policy donation_payments_admin_select on donation_payments
  for select using (is_admin());

drop policy if exists donation_payments_admin_write on donation_payments;
create policy donation_payments_admin_write on donation_payments
  for insert with check (admin_can_write());

drop policy if exists donation_payments_admin_update on donation_payments;
create policy donation_payments_admin_update on donation_payments
  for update using (admin_can_write()) with check (admin_can_write());

drop policy if exists donation_payments_admin_delete on donation_payments;
create policy donation_payments_admin_delete on donation_payments
  for delete using (admin_can_publish());

-- The donor's own read access (donation_payments_select_own) is unchanged.
