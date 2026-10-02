import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { ORG } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "단체 소개",
  description: `${ORG.nameKo} 소개, 설립 목적, Mission·Vision, 핵심 가치`,
};

export default function AboutPage() {
  return (
    <div>
      {/* ── 소개 + 기본 정보 ── */}
      <section className="section-wrap py-16 md:py-20">
        <div className="max-w-3xl">
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">About</p>
          <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-5">단체 소개</h1>
          <p className="text-[15px] text-muted leading-relaxed mb-4">
            {ORG.nameKo}({ORG.nameEn})은 국제개발협력 현장 경험을 바탕으로
            설립된 비영리단체로, 현장의 목소리가 실제 사업에 반영되는 단체를
            지향합니다.
          </p>
          <p className="text-[15px] text-muted leading-relaxed">
            현장에서 일하는 사람도, 도움을 받는 사람도 함께 행복할 수 있는
            단체가 되는 것을 지향합니다.
          </p>
        </div>
      </section>

      {/* ── Mission · Vision ── */}
      <section className="bg-sage/50 py-16 md:py-20">
        <div className="section-wrap grid md:grid-cols-2 gap-12">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gold-dark mb-3">
              Mission
            </p>
            <p className="font-display text-[17px] md:text-[19px] text-navy leading-[1.65]">
              {ORG.mission}
            </p>
          </div>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gold-dark mb-3">
              Vision
            </p>
            <p className="font-display text-[17px] md:text-[19px] text-navy leading-[1.65]">
              {ORG.vision}
            </p>
          </div>
        </div>
      </section>

      {/* ── 핵심 가치 — typography + dividers only, no icons ── */}
      <section className="section-wrap py-16 md:py-20">
        <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-2">
          Core Values
        </p>
        <h2 className="font-display text-[22px] text-navy mb-10">핵심 가치</h2>
        <div>
          {ORG.coreValues.map((v, i) => (
            <div key={v.id}>
              {i > 0 && <div className="border-t border-border my-8" />}
              <div className="grid md:grid-cols-[200px_1fr] gap-3 md:gap-8 items-baseline">
                <div>
                  <span className="font-display text-[13px] tracking-[0.12em] text-gold-dark">
                    0{i + 1}
                  </span>
                  <h3 className="font-display text-[18px] text-navy mt-1">
                    {v.titleKo}{" "}
                    <span className="text-[14px] font-normal text-muted tracking-wide">
                      · {v.titleEn}
                    </span>
                  </h3>
                </div>
                <p className="text-[15px] text-muted leading-relaxed">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 연혁 ── */}
      <section className="section-wrap pb-16 md:pb-20">
        <h2 className="font-display text-[22px] text-navy mb-6">연혁</h2>
        {ORG.history.length === 0 ? (
          <p className="text-[13.5px] text-muted italic">연혁은 확정되는 대로 안내해 드립니다.</p>
        ) : (
          <ul className="space-y-3">
            {ORG.history.map((h) => (
              <li key={h.year} className="flex gap-4 text-[14px]">
                <span className="text-gold-dark font-medium w-14 shrink-0">{h.year}</span>
                <span className="text-ink">{h.event}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── CI 소개 ── */}
      <section className="section-wrap pb-16 md:pb-20">
        <h2 className="font-display text-[22px] text-navy mb-12">CI 소개</h2>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="flex justify-center md:justify-start">
            <div className="bg-white border border-border rounded-sm p-6">
              <Logo size="brand-story" />
            </div>
          </div>

          <div className="space-y-6 text-[15px]">
            <div>
              <h3 className="font-display text-[18px] text-navy mb-2">LUMEOVA — 빛으로 미래를 열다</h3>
            </div>

            <div className="space-y-4 text-muted leading-relaxed">
              <p>
                LUMEOVA의 심볼은 브랜드명의 핵심인 L과 O를 바탕으로 구성했습니다.
              </p>
              <p>
                왼쪽의 유려한 곡선은 <strong>LUMEOVA의 &apos;L&apos;</strong>을 형상화한 것으로, 빛이 퍼지고 새로운 길이 열리는 모습을 담고 있습니다. 중앙의 원형 구조는 <strong>&apos;O&apos;</strong>를 중심으로 사람과 사람, 지역과 세계가 연결되는 모습을 상징합니다.
              </p>
              <p>
                LUMEOVA는 라틴어로 빛을 뜻하는 LUMEN과 새로운 시작과 변화를 상징하는 NOVA에서 영감을 받아 만든 이름입니다.
              </p>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-navy font-medium mb-2">{ORG.nameKo}</p>
              <p className="text-muted">{ORG.sloganKo}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
