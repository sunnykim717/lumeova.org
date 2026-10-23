import "server-only";
import { createClient } from "@/lib/supabase/server";

export type SupporterRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  /** Has an active 정기후원 with at least one confirmed payment (counts toward the goal). */
  isRegular: boolean;
  /** Has at least one confirmed payment of any type. */
  hasConfirmedPayment: boolean;
  donationTypes: string[];
  activeAmount: number;
  marketingOptIn: boolean | null;
  appliedAt: string;
};

export const DONATION_TYPE_LABEL: Record<string, string> = {
  recurring: "정기후원",
  short_term: "단기후원",
  one_time: "일시후원",
};

type Client = Awaited<ReturnType<typeof createClient>>;

/**
 * Builds one row per supporter from donations, their payment confirmations,
 * and their latest privacy consent. Callers decide how much of each row to
 * show: the admin list masks contact details, the CSV export does not.
 *
 * Reads go through the admin's own session, so RLS limits this to admins.
 */
export async function loadSupporterRows(supabase: Client): Promise<SupporterRow[]> {
  const { data: donations } = await supabase
    .from("donations")
    .select("id, supporter_id, donation_type, amount, status, created_at")
    .order("created_at", { ascending: true });
  const donationList = donations ?? [];

  const supporterIds = [...new Set(donationList.map((d) => d.supporter_id))];
  const donationIds = donationList.map((d) => d.id);
  if (supporterIds.length === 0) return [];

  const [{ data: supporters }, { data: payments }, { data: consents }] = await Promise.all([
    supabase.from("supporters").select("id, name, phone, email, address").in("id", supporterIds),
    supabase.from("donation_payments").select("donation_id, status").in("donation_id", donationIds),
    supabase
      .from("privacy_consents")
      .select("supporter_id, marketing_opt_in, agreed_at")
      .in("supporter_id", supporterIds)
      .order("agreed_at", { ascending: false }),
  ]);

  const confirmedDonationIds = new Set(
    (payments ?? []).filter((p) => p.status === "confirmed").map((p) => p.donation_id)
  );
  const supporterMap = new Map((supporters ?? []).map((s) => [s.id, s]));

  const latestConsent = new Map<string, boolean>();
  for (const c of consents ?? []) {
    if (c.supporter_id && !latestConsent.has(c.supporter_id)) latestConsent.set(c.supporter_id, c.marketing_opt_in);
  }

  const rows = new Map<string, SupporterRow>();
  for (const d of donationList) {
    const base = supporterMap.get(d.supporter_id);
    if (!base) continue;

    let row = rows.get(d.supporter_id);
    if (!row) {
      row = {
        id: base.id,
        name: base.name,
        phone: base.phone,
        email: base.email,
        address: base.address,
        isRegular: false,
        hasConfirmedPayment: false,
        donationTypes: [],
        activeAmount: 0,
        marketingOptIn: latestConsent.get(base.id) ?? null,
        appliedAt: d.created_at,
      };
      rows.set(d.supporter_id, row);
    }

    const label = DONATION_TYPE_LABEL[d.donation_type] ?? d.donation_type;
    if (!row.donationTypes.includes(label)) row.donationTypes.push(label);

    const confirmed = confirmedDonationIds.has(d.id);
    if (confirmed) row.hasConfirmedPayment = true;
    if (d.donation_type === "recurring" && d.status === "active" && confirmed) row.isRegular = true;
    if (d.status === "active") row.activeAmount += d.amount;
  }

  return [...rows.values()];
}
