interface WindowState {
  count: number;
  windowStart: number; // epoch ms when this window began
}

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 2; // per user, per window

// In-memory — correct only because Railway runs one persistent process.
// Would need a Redis-backed store if this app ever scales to multiple instances.
const requestCounts = new Map<string, WindowState>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds?: number;
}

export function checkRateLimit(userId: string): RateLimitResult {
  const now = Date.now();
  const existing = requestCounts.get(userId);

  // No record yet, or the previous window has fully elapsed — start fresh.
  if (!existing || now - existing.windowStart >= WINDOW_MS) {
    requestCounts.set(userId, { count: 1, windowStart: now });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((existing.windowStart + WINDOW_MS - now) / 1000);
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  existing.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - existing.count };
}