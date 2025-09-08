"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useUsageData } from "@/hooks/useUtility";

export default function UsageWidget() {
  const { data, isLoading, isError } = useUsageData();

  if (isLoading) return <Card className="h-48" />;
  if (isError || !data) return <p>Error loading usage data</p>;

  const { usage, plan, billing } = data;

  const webSearchPct = Math.round(
    (usage.websearchesUsed / plan.monthlyLimit.websearches) * 100
  );
  const quizPct = Math.round(
    (usage.quizzesGeneratedUsed / plan.monthlyLimit.quizzesGenerated) * 100
  );

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Usage</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex items-center gap-3">
            <span className="text-md font-medium shrink-0">
              Web {usage.websearchesUsed}/{plan.monthlyLimit.websearches}
            </span>
            <Progress value={webSearchPct} className="flex-1 h-2" />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-md font-medium shrink-0">
              Quizzes {usage.quizzesGeneratedUsed}/
              {plan.monthlyLimit.quizzesGenerated}
            </span>
            <Progress value={quizPct} className="flex-1 h-2" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Plan: {plan.name} ({billing.status}) | Period:{" "}
          {usage.periodStart
            ? new Date(usage.periodStart).toLocaleDateString()
            : "N/A"}{" "}
          -{" "}
          {usage.periodEnd
            ? new Date(usage.periodEnd).toLocaleDateString()
            : "N/A"}
        </p>
      </CardContent>
    </Card>
  );
}
