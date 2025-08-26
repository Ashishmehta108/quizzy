import "dotenv/config";

import {
  Pinecone,
  PineconeRecord,
  RecordMetadata,
} from "@pinecone-database/pinecone";
import { genAI } from "../utils/ai";
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});
export const index = pinecone.index(process.env.PINECONE_INDEX || "quiz-data");

const indexName = "quiz-data";

async function ensureIndex() {
  const existingIndexes = await pinecone.listIndexes();
  if (!existingIndexes?.indexes?.find((i) => i.name === indexName)) {
    console.log(`Index "${indexName}" not found. Creating...`);
    await pinecone.createIndex({
      name: "quiz-data",
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
    console.log(`Index "${indexName}" created.`);
    await new Promise((r) => setTimeout(r, 10000));
  }
}

export async function generateEmbedding(text: string) {
  const response = await genAI.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
    config: {
      taskType: "RETRIEVAL_DOCUMENT",
      outputDimensionality: 768,
    },
  });
  if (response.embeddings) {
    console.log(response?.embeddings[0]?.values);
    return response.embeddings[0].values;
  }
  return null;
}

type chunk = {
  id: string;
  text: string;
};

/**
 * Upsert chunks into Pinecone
 * @param {string} userId - ID of the user uploading the doc
 * @param {string} docId - Unique document ID
 * @param {Array} chunks - Array of text chunks [{ id, text }]
 */
export async function upsertChunks(
  userId: string,
  docId: string,
  chunks: chunk[]
) {
  await ensureIndex();
  const vectors: PineconeRecord<RecordMetadata>[] = [];
  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.text);
    vectors.push({
      id: `user::${userId}::doc::${docId}::chunk::${chunk.id}`,
      values: embedding as number[],
      metadata: {
        text: chunk.text,
      },
    });
  }

  await index.namespace("quiz-data").upsert(vectors);
}

interface Chunk {
  id: string;
  score: number | undefined;
  text: string;
  metadata: RecordMetadata | undefined;
}

/**
 * Query Pinecone for relevant chunks
 * @param {string} query - The search text
 * @param {string} userId - Filter by user
 * @param {number} topK - Number of chunks to retrieve
 */
export async function queryChunks(
  query: string,
  topK = 5,
  docId: string
): Promise<Chunk[]> {
  console.log(query);
  const queryEmbedding = await generateEmbedding(query);

  const filter = {
    docId: {
      $eq: docId,
    },
  };
  const namespace = index.namespace("quiz-data");
  const results = await namespace.query({
    vector: queryEmbedding as number[],
    topK,
    filter,
    includeMetadata: true,
  });
  console.log(
    results.matches.map((match) => ({
      id: match.id,
      score: match.score,
      text: match.metadata?.text || "",
      metadata: match.metadata,
    }))
  );
  return results.matches.map((match) => ({
    id: match.id,
    score: match.score,
    text: match.metadata?.text as string,
    metadata: match.metadata,
  }));
}
