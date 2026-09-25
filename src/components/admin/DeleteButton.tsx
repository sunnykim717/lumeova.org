"use client";

import { useTransition } from "react";

type Props = {
  id: string;
  action: (id: string) => Promise<void>;
  confirmLabel: string;
};

export function DeleteButton({ id, action, confirmLabel }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!window.confirm(confirmLabel)) return;
    startTransition(async () => {
      await action(id);
    });
  }

  return (
    <button
      disabled={isPending}
      onClick={handleClick}
      className="text-[12px] text-red-700 underline underline-offset-4 disabled:opacity-50"
    >
      삭제
    </button>
  );
}
