import { NextRequest, NextResponse } from "next/server";
import { membershipApplicationSchema } from "@/lib/validation/membership";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited, getClientIp } from "@/lib/utils/rateLimit";
import { PRIVACY_POLICY_VERSION } from "@/lib/constants/legal";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (isRateLimited(`membership:${ip}`)) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const parsed = membershipApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해 주세요.", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = await createClient();

  // 1) Create the supporter record.
  const { data: supporter, error: supporterError } = await supabase
    .from("supporters")
    .insert({
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      address: input.address || null,
      birth_date: input.birthDate || null,
    })
    .select("id")
    .single();

  if (supporterError || !supporter) {
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 2) Create the membership application (always starts pending — the
  //    system never auto-approves regular membership, per spec §11).
  const { error: membershipError } = await supabase.from("memberships").insert({
    supporter_id: supporter.id,
    membership_type: input.membershipType,
    status: "pending",
  });

  if (membershipError) {
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 3) Record consent.
  await supabase.from("privacy_consents").insert({
    supporter_id: supporter.id,
    privacy_policy_version: PRIVACY_POLICY_VERSION,
    marketing_opt_in: input.marketingConsent,
  });

  return NextResponse.json({ ok: true });
}
