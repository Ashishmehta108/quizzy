import { createWorker } from "tesseract.js";

export default async function extractTextFromImage(
  imageUrl: string
): Promise<string> {
  const worker = await createWorker({
    logger: (m) => console.log(m),
  });
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  const {
    data: { text },
  } = await worker.recognize(imageUrl);
  await worker.terminate();
  return text;
}
