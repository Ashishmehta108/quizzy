type Input = {
  title: string;
  query: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
};

type Usage = {
  webSearchesDone: number;
};

export { Input, QuizQuestion, Usage };
