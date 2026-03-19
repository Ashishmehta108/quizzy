/**
 * @layer middleware
 * @owner agent-1
 * @description Specialized rate limiting for authentication endpoints
 */
import { Request, Response, NextFunction } from "express";
import { redisclient } from "../utils/redis";
import { ApiError } from "../utils/apiError";

interface AuthRateLimitOptions {
  /** Time window in seconds */
  windowSec: number;
  /** Maximum requests allowed in the window */
  max: number;
  /** Burst allowance above max */
  burst?: number;
  /** Enable exponential backoff on failures */
  exponentialBackoff?: boolean;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  currentCount: number;
  retryAfter?: number;
}

/**
 * Create a rate limiter with exponential backoff support
 * Tracks attempts and increases wait time on repeated violations
 */
function createAuthRateLimiter(options: AuthRateLimitOptions) {
  const { windowSec, max, burst = 0, exponentialBackoff = true } = options;

  /**
   * Get the current backoff multiplier based on violation count
   */
  async function getBackoffMultiplier(identifier: string): Promise<number> {
    if (!exponentialBackoff) return 1;

    const violationKey = `auth:violations:${identifier}`;
    const violations = await redisclient.get(violationKey);
    const violationCount = violations ? parseInt(violations, 10) : 0;

    // Exponential backoff: 2^violations, capped at 64x
    return Math.min(Math.pow(2, violationCount), 64);
  }

  /**
   * Record a rate limit violation
   */
  async function recordViolation(identifier: string): Promise<void> {
    if (!exponentialBackoff) return;

    const violationKey = `auth:violations:${identifier}`;
    const pipeline = redisclient.multi();
    pipeline.incr(violationKey);
    pipeline.expire(violationKey, windowSec * 2); // Track violations for 2 windows
    await pipeline.exec();
  }

  /**
   * Reset violation count on successful request
   */
  async function resetViolations(identifier: string): Promise<void> {
    if (!exponentialBackoff) return;

    const violationKey = `auth:violations:${identifier}`;
    await redisclient.del(violationKey);
  }

  /**
   * Consume a rate limit token
   */
  async function consume(identifier: string): Promise<RateLimitResult> {
    const now = Math.floor(Date.now() / 1000);
    const backoffMultiplier = await getBackoffMultiplier(identifier);

    // Adjusted max based on backoff
    const effectiveMax = Math.floor(max / backoffMultiplier);

    const pipeline = redisclient.multi();

    // Use sliding window with per-second buckets
    for (let i = 0; i < windowSec; i++) {
      const sec = now - i;
      const key = `auth:rl:${identifier}:${sec}`;
      pipeline.get(key);
    }

    const results = await pipeline.exec();
    const counts = (results ?? []).map((result: any) => {
      if (!Array.isArray(result)) return 0;
      const value = result[1];
      return value ? parseInt(value, 10) : 0;
    });

    const currentSum = counts.reduce((sum, count) => sum + count, 0);
    const limit = effectiveMax + burst;

    if (currentSum >= limit) {
      await recordViolation(identifier);
      const retryAfter = backoffMultiplier > 1 ? backoffMultiplier : 1;
      return {
        allowed: false,
        remaining: 0,
        resetIn: retryAfter,
        currentCount: currentSum,
        retryAfter,
      };
    }

    // Increment current second counter
    const currentKey = `auth:rl:${identifier}:${now}`;
    const incResult = await redisclient
      .multi()
      .incr(currentKey)
      .expire(currentKey, windowSec)
      .exec();
//@ts-ignore
    const newCount = parseInt(String(incResult?.[0]?.[1] ?? "1"), 10);
    const newSum = currentSum + 1;
    const remaining = Math.max(0, limit - newSum);

    // Reset violations on successful request
    if (backoffMultiplier > 1) {
      await resetViolations(identifier);
    }

    return {
      allowed: true,
      remaining,
      resetIn: 1,
      currentCount: newSum,
    };
  }

  return { consume };
}

/**
 * Rate limit middleware for authentication endpoints
 * Uses stricter limits than general API endpoints
 */
export function authRateLimit(
  options: Partial<AuthRateLimitOptions> = {}
) {
  const {
    windowSec = 60,
    max = 10, // Stricter limit for auth endpoints
    burst = 5,
    exponentialBackoff = true,
  } = options;

  const limiter = createAuthRateLimiter({
    windowSec,
    max,
    burst,
    exponentialBackoff,
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    // Create composite key from Clerk ID + IP for better security
    const clerkId = (req as any).auth?.userId ?? "anonymous";
    const ip =
      req.ip ??
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ??
      (req.connection as any)?.remoteAddress ??
      "unknown";

    const identifier = `auth:${clerkId}:${ip}`;

    try {
      const result = await limiter.consume(identifier);

      // Set rate limit headers
      res.setHeader("X-RateLimit-Limit", String(max + burst));
      res.setHeader("X-RateLimit-Remaining", String(result.remaining));
      res.setHeader("X-RateLimit-Reset", String(result.resetIn));
      res.setHeader("X-Request-Count", String(result.currentCount));

      if (!result.allowed) {
        res.setHeader("Retry-After", String(result.retryAfter ?? 1));

        throw new ApiError(
          429,
          `Too many authentication attempts. Please try again in ${result.retryAfter ?? 1} seconds.`
        );
      }

      next();
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 429) {
        return next(error);
      }
      console.error("Auth rate limit error:", error);
      // Fail-open: allow request if Redis is unavailable
      next();
    }
  };
}

/**
 * Rate limit for sensitive auth operations (login, password reset, etc.)
 * Even stricter limits
 */
export function sensitiveAuthRateLimit(
  options: Partial<AuthRateLimitOptions> = {}
) {
  return authRateLimit({
    windowSec :60,
    max :5, // Very strict for sensitive operations
    burst : 2,
    exponentialBackoff : true,
    ...options,
  });
}

/**
 * Rate limit by Clerk ID only (for authenticated users)
 */
export function authRateLimitByUser(
  options: Partial<AuthRateLimitOptions> = {}
) {
  const {
    windowSec = 60,
    max = 30,
    burst = 10,
  } = options;

  const limiter = createAuthRateLimiter({
    windowSec,
    max,
    burst,
    exponentialBackoff: false,
  });

  return async (req: Request, res: Response, next: NextFunction) => {
    const clerkId = (req as any).auth?.userId;

    if (!clerkId) {
      return next(new ApiError(401, "Unauthorized: No user ID"));
    }

    const identifier = `auth:user:${clerkId}`;

    try {
      const result = await limiter.consume(identifier);

      res.setHeader("X-RateLimit-Limit", String(max + burst));
      res.setHeader("X-RateLimit-Remaining", String(result.remaining));

      if (!result.allowed) {
        res.setHeader("Retry-After", "1");
        throw new ApiError(429, "Too many requests. Please slow down.");
      }

      next();
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 429) {
        return next(error);
      }
      console.error("User rate limit error:", error);
      next();
    }
  };
}
