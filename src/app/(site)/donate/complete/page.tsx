import { LinkButton } from "@/components/ui/Button";
import { DONATION_ACCOUNT } from "@/lib/constants/brand";

export default function DonateCompletePage() {
  return (
    <div className="section-wrap py-20 md:py-28 max-w-xl text-center">
      <h1 className="font-display text-[26px] text-navy mb-2">후원 신청이 접수되었습니다.</h1>
      <p className="text-[14.5px] text-muted mb-8">아래 계좌로 후원금을 보내주세요.</p>

      <div className="rounded-sm border border-navy/15 bg-white py-8 px-6 mb-6">
        <p className="text-[15px] font-medium text-navy">{DONATION_ACCOUNT.bank}</p>
        <p className="text-[22px] font-semibold text-navy tracking-wide my-1">
          {DONATION_ACCOUNT.accountNumber}
        </p>
        <p className="text-[14px] text-muted">{DONATION_ACCOUNT.holder}</p>
      </div>

      <p className="text-[13px] text-muted leading-relaxed mb-10">
        신청자 이름과 입금자명을 가능하면 동일하게 입력해 주세요.
      </p>

      <LinkButton href="/" variant="secondary">
        홈으로 돌아가기
      </LinkButton>
    </div>
  );
}
