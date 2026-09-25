import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/data/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export const metadata: Metadata = {
  title: "사업",
  description: "미래를여는빛이 진행하는 사업 목록",
};

export default async function ProjectsPage() {
  const projects = await getAllProjects();

  return (
    <div className="section-wrap py-16 md:py-20">
      <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
        Projects
      </p>
      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-10">사업</h1>

      {projects.length === 0 ? (
        <div className="border border-dashed border-navy/20 rounded-sm py-24 text-center">
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
              <h2 className="font-display text-[17px] text-navy mb-1.5 group-hover:text-gold-dark">
                {project.title}
              </h2>
              {project.location && (
                <p className="text-[12.5px] text-gold-dark mb-1">{project.location}</p>
              )}
              {project.summary && <p className="text-[13.5px] text-muted line-clamp-2">{project.summary}</p>}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
