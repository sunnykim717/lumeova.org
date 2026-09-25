/**
 * Minimal in-memory rate limiter for the public application routes.
 *
 * IMPORTANT: this only limits requests within a single running server
 * instance's memory. On Cloudflare's edge (or any multi-instance/serverless
 * deployment) it is NOT a reliable defense on its own — it resets whenever
 * the instance recycles and doesn't share state across instances/regions.
 * Treat it as a cheap first layer, and add Cloudflare's own rate limiting
 * rules (and ideally Turnstile on the forms) during Phase 11 (Security
 * Review) before this goes live with real traffic.
 */

const hits = new Map<string, number[]>();

export function isRateLimited(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const timestamps = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  timestamps.push(now);
  hits.set(key, timestamps);
  return timestamps.length > limit;
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}
