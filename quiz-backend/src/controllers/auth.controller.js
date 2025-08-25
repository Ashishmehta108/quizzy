import { db } from "../config/db/index.js";
import { users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { clerkClient } from "../config/clerk/clerk.js";

export const syncUser = async (req, res) => {
  try {
    const { userId } = req.auth;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId));

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(userId);

      const email = clerkUser.emailAddresses[0]?.emailAddress;
      const name =
        clerkUser.firstName || email?.split("@")[0] || "Anonymous";

      [user] = await db
        .insert(users)
        .values({
          id: randomUUID(),
          clerkId: userId,
          email,
          name,
          profileImage: clerkUser.imageUrl,
        })
        .onConflictDoUpdate({
          target: users.clerkId,
          set: {
            email,
            name,
            profileImage: clerkUser.imageUrl,
          },
        })
        .returning();
    }

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};
