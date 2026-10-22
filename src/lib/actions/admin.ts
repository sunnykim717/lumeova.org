"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { loadReviewInputs, evaluateMembership, type MembershipForReview } from "@/lib/admin/memberReview";
import type { Database, MembershipStatus, PaymentStatus, ContentStatus } from "@/lib/types/database";

/**
 * All mutations here go through the anon-key server client — i.e. the
 * signed-in admin's own session. Postgres RLS (is_admin(), see
 * supabase/migrations/0001_init.sql) is what actually allows these writes;
 * this file does not itself decide who's allowed to call it. If the
 * session isn't an admin, every one of these calls fails at the database.
 */

async function logAction(
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  await supabase.from("audit_logs").insert({
    admin_id: user.id,
    action,
    target_type: targetType,
    target_id: targetId,
    metadata: metadata ?? null,
  });
}

export async function updateMembershipStatus(membershipId: string, status: MembershipStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const patch: { status: MembershipStatus; approved_at?: string | null; approved_by?: string | null } = {
    status,
  };
  if (status === "approved") {
    patch.approved_at = new Date().toISOString();
    patch.approved_by = user?.id ?? null;
  }

  const { error } = await supabase.from("memberships").update(patch).eq("id", membershipId);
  if (error) throw new Error(error.message);

  await logAction(`membership_${status}`, "membership", membershipId);
  revalidatePath("/admin/members");
}

/**
 * Approves general (일반회원) applications whose review checks all pass.
 * The checks are recomputed here from the database, so the client's
 * selection is never trusted. Regular membership is not eligible.
 */
export async function bulkApproveGeneralMembers(
  membershipIds: string[],
): Promise<{ approved: number; skipped: { id: string; reason: string }[] }> {
  const ids = z.array(z.uuid()).min(1).max(200).parse(membershipIds);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("관리자 로그인이 필요합니다.");

  const { data: rows, error } = await supabase
    .from("memberships")
    .select("id, supporter_id, membership_type, status")
    .in("id", ids);
  if (error) throw new Error(error.message);

  const memberships = (rows ?? []) as MembershipForReview[];
  const inputs = await loadReviewInputs(supabase, memberships);

  const skipped: { id: string; reason: string }[] = [];
  const approvedIds: string[] = [];
  for (const id of ids) {
    const m = memberships.find((x) => x.id === id);
    const input = inputs.get(id);
    if (!m || !input) {
      skipped.push({ id, reason: "찾을 수 없음" });
      continue;
    }
    const { bulkEligible, checks } = evaluateMembership(input);
    if (!bulkEligible) {
      const failed = checks.filter((c) => !c.ok).map((c) => c.label);
      skipped.push({
        id,
        reason: m.membership_type === "regular" ? "정회원은 한 건씩 승인" : failed.join(", ") || "대상 아님",
      });
      continue;
    }

    const { error: updateError } = await supabase
      .from("memberships")
      .update({ status: "approved", approved_at: new Date().toISOString(), approved_by: user.id })
      .eq("id", id);
    if (updateError) {
      skipped.push({ id, reason: updateError.message });
      continue;
    }
    approvedIds.push(id);
    await logAction("membership_approved", "membership", id, { bulk: true });
  }

  if (approvedIds.length > 0) revalidatePath("/admin/members");
  return { approved: approvedIds.length, skipped };
}

