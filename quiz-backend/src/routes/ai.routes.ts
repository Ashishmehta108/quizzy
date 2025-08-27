import { Router } from "express";

export const aiRouter = Router();
import { airaAgent } from "../ai/agent/airaAgent";
import { Input, QuizQuestion } from "../ai/agent/ai.types";
import { z } from "zod";
import { searchWeb } from "@/ai/agent/tools/websearch.tool";

aiRouter.post("/quiz", async (req, res) => {
  const schema = z.object({
    title: z.string().min(1),
    query: z.string().min(1),
  });

  try {
    const { title, query } = schema.parse(req.body);
    const docId = undefined;
    const input: Input = { title, query };
    const result = await airaAgent.invoke(
      {
        input,
        docId,
      },
      {
        configurable: {
          userId: "user-123",
        },
      }
    );
    const quiz = result.output as unknown as QuizQuestion[];
    res.json({ quiz });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error generating quiz:", error);
    res.status(500).json({ error: "Failed to generate quiz" });
  }
});

aiRouter.post("/websearch", async (req, res) => {
  const schema = z.object({
    query: z.string().min(1),
  });
  try {
    const { query } = schema.parse(req.body);
    // Call your web search function here
    const results = await searchWeb(query);

    res.json({ results });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.message });
    }
    console.error("Error performing web search:", error);
    res.status(500).json({ error: "Failed to perform web search" });
  }
});

aiRouter.get("/health", (req, res) => {
  res.json({ status: "AI service is healthy" });
});
export default aiRouter;
