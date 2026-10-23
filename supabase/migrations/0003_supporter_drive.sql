-- Lumeova International — 상시후원자 모집 (regular supporter drive).
--
-- Run after 0002_site_content.sql. A "상시후원자" (regular supporter) is a
-- supporter with an active 정기후원 donation that has at least one payment
-- the admin has confirmed. Only the count is exposed publicly, through this
-- function; the underlying supporter rows stay behind RLS.

create or replace function public.regular_supporter_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct d.supporter_id)::integer
  from donations d
  where d.donation_type = 'recurring'
    and d.status = 'active'
    and exists (
      select 1
      from donation_payments p
      where p.donation_id = d.id
        and p.status = 'confirmed'
    );
$$;

grant execute on function public.regular_supporter_count() to anon, authenticated;
