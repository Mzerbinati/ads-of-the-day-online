import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session; do not use getSession() here.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isPublicAuthRoute =
    pathname === "/login" || pathname.startsWith("/auth/");
  const isPublicProfile = pathname.startsWith("/u/");
  const isStaticOrApi =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/catalog") ||
    pathname === "/favicon.ico";

  const needsAuth =
    pathname.startsWith("/campagna") ||
    pathname.startsWith("/archivio") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/api/campaigns") ||
    pathname.startsWith("/api/chat") ||
    pathname.startsWith("/api/profile");

  if (!user && needsAuth) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Profile completeness is checked in pages (needs DB); middleware only gates auth.
  if (user && isPublicAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  void isPublicProfile;
  void isStaticOrApi;

  return supabaseResponse;
}
