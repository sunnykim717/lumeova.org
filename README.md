# Lumeova International — Official Website

Public site + membership/donation intake + admin back office for
미래를여는빛 (Lumeova International). Next.js (App Router) + TypeScript +
Tailwind CSS v4, backed by Supabase (Postgres, Auth, Row Level Security).

## Status

This is a fresh build. As of this commit:

- Public site (Home, About, What We Do, Projects, News, Membership, Donate,
  Contact, Privacy, Terms) is implemented, with honest "준비중" placeholders
  everywhere real content (photos, history, statistics) hasn't been supplied
  yet — nothing in `src/lib/constants/brand.ts` is fabricated.
- Membership and donation application forms submit to Next.js Route
  Handlers, which validate server-side and write to Supabase.
- An admin back office exists at `/admin` (member approval, donation
  payment confirmation, project/news CRUD, CSV export). It has **not** been
  tested against a live Supabase project yet.
- The database schema and every RLS policy are written
  (`supabase/migrations/0001_init.sql`) but have **not** been run against
  any real Supabase project yet — see `supabase/README.md`.
- Nothing has been deployed. There is no live Cloudflare deployment.

## Stack

- **Next.js 16** (App Router, TypeScript strict mode)
- **Tailwind CSS v4** (`@theme` tokens in `src/app/globals.css`, no
  `tailwind.config.js`)
- **Supabase**: Postgres + Row Level Security as the real authorization
  boundary (never frontend-only gating), Supabase Auth for admin login only
- **Zod** for form validation (shared shape between client forms and their
  API routes)
- Intended deployment target: **Cloudflare** (Pages/Workers via the
  OpenNext adapter) — not yet wired up

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project URL + anon key
npm run dev
```

Without `.env.local` configured, the public site still renders (content
sections show their "준비중" empty state) but forms and admin pages won't
work.

### Database

Run `supabase/migrations/0001_init.sql` in your Supabase project's SQL
Editor, then follow `supabase/README.md` to create the first admin user.
There is intentionally no public sign-up path into `admin_users`.

### Environment variables

See `.env.example`. Only `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY` are needed to run this app — the anon key is
safe to expose client-side, and every privileged admin action is authorized
by Postgres RLS using the signed-in admin's own session, not a service-role
key. `SUPABASE_SERVICE_ROLE_KEY` must never be committed or exposed to the
browser if it's ever added.

## Project structure

```
src/
  app/                 Routes (App Router)
    (public pages)/    Home, About, What We Do, Projects, News, ...
    admin/
      login/           Supabase Auth sign-in (public)
      (protected)/     Everything else under /admin — guarded by
                        requireAdmin() + Postgres RLS
    api/                Route Handlers (membership/donation submission)
  components/
    layout/            Header, Footer
    home/               Homepage sections
    forms/              MembershipForm, DonationForm
    admin/               Admin-only client components
    ui/                 Buttons, ImagePlaceholder, ...
  lib/
    constants/          Org facts (brand.ts — never fabricated, TODO where
                        unconfirmed), nav, legal
    supabase/            Browser/server/admin Supabase clients + middleware
    data/                Public read helpers (fail soft if unconfigured)
    actions/             Server Actions used by the admin back office
    validation/          Zod schemas
    types/database.ts    Hand-written type mirror of the SQL schema
supabase/
  migrations/0001_init.sql   Full schema + RLS policies
  README.md                  Manual setup steps (run migration, create
                              first admin)
```

## Ground rules this codebase follows

- **Never fabricate org facts.** Founding year, representative, address,
  phone, staff, beneficiary counts, partner orgs, awards, and overseas
  country names are either confirmed values or explicit `null`/`[]` TODOs
  in `src/lib/constants/brand.ts`. Don't fill a TODO with a guess.
- **No stock or AI-generated photography, ever.** Use `ImagePlaceholder`
  (`src/components/ui/ImagePlaceholder.tsx`) until a real photo exists.
- **RLS is the real authorization boundary.** Admin pages check
  `requireAdmin()` for UX (redirect to login), but the actual access control
  is the `is_admin()` Postgres function and the RLS policies in
  `0001_init.sql`. If you add a new admin feature, add its RLS policy —
  don't rely on a page-level check alone.
- **No minimum donation amount, ever**, and never say a recurring donation
  is charged automatically — donations are bank-transfer only; see
  `src/lib/validation/donation.ts` and `src/app/donate/complete/page.tsx`
  for the exact required copy.
