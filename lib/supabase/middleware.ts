import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasEnvVars } from "../utils";

/**
 * Define route patterns for different authentication requirements
 */
const PUBLIC_ROUTES = [
  "/",
  "/api/magic-items", // Magic item browsing API
];

const AUTH_ROUTES = [
  "/auth/login",
  "/auth/sign-up",
  "/auth/sign-up-success",
  "/auth/forgot-password",
  "/auth/update-password",
  "/auth/error",
  "/auth/confirm",
];

const PROTECTED_ROUTES = [
  "/lists",
  "/tables",
  "/profile",
  "/protected",
  "/api/lists",
  "/api/favorites",
  "/api/roll-tables",
];

const SHARED_CONTENT_ROUTES = [
  "/shared", // Shared roll tables
];

/**
 * Check if a path matches any pattern in the given routes array
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith("*")) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
}

/**
 * Determine if a route requires authentication
 */
function requiresAuthentication(pathname: string): boolean {
  // Public routes and shared content don't require auth
  if (matchesRoute(pathname, PUBLIC_ROUTES) ||
      matchesRoute(pathname, SHARED_CONTENT_ROUTES) ||
      matchesRoute(pathname, AUTH_ROUTES)) {
    return false;
  }

  // Protected routes require auth
  if (matchesRoute(pathname, PROTECTED_ROUTES)) {
    return true;
  }

  // Default: require authentication for unknown routes
  return true;
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  // If the env vars are not set, skip middleware check. You can remove this
  // once you setup the project.
  if (!hasEnvVars) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const pathname = request.nextUrl.pathname;

  // Check if current route requires authentication
  if (requiresAuthentication(pathname) && !user) {
    // Redirect unauthenticated users to login page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages to home
  if (user && matchesRoute(pathname, AUTH_ROUTES) && pathname !== "/auth/confirm") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Add user context to headers for SSR components
  if (user) {
    supabaseResponse.headers.set("x-user-id", user.sub);
    supabaseResponse.headers.set("x-user-email", user.email || "");
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
