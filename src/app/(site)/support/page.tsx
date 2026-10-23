import type { Metadata } from "next";
import Link from "next/link";
import { getRegularSupporterCount } from "@/lib/data/content";
import { REGULAR_SUPPORTER_GOAL } from "@/lib/constants/supporters";
import { DONATE_ACCOUNT_LINE } from "@/lib/constants/siteContent";

export const metadata: Metadata = {
  title: "상시후원자 모집",
  description: `미래를여는빛과 함께할 상시후원자 ${REGULAR_SUPPORTER_GOAL}명을 모집합니다.`,
};

export const revalidate = 300;

export default async function SupportPage() {
  const count = await getRegularSupporterCount();
  const percent = count === null ? null : Math.min(100, Math.round((count / REGULAR_SUPPORTER_GOAL) * 100));

  return (
    <div className="section-wrap py-16 md:py-20 max-w-2xl">
      <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">Regular Supporters</p>
      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-3">상시후원자 모집</h1>
      <p className="text-[14.5px] text-muted leading-relaxed mb-10">
        매달 함께해 주시는 상시후원자 {REGULAR_SUPPORTER_GOAL}명을 모으고 있습니다. 꾸준한 후원이 단체의 지속가능한
        운영과 사업의 바탕이 됩니다.
      </p>

      <div className="border border-navy/10 rounded-sm bg-white p-6 md:p-8 mb-10">
        <p className="text-[13px] text-muted mb-2">현재 모집 현황</p>
        <p className="font-display text-[32px] text-navy mb-4">
          {count === null ? "집계 준비중" : `${count} / ${REGULAR_SUPPORTER_GOAL}명`}
        </p>
        <div className="h-2.5 w-full rounded-full bg-navy/10 overflow-hidden" aria-hidden={percent === null}>
          <div className="h-full bg-gold transition-all" style={{ width: `${percent ?? 0}%` }} />
        </div>
        <p className="text-[12.5px] text-muted mt-3">입금이 확인된 정기후원을 기준으로 집계합니다.</p>
      </div>

      <h2 className="font-display text-[20px] text-navy mb-3">참여 방법</h2>
      <ol className="list-decimal pl-5 space-y-2 text-[14.5px] text-muted leading-relaxed mb-8">
        <li>
          <Link href="/donate" className="text-navy underline underline-offset-4">후원 신청</Link>에서 정기후원을 선택해
          주세요.
        </li>
        <li>
          아래 계좌로 이체해 주시면, 확인 후 상시후원자로 집계됩니다. ({DONATE_ACCOUNT_LINE})
        </li>
        <li>신청 시 입력하신 정보는 후원 관리 목적으로만 사용되며, 자세한 내용은 개인정보처리방침에서 확인하실 수 있습니다.</li>
      </ol>

      <Link
        href="/donate"
        className="inline-flex items-center rounded-full bg-navy px-6 py-2.5 text-[14px] font-semibold text-cream hover:bg-navy-light"
      >
        정기후원 신청하기
      </Link>
    </div>
  );
}
