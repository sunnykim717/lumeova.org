"use client";

import { useTransition } from "react";
import { refreshSiteStats, setStatHidden } from "@/lib/actions/admin";

export type StatRow = {
  key: string;
  label: string;
  display: string; // already formatted for display
  visible: boolean; // passed the server's minimum-count rule
  adminHidden: boolean;
  asOf: string;
};

/**
 * Shows exactly what the public site will show. "공개 중" means visible and
 * not hidden by an admin. The minimum-count rule is enforced in SQL, so a
 * statistic below it stays hidden even if the admin un-hides it.
 */
export function SiteStatsPanel({ stats }: { stats: StatRow[] }) {
  const [isPending, startTransition] = useTransition();

  function toggle(key: string, hidden: boolean) {
    startTransition(async () => {
      await setStatHidden(key, hidden);
    });
  }

  function refresh() {
    startTransition(async () => {
      await refreshSiteStats();
    });
  }

  return (
    <div className="rounded-sm border border-navy/10 bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[18px] text-navy">공개 통계</h2>
        <button
          onClick={refresh}
          disabled={isPending}
          className="text-[12.5px] px-3 py-1.5 rounded-sm border border-navy/20 text-navy hover:border-navy/40 disabled:opacity-50"
        >
          지금 갱신
        </button>
      </div>

      {stats.length === 0 ? (
        <p className="text-[13px] text-muted">아직 계산된 통계가 없습니다. &apos;지금 갱신&apos;을 눌러 주세요.</p>
      ) : (
        <ul className="divide-y divide-navy/10">
          {stats.map((s) => {
            const publicNow = s.visible && !s.adminHidden;
            return (
              <li key={s.key} className="py-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[13.5px] text-ink">{s.label}</p>
                  <p className="text-[12px] text-muted">
                    {s.display} · 기준 {s.asOf}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11.5px] px-2 py-0.5 rounded-full ${
                      publicNow ? "bg-sage text-navy" : "bg-navy/5 text-muted"
                    }`}
                  >
                    {publicNow ? "공개 중" : s.visible ? "관리자 숨김" : "기준 미달 (준비중)"}
                  </span>
                  {s.visible && (
                    <button
                      onClick={() => toggle(s.key, !s.adminHidden)}
                      disabled={isPending}
                      className="text-[12px] px-2.5 py-1 rounded-sm border border-navy/20 text-navy hover:border-navy/40 disabled:opacity-50"
                    >
                      {s.adminHidden ? "다시 공개" : "숨기기"}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
