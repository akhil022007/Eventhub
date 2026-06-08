import { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(
  req: NextRequest
) {
  const userId =
    req.cookies.get("userId")?.value;

  const role =
    req.cookies.get("role")?.value;

  const pathname =
    req.nextUrl.pathname;

  if (
    !userId &&
    (
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/events") ||
      pathname.startsWith("/upload")
    )
  ) {
    return NextResponse.redirect(
      new URL("/login", req.url)
    );
  }

  if (
    pathname.startsWith("/upload") &&
    role === "STUDENT"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  if (
    pathname.startsWith("/events/create") &&
    role === "STUDENT"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
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