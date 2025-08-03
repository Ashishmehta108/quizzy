"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { QuestionForm } from "@/components/ui/question-form";
import api from "@/lib/api";
import type { Quiz, QuizResponse, Result } from "@/lib/types";
import Link from "next/link";

interface TakeQuizPageProps {
  params: {
    id: string;
  };
}

export default function TakeQuizPage({ params }: TakeQuizPageProps) {
  const [quiz, setQuiz] = useState<QuizResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const { user, isLoading, restoreSession } = useAuthStore();
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
    console.log(user);
  }, [user, router, params.id]);

  const fetchQuiz = async () => {
    try {
      const response = await api.get<QuizResponse[]>("/quizzes");
      const foundQuiz = response.data.find((q) => q.quiz.id === params.id);

      if (!foundQuiz) {
        setError("Quiz not found");
        return;
      }

      setQuiz(foundQuiz);
    } catch (error) {
      setError("Failed to load quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuiz = async (answers: Record<string, number>) => {
    if (!quiz) return;
    try {
      setSubmitting(true);
      setError("");

      let totalScore = 0;
      const optionsFilled: Record<string, number> = {};

      quiz.questions.forEach((question) => {
        console.log(question);
        const userAnswer = answers[question.id];
        optionsFilled[question.id] = userAnswer ?? 1;

        if (userAnswer === question.answer) {
          totalScore++;
        }
      });
      console.log(optionsFilled);
      const values = Object.values(optionsFilled);
      const wrapped = values.map((num) => [num]);

      console.log(wrapped);
      const data = JSON.stringify(wrapped);
      const response = await api.post<Result>("/results", {
        quizId: quiz.quiz.id,
        totalScore,
        optionsFilled: data,
      });

      setResult(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
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

  if (result) {
    const scorePercentage = Math.round(
      (result.score / Object.keys(result.optionsReview).length) * 100
    );

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      ? "text-green-600"
                      : scorePercentage >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {scorePercentage}%
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Quiz Completed!
              </h2>
              <p className="text-gray-600 text-center mb-2">
                You scored {result.score} out of{" "}
                {Object.keys(result.optionsReview).length} questions correctly.
              </p>
              <p className="text-lg font-medium mb-6">
                {scorePercentage >= 80
                  ? "Excellent work!"
                  : scorePercentage >= 60
                  ? "Good job!"
                  : "Keep practicing!"}
              </p>
              <div className="flex gap-4">
                <Link href={`/results/${result.id}`}>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-accent hover:underline"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl">{quiz.quiz.title}</CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {quiz.questions.length} questions
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                No time limit
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <QuestionForm
          questions={quiz.questions}
          onSubmit={handleSubmitQuiz}
          isSubmitting={submitting}
        />
      </div>
    </div>
  );
}
