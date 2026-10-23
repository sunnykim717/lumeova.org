import type { WhatWeDoContent } from "@/lib/constants/siteContent";

export function WhatWeDo({ content }: { content: WhatWeDoContent }) {
  return (
    <section className="bg-sage/60 py-16 md:py-20">
      <div className="section-wrap">
        <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
          {content.eyebrow}
        </p>
        <h2 className="font-display text-[26px] md:text-[30px] text-navy mb-10 max-w-lg">{content.title}</h2>

        <div className="divide-y divide-navy/10 border-t border-b border-navy/10">
          {content.items.map((field, index) => (
            <div key={index} className="grid md:grid-cols-[100px_1fr] gap-3 md:gap-8 py-7">
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
