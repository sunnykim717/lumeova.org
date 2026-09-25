import { LinkButton } from "@/components/ui/Button";
import { DONATION_ACCOUNT } from "@/lib/constants/brand";

export function GetInvolved() {
  return (
    <section className="py-16 md:py-20">
      <div className="section-wrap grid md:grid-cols-2 gap-6">
        <div className="border border-navy/15 rounded-sm p-8 md:p-10 flex flex-col justify-between">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
              Membership
            </p>
            <h3 className="font-display text-[22px] text-navy mb-3">함께하는 방법</h3>
            <p className="text-[14px] text-muted leading-relaxed mb-8">
              정회원 또는 일반회원으로 함께해 주세요. 정회원 신청은 관리자
              확인 후 승인됩니다.
            </p>
          </div>
          <LinkButton href="/membership" variant="secondary" className="self-start">
            회원 가입 신청
          </LinkButton>
        </div>

        <div className="bg-navy text-cream rounded-sm p-8 md:p-10 flex flex-col justify-between">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold mb-3">
              Donate
            </p>
            <h3 className="font-display text-[22px] mb-3">후원 안내</h3>
            <p className="text-[14px] text-cream/80 leading-relaxed mb-6">
              정기·단기·일시후원 중 원하시는 방식으로 참여하실 수 있습니다.
              현재는 계좌이체로 후원을 받고 있습니다.
            </p>
            <p className="text-[13px] text-cream/70">
              {DONATION_ACCOUNT.bank} {DONATION_ACCOUNT.accountNumber} ({DONATION_ACCOUNT.holder})
            </p>
          </div>
          <LinkButton href="/donate" variant="gold" className="self-start mt-8">
            후원 신청하기
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
