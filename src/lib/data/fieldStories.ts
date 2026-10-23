import { createClient } from "@/lib/supabase/server";
import type { FieldStory } from "@/lib/types/database";
import type { StoryPeriod } from "@/lib/constants/fieldStories";

function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Public list of published stories. The database policy already hides drafts
 * and unreviewed stories; the filter here keeps the page's query explicit.
 */
export async function getPublishedFieldStories(filter: {
  country?: string | null;
  period?: StoryPeriod | null;
} = {}): Promise<FieldStory[]> {
  if (!supabaseConfigured()) return [];
  try {
    const supabase = await createClient();
    let query = supabase
      .from("field_stories")
      .select("*")
      .eq("status", "published")
      .eq("privacy_reviewed", true)
      .order("published_at", { ascending: false });
    if (filter.country) query = query.eq("country", filter.country);
    if (filter.period) query = query.eq("period", filter.period);
    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getPublishedFieldStoryBySlug(slug: string): Promise<FieldStory | null> {
  if (!supabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("field_stories")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .eq("privacy_reviewed", true)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

/** Countries that have at least one public story, so the filter only lists real ones. */
export async function getPublishedStoryCountries(): Promise<string[]> {
  const stories = await getPublishedFieldStories();
  const countries = stories.map((s) => s.country).filter((c): c is string => Boolean(c));
  return [...new Set(countries)].sort((a, b) => a.localeCompare(b, "ko"));
}
