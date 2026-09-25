import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AdminRole } from "@/lib/types/database";

export type CurrentAdmin = {
  id: string;
  email: string | null;
  role: AdminRole;
  displayName: string | null;
};

/**
 * Server-side guard for admin pages. Redirects to /admin/login when there's
 * no session or the session isn't an admin.
 *
 * IMPORTANT: this is a UX convenience, not the security boundary. Even if
 * this guard were skipped entirely, Postgres RLS (is_admin(), see
 * supabase/migrations/0001_init.sql) is what actually prevents a
 * non-admin session from reading or writing admin-gated tables.
 */
export async function requireAdmin(): Promise<CurrentAdmin> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("id, role, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!adminRow) {
    redirect("/admin/login?error=not_admin");
  }

  return {
    id: user.id,
    email: user.email ?? null,
    role: adminRow.role,
    displayName: adminRow.display_name,
  };
}
