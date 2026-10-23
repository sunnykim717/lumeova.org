import { ORG, DONATION_ACCOUNT } from "@/lib/constants/brand";

/**
 * Editable homepage content. The defaults below are what the homepage shows
 * until an admin saves a version in /admin/content (stored in the
 * `site_content` table, see supabase/migrations/0002_site_content.sql).
 *
 * Keep the shapes here in sync with SECTIONS: the admin form is generated from
 * SECTIONS, and sanitizeSection() only keeps the fields it lists.
 */

export type HeroSlide = {
  src: string;
  alt: string;
  objectPosition: string;
  title: string;
  desc: string;
};

export type AboutContent = {
  eyebrow: string;
  title: string;
  body1: string;
  body2: string;
};

export type WhatWeDoItem = {
  no: string;
  title: string;
  body: string;
};

export type WhatWeDoContent = {
  eyebrow: string;
  title: string;
  items: WhatWeDoItem[];
};

export type GetInvolvedContent = {
  membershipTitle: string;
  membershipBody: string;
  donateTitle: string;
  donateBody: string;
};

export type HeroContent = {
  slides: HeroSlide[];
};

export type SiteContentMap = {
  hero: HeroContent;
  about_summary: AboutContent;
  what_we_do: WhatWeDoContent;
  get_involved: GetInvolvedContent;
};

export type SiteContentKey = keyof SiteContentMap;

export const SITE_CONTENT_DEFAULTS: SiteContentMap = {
  hero: {
    slides: [
      {
        src: "/images/hero/hero-1.jpg",
        alt: "건물 앞에 모인 아이들",
        objectPosition: "center 25%",
        title: "교육으로 미래를 열어가겠습니다",
        desc: "지속가능한 변화를 만들어가는 교육활동",
      },
      {
        src: "/images/hero/hero-2.jpg",
        alt: "현장 활동 지역 풍경",
        objectPosition: "center center",
        title: "교육으로 미래를 열어가겠습니다",
        desc: "직접 발로 뛰며 지역의 필요를 함께 찾아갑니다",
      },
      {
        src: "/images/hero/hero-3.jpg",
        alt: "교실에서 수업에 참여하는 아이들",
        objectPosition: "center 55%",
        title: "교육으로 미래를 열어가겠습니다",
        desc: "아이 한 명의 성장이 공동체 전체를 밝게 합니다",
      },
    ],
  },
  about_summary: {
    eyebrow: `About ${ORG.nameEn}`,
    title: `${ORG.nameKo}은 어떤 단체인가요`,
    body1: `${ORG.nameKo}(${ORG.nameEn})은 국제개발협력 현장 경험을 바탕으로 설립된 비영리단체로, 교육을 통해 지속가능한 변화를 만들어가고자 합니다.`,
    body2: "단체의 설립 목적과 Mission·Vision은 정관 확정 이후 이 페이지에 함께 안내해 드릴 예정입니다.",
  },
  what_we_do: {
    eyebrow: "What We Do",
    title: "우리가 하는 일",
    items: [
      {
        no: "01",
        title: "국제개발협력",
        body: "해외 현장 경험을 바탕으로, 지역사회와 함께 지속가능한 변화를 만들어가는 사업을 준비하고 있습니다.",
      },
      {
        no: "02",
        title: "교육",
        body: "교육이라는 기회를 통해 더 나은 미래로 나아갈 수 있도록 지원하는 것을 활동의 중심에 둡니다.",
      },
      {
        no: "03",
        title: "지역사회 협력",
        body: "현지 단체와의 협력을 바탕으로, 현장의 목소리가 실제 사업에 반영되는 방식으로 활동합니다.",
      },
    ],
  },
  get_involved: {
    membershipTitle: "함께하는 방법",
    membershipBody: "정회원 또는 일반회원으로 함께해 주세요. 정회원 신청은 관리자 확인 후 승인됩니다.",
    donateTitle: "후원 안내",
    donateBody: "정기·단기·일시후원 중 원하시는 방식으로 참여하실 수 있습니다. 현재는 계좌이체로 후원을 받고 있습니다.",
  },
};

/** Account line shown under the donate card; kept out of the editable text. */
export const DONATE_ACCOUNT_LINE = `${DONATION_ACCOUNT.bank} ${DONATION_ACCOUNT.accountNumber} (${DONATION_ACCOUNT.holder})`;

export type FieldDef = {
  name: string;
  label: string;
  multiline?: boolean;
};

