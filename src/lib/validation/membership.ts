import { z } from "zod";

export const membershipTypeSchema = z.enum(["regular", "general"]);

export const membershipApplicationSchema = z.object({
  name: z.string().trim().min(1, "이름을 입력해 주세요.").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9-]{9,15}$/, "휴대전화 번호 형식을 확인해 주세요.")
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email("이메일 형식을 확인해 주세요.").optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  birthDate: z.string().trim().optional().or(z.literal("")),
  membershipType: membershipTypeSchema,
  memo: z.string().trim().max(1000).optional().or(z.literal("")),
  privacyConsent: z.literal(true, {
    message: "개인정보 수집 및 이용에 동의해 주세요.",
  }),
  marketingConsent: z.boolean().default(false),
  turnstileToken: z.string().min(1, "스팸 방지 인증이 필요합니다."),
});

export type MembershipApplicationInput = z.infer<typeof membershipApplicationSchema>;
