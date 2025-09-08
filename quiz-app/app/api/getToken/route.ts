// app/api/me/route.ts (Next.js App Router style)
import { getAuth, clerkClient } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { userId, sessionId, getToken } = getAuth(req);

    const sessionToken = await getToken();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await (await clerkClient()).users.getUser(userId);

    return NextResponse.json({ user, token: sessionToken }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
