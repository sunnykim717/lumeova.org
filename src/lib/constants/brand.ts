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
  // NOTE: this is a different, currently-unconfirmed home base than the address
  // used on the old placeholder lumeova.org site — do not merge them without
  // asking the org which is current.
  region: "인천광역시 계양구",

  // --- Not yet confirmed — do not fabricate, leave as TODO ---
  address: null as string | null, // TODO: full mailing address
  phone: null as string | null, // TODO
  email: null as string | null, // TODO: public contact email (previously sunnykim717@gmail.com was used as a placeholder contact — confirm before reusing site-wide)
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
