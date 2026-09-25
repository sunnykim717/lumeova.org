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
        {ORG.nameKo}에 궁금하신 점이 있으시면 아래 연락처로 문의해 주세요.
        회원가입 또는 후원 관련 문의는 각 신청 페이지를 이용해 주시면 더 빠르게
        도와드릴 수 있습니다.
      </p>

      <dl className="rounded-sm border border-border bg-white p-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 text-[14px] mb-10">
        <dt className="text-muted">주소</dt>
        <dd className="text-ink font-medium">{ORG.address ?? "주소 확정 후 표기 예정"}</dd>
        <dt className="text-muted">전화</dt>
        <dd className="text-ink font-medium">{ORG.phone ?? "연락처 확정 후 표기 예정"}</dd>
        <dt className="text-muted">이메일</dt>
        <dd className="text-ink font-medium">{ORG.email ?? "이메일 확정 후 표기 예정"}</dd>
        <dt className="text-muted">소재지</dt>
        <dd className="text-ink font-medium">{ORG.region}</dd>
      </dl>

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
