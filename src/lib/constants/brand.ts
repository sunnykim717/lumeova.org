/**
 * Brand / organization constants.
 *
 * IMPORTANT — per project ground rule (spec §48): never invent facts about the
 * organization. Every value below is either (a) confirmed by the org directly,
 * or (b) explicitly marked TODO. Do not fill in a TODO with a plausible-sounding
 * guess — leave it for an admin/editor to supply.
 *
 * Single source of truth for:
 *   - Mission / Vision (Section 2)
 *   - Core Values (Section 3)
 *   - Brand hierarchy / CI messaging (Section 6)
 *   - Contact email (Section 23)
 * Import from here — never hardcode these strings in page components.
 */

export const ORG = {
  nameKo: "미래를여는빛",
  nameEn: "Lumeova International",
  sloganKo: "교육으로 미래를 열어가겠습니다.",
  sloganEn: "Opening the Future Through Education",

  // § Brand Story / CI messaging (Section 6)
  brandStoryTitle: "LUMEOVA — 빛으로 새로운 미래를 열다",
  supportingCiMessage: "빛으로 연결하고, 함께 성장하는 미래",

  // § Mission & Vision — single source of truth (Section 2)
  // These exact strings are used in about/page.tsx and any other component that
  // displays them. Edit here only; do NOT duplicate these in page files.
  mission:
    "교육을 통해 한 사람이 자신의 가능성을 발견하고, 스스로 선택하며 미래를 만들어 갈 수 있는 기회를 넓혀갑니다.",
  vision:
    "배움의 기회가 환경과 지역의 한계를 넘어 누구에게나 새로운 가능성으로 이어지는 사회를 만들어갑니다.",
  // § 단체 소개 — 사람 중심 메시지 (about page, before Mission · Vision)
  statement: {
    eyebrow: "미래를여는빛 | LUMEOVA International",
    title: "사람이 먼저, 사람이 중심인 세상",
    paragraphs: [
      "미래를여는빛(LUMEOVA International)은 사람을 소중히 여기고, 모든 사람이 서로 존중하며 행복하게 살아갈 수 있는 세상을 만들기 위해 설립된 비영리단체입니다.",
      "우리는 단체의 존재나 사업의 확대 자체를 목적으로 삼지 않습니다. 모든 활동의 출발점은 사람이며, 그 중심에도 언제나 사람이 있어야 한다고 믿습니다.",
      "사람은 누구나 존중받아야 하며, 자신이 살아가는 사회에서 행복을 추구하고 더 나은 미래를 만들어 갈 수 있어야 합니다. 그러나 국가와 지역에 따라 교육과 자원, 사회적 기회의 차이가 존재하며, 이러한 차이는 개인의 삶뿐 아니라 지역사회와 국가의 발전에도 영향을 미칩니다.",
      "미래를여는빛은 다양한 국가에서 축적한 현장 경험을 바탕으로, 전문성을 갖춘 활동가들이 현지 주민들과 함께 그 사회에 필요한 변화를 만들어 가고자 합니다.",
      "우리는 외부의 시각으로 문제를 규정하거나 일방적으로 해결책을 제시하지 않습니다. 현지의 문화와 사회적 환경을 이해하고, 그곳에서 살아가는 사람들의 경험과 의견을 존중하며, 주민들과 함께 필요한 사업을 기획하고 실행합니다.",
      "교육과 역량 강화, 지역사회 협력 등 다양한 활동은 이러한 변화를 만들어 가는 수단입니다. 중요한 것은 사업의 종류나 규모가 아니라, 그 활동이 사람들의 삶에 실질적인 도움이 되고 지역사회에 지속적인 변화를 남기는가 하는 점입니다.",
      "우리는 한 사람의 행복과 성장이 가족과 이웃의 변화로 이어지고, 지역사회가 스스로 문제를 해결할 수 있는 힘을 키우며, 궁극적으로는 그 나라의 지속가능한 발전에 기여하기를 바랍니다.",
    ],
    closing: "사람을 위해 사업을 만들고, 사람과 함께 변화를 이루며, 그 변화가 국가의 미래로 이어지도록.",
    final: "미래를여는빛은 사람을 중심에 두고, 현지 주민들과 함께 더 나은 미래를 만들어 갑니다.",
  },

  // § Core Values — typography-only, no icons (Section 3)
  // Rendered as spaced text + subtle dividers; no card/icon UI.
  coreValues: [
    {
      id: "opportunity",
      titleKo: "빛",
      titleEn: "Opportunity",
      body: "교육을 통해 새로운 선택과 가능성의 출발점을 만듭니다.",
    },
    {
      id: "people",
      titleKo: "사람",
      titleEn: "People",
      body: "사업보다 사람을 먼저 보고, 현장의 목소리에서 시작합니다.",
    },
    {
      id: "trust",
      titleKo: "신뢰",
      titleEn: "Trust",
      body: "확인된 사실을 바탕으로 투명하게 운영하고, 약속한 일을 책임 있게 수행합니다.",
    },
  ] as const,

  // Confirmed via chat with the org (2026):
  legalForm: "비영리 임의단체",
  representative: "김선희",
  founded: "2026년, 창립회원 3인",
  // NOTE: this is a different, currently-unconfirmed home base than the address
  // used on the old placeholder lumeova.org site — do not merge without asking.
  region: "인천광역시 계양구",

  // Public contact email confirmed (Section 23):
  email: "lumeova.int@gmail.com",

  // --- Not yet confirmed — do not fabricate, leave as TODO ---
  address: null as string | null, // TODO: full mailing address
  phone: "+82-10-2543-3659",
  representativeBio: null as string | null, // TODO
  history: [
    { year: "2026년 8월", event: "비영리임의단체 등록" },
  ] as { year: string; event: string }[],
  beneficiaryCount: null as string | null, // TODO — never display a number that wasn't given by the org
  partnerOrgs: [] as string[], // TODO
  awards: [] as string[], // TODO
  overseasCountries: [] as string[], // TODO — country list intentionally left empty (not yet confirmed for public site)
} as const;

export const DONATION_ACCOUNT = {
  bank: "신한은행",
  accountNumber: "140-016-493556",
  holder: "미래를여는빛",
} as const;

export const BRAND_COLORS = {
  gold: "#D4AF37",
  goldDark: "#B8952C",
  navy: "#0D1B2A",
  navyLight: "#16283C",
  cream: "#F7F4EE",
  sky: "#D6E2EC",
  sage: "#E6EFE6",
  ink: "#1F2430",
  muted: "#5C6672",
  border: "#E8E0CD",
} as const;

export const SITE_URL = "https://lumeova.org";
