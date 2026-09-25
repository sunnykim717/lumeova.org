const FIELDS = [
  {
    no: "01",
    title: "국제개발협력",
    body: "해외 현장 경험을 바탕으로, 지역사회와 함께 지속가능한 변화를 만들어가는 사업을 준비하고 있습니다.",
  },
  {
    no: "02",
    title: "교육",
    body: "교육이라는 기회를 통해 더 나은 미래로 나아갈 수 있도록 지원하는 것을 활동의 중심에 둡니다.",
  },
  {
    no: "03",
    title: "지역사회 협력",
    body: "현지 단체와의 협력을 바탕으로, 현장의 목소리가 실제 사업에 반영되는 방식으로 활동합니다.",
  },
];

export function WhatWeDo() {
  return (
    <section className="bg-sage/60 py-16 md:py-20">
      <div className="section-wrap">
        <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
          What We Do
        </p>
        <h2 className="font-display text-[26px] md:text-[30px] text-navy mb-10 max-w-lg">
          우리가 하는 일
        </h2>

        <div className="divide-y divide-navy/10 border-t border-b border-navy/10">
          {FIELDS.map((field) => (
            <div key={field.no} className="grid md:grid-cols-[100px_1fr] gap-3 md:gap-8 py-7">
              <span className="font-display text-[28px] text-gold-dark/70">{field.no}</span>
              <div>
                <h3 className="font-display text-[19px] text-navy mb-1.5">{field.title}</h3>
                <p className="text-[14.5px] text-muted leading-relaxed max-w-2xl">{field.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
