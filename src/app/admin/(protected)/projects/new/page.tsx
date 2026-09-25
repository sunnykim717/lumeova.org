import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-8">새 사업 등록</h1>
      <ProjectForm />
    </div>
  );
}
