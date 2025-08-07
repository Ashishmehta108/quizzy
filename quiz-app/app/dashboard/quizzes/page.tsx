"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, BookOpen, Trophy, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { QuizTable } from "@/components/ui/quiz-card";
import api from "@/lib/api";
import type { Quiz, QuizResponse, Result } from "@/lib/types";
import Link from "next/link";

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout, restoreSession, isLoading } = useAuthStore();
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
      const [quizzesRes] = await Promise.all([
        api.get<QuizResponse[]>("/quizzes"),
      ]);

      setQuizzes(quizzesRes.data);
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
    <div className="bg-white max-w-7xl mx-auto container px-4 sm:px-6 lg:px-8 py-8 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Your Quizzes</h2>
          <p className="text-gray-600 dark:text-zinc-400">
            Manage and view your created quizzes
          </p>
        </div>
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
      ) : quizzes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-zinc-400 mb-4" />
            <h3 className="text-lg font-medium dark:text-zinc-100 text-zinc-900 mb-2">
              No quizzes yet
            </h3>
            <p className="text-zinc-600 text-center mb-4 dark:text-zinc-400">
              Create your first quiz to get started
            </p>
            <Link href="/dashboard/quizzes/create">
              <Button className="dark:bg-white dark:text-neutral-800 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs dark:hover:bg-white/80">
                <Plus className="h-4 w-4 mr-2" />
                Create Quiz
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-center">
          <div className=" w-full">
            <QuizTable quizzes={quizzes} />
          </div>
        </div>
      )}
    </div>
  );
}
