import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { Input, QuizQuestion } from "./ai.types";
import { Chunk } from "@/types/ai/pinecone";

export const QuizState = Annotation.Root({
  input: Annotation<Input>,
  context: Annotation<string | undefined>(),
  retrievedChunks: Annotation<string[] | Chunk[]>(),
  docId: Annotation<string>,
  quiz: Annotation<QuizQuestion[]>({
    default: () => [
      {
        question: "",
        options: [],
        answer: 0,
        explanation: "",
      },
    ],
    reducer: (prev, updates) => [...(prev ?? []), ...(updates ?? [])],
  }),
  summary: Annotation<string>,
  output: Annotation<string>,
  ...MessagesAnnotation.spec,
});
