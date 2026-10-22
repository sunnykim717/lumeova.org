import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchSheetCsv, SyncAbort, syncNewsFromCsv } from "@/lib/sync/newsSheet";

/**
 * Scheduled news sync (design §6.1.4). Called by the GitHub Actions workflow
 * with `Authorization: Bearer <CRON_SECRET>`. The comparison is constant-time
 * on SHA-256 digests, so neither the secret nor its length leaks by timing.
 */

function sameSecret(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b) && provided.length === expected.length;
}

export async function POST(req: NextRequest) {
  const expected = process.env.CRON_SECRET;
  const sheetUrl = process.env.NEWS_SHEET_CSV_URL;
  if (!expected || !sheetUrl) {
    return NextResponse.json({ error: "동기화가 설정되지 않았습니다." }, { status: 503 });
  }

  const auth = req.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!provided || !sameSecret(provided, expected)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: run } = await admin
    .from("sync_runs")
    .insert({ source: "news_sheet", status: "running" })
    .select("id")
    .single();

  try {
    const csv = await fetchSheetCsv(sheetUrl);
    const report = await syncNewsFromCsv(admin, csv);

    // Refresh public stats right after a sync. Only aggregates are written.
    const { error: statsError } = await admin.rpc("refresh_site_stats");

    const status = report.skipped.length > 0 || statsError ? "partial" : "ok";
    if (run) {
      await admin
        .from("sync_runs")
        .update({
          status,
          finished_at: new Date().toISOString(),
          added: report.added,
          updated: report.updated,
          skipped: report.skipped.length + report.lockedSkipped.length,
          report: { ...report, statsError: statsError?.message ?? null },
        })
        .eq("id", run.id);
    }
    return NextResponse.json({ ok: true, ...report, statsRefreshed: !statsError });
  } catch (err) {
    const message = err instanceof Error ? err.message : "동기화 중 오류가 발생했습니다.";
    if (run) {
      await admin
        .from("sync_runs")
        .update({ status: "failed", finished_at: new Date().toISOString(), report: { error: message } })
        .eq("id", run.id);
    }
    const status = err instanceof SyncAbort ? 422 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
