"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmBankMatches } from "@/lib/actions/bank";
import type { MatchGrade } from "@/lib/bank/matchDeposits";

export type MatchRow = {
  transactionId: string;
  transactedAt: string;
  amount: number;
  counterpartyName: string;
  grade: MatchGrade;
  donationId: string | null;
  candidates: { donationId: string; label: string; amount: number }[];
};

const GRADE_BADGE: Record<MatchGrade, { label: string; className: string }> = {
  strong: { label: "확인 추천", className: "bg-sage text-navy" },
  review: { label: "검토 필요", className: "bg-gold/20 text-gold-dark" },
  none: { label: "매칭 없음", className: "bg-navy/5 text-muted" },
};

const krw = (n: number) => `${n.toLocaleString("ko-KR")}원`;

/**
 * A person chooses every confirmation. Strong suggestions start unselected,
 * and nothing is confirmed until the button is pressed and the summary is
 * accepted. The server recomputes amount and date from the stored deposit.
 */
export function BankMatchTable({ rows }: { rows: MatchRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [picked, setPicked] = useState<Record<string, string>>(() =>
    Object.fromEntries(rows.filter((r) => r.donationId).map((r) => [r.transactionId, r.donationId!])),
  );
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});

  const amountById = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) for (const c of r.candidates) map.set(c.donationId, c.amount);
    return map;
  }, [rows]);

  const selected = rows.filter((r) => checked.has(r.transactionId) && picked[r.transactionId]);

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function confirm() {
    setError(null);
    setMessage(null);

    const matches = selected.map((r) => {
      const donationId = picked[r.transactionId];
      const note = (notes[r.transactionId] ?? "").trim();
      return { transactionId: r.transactionId, donationId, note: note || undefined, row: r };
    });

    const missingNote = matches.find(
      (m) => amountById.get(m.donationId) !== m.row.amount && !m.note,
    );
    if (missingNote) {
      setError(`${missingNote.row.counterpartyName}님 입금(${krw(missingNote.row.amount)})은 신청 금액과 다릅니다. 사유를 적어 주세요.`);
      return;
    }

    const total = matches.reduce((sum, m) => sum + m.row.amount, 0);
    const ok = window.confirm(
      `${matches.length}건, 합계 ${krw(total)}을(를) 입금 확인합니다.\n되돌리려면 후원 목록에서 직접 처리해야 합니다. 진행할까요?`,
    );
    if (!ok) return;

    startTransition(async () => {
      try {
        const result = await confirmBankMatches(
          matches.map(({ transactionId, donationId, note }) => ({ transactionId, donationId, note })),
        );
        setChecked(new Set());
        setNotes({});
        setMessage(`${result.confirmed}건을 입금 확인했습니다.`);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "입금 확인 중 오류가 발생했습니다.");
      }
    });
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-sm border border-navy/10 bg-white px-4 py-10 text-center text-[13.5px] text-muted">
        대조할 미확인 입금이 없습니다.
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="text-[13px] text-muted">
          {message && <span className="text-navy">{message} </span>}
          {error && <span className="text-red-700">{error}</span>}
        </div>
        <button
          onClick={confirm}
          disabled={isPending || selected.length === 0}
          className="text-[13px] px-4 py-2 rounded-sm bg-navy text-cream hover:bg-navy-light disabled:opacity-50"
        >
          {isPending ? "처리 중..." : `선택 ${selected.length}건 입금 확인`}
        </button>
      </div>

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-navy/10 text-left text-muted text-[12px]">
              <th className="px-4 py-3 font-medium w-10"></th>
              <th className="px-4 py-3 font-medium">거래일시</th>
              <th className="px-4 py-3 font-medium">보낸분</th>
              <th className="px-4 py-3 font-medium">입금액</th>
              <th className="px-4 py-3 font-medium">판정</th>
              <th className="px-4 py-3 font-medium">연결할 후원</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const badge = GRADE_BADGE[r.grade];
              const donationId = picked[r.transactionId] ?? "";
              const mismatch = donationId !== "" && amountById.get(donationId) !== r.amount;
              const canCheck = donationId !== "";
              return (
                <tr key={r.transactionId} className="border-b border-navy/5 last:border-0 align-top">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label={`${r.counterpartyName} ${krw(r.amount)} 선택`}
                      disabled={!canCheck}
                      checked={checked.has(r.transactionId)}
                      onChange={() => toggle(r.transactionId)}
                    />
                  </td>
                  <td className="px-4 py-3 text-muted tabular-nums">{r.transactedAt}</td>
                  <td className="px-4 py-3 text-ink font-medium">{r.counterpartyName}</td>
                  <td className="px-4 py-3 text-muted tabular-nums">{krw(r.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[11.5px] px-2 py-0.5 rounded-full ${badge.className}`}>{badge.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    {r.candidates.length === 0 ? (
                      <span className="text-muted">-</span>
                    ) : (
                      <div className="space-y-2">
                        <select
                          value={donationId}
                          onChange={(e) => {
                            const value = e.target.value;
                            setPicked((prev) => {
                              const next = { ...prev };
                              if (value) next[r.transactionId] = value;
                              else delete next[r.transactionId];
                              return next;
                            });
                            setChecked((prev) => {
                              const next = new Set(prev);
                              next.delete(r.transactionId);
                              return next;
                            });
                          }}
                          className="w-full max-w-xs rounded-sm border border-border px-2 py-1 text-[12.5px]"
                        >
                          <option value="">후원 선택</option>
                          {r.candidates.map((c) => (
                            <option key={c.donationId} value={c.donationId}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        {mismatch && (
                          <input
                            value={notes[r.transactionId] ?? ""}
                            onChange={(e) =>
                              setNotes((prev) => ({ ...prev, [r.transactionId]: e.target.value }))
                            }
                            placeholder="금액이 다릅니다. 사유 (필수)"
                            maxLength={200}
                            className="w-full max-w-xs rounded-sm border border-gold-dark/40 px-2 py-1 text-[12.5px]"
                          />
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
