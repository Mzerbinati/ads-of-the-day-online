import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * Cookie defaults that work with OAuth PKCE on Safari/iOS:
 * - sameSite: "lax" → cookie sent on top-level return from Google
 * - secure: true on HTTPS (required by Safari for recent cookies)
 * - path: "/" → available on /auth/callback
 * - httpOnly: false → required so the browser client can also read PKCE verifier
 */
export function getSupabaseCookieOptions(): CookieOptionsWithName {
  const secure =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1" ||
    process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https://") === true;

  return {
    path: "/",
    sameSite: "lax",
    secure,
    httpOnly: false,
  };
}

/** Prefer forwarded host/proto on Vercel so redirects stay on https. */
export function getRequestOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");

  if (forwardedHost) {
    const proto =
      forwardedProto ??
      (process.env.NODE_ENV === "production" ? "https" : url.protocol.replace(":", ""));
    return `${proto}://${forwardedHost}`;
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  return url.origin;
}
