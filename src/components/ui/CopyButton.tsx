"use client";

import { useState } from "react";

/** Copies a value to the clipboard. Falls back to a visible message when the browser blocks it. */
export function CopyButton({ value, label = "복사" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleCopy() {
    setFailed(false);
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setFailed(true);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleCopy}
        className="text-[12.5px] px-3 py-1 rounded-sm border border-navy/20 text-navy hover:bg-navy/5"
      >
        {copied ? "복사되었습니다" : label}
      </button>
      {failed && <span className="text-[12px] text-red-700">복사하지 못했습니다. 직접 선택해 주세요.</span>}
    </span>
  );
}
