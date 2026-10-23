"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertFieldStory } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import { STORY_PERIODS, STORY_STATUS_LABEL, type StoryPhoto, type StoryPeriod } from "@/lib/constants/fieldStories";
import type { FieldStory } from "@/lib/types/database";

const INPUT = "w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]";

export function FieldStoryForm({ story }: { story?: FieldStory }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(story?.title ?? "");
  const [slug, setSlug] = useState(story?.slug ?? "");
  const [country, setCountry] = useState(story?.country ?? "");
  const [period, setPeriod] = useState<StoryPeriod>(story?.period ?? "post_founding");
  const [activityDate, setActivityDate] = useState(story?.activity_date ?? "");
  const [summary, setSummary] = useState(story?.summary ?? "");
  const [body, setBody] = useState(story?.body ?? "");
  const [status, setStatus] = useState<"draft" | "published" | "hidden">(
    (story?.status as "draft" | "published" | "hidden") ?? "draft"
  );
  const [photos, setPhotos] = useState<StoryPhoto[]>(story?.photos ?? []);
  const [hasPersonalInfo, setHasPersonalInfo] = useState(story?.has_personal_info ?? false);
  const [privacyReviewed, setPrivacyReviewed] = useState(story?.privacy_reviewed ?? false);

  function updatePhoto(index: number, patch: Partial<StoryPhoto>) {
    setPhotos((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await upsertFieldStory({
          id: story?.id,
          title,
          slug,
          country,
          period,
          activity_date: activityDate,
          summary,
          body,
          status,
          photos,
          has_personal_info: hasPersonalInfo,
          privacy_reviewed: privacyReviewed,
        });
        router.push("/admin/field-stories");
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3">{error}</p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] text-muted mb-1.5">제목</label>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className="block text-[13px] text-muted mb-1.5">주소(slug, 영문 소문자·숫자·-)</label>
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            pattern="[a-z0-9\-]+"
            className={INPUT}
          />
        </div>
        <div>
          <label className="block text-[13px] text-muted mb-1.5">국가</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="예: 가나" className={INPUT} />
        </div>
        <div>
          <label className="block text-[13px] text-muted mb-1.5">구분</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value as StoryPeriod)} className={INPUT}>
            {STORY_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[13px] text-muted mb-1.5">활동일</label>
          <input type="date" value={activityDate} onChange={(e) => setActivityDate(e.target.value)} className={INPUT} />
        </div>
        <div>
          <label className="block text-[13px] text-muted mb-1.5">상태</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={INPUT}>
            {Object.entries(STORY_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-[13px] text-muted mb-1.5">요약 (목록에 표시)</label>
        <input value={summary} onChange={(e) => setSummary(e.target.value)} className={INPUT} />
      </div>

      <div>
        <label className="block text-[13px] text-muted mb-1.5">본문 (빈 줄로 문단을 나눕니다)</label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} className={INPUT} />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-[14px] font-medium text-navy">사진</h2>
          <button
            type="button"
            onClick={() => setPhotos((prev) => [...prev, { url: "", caption: "", consent: false }])}
            className="text-[13px] px-3 py-1.5 rounded-sm border border-navy/20 text-navy hover:bg-navy/5"
          >
            + 사진 추가
          </button>
        </div>
        <p className="text-[12.5px] text-muted">
          사진 경로(/images/... 또는 https://)를 입력합니다. 본인이 공개에 동의한 사진만 &quot;공개 동의&quot;를 체크하세요.
          체크하지 않은 사진은 공개 페이지에 나오지 않습니다.
        </p>
        {photos.map((photo, index) => (
          <div key={index} className="rounded-sm border border-navy/10 bg-white p-4 space-y-3">
            <input
              value={photo.url}
              onChange={(e) => updatePhoto(index, { url: e.target.value })}
              placeholder="/images/field/사진.jpg"
              className={INPUT}
            />
            <input
              value={photo.caption}
              onChange={(e) => updatePhoto(index, { caption: e.target.value })}
              placeholder="사진 설명"
              className={INPUT}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-[13px] text-navy">
                <input
                  type="checkbox"
                  checked={photo.consent}
                  onChange={(e) => updatePhoto(index, { consent: e.target.checked })}
                />
                공개 동의 확인
              </label>
              <button
                type="button"
                onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                className="text-[12px] text-red-700"
              >
                사진 삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-sm border border-navy/10 bg-white p-5 space-y-3">
        <h2 className="text-[14px] font-medium text-navy">개인정보 및 사진 공개 검토</h2>
        <label className="flex items-center gap-2 text-[13px] text-navy">
          <input type="checkbox" checked={hasPersonalInfo} onChange={(e) => setHasPersonalInfo(e.target.checked)} />
          본문이나 사진에 개인 식별 정보(이름, 연락처, 주소 등)가 있습니다
        </label>
        <label className="flex items-center gap-2 text-[13px] text-navy">
          <input type="checkbox" checked={privacyReviewed} onChange={(e) => setPrivacyReviewed(e.target.checked)} />
          검토를 마쳤습니다 (공개하려면 체크해야 합니다)
        </label>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
