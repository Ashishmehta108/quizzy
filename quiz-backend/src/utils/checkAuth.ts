import { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth";

export const checkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session || !session.user) {
      return res.status(401).json({ error: "Unauthenticated" });
    }

    // Attach session user to request for downstream use
    (req as any).betterAuthUser = session.user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthenticated" });
  }
};
