/**
 * @layer page
 * @owner agent-4
 */
"use client";

import React from "react";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Users, ClipboardList, Target } from "lucide-react";
import dynamic from "next/dynamic";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const PerformanceChart = dynamic(() => import("@/components/dashboard/analytics/PerformanceChart"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-100 animate-pulse rounded-lg" />
});

const ScoreDistributionChart = dynamic(() => import("@/components/dashboard/analytics/ScoreDistributionChart"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-zinc-100 animate-pulse rounded-lg" />
});

export default function AnalyticsPage() {
  const { activeWorkspace } = useWorkspaceContext();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", activeWorkspace?.id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:5000/api/analytics/overview`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
        withCredentials: true,
      });
      return data.data;
    },
    enabled: !!activeWorkspace?.id,
  });

  const mockData = [
    { name: "Quiz 1", avg: 65 },
    { name: "Quiz 2", avg: 78 },
    { name: "Quiz 3", avg: 45 },
    { name: "Quiz 4", avg: 92 },
    { name: "Quiz 5", avg: 70 },
  ];

  if (isLoading) return <div className="p-8">Analyzing patterns...</div>;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Analytics & Insights</h1>
        <p className="text-sm sm:text-base text-zinc-500">Monitor student performance and engagement across the workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Attempts", value: "124", icon: Target, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Avg. Score", value: "72%", icon: TrendingUp, color: "text-green-600", bg: "bg-green-50" },
          { label: "Active Students", value: "48", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
          { label: "Assignments", value: "12", icon: ClipboardList, color: "text-orange-600", bg: "bg-orange-50" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-zinc-500">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Average scores across recent assessments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <PerformanceChart data={mockData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Frequency of scores in 20% intervals</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ScoreDistributionChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
