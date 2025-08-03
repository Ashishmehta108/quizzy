import { NextRequest, NextResponse } from "next/server";

const privateRoutes = ["/dashboard"];
const publicRoutes = ["/login", "/register"];

export default async function middleware(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;
  console.log(token);
  const isPrivate = privateRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  const isPublic = publicRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  console.log(isPrivate, isPublic);

  if (isPrivate && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  } else if (isPublic && token) {
    console.log("applied");
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}
