import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  console.log(cookieStore)
  const token = await cookieStore.get("access_token");
  console.log(token);
  return NextResponse.json({ token: token?.value ?? null });
}

export async function DELETE(req: NextRequest) {
  (await cookies()).delete("access_token");
  return NextResponse.json({ message: "Access token deleted" });
}
