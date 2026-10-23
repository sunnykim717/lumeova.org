import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteFieldStory } from "@/lib/actions/admin";
import { STORY_STATUS_LABEL, storyPeriodLabel } from "@/lib/constants/fieldStories";

export default async function AdminFieldStoriesPage() {
  const supabase = await createClient();
  const { data: stories } = await supabase
    .from("field_stories")
    .select("id, title, slug, country, period, status, source, privacy_reviewed, activity_date, updated_at")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-display text-[24px] text-navy">현장 이야기 관리</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/field-stories/import"
            className="text-[13px] px-4 py-2 rounded-sm border border-navy/20 text-navy hover:bg-navy/5"
          >
            BAND 기록 가져오기
          </Link>
          <Link
            href="/admin/field-stories/new"
            className="text-[13px] px-4 py-2 rounded-sm bg-navy text-cream hover:bg-navy-light"
          >
            + 새 이야기
          </Link>
        </div>
      </div>

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-navy/10 text-left text-muted text-[12px]">
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">국가</th>
              <th className="px-4 py-3 font-medium">구분</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">검토</th>
              <th className="px-4 py-3 font-medium">처리</th>
            </tr>
          </thead>
          <tbody>
            {(stories ?? []).length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted">
                  등록된 현장 이야기가 없습니다.
                </td>
              </tr>
            ) : (
              (stories ?? []).map((s) => (
                <tr key={s.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-4 py-3 text-ink font-medium">
                    {s.title}
                    {s.source === "band" && <span className="ml-2 text-[11px] text-muted">[BAND]</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">{s.country ?? "-"}</td>
                  <td className="px-4 py-3 text-muted">{storyPeriodLabel(s.period)}</td>
                  <td className="px-4 py-3 text-muted">{STORY_STATUS_LABEL[s.status]}</td>
                  <td className="px-4 py-3 text-muted">{s.privacy_reviewed ? "완료" : "미완료"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link
                        href={`/admin/field-stories/${s.id}/edit`}
                        className="text-[12px] text-navy underline underline-offset-4"
                      >
                        수정
                      </Link>
                      <DeleteButton id={s.id} action={deleteFieldStory} confirmLabel="이 이야기를 삭제할까요?" />
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
