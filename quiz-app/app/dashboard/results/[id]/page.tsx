"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  XCircle,
  Trophy,
  Clock,
  Target,
  Info,
  CheckCircle2,
  X,
  RotateCcw,
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  BookOpen,
  User,
  Calendar,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import Link from "next/link";

interface QuizResult {
  score: number;
  percentage: string;
  totalQuestions: number;
  selectedAnswers: Array<{
    question: string;
    selected: number[];
    options: string[];
    correct: number;
    explanation?: string;
    createdAt?: string;
    submittedAt?: string;
  }>;
}

interface ApiResponse {
  result: QuizResult;
}

export default function ResultViewPage() {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { user, isLoading, restoreSession } = useAuthStore();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const initializePage = async () => {
      if (!isLoading) {
        if (!user?.id) {
          try {
            await restoreSession();
            if (!useAuthStore.getState().user) {
              router.push("/login");
              return;
            }
          } catch (error) {
            router.push("/login");
            return;
          }
        }
        await fetchResult();
      }
    };

    initializePage();
  }, [user, isLoading, router, id, restoreSession]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>(`/results/${id}`);
      console.log("Quiz result response:", response.data);
      setResult(response.data.result);
    } catch (error: any) {
      console.error("Error fetching result:", error);
      setError(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong while fetching the result"
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeTaken = () => {
    if (!result?.selectedAnswers?.length) return null;
    const firstAnswer = result.selectedAnswers[0];
    if (!firstAnswer.createdAt || !firstAnswer.submittedAt) return null;

    const start = new Date(firstAnswer.createdAt);
    const end = new Date(firstAnswer.submittedAt);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);

    return `${diffMins}m ${diffSecs}s`;
  };

  const isAnswerCorrect = (selected: number[], correct: number) => {
    if (selected.length === 1) {
      return selected[0] === correct;
    }
    return selected.includes(correct);
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="text-center space-y-4">
              <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mx-auto" />
              <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mx-auto" />
            </div>
            <Card className="border-zinc-200 dark:border-zinc-800">
              <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="h-20 w-20 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                </div>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert
            variant="destructive"
            className="border-red-200 dark:border-red-800"
          >
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error || "Result not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const scorePercentage = Number.parseFloat(result.percentage);
  const totalQuestions = result.totalQuestions;
  const correctAnswers = result.score;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const timeTaken = calculateTimeTaken();

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90) return "Excellent";
    if (percentage >= 80) return "Great Job";
    if (percentage >= 70) return "Well Done";
    if (percentage >= 60) return "Good Effort";
    return "Keep Practicing";
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-left">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Quiz Complete!
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        <Card className="mb-8 border-zinc-200 dark:bg-zinc-900 bg-zinc-50 dark:border-zinc-800">
          <CardHeader className="border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {getPerformanceLevel(scorePercentage)}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 text-base mt-2">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                    {scorePercentage}% Score
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Overall Performance
                  </span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {scorePercentage}%
                  </span>
                </div>
                <Progress
                  value={scorePercentage}
                  className="h-2 bg-zinc-200 dark:bg-zinc-800"
                />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <Target className="h-6 w-6 mx-auto mb-2 text-zinc-600 dark:text-zinc-400" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Total
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {totalQuestions}
                  </p>
                </div>
                <div className="text-center p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-zinc-600 dark:text-zinc-400" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Correct
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {correctAnswers}
                  </p>
                </div>
                <div className="text-center p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <X className="h-6 w-6 mx-auto mb-2 text-zinc-600 dark:text-zinc-400" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Incorrect
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {incorrectAnswers}
                  </p>
                </div>
                <div className="text-center p-4 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-zinc-600 dark:text-zinc-400" />
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Accuracy
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {scorePercentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8 bg-zinc-200 dark:bg-zinc-800" />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  Question Review
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Review your answers and explanations
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="px-3 py-1 border-zinc-300 dark:border-zinc-700"
            >
              {result.selectedAnswers.length} Questions
            </Badge>
          </div>

          {result.selectedAnswers.map((answer, index) => {
            const isCorrect = isAnswerCorrect(answer.selected, answer.correct);
            return (
              <Card
                key={index}
                className={`border-2 ${
                  isCorrect
                    ? "border-green-300 dark:border-green-700 bg-white dark:bg-zinc-900/50"
                    : "border-red-400 dark:border-red-600 bg-white dark:bg-zinc-900"
                }`}
              >
                <CardHeader className="border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge
                          variant="outline"
                          className="border-zinc-300 dark:border-zinc-700"
                        >
                          Question {index + 1}
                        </Badge>
                        {isCorrect ? (
                          <Badge className="bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-zinc-100 dark:text-zinc-900">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Incorrect
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg text-zinc-900 dark:text-zinc-100">
                        {answer.question}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {answer.options.map((option, optionIndex) => {
                        const isSelected = answer.selected.includes(
                          optionIndex + 1
                        );
                        const isCorrectOption =
                          answer.correct === optionIndex + 1;

                        let optionClass =
                          "p-3 rounded-lg border flex items-center justify-between transition-colors ";

                        if (isCorrectOption) {
                          optionClass +=
                            "bg-zinc-100 dark:bg-zinc-800 border-zinc-400 dark:border-zinc-600";
                        } else if (isSelected && !isCorrectOption) {
                          optionClass +=
                            "bg-zinc-200 dark:bg-zinc-700 border-zinc-500 dark:border-zinc-500";
                        } else {
                          optionClass +=
                            "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800";
                        }

                        return (
                          <div key={optionIndex} className={optionClass}>
                            <div className="flex items-center gap-2 sm:gap-3">
                              <div className="sm:w-6 sm:h-6 h-5 w-5 rounded-full bg-zinc-300 dark:bg-zinc-700 flex items-center justify-center text-xs font-normal md:text-sm  text-zinc-700 dark:text-zinc-300">
                                {String.fromCharCode(65 + optionIndex)}
                              </div>
                              <span className="  text-zinc-900 dark:text-zinc-100">
                                {option}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <Badge
                                  variant="outline"
                                  className="text-xs  border-zinc-300 dark:border-zinc-700"
                                >
                                  <User className="h-3 w-3 mr-1" />
                                  Your Choice
                                </Badge>
                              )}
                              {isCorrectOption && (
                                <Badge className="text-xs bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900">
                                  <Trophy className="h-3 w-3 mr-1" />
                                  Correct
                                </Badge>
                              )}
                              {isCorrectOption ? (
                                <CheckCircle2 className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                              ) : isSelected ? (
                                <X className="h-3 w-3 text-zinc-600 dark:text-zinc-400" />
                              ) : null}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="explanation" className="border-0">
                        <AccordionTrigger className="hover:no-underline p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                          <div className="flex items-center gap-2 text-sm md:text-base">
                            <Info className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                            <span className="text-zinc-900 dark:text-zinc-100">
                              {isCorrect
                                ? "Why this is correct"
                                : "Learn the right answer"}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-3">
                          <Alert className="border-zinc-200 dark:border-zinc-800">
                            <Info className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                            <AlertDescription>
                              {!isCorrect && (
                                <div className="mb-3 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                    <div>
                                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                        ✅ Correct Answer:
                                      </span>
                                      <br />
                                      <span className="text-zinc-600 dark:text-zinc-400">
                                        Option {answer.correct}:{" "}
                                        {answer.options[answer.correct - 1]}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                        ❌ Your Answer:
                                      </span>
                                      <br />
                                      <span className="text-zinc-600 dark:text-zinc-400">
                                        {answer.selected.length > 0
                                          ? answer.selected
                                              .map(
                                                (sel) =>
                                                  `Option ${sel}: ${
                                                    answer.options[sel - 1]
                                                  }`
                                              )
                                              .join(", ")
                                          : "No answer selected"}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className="text-zinc-700 dark:text-zinc-300">
                                {answer.explanation ||
                                  (isCorrect
                                    ? "🎉 Excellent! You selected the correct answer."
                                    : "💡 Review the correct answer above to improve your understanding.")}
                              </div>
                            </AlertDescription>
                          </Alert>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
