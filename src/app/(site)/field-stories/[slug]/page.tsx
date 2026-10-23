import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPublishedFieldStoryBySlug } from "@/lib/data/fieldStories";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { sanitizeStoryPhotos, storyPeriodLabel } from "@/lib/constants/fieldStories";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getPublishedFieldStoryBySlug(slug);
  if (!story) return { title: "현장 이야기" };
  return { title: story.title, description: story.summary ?? undefined };
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function FieldStoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const story = await getPublishedFieldStoryBySlug(slug);
  if (!story) notFound();

  // Only photos the person agreed to publish are shown.
  const photos = sanitizeStoryPhotos(story.photos).filter((p) => p.consent);
  const paragraphs = (story.body ?? "").split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <article className="section-wrap py-16 md:py-20 max-w-3xl">
      <Link href="/field-stories" className="text-[13px] text-navy underline underline-offset-4">
        ← 현장 이야기 목록
      </Link>

      <p className="text-[12px] text-gold-dark mt-8 mb-3">
        {[story.country, storyPeriodLabel(story.period), formatDate(story.activity_date)].filter(Boolean).join(" · ")}
      </p>
      <h1 className="font-display text-[26px] md:text-[32px] text-navy mb-6 leading-snug">{story.title}</h1>
      {story.summary && <p className="text-[15px] text-muted leading-relaxed mb-8">{story.summary}</p>}

      {photos.map((photo) => (
        <figure key={photo.url} className="mb-8">
          <ImagePlaceholder alt={photo.caption || story.title} exists src={photo.url} aspect="wide" className="rounded-sm" />
          {photo.caption && <figcaption className="mt-2 text-[12px] text-muted">{photo.caption}</figcaption>}
        </figure>
      ))}

      {paragraphs.map((text, i) => (
        <p key={i} className="text-[15px] text-muted leading-[1.85] mb-5">
          {text}
        </p>
      ))}

      {story.source === "band" && story.band_url && (
        <p className="mt-10 text-[13px] text-muted">
          원문 보기:{" "}
          <a href={story.band_url} className="text-navy underline underline-offset-4" target="_blank" rel="noopener noreferrer">
            네이버 BAND
          </a>
        </p>
      )}
    </article>
  );
}
