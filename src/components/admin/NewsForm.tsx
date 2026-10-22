"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setNewsSyncLock, upsertNews } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import { NEWS_TEMPLATES, publishChecklist, suggestSlug } from "@/lib/admin/contentTemplates";
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
  const [consentChecked, setConsentChecked] = useState(Boolean(news?.consent_confirmed_at));
  const [template, setTemplate] = useState<keyof typeof NEWS_TEMPLATES>("blank");

  const todayIso = new Date().toISOString().slice(0, 10);
  const checklist = publishChecklist({
    status,
    content,
    thumbnail: news?.thumbnail ?? null,
    publishedAt: publishedAt || null,
    consentChecked,
    todayIso,
  });

  function applyTemplate(key: keyof typeof NEWS_TEMPLATES) {
    setTemplate(key);
    // A template only fills an empty body, so it never overwrites text.
    if (!content.trim()) setContent(NEWS_TEMPLATES[key].body);
  }

  function unlockSync() {
    if (!news) return;
    startTransition(async () => {
      await setNewsSyncLock(news.id, false);
      router.refresh();
    });
  }

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
          consentChecked,
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

      {news?.source === "sheet" && (
        <div className="text-[13px] text-muted bg-sage/50 border border-navy/10 rounded-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <span>
            시트에서 가져온 소식입니다.{" "}
            {news.admin_locked
              ? "이 화면에서 고쳤으므로 시트 변경이 덮어쓰지 않습니다(잠금)."
              : "저장하면 이후 시트 동기화가 이 소식을 덮어쓰지 않도록 잠깁니다."}
          </span>
          {news.admin_locked && (
            <button
              type="button"
              onClick={unlockSync}
              disabled={isPending}
              className="text-[12px] px-2.5 py-1 rounded-sm border border-navy/20 text-navy hover:border-navy/40 disabled:opacity-50"
            >
              잠금 해제 (다음 동기화 때 시트 값 반영)
            </button>
          )}
        </div>
      )}

      {!news && (
        <div>
          <label className="block text-[13px] text-muted mb-1.5">시작 틀</label>
          <select
            value={template}
            onChange={(e) => applyTemplate(e.target.value as keyof typeof NEWS_TEMPLATES)}
            className="rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
          >
            {Object.entries(NEWS_TEMPLATES).map(([key, t]) => (
              <option key={key} value={key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
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
          {!news && (
            <button
              type="button"
              onClick={() => setSlug(suggestSlug(title, publishedAt))}
              className="mt-1.5 text-[12px] text-navy underline underline-offset-4"
            >
              제목으로 제안 (영문이 없으면 날짜)
            </button>
          )}
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

      <div className="rounded-sm border border-navy/10 bg-white p-4 space-y-3">
        <p className="text-[13px] text-navy font-medium">발행 전 확인</p>
        <label className="flex items-start gap-2 text-[13px] text-ink">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-0.5"
          />
          <span>사진·실명 게시에 동의를 받았거나, 해당 사항이 없습니다. (게시 상태로 저장하려면 필수)</span>
        </label>
        <ul className="space-y-1">
          {checklist
            .filter((c) => c.code !== "CONSENT")
            .map((c) => (
              <li key={c.code} className={`text-[12.5px] ${c.ok ? "text-muted" : "text-gold-dark"}`}>
                {c.ok ? "✓" : "!"} {c.label}
              </li>
            ))}
        </ul>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
