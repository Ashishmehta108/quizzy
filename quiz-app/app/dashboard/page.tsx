"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArchiveBook, TableDocument, Add, Notepad2 } from "iconsax-reactjs";
import { useAuthStore } from "@/store/auth";
import { QuizTable } from "@/components/ui/quiz-card";
import ResultTable from "@/components/ui/result-card";
import {
  QuizCardSkeleton,
  ResultCardSkeleton,
} from "@/components/dashboard/Loading";
import api from "@/lib/api";
import type { QuizResponse, Result } from "@/lib/types";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import "../globals.css";
import Loader from "@/components/loader/loader";

const fetchQuizzesAndResults = async (token: string) => {
  if (!token) {
    token = localStorage.getItem("access_token") || "";
  }
  console.log("fetching quizzes and results");

  const [quizzesRes, resultsRes] = await Promise.all([
    api.get<QuizResponse[]>("/quizzes", {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` },
    }),
    api.get<{ data: Result[] }>("/results", {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` },
    }),
  ]);
  console.log({ quizzes: quizzesRes.data, results: resultsRes.data.data });

  return {
    quizzes: quizzesRes.data,
    results: resultsRes.data.data,
  };
};

export default function DashboardPage() {
  const {
    user,
    restoreSession,
    isLoading: authLoading,
    token,
  } = useAuthStore();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["quizzes-and-results"],
    queryFn: () => fetchQuizzesAndResults(token!),
    enabled: !!user?.id && !authLoading,
  });
  console.log(data);
  if (isLoading) return <Loader />;
  if (isError) return <p>Something went wrong</p>;
  if (!user) return null;

  if (!isMounted) return null;

  return (
    <div className="bg-white dark:bg-zinc-900">
      <main className="max-w-7xl container mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-2">
        <div className="text-2xl font-medium mb-4 flex items-center ">
          Dashboard
        </div>

        <Tabs defaultValue="quizzes" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
            <TabsTrigger value="quizzes" className="flex items-center gap-2">
              <ArchiveBook size="18" />
              My Quizzes
            </TabsTrigger>
            <TabsTrigger value="results" className="flex items-center gap-2">
              <TableDocument size="18" />
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Your Quizzes</h2>
              <p className="text-gray-600 dark:text-zinc-400">
                Manage and view your created quizzes
              </p>
            </div>

            {authLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <QuizCardSkeleton key={i} />
                ))}
              </div>
            ) : data?.quizzes.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ArchiveBook size="48" className="text-zinc-400 mb-4" />
                  <h3 className="text-lg font-medium dark:text-zinc-100 text-zinc-900 mb-2">
                    No quizzes yet
                  </h3>
                  <p className="text-zinc-600 text-center mb-4 dark:text-zinc-400">
                    Create your first quiz to get started
                  </p>
                  <Link href="/dashboard/quizzes/create">
                    <Button className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 text-xs font-medium hover:opacity-90">
                      <Add size="16" className="mr-2" />
                      Create Quiz
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-wrap justify-center gap-5 items-stretch max-w-6xl mx-auto">
                <QuizTable quizzes={data?.quizzes || []} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="results">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Quiz Results</h2>
              <p className="text-gray-600 dark:text-zinc-400">
                View your quiz performance and scores
              </p>
            </div>

            {authLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ResultCardSkeleton key={i} />
                ))}
              </div>
            ) : data?.results.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Notepad2 size="48" className="text-zinc-400 mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                    No results yet
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-center mb-4">
                    Take some quizzes to see your results here
                  </p>
                </CardContent>
              </Card>
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
