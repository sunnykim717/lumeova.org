import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadSupporterRows, type SupporterRow } from "@/lib/data/supporters";
import { maskEmail, maskPhone } from "@/lib/utils/mask";
import { REGULAR_SUPPORTER_GOAL } from "@/lib/constants/supporters";

type Filter = "all" | "regular" | "pending";

const FILTER_TABS: { value: Filter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "regular", label: "상시후원자" },
  { value: "pending", label: "입금 확인 대기" },
];

function applyFilter(rows: SupporterRow[], filter: Filter) {
  if (filter === "regular") return rows.filter((r) => r.isRegular);
  if (filter === "pending") return rows.filter((r) => !r.hasConfirmedPayment);
  return rows;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

type Props = {
  searchParams: Promise<{ filter?: string }>;
};

export default async function AdminSupportersPage({ searchParams }: Props) {
  const { filter: rawFilter } = await searchParams;
  const filter: Filter = (["regular", "pending"] as const).includes(rawFilter as "regular")
    ? (rawFilter as Filter)
    : "all";

  const supabase = await createClient();
  const rows = await loadSupporterRows(supabase);
  const regularCount = rows.filter((r) => r.isRegular).length;
  const visible = applyFilter(rows, filter);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[24px] text-navy">후원자 명단</h1>
          <p className="text-[13px] text-muted mt-1">
            상시후원자 {regularCount} / 목표 {REGULAR_SUPPORTER_GOAL}명 · 전체 후원자 {rows.length}명
          </p>
        </div>
        <Link
          href="/admin/supporters/export"
          className="text-[13px] px-4 py-2 rounded-sm bg-navy text-cream hover:bg-navy-light"
        >
          CSV 내려받기
        </Link>
      </div>

      <p className="text-[12.5px] text-muted mb-4">
        연락처와 이메일은 가려서 표시합니다. 전체 정보는 CSV에 담기며, 내려받을 때마다 감사 기록이 남습니다.
      </p>

      <div className="flex gap-2 mb-5">
        {FILTER_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/supporters" : `/admin/supporters?filter=${tab.value}`}
            className={`text-[13px] px-3.5 py-1.5 rounded-sm border ${
              filter === tab.value
                ? "bg-navy text-cream border-navy"
                : "border-navy/15 text-navy hover:bg-navy/5"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-navy/10 text-left text-muted text-[12px]">
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">연락처</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">후원 유형</th>
              <th className="px-4 py-3 font-medium">진행 중 금액(원)</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">신청일</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  해당하는 후원자가 없습니다.
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-4 py-3 text-ink font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted">{maskPhone(r.phone)}</td>
                  <td className="px-4 py-3 text-muted">{maskEmail(r.email)}</td>
                  <td className="px-4 py-3 text-muted">{r.donationTypes.join(", ")}</td>
                  <td className="px-4 py-3 text-muted tabular-nums">{r.activeAmount.toLocaleString("ko-KR")}</td>
                  <td className="px-4 py-3 text-muted">
                    {r.isRegular ? "상시후원자" : r.hasConfirmedPayment ? "입금 확인됨" : "입금 확인 대기"}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(r.appliedAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
