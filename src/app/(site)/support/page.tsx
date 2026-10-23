import { redirect } from "next/navigation";

/** 정회원 모집 현황은 회원가입 페이지로 통합되었습니다. 이전 주소를 연결합니다. */
export default function SupportPage() {
  redirect("/membership");
}
