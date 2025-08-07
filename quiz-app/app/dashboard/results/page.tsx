"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import ResultTable from "@/components/ui/result-card";
import api from "@/lib/api";
import type { Result } from "@/lib/types";

export default function DashboardPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, restoreSession, isLoading } = useAuthStore();
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
      fetchData();
    }
  }, [user, router]);

  const fetchData = async () => {
    try {
      const [resultsRes] = await Promise.all([
        api.get<{ data: Result[] }>("/results"),
      ]);
      console.log(resultsRes);
      setResults(resultsRes.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-zinc-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between flex-col">
          <h2 className="text-xl font-semibold">Quiz Results</h2>
          <p className="text-gray-600 dark:text-zinc-400 text-base">
            View your quiz performance and scores
          </p>
        </div>
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : results.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results yet
              </h3>
              <p className="text-gray-600 text-center mb-4">
                Take some quizzes to see your results here
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="w-full">
            <ResultTable results={results} />
          </div>
        )}
      </main>
    </div>
  );
}
