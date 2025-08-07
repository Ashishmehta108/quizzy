import { extractPdfText } from "../../utils/parsepdf.js";
import { chunkText } from "../../utils/chunk.js";
import { upsertChunks } from "../pinecone.js";
// import { generateRelevantQuery } from "../../utils/generateRelevantQuery.js";

export async function processPdf(filePath, userId, docId) {
    const text = await extractPdfText(filePath);
    // const betterQuery = await generateRelevantQuery(text);
    const chunks = chunkText(text, 1000, 100);
    await upsertChunks(userId, docId, chunks);
    console.log(`Processed ${chunks.length} chunks from ${filePath}`);
    return betterQuery;
}


