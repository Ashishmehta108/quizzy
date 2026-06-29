/**
 * @layer page
 * @owner agent-4
 */
"use client";

import React from "react";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Analytics01Icon,
  Target02Icon,
  TradeUpIcon,
  UserMultipleIcon,
  ClipboardListIcon,
} from "@hugeicons/core-free-icons";
import dynamic from "next/dynamic";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "@/lib/constants";

const PerformanceChart = dynamic(
  () => import("@/components/dashboard/analytics/PerformanceChart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-lg" />,
  }
);

const ScoreDistributionChart = dynamic(
  () => import("@/components/dashboard/analytics/ScoreDistributionChart"),
  {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full rounded-lg" />,
  }
);

const STATS = [
  { label: "Total Attempts", value: "124", icon: Target02Icon },
  { label: "Avg. Score", value: "72%", icon: TradeUpIcon },
  { label: "Active Students", value: "48", icon: UserMultipleIcon },
  { label: "Assignments", value: "12", icon: ClipboardListIcon },
];

export default function AnalyticsPage() {
  const { activeWorkspace } = useWorkspaceContext();

  const { isLoading } = useQuery({
    queryKey: ["analytics", activeWorkspace?.id],
    queryFn: async () => {
      const { data } = await axios.get(`${BACKEND_URL}/analytics/overview`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
        withCredentials: true,
      });
      return data.data;
    },
    enabled: !!activeWorkspace?.id,
    retry: false,
  });

  const mockData = [
    { name: "Quiz 1", avg: 65 },
    { name: "Quiz 2", avg: 78 },
    { name: "Quiz 3", avg: 45 },
    { name: "Quiz 4", avg: 92 },
    { name: "Quiz 5", avg: 70 },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#111113]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="space-y-1 pb-6 border-b border-neutral-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-1.5 mb-2">
            <HugeiconsIcon
              icon={Analytics01Icon}
              size={14}
              className="text-neutral-400 dark:text-zinc-500"
            />
            <span className="text-[11px] uppercase tracking-widest font-medium text-neutral-400 dark:text-zinc-500">
              Insights
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100">
            Analytics
          </h1>
          <p className="text-sm text-neutral-500 dark:text-zinc-400">
            Monitor student performance and engagement across the workspace.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[92px] rounded-xl" />
              ))
            : STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-neutral-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 p-5 flex items-start justify-between gap-3"
                >
                  <div>
                    <p className="text-xs font-medium text-neutral-400 dark:text-zinc-500 tracking-wide uppercase">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-semibold text-neutral-900 dark:text-zinc-100 mt-2 tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <span className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
                    <HugeiconsIcon
                      icon={stat.icon}
                      size={15}
                      className="text-indigo-500 dark:text-indigo-400"
                    />
                  </span>
                </div>
              ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="rounded-2xl border border-neutral-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-zinc-100">
                Performance Trends
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400 dark:text-zinc-500">
                Average scores across recent assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] p-5 pt-2">
              <PerformanceChart data={mockData} />
            </CardContent>
          </Card>

          <Card className="rounded-2xl border border-neutral-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-sm font-semibold text-neutral-900 dark:text-zinc-100">
                Score Distribution
              </CardTitle>
              <CardDescription className="text-xs text-neutral-400 dark:text-zinc-500">
                Frequency of scores in 20% intervals
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] p-5 pt-2">
              <ScoreDistributionChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
