/**
 * PII display masking for the admin back office (spec §35). These only
 * affect what's rendered — the real authorization boundary is Postgres RLS
 * (supabase/migrations/0001_init.sql), not this file.
 */

export function maskPhone(phone: string | null): string {
  if (!phone) return "-";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) return phone;
  // 010-12**-5678 style: keep the first 2 digits of the middle group and
  // the full last group, mask the rest of the middle group.
  const last4 = digits.slice(-4);
  const first = digits.slice(0, 3);
  const middle = digits.slice(3, digits.length - 4);
  const maskedMiddle = middle.length <= 2 ? middle : middle.slice(0, 2) + "*".repeat(middle.length - 2);
  return `${first}-${maskedMiddle}-${last4}`;
}

export function maskEmail(email: string | null): string {
  if (!email) return "-";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  const masked = visible + "*".repeat(Math.max(local.length - visible.length, 2));
  return `${masked}@${domain}`;
}
