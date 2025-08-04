import bcrypt from "bcrypt";
import { db } from "../config/db/index.js";
import { users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { randomUUID } from "node:crypto";

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = (await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.email, email))).length > 0;

  if (existing) return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  const id = randomUUID();
  const accessToken = generateAccessToken(id);
  const refreshToken = generateRefreshToken(id);

  const [user] = await db
    .insert(users)
    .values({ id, name, email, password: hashed, accessToken, refreshToken })
    .returning();

  res
    .cookie("access_token", accessToken, { httpOnly: true })
    .cookie("refresh_token", refreshToken, { httpOnly: true })
    .json({ user, accessToken, refreshToken });
};



export const login = async (req, res) => {
  const { email, password } = req.body;

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  await db.update(users)
    .set({ accessToken, refreshToken })
    .where(eq(users.id, user.id));

  res
    .cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000,
    })
    .cookie("refresh_token", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json({ user });

};
