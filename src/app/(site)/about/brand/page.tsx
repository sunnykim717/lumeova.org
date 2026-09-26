import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { ORG } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "Brand Story | 미래를여는빛",
  description: `${ORG.nameKo}의 브랜드 스토리 — 우리의 설립 배경, 지향점, 그리고 미래`,
};

export default function BrandStoryPage() {
  return (
    <div>
      <section className="bg-navy text-cream py-16 md:py-24">
        <div className="section-wrap">
          <div className="max-w-2xl">
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold mb-4">
              Brand Story
            </p>
            <h1 className="font-display text-[36px] md:text-[48px] leading-tight mb-6">
              빛으로 새로운 미래를 열다
            </h1>
            <p className="text-[16px] md:text-[18px] leading-relaxed text-cream/90">
              국제개발협력의 현장에서 만난 사람들의 이야기가
              <br />
              {ORG.nameKo}의 시작입니다.
            </p>
          </div>
        </div>
      </section>

      <section className="section-wrap py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-[28px] md:text-[32px] text-navy mb-6">
              우리는 현장에서 시작했습니다
            </h2>
            <p className="text-[15px] text-muted leading-relaxed mb-4">
              {ORG.nameKo}({ORG.nameEn})은 국제개발협력 현장에서의 경험을
              바탕으로 설립되었습니다. 현지에서 일하는 사람들, 그리고
              도움을 받는 사람들의 목소리가 중심이 되는 단체를 만들고
              싶었습니다.
            </p>
            <p className="text-[15px] text-muted leading-relaxed">
              진정한 변화는 현장의 이야기에서 시작된다고 믿습니다. 우리는
              그 이야기를 듣고, 기록하고, 함께 만들어가겠습니다.
            </p>
          </div>
          <div className="flex justify-center">
            <Logo size="brand-story" />
          </div>
        </div>
      </section>

      <section className="bg-cream/30 py-16 md:py-24">
        <div className="section-wrap">
          <h2 className="font-display text-[28px] md:text-[32px] text-navy mb-12 text-center">
            우리의 지향점
          </h2>
          <div className="grid md:grid-cols-2 gap-10 max-w-3xl mx-auto">
            <div className="bg-white border border-border rounded-sm p-8">
              <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
                Mission
              </p>
              <h3 className="font-display text-[18px] text-navy mb-4">
                우리의 사명
              </h3>
              <p className="text-[15px] text-ink leading-relaxed">
                교육과 협력을 통해 더 많은 사람이 자신의 가능성을
                발견하고, 삶의 다음 걸음을 선택할 수 있도록 돕습니다.
              </p>
            </div>
            <div className="bg-white border border-border rounded-sm p-8">
              <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
                Vision
              </p>
              <h3 className="font-display text-[18px] text-navy mb-4">
                우리의 꿈
              </h3>
              <p className="text-[15px] text-ink leading-relaxed">
                누구나 배움의 기회를 얻고, 지역사회와 함께 더 나은
                미래를 만들어가는 세상.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-wrap py-16 md:py-24">
        <h2 className="font-display text-[28px] md:text-[32px] text-navy mb-12 text-center">
          우리의 핵심가치
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[24px]">💡</span>
            </div>
            <h3 className="font-display text-[18px] text-navy mb-3">
              빛 · Light
            </h3>
            <p className="text-[14px] text-muted leading-relaxed">
              교육이라는 빛을 통해 더 나은 미래로 나아갈 기회를
              전합니다.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[24px]">👥</span>
            </div>
            <h3 className="font-display text-[18px] text-navy mb-3">
              사람 · People
            </h3>
            <p className="text-[14px] text-muted leading-relaxed">
              현장의 사람들, 그리고 함께하는 사람들이 중심이 되는
              단체를 만듭니다.
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-[24px]">🤝</span>
            </div>
            <h3 className="font-display text-[18px] text-navy mb-3">
              신뢰 · Trust
            </h3>
            <p className="text-[14px] text-muted leading-relaxed">
              약속한 만큼, 확인된 만큼만 이야기하는 단체가 되고자
              합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-sky/20 py-16 md:py-24">
        <div className="section-wrap max-w-3xl">
          <h2 className="font-display text-[28px] md:text-[32px] text-navy mb-8 text-center">
            우리와 함께하세요
          </h2>
          <p className="text-[16px] text-ink leading-relaxed text-center mb-8">
            {ORG.sloganKo}
          </p>
          <p className="text-[15px] text-muted leading-relaxed text-center">
            {ORG.nameKo}은 회원들의 후원과 참여로 지탱됩니다. 함께하는
            모든 분들이 우리의 이야기입니다. 당신의 작은 관심이
            누군가의 큰 기회가 될 수 있습니다.
          </p>
        </div>
      </section>
    </div>
  );
}
