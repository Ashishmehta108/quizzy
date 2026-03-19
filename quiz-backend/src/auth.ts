import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./config/db";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:5000",
  
  // Email/Password authentication
  emailAndPassword: {
    enabled: true,
  },
  
  // Database adapter using existing Drizzle setup
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
  }),
  
  // User configuration to match existing schema
  user: {
    modelName: "users",
  },
});
