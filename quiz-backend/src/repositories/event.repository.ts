/**
 * @layer repository
 * @owner agent-4
 * @tables events, ai_requests
 */
import { db } from "../config/db/index";
import { events, aiRequests } from "../config/db/schema";
import { InferInsertModel } from "drizzle-orm";

type NewEvent = InferInsertModel<typeof events>;
type NewAiRequest = InferInsertModel<typeof aiRequests>;

export const EventRepository = {
  async createEvent(event: Omit<NewEvent, "id" | "createdAt">) {
    const [inserted] = await db.insert(events).values(event).returning();
    return inserted;
  },
  
  async createAiRequest(req: Omit<NewAiRequest, "id" | "createdAt">) {
    const [inserted] = await db.insert(aiRequests).values(req).returning();
    return inserted;
  }
};
