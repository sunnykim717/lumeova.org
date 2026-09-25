import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteNews } from "@/lib/actions/admin";

const STATUS_LABEL: Record<string, string> = {
  draft: "임시저장",
  published: "게시됨",
  hidden: "숨김",
};

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: news } = await supabase
    .from("news")
    .select("id, title, slug, status, updated_at")
    .order("updated_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[24px] text-navy">소식 관리</h1>
        <Link
          href="/admin/news/new"
          className="text-[13px] px-4 py-2 rounded-sm bg-navy text-cream hover:bg-navy-light"
        >
          + 새 소식
        </Link>
      </div>

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-navy/10 text-left text-muted text-[12px]">
              <th className="px-4 py-3 font-medium">제목</th>
              <th className="px-4 py-3 font-medium">slug</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">처리</th>
            </tr>
          </thead>
          <tbody>
            {(news ?? []).length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  등록된 소식이 없습니다.
                </td>
              </tr>
            ) : (
              (news ?? []).map((n) => (
                <tr key={n.id} className="border-b border-navy/5 last:border-0">
                  <td className="px-4 py-3 text-ink font-medium">{n.title}</td>
                  <td className="px-4 py-3 text-muted">{n.slug}</td>
                  <td className="px-4 py-3 text-muted">{STATUS_LABEL[n.status]}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-3">
                      <Link href={`/admin/news/${n.id}/edit`} className="text-[12px] text-navy underline underline-offset-4">
                        수정
                      </Link>
                      <DeleteButton id={n.id} action={deleteNews} confirmLabel="이 소식을 삭제할까요?" />
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
