import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/**
 * Service-role Supabase client. NEVER import this from a Client Component,
 * a file under src/components, or anything that ends up in the browser
 * bundle — the `server-only` import above makes Next.js throw a build error
 * if that ever happens by mistake.
 *
 * Use this only for privileged server-side operations the admin back office
 * needs (e.g. an admin route handler updating a donation's payment status)
 * where RLS as the *authenticated admin user* isn't the right model — and
 * even then, prefer giving admin users proper RLS-covered roles (see
 * supabase/migrations/0001_init.sql `admin_users` + policies) over reaching
 * for this client. Every use of this client bypasses RLS entirely.
 *
 * SUPABASE_SERVICE_ROLE_KEY must be set only as a server environment
 * variable (Cloudflare Pages/Workers "Secret", or .env.local which is
 * git-ignored) — it must never be prefixed NEXT_PUBLIC_ and never committed.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "createAdminClient: missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY server env vars."
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
