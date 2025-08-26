import { Annotation } from "@langchain/langgraph";
import { Input, QuizQuestion } from "./ai.types";

export const QuizState = Annotation.Root({
  input: Annotation<Input>,
  context: Annotation<string | undefined>(),
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

  history: Annotation<string[]>({
    default: () => [],
    reducer: (prev, updates) => [...prev, ...updates],
  }),

  output: Annotation<string>,
});
