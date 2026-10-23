import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FieldStoryForm } from "@/components/admin/FieldStoryForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditFieldStoryPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: story } = await supabase.from("field_stories").select("*").eq("id", id).maybeSingle();

  if (!story) notFound();

  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-8">현장 이야기 수정</h1>
      <FieldStoryForm story={story} />
    </div>
  );
}
