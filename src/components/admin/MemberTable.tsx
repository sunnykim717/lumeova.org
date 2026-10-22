"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { bulkApproveGeneralMembers } from "@/lib/actions/admin";
import { MemberActions } from "@/components/admin/MemberActions";
import type { ReviewCheck } from "@/lib/admin/memberReview";
import type { MembershipStatus } from "@/lib/types/database";

export type MemberRow = {
  id: string;
  name: string;
  phone: string; // already masked on the server
  email: string; // already masked on the server
  typeLabel: string;
  status: MembershipStatus;
  statusLabel: string;
  createdAt: string;
  checks: ReviewCheck[];
  bulkEligible: boolean;
};

/**
 * Row checkboxes exist only for bulkEligible rows, and the server recomputes
 * eligibility before approving anything. The confirmation dialog states the
 * count before the change is made.
 */
export function MemberTable({ rows, emptyLabel }: { rows: MemberRow[]; emptyLabel: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const eligible = rows.filter((r) => r.bulkEligible);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setChecked((prev) => (prev.size === eligible.length ? new Set() : new Set(eligible.map((r) => r.id))));
  }

  function bulkApprove() {
    setError(null);
    setMessage(null);
    const ids = [...checked];
    if (ids.length === 0) return;
    if (!window.confirm(`일반회원 ${ids.length}명을 승인합니다. 진행할까요?`)) return;

    startTransition(async () => {
      try {
        const result = await bulkApproveGeneralMembers(ids);
        setChecked(new Set());
        const skippedNote = result.skipped.length > 0 ? ` · 건너뜀 ${result.skipped.length}건` : "";
        setMessage(`${result.approved}명 승인 완료${skippedNote}`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "승인 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <div>
      {eligible.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="text-[13px] text-muted">
            {message && <span className="text-navy">{message} </span>}
            {error && <span className="text-red-700">{error}</span>}
            {!message && !error && `점검 통과 일반회원 ${eligible.length}명`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleAll}
              className="text-[12.5px] px-3 py-1.5 rounded-sm border border-navy/20 text-navy hover:border-navy/40"
            >
              {checked.size === eligible.length ? "선택 해제" : "점검 통과 전체 선택"}
            </button>
            <button
              onClick={bulkApprove}
              disabled={isPending || checked.size === 0}
              className="text-[12.5px] px-3 py-1.5 rounded-sm bg-navy text-cream hover:bg-navy-light disabled:opacity-50"
            >
              {isPending ? "승인 중..." : `선택 ${checked.size}명 일괄 승인`}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-navy/10 text-left text-muted text-[12px]">
              <th className="px-4 py-3 font-medium w-10"></th>
              <th className="px-4 py-3 font-medium">이름</th>
              <th className="px-4 py-3 font-medium">연락처</th>
              <th className="px-4 py-3 font-medium">이메일</th>
              <th className="px-4 py-3 font-medium">유형</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">점검</th>
              <th className="px-4 py-3 font-medium">신청일</th>
              <th className="px-4 py-3 font-medium">처리</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-b border-navy/5 last:border-0 align-top">
                  <td className="px-4 py-3">
                    {r.bulkEligible && (
                      <input
                        type="checkbox"
                        aria-label={`${r.name} 일괄 승인 선택`}
                        checked={checked.has(r.id)}
                        onChange={() => toggle(r.id)}
                      />
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-muted tabular-nums">{r.phone}</td>
                  <td className="px-4 py-3 text-muted">{r.email}</td>
                  <td className="px-4 py-3 text-muted">{r.typeLabel}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[11.5px] px-2 py-0.5 rounded-full ${
                        r.status === "pending"
                          ? "bg-gold/20 text-gold-dark"
                          : r.status === "approved"
                            ? "bg-sage text-navy"
                            : "bg-navy/5 text-muted"
                      }`}
                    >
                      {r.statusLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.status === "pending" ? (
                      <ul className="space-y-1">
                        {r.checks.map((c) => (
                          <li
                            key={c.code}
                            className={`text-[12px] ${c.ok ? "text-navy" : "text-gold-dark"}`}
                          >
                            {c.ok ? "✓" : "!"} {c.label}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-[12px] text-muted">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted tabular-nums">{r.createdAt}</td>
                  <td className="px-4 py-3">
                    <MemberActions membershipId={r.id} status={r.status} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
