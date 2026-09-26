/**
 * Brand / organization constants.
 *
 * IMPORTANT — per project ground rule (spec §48): never invent facts about the
 * organization. Every value below is either (a) confirmed by the org directly,
 * or (b) explicitly marked TODO. Do not fill in a TODO with a plausible-sounding
 * guess — leave it for an admin/editor to supply.
 */

export const ORG = {
  nameKo: "미래를여는빛",
  nameEn: "Lumeova International",
  sloganKo: "교육으로 미래를 열어가겠습니다",
  sloganEn: "Opening the Future Through Education",

  // Confirmed via chat with the org (2026):
  legalForm: "비영리 임의단체",
  representative: "김선희",
  founded: "2026년, 창립회원 3인",
  region: "인천광역시 계양구",

  // Confirmed contact information (2026-09-26):
  location: "인천광역시 계양구 계산동",
  phone: "+82-10-2543-3659",
  email: "lumeova.int@gmail.com",

  // Mission & Vision (confirmed):
  mission: "교육을 통해 한 사람이 자신의 가능성을 발견하고, 스스로 선택하며 미래를 만들어 갈 수 있는 기회를 넓혀갑니다.",
  vision: "배움의 기회가 환경과 지역의 한계를 넘어 누구에게나 새로운 가능성으로 이어지는 사회를 만들어갑니다.",

  // Core Values:
  coreValues: [
    {
      ko: "빛",
      en: "Opportunity",
      desc: "교육을 통해 새로운 선택과 가능성의 출발점을 만듭니다.",
    },
    {
      ko: "사람",
      en: "People",
      desc: "사업보다 사람을 먼저 보고, 현장의 목소리에서 시작합니다.",
    },
    {
      ko: "신뢰",
      en: "Trust",
      desc: "확인된 사실을 바탕으로 투명하게 운영하고, 약속한 일을 책임 있게 수행합니다.",
    },
  ] as const,

  // --- Not yet confirmed — do not fabricate, leave as TODO ---
  address: null as string | null, // TODO: full mailing address with postal code
  representativeBio: null as string | null, // TODO
  history: [] as { year: string; event: string }[], // TODO: 연혁 — leave empty until supplied
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
