import type { Metadata } from "next";
import { MembershipForm } from "@/components/forms/MembershipForm";

export const metadata: Metadata = {
  title: "회원가입",
  description: "미래를여는빛 정회원 · 일반회원 가입 신청",
};

export default function MembershipPage() {
  return (
    <div className="section-wrap py-16 md:py-20 max-w-2xl">
      <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
        Membership
      </p>
      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-3">회원 가입 신청</h1>
      <p className="text-[14.5px] text-muted leading-relaxed mb-10">
        정회원 신청은 접수 후 관리자 확인을 거쳐 승인됩니다. 정회원의 실제
        권한과 의결권 범위는 정관에 따라 결정됩니다.
      </p>
      <MembershipForm />
    </div>
  );
}
