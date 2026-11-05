// Simple in-memory limiter. Each serverless instance keeps its own counts,
// which is enough to stop casual abuse of the free AI quota.
const WINDOW_MS = 24 * 60 * 60 * 1000;
const hits = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number) {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true, remaining: limit - 1 };
  }
  if (entry.count >= limit) return { ok: false, remaining: 0 };
  entry.count += 1;
  return { ok: true, remaining: limit - entry.count };
}
