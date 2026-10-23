import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedFieldStories, getPublishedStoryCountries } from "@/lib/data/fieldStories";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { STORY_HEADING, STORY_LEAD, STORY_PERIODS, isStoryPeriod, storyPeriodLabel, type StoryPeriod } from "@/lib/constants/fieldStories";

export const metadata: Metadata = {
  title: STORY_HEADING,
  description: STORY_LEAD,
};

export const revalidate = 300;

type Props = {
  searchParams: Promise<{ country?: string; period?: string }>;
};

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function buildHref(country: string | null, period: StoryPeriod | null) {
  const params = new URLSearchParams();
  if (country) params.set("country", country);
  if (period) params.set("period", period);
  const query = params.toString();
  return query ? `/field-stories?${query}` : "/field-stories";
}

const TAB_CLASS = (active: boolean) =>
  `text-[13px] px-3.5 py-1.5 rounded-sm border ${
    active ? "bg-navy text-cream border-navy" : "border-navy/15 text-navy hover:bg-navy/5"
  }`;

export default async function FieldStoriesPage({ searchParams }: Props) {
  const { country: rawCountry, period: rawPeriod } = await searchParams;
  const country = rawCountry?.trim() || null;
  const period = isStoryPeriod(rawPeriod) ? rawPeriod : null;

  const [stories, countries] = await Promise.all([
    getPublishedFieldStories({ country, period }),
    getPublishedStoryCountries(),
  ]);

  return (
    <div className="section-wrap py-16 md:py-20">
      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-3">{STORY_HEADING}</h1>
      <p className="text-[14.5px] text-muted leading-relaxed mb-10 max-w-2xl">{STORY_LEAD}</p>

      <div className="space-y-4 mb-10">
        <div className="flex flex-wrap gap-2">
          <Link href={buildHref(country, null)} className={TAB_CLASS(period === null)}>
            전체 구분
          </Link>
          {STORY_PERIODS.map((p) => (
            <Link key={p.value} href={buildHref(country, p.value)} className={TAB_CLASS(period === p.value)}>
              {p.label}
            </Link>
          ))}
        </div>
        {countries.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Link href={buildHref(null, period)} className={TAB_CLASS(country === null)}>
              전체 국가
            </Link>
            {countries.map((c) => (
              <Link key={c} href={buildHref(c, period)} className={TAB_CLASS(country === c)}>
                {c}
              </Link>
            ))}
          </div>
        )}
      </div>

      {stories.length === 0 ? (
        <div className="border border-dashed border-navy/20 rounded-sm py-24 text-center">
          <p className="text-[14px] text-muted">등록된 현장 이야기가 준비 중입니다.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <Link key={story.id} href={`/field-stories/${story.slug}`} className="group block">
              <ImagePlaceholder
                alt={story.photos.find((p) => p.consent)?.caption || story.title}
                exists={Boolean(story.photos.find((p) => p.consent))}
                src={story.photos.find((p) => p.consent)?.url}
                aspect="video"
                className="mb-4 rounded-sm"
              />
              <p className="text-[12px] text-gold-dark mb-1.5">
                {[story.country, storyPeriodLabel(story.period), formatDate(story.activity_date)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <h2 className="font-display text-[17px] text-navy mb-1.5 group-hover:text-gold-dark">{story.title}</h2>
              {story.summary && <p className="text-[13.5px] text-muted line-clamp-2">{story.summary}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
