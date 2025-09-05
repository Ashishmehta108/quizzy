import { AlertTriangle, BookOpen, Plus } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

// components/loader/Skeleton.tsx

export const renderSkeletons = () => (
  <div className="grid gap-6   w-full">
    {[...Array(6)].map((_, i) => (
      <Card
        key={i}
        className="overflow-hidden relative"
        aria-busy="true"
        aria-label="Loading content"
      >
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const renderEmptyState = () => (
  <Card
    className="max-w-md mx-auto py-12 px-8 text-center"
    role="region"
    aria-live="polite"
  >
    <BookOpen
      className="mx-auto mb-6 h-16 w-16 text-zinc-600 dark:text-zinc-300"
      aria-hidden="true"
    />
    <h3 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
      No quizzes created yet
    </h3>
    <p className="mb-6 text-zinc-600 dark:text-zinc-400">
      It looks like you haven’t created any quizzes. Get started by creating
      your first quiz!
    </p>
    <Link href="/dashboard/quizzes/create" passHref>
      <Button
        variant="default"
        className="inline-flex items-center justify-center bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-300 dark:hover:bg-zinc-400 text-white dark:text-zinc-900 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500"
        aria-label="Create Quiz"
      >
        <Plus className="mr-2 h-5 w-5" />
        Create Quiz
      </Button>
    </Link>
  </Card>
);

export const renderErrorState = (errorMessage: string) => (
  <Card
    className="max-w-lg mx-auto flex items-center space-x-4 rounded-md border border-red-300 bg-red-50 p-6 dark:border-red-700 dark:bg-red-900"
    role="alert"
    aria-live="assertive"
  >
    <AlertTriangle
      className="h-8 w-8 flex-shrink-0 text-red-600 dark:text-red-400"
      aria-hidden="true"
    />
    <p className="font-medium text-red-700 dark:text-red-300">{errorMessage}</p>
  </Card>
);
