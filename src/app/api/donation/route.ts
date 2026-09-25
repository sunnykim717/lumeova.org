import { NextRequest, NextResponse } from "next/server";
import { donationApplicationSchema } from "@/lib/validation/donation";
import { createClient } from "@/lib/supabase/server";
import { isRateLimited, getClientIp } from "@/lib/utils/rateLimit";
import { DONATION_ACCOUNT } from "@/lib/constants/brand";
import { PRIVACY_POLICY_VERSION } from "@/lib/constants/legal";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  if (isRateLimited(`donation:${ip}`)) {
    return NextResponse.json({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const parsed = donationApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해 주세요.", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;
  const supabase = await createClient();

  // 1) Supporter record (guest donations are allowed — no login required).
  const { data: supporter, error: supporterError } = await supabase
    .from("supporters")
    .insert({
      name: input.depositorName || input.name,
      phone: input.phone || null,
      email: input.email || null,
    })
    .select("id")
    .single();

  if (supporterError || !supporter) {
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 2) Donation application. status starts "active" — donation_payments is
  //    where the admin later records the actual bank transfer confirmation.
  const { data: donation, error: donationError } = await supabase
    .from("donations")
    .insert({
      supporter_id: supporter.id,
      donation_type: input.donationType,
      amount: input.amount,
      status: "active",
    })
    .select("id")
    .single();

  if (donationError || !donation) {
    return NextResponse.json({ error: "신청 처리 중 오류가 발생했습니다." }, { status: 500 });
  }

  // 3) Consent.
  await supabase.from("privacy_consents").insert({
    supporter_id: supporter.id,
    privacy_policy_version: PRIVACY_POLICY_VERSION,
    marketing_opt_in: input.marketingConsent,
  });

  return NextResponse.json({
    ok: true,
    account: DONATION_ACCOUNT,
  });
}
