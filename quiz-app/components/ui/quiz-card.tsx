import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar } from "lucide-react";
import type { QuizResponse } from "@/lib/types";
import Link from "next/link";

interface QuizCardProps {
  quiz: QuizResponse;
}

export function QuizCard({ quiz }: QuizCardProps) {
  return (
    <Card className="w-full max-w-md  cursor-pointer dark:hover:border-zinc-700  mx-auto hover:border-zinc-300 transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{quiz.quiz.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {quiz.questions.length} questions
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          {quiz.document && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Created {new Date(quiz.document.createdAt).toLocaleDateString()}
            </div>
          )}
          <Link href={`/dashboard/quizzes/${quiz.quiz.id}`}>
            <Button
              className=" bg-blue-900 hover:bg-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800"
              size="sm"
            >
              Take Quiz
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
