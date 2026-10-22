"use client";

import { useActionState } from "react";
import { importBankCsv, type ImportBankCsvResult } from "@/lib/actions/bank";

export function BankCsvUpload() {
  const [result, action, isPending] = useActionState<ImportBankCsvResult | null, FormData>(
    importBankCsv,
    null,
  );

  return (
    <div className="rounded-sm border border-navy/10 bg-white p-6">
      <form action={action} className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="text-[13px] text-muted file:mr-3 file:rounded-sm file:border file:border-navy/20 file:bg-white file:px-3 file:py-1.5 file:text-[12.5px] file:text-navy"
        />
        <button
          type="submit"
          disabled={isPending}
          className="text-[13px] px-4 py-2 rounded-sm bg-navy text-cream hover:bg-navy-light disabled:opacity-50"
        >
          {isPending ? "가져오는 중..." : "거래내역 가져오기"}
        </button>
      </form>

      {result && result.ok && (
        <div className="mt-4 text-[13px] text-muted space-y-1">
          <p>
            새로 저장 {result.inserted}건 · 이미 있던 거래 {result.duplicates}건 · 입금 아님 등 제외{" "}
            {result.skipped.length}건
          </p>
          {result.skipped.length > 0 && (
            <details>
              <summary className="cursor-pointer text-navy">제외된 행 보기</summary>
              <ul className="mt-2 list-disc pl-5">
                {result.skipped.slice(0, 50).map((s) => (
                  <li key={s.line}>
                    {s.line}행: {s.reason}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
      {result && !result.ok && (
        <p className="mt-4 text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3">
          {result.error}
        </p>
      )}
    </div>
  );
}
