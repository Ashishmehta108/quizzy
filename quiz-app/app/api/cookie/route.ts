import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();

  const token = await cookieStore.get("access_token");

  return NextResponse.json({ token: token?.value });
}

export async function DELETE(req: NextRequest) {
  (await cookies()).delete("access_token");
  return NextResponse.json({ message: "Access token deleted" });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const body = await req.json();
  const token = await cookieStore.set("token", body.token);
  return NextResponse.json({ token });
}
