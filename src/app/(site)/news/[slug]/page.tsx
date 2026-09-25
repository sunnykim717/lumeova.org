import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNewsBySlug } from "@/lib/data/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);
  if (!news) return { title: "소식" };
  return {
    title: news.title,
    description: news.summary ?? undefined,
  };
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const news = await getNewsBySlug(slug);

  if (!news) notFound();

  const published = formatDate(news.published_at);

  return (
    <article className="section-wrap py-16 md:py-20 max-w-2xl">
      <Link href="/news" className="text-[13px] text-muted hover:text-gold-dark underline underline-offset-4">
        ← 소식 목록
      </Link>

      <div className="mt-5 mb-4">
        {news.category && (
          <span className="text-[11.5px] text-gold-dark font-medium mr-2 uppercase tracking-wide">
            {news.category}
          </span>
        )}
        {published && <span className="text-[12.5px] text-muted tabular-nums">{published}</span>}
      </div>

      <h1 className="font-display text-[26px] md:text-[30px] text-navy mb-8">{news.title}</h1>

      <ImagePlaceholder
        alt={news.title}
        exists={Boolean(news.thumbnail)}
        src={news.thumbnail ?? undefined}
        aspect="wide"
        className="rounded-sm mb-8"
      />

      {news.content ? (
        <div className="text-[14.5px] text-ink leading-relaxed whitespace-pre-line">{news.content}</div>
      ) : (
        <p className="text-[13.5px] text-muted italic">자세한 내용은 준비 중입니다.</p>
      )}
    </article>
  );
}
