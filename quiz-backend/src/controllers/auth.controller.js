import bcrypt from "bcrypt";
import { db } from "../config/db/index.js";
import { users } from "../config/db/schema.js";
import { eq } from "drizzle-orm";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { randomUUID } from "node:crypto";
import "dotenv/config";

export const register = async (req, res) => {
  console.log("register")
  const { name, email, password } = req.body;

  const [existing] = (await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.email, email)));

  if (existing) return res.status(400).json({ message: "User already exists" });
  console.log(name, email, password)
  const hashed = await bcrypt.hash(password, 10);
  const id = randomUUID();
  const accessToken = generateAccessToken(id);
  const refreshToken = generateRefreshToken(id);

  const [user] = await db
    .insert(users)
    .values({ id, name, email, password: hashed, accessToken, refreshToken })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
    });

  res
    .cookie("access_token", accessToken, { httpOnly: true, secure: true, sameSite: "none", expires: new Date(Date.now() + 60 * 60 * 24 * 1000) })
    .cookie("refresh_token", refreshToken, { httpOnly: true, secure: true, sameSite: "none", expires: new Date(Date.now() + 7 * 60 * 60 * 24 * 1000) })
    .json({ user, token: accessToken });
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt with email:", email);

    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        password: users.password,
      })
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      console.warn("User not found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.warn("Password mismatch for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    await db
      .update(users)
      .set({ accessToken, refreshToken })
      .where(eq(users.id, user.id));

    console.log("Tokens generated and saved for user:", user.id);


    res
      .cookie("access_token", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 60 * 60 * 24 * 1000),

      })
      .cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      })
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
        token: accessToken,
      });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