export type ListDef = {
  name: string;
  label: string;
  fields: FieldDef[];
};

export type SectionDef = {
  key: SiteContentKey;
  label: string;
  description: string;
  fields: FieldDef[];
  lists: ListDef[];
};

export const SECTIONS: SectionDef[] = [
  {
    key: "hero",
    label: "메인 슬라이드",
    description: "첫 화면의 사진 슬라이드입니다. 이미지 경로는 /images/hero/ 아래 파일을 사용합니다.",
    fields: [],
    lists: [
      {
        name: "slides",
        label: "슬라이드",
        fields: [
          { name: "src", label: "이미지 경로 (예: /images/hero/hero-1.jpg)" },
          { name: "alt", label: "이미지 설명" },
          { name: "objectPosition", label: "초점 위치 (예: center 25%)" },
          { name: "title", label: "제목" },
          { name: "desc", label: "설명", multiline: true },
        ],
      },
    ],
  },
  {
    key: "about_summary",
    label: "단체 소개 요약",
    description: "홈 중간의 단체 소개 문단입니다.",
    fields: [
      { name: "eyebrow", label: "상단 영문 문구" },
      { name: "title", label: "제목" },
      { name: "body1", label: "첫 번째 문단", multiline: true },
      { name: "body2", label: "두 번째 문단", multiline: true },
    ],
    lists: [],
  },
  {
    key: "what_we_do",
    label: "우리가 하는 일",
    description: "사업 분야 목록입니다. 항목은 추가·삭제·순서 변경이 가능합니다.",
    fields: [
      { name: "eyebrow", label: "상단 영문 문구" },
      { name: "title", label: "제목" },
    ],
    lists: [
      {
        name: "items",
        label: "분야",
        fields: [
          { name: "no", label: "번호 (예: 01)" },
          { name: "title", label: "분야명" },
          { name: "body", label: "설명", multiline: true },
        ],
      },
    ],
  },
  {
    key: "get_involved",
    label: "참여 안내",
    description: "회원 가입과 후원 안내 카드입니다. 후원 계좌 정보는 상수 파일에서 관리합니다.",
    fields: [
      { name: "membershipTitle", label: "회원 카드 제목" },
      { name: "membershipBody", label: "회원 카드 설명", multiline: true },
      { name: "donateTitle", label: "후원 카드 제목" },
      { name: "donateBody", label: "후원 카드 설명", multiline: true },
    ],
    lists: [],
  },
];

const MAX_TEXT_LENGTH = 2000;

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_TEXT_LENGTH) : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Keeps only the fields SECTIONS knows about and coerces them to trimmed
 * strings. Anything else in the submitted payload is dropped.
 */
export function sanitizeSection(key: SiteContentKey, raw: unknown): Record<string, unknown> {
  const section = SECTIONS.find((s) => s.key === key);
  if (!section || !isRecord(raw)) throw new Error("잘못된 콘텐츠 형식입니다.");

  const out: Record<string, unknown> = {};
  for (const field of section.fields) {
    out[field.name] = cleanText(raw[field.name]);
  }
  for (const list of section.lists) {
    const items = Array.isArray(raw[list.name]) ? (raw[list.name] as unknown[]) : [];
    out[list.name] = items.filter(isRecord).map((item) =>
      Object.fromEntries(list.fields.map((field) => [field.name, cleanText(item[field.name])]))
    );
  }
  return out;
}

/**
 * Overlays a stored section onto the defaults. Missing fields fall back to the
 * default text. An empty list falls back to the default list, and slides with
 * no image path are dropped, so the homepage never renders an empty carousel.
 */
export function mergeSection<K extends SiteContentKey>(key: K, stored: unknown): SiteContentMap[K] {
  const defaults = SITE_CONTENT_DEFAULTS[key] as Record<string, unknown>;
  if (!isRecord(stored)) return SITE_CONTENT_DEFAULTS[key];

  const merged: Record<string, unknown> = { ...defaults };
  for (const [name, fallback] of Object.entries(defaults)) {
    const value = stored[name];
    if (Array.isArray(fallback)) {
      const items = Array.isArray(value) ? value.filter(isRecord) : [];
      const usable = key === "hero" ? items.filter((item) => cleanText(item.src) !== "") : items;
      merged[name] = usable.length > 0 ? usable : fallback;
    } else if (typeof value === "string") {
      merged[name] = value;
    }
  }
  return merged as SiteContentMap[K];
}
