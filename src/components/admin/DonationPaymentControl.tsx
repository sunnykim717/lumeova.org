"use client";

import { useState, useTransition } from "react";
import { recordDonationPayment } from "@/lib/actions/admin";

type Props = {
  donationId: string;
  defaultAmount: number;
  confirmed: boolean;
};

export function DonationPaymentControl({ donationId, defaultAmount, confirmed }: Props) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(defaultAmount));
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [isPending, startTransition] = useTransition();

  if (confirmed) {
    return <span className="text-[12px] text-muted">-</span>;
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[12px] px-2.5 py-1 rounded-sm bg-navy text-cream hover:bg-navy-light"
      >
        입금확인
      </button>
    );
  }

  function submit() {
    startTransition(async () => {
      await recordDonationPayment({
        donationId,
        amount: Number(amount),
        paymentDate: date,
      });
      setOpen(false);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-24 rounded-sm border border-border px-2 py-1 text-[12.5px]"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-sm border border-border px-2 py-1 text-[12.5px]"
      />
      <button
        disabled={isPending}
        onClick={submit}
        className="text-[12px] px-2.5 py-1 rounded-sm bg-navy text-cream hover:bg-navy-light disabled:opacity-50"
      >
        확인
      </button>
      <button onClick={() => setOpen(false)} className="text-[12px] text-muted hover:text-navy">
        취소
      </button>
    </div>
  );
}
