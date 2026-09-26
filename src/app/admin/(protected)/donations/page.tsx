import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DonationPaymentControl } from "@/components/admin/DonationPaymentControl";

const TYPE_LABEL: Record<string, string> = {
  recurring: "정기후원",
  short_term: "단기후원",
  one_time: "일시후원",
};

const STATUS_LABEL: Record<string, string> = {
  active: "진행중",
  completed: "종료",
  cancelled: "취소",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function AdminDonationsPage() {
  const supabase = await createClient();

  const { data: donations } = await supabase
    .from("donations")
    .select("id, supporter_id, donation_type, amount, status, created_at")
    .order("created_at", { ascending: false });

  const supporterIds = [...new Set((donations ?? []).map((d) => d.supporter_id))];
  const donationIds = (donations ?? []).map((d) => d.id);

  const [{ data: supporters }, { data: payments }] = await Promise.all([
    supporterIds.length
      ? supabase.from("supporters").select("id, name, phone").in("id", supporterIds)
      : Promise.resolve({ data: [] }),
    donationIds.length
      ? supabase
          .from("donation_payments")
          .select("id, donation_id, amount, payment_date, status")
          .in("donation_id", donationIds)
          .order("payment_date", { ascending: false })
      : Promise.resolve({ data: [] }),
  ]);

  type PaymentRow = {
    id: string;
    donation_id: string;
    amount: number;
    payment_date: string | null;
    status: string;
  };

  const supporterMap = new Map((supporters ?? []).map((s) => [s.id, s]));
  const latestPaymentByDonation = new Map<string, PaymentRow>();
  for (const p of (payments ?? []) as PaymentRow[]) {
    if (!latestPaymentByDonation.has(p.donation_id)) {
      latestPaymentByDonation.set(p.donation_id, p);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[24px] text-navy">후원</h1>
        <Link
          href="/admin/donations/export"
          className="text-[13px] px-4 py-2 rounded-sm border border-navy/20 text-navy hover:border-navy/40"
        >
          CSV 내보내기
        </Link>
      </div>

      <div className="rounded-sm border border-navy/10 bg-white overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead>
            <tr className="border-b border-navy/10 text-left text-muted text-[12px]">
              <th className="px-4 py-3 font-medium">입금자명</th>
              <th className="px-4 py-3 font-medium">유형</th>
              <th className="px-4 py-3 font-medium">금액</th>
              <th className="px-4 py-3 font-medium">상태</th>
              <th className="px-4 py-3 font-medium">입금확인</th>
              <th className="px-4 py-3 font-medium">신청일</th>
              <th className="px-4 py-3 font-medium">처리</th>
            </tr>
          </thead>
          <tbody>
            {(donations ?? []).length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-muted">
                  등록된 후원 신청이 없습니다.
                </td>
              </tr>
            ) : (
              (donations ?? []).map((d) => {
                const supporter = supporterMap.get(d.supporter_id);
                const payment = latestPaymentByDonation.get(d.id);
                return (
                  <tr key={d.id} className="border-b border-navy/5 last:border-0">
                    <td className="px-4 py-3 text-ink font-medium">{supporter?.name ?? "-"}</td>
                    <td className="px-4 py-3 text-muted">{TYPE_LABEL[d.donation_type]}</td>
                    <td className="px-4 py-3 text-muted tabular-nums">{d.amount.toLocaleString("ko-KR")}원</td>
                    <td className="px-4 py-3 text-muted">{STATUS_LABEL[d.status]}</td>
                    <td className="px-4 py-3">
                      {payment?.status === "confirmed" ? (
                        <span className="text-[11.5px] px-2 py-0.5 rounded-full bg-sage text-navy">
                          확인됨 ({payment.payment_date ? formatDate(payment.payment_date) : "-"})
                        </span>
                      ) : (
                        <span className="text-[11.5px] px-2 py-0.5 rounded-full bg-gold/20 text-gold-dark">
                          미확인
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted tabular-nums">{formatDate(d.created_at)}</td>
                    <td className="px-4 py-3">
                      <DonationPaymentControl
                        donationId={d.id}
                        defaultAmount={d.amount}
                        confirmed={payment?.status === "confirmed"}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
