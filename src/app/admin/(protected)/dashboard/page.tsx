import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteStatsPanel, type StatRow } from "@/components/admin/SiteStatsPanel";

function formatStat(key: string, value: number): string {
  if (key === "confirmed_total") return `${value.toLocaleString("ko-KR")}원 이상`;
  if (key === "published_news") return `${value.toLocaleString("ko-KR")}건`;
  return `${value.toLocaleString("ko-KR")}명`;
}

async function getStats(): Promise<StatRow[]> {
  const supabase = await createClient();
  // Admins can read every row, including hidden ones (site_stats RLS).
  const { data } = await supabase.from("site_stats").select("key, label, value, visible, admin_hidden, as_of").order("key");
  return (data ?? []).map((s) => ({
    key: s.key,
    label: s.label,
    display: formatStat(s.key, s.value),
    visible: s.visible,
    adminHidden: s.admin_hidden,
    asOf: new Date(s.as_of).toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" }),
  }));
}

async function getCounts() {
  const supabase = await createClient();

  const [pendingMembers, activeMembers, activeDonationsRes, paidDonationIdsRes] = await Promise.all([
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("donations").select("id").eq("status", "active"),
    supabase.from("donation_payments").select("donation_id").eq("status", "confirmed"),
  ]);

  const activeDonationIds = new Set((activeDonationsRes.data ?? []).map((d) => d.id));
  const paidDonationIds = new Set((paidDonationIdsRes.data ?? []).map((p) => p.donation_id));
  const unconfirmedDonations = [...activeDonationIds].filter((id) => !paidDonationIds.has(id)).length;

  return {
    pendingMembers: pendingMembers.count ?? 0,
    activeMembers: activeMembers.count ?? 0,
    activeDonations: activeDonationIds.size,
    unconfirmedDonations,
  };
}

export default async function AdminDashboardPage() {
  const [counts, stats] = await Promise.all([getCounts(), getStats()]);

  const cards = [
    { label: "승인 대기 회원", value: counts.pendingMembers, href: "/admin/members?status=pending" },
    { label: "승인된 회원", value: counts.activeMembers, href: "/admin/members?status=approved" },
    { label: "진행 중 후원", value: counts.activeDonations, href: "/admin/donations" },
    { label: "입금 미확인 후원", value: counts.unconfirmedDonations, href: "/admin/donations?filter=unconfirmed" },
  ];

  return (
    <div>
      <h1 className="font-display text-[24px] text-navy mb-8">대시보드</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-sm border border-navy/10 bg-white p-6 hover:border-gold-dark transition-colors"
          >
            <p className="text-[12.5px] text-muted mb-2">{card.label}</p>
            <p className="font-display text-[30px] text-navy tabular-nums">{card.value}</p>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <SiteStatsPanel stats={stats} />
      </div>

      <div className="mt-10 rounded-sm border border-navy/10 bg-white p-6">
        <p className="text-[13px] text-muted leading-relaxed">
          회원가입·후원 신청은 접수 즉시 여기 반영됩니다. 정회원 승인은 관리자 확인 후
          회원 페이지에서, 후원 입금 확인은 후원 페이지에서 처리해 주세요.
        </p>
      </div>
    </div>
  );
}
