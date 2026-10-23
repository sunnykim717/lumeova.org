import type { Metadata } from "next";
import Link from "next/link";
import { getAllProjects } from "@/lib/data/content";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PROJECT_CATEGORIES, isProjectCategory, projectCategoryLabel } from "@/lib/constants/projects";

export const metadata: Metadata = {
  title: "사업",
  description: "미래를여는빛이 진행하는 사업 목록",
};

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export default async function ProjectsPage({ searchParams }: Props) {
  const { category: rawCategory } = await searchParams;
  const category = isProjectCategory(rawCategory) ? rawCategory : null;
  const allProjects = await getAllProjects();
  const projects = category ? allProjects.filter((p) => p.category === category) : allProjects;
  const heading = projectCategoryLabel(category) ?? "사업";

  return (
    <div className="section-wrap py-16 md:py-20">
      <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
        Projects
      </p>
      {!category && (
        <section className="max-w-2xl mb-14">
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">Our Programs</p>
          <h2 className="font-display text-[22px] text-navy mb-4">배움의 기회를 이어갑니다</h2>
          <p className="text-[14.5px] text-muted leading-relaxed mb-4">
            미래를여는빛은 교육을 통해 더 많은 아동과 청소년이 자신의 가능성을 발견하고 미래를 준비할 수 있도록
            교육지원사업을 구상하고 있습니다.
          </p>
          <p className="text-[14.5px] text-muted leading-relaxed mb-10">
            경제적 어려움이나 생활환경으로 인해 배움의 기회를 놓치지 않도록, 현지의 필요에 맞는 지원을 준비하고
            있습니다.
          </p>

          <h3 className="font-display text-[18px] text-navy mb-3">교육지원사업</h3>
          <p className="text-[13px] font-semibold text-gold-dark mb-3">현재 사업 준비 단계</p>
          <p className="text-[14.5px] text-muted leading-relaxed mb-6">
            교육을 이어가는 데 필요한 기본적인 비용과 물품을 지원하는 사업을 계획하고 있습니다.
          </p>
          <p className="text-[14.5px] font-semibold text-navy mb-2">등록금 지원</p>
          <p className="text-[14.5px] text-muted leading-relaxed mb-6">
            경제적 어려움으로 학업을 지속하기 어려운 아동과 청소년이 배움을 이어갈 수 있도록 등록금 등 교육비 지원을
            검토하고 있습니다.
          </p>
          <p className="text-[14.5px] font-semibold text-navy mb-2">학용품 지원</p>
          <p className="text-[14.5px] text-muted leading-relaxed mb-10">
            공책, 필기구 등 학습에 필요한 기본적인 물품을 지원하여 보다 안정적인 교육환경을 마련하는 데 도움을 주고자
            합니다.
          </p>

          <h3 className="font-display text-[18px] text-navy mb-3">현지의 필요에 맞는 사업</h3>
          <p className="text-[14.5px] text-muted leading-relaxed mb-4">
            교육환경과 지원이 필요한 상황은 나라마다 다릅니다.
          </p>
          <p className="text-[14.5px] text-muted leading-relaxed mb-4">
            미래를여는빛은 지원 국가나 지역을 미리 정하기보다, 현지 활동가들과 소통하며 교육환경과 실제 수요를 살펴보고
            있습니다.
          </p>
          <p className="text-[14.5px] text-muted leading-relaxed mb-10">
            사업 대상 지역과 구체적인 지원 방식은 현지 여건, 협력 가능성, 확보된 자원 등을 종합적으로 검토하여 결정할
            예정입니다.
          </p>

          <h3 className="font-display text-[18px] text-navy mb-3">함께 준비하는 과정</h3>
          <p className="text-[14.5px] text-muted leading-relaxed mb-4">
            현재 후원자를 모집하고 있으며, 현지 활동가 및 관련 기관과의 협력방안을 논의하고 업무협약(MOU)을 준비하고
            있습니다.
          </p>
          <p className="text-[14.5px] text-muted leading-relaxed mb-4">
            사업 대상과 지원 규모, 구체적인 일정은 아직 확정되지 않았습니다.
          </p>
          <p className="text-[14.5px] text-muted leading-relaxed mb-10">
            준비 과정과 향후 추진 상황은 확인되는 대로 홈페이지를 통해 안내하겠습니다.
          </p>

          <p className="font-display text-[18px] text-navy leading-[1.65] border-l-2 border-gold pl-5 mb-4">
            교육지원은 물품이나 비용을 전달하는 것에서 끝나지 않아야 합니다.
          </p>
          <p className="text-[14.5px] text-muted leading-relaxed">
            현지의 상황을 충분히 이해하고, 필요한 지원이 적절하게 이루어지는지 살피며, 배움의 기회가 아동과 청소년의
            삶에 긍정적인 변화로 이어질 수 있도록 노력하겠습니다.
          </p>
        </section>
      )}

      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-6">{heading}</h1>

      <div className="flex flex-wrap gap-2 mb-10">
        {[{ value: null, label: "전체" }, ...PROJECT_CATEGORIES].map((tab) => {
          const active = tab.value === category;
          return (
            <Link
              key={tab.label}
              href={tab.value ? `/projects?category=${tab.value}` : "/projects"}
              className={`text-[13px] px-3.5 py-1.5 rounded-sm border ${
                active ? "bg-navy text-cream border-navy" : "border-navy/15 text-navy hover:bg-navy/5"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

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
