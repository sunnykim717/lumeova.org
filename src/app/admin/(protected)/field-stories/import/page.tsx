import { BandImportForm } from "@/components/admin/BandImportForm";

export default function ImportFieldStoryPage() {
  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-2">BAND 기록 가져오기</h1>
      <p className="text-[13px] text-muted mb-8">
        네이버 BAND 게시글을 직접 복사해 붙여넣는 방식입니다. 자동 연동은 하지 않습니다.
      </p>
      <BandImportForm />
    </div>
  );
}
