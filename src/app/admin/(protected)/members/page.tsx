import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { maskEmail, maskPhone } from "@/lib/utils/mask";
import { evaluateMembership, loadReviewInputs, type MembershipForReview } from "@/lib/admin/memberReview";
import { MemberTable, type MemberRow } from "@/components/admin/MemberTable";
import type { MembershipStatus } from "@/lib/types/database";

const STATUS_LABEL: Record<MembershipStatus, string> = {
  pending: "승인대기",
  approved: "승인됨",
  rejected: "거절됨",
  inactive: "비활성",
  withdrawn: "탈퇴",
};

const STATUS_TABS: { value: MembershipStatus | "all"; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "pending", label: "승인대기" },
  { value: "approved", label: "승인됨" },
  { value: "rejected", label: "거절됨" },
  { value: "inactive", label: "비활성" },
  { value: "withdrawn", label: "탈퇴" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

type Props = {
  searchParams: Promise<{ status?: string }>;
};

export default async function AdminMembersPage({ searchParams }: Props) {
  const { status } = await searchParams;
  const activeStatus = (status ?? "all") as MembershipStatus | "all";

  const supabase = await createClient();

  let query = supabase
    .from("memberships")
    .select("id, supporter_id, membership_type, status, created_at")
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: memberships } = await query;
  const supporterIds = [...new Set((memberships ?? []).map((m) => m.supporter_id))];

  const { data: supporters } = supporterIds.length
    ? await supabase.from("supporters").select("id, name, phone, email").in("id", supporterIds)
    : { data: [] };

  const supporterMap = new Map((supporters ?? []).map((s) => [s.id, s]));

  const list = memberships ?? [];
  const reviewInputs = await loadReviewInputs(supabase, list as MembershipForReview[]);

  const rows: MemberRow[] = list.map((m) => {
    const supporter = supporterMap.get(m.supporter_id);
    const input = reviewInputs.get(m.id);
    const review = input ? evaluateMembership(input) : { checks: [], bulkEligible: false };
    return {
      id: m.id,
      name: supporter?.name ?? "-",
      phone: maskPhone(supporter?.phone ?? null),
      email: maskEmail(supporter?.email ?? null),
      typeLabel: m.membership_type === "regular" ? "정회원" : "일반회원",
      status: m.status,
      statusLabel: STATUS_LABEL[m.status],
      createdAt: formatDate(m.created_at),
      checks: review.checks,
      bulkEligible: review.bulkEligible,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[24px] text-navy">회원</h1>
        <Link
          href="/admin/members/export"
          className="text-[13px] px-4 py-2 rounded-sm border border-navy/20 text-navy hover:border-navy/40"
        >
          CSV 내보내기
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/members" : `/admin/members?status=${tab.value}`}
            className={`text-[12.5px] px-3.5 py-1.5 rounded-full border transition-colors ${
              activeStatus === tab.value
                ? "bg-navy text-cream border-navy"
                : "border-navy/20 text-muted hover:border-navy/40"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <MemberTable rows={rows} emptyLabel="해당하는 회원이 없습니다." />
    </div>
  );
}
