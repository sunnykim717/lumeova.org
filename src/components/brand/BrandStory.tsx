import { BRAND_STORY_PARAGRAPHS, BRAND_STORY_TITLE } from "@/lib/constants/brandStory";

/**
 * §2 — the official brand story / greeting, in full.
 *
 * This copy is confirmed, final content — rendered verbatim from
 * `constants/brandStory.ts`, never summarized or reflowed. Line breaks
 * ("\n") the org placed inside a paragraph are preserved as real <br />s;
 * paragraph spacing otherwise comes from layout, not from the text itself.
 *
 * Set as a single readable left-aligned column (not centered, not full
 * section width) with a thin gold rule marking the reading edge — an
 * editorial treatment rather than a boxed/card quote.
 */
export function BrandStory() {
  return (
    <section className="section-wrap py-14 md:py-20">
      <div className="grid md:grid-cols-[1fr_2.4fr] gap-8 md:gap-16">
        <div>
          <div className="h-px w-10 bg-gold mb-5 md:hidden" aria-hidden="true" />
          <div className="hidden md:block w-px bg-gold/50 h-full ml-1" aria-hidden="true" />
        </div>
        <div className="max-w-[560px]">
          <h2 className="font-display text-[22px] md:text-[26px] text-navy mb-8 leading-snug">
            {BRAND_STORY_TITLE}
          </h2>
          <div className="space-y-6">
            {BRAND_STORY_PARAGRAPHS.map((paragraph, i) => (
              <p key={i} className="text-[15.5px] leading-[1.9] text-ink/90">
                {paragraph.split("\n").map((line, j, arr) => (
                  <span key={j}>
                    {line}
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
