// Sliding-window rate limiter.
//
// Currently in-memory — works for a single-process server.
// To swap to Redis, implement the same `checkRateLimit` signature using
// ioredis or @upstash/ratelimit and export it from here instead.
//
// Note: in a serverless environment (e.g. Vercel), the store resets on each
// cold start. For persistent limits across instances, use Redis.

const WINDOW_MS = 60_000 // 1 minute
const MAX_REQUESTS = 10 // per IP per window

// Map<ip, timestamps[]>
const store = new Map<string, number[]>()

// Periodically evict IPs whose entire window has expired so the Map does not
// grow without bound on long-running servers.
setInterval(() => {
  const now = Date.now()
  for (const [ip, ts] of store) {
    if (ts.every((t) => now - t >= WINDOW_MS)) {
      store.delete(ip)
    }
  }
}, WINDOW_MS * 2).unref()

export type RateLimitResult = { allowed: true; remaining: number } | { allowed: false; retryAfter: number } // seconds until the window resets

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now()

  // Slide the window: discard timestamps outside it
  const timestamps = (store.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)

  if (timestamps.length >= MAX_REQUESTS) {
    // Oldest timestamp in window tells us when a slot opens up
    const retryAfter = Math.ceil((timestamps[0] + WINDOW_MS - now) / 1000)
    store.set(ip, timestamps)
    return { allowed: false, retryAfter }
  }

  timestamps.push(now)
  store.set(ip, timestamps)
  return { allowed: true, remaining: MAX_REQUESTS - timestamps.length }
}

// Reads the client IP injected by proxy.ts, which overwrites any
// client-supplied x-real-ip with a value derived from the platform's own
// header — safe to trust for rate-limiting purposes.
export function getIp(req: Request): string {
  return req.headers.get("x-real-ip") ?? "unknown"
}
