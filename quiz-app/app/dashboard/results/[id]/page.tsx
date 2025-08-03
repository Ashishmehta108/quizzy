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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  XCircle,
  Trophy,
  Clock,
  Target,
  Info,
  TrendingUp,
  Award,
  BookOpen,
  Lightbulb,
  User,
  Calendar,
  Timer,
  CheckCircle2,
  X,
  Check,
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
    selected: number;
    correct: number;
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
            // Check if user is still null after restore attempt
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

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-8">
            {/* Header Skeleton */}
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Hero Skeleton */}
            <div className="text-center space-y-4">
              <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mx-auto" />
              <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mx-auto" />
            </div>

            {/* Score Card Skeleton */}
            <Card>
              <CardHeader className="space-y-4 pb-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <div className="h-16 w-16 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse mx-auto" />
                    <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Questions Skeleton */}
            <div className="space-y-6">
              <div className="h-6 w-40 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[...Array(4)].map((_, j) => (
                      <div
                        key={j}
                        className="h-12 bg-zinc-200 dark:bg-zinc-800 rounded-lg animate-pulse"
                      />
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertDescription>{error || "Result not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const scorePercentage = parseFloat(result.percentage);
  const totalQuestions = result.totalQuestions;
  const correctAnswers = result.score;
  const incorrectAnswers = totalQuestions - correctAnswers;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 dark:text-green-400";
    if (percentage >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 90)
      return { level: "Excellent", icon: Trophy, color: "text-yellow-600" };
    if (percentage >= 80)
      return { level: "Great", icon: Award, color: "text-green-600" };
    if (percentage >= 70)
      return { level: "Good", icon: TrendingUp, color: "text-blue-600" };
    if (percentage >= 60)
      return { level: "Fair", icon: BookOpen, color: "text-yellow-600" };
    return { level: "Needs Improvement", icon: Target, color: "text-red-600" };
  };

  const performance = getPerformanceLevel(scorePercentage);
  const PerformanceIcon = performance.icon;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Navigation Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar className="h-12 w-12 bg-blue-600">
                <AvatarFallback className="text-white font-bold">
                  {user?.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="text-left">
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                  Quiz Results
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Completed on {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Score Summary Card */}
          <Card className="mb-8">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-lg">
                    <PerformanceIcon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      Your Performance
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className={`font-semibold ${performance.color}`}>
                        {performance.level}
                      </span>
                      •
                      <Timer className="h-4 w-4" />
                      Just completed
                    </CardDescription>
                  </div>
                </div>
                <div className="text-center">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">
                        {scorePercentage}%
                      </span>
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                      <Badge
                        variant={getScoreBadgeVariant(scorePercentage)}
                        className="font-medium"
                      >
                        {correctAnswers}/{totalQuestions}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Overall Progress</span>
                    <span className={getScoreColor(scorePercentage)}>
                      {scorePercentage}%
                    </span>
                  </div>
                  <Progress value={scorePercentage} className="h-3" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                        Total Questions
                      </p>
                      <p className="text-2xl font-bold">{totalQuestions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700 dark:text-green-300">
                        Correct Answers
                      </p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {correctAnswers}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <X className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">
                        Incorrect Answers
                      </p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {incorrectAnswers}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          {/* Question Review Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Detailed Review</h2>
              </div>
              <Badge variant="outline" className="text-sm">
                {result.selectedAnswers.length} Questions
              </Badge>
            </div>

            {result.selectedAnswers.map((answer, index) => {
              const isCorrect = answer.selected === answer.correct;

              return (
                <Card
                  key={index}
                  className={`transition-all duration-300 hover:shadow-lg ${
                    isCorrect
                      ? "border-l-4 border-l-green-500"
                      : "border-l-4 border-l-red-500"
                  }`}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge variant="outline" className="font-medium">
                            Question {index + 1}
                          </Badge>
                          {isCorrect ? (
                            <Badge className="bg-green-600 hover:bg-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Correct
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <X className="h-3 w-3 mr-1" />
                              Incorrect
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg leading-relaxed font-semibold">
                          {answer.question}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* User's Selected Answer */}
                      <div className="p-4 rounded-lg border-2 bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-800 dark:text-blue-200">
                            Your Answer: Option {answer.selected}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            <User className="h-3 w-3 mr-1" />
                            Selected
                          </Badge>
                        </div>
                      </div>

                      {/* Correct Answer */}
                      <div className="p-4 rounded-lg border-2 bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-800 dark:text-green-200">
                            Correct Answer: Option {answer.correct}
                          </span>
                          <Badge className="text-xs bg-green-600 hover:bg-green-700">
                            <Check className="h-3 w-3 mr-1" />
                            Correct
                          </Badge>
                        </div>
                      </div>

                      {/* Show incorrect user answer if different from correct */}
                      {!isCorrect && (
                        <div className="p-4 rounded-lg border-2 bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-red-800 dark:text-red-200">
                              Your Answer: Option {answer.selected}
                            </span>
                            <Badge variant="destructive" className="text-xs">
                              <X className="h-3 w-3 mr-1" />
                              Incorrect
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Explanation Accordion */}
                    <Accordion type="single" collapsible className="w-full mt-4">
                      <AccordionItem value="explanation" className="border-0">
                        <AccordionTrigger className="hover:no-underline p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            {isCorrect ? "Explanation" : "Why this answer?"}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pt-4 pb-2">
                          <Alert className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                            <Info className="h-4 w-4" />
                            <AlertDescription className="text-sm leading-relaxed">
                              {!isCorrect && (
                                <div className="mb-2">
                                  <span className="font-semibold">
                                    Correct Answer:
                                  </span>{" "}
                                  <span className="text-green-700 dark:text-green-300 font-medium">
                                    Option {answer.correct}
                                  </span>
                                  <br />
                                  <span className="font-semibold">
                                    Your Answer:
                                  </span>{" "}
                                  <span className="text-red-700 dark:text-red-300 font-medium">
                                    Option {answer.selected}
                                  </span>
                                </div>
                              )}
                              {isCorrect && (
                                <div className="text-green-700 dark:text-green-300 font-medium">
                                  Great job! You selected the correct answer.
                                </div>
                              )}
                            </AlertDescription>
                          </Alert>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
