import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NewsForm } from "@/components/admin/NewsForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: news } = await supabase.from("news").select("*").eq("id", id).maybeSingle();

  if (!news) notFound();

  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-8">소식 수정</h1>
      <NewsForm news={news} />
    </div>
  );
}
