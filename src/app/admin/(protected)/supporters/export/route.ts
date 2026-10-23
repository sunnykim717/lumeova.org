import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { loadSupporterRows } from "@/lib/data/supporters";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  // Full contact details leave the system here, so only the roles that can
  // manage the donor list may export it. RLS still limits what they can read.
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();
  if (!adminRow || !["super_admin", "manager"].includes(adminRow.role)) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const rows = await loadSupporterRows(supabase);

  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action: "supporters_exported",
    target_type: "supporter",
    metadata: { count: rows.length },
  });

  const header = ["이름", "연락처", "이메일", "주소", "후원 유형", "진행 중 금액(원)", "상시후원자", "입금 확인", "마케팅 수신동의", "신청일"];
  const body = rows.map((r) => [
    r.name,
    r.phone ?? "",
    r.email ?? "",
    r.address ?? "",
    r.donationTypes.join(" / "),
    String(r.activeAmount),
    r.isRegular ? "예" : "아니오",
    r.hasConfirmedPayment ? "예" : "아니오",
    r.marketingOptIn === null ? "" : r.marketingOptIn ? "동의" : "미동의",
    r.appliedAt,
  ]);

  const csv = [header, ...body].map((row) => row.map((v) => csvEscape(String(v))).join(",")).join("\n");
  const csvWithBom = "﻿" + csv; // BOM so Excel opens Korean text as UTF-8 correctly

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="supporters_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
