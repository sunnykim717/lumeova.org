"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { decodeCsvBytes } from "@/lib/csv/parseCsv";
import { MAX_BANK_CSV_BYTES, parseBankCsv } from "@/lib/bank/parseBankCsv";

/**
 * Bank deposit import and human-confirmed matching (design §5.1).
 *
 * Authorization is RLS: bank_transactions and donation_payments are
 * admin-only, and confirm_bank_matches() re-checks is_admin() itself. These
 * actions never confirm a payment on their own; confirmBankMatches() runs
 * only when a person submits the selected rows.
 */

export type ImportBankCsvResult =
  | { ok: true; inserted: number; duplicates: number; skipped: { line: number; reason: string }[] }
  | { ok: false; error: string };

const CHUNK = 500;

export async function importBankCsv(
  _previous: ImportBankCsvResult | null,
  formData: FormData,
): Promise<ImportBankCsvResult> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "거래내역 CSV 파일을 선택해 주세요." };
  }
  if (file.size > MAX_BANK_CSV_BYTES) {
    return { ok: false, error: "파일이 너무 큽니다. 기간을 나누어 다시 내려받아 주세요." };
  }

  let parsed;
  try {
    parsed = await parseBankCsv(decodeCsvBytes(await file.arrayBuffer()));
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "파일을 읽지 못했습니다." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "관리자 로그인이 필요합니다." };

  let inserted = 0;
  for (let i = 0; i < parsed.deposits.length; i += CHUNK) {
    const chunk = parsed.deposits.slice(i, i + CHUNK).map((d) => ({
      transacted_at: d.transactedAt,
      amount: d.amount,
      counterparty_name: d.counterpartyName,
      memo: d.memo,
      dedupe_key: d.dedupeKey,
      imported_by: user.id,
    }));
    // ignoreDuplicates keeps rows already imported (including ones already
    // matched) untouched. `.select` returns only the rows actually inserted.
    const { data, error } = await supabase
      .from("bank_transactions")
      .upsert(chunk, { onConflict: "dedupe_key", ignoreDuplicates: true })
      .select("id");
    if (error) return { ok: false, error: `저장 중 오류: ${error.message}` };
    inserted += data?.length ?? 0;
  }

  revalidatePath("/admin/donations/import");
  return {
    ok: true,
    inserted,
    duplicates: parsed.deposits.length - inserted,
    skipped: parsed.skipped,
  };
}

const confirmSchema = z
  .array(
    z.object({
      transactionId: z.uuid(),
      donationId: z.uuid(),
      note: z.string().trim().max(200).optional(),
    }),
  )
  .min(1, "확정할 항목을 선택해 주세요.")
  .max(200);

export async function confirmBankMatches(
  matches: { transactionId: string; donationId: string; note?: string }[],
): Promise<{ confirmed: number }> {
  const parsed = confirmSchema.safeParse(matches);
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요.");

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_bank_matches", {
    p_matches: parsed.data.map((m) => ({
      transaction_id: m.transactionId,
      donation_id: m.donationId,
      note: m.note || undefined,
    })),
  });
  if (error) throw new Error(`입금 확인 실패: ${error.message}`);

  revalidatePath("/admin/donations");
  revalidatePath("/admin/donations/import");
  revalidatePath("/admin/dashboard");
  return { confirmed: data ?? 0 };
}
