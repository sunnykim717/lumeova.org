/**
 * Authoring aids for news and projects (design §5.3). Pure functions only.
 * Templates are starting text an editor overwrites. Nothing here publishes
 * content on its own.
 */

export const NEWS_TEMPLATES = {
  blank: { label: "빈 문서", body: "" },
  activity: {
    label: "활동 보고",
    body: "## 활동 개요\n\n## 주요 내용\n\n## 함께한 사람들\n\n",
  },
  notice: {
    label: "공지",
    body: "## 안내\n\n## 일정\n\n## 문의\n\n",
  },
} as const;

export const PROJECT_TEMPLATES = {
  blank: { label: "빈 문서", body: "" },
  intro: {
    label: "사업 소개",
    body: "## 배경\n\n## 목표\n\n## 활동 내용\n\n## 진행 현황\n\n",
  },
} as const;

/**
 * URL slug from a title. Korean titles have no ASCII letters, so they fall
 * back to the publish date. Editors can always type their own slug.
 */
export function suggestSlug(title: string, dateIso: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base !== "") return base;
  return dateIso.slice(0, 10);
}

export type ChecklistInput = {
  status: "draft" | "published" | "hidden";
  content: string;
  thumbnail: string | null;
  publishedAt: string | null; // YYYY-MM-DD
  consentChecked: boolean;
  todayIso: string; // YYYY-MM-DD, passed in so the function stays pure
};

export type ChecklistItem = {
  code: "CONSENT" | "THUMBNAIL" | "PLACEHOLDER_TEXT" | "FUTURE_DATE";
  level: "block" | "warn";
  ok: boolean;
  label: string;
};

/**
 * Only the consent item blocks publishing, and only when status is
 * "published". The server enforces the same rule, so this list is advisory
 * for the other items.
 */
export function publishChecklist(input: ChecklistInput): ChecklistItem[] {
  const items: ChecklistItem[] = [
    {
      code: "CONSENT",
      level: "block",
      ok: input.consentChecked,
      label: "사진·실명 게시에 동의를 받았거나 해당 사항이 없습니다",
    },
    {
      code: "THUMBNAIL",
      level: "warn",
      ok: Boolean(input.thumbnail),
      label: "썸네일이 없으면 플레이스홀더가 표시됩니다",
    },
    {
      code: "PLACEHOLDER_TEXT",
      level: "warn",
      ok: !/준비\s*중|TODO/i.test(input.content),
      label: "본문에 '준비중' 또는 'TODO' 문구가 있습니다",
    },
    {
      code: "FUTURE_DATE",
      level: "warn",
      ok: !input.publishedAt || input.publishedAt <= input.todayIso,
      label: "게시일이 미래 날짜입니다",
    },
  ];
  return items;
}

/** Items that must pass before the server will store status "published". */
export function blockingFailures(items: ChecklistItem[], status: ChecklistInput["status"]): ChecklistItem[] {
  if (status !== "published") return [];
  return items.filter((i) => i.level === "block" && !i.ok);
}
