import "dotenv/config"
import { createClerkClient } from "@clerk/express";

export const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY
})