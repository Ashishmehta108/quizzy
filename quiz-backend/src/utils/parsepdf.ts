import fs from "fs/promises";
import pdf from "pdf-parse";

export async function extractPdfText(filePath: string) {
  const dataBuffer = await fs.readFile(filePath);
  const data = await pdf(dataBuffer);
  return data.text;
}
