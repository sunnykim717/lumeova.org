import type { Metadata } from "next";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export const metadata: Metadata = {
  title: "사업분야",
  description: "미래를여는빛 국제개발협력·교육·지역사회 협력 사업 소개",
};

// 사업 영역 정의
// NOTE (spec §48): 확인되지 않은 국가명, 기관명, 사업기간, 수혜인원, 예산, 성과는
// 절대 기재하지 않는다. 실제 협의·검토가 완료된 내용만 공개한다.
const AREAS = [
  {
    id: "development",
    tag: "01",
    title: "국제개발협력",
    body: "현지의 필요를 먼저 듣고, 교육과 지역 협력을 중심으로 지속 가능한 변화를 만드는 사업을 준비합니다. 사업지역과 협력기관은 실제 협의와 검토가 완료된 후 투명하게 공개합니다.",
    img: "/images/field-visit.jpg",
    imgAlt: "현장 방문 활동 모습",
  },
  {
    id: "education",
    tag: "02",
    title: "교육",
    body: "배움의 기회가 부족한 환경에서도 한 사람이 자신의 가능성을 발견하고 성장할 수 있도록 교육 프로그램과 학습 지원 활동을 기획합니다.",
    img: "/images/students-studying.jpg",
    imgAlt: "학생들이 공부하는 모습",
  },
  {
    id: "community",
    tag: "03",
    title: "지역사회 협력",
    body: "지역의 기관, 단체, 주민과 협력하여 교육과 생활 기반의 문제를 함께 살피고, 필요한 자원과 사람을 연결하는 협력 구조를 만들어갑니다.",
    img: "/images/community-meeting.jpg",
    imgAlt: "지역사회 모임 모습",
  },
  {
    id: "expansion",
    tag: "04",
    title: "새로운 사업",
    body: "단체의 목적과 현장의 필요에 부합하는 새로운 사업은 충분한 검토와 협력체계를 거쳐 단계적으로 확장합니다.",
    img: "/images/children-group.jpg",
    imgAlt: "아이들 단체 활동 모습",
  },
];

export default function WhatWeDoPage() {
  return (
    <div>
      <section className="section-wrap py-16 md:py-20 max-w-2xl">
        <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
          What We Do
        </p>
        <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-5">사업분야</h1>
        <p className="text-[14.5px] text-muted leading-relaxed">
          미래를여는빛은 아래 네 가지 영역을 중심으로 사업을 준비하고 있습니다.
          현재 진행 중인 사업의 활동 대상국 및 세부 내용은 확정되는 대로 순차적으로
          공개할 예정입니다.
        </p>
      </section>

      <div className="section-wrap pb-16 md:pb-24 space-y-14">
        {AREAS.map((area, i) => (
          <section
            key={area.id}
            id={area.id}
            className="grid md:grid-cols-2 gap-8 items-center"
          >
            <div className={i % 2 === 1 ? "md:order-2" : ""}>
              <span className="font-display text-[13px] text-gold-dark tracking-[0.15em]">
                {area.tag}
              </span>
              <h2 className="font-display text-[22px] text-navy mt-2 mb-3">{area.title}</h2>
              <p className="text-[14px] text-muted leading-relaxed">{area.body}</p>
            </div>
            <figure className={`${i % 2 === 1 ? "md:order-1" : ""}`}>
              <ImagePlaceholder
                exists
                src={area.img}
                alt={area.imgAlt}
                aspect="wide"
                className="rounded-sm"
              />
              <figcaption className="mt-2 text-[12px] text-muted/70 italic">
                설립자의 이전 현장 활동 기록 사진
              </figcaption>
            </figure>
          </section>
        ))}
      </div>

      <section className="bg-sage/50 py-14">
        <div className="section-wrap text-center max-w-xl">
          <p className="text-[14px] text-muted leading-relaxed">
            현재 등록된 개별 사업은{" "}
            <Link
              href="/projects"
              className="text-navy underline underline-offset-4 hover:text-gold-dark"
            >
              사업 목록
            </Link>
            에서 확인하실 수 있습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
