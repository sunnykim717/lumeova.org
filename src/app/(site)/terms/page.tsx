import type { Metadata } from "next";
import { ORG } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${ORG.nameKo} 이용약관`,
};

export default function TermsPage() {
  return (
    <div className="section-wrap py-16 md:py-20 max-w-2xl">
      <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
        Terms
      </p>
      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-6">이용약관</h1>

      <div className="rounded-sm border border-gold/40 bg-cream/60 px-5 py-4 mb-8">
        <p className="text-[13px] text-muted leading-relaxed">
          이용약관은 단체 정관 및 법률 검토가 완료되는 대로 이 페이지에 게시될
          예정입니다. 현재는 준비 단계이며, 회원가입·후원 신청 시 개인정보
          수집·이용에 대한 동의만 받고 있습니다.
        </p>
      </div>

      <p className="text-[14px] text-muted leading-relaxed">
        약관 관련 문의는 문의하기 페이지를 통해 연락해 주시기 바랍니다.
      </p>
    </div>
  );
}
