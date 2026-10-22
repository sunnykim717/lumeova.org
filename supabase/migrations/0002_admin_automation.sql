-- Lumeova International — admin automation + site content (0002)
--
-- Additive only: this file never edits 0001. Apply it after 0001 has been
-- run against the project. Design: docs/superpowers/specs/
-- 2026-10-21-admin-automation-and-site-content-design.md
--
--   * One confirmed payment per donation (partial unique index).
--   * bank_transactions: imported bank deposits, admin-only, minimal columns.
--   * confirm_bank_matches(): confirms matched deposits in one transaction.
--     It runs as SECURITY INVOKER, so RLS of the calling admin applies.
--   * news: sheet-sync columns (external_id, source, admin_locked).
--   * sync_runs: report of each sheet sync (admin read only).
--   * site_stats + refresh_site_stats(): aggregate-only public statistics.
--     The public site reads site_stats and nothing else.

-- ---------------------------------------------------------------------------
-- 1. Donation payments: at most one confirmed payment per donation
-- ---------------------------------------------------------------------------
create unique index if not exists donation_payments_one_confirmed
  on donation_payments (donation_id)
  where status = 'confirmed';

-- ---------------------------------------------------------------------------
-- 2. Bank transactions (imported deposits)
-- ---------------------------------------------------------------------------
-- Only the columns needed for matching are stored. Balance, account number
-- and the raw CSV file are never stored (spec §5.1.4).
create table if not exists bank_transactions (
  id uuid primary key default gen_random_uuid(),
  transacted_at timestamptz not null,
  amount integer not null check (amount > 0),
  counterparty_name text,
  memo text,
  dedupe_key text not null unique,
  matched_payment_id uuid unique references donation_payments (id) on delete set null,
  imported_by uuid references admin_users (id),
  imported_at timestamptz not null default now()
);

create index if not exists idx_bank_transactions_transacted
  on bank_transactions (transacted_at desc);

alter table bank_transactions enable row level security;

drop policy if exists bank_transactions_admin_all on bank_transactions;
create policy bank_transactions_admin_all on bank_transactions
  for all using (is_admin()) with check (is_admin());

-- ---------------------------------------------------------------------------
-- 3. Confirm matched deposits (human-triggered, all-or-nothing)
-- ---------------------------------------------------------------------------
-- p_matches: [{ "transaction_id": uuid, "donation_id": uuid, "note": text? }]
-- Amount and date come from bank_transactions, never from the caller.
-- If the deposit amount differs from the donation amount, a note is required
-- (spec §8.3). Any failure raises and rolls back every row in the batch.
create or replace function public.confirm_bank_matches(p_matches jsonb)
returns integer
language plpgsql
security invoker
set search_path = public
as $$
declare
  m jsonb;
  tx bank_transactions%rowtype;
  d donations%rowtype;
  v_note text;
  v_payment_id uuid;
  v_admin uuid := auth.uid();
  v_count integer := 0;
begin
  if not is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  if p_matches is null or jsonb_typeof(p_matches) <> 'array' then
    raise exception 'p_matches must be a JSON array';
  end if;

  for m in select value from jsonb_array_elements(p_matches) loop
    select * into tx
      from bank_transactions
      where id = (m->>'transaction_id')::uuid
      for update;
    if not found then
      raise exception 'bank transaction not found: %', m->>'transaction_id';
    end if;
    if tx.matched_payment_id is not null then
      raise exception 'bank transaction already matched: %', tx.id;
    end if;

    select * into d
      from donations
      where id = (m->>'donation_id')::uuid
      for update;
    if not found then
      raise exception 'donation not found: %', m->>'donation_id';
    end if;
    if d.status <> 'active' then
      raise exception 'donation is not active: %', d.id;
    end if;
    if exists (
      select 1 from donation_payments p
      where p.donation_id = d.id and p.status = 'confirmed'
    ) then
      raise exception 'donation already has a confirmed payment: %', d.id;
    end if;

    v_note := nullif(btrim(coalesce(m->>'note', '')), '');
    if tx.amount <> d.amount and v_note is null then
      raise exception 'amount differs from donation % (% vs %): a note is required',
        d.id, tx.amount, d.amount;
    end if;

    insert into donation_payments (
      donation_id, amount, payment_date, status, confirmed_by, confirmed_at, admin_note
    )
    values (
      d.id,
      tx.amount,
      (tx.transacted_at at time zone 'Asia/Seoul')::date,
      'confirmed',
      v_admin,
      now(),
      v_note
    )
    returning id into v_payment_id;

    update bank_transactions
      set matched_payment_id = v_payment_id
      where id = tx.id;

    insert into audit_logs (admin_id, action, target_type, target_id, metadata)
    values (
      v_admin,
      'donation_payment_confirmed',
      'donation',
      d.id::text,
      jsonb_build_object(
        'bank_transaction_id', tx.id,
        'payment_id', v_payment_id,
        'amount_matches', tx.amount = d.amount,
        'source', 'bank_csv'
      )
    );

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

