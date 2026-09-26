import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";
import { ORG } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "단체 소개",
  description: `${ORG.nameKo} 소개, 설립 목적, Mission·Vision, 핵심가치`,
};

// 핵심가치 SVG 아이콘 — 빛·사람·신뢰
function IconLight() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="text-gold">
      <circle cx="18" cy="18" r="7" stroke="currentColor" strokeWidth="2.2" />
      <line x1="18" y1="2" x2="18" y2="6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="18" y1="30" x2="18" y2="34" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="2" y1="18" x2="6" y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="30" y1="18" x2="34" y2="18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="6.34" y1="6.34" x2="9.17" y2="9.17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="26.83" y1="26.83" x2="29.66" y2="29.66" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="29.66" y1="6.34" x2="26.83" y2="9.17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="9.17" y1="26.83" x2="6.34" y2="29.66" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function IconPeople() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="text-gold">
      {/* 왼쪽 사람 */}
      <circle cx="13" cy="11" r="4.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M4 28c0-5 4-8 9-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* 오른쪽 사람 */}
      <circle cx="23" cy="11" r="4.5" stroke="currentColor" strokeWidth="2.2" />
      <path d="M32 28c0-5-4-8-9-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* 두 사람 연결 */}
      <path d="M13 20c1.5-0.7 3-1 5-1s3.5 0.3 5 1" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function IconTrust() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="text-gold">
      <path
        d="M18 3L5 8v10c0 8 6 14 13 15 7-1 13-7 13-15V8L18 3z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <polyline
        points="12 18 16 22 24 14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function getValues() {
  return ORG.coreValues.map((v, i) => {
    const icons = [<IconLight key="light" />, <IconPeople key="people" />, <IconTrust key="trust" />];
    return {
      icon: icons[i],
      title: `${v.ko} · ${v.en}`,
      body: v.desc,
    };
  });
}

export default function AboutPage() {
  return (
    <div>
      <section className="section-wrap py-16 md:py-20 max-w-3xl">
        <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">About</p>
        <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-8">단체 소개</h1>
        <p className="text-[15px] text-muted leading-relaxed mb-6">
          {ORG.nameKo}({ORG.nameEn})은 국제개발협력 현장 경험을 바탕으로
          설립된 비영리단체로, 현장의 목소리가 실제 사업에 반영되는 단체를
          지향합니다.
        </p>
        <p className="text-[15px] text-muted leading-relaxed">
          현장에서 일하는 사람도, 도움을 받는 사람도 함께 행복할 수 있는
          단체가 되는 것을 지향합니다.
        </p>
      </section>

      <section className="bg-sage/50 py-16 md:py-20">
        <div className="section-wrap grid md:grid-cols-2 gap-8">
          <div className="rounded-sm border border-navy/10 bg-cream p-7">
            <h2 className="font-display text-[19px] text-navy mb-3">Mission</h2>
            <p className="text-[15px] text-ink leading-relaxed">
              {ORG.mission}
            </p>
          </div>
          <div className="rounded-sm border border-navy/10 bg-cream p-7">
            <h2 className="font-display text-[19px] text-navy mb-3">Vision</h2>
            <p className="text-[15px] text-ink leading-relaxed">
              {ORG.vision}
            </p>
          </div>
        </div>
      </section>

      <section className="section-wrap py-16 md:py-20">
        <h2 className="font-display text-[22px] text-navy mb-8">핵심가치</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {getValues().map((v) => (
            <div key={v.title}>
              <div className="mb-4">{v.icon}</div>
              <h3 className="font-display text-[16px] text-navy mb-2">{v.title}</h3>
              <p className="text-[15px] text-muted leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

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

      <section className="section-wrap pb-16 md:pb-20">
        <h2 className="font-display text-[22px] text-navy mb-8">CI 소개</h2>
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="flex justify-center md:justify-start">
            <div className="bg-white border border-border rounded-sm p-6">
              <Logo
                size="brand-story"
              />
            </div>
          </div>
          <div className="space-y-4 text-[14px]">
            <div>
              <p className="text-navy font-medium mb-1">Brand Name</p>
              <p className="text-muted">미래를여는빛 (Lumeova International)</p>
            </div>
            <div>
              <p className="text-navy font-medium mb-1">Slogan</p>
              <p className="text-muted">{ORG.sloganKo}</p>
            </div>
            <div>
              <p className="text-navy font-medium mb-1">Brand Colors</p>
              <div className="space-y-2">
                <p className="text-muted">
                  <span className="inline-block w-6 h-6 bg-[#D4AF37] rounded mr-2 border border-border"></span>
                  Gold #D4AF37
                </p>
                <p className="text-muted">
                  <span className="inline-block w-6 h-6 bg-[#0D1B2A] rounded mr-2 border border-border"></span>
                  Navy #0D1B2A
                </p>
              </div>
            </div>
            <div>
              <p className="text-navy font-medium mb-1">Typography</p>
              <p className="text-muted">Playfair Display · Noto Sans KR</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
