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
    "현장의 목소리와 전문성을 연결하여, 함께 성장하고 더 나은 미래를 만들어 갑니다.",
  missionBody:
    "우리는 각 나라의 문화와 환경을 이해하고, 현지 주민들과 함께 실질적으로 필요한 사업을 기획하고 실행합니다. 교육과 협력, 역량 강화를 통해 삶의 질을 높이고 지속적인 발전의 기반을 마련합니다.",
  vision:
    "모두의 존엄과 행복이 존중받고, 함께 이룬 성장이 지역과 국가의 발전으로 이어지는 세상.",
  visionBody:
    "우리는 개인의 가능성이 공동체의 역량으로 이어지고, 그 성과가 사회 전반에 확산되는 미래를 지향합니다.",
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
  },
  // § 루메오바의 철학 (about page, between the statement and Mission · Vision)
  philosophy: {
    heading: "우리의 철학",
    paragraphs: [
      "사람을 위한 사업, 현장과 함께하는 실천.",
      "미래를여는빛은 사업의 규모보다 삶에 남기는 가치를 중요하게 생각합니다. 서로의 경험과 지혜를 나누고, 각 지역의 현실에 맞는 해법을 함께 찾아갑니다.",
      "한 사람의 행복에서 시작된 성장이 공동체를 변화시키고, 나아가 국가의 미래를 밝힐 수 있다고 믿습니다.",
    ],
  },

  // § Core Values — typography-only, no icons (Section 3)
  // Rendered as spaced text + subtle dividers; no card/icon UI.
  coreValues: [
    {
      id: "human_dignity",
      titleKo: "인간 존중",
      titleEn: "Human Dignity",
      body: "모든 활동의 출발점은 인간의 존엄과 행복입니다. 문화와 환경, 경제적 여건의 차이를 넘어 누구나 존중받으며 자신의 가능성을 펼칠 수 있어야 합니다.",
    },
    {
      id: "local_ownership",
      titleKo: "현장 중심",
      titleEn: "Local Ownership",
      body: "각 지역의 문화와 사회적 환경을 이해하고, 주민의 경험과 의견을 사업의 출발점으로 삼습니다. 외부에서 정한 해답보다 현지에서 발견한 필요와 우선순위를 존중합니다.",
    },
    {
      id: "equal_partnership",
      titleKo: "동등한 협력",
      titleEn: "Equal Partnership",
      body: "일방적인 지원이 아닌 상호 존중과 신뢰를 바탕으로 협력합니다. 지역사회와 현지 기관이 기획부터 실행, 평가까지 주도적으로 참여하는 관계를 만들어 갑니다.",
    },
    {
      id: "expertise",
      titleKo: "전문성과 책임",
      titleEn: "Expertise & Accountability",
      body: "풍부한 현장 경험과 전문지식을 바탕으로 실효성 있는 프로젝트를 설계합니다. 사업의 전 과정에서 투명성과 책임성을 지키며, 실질적인 성과를 확인하고 개선합니다.",
    },
    {
      id: "sustainability",
      titleKo: "지속가능성",
      titleEn: "Sustainability",
      body: "일시적인 지원에 머무르지 않고, 지역사회가 스스로 발전을 이어갈 수 있는 역량과 기반을 마련합니다. 작은 성과가 더 넓은 사회적 발전으로 연결되도록 노력합니다.",
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
  // 연혁 날짜는 yyyy.mm.dd 형식으로 입력합니다. 일자를 모르면 yyyy.mm 까지만 씁니다.
  history: [
    { year: "2026.08", event: "비영리임의단체 등록" },
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
