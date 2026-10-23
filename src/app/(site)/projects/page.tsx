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
      {!category && (
        <section className="max-w-2xl mb-14 space-y-16">
          <div>
            <p className="font-display text-[22px] text-navy mb-2">우리가 준비하는 사업</p>
          </div>

          <article id="education_support" className="scroll-mt-28">
            <p className="text-[12px] font-semibold text-gold-dark mb-2">01. 교육지원</p>
            <h2 className="font-display text-[22px] text-navy mb-2">배움의 기회가 이어질 수 있도록</h2>
            <ImagePlaceholder exists={false} alt="교육지원 사진 자리" aspect="wide" className="rounded-sm mb-6" />
            <p className="text-[14.5px] text-muted leading-relaxed mb-4">
              배우고 싶은 마음이 있어도 경제적 어려움이나 생활환경 때문에 학업을 이어가기 어려운 아동과 청소년들이
              있습니다.
            </p>
            <p className="text-[14.5px] text-muted leading-relaxed mb-6">
              미래를여는빛은 이러한 어려움을 조금이나마 줄이고, 더 많은 아이들이 자신의 가능성을 발견하며 미래를
              준비할 수 있도록 교육지원사업을 추진하고자 합니다.
            </p>
            <p className="text-[14px] font-semibold text-navy mb-3">주요 지원 방향</p>
            <ul className="list-disc pl-5 space-y-2 text-[14.5px] text-muted leading-relaxed mb-6">
              <li>등록금 및 교육비 지원: 경제적 어려움으로 학업을 지속하기 힘든 아동과 청소년의 교육비 부담을 줄입니다.</li>
              <li>학용품 지원: 공책, 필기구 등 학습에 필요한 기본적인 물품을 지원합니다.</li>
              <li>교육환경 개선: 현지의 필요에 따라 학습 공간과 교육 여건을 개선할 수 있는 방안을 모색합니다.</li>
            </ul>
            <p className="text-[14.5px] text-muted leading-relaxed mb-4">
              현재 현지 활동가들과 소통하며 사업 대상 국가와 지역, 지원 방식 등을 검토하고 있습니다.
            </p>
            <p className="text-[13.5px] font-semibold text-navy">사업 현황: 준비 중</p>
          </article>

          <article id="leadership_support" className="scroll-mt-28">
            <p className="text-[12px] font-semibold text-gold-dark mb-2">02. 리더십 지원</p>
            <h2 className="font-display text-[22px] text-navy mb-2">지역의 미래를 이끌어 갈 힘을 키웁니다</h2>
            <ImagePlaceholder exists={false} alt="리더십 지원 사진 자리" aspect="wide" className="rounded-sm mb-6" />
            <p className="text-[14.5px] text-muted leading-relaxed mb-4">
              지역사회의 변화는 그곳에서 살아가는 이들이 스스로 필요를 발견하고 해결 방법을 찾아갈 때 더욱 오래
              이어질 수 있습니다.
            </p>
            <p className="text-[14.5px] text-muted leading-relaxed mb-6">
              미래를여는빛은 현지 활동가와 주민들이 자신의 경험과 역량을 바탕으로 지역의 문제를 해결하고, 공동체의
              발전을 이끌어 갈 수 있도록 리더십 지원사업을 구상하고 있습니다.
            </p>
            <p className="text-[14px] font-semibold text-navy mb-3">주요 지원 방향</p>
            <ul className="list-disc pl-5 space-y-2 text-[14.5px] text-muted leading-relaxed mb-6">
              <li>현지 활동가 역량 강화: 지역의 필요를 파악하고 사업을 기획·운영하는 데 필요한 역량을 키울 수 있도록 지원합니다.</li>
              <li>지역사회 리더십 교육: 주민들이 공동체의 문제를 함께 논의하고 해결 과정에 참여할 수 있도록 돕습니다.</li>
              <li>교류와 협력: 다양한 경험과 지식을 나누고, 현지 기관 및 활동가 간 협력관계를 형성할 수 있도록 지원합니다.</li>
            </ul>
            <p className="text-[14.5px] text-muted leading-relaxed mb-4">
              리더십 지원은 외부의 방식이나 해답을 전달하는 것이 아니라, 현지에서 이미 활동하고 있는 이들의 경험과
              가능성을 존중하는 데서 출발합니다.
            </p>
            <p className="text-[13.5px] font-semibold text-navy">사업 현황: 구상 단계</p>
          </article>

          <section>
            <p className="text-[12px] font-semibold text-gold-dark mb-2">현장과 함께 준비합니다</p>
            <p className="text-[14.5px] text-muted leading-relaxed mb-4">
              미래를여는빛은 사업을 먼저 정해 놓고 지원 대상을 찾기보다, 현지의 이야기를 듣고 실제 필요한 것이 무엇인지
              함께 고민합니다.
            </p>
            <p className="text-[14.5px] text-muted leading-relaxed mb-4">
              현재 교육지원사업을 위한 후원자를 모집하고 있으며, 현지 활동가들과 연락을 이어가고 있습니다. 또한 향후
              안정적인 협력을 위한 업무협약(MOU)을 준비하고 있습니다.
            </p>
            <p className="text-[14.5px] text-muted leading-relaxed">
              사업 대상 국가와 구체적인 지원 규모, 추진 일정은 아직 확정되지 않았습니다. 준비 과정과 향후 진행 상황은
              확인되는 대로 투명하게 안내하겠습니다.
            </p>
          </section>
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
