import type { Metadata } from "next";
import { MembershipForm } from "@/components/forms/MembershipForm";
import { getRegularSupporterCount } from "@/lib/data/content";
import { REGULAR_SUPPORTER_GOAL } from "@/lib/constants/supporters";

export const metadata: Metadata = {
  title: "회원가입",
  description: "미래를여는빛 정회원 · 일반회원 가입 신청",
};

export const revalidate = 300;

type Props = {
  searchParams: Promise<{ type?: string }>;
};

export default async function MembershipPage({ searchParams }: Props) {
  const { type } = await searchParams;
  const initialType = type === "regular" ? "regular" : "general";
  const count = await getRegularSupporterCount();
  const percent = count === null ? null : Math.min(100, Math.round((count / REGULAR_SUPPORTER_GOAL) * 100));

  return (
    <div className="section-wrap py-16 md:py-20 max-w-2xl">
      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-3">회원 가입 신청</h1>
      <p className="text-[14.5px] text-muted leading-relaxed mb-8">
        정회원 신청은 접수 후 관리자 확인을 거쳐 승인됩니다. 정회원의 실제
        권한과 의결권 범위는 정관에 따라 결정됩니다.
      </p>

      <div className="border border-navy/10 rounded-sm bg-white p-6 md:p-8 mb-10">
        <p className="text-[13px] text-muted mb-2">정회원 모집 현황</p>
        <p className="font-display text-[32px] text-navy mb-4">
          {count === null ? "집계 준비중" : `${count} / ${REGULAR_SUPPORTER_GOAL}명`}
        </p>
        <div className="h-2.5 w-full rounded-full bg-navy/10 overflow-hidden" aria-hidden={percent === null}>
          <div className="h-full bg-gold transition-all" style={{ width: `${percent ?? 0}%` }} />
        </div>
        <p className="text-[12.5px] text-muted mt-3">관리자가 승인한 정회원 수를 기준으로 집계합니다.</p>
      </div>

      <MembershipForm initialType={initialType} />
    </div>
  );
}
