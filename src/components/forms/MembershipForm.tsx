"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Turnstile } from "react-turnstile";
import { Button } from "@/components/ui/Button";
import { formatBirthDateInput, normalizeBirthDate } from "@/lib/utils/birthDate";

type MembershipType = "regular" | "general";

export function MembershipForm() {
  const router = useRouter();
  const [membershipType, setMembershipType] = useState<MembershipType>("general");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string>("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const rawBirthDate = String(form.get("birthDate") || "").trim();
    const birthDate = rawBirthDate ? normalizeBirthDate(rawBirthDate) : "";
    if (birthDate === null) {
      setError("생년월일을 확인해 주세요. 날짜를 모두 선택하거나 1985-03-21 형식으로 입력해 주세요.");
      return;
    }
    if (!turnstileToken) {
      setError("스팸 방지 인증이 필요합니다. 잠시 후 다시 시도해 주세요.");
      return;
    }
    setSubmitting(true);

    const payload = {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      email: String(form.get("email") || ""),
      address: String(form.get("address") || ""),
      birthDate,
      membershipType,
      memo: String(form.get("memo") || ""),
      privacyConsent: form.get("privacyConsent") === "on",
      marketingConsent: form.get("marketingConsent") === "on",
      turnstileToken,
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
        setTurnstileToken("");
        return;
      }
      router.push("/membership/complete");
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      setSubmitting(false);
      setTurnstileToken("");
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
        <BirthDateField />
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

      <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
        {submitting ? "제출 중..." : "신청서 제출"}
      </Button>
    </form>
  );
}

function BirthDateField() {
  const [mode, setMode] = useState<"select" | "manual">("select");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [manualDate, setManualDate] = useState("");
  const currentYear = new Date().getFullYear();
  const decades = Array.from(
    { length: Math.floor((currentYear - 1900) / 10) + 1 },
    (_, index) => Math.floor(currentYear / 10) * 10 - index * 10,
  );
  const dayCount = year && month ? new Date(Number(year), Number(month), 0).getDate() : 31;
  const selectedDate = year || month || day
    ? year && month && day
      ? `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`
      : "incomplete"
    : "";

  return (
    <div className="sm:col-span-1">
      <span className="block text-[13px] font-medium text-navy mb-1.5">생년월일 <span className="font-normal text-muted">(선택)</span></span>
      <div className="flex gap-2 mb-2" role="group" aria-label="생년월일 입력 방식">
        <button type="button" onClick={() => setMode("select")} aria-pressed={mode === "select"} className={`rounded-sm border px-3 py-1.5 text-[13px] ${mode === "select" ? "border-navy bg-navy text-white" : "border-border bg-white text-navy"}`}>
          연·월·일 선택
        </button>
        <button type="button" onClick={() => setMode("manual")} aria-pressed={mode === "manual"} className={`rounded-sm border px-3 py-1.5 text-[13px] ${mode === "manual" ? "border-navy bg-navy text-white" : "border-border bg-white text-navy"}`}>
          직접 입력
        </button>
      </div>
      {mode === "select" ? (
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2">
          <select aria-label="태어난 연도" value={year} onChange={(e) => { setYear(e.target.value); setDay(""); }} className="min-w-0 rounded-sm border border-border bg-white px-2 py-2.5 text-[14px] text-ink focus:border-navy outline-none">
            <option value="">연도</option>
            {decades.map((decade) => (
              <optgroup key={decade} label={`${decade}년대`}>
                {Array.from({ length: 10 }, (_, offset) => decade + 9 - offset)
                  .filter((value) => value >= 1900 && value <= currentYear)
                  .map((value) => <option key={value} value={value}>{value}년</option>)}
              </optgroup>
            ))}
          </select>
          <select aria-label="태어난 월" value={month} onChange={(e) => { setMonth(e.target.value); setDay(""); }} className="min-w-0 rounded-sm border border-border bg-white px-2 py-2.5 text-[14px] text-ink focus:border-navy outline-none">
            <option value="">월</option>
            {Array.from({ length: 12 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}월</option>)}
          </select>
          <select aria-label="태어난 일" value={day} onChange={(e) => setDay(e.target.value)} className="min-w-0 rounded-sm border border-border bg-white px-2 py-2.5 text-[14px] text-ink focus:border-navy outline-none">
            <option value="">일</option>
            {Array.from({ length: dayCount }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1}일</option>)}
          </select>
        </div>
      ) : (
        <input type="text" inputMode="numeric" autoComplete="bday" maxLength={10} aria-label="생년월일 직접 입력" aria-describedby="birth-date-help" placeholder="YYYY-MM-DD" value={manualDate} onChange={(e) => setManualDate(formatBirthDateInput(e.target.value))} className="w-full rounded-sm border border-border bg-white px-3.5 py-2.5 text-[14px] text-ink focus:border-navy outline-none" />
      )}
      <input type="hidden" name="birthDate" value={mode === "select" ? selectedDate : manualDate} />
      <p id="birth-date-help" className="mt-1.5 text-[12px] text-muted">연도를 고르거나 숫자 8자리를 입력하세요. 하이픈은 자동으로 표시됩니다.</p>
    </div>
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
