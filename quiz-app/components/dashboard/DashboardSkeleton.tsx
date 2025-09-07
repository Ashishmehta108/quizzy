"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900">
      <main className="max-w-7xl container mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8 space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl"
            >
              <CardContent className="p-6 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl">
          <CardContent className="p-6 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-[200px] w-full rounded-lg" />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Skeleton className="h-12 w-full max-w-md mx-auto rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card
                key={i}
                className="bg-white dark:bg-zinc-900 shadow-sm rounded-2xl"
              >
                <CardContent className="p-6 space-y-4">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-40 w-full rounded-lg" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
