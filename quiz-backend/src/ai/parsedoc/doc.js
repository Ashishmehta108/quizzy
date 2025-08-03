import { extractPdfText } from "../../utils/parsepdf.js";
import { chunkText } from "../../utils/chunk.js";
import { upsertChunks } from "../pinecone.js";

export async function processPdf(filePath, userId, docId) {
    const text = await extractPdfText(filePath);
    const chunks = chunkText(text, 1000, 100);
    await upsertChunks(userId, docId, chunks);
    console.log(`Processed ${chunks.length} chunks from ${filePath}`);
}


