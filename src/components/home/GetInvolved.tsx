import { LinkButton } from "@/components/ui/Button";
import { DONATE_ACCOUNT_LINE, type GetInvolvedContent } from "@/lib/constants/siteContent";

export function GetInvolved({ content }: { content: GetInvolvedContent }) {
  return (
    <section className="py-16 md:py-20">
      <div className="section-wrap grid md:grid-cols-2 gap-6">
        <div className="border border-navy/15 rounded-sm p-8 md:p-10 flex flex-col justify-between">
          <div>
            <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
              Membership
            </p>
            <h3 className="font-display text-[22px] text-navy mb-3">{content.membershipTitle}</h3>
            <p className="text-[14px] text-muted leading-relaxed mb-8">{content.membershipBody}</p>
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
            <h3 className="font-display text-[22px] mb-3">{content.donateTitle}</h3>
            <p className="text-[14px] text-cream/80 leading-relaxed mb-6">{content.donateBody}</p>
            <p className="text-[13px] text-cream/70">{DONATE_ACCOUNT_LINE}</p>
          </div>
          <LinkButton href="/donate" variant="gold" className="self-start mt-8">
            후원 신청하기
          </LinkButton>
        </div>
      </div>
    </section>
  );
}
