import { Request, Response, Router } from "express";
import { db } from "../config/db";
import { usage } from "../config/db/schema";
import { isNull } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler";

const updateUsageRouter = Router();
export const resetUsage = async () => {
  await db
    .update(usage)
    .set({
      websearchesUsed: 0,
      quizzesGeneratedUsed: 0,
      periodStart: new Date(),
      periodEnd: null,
    })
    .where(isNull(usage.periodEnd));

  return { success: true, message: "Usage reset successfully" };
};

updateUsageRouter.post(
  "/reset-usage",
  asyncHandler(async (req: Request, res: Response) => {
    const result = await resetUsage();
    res.json(result);
  })
);

export default updateUsageRouter;
