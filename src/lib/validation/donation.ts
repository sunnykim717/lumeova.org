import { z } from "zod";

export const donationTypeSchema = z.enum(["recurring", "short_term", "one_time"]);

export const donationApplicationSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9-]{9,15}$/, "휴대전화 번호 형식을 확인해 주세요.")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("이메일 형식을 확인해 주세요.").optional().or(z.literal("")),
  donationType: donationTypeSchema,
  // Stored as an integer (KRW). No minimum enforced — the org's rule is that
  // "최소 후원금액 10,000원" is never shown to the applicant, and a direct-entry
  // field is always available (see spec §13). We only reject non-positive
  // amounts as a basic sanity check.
  amount: z.coerce.number().int().positive("후원 금액을 입력해 주세요."),
  depositorName: z.string().trim().max(100).optional().or(z.literal("")),
  memo: z.string().trim().max(1000).optional().or(z.literal("")),
  privacyConsent: z.literal(true, {
    message: "개인정보 수집 및 이용에 동의해 주세요.",
  }),
  marketingConsent: z.boolean().default(false),
  turnstileToken: z.string().min(1, "스팸 방지 인증이 필요합니다."),
});

export type DonationApplicationInput = z.infer<typeof donationApplicationSchema>;

export const SUGGESTED_AMOUNTS = [10000, 30000, 50000, 100000] as const;
