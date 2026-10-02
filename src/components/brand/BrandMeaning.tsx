import { ORG } from "@/lib/constants/brand";
import {
  BRAND_MESSAGE,
  BRAND_NAME,
  LUMEN_MEANING,
  NOVA_MEANING,
} from "@/lib/constants/brandStory";

/** A thin rule connecting one stage of the flow to the next — deliberately
 * typographic (a hairline + a glyph), never an icon or arrow graphic. */
function Connector({ symbol }: { symbol: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-2" aria-hidden="true">
      <span className="h-8 w-px bg-navy/20" />
      <span className="font-display text-[15px] text-gold-dark">{symbol}</span>
      <span className="h-8 w-px bg-navy/20" />
    </div>
  );
}

/**
 * §3 / §4 (meaning) + §5 (visual) — LUMEN + NOVA → LUMEOVA → org name → slogan.
 *
 * This is the page's centerpiece and the one place a fully centered,
 * diagram-like composition is appropriate (per the typography rule: body
 * copy stays left-aligned, but a signature-like visual sequence like this
 * one may center). Built entirely from type, rules and spacing — no cards,
 * no icon set — so it reads as a single continuous idea rather than three
 * boxes stacked in a row.
 */
export function BrandMeaning() {
  return (
    <section className="bg-sage/40 py-16 md:py-24">
      <div className="section-wrap">
        <div className="text-center mb-12 md:mb-16">
          <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-gold-dark mb-3">
            Brand Meaning
          </p>
          <h2 className="font-display text-[22px] md:text-[26px] text-navy">
            LUMEN과 NOVA가 만나 {BRAND_NAME}가 되기까지
          </h2>
        </div>

        <div className="flex flex-col items-center">
          {/* LUMEN + NOVA */}
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-10">
            <div className="text-center">
              <p className="font-display text-[40px] md:text-[52px] text-navy leading-none">
                {LUMEN_MEANING.word}
              </p>
              <p className="mt-3 text-[13px] tracking-[0.08em] text-muted">
                {LUMEN_MEANING.keywords.join(" · ")}
              </p>
            </div>

            <div className="md:hidden">
              <Connector symbol="+" />
            </div>
            <div className="hidden md:flex md:items-center md:px-2">
              <span className="font-display text-[28px] text-gold-dark" aria-hidden="true">
                +
              </span>
            </div>

            <div className="text-center">
              <p className="font-display text-[40px] md:text-[52px] text-navy leading-none">
                {NOVA_MEANING.word}
              </p>
              <p className="mt-3 text-[13px] tracking-[0.08em] text-muted">
                {NOVA_MEANING.keywords.join(" · ")}
              </p>
            </div>
          </div>

          <Connector symbol="↓" />

          {/* LUMEOVA */}
          <div className="text-center">
            <p className="font-display text-[52px] md:text-[72px] text-navy leading-none tracking-tight">
              {BRAND_NAME}
            </p>
            <p className="mt-4 font-display text-[17px] md:text-[19px] text-navy/70">
              {BRAND_MESSAGE}
            </p>
          </div>

          <Connector symbol="↓" />

          {/* Organization name */}
          <div className="text-center">
            <p className="font-display text-[24px] md:text-[28px] text-navy">{ORG.nameKo}</p>
            <p className="mt-1.5 text-[13px] tracking-[0.08em] text-muted">{ORG.nameEn}</p>
          </div>

          <Connector symbol="↓" />

          {/* Slogan */}
          <p className="font-display text-[19px] md:text-[22px] text-gold-dark">{ORG.sloganKo}</p>
        </div>
      </div>
    </section>
  );
}
