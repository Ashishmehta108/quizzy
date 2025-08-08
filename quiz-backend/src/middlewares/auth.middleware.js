import jwt from "jsonwebtoken";
import { db } from "../config/db/index.js";
import { users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";

const ACCESS_SECRET = process.env.ACCESS_SECRET || "accesssecret";

export const protect = async (req, res, next) => {
  try {
    const headerToken = req.headers.authorization?.split(" ")[1];
    const cookieToken = req.cookies?.access_token;
    const token = headerToken || cookieToken;
    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }
    const decoded = jwt.verify(token, ACCESS_SECRET);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, decoded.userId));

    console.log(user)
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
