import "dotenv/config";
import { QuizQuestion, GenerateQuizQuestionsParams } from "../types/utils/ai";
import { ApiError } from "../utils/apiError";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AIMessageChunk, HumanMessage } from "@langchain/core/messages";

export const genAI = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GOOGLE_GEMINI!,
});

export const model = genAI;

function cleanJson(raw: string): string {
  return raw
    .replace(/```json|```/g, "")
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
}

export type QuizResult =
  | { type: "quiz"; data: QuizQuestion[] }
  | { type: "tool"; data: AIMessageChunk[] };

export const generateQuizQuestions = async ({
  title,
  context,
  morecontext,
  State,
}: GenerateQuizQuestionsParams): Promise<QuizResult> => {
  if (!title || !context) {
    throw new ApiError(
      400,
      "Title and context are required to generate quiz questions."
    );
  }

  const prompt = `
  You are a strict quiz generator.
  
  Quiz title: ${title}
  Context: ${context}
  Extra: ${morecontext || "None"}
  
  Instructions:
  - Output ONLY one valid JSON object.
  - Do NOT include markdown fences, comments, or explanations.
  - JSON must be exactly in this format:
  {
    "quiz": [
      {
        "question": "string",
        "options": ["string", "string", "string", "string"] options may have \`\`\ like \`\Nextjs\`\,
        "answer": number (0-3),
        "explanation": "string"
      }
    ]
  }
  - No trailing commas.
  - No duplicate JSON objects.
  - At least 10 questions if not specified.
  `;

  try {
    const messages = [new HumanMessage(prompt)];
    console.log("[generateQuizQuestions] Messages sent to Gemini:");

    const result = await model.invoke(messages);
    console.log(result);
    let raw = result.text?.trim() ?? "";
    console.log("[generateQuizQuestions] Raw Gemini response:");

    if (raw.toLowerCase() === "no tool needed") {
      console.log(
        "[generateQuizQuestions] No tool required, skipping quiz generation"
      );
      return { type: "tool", data: [] };
    }

    console.log("[generateQuizQuestions] Cleaned response for JSON parsing:");
    const cleaned = cleanJson(raw);
    const parsed = JSON.parse(cleaned);

    console.log("[generateQuizQuestions] Parsed JSON:");

    if (!parsed.quiz || !Array.isArray(parsed.quiz)) {
      console.error(
        "[generateQuizQuestions] Invalid quiz format returned by Gemini"
      );
      throw new ApiError(
        500,
        "Gemini returned invalid quiz format, expected { quiz: [...] }"
      );
    }

    console.log("[generateQuizQuestions] Quiz generated successfully");
    return { type: "quiz", data: parsed.quiz as QuizQuestion[] };
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "message" in err
        ? (err as any).message
        : String(err);
    console.error("[generateQuizQuestions] Error occurred:", message);
    throw new ApiError(500, `Failed to generate quiz questions: ${message}`);
  }
};
