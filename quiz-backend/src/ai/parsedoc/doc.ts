import { extractPdfText } from "../../utils/parsepdf";
import { chunkText } from "../../utils/chunk";
import { upsertChunks } from "../pinecone";
import { uploadFile } from "../../knowledgebase/upload";
import { QuizFile } from "../../controllers/quiz.controller";

export async function processPdf(
  filePath: string,
  userId: string,
  docId: string,
  files: QuizFile[]
) {
  const text = await extractPdfText(filePath);
  const chunks = chunkText(text, 1000, 100);
  for (const file of files) {
    uploadFile(
      file.buffer,
      `file:
      ${userId}:${docId}`,
      file.mimetype
    );
  }
  await upsertChunks(userId, docId, chunks);
  console.log(`Processed ${chunks.length} chunks from ${filePath}`);
  return text;
}
