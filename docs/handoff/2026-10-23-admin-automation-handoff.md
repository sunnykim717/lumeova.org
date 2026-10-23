# 인계 메모: 관리자 자동화 · 공개 사이트 내용 갱신

- 작성일: 2026-10-23
- 저장소: `sunnykim717/lumeova.org`
- 작업 브랜치: `claude/cool-brown-hk43uj` (main에는 머지하지 않았고 PR도 만들지 않았습니다)
- 최신 커밋: `9d5045a`
- 설계 문서: `docs/superpowers/specs/2026-10-21-admin-automation-and-site-content-design.md`

---

## 1. 지금 상태 요약

| 영역 | 상태 |
|---|---|
| 설계 문서 | 완료, 승인됨 |
| 코드 (1A–1D, 2A–2C) | 브랜치에 push 완료 |
| 타입 검사 (`tsc --noEmit`) | 통과 |
| 린트 (`npm run lint`) | 통과 |
| 빌드 (`npm run build`) | 통과 |
| 마이그레이션 `0002` 로컬 검증 | 통과 (로컬 Postgres 16, 22개 항목) |
| 실제 Supabase에 `0002` 적용 | **안 함** |
| main 머지 / PR / 배포 | **안 함** |
| 환경 변수 · GitHub 시크릿 설정 | **안 함** |
| 신한은행 거래내역 CSV 샘플 | **아직 없음** |

**요약:** 코드는 준비되었지만 운영에는 아직 반영되지 않았습니다. 운영 반영에는 사용자 결정이 필요합니다.

---

## 2. 구현 범위

### 관리자 (1A–1D)
- **입금 대조** (`/admin/donations/import`)
  - 은행 거래내역 CSV 업로드, 중복 저장 방지(dedupe key)
  - 후보 등급: `확인 추천` / `검토 필요` / `매칭 없음`
  - 자동 확정 없음. 사람이 고른 항목만 `confirm_bank_matches()`로 한 트랜잭션에 확정
  - 금액이 다르면 사유 입력 필수
- **회원 점검 + 일괄 승인** (`/admin/members`)
  - 필수값, 중복 의심, 동일인 승인 이력, 생년월일(정회원) 점검 표시
  - 일괄 승인은 **일반회원 + 점검 전부 통과**만 대상. 정회원은 한 건씩
  - 서버에서 점검을 다시 계산
- **소식·사업 등록**
  - 시작 틀(템플릿), 제목으로 슬러그 제안, 발행 전 체크리스트
  - 발행 시 사진·실명 동의 확인 필수 (서버에서도 강제)
- **대시보드**
  - "입금 미확인 후원" 링크가 실제로 필터링됨
  - 공개 통계 패널 (숨기기 / 다시 공개 / 지금 갱신)

### 공개 사이트 (2A–2C)
- **시트 → 소식 동기화**
  - API: `POST /api/cron/sync-news` (Bearer `CRON_SECRET` 필요, 상수 시간 비교)
  - 스케줄: `.github/workflows/sync-news.yml` (매일 09:00 KST)
  - 관리자가 고친 행은 잠금되어 시트가 덮어쓰지 않음
  - **추가 규칙(설계 문서에 없던 부분):** 시트에서 `published`로 게시하려면 `consent` 열에 `Y`가 필요함
  - 개인정보 열이 있으면 동기화 전체 중단
- **공개 통계** (`site_stats`)
  - 승인 회원 수, 후원 참여자 수, 누적 확정 후원액(만 원 단위 내림), 발행 소식 수
  - 최소 인원 10명 미만이면 공개하지 않음 ("준비중" 유지)
  - 공개 페이지는 `site_stats`만 읽음 (개인 테이블 직접 조회 없음)

---

## 3. 마이그레이션 `0002` (실제 DB 적용 전 확인)

파일: `supabase/migrations/0002_admin_automation.sql`

추가되는 것:
- `donation_payments`: 후원당 확정 1건 (부분 유니크 인덱스)
- `bank_transactions` 테이블 (관리자만 접근)
- `confirm_bank_matches(jsonb)` 함수 (SECURITY INVOKER, anon 실행 불가)
- `news`: `external_id`, `source`, `source_synced_at`, `admin_locked`, `consent_confirmed_at`
- `projects.consent_confirmed_at`
- `sync_runs` 테이블 (관리자 읽기)
- `site_stats` 테이블 + `refresh_site_stats()` 함수 (anon 실행 불가)

