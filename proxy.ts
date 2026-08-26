import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes that require login
const PROTECTED_PREFIXES = [
  "/account",
  "/sell/create",
  "/checkout",
  "/messages",
  "/admin",
  "/seller/dashboard",
  "/seller/listings",
  "/seller/orders",
  "/seller/earnings",
  "/seller/inventory",
  "/seller/analytics",
  "/seller/verification",
];

function isProtected(pathname: string) {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (isProtected(pathname)) {
    // Check for Convex Auth session cookie
    const authCookie =
      request.cookies.get("__convexAuthSessionId")?.value ||
      request.cookies.get("__Host-convex-auth-session-id")?.value;

    if (!authCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
