"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArchiveBook, TableDocument, Add, Notepad2 } from "iconsax-reactjs";
import {
  Trophy,
  CheckCircle2 as CheckCircle,
  BookOpen,
  Target,
} from "lucide-react";
import { QuizTable } from "@/components/ui/quiz-card";
import ResultTable from "@/components/ui/result-card";
import {
  QuizCardSkeleton,
  ResultCardSkeleton,
} from "@/components/dashboard/Loading";
import api from "@/lib/api";
import type { QuizWithQuestions, Result } from "@/lib/types";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import "../globals.css";
import EmptyState from "@/components/Empty";
import UsageWidget from "@/components/dashboard/UsageWidget";
import { useActivityData } from "@/hooks/useUtility";
import ActivityChart from "@/components/dashboard/activityWidget";
import CreateQuizModal from "@/components/dashboard/createQuizModal";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ size?: string | number; className?: string }>;
  trend?: string;
  color?: "default" | "success" | "warning" | "info";
  progress?: number;
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "default",
  progress,
}: StatCardProps) => {
  return (
    <Card className="bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl shadow-inner">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1 space-y-1 sm:space-y-3">
            <p className="text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {title}
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {value}
              </p>
              {trend && (
                <Badge
                  variant="secondary"
                  className="text-[10px] sm:text-xs sm:px-2 px-2 py-1"
                >
                  {trend}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
            {progress !== undefined && (
              <div className="space-y-1 sm:space-y-2 pt-1">
                <Progress value={progress} className="h-2" />
                <p className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                  {progress}% completion rate
                </p>
              </div>
            )}
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-zinc-50 dark:bg-zinc-800 shadow-inner ring-1 ring-zinc-200/40 dark:ring-zinc-700/40 flex items-center justify-center">
            <Icon
              size="16"
              className="sm:text-zinc-600 text-zinc-500 dark:text-zinc-400"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const fetchQuizzesAndResults = async () => {
  try {
    const [quizzesRes, resultsRes] = await Promise.all([
      api.get<QuizWithQuestions[]>("/quizzes", { withCredentials: true }),
      api.get<{ data: Result[] }>("/results", { withCredentials: true }),
    ]);

    return {
      quizzes: quizzesRes.data || [],
      results: resultsRes.data?.data || [],
    };
  } catch (err) {
    console.error("Error fetching quizzes or results:", err);
    return { quizzes: [], results: [] };
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: activityData } = useActivityData();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["quizzes-and-results"],
    queryFn: fetchQuizzesAndResults,
    retry: false,
  });

  const stats = useMemo(() => {
    if (!data)
      return {
        totalQuizzes: 0,
        totalResults: 0,
        averageScore: 0,
        recentQuizzes: 0,
        completionRate: 0,
        bestScore: 0,
      };

    const totalQuizzes = data.quizzes.length;
    const totalResults = data.results.length;

    const percentageScores = data.results.map((result) => {
      try {
        const totalQuestions = JSON.parse(result.optionsReview)?.length || 1;
        return Math.round((result.score / totalQuestions) * 100);
      } catch {
        return 0;
      }
    });

    const averageScore = percentageScores.length
      ? Math.round(
          percentageScores.reduce((acc, score) => acc + score, 0) /
            percentageScores.length
        )
      : 0;

    const recentQuizzes = data.quizzes.filter(
      (quiz) =>
        new Date(quiz.createdAt).getTime() >
        Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length;

    const completionRate =
      totalQuizzes > 0 ? Math.round((totalResults / totalQuizzes) * 100) : 0;
    const bestScore = percentageScores.length
      ? Math.max(...percentageScores)
      : 0;

    return {
      totalQuizzes,
      totalResults,
      averageScore,
      recentQuizzes,
      completionRate,
      bestScore,
    };
  }, [data]);

  if (!isMounted) return null;
  if (isLoading) return <DashboardSkeleton />;

  if (isError)
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <p className="text-zinc-700 dark:text-zinc-300 mb-4">
          Something went wrong while loading your dashboard.
        </p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-7xl container mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Dashboard
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Track your learning progress and quiz performance
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title="Total Quizzes"
            value={stats.totalQuizzes}
            subtitle="Created by you"
            icon={BookOpen}
            color="info"
            trend={
              stats.recentQuizzes > 0
                ? `+${stats.recentQuizzes} this week`
                : undefined
            }
          />
          <StatCard
            title="Quizzes Taken"
            value={stats.totalResults}
            subtitle="Completed attempts"
            icon={CheckCircle}
            color="success"
            progress={stats.completionRate}
          />
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            subtitle="Across all attempts"
            icon={Target}
            color={
              stats.averageScore >= 80
                ? "success"
                : stats.averageScore >= 60
                ? "warning"
                : "default"
            }
            trend={
              stats.averageScore >= 80
                ? "Excellent!"
                : stats.averageScore >= 60
                ? "Good progress"
                : "Keep improving"
            }
          />
          <StatCard
            title="Best Score"
            value={`${stats.bestScore}%`}
            subtitle="Personal record"
            icon={Trophy}
            color="warning"
            trend={
              stats.bestScore === 100
                ? "Perfect!"
                : stats.bestScore >= 90
                ? "Outstanding"
                : undefined
            }
          />
        </div>

        {activityData && <ActivityChart data={activityData} />}

        {/* Usage Widget */}
        <div className="grid gap-6 mt-2 grid-cols-1 lg:grid-cols-2">
          <UsageWidget />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="quizzes" className="space-y-8 mt-5">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto h-12 bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl p-1">
            <TabsTrigger
              value="quizzes"
              className="flex items-center gap-2 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-zinc-300 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-zinc-900/10 dark:data-[state=active]:ring-zinc-100/10 rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
            >
              <ArchiveBook size="18" /> My Quizzes
              {stats.totalQuizzes > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.totalQuizzes}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="flex items-center gap-2 data-[state=active]:bg-zinc-900 data-[state=active]:text-white dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-zinc-300 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-zinc-900/10 dark:data-[state=active]:ring-zinc-100/10 rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
            >
              <TableDocument size="18" /> Results
              {stats.totalResults > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.totalResults}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Quizzes Tab */}
          <TabsContent value="quizzes" className="space-y-6">
            {stats.totalQuizzes === 0 ? (
              <EmptyState
                icon={ArchiveBook}
                title="No quizzes yet"
                description="Start creating engaging quizzes to test knowledge and track learning progress."
                action={
                  <Link href="/dashboard/quizzes/create">
                    <Button
                      size="lg"
                      className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm ring-1 ring-zinc-900/10 dark:ring-zinc-100/10 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                    >
                      <Add size="18" className="mr-2" /> Create Your First Quiz
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="flex flex-wrap justify-center gap-6 items-stretch max-w-6xl mx-auto">
                <QuizTable quizzes={data?.quizzes || []} />
              </div>
            )}
          </TabsContent>

          {/* Results Tab */}
          <TabsContent value="results" className="space-y-6">
            {stats.totalResults === 0 ? (
              <EmptyState
                icon={Notepad2}
                title="No results yet"
                description="Take some quizzes to see your performance analytics and track your learning progress."
                action={
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/quizzes")}
                    className="ring-1 ring-zinc-200 dark:ring-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <BookOpen size="18" className="mr-2" /> Browse Available
                    Quizzes
                  </Button>
                }
              />
            ) : (
              <div className="w-full">
                <ResultTable results={data?.results || []} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
