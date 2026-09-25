import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const TYPE_LABEL: Record<string, string> = {
  recurring: "정기후원",
  short_term: "단기후원",
  one_time: "일시후원",
};
const STATUS_LABEL: Record<string, string> = { active: "진행중", completed: "종료", cancelled: "취소" };

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  const { data: adminRow } = await supabase.from("admin_users").select("id").eq("id", user.id).maybeSingle();
  if (!adminRow) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { data: donations } = await supabase
    .from("donations")
    .select("id, supporter_id, donation_type, amount, status, created_at")
    .order("created_at", { ascending: false });

  const supporterIds = [...new Set((donations ?? []).map((d) => d.supporter_id))];
  const donationIds = (donations ?? []).map((d) => d.id);

  const [{ data: supporters }, { data: payments }] = await Promise.all([
    supporterIds.length
      ? supabase.from("supporters").select("id, name, phone, email").in("id", supporterIds)
      : Promise.resolve({ data: [] as { id: string; name: string; phone: string | null; email: string | null }[] }),
    donationIds.length
      ? supabase
          .from("donation_payments")
          .select("donation_id, status, payment_date")
          .in("donation_id", donationIds)
      : Promise.resolve({ data: [] as { donation_id: string; status: string; payment_date: string | null }[] }),
  ]);

  const supporterMap = new Map((supporters ?? []).map((s) => [s.id, s]));
  const confirmedPaymentByDonation = new Map(
    (payments ?? []).filter((p) => p.status === "confirmed").map((p) => [p.donation_id, p])
  );

  const header = ["입금자명", "연락처", "이메일", "후원유형", "금액", "상태", "입금확인일", "신청일"];
  const rows = (donations ?? []).map((d) => {
    const s = supporterMap.get(d.supporter_id);
    const payment = confirmedPaymentByDonation.get(d.id);
    return [
      s?.name ?? "",
      s?.phone ?? "",
      s?.email ?? "",
      TYPE_LABEL[d.donation_type] ?? d.donation_type,
      String(d.amount),
      STATUS_LABEL[d.status] ?? d.status,
      payment?.payment_date ?? "미확인",
      d.created_at,
    ];
  });

  const csv = [header, ...rows].map((r) => r.map((v) => csvEscape(String(v))).join(",")).join("\n");
  const csvWithBom = "﻿" + csv;

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="donations_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
