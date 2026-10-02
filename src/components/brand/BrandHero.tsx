import Image from "next/image";
import { ORG } from "@/lib/constants/brand";
import { BRAND_MESSAGE, BRAND_NAME } from "@/lib/constants/brandStory";

/**
 * Opening panel of the Brand Story page (/about/brand).
 *
 * Deliberately not a hero photo — the brand's own typography carries this
 * section, paired with the official symbol mark (not the full lockup, to
 * avoid setting the "lumeova" wordmark twice back to back — the large
 * display type below already serves as this page's wordmark moment).
 * The Korean organization name stays the larger, primary line beneath the
 * mark; the English name is a small label.
 */
export function BrandHero() {
  return (
    <section className="section-wrap pt-16 pb-14 md:pt-24 md:pb-20">
      <Image src="/logo/symbol-gold.png" alt="" width={80} height={64} aria-hidden="true" className="h-12 w-auto mb-6 md:h-14" />
      <p className="text-[12px] font-semibold tracking-[0.14em] uppercase text-gold-dark mb-5">
        Brand Story · {ORG.nameEn}
      </p>
      <h1 className="font-display text-[56px] leading-[1.05] tracking-tight text-navy sm:text-[72px] md:text-[104px]">
        {BRAND_NAME}
      </h1>
      <p className="font-display text-[20px] md:text-[26px] text-navy/80 mt-4 md:mt-6">
        {BRAND_MESSAGE}
      </p>
      <div className="mt-8 h-px w-16 bg-gold" aria-hidden="true" />
      <p className="mt-6 text-[14px] text-muted">
        {ORG.nameKo} <span className="text-muted/60">·</span> {ORG.nameEn}
      </p>
    </section>
  );
}
