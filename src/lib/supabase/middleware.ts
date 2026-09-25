import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase Auth session cookie on every request that matches
 * the middleware matcher (see middleware.ts). This is the standard
 * @supabase/ssr pattern — without it, sessions can appear to randomly expire
 * in Server Components, which cannot write cookies themselves.
 *
 * Uses only the anon key. Admin access itself is enforced by Postgres RLS
 * (see supabase/migrations/0001_init.sql is_admin()), not by anything here.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Supabase isn't configured in this environment yet — nothing to do.
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  // Touch the session so an expired token gets refreshed and re-written to
  // cookies before it reaches a Server Component.
  await supabase.auth.getUser();

  return response;
}
