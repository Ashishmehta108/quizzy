import { generateEmbedding } from "../pinecone";
import { QuizState } from "./Graph";
import { index } from "../pinecone";
import { Chunk } from "@/types/ai/pinecone";
import { genAI, generateQuizQuestions } from "@/utils/ai";

export async function retrieveNode(state: typeof QuizState.State) {
  const queryEmbedding = await generateEmbedding(state.input.query);
  const namespace = index.namespace("quiz-data");
  const results = await namespace.query({
    vector: queryEmbedding as number[],
    topK: 5,
    filter: {
      docId: { $eq: state.docId },
    },
    includeMetadata: true,
  });

  const chunks: Chunk[] = results.matches.map((match) => ({
    id: match.id,
    score: match.score,
    text: match.metadata?.text as string,
    metadata: match.metadata!,
  }));

  console.log("Retrieved:", chunks);

  return {
    retrievedChunks: chunks,
  };
}

export async function quizGeneratorNode(
  state: typeof QuizState.State
): Promise<Partial<typeof QuizState.State>> {
  const quiz = await generateQuizQuestions({
    // title: state.query,
    title: "",
    context: "",
    // context: state.retrievedChunks || "",
    morecontext: state.context || "",
  });
  return { quiz };
}

export async function refineQuizNode(
  state: typeof QuizState.State
): Promise<Partial<typeof QuizState.State>> {
  const prompt = `
You are a quiz refiner.
Here is a raw quiz JSON:
${JSON.stringify(state.quiz, null, 2)}

Document Context (for corrections):
${state.context || "No additional context"}

Task:
- Ensure all questions are clear and concise
- Fix grammar or formatting issues
- Ensure explanations are short but beginner friendly
- Return only valid JSON (no markdown)

Output:
`;

  const result = await genAI.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
  });

  let text =
    result.candidates?.[0]?.content?.parts?.[0]?.text || result.text || "";

  try {
    return { quiz: JSON.parse(text) };
  } catch (e) {
    console.error("Refine failed, keeping original:", e);
    return { quiz: state.quiz };
  }
}
