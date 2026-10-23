import type { Metadata } from "next";
import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

export const metadata: Metadata = {
  title: "활동",
  description: "미래를여는빛의 활동 소식과 사업 영역 소개",
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
      <section className="section-wrap pt-16 md:pt-20 pb-12 max-w-2xl">
        <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
          Our Activities
        </p>
        <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-8">활동</h1>

        <h2 className="font-display text-[22px] text-navy mb-4">함께 만들어 가는 첫걸음</h2>
        <p className="text-[14.5px] text-muted leading-relaxed mb-4">
          미래를여는빛은 더 나은 내일을 위한 첫걸음을 준비하고 있습니다.
        </p>
        <p className="text-[14.5px] text-muted leading-relaxed mb-10">
          아직 단체 명의로 시작한 현장 사업은 없지만, 그동안 여러 나라에서 쌓아 온 경험과 인연을 바탕으로 앞으로의
          활동을 구체화하고 있습니다.
        </p>

        <h3 className="font-display text-[18px] text-navy mb-3">현지 활동가들과 이어가는 소통</h3>
        <p className="text-[14.5px] text-muted leading-relaxed mb-4">
          우리는 현지에서 활동하고 있는 활동가들과 연락을 주고받으며 서로의 경험과 생각을 나누고 있습니다.
        </p>
        <p className="text-[14.5px] text-muted leading-relaxed mb-4">
          각 지역의 교육환경과 생활 여건에 귀 기울이고, 실제로 어떤 지원이 필요한지 함께 고민하고 있습니다.
        </p>
        <p className="text-[14.5px] text-muted leading-relaxed mb-10">
          현장의 이야기를 충분히 듣고 이해하는 과정이 좋은 사업의 출발점이라고 생각합니다.
        </p>

        <h3 className="font-display text-[18px] text-navy mb-3">협력을 위한 준비</h3>
        <p className="text-[14.5px] text-muted leading-relaxed mb-4">
          현지 활동가 및 관련 기관과 협력할 수 있는 방안을 모색하고 있으며, 안정적인 사업 추진을 위한 업무협약(MOU)을
          준비하고 있습니다.
        </p>
        <p className="text-[14.5px] text-muted leading-relaxed mb-10">
          형식적인 협약에 그치지 않고, 서로의 역할을 이해하고 신뢰를 쌓으며 함께 책임지는 협력관계를 만들어 가고자
          합니다.
        </p>

        <h3 className="font-display text-[18px] text-navy mb-3">후원자와 함께하는 시작</h3>
        <p className="text-[14.5px] text-muted leading-relaxed mb-4">
          미래를여는빛은 교육지원사업을 함께 만들어 갈 후원자를 모집하고 있습니다.
        </p>
        <p className="text-[14.5px] text-muted leading-relaxed mb-4">
          후원은 단순한 금전적 지원을 넘어, 배움의 기회를 넓히고 새로운 가능성을 만들어 가는 과정에 동참하는 일이라고
          생각합니다.
        </p>
        <p className="text-[14.5px] text-muted leading-relaxed mb-10">
          작은 관심과 참여가 모여 현장에서 실질적인 변화로 이어질 수 있도록 차근차근 준비하겠습니다.
        </p>

        <p className="font-display text-[18px] text-navy leading-[1.65] border-l-2 border-gold pl-5 mb-4">
          지금은 시작을 준비하는 시간입니다.
        </p>
        <p className="text-[14.5px] text-muted leading-relaxed">
          서두르기보다 현장의 목소리를 듣고, 필요한 지원을 살피며, 함께할 이들과 신뢰를 쌓아가겠습니다.
        </p>
      </section>

      <section className="section-wrap pb-6">
        <h2 className="font-display text-[22px] text-navy">사업 영역</h2>
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
