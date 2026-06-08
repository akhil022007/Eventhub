import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { verifySession } from "@/lib/session";

// Next.js 16 renamed Middleware to Proxy. This runs before protected routes
// and does a lightweight auth gate — real authorization lives in the route
// handlers and server components (see lib/auth.ts).
export async function proxy(
  req: NextRequest
) {
  const token =
    req.cookies.get("userId")?.value;

  const userId = await verifySession(token);

  // No valid (signed) session? Send to login and remember where they were
  // headed, so invite links (/events/[id]/join?token=...) survive the
  // round-trip.
  if (!userId) {
    const callbackUrl =
      req.nextUrl.pathname + req.nextUrl.search;

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", callbackUrl);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/events/:path*",
    "/upload/:path*",
  ],
};
