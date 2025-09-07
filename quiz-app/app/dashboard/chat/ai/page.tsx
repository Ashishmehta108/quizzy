"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import type { Quiz } from "@/lib/types";

export default function ChatAIPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const res = await api.get("/quizzes");
        setQuizzes(res.data);
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Select a Quiz to Chat with AI</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="animate-spin w-6 h-6" />
              </div>
            ) : quizzes.length === 0 ? (
              <p className="text-center text-zinc-600 dark:text-zinc-400">
                No quizzes available.
              </p>
            ) : (
              <ul className="space-y-3">
                {quizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <Link
                      href={`/dashboard/chat/ai/${quiz.id}`}
                      className="block p-4 border rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                    >
                      <h3 className="font-medium">{quiz.title}</h3>
                      <p className="text-sm text-zinc-500">
                        {quiz.description || "No description"}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
