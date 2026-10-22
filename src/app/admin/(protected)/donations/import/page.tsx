import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { matchDeposits, type OpenDonation, type UnmatchedDeposit } from "@/lib/bank/matchDeposits";
import { BankCsvUpload } from "@/components/admin/BankCsvUpload";
import { BankMatchTable, type MatchRow } from "@/components/admin/BankMatchTable";

const LOOKBACK_DAYS = 90;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}

export default async function AdminDonationImportPage() {
  const supabase = await createClient();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: deposits }, { data: donations }, { data: confirmed }] = await Promise.all([
    supabase
      .from("bank_transactions")
      .select("id, transacted_at, amount, counterparty_name")
      .is("matched_payment_id", null)
      .gte("transacted_at", since)
      .order("transacted_at", { ascending: false })
      .limit(300),
    supabase
      .from("donations")
      .select("id, supporter_id, amount, created_at")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase.from("donation_payments").select("donation_id").eq("status", "confirmed"),
  ]);

  const confirmedIds = new Set((confirmed ?? []).map((p) => p.donation_id));
  const openDonationRows = (donations ?? []).filter((d) => !confirmedIds.has(d.id));

  const supporterIds = [...new Set(openDonationRows.map((d) => d.supporter_id))];
  const { data: supporters } = supporterIds.length
    ? await supabase.from("supporters").select("id, name").in("id", supporterIds)
    : { data: [] as { id: string; name: string }[] };
  const nameById = new Map((supporters ?? []).map((s) => [s.id, s.name]));

  const openDonations: OpenDonation[] = openDonationRows.map((d) => ({
    id: d.id,
    amount: d.amount,
    createdAt: d.created_at,
    depositorName: nameById.get(d.supporter_id) ?? null,
  }));
  const donationById = new Map(openDonations.map((d) => [d.id, d]));

  const unmatched: UnmatchedDeposit[] = (deposits ?? []).map((d) => ({
    id: d.id,
    transactedAt: d.transacted_at,
    amount: d.amount,
    counterpartyName: d.counterparty_name,
  }));
  const results = matchDeposits(unmatched, openDonations);
  const depositById = new Map((deposits ?? []).map((d) => [d.id, d]));

  const rows: MatchRow[] = results.map((r) => {
    const dep = depositById.get(r.transactionId)!;
    return {
      transactionId: dep.id,
      transactedAt: formatDate(dep.transacted_at),
      amount: dep.amount,
      counterpartyName: dep.counterparty_name ?? "-",
      grade: r.grade,
      donationId: r.donationId,
      candidates: r.candidateDonationIds.map((id) => {
        const don = donationById.get(id)!;
        return {
          donationId: id,
          label: `${don.depositorName ?? "-"} · ${don.amount.toLocaleString("ko-KR")}원 · 신청 ${formatDate(don.createdAt)}`,
          amount: don.amount,
        };
      }),
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-[24px] text-navy">입금 대조</h1>
        <Link href="/admin/donations" className="text-[13px] text-navy underline underline-offset-4">
          후원 목록으로
        </Link>
      </div>

      <p className="text-[13px] text-muted leading-relaxed mb-6 max-w-2xl">
        은행 거래내역 CSV를 올리면 미확인 후원 신청과 대조해 후보를 보여 줍니다. 자동으로 입금 확인되지
        않으며, 선택한 항목만 직접 확정됩니다. 같은 거래 내역은 다시 올려도 중복 저장되지 않습니다.
      </p>

      <BankCsvUpload />

      <h2 className="font-display text-[18px] text-navy mt-12 mb-4">
        미확인 입금 (최근 {LOOKBACK_DAYS}일)
      </h2>
      <BankMatchTable rows={rows} />
    </div>
  );
}
