import type { Metadata } from "next";
import Link from "next/link";
import { ORG } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "문의하기",
  description: `${ORG.nameKo} 문의처 안내`,
};

export default function ContactPage() {
  return (
    <div className="section-wrap py-16 md:py-20 max-w-2xl">
      <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
        Contact
      </p>
      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-6">문의하기</h1>
      <p className="text-[14.5px] text-muted leading-relaxed mb-10">
        {ORG.nameKo}의 활동, 회원가입, 후원과 관련해 궁금한 점이 있으시면 아래 연락처로 문의해 주세요.
      </p>

      <div className="rounded-sm border border-border bg-white p-6 text-[14px] space-y-6 mb-10">
        <div>
          <p className="text-muted text-[12px] font-semibold uppercase tracking-wide mb-2">소재지</p>
          <p className="text-ink">{ORG.location}</p>
        </div>
        <div>
          <p className="text-muted text-[12px] font-semibold uppercase tracking-wide mb-2">전화</p>
          <a href={`tel:+821025433659`} className="text-gold hover:text-gold-dark font-medium">
            {ORG.phone}
          </a>
        </div>
        <div>
          <p className="text-muted text-[12px] font-semibold uppercase tracking-wide mb-2">이메일</p>
          <a href={`mailto:${ORG.email}`} className="text-gold hover:text-gold-dark font-medium">
            {ORG.email}
          </a>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/membership"
          className="rounded-sm border border-navy/15 p-5 hover:border-gold-dark transition-colors"
        >
          <p className="text-[13px] font-semibold text-navy mb-1">회원가입 문의</p>
          <p className="text-[12.5px] text-muted">회원가입 신청서를 작성해 주세요 →</p>
        </Link>
        <Link
          href="/donate"
          className="rounded-sm border border-navy/15 p-5 hover:border-gold-dark transition-colors"
        >
          <p className="text-[13px] font-semibold text-navy mb-1">후원 문의</p>
          <p className="text-[12.5px] text-muted">후원 신청서를 작성해 주세요 →</p>
        </Link>
      </div>
    </div>
  );
}
