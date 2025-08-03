"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Trophy, 
  Target, 
  Calendar, 
  ArrowRight, 
  XCircle,
  TrendingUp,
  Award,
  BookOpen,
  Clock
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import Link from "next/link";

interface QuizResult {
  id: string;
  quizId: string;
  score: number;
  optionsReview: Record<string, number>;
  createdAt?: string;
}

interface ApiResponse {
  data: QuizResult[];
}

export default function ResultsPage() {
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const { user, isLoading, restoreSession } = useAuthStore();
  const router = useRouter();

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
        await fetchResults();
      }
    };

    initializePage();
  }, [user, isLoading, router, restoreSession]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse>("/results");
      console.log("Results response:", response.data);
      setResults(response.data.data || []);
    } catch (error: any) {
      console.error("Error fetching results:", error);
      setError(
        error.response?.data?.message || 
        error.message || 
        "Failed to load results"
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { level: "Excellent", icon: Trophy, color: "text-yellow-600" };
    if (score >= 80) return { level: "Great", icon: Award, color: "text-green-600" };
    if (score >= 70) return { level: "Good", icon: TrendingUp, color: "text-blue-600" };
    if (score >= 60) return { level: "Fair", icon: BookOpen, color: "text-yellow-600" };
    return { level: "Needs Improvement", icon: Target, color: "text-red-600" };
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header Skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mx-auto mb-4" />
            <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse mx-auto" />
          </div>

          {/* Results Grid Skeleton */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-5 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-2" />
                  <div className="h-4 w-1/2 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-4 w-2/3 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-8 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Alert variant="destructive">
            <XCircle className="h-5 w-5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Quiz Results
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                View your performance across all quizzes
              </p>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {results.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-16 w-16 text-zinc-400 mb-4" />
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                No results yet
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-center mb-6">
                Take some quizzes to see your results here
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <BookOpen className="h-4 w-4" />
                Take a Quiz
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((result) => {
              const performance = getPerformanceLevel(result.score);
              const PerformanceIcon = performance.icon;
              const totalQuestions = Object.keys(result.optionsReview).length;
              const correctAnswers = Object.values(result.optionsReview).filter(
                (answer, index) => answer === index + 1
              ).length;
              const scorePercentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

              return (
                <Link key={result.id} href={`/result/${result.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-600">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <PerformanceIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <Badge variant={getScoreBadgeVariant(scorePercentage)}>
                            {performance.level}
                          </Badge>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-blue-600 transition-colors" />
                      </div>
                      <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        Quiz #{result.quizId.slice(-6)}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        {result.createdAt 
                          ? new Date(result.createdAt).toLocaleDateString()
                          : "Recently completed"
                        }
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Score Display */}
                        <div className="text-center">
                          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                            {scorePercentage}%
                          </div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            {correctAnswers} of {totalQuestions} correct
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                            <Target className="h-3 w-3 text-green-600" />
                            <span className="text-green-700 dark:text-green-300 font-medium">
                              {correctAnswers} correct
                            </span>
                          </div>
                          <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950 rounded-lg">
                            <XCircle className="h-3 w-3 text-red-600" />
                            <span className="text-red-700 dark:text-red-300 font-medium">
                              {totalQuestions - correctAnswers} wrong
                            </span>
                          </div>
                        </div>

                        {/* Result ID */}
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                          ID: {result.id.slice(-8)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 