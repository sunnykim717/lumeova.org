"use client";

import { useTransition } from "react";
import { purgeContent, restoreContent, type ContentTable } from "@/lib/actions/admin";

type Props = {
  table: ContentTable;
  id: string;
  mode: "restore" | "purge";
};

/** 휴지통 화면의 복구·영구 삭제 버튼. 영구 삭제는 한 번 더 확인합니다. */
export function TrashActionButton({ table, id, mode }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (mode === "purge" && !window.confirm("영구 삭제하면 되돌릴 수 없습니다. 정말 삭제할까요?")) return;
    startTransition(async () => {
      try {
        if (mode === "restore") await restoreContent(table, id);
        else await purgeContent(table, id);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : "처리 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={handleClick}
      className={`text-[12px] underline underline-offset-4 disabled:opacity-50 ${
        mode === "restore" ? "text-navy" : "text-red-700"
      }`}
    >
      {mode === "restore" ? "복구" : "영구 삭제"}
    </button>
  );
}
