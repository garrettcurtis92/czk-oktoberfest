import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  // Allow the unlock page and static assets
  if (pathname.startsWith("/admin/unlock") || pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Gate all /admin routes
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("czk_admin")?.value;
    if (token !== "1") {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/unlock";
      url.searchParams.set("next", pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ""));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
