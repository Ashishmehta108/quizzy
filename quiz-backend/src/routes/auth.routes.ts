import { Router } from "express";
import { syncUser, getAuthEvents } from "../controllers/auth.controller";
import { checkAuth } from "../utils/checkAuth";
import { resolveUser } from "../middlewares/better-auth.middleware";
import { authRateLimit, authRateLimitByUser } from "../middlewares/auth-rate-limit.middleware";

const authRouter = Router();

/**
 * @route GET /api/auth/sync
 * @description Sync user from Clerk to local database
 * @access Private (requires Clerk authentication)
 * @rateLimit 10 requests per minute with exponential backoff
 */
authRouter.get(
  "/sync",
  authRateLimit({ windowSec: 60, max: 10, burst: 5 }),
  checkAuth,
  resolveUser,
  syncUser
);

/**
 * @route GET /api/auth/events
 * @description Get authentication events for current user
 * @access Private (requires Clerk authentication)
 * @rateLimit 30 requests per minute
 */
authRouter.get(
  "/events",
  authRateLimitByUser({ windowSec: 60, max: 30, burst: 10 }),
  checkAuth,
  getAuthEvents
);

export default authRouter;
