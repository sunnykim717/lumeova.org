import { createClient } from "@/lib/supabase/server";
import { auditActionLabel, auditTargetLabel } from "@/lib/constants/auditLabels";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default async function AdminHistoryPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from("audit_logs")
    .select("id, action, target_type, target_id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-2">변경 이력</h1>
      <p className="text-[13px] text-muted mb-6">최근 관리자 작업 200건을 보여 줍니다. 최고 관리자와 매니저만 볼 수 있습니다.</p>

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-navy/10 text-left text-muted text-[12px]">
              <th className="px-4 py-3 font-medium">시각</th>
              <th className="px-4 py-3 font-medium">작업</th>
              <th className="px-4 py-3 font-medium">대상</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-10 text-center text-muted">
                  기록된 작업이 없습니다.
                </td>
              </tr>
            ) : (
              (logs ?? []).map((log) => (
                <tr key={log.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-4 py-3 text-muted whitespace-nowrap">{formatDateTime(log.created_at)}</td>
                  <td className="px-4 py-3 text-ink">{auditActionLabel(log.action)}</td>
                  <td className="px-4 py-3 text-muted">{auditTargetLabel(log.target_type)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
