import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, MembershipStatus } from "@/lib/types/database";

/**
 * Review checks shown beside each membership application (design §5.2).
 *
 * The checks are display aids. They never approve or reject anyone. The only
 * automated action is bulk approval, and it is restricted to general
 * members whose checks all pass. Regular membership is always approved one
 * person at a time, as in the membership route's comment (spec §11).
 */

export type ReviewCheckCode = "REQUIRED_OK" | "DUP_SUSPECT" | "ALREADY_APPROVED" | "BIRTH_MISSING";

export type ReviewCheck = { code: ReviewCheckCode; ok: boolean; label: string };

export type ReviewInput = {
  membershipType: "regular" | "general";
  status: MembershipStatus;
  name: string;
  phone: string | null;
  email: string | null;
  birthDate: string | null;
  hasConsent: boolean;
  /** Other supporters sharing a normalized phone or email. */
  duplicateSupporterIds: string[];
  /** True if any of those supporters already has an approved membership. */
  duplicateApproved: boolean;
};

export function normalizePhone(raw: string | null | undefined): string | null {
  const digits = (raw ?? "").replace(/\D/g, "");
  return digits.length >= 9 ? digits : null;
}

export function normalizeEmail(raw: string | null | undefined): string | null {
  const value = (raw ?? "").trim().toLowerCase();
  return value === "" ? null : value;
}

export function evaluateMembership(input: ReviewInput): { checks: ReviewCheck[]; bulkEligible: boolean } {
  const requiredOk =
    input.name.trim() !== "" && (input.phone !== null || input.email !== null) && input.hasConsent;
  const dupFound = input.duplicateSupporterIds.length > 0;

  const checks: ReviewCheck[] = [
    { code: "REQUIRED_OK", ok: requiredOk, label: requiredOk ? "필수값 완비" : "필수값 확인 필요" },
    {
      code: "DUP_SUSPECT",
      ok: !dupFound,
      label: dupFound ? `중복 의심 ${input.duplicateSupporterIds.length}건` : "중복 없음",
    },
    {
      code: "ALREADY_APPROVED",
      ok: !input.duplicateApproved,
      label: input.duplicateApproved ? "동일인 승인 이력 있음" : "승인 이력 없음",
    },
  ];

  if (input.membershipType === "regular") {
    const birthOk = input.birthDate !== null;
    checks.push({
      code: "BIRTH_MISSING",
      ok: birthOk,
      label: birthOk ? "생년월일 있음" : "생년월일 누락",
    });
  }

  const bulkEligible =
    input.status === "pending" &&
    input.membershipType === "general" &&
    checks.every((c) => c.ok);

  return { checks, bulkEligible };
}

export type MembershipForReview = {
  id: string;
  supporter_id: string;
  membership_type: "regular" | "general";
  status: MembershipStatus;
};

/**
 * Loads what evaluateMembership needs for a set of memberships. Runs under
 * the caller's session, so RLS decides what is visible. Callers must be
 * admins.
 */
export async function loadReviewInputs(
  supabase: SupabaseClient<Database>,
  memberships: MembershipForReview[],
): Promise<Map<string, ReviewInput>> {
  const [{ data: everyone }, { data: approved }, { data: consents }] = await Promise.all([
    supabase.from("supporters").select("id, name, phone, email, birth_date"),
    supabase.from("memberships").select("supporter_id").eq("status", "approved"),
    supabase.from("privacy_consents").select("supporter_id"),
  ]);

  const supporters = everyone ?? [];
  const byId = new Map(supporters.map((s) => [s.id, s]));
  const approvedIds = new Set((approved ?? []).map((a) => a.supporter_id));
  const consentIds = new Set((consents ?? []).map((c) => c.supporter_id).filter(Boolean) as string[]);

  const byPhone = new Map<string, string[]>();
  const byEmail = new Map<string, string[]>();
  const index = (map: Map<string, string[]>, key: string | null, id: string) => {
    if (!key) return;
    map.set(key, [...(map.get(key) ?? []), id]);
  };
  for (const s of supporters) {
    index(byPhone, normalizePhone(s.phone), s.id);
    index(byEmail, normalizeEmail(s.email), s.id);
  }

  const result = new Map<string, ReviewInput>();
  for (const m of memberships) {
    const s = byId.get(m.supporter_id);
    if (!s) continue;

    const dupIds = new Set<string>([
      ...(byPhone.get(normalizePhone(s.phone) ?? "") ?? []),
      ...(byEmail.get(normalizeEmail(s.email) ?? "") ?? []),
    ]);
    dupIds.delete(s.id);
    const duplicateSupporterIds = [...dupIds];

    result.set(m.id, {
      membershipType: m.membership_type,
      status: m.status,
      name: s.name,
      phone: normalizePhone(s.phone) ? s.phone : null,
      email: normalizeEmail(s.email),
      birthDate: s.birth_date,
      hasConsent: consentIds.has(s.id),
      duplicateSupporterIds,
      duplicateApproved: duplicateSupporterIds.some((id) => approvedIds.has(id)),
    });
  }
  return result;
}
