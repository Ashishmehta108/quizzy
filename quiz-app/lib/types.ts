export interface User {
  id: string;
  name: string;
  email: string;
}

export interface QuizResponse {
  quiz: Quiz;
  document: Document;
  questions: Question[];
  result: Result;
}

export type updatedQuestions = {
  id: string;
  quizId: string;
  question: string;
  options: string[];
  answer: number;
};

export interface Quiz {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
}

export interface Document {
  id: string;
  userId: string;
  createdAt: string;
}

export interface Question {
  id: string;
  quizId: string;
  question: string;
  options: string;
  answer: number;
}

export interface ResultResponse {
  data: Result;
}

export interface Result {
  id: string;
  quizId: string;
  userId: string;
  title: string;
  score: number;
  optionsReview: string;
  submittedAt: string;
  quiz?: Quiz;
}

export interface Document {
  id: string;
  userId: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateQuizRequest {
  title: string;
  query: string;
  files: File[];
}
