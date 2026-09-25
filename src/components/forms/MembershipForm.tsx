"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type MembershipType = "regular" | "general";

export function MembershipForm() {
  const router = useRouter();
  const [membershipType, setMembershipType] = useState<MembershipType>("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      address: String(form.get("address") || ""),
      birthDate: String(form.get("birthDate") || ""),
      membershipType,
      memo: String(form.get("memo") || ""),
      privacyConsent: form.get("privacyConsent") === "on",
      marketingConsent: form.get("marketingConsent") === "on",
    };

    try {
      const res = await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "신청 중 오류가 발생했습니다.");
        setSubmitting(false);
        return;
      }
      router.push("/membership/complete");
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <fieldset>
        <legend className="text-[14px] font-semibold text-navy mb-3">회원 유형</legend>
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              { value: "general", label: "일반회원", desc: "단체 활동에 함께하는 회원" },
              { value: "regular", label: "정회원", desc: "승인 절차를 거쳐 등록되는 회원" },
            ] as const
          ).map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-sm border p-4 text-sm transition-colors ${
                membershipType === opt.value ? "border-navy bg-navy/[0.03]" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="membershipTypeRadio"
                value={opt.value}
                checked={membershipType === opt.value}
                onChange={() => setMembershipType(opt.value)}
                className="sr-only"
              />
              <span className="block font-medium text-navy mb-0.5">{opt.label}</span>
              <span className="block text-[12.5px] text-muted">{opt.desc}</span>
            </label>
          ))}
        </div>
        {membershipType === "regular" && (
          <p className="mt-2 text-[12.5px] text-muted">
            정회원 신청은 관리자 확인 후 승인되며, 신청 즉시 확정되지 않습니다.
          </p>
        )}
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="이름" name="name" required autoComplete="name" />
        <Field label="휴대전화" name="phone" type="tel" autoComplete="tel" />
        <Field label="이메일" name="email" type="email" autoComplete="email" />
        <Field label="생년월일" name="birthDate" type="date" />
      </div>
      <Field label="주소" name="address" autoComplete="street-address" />
      <TextArea label="메모" name="memo" />

      <div className="space-y-3 border-t border-border pt-6">
        <label className="flex items-start gap-2.5 text-[13px] text-navy">
          <input type="checkbox" name="privacyConsent" required className="mt-0.5" />
          <span>
            [필수] 개인정보 수집 및 이용에 동의합니다. (
            <a href="/privacy" className="underline underline-offset-2" target="_blank" rel="noreferrer">
              자세히 보기
            </a>
            )
          </span>
        </label>
        <label className="flex items-start gap-2.5 text-[13px] text-muted">
          <input type="checkbox" name="marketingConsent" className="mt-0.5" />
          <span>[선택] 소식 및 활동 안내 이메일 수신에 동의합니다.</span>
        </label>
      </div>

      {error && <p className="text-[13px] text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "제출 중..." : "신청서 제출"}
      </Button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-navy mb-1.5">
        {label}
        {required && <span className="text-gold-dark"> *</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-[14px] text-ink focus:border-navy outline-none"
      />
    </label>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-navy mb-1.5">{label}</span>
      <textarea
        name={name}
        rows={4}
        className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-[14px] text-ink focus:border-navy outline-none"
      />
    </label>
  );
}
