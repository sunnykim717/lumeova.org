import { getPublicStats, type PublicStat } from "@/lib/data/content";

/**
 * Public aggregate statistics (design §6.2). Shows only the values the
 * server already approved. With no visible values it renders the same
 * "준비중" placeholder style as the other empty sections.
 */

const LABEL: Record<string, string> = {
  approved_members: "함께하는 회원",
  donor_count: "후원에 참여한 분",
  confirmed_total: "누적 후원액",
  published_news: "전해 드린 소식",
};

const UNIT: Record<string, string> = {
  approved_members: "명",
  donor_count: "명",
  confirmed_total: "원 이상",
  published_news: "건",
};

function formatAsOf(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export async function SiteStats() {
  const stats: PublicStat[] = (await getPublicStats()).filter((s) => LABEL[s.key]);

  return (
    <section className="section-wrap py-16 md:py-20">
      <h2 className="font-display text-[22px] text-navy mb-8">함께한 발자취</h2>

      {stats.length === 0 ? (
        <div className="border border-dashed border-navy/20 rounded-sm py-16 text-center">
          <p className="text-[14px] text-muted">통계는 확인되는 대로 공개합니다. (준비 중)</p>
        </div>
      ) : (
        <>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((s) => (
              <div key={s.key} className="rounded-sm border border-navy/10 bg-white p-6">
                <dt className="text-[12.5px] text-muted mb-2">{LABEL[s.key]}</dt>
                <dd className="font-display text-[26px] text-navy tabular-nums">
                  {s.value.toLocaleString("ko-KR")}
                  <span className="text-[14px] text-muted ml-1">{UNIT[s.key]}</span>
                </dd>
              </div>
            ))}
          </dl>
          <p className="text-[12px] text-muted mt-4">기준일 {formatAsOf(stats[0].asOf)}</p>
        </>
      )}
    </section>
  );
}
