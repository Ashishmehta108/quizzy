"use client";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Question, ResultResponse } from "@/lib/types";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CardDescription, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import type { QuizResponse, Result } from "@/lib/types";
import Link from "next/link";

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: number | null;
  onAnswerSelect: (answerId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isSubmitting?: boolean;
  isLastQuestion: boolean;
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  isSubmitting,
  isLastQuestion,
}: QuestionCardProps) {
  const q = JSON.parse(question.options);
  console.log(q);
  return (
    <div className="w-full max-w-3xl mx-auto ">
      <Card className="shadow-none border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 bg-white">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1">
              <div className="text-xs font-semibold">Q{questionIndex + 1}</div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                of {totalQuestions} questions
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="md:text-2xl  text-xl font-semibold text-zinc-900 dark:text-white leading-tight">
              {question.question}
            </h2>
            <p className="text-zinc-600 text-xs md:text-base dark:text-zinc-400">
              Choose the best answer from the options below
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3 mb-8">
            {q.map((option: string, index: number) => {
              const isSelected = selectedAnswer === index;
              const optionLabel = String.fromCharCode(65 + index);
              return (
                <button
                  key={index}
                  onClick={() => {
                    console.log(index);
                    onAnswerSelect(index);
                  }}
                  className={`group w-full px-2 py-2 dark:bg-zinc-900 text-left rounded-xl border-2 transition-all duration-200 hover:shadow-md  ${
                    isSelected
                      ? "border-blue-500 text-zinc-900 dark:text-white    bg-zinc-50 shadow-md scale-[1.01]"
                      : "border-gray-200  dark:border-zinc-700 bg-white dark:bg-zinc-900"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-semibold text-xs transition-all duration-200 ${
                        isSelected
                          ? " bg-blue-500  text-white"
                          : " bg-white dark:bg-zinc-900 dark:text-zinc-400 text-gray-600 "
                      }`}
                    >
                      {optionLabel}
                    </div>

                    <div className="flex-1">
                      <span
                        className={` text-sm sm:text-base  transition-colors duration-200`}
                      >
                        {option}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="sm:w-5 sm:h-5 h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {!canGoNext && (
            <div className="mb-6 p-3 bg-amber-50  dark:bg-zinc-800 border border-amber-200 dark:border-zinc-700 rounded-lg">
              <p className="text-sm text-amber-800 dark:text-amber-50 text-center">
                Please select an answer to continue
              </p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-zinc-800">
            <Button
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious}
              className="flex items-center dark:hover:bg-zinc-800 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 gap-2 px-6 py-3 disabled:opacity-50 "
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: Math.min(totalQuestions, 5) }, (_, i) => {
                  let dotIndex;
                  if (totalQuestions <= 5) {
                    dotIndex = i;
                  } else {
                    // Show current question in center with 2 on each side
                    const offset = Math.max(
                      0,
                      Math.min(questionIndex - 2, totalQuestions - 5)
                    );
                    dotIndex = offset + i;
                  }

                  const isCurrentDot = dotIndex === questionIndex;
                  const isAnsweredDot = dotIndex < questionIndex;

                  return (
                    <div
                      key={dotIndex}
                      className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        isCurrentDot
                          ? "bg-blue-500 scale-125"
                          : isAnsweredDot
                          ? "bg-green-400"
                          : "bg-gray-300"
                      }`}
                    />
                  );
                })}
                {totalQuestions > 5 && questionIndex < totalQuestions - 3 && (
                  <span className="text-gray-400 text-sm ml-1">...</span>
                )}
              </div>

              <Button
                onClick={onNext}
                disabled={!canGoNext || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all duration-200 ${
                  isLastQuestion
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLastQuestion ? (
                  isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Quiz"
                  )
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function TakeQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const { user, isLoading, restoreSession } = useAuthStore();
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user?.id) {
        const u = restoreSession();
        if (!u) {
          router.push("/login");
        }
        return;
      }
      fetchQuiz();
    }
  }, [user, router, id]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get<QuizResponse[]>("/quizzes");
      const foundQuiz = response.data.find((q) => q.quiz.id === id);

      if (!foundQuiz) {
        setError("Quiz not found");
        return;
      }

      setQuiz(foundQuiz);
      setLoading(false);
    } catch (error) {
      setError("Failed to load quiz");
    } finally {
    }
  };
  const handleAnswerSelect = (answerId: number) => {
    if (!quiz) return;
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const updatedAnswers = { ...answers, [currentQuestion.id]: answerId };
    setAnswers(updatedAnswers);
    setSelectedAnswer(answerId);
  };
  const handleNext = async () => {
    if (!quiz) return;
    const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;
    if (isLastQuestion) {
      await handleSubmitQuiz();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(
        answers[quiz.questions[currentQuestionIndex + 1]?.id] ?? null
      );
    }
  };

  const handlePrevious = () => {
    if (!quiz) return;
    const prevIndex = Math.max(0, currentQuestionIndex - 1);
    setCurrentQuestionIndex(prevIndex);
    setSelectedAnswer(answers[quiz.questions[prevIndex]?.id] ?? null);
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;
    try {
      setSubmitting(true);
      setError("");

      let totalScore = 0;
      const optionsFilled: Record<string, number> = {};

      quiz.questions.forEach((question) => {
        const userAnswer = answers[question.id];
        optionsFilled[question.id] = userAnswer ?? 1;

        if (userAnswer === question.answer) {
          totalScore++;
        }
      });
      const values = Object.values(optionsFilled);
      const wrapped = values.map((num) => [num]);

      const data = JSON.stringify(wrapped);
      const response = await api.post<ResultResponse>("/results", {
        quizId: quiz.quiz.id,
        totalScore,
        optionsFilled: data,
      });

      setResult(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 dark:bg-zinc-800 rounded"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  if (result && quiz !== null) {
    const scorePercentage = Math.round(
      (result.score / quiz?.questions?.length) * 100
    );
    console.log(result);
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-900 py-8 pt-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                  scorePercentage >= 80
                    ? "bg-green-100"
                    : scorePercentage >= 60
                    ? "bg-yellow-100"
                    : "bg-red-100"
                }`}
              >
                <span
                  className={`text-3xl font-bold ${
                    scorePercentage >= 80
                      ? "text-green-600 dark:text-green-500"
                      : scorePercentage >= 60
                      ? "text-yellow-600 dark:text-yellow-500"
                      : "text-red-600 dark:tex-red-500"
                  }`}
                >
                  {scorePercentage}%
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Completed!
              </h2>
              <p className="text-gray-600 dark:text-zinc-400 text-center mb-2">
                You scored {result.score} out of{" "}
                {JSON.parse(result.optionsReview).length} questions correctly.
              </p>
              <p className="text-lg font-medium mb-6">
                {scorePercentage >= 80
                  ? "Excellent work!"
                  : scorePercentage >= 60
                  ? "Good job!"
                  : "Keep practicing!"}
              </p>
              <div className="flex gap-4">
                <Link href={`/dashboard/results/${result.id}`}>
                  <Button>View Detailed Results</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQuestionIndex];
  console.log(answers);
  const canGoNext = selectedAnswer !== null;
  const canGoPrevious = currentQuestionIndex > 0;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="relative min-h-screen dark:bg-zinc-900 bg-white mt-2">
      <div className=" max-w-2xl container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:gap-8 gap-2">
        <div className="xl:absolute top-20 gap-y-2 gap-2 flex items-center    md:flex-col md:text-2xl  text-base  left-10">
          <span className="font-medium max-w-md mx-auto flex flex-wrap">Quiz - {quiz.quiz.title}</span>
          <span className="flex items-center text-xs gap-2">
            <FileText className="h-4 w-4" />
            {quiz.questions.length} questions
          </span>
          <span className="flex text-xs items-center gap-2">
            <Clock className="h-4 w-4" />
            No time limit
          </span>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <QuestionCard
          question={currentQuestion}
          questionIndex={currentQuestionIndex}
          totalQuestions={quiz.questions.length}
          selectedAnswer={selectedAnswer}
          onAnswerSelect={handleAnswerSelect}
          onNext={handleNext}
          onPrevious={handlePrevious}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          isSubmitting={submitting}
          isLastQuestion={isLastQuestion}
        />
      </div>
    </div>
  );
}
