import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { AboutContent } from "@/lib/constants/siteContent";

export function AboutSummary({ content }: { content: AboutContent }) {
  return (
    <section className="py-16 md:py-20">
      <div className="section-wrap grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <ImagePlaceholder
          exists
          src="/images/classroom-activity.jpg"
          alt="교실 활동 모습"
          aspect="portrait"
          className="order-2 md:order-1 rounded-sm"
        />
        <div className="order-1 md:order-2">
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
            {content.eyebrow}
          </p>
          <h2 className="font-display text-[26px] md:text-[30px] text-navy mb-5">{content.title}</h2>
          <p className="text-[15px] text-muted leading-relaxed mb-4">{content.body1}</p>
          <p className="text-[15px] text-muted leading-relaxed mb-6">{content.body2}</p>
          <Link href="/about" className="text-[14px] font-medium text-navy underline underline-offset-4 hover:text-gold-dark">
            단체 소개 자세히 보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
