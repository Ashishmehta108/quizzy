import { Pinecone } from "@pinecone-database/pinecone";
import { genAI } from "../utils/ai.js"

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.index(process.env.PINECONE_INDEX || "quiz-data");

const indexName = "quiz-data";

async function ensureIndex() {
    const existingIndexes = await pinecone.listIndexes();
    if (!existingIndexes.indexes.find(i => i.name === indexName)) {
        console.log(`Index "${indexName}" not found. Creating...`);
        await pinecone.createIndex({
            name: 'quiz-data',
            vectorType: 'dense',
            dimension: 768,
            metric: 'cosine',
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1'
                }
            },
            deletionProtection: 'disabled',
            tags: { environment: 'development' },
        });
        console.log(`Index "${indexName}" created.`);
        // Wait a bit for the index to become ready
        await new Promise(r => setTimeout(r, 10000));
    }
}

export async function generateEmbedding(text) {
    const response = await genAI.models.embedContent({
        model: "gemini-embedding-001",
        contents: text,
        config: {
            taskType: "RETRIEVAL_DOCUMENT",
            outputDimensionality: 768
        }
    });
    console.log(response.embeddings[0].values)
    return response.embeddings[0].values;
}

/**
 * Upsert chunks into Pinecone
 * @param {string} userId - ID of the user uploading the doc
 * @param {string} docId - Unique document ID
 * @param {Array} chunks - Array of text chunks [{ id, text }]
 */
export async function upsertChunks(userId, docId, chunks) {
    ensureIndex()
    const vectors = [];
    for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk.text);
        vectors.push({
            id: `user::${userId}::doc::${docId}::chunk::${chunk.id}`,
            values: embedding,
            metadata: {
                userId,
                docId,
                chunkId: chunk.id,
                text: chunk.text,
            },
        });
    }

    await index.namespace("quiz-data").upsert(vectors)
}


/**
 * Query Pinecone for relevant chunks
 * @param {string} query - The search text
 * @param {string} userId - Filter by user
 * @param {number} topK - Number of chunks to retrieve
 */
export async function queryChunks(query, userId, topK = 5, docId) {
    console.log(query)
    const queryEmbedding = await generateEmbedding(query);

    const filter = { userId: { "$eq": userId } };
    // if (docId) filter.docId = { "$eq": docId };
    const namespace = index.namespace("quiz-data")
    const results = await namespace.query({
        vector: queryEmbedding,
        topK,
        filter,
        includeMetadata: true,
    });
    console.log(results)
    return results.matches.map(match => ({
        id: match.id,
        score: match.score,
        text: match.metadata.text || "",
        metadata: match.metadata,
    }));
}



