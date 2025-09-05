import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { Input, QuizQuestion, Usage } from "./ai.types";
import { Chunk } from "../../types/ai/pinecone";

export const QuizState = Annotation.Root({
  input: Annotation<Input>,
  context: Annotation<string | undefined>(),
  retrievedChunks: Annotation<string[] | Chunk[]>(),
  usage: Annotation<Usage>,
  quiz: Annotation<QuizQuestion[]>({
    reducer: (prev, updates) => [...(prev ?? []), ...(updates ?? [])],
  }),
  summary: Annotation<string>,
  output: Annotation<string>,
  ...MessagesAnnotation.spec,
});
