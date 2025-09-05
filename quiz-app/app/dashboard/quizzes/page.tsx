"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth, useUser } from "@clerk/nextjs";

import { Plus, BookOpen } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { QuizTable } from "@/components/ui/quiz-card";
import api from "@/lib/api";
import type { QuizWithQuestions, Result } from "@/lib/types";
import {
  renderEmptyState,
  renderErrorState,
  renderSkeletons,
} from "@/components/loader/Skeleton";

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizWithQuestions[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      fetchData();
    }
  }, [isLoaded, user]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [quizzesRes] = await Promise.all([
        api.get<QuizWithQuestions[]>("/quizzes", { withCredentials: true }),
      ]);

      setQuizzes(quizzesRes.data);
    } catch (err) {
      console.error("Error loading quizzes:", err);
      setError("Failed to load quizzes. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white max-w-5xl mx-auto container px-4 sm:px-6 lg:px-8 py-8 dark:bg-zinc-900 flex flex-col items-center ">
      <div className="flex mb-6">
        <div>
          <h2 className="text-xl font-semibold dark:text-white">
            Your Quizzes
          </h2>
          <p className="text-gray-600 dark:text-zinc-400">
            Manage and view your created quizzes
          </p>
        </div>
      </div>

      {loading && renderSkeletons()}

      {!loading && error && renderErrorState(error)}

      {!loading && !error && quizzes.length === 0 && renderEmptyState()}

      {!loading && !error && quizzes.length > 0 && (
        <div className="flex  justify-center">
          <div className="w-full">
            <QuizTable quizzes={quizzes} />
          </div>
        </div>
      )}
    </div>
  );
}
