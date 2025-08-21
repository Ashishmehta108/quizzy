import bcrypt from "bcrypt";
import { db } from "../config/db/index.js";
import { users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { randomUUID } from "node:crypto";
import "dotenv/config";

const cookieOptions = (days) => ({
  httpOnly: true,
  secure: true,
  sameSite: "none",
  domain: ".quizzyai.online",
  maxAge: days * 24 * 60 * 60 * 1000
});

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const [existing] = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.email, email));

  if (existing) return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const id = randomUUID();
  const accessToken = generateAccessToken(id);
  const refreshToken = generateRefreshToken(id);

  const [user] = await db
    .insert(users)
    .values({ id, name, email, password: hashed, accessToken, refreshToken })
    .returning({ id: users.id, name: users.name, email: users.email });

  res
    .cookie("access_token", accessToken, cookieOptions(1))
    .cookie("refresh_token", refreshToken, cookieOptions(7))
    .json({ user, token: accessToken });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email));

    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await db
      .update(users)
      .set({ accessToken, refreshToken })
      .where(eq(users.id, user.id));

    res
      .cookie("access_token", accessToken, cookieOptions(1))
      .cookie("refresh_token", refreshToken, cookieOptions(7))
      .json({
        user: { id: user.id, name: user.name, email: user.email },
        token: accessToken,
      });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
