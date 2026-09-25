import { LinkButton } from "@/components/ui/Button";

export default function MembershipCompletePage() {
  return (
    <div className="section-wrap py-20 md:py-28 max-w-xl text-center">
      <h1 className="font-display text-[26px] text-navy mb-4">회원 가입 신청이 접수되었습니다.</h1>
      <p className="text-[14.5px] text-muted leading-relaxed mb-10">
        신청해 주셔서 감사합니다. 정회원으로 신청하신 경우, 관리자 확인 후
        승인 절차가 진행되며 별도로 안내해 드립니다.
      </p>
      <LinkButton href="/" variant="secondary">
        홈으로 돌아가기
      </LinkButton>
    </div>
  );
}
