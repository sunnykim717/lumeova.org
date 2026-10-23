import { createClient } from "@/lib/supabase/server";
import type { NewsItem, Project } from "@/lib/types/database";
import { SITE_CONTENT_DEFAULTS, mergeSection, type SiteContentKey, type SiteContentMap } from "@/lib/constants/siteContent";

/**
 * Supabase isn't necessarily configured yet in every environment this runs
 * in (e.g. a preview build before .env.local has real values). These
 * helpers fail soft — an empty list — rather than crashing the page, so the
 * public site is never blocked on the DB being wired up.
 */
function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export async function getRecentProjects(limit = 3): Promise<Project[]> {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("start_date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getRecentNews(limit = 3): Promise<NewsItem[]> {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getAllProjects(): Promise<Project[]> {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("start_date", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (!supabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function getAllNews(): Promise<NewsItem[]> {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  if (!supabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("news")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

/**
 * Homepage sections edited in /admin/content. Returns the built-in defaults
 * when Supabase isn't configured, when no row has been saved yet, or when the
 * read fails, so the homepage always renders.
 */
export async function getSiteContent<K extends SiteContentKey>(key: K): Promise<SiteContentMap[K]> {
  if (!supabaseConfigured()) return SITE_CONTENT_DEFAULTS[key];
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_content")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return mergeSection(key, data?.value);
  } catch {
    return SITE_CONTENT_DEFAULTS[key];
  }
}

/**
 * Public count of 상시후원자 (see regular_supporter_count() in
 * supabase/migrations/0003_supporter_drive.sql). Returns null when the count
 * can't be read, so the recruitment page can show progress without a number.
 */
export async function getRegularSupporterCount(): Promise<number | null> {
  if (!supabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("regular_supporter_count");
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}
