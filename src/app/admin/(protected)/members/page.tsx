import { createClient } from "@/lib/supabase/server";
import { maskEmail, maskPhone } from "@/lib/utils/mask";
import { MemberActions } from "@/components/admin/MemberActions";
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[24px] text-navy">회원</h1>
        <a
          href="/admin/members/export"
          className="text-[13px] px-4 py-2 rounded-sm border border-navy/20 text-navy hover:border-navy/40"
        >
          CSV 내보내기
        </a>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <a
            key={tab.value}
            href={tab.value === "all" ? "/admin/members" : `/admin/members?status=${tab.value}`}
            className={`text-[12.5px] px-3.5 py-1.5 rounded-full border transition-colors ${
              activeStatus === tab.value
                ? "bg-navy text-cream border-navy"
                : "border-navy/20 text-muted hover:border-navy/40"
            }`}
          >
            {tab.label}
          </a>
        ))}
      </div>

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-navy/10 text-left text-muted text-[12px]">
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">연락처</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">유형</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">신청일</th>
              <th className="px-4 py-3 font-medium">처리</th>
            </tr>
          </thead>
          <tbody>
            {(memberships ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  해당하는 회원이 없습니다.
                </td>
              </tr>
            ) : (
              (memberships ?? []).map((m) => {
                const supporter = supporterMap.get(m.supporter_id);
                return (
                  <tr key={m.id} className="border-b border-navy/5 last:border-0">
                    <td className="px-4 py-3 text-ink font-medium">{supporter?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-muted tabular-nums">{maskPhone(supporter?.phone ?? null)}</td>
                    <td className="px-4 py-3 text-muted">{maskEmail(supporter?.email ?? null)}</td>
                    <td className="px-4 py-3 text-muted">
                      {m.membership_type === "regular" ? "정회원" : "일반회원"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11.5px] px-2 py-0.5 rounded-full ${
                          m.status === "pending"
                            ? "bg-gold/20 text-gold-dark"
                            : m.status === "approved"
                              ? "bg-sage text-navy"
                              : "bg-navy/5 text-muted"
                        }`}
                      >
                        {STATUS_LABEL[m.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted tabular-nums">{formatDate(m.created_at)}</td>
                    <td className="px-4 py-3">
                      <MemberActions membershipId={m.id} status={m.status} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
