import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/data/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "사업" };
  return {
    title: project.title,
    description: project.summary ?? undefined,
  };
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  const start = formatDate(project.start_date);
  const end = formatDate(project.end_date);

  return (
    <article className="section-wrap py-16 md:py-20 max-w-3xl">
      <Link
        href="/projects"
        className="text-[13px] text-muted hover:text-gold-dark underline underline-offset-4"
      >
        ← 사업 목록
      </Link>

      <h1 className="font-display text-[26px] md:text-[30px] text-navy mt-5 mb-4">
        {project.title}
      </h1>

      <div className="flex flex-wrap gap-x-6 gap-y-1 text-[13px] text-muted mb-8">
        {project.location && <span>지역 · {project.location}</span>}
        {(start || end) && (
          <span>
            기간 · {start ?? "미정"} {end ? `~ ${end}` : ""}
          </span>
        )}
      </div>

      <ImagePlaceholder
        alt={project.title}
        exists={Boolean(project.thumbnail)}
        src={project.thumbnail ?? undefined}
        aspect="wide"
        className="rounded-sm mb-8"
      />

      {project.summary && (
        <p className="text-[15px] text-navy font-medium leading-relaxed mb-6">{project.summary}</p>
      )}

      {project.content ? (
        <div className="text-[14.5px] text-ink leading-relaxed whitespace-pre-line">
          {project.content}
        </div>
      ) : (
        <p className="text-[13.5px] text-muted italic">자세한 내용은 준비 중입니다.</p>
      )}
    </article>
  );
}
