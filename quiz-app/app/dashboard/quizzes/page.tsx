"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth, useUser } from "@clerk/nextjs";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuizTable } from "@/components/ui/quiz-card";
import api from "@/lib/api";
import type { QuizWithQuestions } from "@/lib/types";
import {
  renderErrorState,
  renderSkeletons,
} from "@/components/loader/Skeleton";
import EmptyState from "@/components/Empty";
import { Add, ArchiveBook } from "iconsax-reactjs";

export default function DashboardPage() {
  const [quizzes, setQuizzes] = useState<QuizWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resultIds, setResultIds] = useState<string[]>([]);
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

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 max-w-5xl mx-auto container px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold dark:text-white">Your Quizzes</h2>
        <p className="text-gray-600 dark:text-zinc-400">
          Manage and view your created quizzes
        </p>
      </div>

      {loading && renderSkeletons()}

      {!loading && error && renderErrorState(error)}

      {!loading && !error && quizzes.length === 0 && (
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
      )}

      {!loading && !error && quizzes.length > 0 && (
        <div className="w-full">
          <QuizTable quizzes={quizzes} />
        </div>
      )}
    </div>
  );
}
