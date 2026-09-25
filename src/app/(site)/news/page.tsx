import type { Metadata } from "next";
import Link from "next/link";
import { getAllNews } from "@/lib/data/content";

export const metadata: Metadata = {
  title: "소식",
  description: "미래를여는빛 소식 및 활동 소개",
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function NewsPage() {
  const news = await getAllNews();

  return (
    <div className="section-wrap py-16 md:py-20 max-w-3xl">
      <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
        News
      </p>
      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-10">소식</h1>

      {news.length === 0 ? (
        <div className="border border-dashed border-navy/20 rounded-sm py-24 text-center">
          <p className="text-[14px] text-muted">등록된 소식이 준비 중입니다.</p>
        </div>
      ) : (
        <ul className="divide-y divide-navy/10 border-t border-b border-navy/10">
          {news.map((item) => (
            <li key={item.id}>
              <Link href={`/news/${item.slug}`} className="flex items-baseline gap-4 py-5 group">
                <span className="text-[12.5px] text-muted tabular-nums w-[110px] shrink-0">
                  {formatDate(item.published_at)}
                </span>
                <div>
                  {item.category && (
                    <span className="text-[11.5px] text-gold-dark font-medium mr-2">
                      {item.category}
                    </span>
                  )}
                  <span className="text-[15px] text-navy group-hover:text-gold-dark">
                    {item.title}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
