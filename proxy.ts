import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Next.js 16: Proxy replaces Middleware and defaults to the Node.js runtime.
 * Keeping the old middleware.ts on Edge caused MIDDLEWARE_INVOCATION_FAILED on Vercel.
 */
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
