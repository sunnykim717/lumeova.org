"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertProject } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import { PROJECT_TEMPLATES, suggestSlug } from "@/lib/admin/contentTemplates";
import type { ContentStatus, Project } from "@/lib/types/database";

export function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(project?.title ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [summary, setSummary] = useState(project?.summary ?? "");
  const [content, setContent] = useState(project?.content ?? "");
  const [location, setLocation] = useState(project?.location ?? "");
  const [startDate, setStartDate] = useState(project?.start_date ?? "");
  const [endDate, setEndDate] = useState(project?.end_date ?? "");
  const [status, setStatus] = useState<ContentStatus>(project?.status ?? "draft");
  const [consentChecked, setConsentChecked] = useState(Boolean(project?.consent_confirmed_at));
  const [template, setTemplate] = useState<keyof typeof PROJECT_TEMPLATES>("blank");

  function applyTemplate(key: keyof typeof PROJECT_TEMPLATES) {
    setTemplate(key);
    // A template only fills an empty body, so it never overwrites text.
    if (!content.trim()) setContent(PROJECT_TEMPLATES[key].body);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await upsertProject({
          id: project?.id,
          title,
          slug,
          summary,
          content,
          location,
          start_date: startDate,
          end_date: endDate,
          status,
          consentChecked,
        });
        router.push("/admin/projects");
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

      {!project && (
        <div>
          <label className="block text-[13px] text-muted mb-1.5">시작 틀</label>
          <select
            value={template}
            onChange={(e) => applyTemplate(e.target.value as keyof typeof PROJECT_TEMPLATES)}
            className="rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
          >
            {Object.entries(PROJECT_TEMPLATES).map(([key, t]) => (
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
          {!project && (
            <button
              type="button"
              onClick={() => setSlug(suggestSlug(title, new Date().toISOString().slice(0, 10)))}
              className="mt-1.5 text-[12px] text-navy underline underline-offset-4"
            >
              제목으로 제안 (영문이 없으면 날짜)
            </button>
          )}
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

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[13px] text-muted mb-1.5">활동지역</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] text-muted mb-1.5">시작일</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
          />
        </div>
        <div>
          <label className="block text-[13px] text-muted mb-1.5">종료일</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]"
          />
        </div>
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

      <label className="flex items-start gap-2 text-[13px] text-ink">
        <input
          type="checkbox"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
          className="mt-0.5"
        />
        <span>사진·실명 게시에 동의를 받았거나, 해당 사항이 없습니다. (게시 상태로 저장하려면 필수)</span>
      </label>

      <Button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
