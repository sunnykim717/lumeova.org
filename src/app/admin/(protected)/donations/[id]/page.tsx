"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/types/database";

type Supporter = Database["public"]["Tables"]["supporters"]["Row"];
type Donation = Database["public"]["Tables"]["donations"]["Row"];
type DonationPayment = Database["public"]["Tables"]["donation_payments"]["Row"];
type AdminNote = Database["public"]["Tables"]["admin_notes"]["Row"];

interface DonationDetail {
  donation: Donation | null;
  supporter: Supporter | null;
  payments: DonationPayment[];
  adminNotes: AdminNote[];
}

export default function DonationDetailPage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<DonationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    async function fetchDonationData() {
      try {
        // Fetch donation
        const { data: donationData, error: donationError } = await supabase
          .from("donations")
          .select("*")
          .eq("id", params.id)
          .single();

        if (donationError) throw donationError;
        if (!donationData) {
          setError("후원 정보를 찾을 수 없습니다.");
          return;
        }

        // Fetch supporter
        const { data: supporterData } = await supabase
          .from("supporters")
          .select("*")
          .eq("id", donationData.supporter_id)
          .single();

        // Fetch payments
        const { data: paymentsData } = await supabase
          .from("donation_payments")
          .select("*")
          .eq("donation_id", params.id)
          .order("created_at", { ascending: false });

        // Fetch admin notes
        const { data: notesData } = await supabase
          .from("admin_notes")
          .select("*")
          .eq("supporter_id", donationData.supporter_id)
          .order("created_at", { ascending: false });

        setData({
          donation: donationData,
          supporter: supporterData || null,
          payments: paymentsData || [],
          adminNotes: notesData || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchDonationData();
  }, [params.id, supabase]);

  if (loading) {
    return <div className="section-wrap py-10">로딩 중...</div>;
  }

  if (error || !data?.donation) {
    return (
      <div className="section-wrap py-10 text-red-500">
        {error || "후원 정보를 불러올 수 없습니다."}
      </div>
    );
  }

  const { donation, supporter, payments, adminNotes } = data;

  return (
    <div className="section-wrap py-10">
      <div className="mb-8">
        <h1 className="text-[28px] font-display text-navy mb-2">후원 상세 정보</h1>
        <p className="text-[14px] text-muted">ID: {params.id}</p>
      </div>

      {/* Donation Basic Info */}
      <section className="bg-white border border-border rounded-sm p-6 mb-8">
        <h2 className="font-display text-[18px] text-navy mb-4">후원 정보</h2>
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 text-[14px]">
          <dt className="text-muted font-medium">후원자</dt>
          <dd className="text-ink">
            {supporter ? (
              <a
                href={`/admin/members/${supporter.id}`}
                className="text-navy hover:text-gold transition-colors underline"
              >
                {supporter.name}
              </a>
            ) : (
              "정보 없음"
            )}
          </dd>

          <dt className="text-muted font-medium">후원유형</dt>
          <dd className="text-ink">
            {donation.donation_type === "recurring"
              ? "정기후원"
              : donation.donation_type === "short_term"
                ? "단기후원"
                : "일시후원"}
          </dd>

          <dt className="text-muted font-medium">후원금액</dt>
          <dd className="text-ink font-medium text-[16px] text-gold">
            {donation.amount?.toLocaleString()}원
          </dd>

          <dt className="text-muted font-medium">상태</dt>
          <dd className="text-ink">
            <span
              className={`px-2 py-1 rounded text-[12px] font-medium ${
                donation.status === "active"
                  ? "bg-blue-100 text-blue-700"
                  : donation.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
              }`}
            >
              {donation.status === "active"
                ? "진행중"
                : donation.status === "completed"
                  ? "완료"
                  : "취소됨"}
            </span>
          </dd>

          <dt className="text-muted font-medium">신청일</dt>
          <dd className="text-ink">
            {new Date(donation.created_at).toLocaleDateString("ko-KR")}
          </dd>

          {donation.start_date && (
            <>
              <dt className="text-muted font-medium">시작일</dt>
              <dd className="text-ink">{donation.start_date}</dd>
            </>
          )}

          {donation.end_date && (
            <>
              <dt className="text-muted font-medium">종료일</dt>
              <dd className="text-ink">{donation.end_date}</dd>
            </>
          )}
        </dl>
      </section>

      {/* Payment History */}
      {payments.length > 0 && (
        <section className="bg-white border border-border rounded-sm p-6 mb-8">
          <h2 className="font-display text-[18px] text-navy mb-4">
            입금 이력 ({payments.length})
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead className="bg-cream border-b border-border">
                <tr>
                  <th className="text-left p-3 text-muted font-medium">입금일</th>
                  <th className="text-right p-3 text-muted font-medium">금액</th>
                  <th className="text-left p-3 text-muted font-medium">상태</th>
                  <th className="text-left p-3 text-muted font-medium">확인일</th>
                  <th className="text-left p-3 text-muted font-medium">비고</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className="border-b border-border hover:bg-cream/50"
                  >
                    <td className="p-3 text-ink">
                      {payment.payment_date || "-"}
                    </td>
                    <td className="text-right p-3 text-ink font-medium">
                      {payment.amount?.toLocaleString()}원
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded text-[11px] font-medium ${
                          payment.status === "confirmed"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : payment.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {payment.status === "confirmed"
                          ? "확인됨"
                          : payment.status === "pending"
                            ? "대기중"
                            : payment.status === "unpaid"
                              ? "미수금"
                              : "취소됨"}
                      </span>
                    </td>
                    <td className="p-3 text-muted">
                      {payment.confirmed_at
                        ? new Date(payment.confirmed_at).toLocaleDateString(
                            "ko-KR"
                          )
                        : "-"}
                    </td>
                    <td className="p-3 text-muted truncate">
                      {payment.admin_note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Admin Notes */}
      {adminNotes.length > 0 && (
        <section className="bg-white border border-border rounded-sm p-6 mb-8">
          <h2 className="font-display text-[18px] text-navy mb-4">
            관리자 메모 ({adminNotes.length})
          </h2>
          <div className="space-y-4">
            {adminNotes.map((note) => (
              <div key={note.id} className="border-l-2 border-gold pl-4 py-2">
                <p className="text-[14px] text-ink">{note.note}</p>
                <p className="text-[12px] text-muted mt-2">
                  {new Date(note.created_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {supporter && (
        <section className="text-center space-x-4">
          <Link
            href={`/admin/members/${supporter.id}`}
            className="inline-block px-6 py-2 text-[14px] text-navy hover:text-gold transition-colors underline"
          >
            후원자 정보 보기
          </Link>
          <Link
            href="/admin/donations"
            className="inline-block px-6 py-2 text-[14px] text-navy hover:text-gold transition-colors underline"
          >
            목록으로 돌아가기
          </Link>
        </section>
      )}
    </div>
  );
}
