import { Request, Response, NextFunction } from "express";
import { redisclient } from "../utils/redis";

interface LimiterOptions {
  prefix: string;
  windowSec: number;
  max: number;
  burst?: number;
}

interface ConsumeResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
  currentCount?: number;
}

function makeLimiter({ prefix, windowSec, max, burst = 0 }: LimiterOptions) {
  return async function consume(id: string): Promise<ConsumeResult> {
    const now = Math.floor(Date.now() / 1000);
    const pipeline = (redisclient as any).multi();
    const keys: string[] = [];

    for (let i = 0; i < windowSec; i++) {
      const sec = now - i;
      const k = `${prefix}:${id}:${sec}`;
      keys.push(k);
      pipeline.get(k);
    }

    // Execute reads
    const res = await pipeline.exec();
    const counts = (res ?? []).map((result: any) =>
      Array.isArray(result)
        ? result[0]
          ? 0
          : result[1]
          ? parseInt(result[1], 10)
          : 0
        : 0
    );
    const sum = counts.reduce((a: number, b: number) => a + b, 0);

    if (sum >= max + burst) {
      return { allowed: false, remaining: 0, resetIn: 1 };
    }

    const curKey = `${prefix}:${id}:${now}`;
    const incRes = await (redisclient as any)
      .multi()
      .incr(curKey)
      .expire(curKey, windowSec) // seconds
      .exec();

    const currentCount = parseInt(String(incRes?.[0]?.[1] ?? "0"), 10);
    const newSum = sum + 1;
    const remaining = Math.max(0, max + burst - newSum);

    return { allowed: true, remaining, resetIn: 1, currentCount };
  };
}

// Middlewares
export function rateLimitByIP({
  windowSec = 60,
  max = 100,
  burst = 50,
}: Partial<Omit<LimiterOptions, "prefix">> = {}) {
  const limiter = makeLimiter({ prefix: "rl:ip", windowSec, max, burst });

  return async (req: Request, res: Response, next: NextFunction) => {
    const ip = (
      req.ip ||
      (req.connection as any)?.remoteAddress ||
      "unknown"
    ).toString();

    try {
      const { allowed, remaining } = await limiter(ip);
      if (!allowed) {
        res.setHeader("Retry-After", "1");
        return res
          .status(429)
          .json({ error: "Too Many Requests (IP)", remaining });
      }
      res.setHeader("X-RateLimit-Remaining-IP", String(remaining));
      next();
    } catch (e) {
      console.error("IP limiter error:", e);
      // Fail-open if Redis is down:
      next();
    }
  };
}

export function rateLimitByKey({
  windowSec = 60,
  max = 60,
  burst = 20,
}: Partial<Omit<LimiterOptions, "prefix">> = {}) {
  const limiter = makeLimiter({ prefix: "rl:key", windowSec, max, burst });

  return async (req: Request, res: Response, next: NextFunction) => {
    // pull API key from header or resolved user on your auth layer
    const apiKey = req.header("x-api-key") || (req as any).user?.apiKey;
    if (!apiKey) return res.status(401).json({ error: "Missing API key" });

    try {
      const { allowed, remaining } = await limiter(apiKey);
      if (!allowed) {
        res.setHeader("Retry-After", "1");
        return res
          .status(429)
          .json({ error: "Too Many Requests (API key)", remaining });
      }
      res.setHeader("X-RateLimit-Remaining-Key", String(remaining));
      next();
    } catch (e) {
      console.error("Key limiter error:", e);
      next();
    }
  };
}
