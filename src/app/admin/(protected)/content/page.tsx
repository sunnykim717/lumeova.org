import Link from "next/link";
import { SECTIONS } from "@/lib/constants/siteContent";

export default function AdminContentPage() {
  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-2">홈페이지 콘텐츠</h1>
      <p className="text-[13px] text-muted mb-8">
        수정한 내용은 저장 즉시 홈페이지에 반영됩니다.
      </p>

      <ul className="divide-y divide-navy/10 rounded-sm border border-navy/10 bg-white">
        {SECTIONS.map((section) => (
          <li key={section.key} className="flex items-center justify-between gap-4 px-5 py-4">
            <div>
              <p className="text-[14.5px] font-medium text-ink">{section.label}</p>
              <p className="text-[12.5px] text-muted mt-0.5">{section.description}</p>
            </div>
            <Link
              href={`/admin/content/${section.key}`}
              className="shrink-0 text-[13px] px-4 py-2 rounded-sm bg-navy text-cream hover:bg-navy-light"
            >
              수정
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
