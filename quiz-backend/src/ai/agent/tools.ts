import { generateEmbedding } from "../pinecone";
import { QuizState } from "./Graph";
import { index } from "../pinecone";
import { Chunk } from "@/types/ai/pinecone";
import { genAI, generateQuizQuestions } from "@/utils/ai";
import { db } from "@/config/db";
import { documents } from "@/config/db/schema";
import { eq } from "drizzle-orm";

export async function retrieveNode(state: typeof QuizState.State) {
  console.log("[RetrieveNode] State received:", state);

  if (!state.docId) {
    console.warn("[RetrieveNode] No docId provided. Returning empty chunks.");
    return { retrievedChunks: [] };
  }

  const [hasDocument] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, state.docId))
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

  console.log("[RetrieveNode] Querying Pinecone...");
  const namespace = index.namespace("quiz-data");
  const results = await namespace.query({
    vector: queryEmbedding as number[],
    topK: 5,
    filter: { docId: { $eq: state.docId } },
    includeMetadata: true,
  });

  const chunks: Chunk[] = results.matches.map((match) => ({
    id: match.id,
    score: match.score,
    text: match.metadata?.text as string,
    metadata: match.metadata!,
  }));

  console.log("[RetrieveNode] Retrieved chunks:", chunks);

  return {
    retrievedChunks: chunks,
  };
}

export async function quizGeneratorNode(
  state: typeof QuizState.State
): Promise<Partial<typeof QuizState.State>> {
  console.log("[QuizGeneratorNode] State received:", state);

  const quiz = await generateQuizQuestions({
    title: state.input.title ?? "",
    context: state.input.query ?? "",
    morecontext: [state.summary ?? "", ...(state.retrievedChunks ?? [])].join(
      "\n"
    ),
  });

  console.log("[QuizGeneratorNode] Generated Quiz:", quiz);

  return { quiz };
}
