"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertNews } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import type { ContentStatus, NewsItem } from "@/lib/types/database";

export function NewsForm({ news }: { news?: NewsItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(news?.title ?? "");
  const [slug, setSlug] = useState(news?.slug ?? "");
  const [category, setCategory] = useState(news?.category ?? "");
  const [summary, setSummary] = useState(news?.summary ?? "");
  const [content, setContent] = useState(news?.content ?? "");
  const [status, setStatus] = useState<ContentStatus>(news?.status ?? "draft");
  const [publishedAt, setPublishedAt] = useState(
    news?.published_at ? news.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await upsertNews({
          id: news?.id,
          title,
          slug,
          category,
          summary,
          content,
          status,
          published_at: publishedAt,
        });
        router.push("/admin/news");
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      {error && (
        <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3">{error}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] text-muted mb-1.5">제목</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] text-muted mb-1.5">slug (URL용, 영문/숫자/-)</label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9\-]+"
            className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] text-muted mb-1.5">카테고리</label>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] text-muted mb-1.5">게시일</label>
          <input
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
          />
        </div>
      </div>

      <div>
        <label className="block text-[13px] text-muted mb-1.5">요약 (목록에 노출)</label>
        <input
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
        />
      </div>

      <div>
        <label className="block text-[13px] text-muted mb-1.5">본문</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
        />
      </div>

      <div>
        <label className="block text-[13px] text-muted mb-1.5">상태</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ContentStatus)}
          className="rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
        >
          <option value="draft">임시저장</option>
          <option value="published">게시</option>
          <option value="hidden">숨김</option>
        </select>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
