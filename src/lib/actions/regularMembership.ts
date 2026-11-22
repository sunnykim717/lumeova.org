"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { membershipApplicationSchema } from "@/lib/validation/membership";

const registrationSchema = membershipApplicationSchema.pick({
  name: true,
  phone: true,
  email: true,
  address: true,
  birthDate: true,
}).refine((input) => input.phone || input.email, "전화번호 또는 이메일을 입력해 주세요.");

type Result = { error: string } | { membershipId: string };

const errors: Record<string, string> = {
  administrator_required: "회원 정보를 변경할 수 있는 관리자 권한이 필요합니다.",
  membership_not_general: "전환할 일반회원을 찾을 수 없습니다. 목록을 새로고침해 주세요.",
  membership_already_exists: "이미 회원 이력이 있습니다. 회원 목록에서 기존 기록을 확인해 주세요.",
  supporter_contact_conflict: "기존 연락처와 일치하는 기록이 있습니다. 이름과 연락처를 확인해 주세요.",
  invalid_member_details: "이름, 연락처, 생년월일을 확인해 주세요.",
};

async function finish(data: string | null, error: { message: string } | null): Promise<Result> {
  if (error || !data) {
    return { error: (error && errors[error.message]) || "처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." };
  }
  for (const path of ["/admin/members", "/admin/supporters", "/admin/dashboard", "/admin/history", "/membership"]) {
    revalidatePath(path);
  }
  revalidatePath("/admin/members/[id]", "page");
  return { membershipId: data };
}

export async function registerRegularMember(formData: FormData): Promise<Result> {
  const parsed = registrationSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    address: formData.get("address"),
    birthDate: formData.get("birthDate"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? errors.invalid_member_details };
  }
  const input = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_register_regular_member", {
    p_name: input.name,
    p_phone: input.phone || "",
    p_email: input.email || "",
    p_address: input.address || "",
    p_birth_date: input.birthDate || null,
  });
  return finish(data, error);
}

export async function promoteGeneralMember(membershipId: string): Promise<Result> {
  if (!z.uuid().safeParse(membershipId).success) return { error: errors.membership_not_general };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("admin_promote_general_member", { p_id: membershipId });
  return finish(data, error);
}
