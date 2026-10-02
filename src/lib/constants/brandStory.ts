/**
 * LUMEOVA Brand Story / CI content.
 *
 * This is the organization's official, confirmed brand copy (greeting,
 * brand story, CI meaning). It is reproduced verbatim from the approved
 * brand guideline — do not summarize, shorten, reword, or invent new
 * meaning when editing this file. If the copy ever needs to change, that
 * change should come from the organization, not from a rewrite here.
 *
 * Kept separate from `constants/brand.ts` (ORG / DONATION_ACCOUNT / colors),
 * which holds the org's factual/identity data. This file holds the
 * longer-form narrative content used on the Brand Story page, the About
 * page's CI section, and the homepage's short brand message.
 */

export const BRAND_NAME = "LUMEOVA";

export const BRAND_MESSAGE = "빛으로 새로운 미래를 열다";

/**
 * Supporting CI concept line, confirmed alongside the main slogan and brand
 * story title in the official CI package. Per that package's own usage
 * rule, this is never displayed at the same headline weight as the Main
 * Slogan or the Brand Story title — use it only as a smaller, secondary
 * line (e.g. a quiet caption near the CI/logo section).
 */
export const SUPPORTING_CI_CONCEPT = "빛으로 연결하고, 함께 성장하는 미래";

/** §5 / §8 visual flow — LUMEN's associated meaning. */
export const LUMEN_MEANING = {
  word: "LUMEN",
  keywords: ["빛", "밝힘", "가능성"],
} as const;

/** §5 / §8 visual flow — NOVA's associated meaning. */
export const NOVA_MEANING = {
  word: "NOVA",
  keywords: ["새로움", "시작", "변화", "미래"],
} as const;

/**
 * §3 — Official brand story / greeting. Confirmed final copy — reproduced
 * in full below, paragraph by paragraph exactly as written. Each entry is
 * one paragraph; "\n" marks a line break the org intentionally placed
 * within that paragraph (preserve it when rendering, e.g. split on "\n").
 */
export const BRAND_STORY_TITLE = "LUMEOVA — 빛으로 새로운 미래를 열다";

export const BRAND_STORY_PARAGRAPHS: string[] = [
  "LUMEOVA는\n라틴어로 빛을 뜻하는 LUMEN과\n새로운 시작과 변화를 상징하는 NOVA에서 영감을 받아 만든 이름입니다.",
  "빛은 누군가의 길을 대신 걸어주지 않습니다.\n다만 자신의 길을 발견하고 앞으로 나아갈 수 있도록 그 길을 밝혀줍니다.",
  "미래를여는빛은 교육도 이와 같다고 생각합니다.",
  "우리가 누군가의 미래를 대신 만들어주는 것이 아니라,\n배움의 기회를 통해 한 사람이 자신의 가능성을 발견하고\n스스로 미래를 만들어 갈 수 있도록 돕는 것.",
  "그것이 LUMEOVA가 추구하는 변화입니다.",
  "한 사람에게 시작된 작은 배움이 새로운 선택이 되고,\n그 선택이 가족과 이웃, 지역사회의 변화로 이어질 수 있도록\n우리는 교육의 기회를 만들고 사람과 사람을 연결합니다.",
  "그래서 LUMEOVA의 빛은 단순한 희망을 의미하지 않습니다.",
  "배울 수 있는 기회,\n스스로 선택할 수 있는 힘,\n그리고 자신의 미래를 만들어 갈 수 있는 가능성.",
  "그것이 우리가 밝히고 싶은 빛입니다.",
];

/** §3 — closing Brand Signature block (used on the Brand Story page and,
 * in a shorter form, by BrandSignature.tsx). */
export const BRAND_SIGNATURE_LINES: string[] = [
  "LUMEOVA",
  "미래를여는빛",
  "교육으로 미래를 열어가겠습니다.",
];

/**
 * §4 — CI 설명용 SHORT VERSION. Used in the About page's compact CI
 * section. Confirmed final copy — reproduced in full.
 */
export const CI_DESCRIPTION_PARAGRAPHS: string[] = [
  "LUMEOVA는 라틴어로 ‘빛’을 뜻하는 LUMEN과\n새로운 시작과 변화를 상징하는 NOVA에서 영감을 받아\n만든 이름입니다.",
  "빛이 길을 밝히듯,\n교육을 통해 한 사람의 가능성을 밝히고\n스스로 새로운 미래를 열어갈 수 있도록 함께한다는\n의미를 담고 있습니다.",
];

/** §5 / §19 — Core Statement, used at the close of the Brand Meaning visual. */
export const CORE_STATEMENT_LINES: string[] = [
  "배울 수 있는 기회,",
  "스스로 선택할 수 있는 힘,",
  "그리고 자신의 미래를 만들어 갈 수 있는 가능성.",
];

/** §19 — Brand Philosophy (one-line distillation of §17's core philosophy). */
export const BRAND_PHILOSOPHY_LINES: string[] = [
  "한 사람의 가능성을 밝히고,",
  "교육으로 새로운 미래를 연다.",
];

/** §11 — HOME 섹션에 쓰는 짧은 문장. Confirmed final copy. */
export const HOME_BRIEF_LINES: string[] = [
  "배움의 기회를 통해",
  "한 사람이 자신의 가능성을 발견하고",
  "스스로 미래를 만들어 갈 수 있도록 함께합니다.",
];

/** §1 — Core Brand Concept keywords. */
export const BRAND_KEYWORDS: string[] = ["빛", "교육", "가능성", "선택", "새로운 시작", "미래"];
