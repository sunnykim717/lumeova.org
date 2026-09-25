import { NewsForm } from "@/components/admin/NewsForm";

export default function NewNewsPage() {
  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-8">새 소식 등록</h1>
      <NewsForm />
    </div>
  );
}
