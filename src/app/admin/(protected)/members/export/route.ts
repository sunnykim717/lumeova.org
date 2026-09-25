import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const TYPE_LABEL: Record<string, string> = { regular: "정회원", general: "일반회원" };
const STATUS_LABEL: Record<string, string> = {
  pending: "승인대기",
  approved: "승인됨",
  rejected: "거절됨",
  inactive: "비활성",
  withdrawn: "탈퇴",
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  // RLS also enforces this — this check just returns a clean error instead
  // of an empty CSV for a non-admin session.
  const { data: adminRow } = await supabase.from("admin_users").select("id").eq("id", user.id).maybeSingle();
  if (!adminRow) {
    return NextResponse.json({ error: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const { data: memberships } = await supabase
    .from("memberships")
    .select("id, supporter_id, membership_type, status, created_at")
    .order("created_at", { ascending: false });

  const supporterIds = [...new Set((memberships ?? []).map((m) => m.supporter_id))];
  const { data: supporters } = supporterIds.length
    ? await supabase.from("supporters").select("id, name, phone, email, address").in("id", supporterIds)
    : { data: [] };
  const supporterMap = new Map((supporters ?? []).map((s) => [s.id, s]));

  const header = ["이름", "연락처", "이메일", "주소", "회원유형", "상태", "신청일"];
  const rows = (memberships ?? []).map((m) => {
    const s = supporterMap.get(m.supporter_id);
    return [
      s?.name ?? "",
      s?.phone ?? "",
      s?.email ?? "",
      s?.address ?? "",
      TYPE_LABEL[m.membership_type] ?? m.membership_type,
      STATUS_LABEL[m.status] ?? m.status,
      m.created_at,
    ];
  });

  const csv = [header, ...rows].map((r) => r.map((v) => csvEscape(String(v))).join(",")).join("\n");
  const csvWithBom = "﻿" + csv; // BOM so Excel opens Korean text as UTF-8 correctly

  return new NextResponse(csvWithBom, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="members_${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
