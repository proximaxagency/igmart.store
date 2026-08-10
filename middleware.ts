import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that do not require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/register(.*)",
  "/games(.*)",
  "/marketplace(.*)",
  "/listing(.*)",
  "/seller(.*)",
  "/search(.*)",
  "/guides(.*)",
  "/reviews(.*)",
  "/faq(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/how-it-works(.*)",
  "/fees(.*)",
  "/legal(.*)",
  "/terms(.*)",
  "/privacy(.*)",
  "/cookies(.*)",
  "/refund-policy(.*)",
  "/acceptable-use(.*)",
  "/api/webhook(.*)"
]);

export default clerkMiddleware(async (auth, request) => {
  // If Clerk publishable key is not set, allow all requests to pass safely without invoking auth.protect()
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
    return NextResponse.next();
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
