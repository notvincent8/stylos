import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

const SECURITY_HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-DNS-Prefetch-Control": "off",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
}

export function proxy(request: NextRequest) {
  // ── Same-origin enforcement for API routes ──────────────────────────────
  // Browsers always send Origin on non-GET/HEAD requests. If it is present
  // and does not match the Host, the request is cross-site — reject it.
  // Curl / server-side fetch omit Origin, so they are unaffected.
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin")
    const host = request.headers.get("host") ?? ""

    if (origin !== null) {
      let originHost: string
      try {
        originHost = new URL(origin).host
      } catch {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
      if (originHost !== host) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }
  }

  // ── Trusted client IP ───────────────────────────────────────────────────
  // We overwrite any client-supplied x-real-ip with a value we derive from
  // the platform's own header so the route handler can trust it.
  //   • x-vercel-forwarded-for — set by Vercel's edge; cannot be spoofed
  //   • x-forwarded-for first value — works on most single-hop setups
  const realIp =
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() ??
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-real-ip", realIp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })

  // ── Security response headers ────────────────────────────────────────────
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  return response
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
}
