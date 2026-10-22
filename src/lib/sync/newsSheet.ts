import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/types/database";
import { decodeCsvBytes, parseCsv } from "@/lib/csv/parseCsv";

/**
 * One-way sync: published news sheet → news table (design §6.1).
 *
 * Column contract v1. Extra columns are ignored. Personal-data columns
 * abort the whole run, because a sheet is public when published to the web.
 *
 * Addition beyond the design doc: a published row also needs `consent` = Y,
 * the same photo/real-name consent that the admin form requires. Without it
 * a sheet could publish around the consent check.
 */

export const MAX_SHEET_BYTES = 1_000_000;
const FETCH_TIMEOUT_MS = 10_000;

const PERSONAL_HEADERS = ["phone", "email", "address", "birth", "연락처", "전화", "이메일", "주소", "생년"];

export type SyncSkip = { line: number; reason: string };

export type SyncReport = {
  added: number;
  updated: number;
  lockedSkipped: string[]; // external_ids the admin has locked
  skipped: SyncSkip[];
  missingFromSheet: number; // rows in DB with this source that the sheet no longer lists
};

export class SyncAbort extends Error {}

const cell = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const rowSchema = z.object({
  external_id: z.string().min(1, "external_id가 비어 있습니다.").max(100),
  title: z.string().min(1, "title이 비어 있습니다.").max(200),
  slug: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  summary: z.string().max(200).optional(),
  content: z.string().max(50_000).optional(),
  published_at: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "published_at은 YYYY-MM-DD 형식이어야 합니다.")
    .optional(),
  status: z.enum(["draft", "published", "hidden"]),
  thumbnail: z
    .string()
    .max(300)
    .refine((v) => v === "" || (/^\/(?!\/)[^\s\\]+$/.test(v) && !v.includes("..")), {
      message: "thumbnail은 /로 시작하는 public 경로만 허용합니다.",
    })
    .optional(),
  consent: z.string().optional(),
});

function toSlug(externalId: string) {
  return externalId
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseSheetRows(csvText: string): { rows: { line: number; data: Record<string, unknown> }[]; skipped: SyncSkip[] } {
  const table = parseCsv(csvText);
  if (table.length === 0) throw new SyncAbort("시트가 비어 있습니다.");

  const header = table[0].map((h) => h.trim().toLowerCase());
  const personal = header.find((h) => PERSONAL_HEADERS.some((p) => h.includes(p)));
  if (personal) {
    throw new SyncAbort(`개인정보 열(${personal})이 있어 동기화를 중단했습니다. 시트에서 제거해 주세요.`);
  }
  if (!header.includes("external_id") || !header.includes("title") || !header.includes("status")) {
    throw new SyncAbort("필수 열(external_id, title, status)이 없습니다.");
  }

  const rows: { line: number; data: Record<string, unknown> }[] = [];
  const skipped: SyncSkip[] = [];
  for (let i = 1; i < table.length; i++) {
    const data: Record<string, unknown> = {};
    header.forEach((name, idx) => {
      data[name] = cell(table[i][idx]);
    });
    if (!data.status) data.status = "draft";
    rows.push({ line: i + 1, data });
  }
  return { rows, skipped };
}

export type ValidSheetRow = {
  line: number;
  externalId: string;
  slug: string;
  title: string;
  category: string | null;
  summary: string | null;
  content: string | null;
  published_at: string | null;
  status: "draft" | "published" | "hidden";
  thumbnail: string | null;
};

export function validateSheetRows(
  rows: { line: number; data: Record<string, unknown> }[],
): { valid: ValidSheetRow[]; skipped: SyncSkip[] } {
  const valid: ValidSheetRow[] = [];
  const skipped: SyncSkip[] = [];
  const seen = new Set<string>();

  for (const { line, data } of rows) {
    const parsed = rowSchema.safeParse(data);
    if (!parsed.success) {
      skipped.push({ line, reason: parsed.error.issues[0]?.message ?? "형식 오류" });
      continue;
    }
    const r = parsed.data;
    if (seen.has(r.external_id)) {
      skipped.push({ line, reason: `같은 external_id가 시트에 두 번 있습니다: ${r.external_id}` });
      continue;
    }
    seen.add(r.external_id);

    if (r.status === "published" && (r.consent ?? "").toUpperCase() !== "Y") {
      skipped.push({ line, reason: "게시하려면 consent 열에 Y가 필요합니다(사진·실명 동의 확인)." });
      continue;
    }

    const slug = toSlug(r.slug && r.slug !== "" ? r.slug : r.external_id);
    if (slug === "") {
      skipped.push({ line, reason: "slug를 만들 수 없습니다. slug 열을 영문으로 채워 주세요." });
      continue;
    }

    valid.push({
      line,
      externalId: r.external_id,
      slug,
      title: r.title,
      category: r.category || null,
      summary: r.summary || null,
      content: r.content || null,
      published_at: r.published_at || null,
      status: r.status,
      thumbnail: r.thumbnail || null,
    });
  }
  return { valid, skipped };
}

/** Fetches the published CSV with a timeout and a size cap. */
export async function fetchSheetCsv(url: string): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS), redirect: "follow" });
  if (!res.ok) throw new SyncAbort(`시트를 가져오지 못했습니다 (HTTP ${res.status}).`);
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength > MAX_SHEET_BYTES) throw new SyncAbort("시트가 너무 큽니다.");
  return decodeCsvBytes(bytes);
}

