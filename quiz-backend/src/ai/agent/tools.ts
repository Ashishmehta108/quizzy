import { generateEmbedding } from "../pinecone";
import { QuizState } from "./Graph";
import { index } from "../pinecone";
import { Chunk } from "../../types/ai/pinecone";
import { generateQuizQuestions } from "../../utils/ai";
import { db } from "../../config/db";
import { billings, documents, usage } from "../../config/db/schema";
import { and, eq } from "drizzle-orm";
import { ApiError } from "../../utils/apiError";
import { searchWeb } from "./tools/websearch.tool";
import { notionRetriever } from "./tools/notion";
import { DynamicStructuredTool, tool } from "@langchain/core/tools";
import { RunnableConfig } from "@langchain/core/runnables";
import z from "zod";

export async function retrieveNode(
  state: typeof QuizState.State,
  config?: RunnableConfig
) {
  try {
    console.log("[RetrieveNode] State received:", state, config);

    if (!config?.configurable?.docId) {
      console.warn("[RetrieveNode] No docId provided.");
      return { retrievedChunks: [] };
    }

    const [hasDocument] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, config.configurable.docId))
      .limit(1);

    if (!hasDocument?.id) {
      console.warn("[RetrieveNode] Document not found in DB.");
      return { retrievedChunks: [] };
    }

    console.log(
      "[RetrieveNode] Generating embedding for query:",
      state.input.query
    );
    const queryEmbedding = await generateEmbedding(state.input.query);
    console.log("embedding generated", queryEmbedding);
    console.log("[RetrieveNode] Querying Pinecone...");
    const namespace = index.namespace("quiz-data");
    const results = await namespace.query({
      vector: queryEmbedding as number[],
      topK: 5,
      filter: { docId: { $eq: config.configurable.docId } },
      includeMetadata: true,
    });

    if (!results?.matches?.length) {
      console.warn("[RetrieveNode] No matches found in Pinecone.");
      return { retrievedChunks: [] };
    }

    const chunks: Chunk[] = results.matches.map((match) => ({
      text: match.metadata?.text as string,
      metadata: match.metadata!,
    }));

    console.log("[RetrieveNode] Retrieved chunks:", chunks);

    let summary;
    try {
      summary = JSON.parse(chunks.map((c) => c.text).join("\n\n"));
    } catch (e: any) {
      console.error("[RetrieveNode] Failed to parse summary JSON:", e.message);
      throw new ApiError(500, "Failed to parse summary from retrieved chunks.");
    }

    return {
      retrievedChunks: chunks,
      summary,
    };
  } catch (err: any) {
    console.error("[RetrieveNode] Error:", err);
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `RetrieveNode failed: ${err.message || err}`);
  }
}

export async function quizGeneratorNode(
  state: typeof QuizState.State,
  config: RunnableConfig
): Promise<Partial<typeof QuizState.State>> {
  try {
    console.log("[QuizGeneratorNode] Generating quiz for:", state.input);

    // Extract context from messages (tool call responses)
    console.log(
      "[QuizGeneratorNode] Raw messages:",
      JSON.stringify(state.messages, null, 2)
    );

    console.log(state.messages);
    const messageContext = state.messages
      ?.map((msg, index) => {
        console.log(`[QuizGeneratorNode] Processing message ${index}:`, {
          type: msg.constructor.name,
          content: msg.content,
          additional_kwargs: msg.additional_kwargs,
        });

        if (msg.content && typeof msg.content === "string") {
          return msg.content;
        }
        if (msg.content && Array.isArray(msg.content)) {
          return msg.content
            .map((c) => (typeof c === "string" ? c : JSON.stringify(c)))
            .join("\n");
        }
        // Handle tool call responses specifically
        if ("tool_calls" in msg && Array.isArray((msg as any).tool_calls)) {
          const toolCalls = (msg as any).tool_calls;
          return toolCalls.map((tc: any) => tc.args || tc).join("\n");
        }
        return "";
      })
      .filter(Boolean)
      .join("\n");

    console.log(
      "[QuizGeneratorNode] Extracted message context:",
      messageContext
    );

    const quiz = await generateQuizQuestions({
      title: state.input.title ?? "",
      context: state.input.query ?? "",
      morecontext: [
        state.summary ?? "",
        messageContext,
        ...(state.retrievedChunks ?? []),
      ]
        .map((c) => (typeof c === "string" ? c : JSON.stringify(c)))
        .filter(Boolean)
        .join("\n"),
      State: state,
    });

    if (quiz.type === "tool") {
      throw new ApiError(
        500,
        "QuizGeneratorNode received a tool call, which is not allowed here."
      );
    }

    console.log("[QuizGeneratorNode] Generated quiz:", quiz.data);
    const [activeBilling] = await db
      .select()
      .from(billings)
      .where(
        and(
          eq(billings.userId, config?.configurable?.userId!),
          eq(billings.status, "active")
        )
      )
      .limit(1);

    if (!activeBilling) throw new ApiError(403, "No active subscription found");

    const [currentUsage] = await db
      .select()
      .from(usage)
      .where(eq(usage.billingId, activeBilling.id))
      .limit(1);

    if (!currentUsage) {
      throw new ApiError(500, "Usage record not found for active billing");
    }
    await db
      .update(usage)
      .set({
        websearchesUsed:
          currentUsage.websearchesUsed + state.usage.webSearchesDone,
        updatedAt: new Date(),
      })
      .where(eq(usage.id, currentUsage.id));
    return { quiz: Array.isArray(quiz.data) ? quiz.data : [quiz.data] };
  } catch (err: any) {
    console.error("[QuizGeneratorNode] Error:", err);
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, `QuizGeneratorNode failed: ${err.message || err}`);
  }
}

const searchWebSchema = z.object({
  input: z.string(),
});

export const searchWebTool = new DynamicStructuredTool({
  name: "searchWeb",
  description: "Performs a web search given a query string.",
  schema: searchWebSchema,
  async func(input: unknown) {
    const { input: query } = searchWebSchema.parse(input);
    return searchWeb(query);
  },
});

const notionSearchSchema = z.object({
  userId: z.string(),
  queries: z.array(z.string()),
});

export const notionSearchTool = new DynamicStructuredTool({
  name: "searchNotion",
  description: "Search through Notion docs.",
  schema: notionSearchSchema,
  async func(input: unknown) {
    const { userId, queries } = notionSearchSchema.parse(input);
    return notionRetriever(userId, queries);
  },
});

const echoSchema = z.object({
  text: z.string(),
});

export const echoTool = new DynamicStructuredTool({
  name: "echo",
  description: "Echoes back input text",
  schema: echoSchema,
  async func(input: unknown) {
    const { text } = echoSchema.parse(input);
    return text;
  },
});

export const tools = [searchWebTool, notionSearchTool, echoTool];
