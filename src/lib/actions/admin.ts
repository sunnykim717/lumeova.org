"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus, PaymentStatus, ContentStatus } from "@/lib/types/database";
import { sanitizeSection, type SiteContentKey } from "@/lib/constants/siteContent";
import type { ProjectCategory } from "@/lib/constants/projects";
import { isStoryPeriod, sanitizeStoryPhotos } from "@/lib/constants/fieldStories";

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
  category: ProjectCategory | "";
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
    category: input.category || null,
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
  await moveToTrash("projects", id);
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
  await moveToTrash("news", id);
}

export async function upsertSiteContent(key: SiteContentKey, raw: unknown) {
  const value = sanitizeSection(key, raw);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("site_content")
    .upsert({ key, value, updated_by: user?.id ?? null }, { onConflict: "key" });
  if (error) throw new Error(error.message);

  await logAction("site_content_updated", "site_content", key);
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}

type FieldStoryInput = {
  id?: string;
  title: string;
  slug: string;
  country: string;
  period: string;
  activity_date: string;
  summary: string;
  body: string;
  status: ContentStatus;
  photos: unknown;
  has_personal_info: boolean;
  privacy_reviewed: boolean;
};

function cleanStoryText(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function upsertFieldStory(raw: FieldStoryInput) {
  const title = cleanStoryText(raw.title, 200);
  const slug = cleanStoryText(raw.slug, 120);
  if (!title) throw new Error("제목을 입력해 주세요.");
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("주소(slug)는 영문 소문자, 숫자, -만 사용할 수 있습니다.");
  if (!isStoryPeriod(raw.period)) throw new Error("구분을 선택해 주세요.");
  if (!["draft", "published", "hidden"].includes(raw.status)) throw new Error("상태가 올바르지 않습니다.");

  const privacyReviewed = raw.privacy_reviewed === true;
  if (raw.status === "published" && !privacyReviewed) {
    throw new Error("개인정보 및 사진 공개 검토를 마친 뒤에 공개할 수 있습니다.");
  }

  const supabase = await createClient();

  const row = {
    title,
    slug,
    country: cleanStoryText(raw.country, 60) || null,
    period: raw.period,
    activity_date: raw.activity_date || null,
    summary: cleanStoryText(raw.summary, 500) || null,
    body: cleanStoryText(raw.body, 20000) || null,
    photos: sanitizeStoryPhotos(raw.photos),
    status: raw.status,
    has_personal_info: raw.has_personal_info === true,
    privacy_reviewed: privacyReviewed,
    reviewed_at: privacyReviewed ? new Date().toISOString() : null,
    published_at: raw.status === "published" ? new Date().toISOString() : null,
  };

  if (raw.id) {
    const { error } = await supabase.from("field_stories").update(row).eq("id", raw.id);
    if (error) throw new Error(error.message);
    await logAction("field_story_updated", "field_story", raw.id);
  } else {
    const { data, error } = await supabase.from("field_stories").insert(row).select("id").single();
    if (error) throw new Error(error.message);
    await logAction("field_story_created", "field_story", data.id);
  }

  revalidatePath("/admin/field-stories");
  revalidatePath("/field-stories");
}

export async function importBandPost(input: {
  title: string;
  body: string;
  country: string;
  period: string;
  activity_date: string;
  band_url: string;
}) {
  const title = cleanStoryText(input.title, 200);
  if (!title) throw new Error("제목이 비어 있습니다. 첫 줄이 제목으로 쓰입니다.");
  if (!isStoryPeriod(input.period)) throw new Error("구분을 선택해 주세요.");
  const bandUrl = cleanStoryText(input.band_url, 500);
  if (bandUrl && !bandUrl.startsWith("https://")) throw new Error("BAND 주소는 https://로 시작해야 합니다.");

  const slug = `band-${Date.now().toString(36)}`;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("field_stories")
    .insert({
      title,
      slug,
      country: cleanStoryText(input.country, 60) || null,
      period: input.period,
      activity_date: input.activity_date || null,
      body: cleanStoryText(input.body, 20000) || null,
      status: "draft",
      source: "band",
      band_url: bandUrl || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await logAction("field_story_imported", "field_story", data.id);
  revalidatePath("/admin/field-stories");
  return data.id;
}

export async function deleteFieldStory(id: string) {
  await moveToTrash("field_stories", id);
}

export type ContentTable = "news" | "projects" | "field_stories";

const CONTENT_PATHS: Record<ContentTable, string[]> = {
  news: ["/admin/news", "/news"],
  projects: ["/admin/projects", "/projects"],
  field_stories: ["/admin/field-stories", "/field-stories"],
};

function revalidateContent(table: ContentTable) {
  for (const path of CONTENT_PATHS[table]) revalidatePath(path);
  revalidatePath("/admin/trash");
}

/** 휴지통으로 보냅니다. 실제 행은 남아 있어 복구할 수 있습니다. */
async function moveToTrash(table: ContentTable, id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from(table)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
  await logAction(`${table}_trashed`, table, id);
  revalidateContent(table);
}

/** 휴지통에서 되돌립니다. */
export async function restoreContent(table: ContentTable, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).update({ deleted_at: null }).eq("id", id);
  if (error) throw new Error(error.message);
  await logAction(`${table}_restored`, table, id);
  revalidateContent(table);
}

/** 영구 삭제입니다. 최고 관리자와 매니저만 가능하며, 데이터베이스 정책으로도 막힙니다. */
export async function purgeContent(table: ContentTable, id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  await logAction(`${table}_purged`, table, id);
  revalidateContent(table);
}
