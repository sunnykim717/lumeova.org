-- Lumeova International — 정회원 모집 현황 집계 기준 변경.
--
-- 후원자는 정회원과 같은 지위로 보고, 목표는 승인된 정회원 100명입니다.
-- 집계 기준을 정기후원 입금 확인에서 정회원 승인 건수로 바꿉니다.
-- 함수 이름은 앱 코드와 맞추기 위해 그대로 둡니다.
-- Only the count is exposed publicly; the membership rows stay behind RLS.

create or replace function public.regular_supporter_count()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct m.supporter_id)::integer
  from memberships m
  where m.membership_type = 'regular'
    and m.status = 'approved';
$$;

grant execute on function public.regular_supporter_count() to anon, authenticated;
