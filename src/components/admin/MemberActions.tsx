"use client";

import { useTransition } from "react";
import { updateMembershipStatus } from "@/lib/actions/admin";
import type { MembershipStatus } from "@/lib/types/database";

export function MemberActions({ membershipId, status }: { membershipId: string; status: MembershipStatus }) {
  const [isPending, startTransition] = useTransition();

  function run(next: MembershipStatus) {
    startTransition(async () => {
      await updateMembershipStatus(membershipId, next);
    });
  }

  if (status === "pending") {
    return (
      <div className="flex gap-2">
        <button
          disabled={isPending}
          onClick={() => run("approved")}
          className="text-[12px] px-2.5 py-1 rounded-sm bg-navy text-cream hover:bg-navy-light disabled:opacity-50"
        >
          승인
        </button>
        <button
          disabled={isPending}
          onClick={() => run("rejected")}
          className="text-[12px] px-2.5 py-1 rounded-sm border border-navy/20 text-muted hover:border-navy/40 disabled:opacity-50"
        >
          거절
        </button>
      </div>
    );
  }

  if (status === "approved") {
    return (
      <button
        disabled={isPending}
        onClick={() => run("inactive")}
        className="text-[12px] px-2.5 py-1 rounded-sm border border-navy/20 text-muted hover:border-navy/40 disabled:opacity-50"
      >
        비활성화
      </button>
    );
  }

  return <span className="text-[12px] text-muted">-</span>;
}
