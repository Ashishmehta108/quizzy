import { GoogleGenAI } from "@google/genai";
import { db } from "../config/db";
import { chatMessages, chatSessions } from "../config/db/schema";
import { eq, and, desc } from "drizzle-orm";

const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI || "" });

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export async function ensureSession(quizId: string, userId: string) {
  const existing = await db
    .select()
    .from(chatSessions)
    .where(
      and(eq(chatSessions.quizId, quizId), eq(chatSessions.userId, userId))
    )
    .orderBy(desc(chatSessions.createdAt))
    .limit(1);

  if (existing.length > 0) return existing[0].id;

  const inserted = await db
    .insert(chatSessions)
    .values({ quizId, userId })
    .returning();

  return inserted[0].id;
}
import { questions } from "@/config/db/schema";

export async function quizAI(
  type: "chat" | "hint" | "explain" | "summary",
  params: {
    quizId: string;
    userId: string;
    question?: string;
    explanation?: string;
    userQuery?: string;
    limitHistory?: number;
    sessionId?: string;
  }
) {
  const {
    quizId,
    userId,
    question,
    explanation,
    userQuery,
    limitHistory = 8,
    sessionId,
  } = params;

  const sid = sessionId || (await ensureSession(quizId, userId));

  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sid))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limitHistory);

  const convo = history
    .reverse()
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const quizQs = await db
    .select()
    .from(questions)
    .where(eq(questions.quizId, quizId));

  const quizContext = quizQs
    .map(
      (q, i) => `
Q${i + 1}: ${q.question}
Options: ${q.options}
Answer: ${q.answer}
Explanation: ${q.explanation}`
    )
    .join("\n\n");

  const prompt = buildPrompt(type, {
    quizId,
    question,
    explanation,
    userQuery,
    convo: convo || "(no history)",
    quizContext,
  });

  if (userQuery?.trim()) {
    await db.insert(chatMessages).values({
      sessionId: sid,
      quizId,
      role: "user",
      status: "sent",
      content: userQuery.trim(),
      tokensIn: 0,
      tokensOut: 0,
      createdAt: new Date(),
    });
  }

  const reply = await generate(prompt);

  await db.insert(chatMessages).values({
    sessionId: sid,
    quizId,
    role: "assistant",
    status: "received",
    content: reply.text,
    tokensIn: reply.usage.promptTokens,
    tokensOut: reply.usage.outputTokens,
    createdAt: new Date(),
  });

  return { sessionId: sid, reply: reply.text };
}

function buildPrompt(
  type: "chat" | "hint" | "explain" | "summary",
  ctx: {
    quizId: string;
    question?: string;
    explanation?: string;
    userQuery?: string;
    convo: string;
    quizContext: string;
  }
) {
  const base = `You are aira a  concise, helpful tutor. Keep answers short and clear.`;

  if (type === "chat") {
    return `${base}

Here are the quiz questions and explanations:
${ctx.quizContext}

Conversation so far:
${ctx.convo}

New user question: "${ctx.userQuery}"
Answer based on the quiz content and conversation. Avoid repetition.`;
  }

  if (type === "hint") {
    return `${base}
Question: "${ctx.question}"
Explanation: "${ctx.explanation}"

Give a gentle hint (no full answer).`;
  }

  if (type === "explain") {
    return `${base}
Question: "${ctx.question}"
Explanation: "${ctx.explanation}"

Re-explain step-by-step for a beginner in 4-6 short bullets.`;
  }

  return `${base}

Here are the quiz questions and explanations:
${ctx.quizContext}

Give 5-7 bullet key takeaways about this quiz.`;
}

async function generate(prompt: string): Promise<{
  text: string;
  usage: { promptTokens: number; outputTokens: number };
}> {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash-lite",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      temperature: 0.4,
      topP: 0.9,
      maxOutputTokens: 600,
    },
  });

  const text =
    response.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ??
    "Sorry, I couldn't generate a response.";
  const promptTokens = response.usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = response.usageMetadata?.cachedContentTokenCount ?? 0;

  return { text, usage: { promptTokens, outputTokens } };
}
