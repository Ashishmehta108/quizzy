import { db } from "../config/db";
import { users } from "../config/db/schema";
import { eq } from "drizzle-orm";
import { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { clerkClient } from "../config/clerk/clerk";
import { ClerkUser } from "../types/controllers/auth";

const syncUser = async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    console.log(req.auth?.userId);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    let [user] = await db.select().from(users).where(eq(users.clerkId, userId));
    if (!user) {
      const clerkUser = (await clerkClient.users.getUser(
        userId
      )) as unknown as ClerkUser;
      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name = clerkUser.firstName || email?.split("@")[0] || "Anonymous";

      [user] = await db
        .insert(users)
        .values({
          id: randomUUID(),
          clerkId: userId,
          email: email || "",
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    res.json({ user });
  } catch (error) {
    console.error("Error syncing user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { syncUser };
