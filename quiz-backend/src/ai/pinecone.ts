import "dotenv/config";
import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { genAI } from "../utils/ai";
import { ApiError } from "../utils/apiError";
import { GoogleGenAI } from "@google/genai";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const index = pinecone.index(process.env.PINECONE_INDEX || "quiz-data");

const indexName = "quiz-data";

async function ensureIndex() {
  try {
    const existingIndexes = await pinecone.listIndexes();
    if (!existingIndexes?.indexes?.find((i) => i.name === indexName)) {
      await pinecone.createIndex({
        name: indexName,
        vectorType: "dense",
        dimension: 768,
        metric: "cosine",
        spec: {
          serverless: {
            cloud: "aws",
            region: "us-east-1",
          },
        },
        deletionProtection: "disabled",
        tags: { environment: "development" },
      });
      await new Promise((r) => setTimeout(r, 10000)); // wait for index creation
    }
  } catch (err) {
    throw new ApiError(
      500,
      `Failed to ensure index: ${(err as Error).message}`
    );
  }
}

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI!,
});
export async function generateEmbedding(text: string) {
  if (!text || text.trim().length === 0) {
    throw new ApiError(400, "Cannot generate embedding for empty text");
  }

  try {
    const response = await genai.models.embedContent({
      model: "gemini-embedding-001",
      contents: text,
      config: {
        taskType: "RETRIEVAL_DOCUMENT",
        outputDimensionality: 768,
      },
    });

    if (!response.embeddings || !response.embeddings[0]?.values) {
      throw new ApiError(500, "Failed to generate embedding");
    }

    return response.embeddings[0].values;
  } catch (err) {
    throw new ApiError(
      500,
      `Embedding generation failed: ${(err as Error).message}`
    );
  }
}

type ChunkInput = {
  id: string;
  text: string;
};

export async function upsertChunks(
  userId: string,
  docId: string,
  chunks: ChunkInput[]
) {
  if (!userId || !docId) {
    throw new ApiError(
      400,
      "userId and docId are required for upserting chunks"
    );
  }
  if (!chunks || chunks.length === 0) {
    throw new ApiError(400, "No chunks provided for upsert");
  }

  await ensureIndex();

  try {
    const vectors: PineconeRecord<RecordMetadata>[] = [];

    for (const chunk of chunks) {
      if (!chunk.text) continue;
      const embedding = await generateEmbedding(chunk.text);

      vectors.push({
        id: `user::${userId}::doc::${docId}::chunk::${chunk.id}`,
        values: embedding as number[],
        metadata: {
          text: chunk.text,
          docId,
          userId,
        },
      });
    }

    if (vectors.length === 0) {
      throw new ApiError(400, "No valid chunks to upsert");
    }

    await index.namespace("quiz-data").upsert(vectors);
  } catch (err) {
    throw new ApiError(
      500,
      `Failed to upsert chunks: ${(err as Error).message}`
    );
  }
}

interface Chunk {
  id: string;
  score: number | undefined;
  text: string;
  metadata: RecordMetadata | undefined;
}

export async function queryChunks(
  query: string,
  topK = 5,
  docId: string
): Promise<Chunk[]> {
  if (!query || query.trim().length === 0) {
    throw new ApiError(400, "Query cannot be empty");
  }
  if (!docId) {
    throw new ApiError(400, "docId is required for querying");
  }

  try {
    const queryEmbedding = await generateEmbedding(query);
    if (!queryEmbedding) {
      throw new ApiError(500, "Failed to generate query embedding");
    }

    const namespace = index.namespace("quiz-data");
    const results = await namespace.query({
      vector: queryEmbedding as number[],
      topK,
      filter: { docId: { $eq: docId } },
      includeMetadata: true,
    });

    if (!results.matches || results.matches.length === 0) {
      return [];
    }

    return results.matches.map((match) => ({
      id: match.id,
      score: match.score,
      text: (match.metadata?.text as string) || "",
      metadata: match.metadata,
    }));
  } catch (err) {
    throw new ApiError(500, `Query failed: ${(err as Error).message}`);
  }
}
