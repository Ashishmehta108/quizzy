import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function middleware(req: NextRequest) {
  const token =
    req.cookies.get("token")?.value || localStorage.getItem("access_token");
  const { pathname } = req.nextUrl;

  const publicPaths = ["/", "/about", "/contact", "/login"];
  if (!token && !publicPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}
