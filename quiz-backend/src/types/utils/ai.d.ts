import { QuizState } from "@/ai/agent/Graph";
import { Tool } from "@langchain/core/tools";

export interface GenerateQuizQuestionsParams {
  title: string;
  context: string;
  morecontext?: string;
  State: typeof QuizState.State;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export type GenerateQuizQuestionsFn = (
  params: GenerateQuizQuestionsParams
) => Promise<QuizQuestion[]>;
