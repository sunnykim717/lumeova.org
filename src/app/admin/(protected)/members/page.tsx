import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { maskEmail, maskPhone } from "@/lib/utils/mask";
import { RegularMemberRegistration, PromoteMemberButton } from "@/components/admin/RegularMemberControls";
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
  const activeStatus = STATUS_TABS.find((tab) => tab.value === status)?.value ?? "all";
  const supabase = await createClient();
  const [{ data: canWrite }, { data: memberships, error }] = await Promise.all([
    supabase.rpc("admin_can_write"),
    supabase.rpc("admin_read_members", { p_status: activeStatus === "all" ? null : activeStatus }),
  ]);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-[24px] text-navy">회원</h1>
        <Link
          href="/admin/members/export"
          className="text-[13px] px-4 py-2 rounded-sm border border-navy/20 text-navy hover:border-navy/40"
        >
          CSV 내보내기
        </Link>
      </div>

      {canWrite && <RegularMemberRegistration />}

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

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="block w-full text-[13.5px] md:table">
          <thead className="hidden md:table-header-group">
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
          <tbody className="block md:table-row-group">
            {error || !memberships?.length ? (
              <tr className="block md:table-row">
                <td colSpan={7} className="block px-4 py-10 text-center text-muted md:table-cell">
                  {error ? "회원 목록을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." : "해당하는 회원이 없습니다."}
                </td>
              </tr>
            ) : (
              (memberships ?? []).map((m) => {
                return (
                  <tr key={m.id} className="grid grid-cols-2 items-start gap-x-2 border-b border-navy/10 p-3 last:border-0 md:table-row md:p-0">
                    <td className="col-span-2 p-2 font-medium text-ink md:px-4 md:py-3">
                      {m.name}
                    </td>
                    <td className="break-all p-2 tabular-nums text-muted md:px-4 md:py-3">{maskPhone(m.phone)}</td>
                    <td className="break-all p-2 text-muted md:px-4 md:py-3">{maskEmail(m.email)}</td>
                    <td className="p-2 text-muted md:px-4 md:py-3">
                      {m.membership_type === "regular" ? "정회원" : "일반회원"}
                    </td>
                    <td className="p-2 md:px-4 md:py-3">
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
                    <td className="col-span-2 p-2 tabular-nums text-muted md:px-4 md:py-3">
                      <span className="md:hidden">신청일 </span>{formatDate(m.created_at)}
                    </td>
                    <td className="col-span-2 p-2 md:px-4 md:py-3">
                      {canWrite && (
                        <div className="flex flex-wrap items-center gap-2">
                          <MemberActions membershipId={m.id} status={m.status} />
                          {m.membership_type === "general" && (
                            <PromoteMemberButton membershipId={m.id} memberName={m.name} />
                          )}
                        </div>
                      )}
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
