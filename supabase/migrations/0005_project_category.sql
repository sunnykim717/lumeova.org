-- Lumeova International — 사업 영역 (교육지원 / 리더십지원).
--
-- Each 사업 (project) belongs to one area. Rows without an area stay visible
-- under 전체. Public readers already have select access to published rows
-- through the existing projects policies, so no policy changes are needed.

alter table projects
  add column if not exists category text
  check (category in ('education_support', 'leadership_support'));

create index if not exists idx_projects_category on projects (category);
