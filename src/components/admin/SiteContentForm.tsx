"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upsertSiteContent } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import type { SectionDef, SiteContentKey } from "@/lib/constants/siteContent";

type Item = Record<string, string>;

type Props = {
  section: SectionDef;
  initial: Record<string, unknown>;
};

const INPUT_CLASS = "w-full rounded-sm border border-border px-3.5 py-2.5 text-[14px]";

function toText(value: unknown) {
  return typeof value === "string" ? value : "";
}

export function SiteContentForm({ section, initial }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [flat, setFlat] = useState<Record<string, string>>(() =>
    Object.fromEntries(section.fields.map((f) => [f.name, toText(initial[f.name])]))
  );

  const [lists, setLists] = useState<Record<string, Item[]>>(() =>
    Object.fromEntries(
      section.lists.map((list) => {
        const raw = Array.isArray(initial[list.name]) ? (initial[list.name] as Item[]) : [];
        const items = raw.map((item) =>
          Object.fromEntries(list.fields.map((f) => [f.name, toText(item[f.name])]))
        );
        return [list.name, items];
      })
    )
  );

  function setListItems(name: string, next: Item[]) {
    setLists((prev) => ({ ...prev, [name]: next }));
  }

  function updateItem(name: string, index: number, field: string, value: string) {
    const items = lists[name];
    setListItems(
      name,
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  }

  function moveItem(name: string, index: number, delta: -1 | 1) {
    const items = [...lists[name]];
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setListItems(name, items);
  }

  function removeItem(name: string, index: number) {
    setListItems(name, lists[name].filter((_, i) => i !== index));
  }

  function addItem(list: SectionDef["lists"][number]) {
    const empty = Object.fromEntries(list.fields.map((f) => [f.name, ""]));
    setListItems(list.name, [...lists[list.name], empty]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await upsertSiteContent(section.key as SiteContentKey, { ...flat, ...lists });
        setSaved(true);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <p className="text-[13px] text-red-700 bg-red-50 border border-red-200 rounded-sm px-4 py-3">{error}</p>
      )}
      {saved && (
        <p className="text-[13px] text-navy bg-sage/60 border border-navy/10 rounded-sm px-4 py-3">
          저장되었습니다. 홈페이지에 반영되었습니다.
        </p>
      )}

      {section.fields.map((field) => (
        <div key={field.name}>
          <label className="block text-[13px] text-muted mb-1.5">{field.label}</label>
          {field.multiline ? (
            <textarea
              value={flat[field.name]}
              onChange={(e) => setFlat((p) => ({ ...p, [field.name]: e.target.value }))}
              rows={4}
              className={INPUT_CLASS}
            />
          ) : (
            <input
              value={flat[field.name]}
              onChange={(e) => setFlat((p) => ({ ...p, [field.name]: e.target.value }))}
              className={INPUT_CLASS}
            />
          )}
        </div>
      ))}

      {section.lists.map((list) => (
        <div key={list.name} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-medium text-navy">{list.label}</h2>
            <button
              type="button"
              onClick={() => addItem(list)}
              className="text-[13px] px-3 py-1.5 rounded-sm border border-navy/20 text-navy hover:bg-navy/5"
            >
              + 항목 추가
            </button>
          </div>

          {lists[list.name].length === 0 && (
            <p className="text-[13px] text-muted">
              항목이 없으면 기본 내용이 홈페이지에 표시됩니다.
            </p>
          )}

          {lists[list.name].map((item, index) => (
            <div key={index} className="rounded-sm border border-navy/10 bg-white p-5 space-y-4">
              <div className="flex items-center justify-between text-[12px] text-muted">
                <span>
                  {list.label} {index + 1}
                </span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => moveItem(list.name, index, -1)} className="hover:text-navy">
                    위로
                  </button>
                  <button type="button" onClick={() => moveItem(list.name, index, 1)} className="hover:text-navy">
                    아래로
                  </button>
                  <button type="button" onClick={() => removeItem(list.name, index)} className="text-red-700">
                    삭제
                  </button>
                </div>
              </div>
              {list.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-[13px] text-muted mb-1.5">{field.label}</label>
                  {field.multiline ? (
                    <textarea
                      value={item[field.name]}
                      onChange={(e) => updateItem(list.name, index, field.name, e.target.value)}
                      rows={3}
                      className={INPUT_CLASS}
                    />
                  ) : (
                    <input
                      value={item[field.name]}
                      onChange={(e) => updateItem(list.name, index, field.name, e.target.value)}
                      className={INPUT_CLASS}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}

      <Button type="submit" disabled={isPending}>
        {isPending ? "저장 중..." : "저장"}
      </Button>
    </form>
  );
}
