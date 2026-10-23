"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { importBandPost } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import { STORY_PERIODS, parseBandPaste, type StoryPeriod } from "@/lib/constants/fieldStories";

const INPUT = "w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]";

export function BandImportForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [pasted, setPasted] = useState("");
  const [country, setCountry] = useState("");
  const [period, setPeriod] = useState<StoryPeriod>("post_founding");
  const [activityDate, setActivityDate] = useState("");
  const [bandUrl, setBandUrl] = useState("");

  const parsed = useMemo(() => parseBandPaste(pasted), [pasted]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const id = await importBandPost({
          title: parsed.title,
          body: parsed.body,
          country,
          period,
          activity_date: activityDate,
          band_url: bandUrl,
        });
        router.push(`/admin/field-stories/${id}/edit`);
      } catch (err) {
        setError(err instanceof Error ? err.message : "가져오는 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3">{error}</p>
      )}

      <div>
        <label className="block text-[13px] text-muted mb-1.5">BAND 게시글 내용 붙여넣기</label>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={12}
          placeholder="BAND 게시글을 복사해 붙여넣으세요. 첫 줄은 제목으로 쓰입니다."
          className={INPUT}
        />
        <p className="mt-2 text-[12.5px] text-muted">
          제목: <span className="text-navy">{parsed.title || "(없음)"}</span> · 본문 {parsed.body.length}자
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] text-muted mb-1.5">국가</label>
          <input value={country} onChange={(e) => setCountry(e.target.value)} className={INPUT} />
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
          <label className="block text-[13px] text-muted mb-1.5">BAND 원문 주소 (선택)</label>
          <input
            value={bandUrl}
            onChange={(e) => setBandUrl(e.target.value)}
            placeholder="https://band.us/..."
            className={INPUT}
          />
        </div>
      </div>

      <p className="text-[12.5px] text-muted">
        가져온 글은 임시저장 상태로 만들어지며, 사진과 개인정보 검토를 마친 뒤 공개할 수 있습니다.
      </p>

      <Button type="submit" disabled={isPending || !parsed.title}>
        {isPending ? "가져오는 중..." : "임시저장으로 가져오기"}
      </Button>
    </form>
  );
}
