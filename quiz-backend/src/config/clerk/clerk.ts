import 'dotenv/config';
import { createClerkClient } from '@clerk/express';

if (!process.env.CLERK_SECRET_KEY || !process.env.CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk environment variables');
}

export const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
});

export type ClerkClientType = typeof clerkClient;
