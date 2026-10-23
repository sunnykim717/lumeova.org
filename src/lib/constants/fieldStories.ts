export type StoryPeriod = "past" | "post_founding";
export type StoryPhoto = { url: string; caption: string; consent: boolean };

/** 구분: 루메오바 설립 이전의 활동과 설립 이후의 활동을 나눕니다. */
export const STORY_PERIODS: { value: StoryPeriod; label: string }[] = [
  { value: "past", label: "과거 활동" },
  { value: "post_founding", label: "루메오바 설립 이후" },
];

export const STORY_HEADING = "현장 이야기";
export const STORY_LEAD = "현장에서 만나고, 함께 배우며, 마음에 남긴 이야기들.";

export const STORY_STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  published: "공개",
  hidden: "숨김",
};

export function isStoryPeriod(value: unknown): value is StoryPeriod {
  return STORY_PERIODS.some((p) => p.value === value);
}

export function storyPeriodLabel(value: string | null): string {
  return STORY_PERIODS.find((p) => p.value === value)?.label ?? "";
}

const MAX_TEXT = 4000;

function cleanText(value: unknown, max = MAX_TEXT): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Keeps only well-formed photo entries. Paths must be site-relative (/...) or
 * https URLs, so no other scheme can reach the page.
 */
export function sanitizeStoryPhotos(raw: unknown): StoryPhoto[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const record = item as Record<string, unknown>;
    const url = cleanText(record.url, 500);
    if (!(url.startsWith("/") || url.startsWith("https://"))) return [];
    return [{ url, caption: cleanText(record.caption, 200), consent: record.consent === true }];
  });
}

/**
 * Splits text copied from a 네이버 BAND post. The first non-empty line becomes
 * the title and the rest becomes the body, so an admin can paste and correct.
 */
export function parseBandPaste(text: string): { title: string; body: string } {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const firstIndex = lines.findIndex((line) => line.trim() !== "");
  if (firstIndex === -1) return { title: "", body: "" };
  return {
    title: lines[firstIndex].trim().slice(0, 200),
    body: lines.slice(firstIndex + 1).join("\n").trim(),
  };
}
