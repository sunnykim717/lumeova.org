import Link from "next/link";
import { notFound } from "next/navigation";
import { SECTIONS, type SiteContentKey } from "@/lib/constants/siteContent";
import { getSiteContent } from "@/lib/data/content";
import { SiteContentForm } from "@/components/admin/SiteContentForm";

type Props = {
  params: Promise<{ key: string }>;
};

export default async function EditSiteContentPage({ params }: Props) {
  const { key } = await params;
  const section = SECTIONS.find((s) => s.key === key);
  if (!section) notFound();

  const content = await getSiteContent(section.key as SiteContentKey);

  return (
    <div>
      <p className="text-[12px] text-muted mb-2">
        <Link href="/admin/content" className="underline underline-offset-4">홈페이지 콘텐츠</Link> / {section.label}
      </p>
      <h1 className="font-display text-[24px] text-navy mb-2">{section.label} 수정</h1>
      <p className="text-[13px] text-muted mb-8">{section.description}</p>
      <SiteContentForm section={section} initial={content as unknown as Record<string, unknown>} />
    </div>
  );
}
