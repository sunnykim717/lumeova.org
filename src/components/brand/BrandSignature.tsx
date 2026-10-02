import { BRAND_PHILOSOPHY_LINES, BRAND_SIGNATURE_LINES, CORE_STATEMENT_LINES } from "@/lib/constants/brandStory";

/**
 * Closing sections of the Brand Story page: §5/§19 Core Statement, then the
 * §3/§8 Brand Signature block. Centered by design — this is explicitly the
 * kind of closing "signature" area the typography rule allows to break from
 * the page's otherwise left-aligned body copy.
 *
 * Core Statement sits on a navy panel (a deliberate tone shift from the
 * cream sections above) so it reads as the page's turning point before the
 * quiet, restrained sign-off.
 */
export function BrandSignature() {
  return (
    <>
      <section className="bg-navy py-16 md:py-24">
        <div className="section-wrap text-center">
          <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-gold mb-8">
            Core Statement
          </p>
          <div className="space-y-2.5">
            {CORE_STATEMENT_LINES.map((line, i) => (
              <p
                key={i}
                className={`font-display text-[19px] md:text-[26px] leading-snug ${
                  i === CORE_STATEMENT_LINES.length - 1 ? "text-gold" : "text-cream"
                }`}
              >
                {line}
              </p>
            ))}
          </div>
          <p className="mt-10 text-[13px] text-cream/50">
            {BRAND_PHILOSOPHY_LINES.join(" ")}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="section-wrap text-center">
          <p className="font-display text-[40px] md:text-[52px] tracking-tight text-navy">
            {BRAND_SIGNATURE_LINES[0]}
          </p>
          <p className="mt-3 text-[16px] md:text-[18px] text-navy/80">{BRAND_SIGNATURE_LINES[1]}</p>
          <p className="mt-1.5 text-[14px] md:text-[15px] text-gold-dark">{BRAND_SIGNATURE_LINES[2]}</p>
        </div>
      </section>
    </>
  );
}
