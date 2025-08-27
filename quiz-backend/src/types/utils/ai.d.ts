export interface GenerateQuizQuestionsParams {
  title: string;
  context: string;
  morecontext?: string;
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
