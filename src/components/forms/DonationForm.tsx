"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "react-turnstile";
import { Button } from "@/components/ui/Button";
import { SUGGESTED_AMOUNTS } from "@/lib/validation/donation";

type DonationType = "recurring" | "short_term" | "one_time";

const TYPE_OPTIONS: { value: DonationType; label: string; desc: string }[] = [
  { value: "one_time", label: "일시후원", desc: "한 번만 후원합니다" },
  { value: "short_term", label: "단기후원", desc: "정해진 기간 동안 후원합니다" },
  { value: "recurring", label: "정기후원", desc: "지속적으로 후원합니다" },
];

export function DonationForm() {
  const router = useRouter();
  const [donationType, setDonationType] = useState<DonationType>("one_time");
  const [amount, setAmount] = useState<number | "">(30000);
  const [customAmount, setCustomAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  const effectiveAmount = customAmount ? Number(customAmount) : amount;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    if (!turnstileToken) {
      setError("스팸 방지 인증이 필요합니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
      return;
    }

    const form = new FormData(e.currentTarget);
    const payload = {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      donationType,
      amount: effectiveAmount,
      depositorName: String(form.get("depositorName") || ""),
      memo: String(form.get("memo") || ""),
      privacyConsent: form.get("privacyConsent") === "on",
      marketingConsent: form.get("marketingConsent") === "on",
      turnstileToken,
    };

    try {
      const res = await fetch("/api/donation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "신청 중 오류가 발생했습니다.");
        setSubmitting(false);
        setTurnstileToken("");
        return;
      }
      router.push("/donate/complete");
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
      setTurnstileToken("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <fieldset>
        <legend className="text-[14px] font-semibold text-navy mb-3">후원 종류</legend>
        <div className="grid sm:grid-cols-3 gap-3">
          {TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`cursor-pointer rounded-sm border p-4 text-sm transition-colors ${
                donationType === opt.value ? "border-navy bg-navy/[0.03]" : "border-border"
              }`}
            >
              <input
                type="radio"
                name="donationTypeRadio"
                value={opt.value}
                checked={donationType === opt.value}
                onChange={() => setDonationType(opt.value)}
                className="sr-only"
              />
              <span className="block font-medium text-navy mb-0.5">{opt.label}</span>
              <span className="block text-[12.5px] text-muted">{opt.desc}</span>
            </label>
          ))}
        </div>
        {donationType === "recurring" && (
          <p className="mt-2 text-[12.5px] text-muted">
            정기후원을 원하시는 경우, 은행 앱 또는 인터넷뱅킹에서 자동이체를
            설정하실 수 있습니다.
          </p>
        )}
      </fieldset>

      <fieldset>
        <legend className="text-[14px] font-semibold text-navy mb-3">후원 금액</legend>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          {SUGGESTED_AMOUNTS.map((v) => (
            <button
              type="button"
              key={v}
              onClick={() => {
                setAmount(v);
                setCustomAmount("");
              }}
              className={`rounded-sm border py-2.5 text-[14px] font-medium transition-colors ${
                !customAmount && amount === v
                  ? "border-navy bg-navy text-cream"
                  : "border-border text-navy"
              }`}
            >
              {v.toLocaleString("ko-KR")}원
            </button>
          ))}
        </div>
        <label className="block">
          <span className="block text-[13px] font-medium text-navy mb-1.5">직접 입력</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="금액을 직접 입력해 주세요"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-[14px] text-ink focus:border-navy outline-none"
          />
        </label>
      </fieldset>

      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="이름" name="name" required autoComplete="name" />
        <Field label="휴대전화" name="phone" type="tel" autoComplete="tel" />
        <Field label="이메일" name="email" type="email" autoComplete="email" />
        <Field label="입금자명" name="depositorName" />
      </div>
      <p className="text-[12.5px] text-muted -mt-3">
        신청자 이름과 입금자명을 가능하면 동일하게 입력해 주세요.
      </p>
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

      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
        <div className="flex justify-center">
          <Turnstile
            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            theme="light"
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken("")}
            onExpire={() => setTurnstileToken("")}
          />
        </div>
      )}

      {error && <p className="text-[13px] text-red-600">{error}</p>}

      <Button type="submit" disabled={submitting || !effectiveAmount} className="w-full sm:w-auto">
        {submitting ? "제출 중..." : "후원 신청"}
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
