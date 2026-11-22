"use client";

import { useState, useTransition, type FormEvent } from "react";
import { promoteGeneralMember, registerRegularMember } from "@/lib/actions/regularMembership";

const primaryButton = "min-h-11 rounded-sm bg-navy px-4 py-2 text-sm text-cream hover:bg-navy-light disabled:opacity-50";
const secondaryButton = "min-h-11 rounded-sm border border-navy/20 px-3 py-2 text-sm text-navy hover:border-navy/40 disabled:opacity-50";
const fieldClass = "min-h-11 w-full min-w-0 rounded-sm border border-navy/20 px-3 py-2 text-base";

export function RegularMemberRegistration() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError("");
    setRegistered(false);
    startTransition(async () => {
      try {
        const result = await registerRegularMember(formData);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        form.reset();
        setRegistered(true);
      } catch {
        setError("등록 결과를 확인할 수 없습니다. 회원 목록을 확인한 뒤 다시 시도해 주세요.");
      }
    });
  }

  return (
    <details className="mb-6 rounded-sm border border-navy/10 bg-white">
      <summary className="min-h-11 cursor-pointer px-4 py-3 font-medium text-navy">정회원 직접 등록</summary>
      <form onSubmit={submit} className="space-y-4 border-t border-navy/10 p-4 sm:p-5">
        <p className="text-sm text-muted">이름과 전화번호 또는 이메일을 입력해 주세요. 등록 즉시 승인 상태로 저장됩니다.</p>
        <fieldset disabled={pending} className="grid min-w-0 gap-4 sm:grid-cols-2">
          <label className="grid min-w-0 gap-1.5 text-sm">
            이름
            <input name="name" autoComplete="name" maxLength={100} required className={fieldClass} />
          </label>
          <label className="grid min-w-0 gap-1.5 text-sm">
            전화번호
            <input name="phone" type="tel" autoComplete="tel" maxLength={15} className={fieldClass} />
          </label>
          <label className="grid min-w-0 gap-1.5 text-sm">
            이메일
            <input name="email" type="email" autoComplete="email" maxLength={254} className={fieldClass} />
          </label>
          <label className="grid min-w-0 gap-1.5 text-sm">
            생년월일 (선택)
            <input name="birthDate" type="date" autoComplete="bday" className={fieldClass} />
          </label>
          <label className="grid min-w-0 gap-1.5 text-sm sm:col-span-2">
            주소 (선택)
            <input name="address" autoComplete="street-address" maxLength={300} className={fieldClass} />
          </label>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        {registered && <p role="status" className="text-sm text-navy">정회원으로 등록했습니다.</p>}
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "등록 중…" : "정회원으로 등록"}
        </button>
      </form>
    </details>
  );
}

export function PromoteMemberButton({ membershipId, memberName }: { membershipId: string; memberName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function promote() {
    setError("");
    startTransition(async () => {
      try {
        const result = await promoteGeneralMember(membershipId);
        if ("error" in result) {
          setError(result.error);
          return;
        }
        setConfirming(false);
      } catch {
        setError("전환 결과를 확인할 수 없습니다. 회원 목록을 새로고침해 주세요.");
      }
    });
  }

  if (!confirming) {
    return <button type="button" onClick={() => setConfirming(true)} className={secondaryButton}>정회원 전환</button>;
  }

  return (
    <div className="min-w-36 space-y-2">
      <p className="text-sm text-ink">{memberName} 님을 정회원으로 전환할까요?</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={promote} className={primaryButton}>
          {pending ? "전환 중…" : "전환 확인"}
        </button>
        <button type="button" disabled={pending} onClick={() => { setConfirming(false); setError(""); }} className={secondaryButton}>
          취소
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
