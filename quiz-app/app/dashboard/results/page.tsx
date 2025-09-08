"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import ResultTable from "@/components/ui/result-card";
import api from "@/lib/api";
import type { Result } from "@/lib/types";
import {
  renderErrorState,
  renderSkeletons,
} from "@/components/loader/Skeleton";
import EmptyState from "@/components/Empty";
import { Notepad2 } from "iconsax-reactjs";

export default function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isLoaded } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isLoaded && user) {
      fetchResults();
    }
  }, [isLoaded, user]);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<{ data: Result[] }>("/results", {
        withCredentials: true,
      });
      setResults(response.data.data);
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to load results. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-zinc-900 max-w-5xl mx-auto container px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold dark:text-white">Your Results</h2>
        <p className="text-gray-600 dark:text-zinc-400">
          View your quiz performance and scores
        </p>
      </div>

      {loading && renderSkeletons()}

      {!loading && error && renderErrorState(error)}

      {!loading && !error && results.length === 0 && (
        <EmptyState
          icon={Notepad2}
          title="No results yet"
          description="Take some quizzes to see your results here."
          action={null}
        />
      )}

      {!loading && !error && results.length > 0 && (
        <div className="w-full">
          <ResultTable results={results} />
        </div>
      )}
    </div>
  );
}