revoke all on function public.confirm_bank_matches(jsonb) from public;
revoke all on function public.confirm_bank_matches(jsonb) from anon;
grant execute on function public.confirm_bank_matches(jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 4. News: sheet-sync columns and the photo-consent marker
-- ---------------------------------------------------------------------------
alter table news add column if not exists external_id text;
create unique index if not exists news_external_id_key on news (external_id);

alter table news add column if not exists source text not null default 'manual';
do $$ begin
  alter table news add constraint news_source_check check (source in ('manual', 'sheet'));
exception when duplicate_object then null; end $$;

alter table news add column if not exists source_synced_at timestamptz;
alter table news add column if not exists admin_locked boolean not null default false;
alter table news add column if not exists consent_confirmed_at timestamptz;

alter table projects add column if not exists consent_confirmed_at timestamptz;

-- ---------------------------------------------------------------------------
-- 5. Sync runs (written by the server-side sync job, read by admins)
-- ---------------------------------------------------------------------------
create table if not exists sync_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  status text not null check (status in ('running', 'ok', 'partial', 'failed')),
  added integer not null default 0,
  updated integer not null default 0,
  skipped integer not null default 0,
  report jsonb not null default '{}'::jsonb
);

alter table sync_runs enable row level security;

drop policy if exists sync_runs_admin_select on sync_runs;
create policy sync_runs_admin_select on sync_runs
  for select using (is_admin());

-- ---------------------------------------------------------------------------
-- 6. Public aggregate statistics
-- ---------------------------------------------------------------------------
-- Only numbers live here. No identifiers, no names, no per-person rows.
-- `visible` is set by refresh_site_stats() from the minimum-count rule.
-- `admin_hidden` is set only by an admin and survives refreshes.
create table if not exists site_stats (
  key text primary key,
  label text not null,
  value numeric not null,
  visible boolean not null default false,
  admin_hidden boolean not null default false,
  as_of timestamptz not null default now()
);

alter table site_stats enable row level security;

drop policy if exists site_stats_public_select on site_stats;
create policy site_stats_public_select on site_stats
  for select using (visible and not admin_hidden);

drop policy if exists site_stats_admin_write on site_stats;
create policy site_stats_admin_write on site_stats
  for all using (is_admin()) with check (is_admin());

create or replace function public.refresh_site_stats()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Minimum count before a statistic is shown (spec §8.7). Changing this
  -- value is a privacy decision, not a tuning knob.
  v_min constant integer := 10;
  v_members integer;
  v_donors integer;
  v_total bigint;
  v_news integer;
  v_claims jsonb := nullif(current_setting('request.jwt.claims', true), '')::jsonb;
begin
  if not (is_admin() or coalesce(v_claims ->> 'role', '') = 'service_role') then
    raise exception 'not allowed' using errcode = '42501';
  end if;

  select count(distinct supporter_id) into v_members
    from memberships
    where status = 'approved';

  select count(distinct d.supporter_id), coalesce(sum(p.amount), 0)
    into v_donors, v_total
    from donation_payments p
    join donations d on d.id = p.donation_id
    where p.status = 'confirmed';

  select count(*) into v_news
    from news
    where status = 'published';

  -- Totals are floored to 10,000 KRW so the public figure reads as "이상".
  insert into site_stats (key, label, value, visible, as_of)
  values
    ('approved_members', '승인 회원 수', v_members, v_members >= v_min, now()),
    ('donor_count', '후원 참여자 수', v_donors, v_donors >= v_min, now()),
    ('confirmed_total', '누적 후원액 (원, 만 원 단위 내림)',
      floor(v_total / 10000) * 10000, v_donors >= v_min, now()),
    ('published_news', '발행된 소식 수', v_news, v_news > 0, now())
  on conflict (key) do update
    set value = excluded.value,
        visible = excluded.visible,
        as_of = excluded.as_of;
end;
$$;

revoke all on function public.refresh_site_stats() from public;
revoke all on function public.refresh_site_stats() from anon;
grant execute on function public.refresh_site_stats() to authenticated, service_role;
