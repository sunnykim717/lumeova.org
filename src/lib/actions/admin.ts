"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus, PaymentStatus, ContentStatus } from "@/lib/types/database";

/**
 * All mutations here go through the anon-key server client — i.e. the
 * signed-in admin's own session. Postgres RLS (is_admin(), see
 * supabase/migrations/0001_init.sql) is what actually allows these writes;
 * this file does not itself decide who's allowed to call it. If the
 * session isn't an admin, every one of these calls fails at the database.
 */

async function logAction(action: string, targetType: string, targetId: string) {
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
};

export async function upsertProject(input: ProjectInput) {
  const supabase = await createClient();
  const row = {
    title: input.title,
    slug: input.slug,
    summary: input.summary || null,
    content: input.content || null,
    location: input.location || null,
    start_date: input.start_date || null,
    end_date: input.end_date || null,
    status: input.status,
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
};

export async function upsertNews(input: NewsInput) {
  const supabase = await createClient();
  const row = {
    title: input.title,
    slug: input.slug,
    category: input.category || null,
    summary: input.summary || null,
    content: input.content || null,
    status: input.status,
    published_at: input.published_at || null,
  };

  if (input.id) {
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

export async function deleteNews(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAction("news_deleted", "news", id);
  revalidatePath("/admin/news");
  revalidatePath("/news");
}