**적용 순서:** `0001`이 이미 적용되어 있어야 합니다. 그 다음 `0002`를 실행합니다. 이 파일은 `0001`을 수정하지 않습니다.

---

## 4. 집 컴퓨터에서 이어서 하는 방법

```bash
git clone https://github.com/sunnykim717/lumeova.org.git
cd lumeova.org
git checkout claude/cool-brown-hk43uj
git pull
npm ci
npx tsc --noEmit
npm run lint
npm run build
```

로컬 DB 검증을 다시 하려면 Postgres 16이 필요합니다. 검증 스텁은 이 세션의 `/var/tmp/pgtest/stub.sql`과 `verify.sql`에 있었지만, 이 파일들은 저장소 밖에 있어서 집 컴퓨터에는 없습니다. 필요하면 `auth` 스키마, `anon` / `authenticated` / `service_role` 역할, `auth.uid()` 최소 스텁을 다시 만들면 됩니다.

---

## 5. 환경 변수와 시크릿 (아직 설정 안 함)

**서버 (`.env.local` 또는 호스팅 환경 변수):**
- `NEWS_SHEET_CSV_URL` — 공개 시트의 "웹에 게시" CSV URL
- `CRON_SECRET` — 긴 무작위 값 (예: `openssl rand -hex 32`)
- `SUPABASE_SERVICE_ROLE_KEY` — 동기화 전용, 서버에서만 사용

**GitHub 저장소:**
- Secret: `CRON_SECRET` (서버와 같은 값)
- Variable: `SITE_URL` (예: `https://lumeova.org`)

---

## 6. 결정이 필요한 것

1. **운영 반영 방식**
   - (a) PR 생성 후 리뷰
   - (b) main 머지 후 배포
   - 최초 지시에서 main 직접 머지는 금지했으므로, (b)는 명시적 허락이 필요합니다.
2. **실제 Supabase에 `0002` 적용**
   - SQL Editor에서 직접 실행하거나, 접근 권한을 주면 실행을 도울 수 있습니다.
   - 실행 전 `0001` 적용 여부를 먼저 확인해야 합니다.
3. **신한은행 거래내역 CSV 샘플 (마스킹본)**
   - 파서의 열 이름(거래일시, 입금액, 보낸분/받는분, 적요)은 추정값입니다.
   - 샘플이 없으면 입금 대조가 실제 파일에서 작동하는지 검증할 수 없습니다.
4. **보유 기간 자동 삭제 (설계 §8.4, 기본값 1년)**
   - 설계에는 있지만 구현하지 않았습니다. 구현할지 결정이 필요합니다.
5. **EUC-KR 디코딩**
   - `TextDecoder('euc-kr')`가 배포 대상(Cloudflare Workers)에서 동작하는지 확인이 필요합니다.

---

## 7. 알려진 한계

- 설계 §7 원칙("샘플 없이 파서 구현 안 함")과 달리, 샘플 없이 파서를 먼저 구현했습니다. 실제 샘플로 반드시 검증해야 합니다.
- 회원 목록과 일괄 승인 점검은 supporters 전체를 읽습니다. 소규모 조직에는 충분하지만 데이터가 커지면 조회 최적화가 필요합니다.
- 공개 통계 값은 설계대로 자동 공개 후 관리자가 숨길 수 있습니다. 자동 공개 여부는 §8.9에서 기본값으로 정했습니다.
- 개인정보처리방침 초안(`2026-09-draft`)은 은행 거래내역 처리와 집계 공개 목적을 아직 반영하지 않았습니다.

---

## 8. 다음 작업 제안 (순서)

1. 위 6번 결정 사항에 답하기
2. (필요 시) 마스킹된 CSV 샘플 준비 → 파서 열 이름 맞추기 및 테스트
3. `0002`를 실제 Supabase에 적용 → 간단한 스모크 테스트 (관리자 로그인, 점검 화면, 통계 갱신)
4. 환경 변수와 GitHub 시크릿 설정 → 시트 동기화 수동 실행 (`workflow_dispatch`)
5. 승인되면 PR 생성 및 리뷰, 이후 배포
