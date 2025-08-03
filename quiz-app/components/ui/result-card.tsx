import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Calendar } from "lucide-react";
import type { Result } from "@/lib/types";
import Link from "next/link";

interface ResultCardProps {
  result: Result;
}

export function ResultCard({ result }: ResultCardProps) {
  const scorePercentage = Math.round(
    (result.score / Object.keys(result.optionsReview).length) * 100
  );

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {result.quiz?.title || "Quiz"}
            </CardTitle>
            <CardDescription className="flex dark:text-zinc-400 items-center gap-2">
              <Trophy className="h-4 w-4" />
              Score: {result.score}/{Object.keys(result.optionsReview).length}
            </CardDescription>
          </div>
          <Badge className={`text-white ${getScoreColor(scorePercentage)}`}>
            {scorePercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-5 justify-between">
          <div className="flex items-center gap-2 text-sm  text-zinc-400">
            <Calendar className="h-4 w-4" />
            Completed recently
          </div>
          <Link href={`/dashboard/results/${result.id}`}>
            <Button
              className="dark:bg-blue-900 dark:hover:bg-blue-800  dark:text-zinc-100"
              variant="outline"
              size="sm"
            >
              View Details
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
