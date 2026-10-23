/** 변경 이력에 보여 줄 한국어 작업명. 목록에 없는 작업은 "기타 작업"으로 표시합니다. */
const AUDIT_LABELS: Record<string, string> = {
  membership_approved: "회원 승인",
  membership_rejected: "회원 거절",
  membership_inactive: "회원 비활성",
  membership_withdrawn: "회원 탈퇴",
  membership_pending: "회원 승인 대기",
  donation_payment_confirmed: "입금 확인",
  donation_payment_pending: "입금 대기",
  donation_payment_unpaid: "미입금 처리",
  donation_payment_cancelled: "입금 취소",
  donation_active: "후원 진행",
  donation_completed: "후원 종료",
  donation_cancelled: "후원 취소",
  project_created: "사업 등록",
  project_updated: "사업 수정",
  project_trashed: "사업 휴지통 이동",
  project_restored: "사업 복구",
  project_purged: "사업 영구 삭제",
  news_created: "소식 등록",
  news_updated: "소식 수정",
  news_trashed: "소식 휴지통 이동",
  news_restored: "소식 복구",
  news_purged: "소식 영구 삭제",
  field_story_created: "현장 이야기 등록",
  field_story_updated: "현장 이야기 수정",
  field_story_imported: "BAND 글 가져오기",
  field_story_trashed: "현장 이야기 휴지통 이동",
  field_story_restored: "현장 이야기 복구",
  field_story_purged: "현장 이야기 영구 삭제",
  site_content_updated: "홈 화면 콘텐츠 수정",
  supporters_exported: "후원자 명단 내려받기",
};

const TARGET_LABELS: Record<string, string> = {
  membership: "회원",
  donation: "후원",
  donation_payment: "입금 내역",
  project: "사업",
  news: "소식",
  field_story: "현장 이야기",
  site_content: "홈 화면",
  supporter: "후원자",
};

export function auditActionLabel(action: string): string {
  return AUDIT_LABELS[action] ?? "기타 작업";
}

export function auditTargetLabel(targetType: string): string {
  return TARGET_LABELS[targetType] ?? targetType;
}
