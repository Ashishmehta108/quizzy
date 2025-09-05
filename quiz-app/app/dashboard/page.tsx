"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArchiveBook,
  TableDocument,
  Add,
  Notepad2,
  Activity,
} from "iconsax-reactjs";
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import "../globals.css";
import Loader from "@/components/loader/loader";
import {
  mockActivityData,
  mockScoreDistributionData,
} from "@/components/mockdata";
import EmptyState from "@/components/Empty";
import UsageWidget from "@/components/dashboard/UsageWidget";
import { useActivityData } from "@/hooks/useUtility";
import ActivityChart from "@/components/dashboard/activityWidget";
import CreateQuizModal from "@/components/dashboard/createQuizModal";

const fetchQuizzesAndResults = async () => {
  const [quizzesRes, resultsRes] = await Promise.all([
    api.get<QuizWithQuestions[]>("/quizzes", {
      withCredentials: true,
    }),
    api.get<{ data: Result[] }>("/results", {
      withCredentials: true,
    }),
  ]);
  console.log(quizzesRes.data);
  return {
    quizzes: quizzesRes.data,
    results: resultsRes.data.data,
  };
};

const processActivityData = (results: Result[]) => {
  if (!results || results.length === 0) return [];

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date;
  });

  return last30Days
    .map((date) => {
      const dayResults = results.filter((result) => {
        const resultDate = new Date(result.submittedAt);
        return resultDate.toDateString() === date.toDateString();
      });

      const averageScore =
        dayResults.length > 0
          ? Math.round(
              dayResults.reduce((sum, r) => sum + r.score, 0) /
                dayResults.length
            )
          : 0;

      return {
        date: date.toISOString().split("T")[0],
        name: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        quizzes: dayResults.length,
        score: averageScore,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
      };
    })
    .filter((data) => data.quizzes > 0 || Math.random() < 0.1); // Show some empty days for context
};

const processScoreDistribution = (results: Result[]) => {
  if (!results || results.length === 0) return [];

  const ranges = [
    { range: "0-20%", min: 0, max: 20, count: 0, color: "#ef4444" },
    { range: "21-40%", min: 21, max: 40, count: 0, color: "#f97316" },
    { range: "41-60%", min: 41, max: 60, count: 0, color: "#eab308" },
    { range: "61-80%", min: 61, max: 80, count: 0, color: "#3b82f6" },
    { range: "81-100%", min: 81, max: 100, count: 0, color: "#22c55e" },
  ];

  results.forEach((result) => {
    const range = ranges.find(
      (r) => result.score >= r.min && result.score <= r.max
    );
    if (range) range.count++;
  });

  return ranges.filter((r) => r.count > 0);
};

