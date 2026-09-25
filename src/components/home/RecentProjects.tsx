import Link from "next/link";
import { getRecentProjects } from "@/lib/data/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export async function RecentProjects() {
  const projects = await getRecentProjects(3);

  return (
    <section className="py-16 md:py-20">
      <div className="section-wrap">
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
              Projects
            </p>
            <h2 className="font-display text-[26px] md:text-[30px] text-navy">주요 사업</h2>
          </div>
          <Link href="/projects" className="hidden sm:inline text-[13px] font-medium text-navy underline underline-offset-4 hover:text-gold-dark whitespace-nowrap">
            전체 보기 →
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="border border-dashed border-navy/20 rounded-sm py-16 text-center">
            <p className="text-[14px] text-muted">등록된 사업이 준비 중입니다.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link key={project.id} href={`/projects/${project.slug}`} className="group block">
                <ImagePlaceholder
                  alt={project.title}
                  exists={Boolean(project.thumbnail)}
                  src={project.thumbnail ?? undefined}
                  aspect="video"
                  className="mb-4 rounded-sm"
                />
                <h3 className="font-display text-[17px] text-navy mb-1.5 group-hover:text-gold-dark">
                  {project.title}
                </h3>
                {project.summary && <p className="text-[13.5px] text-muted line-clamp-2">{project.summary}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
