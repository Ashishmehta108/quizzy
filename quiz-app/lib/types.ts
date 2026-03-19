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
  submitted: boolean;
  description: string;
}

export interface QuizWithQuestions {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  submitted: boolean;
  resultId?: string;
  questions: Question[];
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
  sourceId?: string;
  pageNumber?: number;
  excerpt?: string;
  submittedAt: string;
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

export interface EmptyStateProps {
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export interface Contest {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  status: "upcoming" | "active" | "ended";
  participantCount: number;
  quizId: string;
  createdAt: string;
}

export interface ContestResponse {
  contests: Contest[];
}

export interface ContestDetail extends Contest {
  quiz?: Quiz;
  topParticipants?: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  userId: string;
  userName: string;
  userAvatar?: string;
  score: number;
  accuracy: number;
  timeTaken?: number;
  completedAt: string;
}

export interface LeaderboardResponse {
  contestId: string;
  contestTitle: string;
  entries: LeaderboardEntry[];
  totalParticipants: number;
}
