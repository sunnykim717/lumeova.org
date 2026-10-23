import { createClient } from "@/lib/supabase/server";
import { TrashActionButton } from "@/components/admin/TrashActionButton";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminTrashPage() {
  const supabase = await createClient();

  const [news, projects, stories] = await Promise.all([
    supabase.from("news").select("id, title, deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
    supabase.from("projects").select("id, title, deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
    supabase.from("field_stories").select("id, title, deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
  ]);

  const rows = [
    ...(news.data ?? []).map((r) => ({ ...r, table: "news" as const, label: "소식" })),
    ...(projects.data ?? []).map((r) => ({ ...r, table: "projects" as const, label: "사업" })),
    ...(stories.data ?? []).map((r) => ({ ...r, table: "field_stories" as const, label: "현장 이야기" })),
  ].sort((a, b) => (b.deleted_at ?? "").localeCompare(a.deleted_at ?? ""));

  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-2">휴지통</h1>
      <p className="text-[13px] text-muted mb-6">
        삭제한 글은 여기에서 복구할 수 있습니다. 영구 삭제한 글은 되돌릴 수 없습니다.
      </p>

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-navy/10 text-left text-muted text-[12px]">
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">구분</th>
              <th className="px-4 py-3 font-medium">삭제한 시각</th>
              <th className="px-4 py-3 font-medium">처리</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  휴지통이 비어 있습니다.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={`${r.table}-${r.id}`} className="border-b border-navy/5 last:border-0">
                  <td className="px-4 py-3 text-ink font-medium">{r.title}</td>
                  <td className="px-4 py-3 text-muted">{r.label}</td>
                  <td className="px-4 py-3 text-muted">{r.deleted_at ? formatDateTime(r.deleted_at) : "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <TrashActionButton table={r.table} id={r.id} mode="restore" />
                      <TrashActionButton table={r.table} id={r.id} mode="purge" />
                    </div>
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
