import type { Metadata } from "next";
import { DonationForm } from "@/components/forms/DonationForm";
import { DONATION_ACCOUNT } from "@/lib/constants/brand";

export const metadata: Metadata = {
  title: "후원하기",
  description: "미래를여는빛 정기·단기·일시후원 신청",
};

export default function DonatePage() {
  return (
    <div className="section-wrap py-16 md:py-20 grid lg:grid-cols-[1fr_320px] gap-12">
      <div className="max-w-2xl">
        <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
          Donate
        </p>
        <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-3">후원 신청</h1>
        <p className="text-[14.5px] text-muted leading-relaxed mb-10">
          현재는 카드 결제 없이 계좌이체로 후원을 받고 있습니다. 아래 신청서를
          작성해 주시면, 접수 완료 화면에서 입금 계좌를 안내해 드립니다.
        </p>
        <DonationForm />
      </div>

      <aside className="h-fit rounded-sm border border-navy/15 p-6 sticky top-24">
        <p className="text-[12px] font-semibold tracking-[0.1em] uppercase text-muted mb-3">
          후원계좌 안내
        </p>
        <p className="text-[15px] font-medium text-navy">{DONATION_ACCOUNT.bank}</p>
        <p className="text-[17px] font-semibold text-navy mb-1">{DONATION_ACCOUNT.accountNumber}</p>
        <p className="text-[13.5px] text-muted">예금주: {DONATION_ACCOUNT.holder}</p>
      </aside>
    </div>
  );
}
