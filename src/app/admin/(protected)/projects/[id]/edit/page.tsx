import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "@/components/admin/ProjectForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();

  if (!project) notFound();

  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-8">사업 수정</h1>
      <ProjectForm project={project} />
    </div>
  );
}