const processQuizPerformance = (results: Result[]) => {
  if (!results || results.length === 0) return [];

  const quizStats = results.reduce((acc, result) => {
    if (!acc[result.title]) {
      acc[result.title] = {
        title: result.title,
        attempts: 0,
        totalScore: 0,
        bestScore: 0,
        averageScore: 0,
      };
    }

    acc[result.title].attempts++;
    acc[result.title].totalScore += result.score;
    acc[result.title].bestScore = Math.max(
      acc[result.title].bestScore,
      result.score
    );

    return acc;
  }, {} as Record<string, any>);

  return Object.values(quizStats)
    .map((quiz: any) => ({
      ...quiz,
      averageScore: Math.round(quiz.totalScore / quiz.attempts),
      name:
        quiz.title.length > 20
          ? `${quiz.title.substring(0, 20)}...`
          : quiz.title,
    }))
    .slice(0, 10);
};

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
  const iconColorClasses = {
    default: "text-zinc-600 dark:text-zinc-400",
    success: "text-emerald-600 dark:text-emerald-500",
    warning: "text-amber-600 dark:text-amber-500",
    info: "text-blue-600 dark:text-blue-500",
  };

  const iconBgClasses = {
    default: "bg-zinc-100 dark:bg-zinc-800",
    success: "bg-emerald-50 dark:bg-emerald-950/50",
    warning: "bg-amber-50 dark:bg-amber-950/50",
    info: "bg-blue-50 dark:bg-blue-950/50",
  };

  return (
    <Card className="bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl shadow-inner">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {value}
              </p>
              {trend && (
                <Badge
                  variant="secondary"
                  className="text-[10px] sm:text-xs sm:px-2 px-[4.5px] py-1"
                >
                  {trend}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </p>
            )}
            {progress !== undefined && (
              <div className="space-y-2 pt-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {progress}% completion rate
                </p>
              </div>
            )}
          </div>
          <div
            className={`p-3 rounded-xl ${iconBgClasses[color]} shadow-inner ring-1 ring-white/20 dark:ring-zinc-800/40`}
          >
            <Icon size="18" className={iconColorClasses[color]} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ScoreDistributionChartProps {
  data: Array<{
    range: string;
    count: number;
    color: string;
  }>;
}

const ScoreDistributionChart = ({ data }: ScoreDistributionChartProps) => {
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <Card className="bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <Target size="20" className="text-zinc-600 dark:text-zinc-400" />
            Score Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              No quiz results available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <Target size="20" className="text-zinc-600 dark:text-zinc-400" />
          Score Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="horizontal">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="opacity-20 text-zinc-400 dark:text-zinc-600"
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-zinc-500 dark:text-zinc-400"
              />
              <YAxis
                type="category"
                dataKey="range"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-zinc-500 dark:text-zinc-400"
                width={60}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <Card className="bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 rounded-xl">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                            Score Range: {label}
                          </p>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Attempts: {payload[0].value}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

interface QuizPerformanceChartProps {
  data: Array<{
    name: string;
    title: string;
    attempts: number;
    averageScore: number;
    bestScore: number;
  }>;
}

const QuizPerformanceChart = ({ data }: QuizPerformanceChartProps) => {
  const hasData = data && data.length > 0;

  if (!hasData) {
    return (
      <Card className="bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl">
        <CardHeader className="p-6 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            <Trophy size="20" className="text-zinc-600 dark:text-zinc-400" />
            Quiz Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">
              No quiz performance data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl">
      <CardHeader className="p-6 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          <Trophy size="20" className="text-zinc-600 dark:text-zinc-400" />
          Quiz Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-2">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="currentColor"
                className="opacity-20 text-zinc-400 dark:text-zinc-600"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                className="text-zinc-500 dark:text-zinc-400"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-zinc-500 dark:text-zinc-400"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Card className="bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 rounded-xl">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                            {data.title}
                          </p>
                          <div className="space-y-1">
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                              Average: {data.averageScore}%
                            </p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">
                              Best: {data.bestScore}%
                            </p>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400">
                              Attempts: {data.attempts}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="averageScore"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="bestScore" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: activityData } = useActivityData();
  console.log(activityData);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quizzes-and-results"],
    queryFn: () => fetchQuizzesAndResults(),
  });

  const stats = useMemo(() => {
    const totalQuizzes = data?.quizzes.length || 0;
    const totalResults = data?.results.length || 0;
    const averageScore = data?.results.length
      ? Math.round(
          data.results.reduce((acc, result) => acc + result.score, 0) /
            data.results.length
        )
      : 0;
    const recentQuizzes =
      data?.quizzes.filter(
        (quiz) =>
          new Date(quiz.createdAt).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length || 0;

    const completionRate =
      totalQuizzes > 0 ? Math.round((totalResults / totalQuizzes) * 100) : 0;
    const bestScore = data?.results.length
      ? Math.max(...data.results.map((r) => r.score))
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

  if (isLoading) return <Loader />;
  if (isError) return <p>Something went wrong</p>;
  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <main className="max-w-7xl container mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                Dashboard
              </h1>
              <p className="text-zinc-600 dark:text-zinc-400">
                Track your learning progress and quiz performance
              </p>
            </div>
            <CreateQuizModal />
            {/* <Link href="/dashboard/quizzes/create">
              <Button className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm ring-1 ring-zinc-900/10 dark:ring-zinc-100/10 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100">
                <Add size="18" className="mr-2" />
                Create Quiz
              </Button>
            </Link> */}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mb-8">
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

        {/* {stats.totalResults > 0 && ( */}
        <div className="mb-8">
          <ActivityChart data={activityData!} />
        </div>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* <ActivityWidget data={activityData || []} /> */}
          <UsageWidget />
        </div>
        {/* )} */}

        <Tabs defaultValue="quizzes" className="space-y-8 mt-5">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto h-12 bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-zinc-200/60 dark:ring-zinc-800/60 rounded-2xl p-1">
            <TabsTrigger
              value="quizzes"
              className="flex items-center gap-2 data-[state=active]:bg-zinc-100 data-[state=active]:text-zinc-900 dark:data-[state=active]:bg-zinc-800 dark:data-[state=active]:text-zinc-300 data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-zinc-900/10 dark:data-[state=active]:ring-zinc-100/10 rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
            >
              <ArchiveBook size="18" />
              My Quizzes
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
              <TableDocument size="18" />
              Results
              {stats.totalResults > 0 && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  {stats.totalResults}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Your Quizzes
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Create, manage, and share your educational quizzes with others
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <QuizCardSkeleton key={i} />
                ))}
              </div>
            ) : stats.totalQuizzes === 0 ? (
              <EmptyState
                icon={ArchiveBook}
                title="No quizzes yet"
                description="Start creating engaging quizzes to test knowledge and track learning progress. Your first quiz is just a click away!"
                action={
                  <Link href="/dashboard/quizzes/create">
                    <Button
                      size="lg"
                      className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm ring-1 ring-zinc-900/10 dark:ring-zinc-100/10 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                    >
                      <Add size="18" className="mr-2" />
                      Create Your First Quiz
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

          <TabsContent value="results" className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                Quiz Results
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
                Track your performance, identify strengths, and monitor your
                learning journey
              </p>
            </div>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ResultCardSkeleton key={i} />
                ))}
              </div>
            ) : stats.totalResults === 0 ? (
              <EmptyState
                icon={Notepad2}
                title="No results yet"
                description="Take some quizzes to see your performance analytics and track your learning progress over time."
                action={
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => router.push("/quizzes")}
                    className="ring-1 ring-zinc-200 dark:ring-zinc-800 focus-visible:ring-2 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                  >
                    <BookOpen size="18" className="mr-2" />
                    Browse Available Quizzes
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
