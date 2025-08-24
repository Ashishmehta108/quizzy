import jwt from "jsonwebtoken";
import { db } from "../config/db/index.js";
import { users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import "dotenv/config";

const ACCESS_SECRET = process.env.ACCESS_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

export const protect = async (req, res, next) => {
  try {
    const cookieToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;
    const token = cookieToken || refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Access token missing" });
    }
    let decoded;
    try {
      decoded = jwt.verify(token, ACCESS_SECRET);
    } catch (err) {
      if (refreshToken) {
        try {
          const decodedRefresh = jwt.verify(refreshToken, REFRESH_SECRET);

          const [user] = await db
            .select({
              id: users.id,
              name: users.name,
              email: users.email,
            })
            .from(users)
            .where(eq(users.id, decodedRefresh.userId));

          if (!user) {
            return res.status(401).json({ message: "User not found" });
          }

          const newAccessToken = jwt.sign(
            { userId: user.id },
            ACCESS_SECRET,
            { expiresIn: "15m" }
          );

          res.cookie("access_token", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 15 * 60 * 1000,
          });

          req.user = user;
          return next();
        } catch (refreshErr) {
          return res.status(401).json({ message: "Invalid refresh token" });
        }
      }

      return res.status(401).json({ message: "Invalid or expired access token" });
    }

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, decoded.userId));

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Authentication failed" });
  }
};