export async function recordDonationPayment(input: {
  donationId: string;
  amount: number;
  paymentDate: string;
  note?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("donation_payments").insert({
    donation_id: input.donationId,
    amount: input.amount,
    payment_date: input.paymentDate,
    status: "confirmed",
    confirmed_by: user?.id ?? null,
    confirmed_at: new Date().toISOString(),
    admin_note: input.note || null,
  });
  if (error) throw new Error(error.message);

  await logAction("donation_payment_confirmed", "donation", input.donationId);
  revalidatePath("/admin/donations");
}

export async function updateDonationPaymentStatus(paymentId: string, status: PaymentStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("donation_payments").update({ status }).eq("id", paymentId);
  if (error) throw new Error(error.message);

  await logAction(`donation_payment_${status}`, "donation_payment", paymentId);
  revalidatePath("/admin/donations");
}

export async function updateDonationStatus(donationId: string, status: "active" | "completed" | "cancelled") {
  const supabase = await createClient();
  const { error } = await supabase.from("donations").update({ status }).eq("id", donationId);
  if (error) throw new Error(error.message);

  await logAction(`donation_${status}`, "donation", donationId);
  revalidatePath("/admin/donations");
}

type ProjectInput = {
  id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  location: string;
  start_date: string;
  end_date: string;
  status: ContentStatus;
  consentChecked: boolean;
};

export async function upsertProject(input: ProjectInput) {
  const supabase = await createClient();
  if (input.status === "published" && !input.consentChecked) {
    throw new Error("게시하려면 사진·실명 게시 동의를 확인해 주세요.");
  }
  const row = {
    title: input.title,
    slug: input.slug,
    summary: input.summary || null,
    content: input.content || null,
    location: input.location || null,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    status: input.status,
    consent_confirmed_at: input.consentChecked ? new Date().toISOString() : null,
  };

  if (input.id) {
    const { error } = await supabase.from("projects").update(row).eq("id", input.id);
    if (error) throw new Error(error.message);
    await logAction("project_updated", "project", input.id);
  } else {
    const { data, error } = await supabase.from("projects").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    await logAction("project_created", "project", data.id);
  }

  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAction("project_deleted", "project", id);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

type NewsInput = {
  id?: string;
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  status: ContentStatus;
  published_at: string;
  consentChecked: boolean;
};

export async function upsertNews(input: NewsInput) {
  const supabase = await createClient();
  if (input.status === "published" && !input.consentChecked) {
    throw new Error("게시하려면 사진·실명 게시 동의를 확인해 주세요.");
  }
  const row: Database["public"]["Tables"]["news"]["Insert"] = {
    title: input.title,
    slug: input.slug,
    category: input.category || null,
    summary: input.summary || null,
    content: input.content || null,
    status: input.status,
    published_at: input.published_at || null,
    consent_confirmed_at: input.consentChecked ? new Date().toISOString() : null,
  };

  if (input.id) {
    // Editing a sheet-sourced row locks it, so the next sheet sync leaves
    // the admin's version alone (design §6.1.3).
    const { data: existing, error: readError } = await supabase
      .from("news")
      .select("source")
      .eq("id", input.id)
      .single();
    if (readError) throw new Error(readError.message);
    if (existing.source === "sheet") row.admin_locked = true;

    const { error } = await supabase.from("news").update(row).eq("id", input.id);
    if (error) throw new Error(error.message);
    await logAction("news_updated", "news", input.id);
  } else {
    const { data, error } = await supabase.from("news").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    await logAction("news_created", "news", data.id);
  }

  revalidatePath("/admin/news");
  revalidatePath("/news");
}

/** Recomputes aggregates (refresh_site_stats checks is_admin itself). */
export async function refreshSiteStats() {
  const supabase = await createClient();
  const { error } = await supabase.rpc("refresh_site_stats");
  if (error) throw new Error(error.message);
  await logAction("site_stats_refreshed", "site_stats", "all");
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/about");
}

/** Hides one public statistic. The hidden flag survives refreshes. */
export async function setStatHidden(key: string, hidden: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("site_stats").update({ admin_hidden: hidden }).eq("key", key);
  if (error) throw new Error(error.message);
  await logAction(hidden ? "site_stat_hidden" : "site_stat_shown", "site_stats", key);
  revalidatePath("/admin/dashboard");
  revalidatePath("/");
  revalidatePath("/about");
}

/** Unlocking lets the next sheet sync overwrite the row again. */
export async function setNewsSyncLock(id: string, locked: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("news").update({ admin_locked: locked }).eq("id", id).eq("source", "sheet");
  if (error) throw new Error(error.message);
  await logAction(locked ? "news_sync_locked" : "news_sync_unlocked", "news", id);
  revalidatePath("/admin/news");
}

export async function deleteNews(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAction("news_deleted", "news", id);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}
