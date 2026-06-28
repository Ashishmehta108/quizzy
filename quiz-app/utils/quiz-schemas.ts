import { z } from "zod";

export const createQuizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  query: z.string().min(1, "Query is required"),
  description: z.string().optional().default(""),
  files: z.any().optional(),
  websearch: z.boolean().optional().default(false),
});

export type CreateQuizForm = z.infer<typeof createQuizSchema>;
