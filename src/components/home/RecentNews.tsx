import Link from "next/link";
import { getRecentNews } from "@/lib/data/content";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export async function RecentNews() {
  const news = await getRecentNews(4);

  return (
    <section className="bg-sky/40 py-16 md:py-20">
      <div className="section-wrap">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">News</p>
            <h2 className="font-display text-[26px] md:text-[30px] text-navy">최근 소식</h2>
          </div>
          <Link href="/news" className="hidden sm:inline text-[13px] font-medium text-navy underline underline-offset-4 hover:text-gold-dark whitespace-nowrap">
            전체 보기 →
          </Link>
        </div>

        {news.length === 0 ? (
          <div className="border border-dashed border-navy/20 rounded-sm py-16 text-center bg-cream/40">
            <p className="text-[14px] text-muted">등록된 소식이 준비 중입니다.</p>
          </div>
        ) : (
          <ul className="divide-y divide-navy/10 border-t border-b border-navy/10">
            {news.map((item) => (
              <li key={item.id}>
                <Link href={`/news/${item.slug}`} className="flex items-baseline gap-4 py-4 group">
                  <span className="text-[12.5px] text-muted tabular-nums w-[110px] shrink-0">
                    {formatDate(item.published_at)}
                  </span>
                  <span className="text-[14.5px] text-navy group-hover:text-gold-dark truncate">
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