/**
 * Applies a parsed sheet to the news table. Callers pass a service-role
 * client, because no admin session exists during a scheduled run. This is
 * the only code that writes sheet-sourced rows.
 */
export async function syncNewsFromCsv(
  admin: SupabaseClient<Database>,
  csvText: string,
): Promise<SyncReport> {
  const parsed = parseSheetRows(csvText);
  const { valid, skipped } = validateSheetRows(parsed.rows);
  skipped.push(...parsed.skipped);

  const report: SyncReport = { added: 0, updated: 0, lockedSkipped: [], skipped, missingFromSheet: 0 };

  const externalIds = valid.map((v) => v.externalId);
  const slugs = valid.map((v) => v.slug);

  const [{ data: sheetRows, error: sheetError }, { data: sameIdRows, error: idError }, { data: slugRows, error: slugError }] =
    await Promise.all([
      admin.from("news").select("id, external_id, admin_locked").eq("source", "sheet"),
      externalIds.length
        ? admin.from("news").select("id, external_id, source, admin_locked").in("external_id", externalIds)
        : Promise.resolve({ data: [], error: null }),
      slugs.length
        ? admin.from("news").select("slug, source").in("slug", slugs)
        : Promise.resolve({ data: [], error: null }),
    ]);
  const readError = sheetError ?? idError ?? slugError;
  if (readError) throw new SyncAbort(readError.message);

  const sheetOwned = new Set((sheetRows ?? []).map((r) => r.external_id!).filter(Boolean));
  const byExternal = new Map((sameIdRows ?? []).map((r) => [r.external_id!, r]));
  // Slugs held by manually created rows. A sheet row must not take them over.
  const manualSlugs = new Set((slugRows ?? []).filter((r) => r.source === "manual").map((r) => r.slug));

  for (const row of valid) {
    const existing = byExternal.get(row.externalId);
    const payload = {
      title: row.title,
      slug: row.slug,
      category: row.category,
      summary: row.summary,
      content: row.content,
      published_at: row.published_at,
      status: row.status,
      thumbnail: row.thumbnail,
      source_synced_at: new Date().toISOString(),
    };

    if (!existing) {
      if (manualSlugs.has(row.slug)) {
        report.skipped.push({ line: row.line, reason: `slug '${row.slug}'가 직접 등록한 소식과 겹칩니다.` });
        continue;
      }
      const { error } = await admin
        .from("news")
        .insert({ ...payload, external_id: row.externalId, source: "sheet", admin_locked: false });
      if (error) {
        report.skipped.push({ line: row.line, reason: error.message });
        continue;
      }
      report.added++;
      continue;
    }

    if (existing.source !== "sheet") {
      report.skipped.push({ line: row.line, reason: "직접 등록한 소식과 external_id가 겹칩니다." });
      continue;
    }
    if (existing.admin_locked) {
      report.lockedSkipped.push(row.externalId);
      continue;
    }

    const { error } = await admin.from("news").update(payload).eq("id", existing.id);
    if (error) {
      report.skipped.push({ line: row.line, reason: error.message });
      continue;
    }
    report.updated++;
  }

  const sheetIds = new Set(valid.map((v) => v.externalId));
  report.missingFromSheet = [...sheetOwned].filter((id) => !sheetIds.has(id)).length;

  return report;
}
