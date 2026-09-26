import Link from "next/link";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Logo } from "@/components/ui/Logo";
import { ORG } from "@/lib/constants/brand";

export function AboutSummary() {
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
          <Logo
            size="brand-mark"
            className="hidden md:inline-flex mb-6"
          />
          <Logo
            size="brand-mark"
            className="inline-flex md:hidden mb-5"
          />
          <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
            About {ORG.nameEn}
          </p>
          <h2 className="font-display text-[26px] md:text-[30px] text-navy mb-5">
            {ORG.nameKo}은 어떤 단체인가요
          </h2>
          <p className="text-[15px] text-muted leading-relaxed mb-6">
            {ORG.nameKo}({ORG.nameEn})은 국제개발협력 현장 경험을 바탕으로 설립된
            비영리단체로, 교육을 통해 지속가능한 변화를 만들어가고자 합니다.
          </p>
          <Link href="/about" className="text-[14px] font-medium text-navy underline underline-offset-4 hover:text-gold-dark">
            단체 소개 자세히 보기 →
          </Link>
        </div>
      </div>
    </section>
  );
}
