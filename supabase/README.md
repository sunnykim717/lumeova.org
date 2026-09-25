# Supabase setup — Lumeova International

This project reuses the org's **existing** Supabase project. Nothing here
creates a new project, and nothing here has been run against the real
database yet — running it is a manual step for whoever holds access to the
Supabase dashboard.

## 1. Run the migration

Open the Supabase dashboard → SQL Editor → paste the contents of
`migrations/0001_init.sql` → Run.

It's written defensively (`if not exists`, `do $$ ... exception when
duplicate_object$$`) so it's safe to run more than once, but it does **not**
touch or drop any table this project didn't create. Review it before running
it against a project that has other, unrelated tables.

## 2. Create the first admin user

There is intentionally no public sign-up path into `admin_users` — RLS only
lets an existing `super_admin` write to that table. To create the very first
admin:

1. In the Supabase dashboard, go to **Authentication → Users** and invite/create
   the admin's account (email + password, or magic link — whichever the org
   prefers).
2. Copy that user's UUID.
3. In the SQL Editor, run:

   ```sql
   insert into admin_users (id, role, display_name)
   values ('<paste-the-uuid-here>', 'super_admin', '<name>');
   ```

After that, the app's `/admin/login` route works for that account, and that
super_admin can add further admin accounts (once the admin UI for it is
built — until then, the same manual insert works for additional admins).

## 3. Environment variables

Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` — Project Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Project Settings → API → `anon` `public` key

Both of the above are safe to expose to the browser (that's what `anon` means)
— RLS is what actually protects the data.

`SUPABASE_SERVICE_ROLE_KEY` (also under Project Settings → API) is **not**
needed for anything in this repo yet, and should stay out of `.env.local`
unless/until a specific server-only feature needs it. If it's ever added,
it must only be set as a server environment variable (never `NEXT_PUBLIC_*`)
and must never be committed.
