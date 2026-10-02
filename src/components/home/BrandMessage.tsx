import { Logo } from "@/components/ui/Logo";
import Link from "next/link";
import { ORG } from "@/lib/constants/brand";
import { BRAND_NAME, HOME_BRIEF_LINES } from "@/lib/constants/brandStory";

/**
 * §11 — brief homepage brand message + CTA to the full Brand Story page.
 *
 * Sits between Hero and AboutSummary: Hero opens with the org's own voice
 * ("우리의 활동" / "함께하기"), this section is the brand's name and meaning
 * in one breath, and AboutSummary right after moves into the organization's
 * factual introduction. Kept short by design — the full story lives at
 * /about/brand, not here.
 */
export function BrandMessage() {
  return (
    <section className="bg-sage/40 py-14 md:py-20">
      <div className="section-wrap grid md:grid-cols-[auto_1fr] gap-6 md:gap-12 items-start">
        <Logo size="header" className="max-w-full" />
        <div className="max-w-xl">
          <h2 className="font-display text-[15px] tracking-[0.06em] text-navy/70">{BRAND_NAME}</h2>
          <p className="font-display text-[22px] md:text-[26px] text-navy mt-1.5 mb-5 leading-snug">
            {ORG.sloganKo}
          </p>
          <p className="text-[15px] leading-[1.85] text-ink/85 mb-6">
            {HOME_BRIEF_LINES.map((line, i) => (
              <span key={i}>
                {line}
                {i < HOME_BRIEF_LINES.length - 1 && <br />}
              </span>
            ))}
          </p>
          <Link
            href="/about/brand"
            className="text-[14px] font-medium text-navy underline underline-offset-4 hover:text-gold-dark"
          >
            LUMEOVA 이야기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
