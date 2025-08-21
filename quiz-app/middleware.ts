import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default function middleware(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    const { pathname } = req.nextUrl;
    console.log(token);
    const publicPaths = ["/", "/about", "/contact", "/login"];
    const isPublic = publicPaths.some((path) =>
      path === "/" ? pathname === "/" : pathname.startsWith(path)
    );

    // If NOT logged in and accessing protected route → /login
    if (!token && !isPublic) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // If logged in and tries to access /login → dashboard
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    // Catch any runtime errors so middleware never crashes
    console.error("❌ Middleware error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
