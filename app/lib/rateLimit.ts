import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Shared Redis instance — used by both the per-IP rate limiter and the
// per-user daily cap so we only open one connection pool.
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})
// Sliding-window rate limiter backed by Upstash Redis.
//
// The `prefix` namespaces keys in the shared database so this app's entries
// never collide with other projects using the same Upstash instance.
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  prefix: "stylos:rl",
})

// Maximum number of Anthropic API calls a single IP may make per calendar day.
// Surfaced to the client via X-User-Limit / X-User-Used headers so the UI
// can display "You've used X of Y analyses today."
export const DAILY_USER_CAP = 5

export type RateLimitResult = { allowed: true; remaining: number } | { allowed: false; retryAfter: number } // seconds until the window resets

export type UserCapResult = {
  allowed: boolean
  used: number
  cap: number
}

export const checkRateLimit = async (ip: string): Promise<RateLimitResult> => {
  const { success, remaining, reset } = await ratelimit.limit(ip)

  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    return { allowed: false, retryAfter }
  }

  return { allowed: true, remaining }
}

// Increments and checks the per-IP daily usage counter. The key includes the
// current UTC date so it rotates automatically at midnight. A 25-hour TTL
// ensures leftover keys self-clean even if the rotation day is missed.
//
// We increment before calling Anthropic so the counter stays accurate even
// when the upstream call fails — only invalid bodies are excluded.
export const checkUserDailyCap = async (ip: string): Promise<UserCapResult> => {
  const today = new Date().toISOString().slice(0, 10) // e.g. "2026-03-26"
  const key = `stylos:user:${ip}:${today}`

  const used = await redis.incr(key)
  if (used === 1) {
    await redis.expire(key, 25 * 60 * 60)
  }

  return { allowed: used <= DAILY_USER_CAP, used, cap: DAILY_USER_CAP }
}

// Reads the client IP injected by proxy.ts, which overwrites any
// client-supplied x-real-ip with a value derived from the platform's own
// header — safe to trust for rate-limiting purposes.
export const getIp = (req: Request): string => {
  return req.headers.get("x-real-ip") ?? "unknown"
}
