import type { Metadata } from "next";
import { ORG } from "@/lib/constants/brand";
import { PRIVACY_POLICY_VERSION } from "@/lib/constants/legal";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${ORG.nameKo} 개인정보처리방침`,
};

const SECTIONS = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: [
      "회원가입 시: 이름, 연락처, 이메일, 주소, 생년월일(선택)",
      "후원 신청 시: 이름(입금자명), 연락처, 이메일(선택)",
      "위 항목 외의 정보는 수집하지 않습니다.",
    ],
  },
  {
    title: "2. 개인정보의 수집 및 이용 목적",
    body: [
      "회원 관리(가입 확인, 승인 여부 안내)",
      "후원 접수 및 입금 확인 안내",
      "문의 응대",
    ],
  },
  {
    title: "3. 개인정보의 보유 및 이용 기간",
    body: [
      "회원 탈퇴 또는 후원 종료 후 관계 법령이 정한 기간 동안 보관 후 파기하는 것을 원칙으로 합니다. 구체적인 보유 기간은 단체 정관 및 관련 법령 검토 후 확정하여 이 페이지에 안내합니다.",
    ],
  },
  {
    title: "4. 개인정보의 제3자 제공",
    body: [
      "미래를여는빛은 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 법령에 근거가 있거나 이용자가 사전에 동의한 경우에만 예외로 합니다.",
    ],
  },
  {
    title: "5. 이용자의 권리",
    body: [
      "이용자는 언제든지 본인의 개인정보 열람, 정정, 삭제, 처리 정지를 요청할 수 있습니다. 문의하기 페이지를 통해 요청해 주시기 바랍니다.",
    ],
  },
  {
    title: "6. 개인정보 보호책임자",
    body: [ORG.representative ? `${ORG.representative} (대표)` : "확정 후 안내 예정입니다."],
  },
];

export default function PrivacyPage() {
  return (
    <div className="section-wrap py-16 md:py-20 max-w-2xl">
      <p className="text-[12px] font-semibold tracking-[0.12em] uppercase text-gold-dark mb-3">
        Privacy Policy
      </p>
      <h1 className="font-display text-[28px] md:text-[32px] text-navy mb-3">개인정보처리방침</h1>
      <p className="text-[13px] text-muted mb-10">버전 {PRIVACY_POLICY_VERSION} · 정식 시행 전 초안입니다</p>

      <div className="rounded-sm border border-gold/40 bg-cream/60 px-5 py-4 mb-10">
        <p className="text-[13px] text-muted leading-relaxed">
          이 페이지는 회원가입·후원 신청 시 안내되는 개인정보처리방침의 초안입니다.
          단체 정관 및 법률 검토가 완료되는 대로 최종본으로 교체되며, 변경 시
          버전 표기가 함께 갱신됩니다.
        </p>
      </div>

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="font-display text-[17px] text-navy mb-3">{section.title}</h2>
            <div className="space-y-2">
              {section.body.map((line, i) => (
                <p key={i} className="text-[14px] text-muted leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
