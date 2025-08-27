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

export { Input, QuizQuestion };
