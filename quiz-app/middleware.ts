import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const { pathname } = req.nextUrl;

    const publicPaths = ["/", "/about", "/contact", "/login", "/register"];
    const isPublic = publicPaths.some((path) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path)
    );

    if (!token && !isPublic) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("❌ Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};




