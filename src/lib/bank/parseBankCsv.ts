import { parseCsv } from "../csv/parseCsv";

/**
 * Bank statement CSV → deposit rows (design §5.1).
 *
 * UNVERIFIED AGAINST A REAL EXPORT: no sample file has been provided yet
 * (design §8.1). The header names below are the expected Korean labels, not
 * confirmed ones. Check them against a masked export before relying on the
 * import, and add the bank's exact labels to the aliases.
 *
 * Only deposit rows are kept. Balance, account number and the raw file are
 * never returned, so they can never reach the database.
 */

export const BANK_COLUMN_ALIASES = {
  transactedAt: ["거래일시", "거래일자", "거래일", "거래 일시"],
  deposit: ["입금액", "입금", "입금금액"],
  counterparty: ["보낸분/받는분", "보낸분", "받는분", "거래처명", "보낸분 이름"],
  memo: ["적요", "메모", "내용"],
} as const;

export const MAX_BANK_CSV_BYTES = 1_000_000;

export type ParsedDeposit = {
  line: number;
  transactedAt: string; // ISO 8601 with +09:00
  amount: number;
  counterpartyName: string | null;
  memo: string | null;
  dedupeKey: string;
};

export type ParseResult = {
  deposits: ParsedDeposit[];
  skipped: { line: number; reason: string }[];
};

function findColumn(header: string[], aliases: readonly string[]): number {
  const normalized = header.map((h) => h.replace(/\s+/g, "").trim());
  return normalized.findIndex((h) => aliases.some((a) => a.replace(/\s+/g, "") === h));
}

/** Accepts 2026-10-10, 2026.10.10, 2026/10/10, optionally followed by a time. */
export function parseKstDateTime(raw: string): string | null {
  const m = raw
    .trim()
    .match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return null;
  const [, y, mo, d, hh = "00", mi = "00", ss = "00"] = m;
  const pad = (v: string) => v.padStart(2, "0");
  const iso = `${y}-${pad(mo)}-${pad(d)}T${pad(hh)}:${mi}:${ss}+09:00`;
  return Number.isNaN(Date.parse(iso)) ? null : iso;
}

async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function parseBankCsv(text: string): Promise<ParseResult> {
  const rows = parseCsv(text);

  const headerIndex = rows.findIndex(
    (r) =>
      findColumn(r, BANK_COLUMN_ALIASES.transactedAt) >= 0 &&
      findColumn(r, BANK_COLUMN_ALIASES.deposit) >= 0,
  );
  if (headerIndex < 0) {
    throw new Error("거래내역 헤더(거래일시, 입금액)를 찾지 못했습니다. 파일 형식을 확인해 주세요.");
  }

  const header = rows[headerIndex];
  const cols = {
    at: findColumn(header, BANK_COLUMN_ALIASES.transactedAt),
    deposit: findColumn(header, BANK_COLUMN_ALIASES.deposit),
    counterparty: findColumn(header, BANK_COLUMN_ALIASES.counterparty),
    memo: findColumn(header, BANK_COLUMN_ALIASES.memo),
  };

  const deposits: ParsedDeposit[] = [];
  const skipped: ParseResult["skipped"] = [];
  // Identical rows in one file are legitimate (same payer, same amount, same
  // minute). Numbering them keeps each one distinct while staying stable
  // across re-imports of the same file.
  const seen = new Map<string, number>();

  for (let i = headerIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    const line = i + 1;
    const rawAmount = (row[cols.deposit] ?? "").replace(/[,\s원]/g, "");

    if (rawAmount === "") {
      skipped.push({ line, reason: "입금액 없음 (출금 또는 빈 행)" });
      continue;
    }
    const amount = Number(rawAmount);
    if (!Number.isInteger(amount) || amount <= 0) {
      skipped.push({ line, reason: "입금액 형식 오류" });
      continue;
    }

    const transactedAt = parseKstDateTime(row[cols.at] ?? "");
    if (!transactedAt) {
      skipped.push({ line, reason: "거래일시 형식 오류" });
      continue;
    }

    const counterpartyName = (row[cols.counterparty] ?? "").trim() || null;
    const memo = (row[cols.memo] ?? "").trim() || null;

    const base = [transactedAt, amount, counterpartyName ?? "", memo ?? ""].join("|");
    const occurrence = (seen.get(base) ?? 0) + 1;
    seen.set(base, occurrence);

    deposits.push({
      line,
      transactedAt,
      amount,
      counterpartyName,
      memo,
      dedupeKey: await sha256Hex(`${base}|#${occurrence}`),
    });
  }

  return { deposits, skipped };
}
