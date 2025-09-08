"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  CheckCircle2,
  X,
  Info,
  XCircle,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useUser, useAuth } from "@clerk/nextjs";
import { ArchiveBook } from "iconsax-reactjs";

import { MarkdownRenderer } from "@/components/quiz-render/MarkdownRender";

interface RawAnswer {
  question?: string;
  selected?: number[] | number;
  correct?: number;
  options?: string[];
  explanation?: string;
  createdAt?: string;
  submittedAt?: string;
  questionId?: string;
}

interface QuizAnswer {
  questionId: string;
  question: string;
  selectedOptions: number[]; // 0-based
  options: string[];
  correctOption: number; // 0-based
  explanation?: string;
  createdAt?: string;
  submittedAt?: string;
}

interface QuizResult {
  score: number;
  percentage: string | number;
  totalQuestions: number;
  selectedAnswers: QuizAnswer[];
}

export default function ResultViewPage(): React.JSX.Element | null {
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const { id } = useParams();

  useEffect(() => {
    const initializePage = async () => {
      if (isLoaded) {
        await fetchResult();
      }
    };
    initializePage();
  }, [user, isLoaded, id]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const response = await api.get<any>(`/results/${id}`, {
        withCredentials: true,
      });

      const payload = response.data?.result;
      const normalized = normalizeBackendResult(payload);
      setResult(normalized);
    } catch (err: any) {
      console.error("Error fetching result:", err);
      setError(
        err?.response?.data?.message ??
          err?.message ??
          "Something went wrong while fetching the result"
      );
    } finally {
      setLoading(false);
    }
  };

  const normalizeBackendResult = (raw: any): QuizResult => {
    if (!raw) {
      return {
        score: 0,
        percentage: "0",
        totalQuestions: 0,
        selectedAnswers: [],
      };
    }

    const rawAnswers: RawAnswer[] = raw.selectedAnswers ?? [];

    const flattenedSelected = rawAnswers.flatMap((a) =>
      Array.isArray(a.selected)
        ? a.selected
        : a.selected !== undefined
        ? [a.selected]
        : []
    );
    const hasZero = flattenedSelected.some((v) => v === 0);
    const hasPositiveOnly =
      flattenedSelected.length > 0 && flattenedSelected.every((v) => v >= 1);

    const needsIndexShift = !hasZero && hasPositiveOnly;

    const transformed: QuizAnswer[] = rawAnswers.map((a, idx) => {
      const selArrRaw = Array.isArray(a.selected)
        ? a.selected
        : a.selected !== undefined
        ? [a.selected]
        : [];

      const selectedOptions = selArrRaw.map((s) =>
        typeof s === "number" ? (needsIndexShift ? s - 1 : s) : Number(s)
      );

      const correctRaw = a.correct ?? -1;
      const correctOption =
        typeof correctRaw === "number"
          ? needsIndexShift
            ? correctRaw - 1
            : correctRaw
          : Number(correctRaw);

      const cleanOptions = (a.options ?? []).map((opt) =>
        typeof opt === "string" ? opt.replace(/`/g, "").trim() : String(opt)
      );

      return {
        questionId: a.questionId ?? `q_${idx}`,
        question: a.question ?? "Untitled question",
        selectedOptions,
        options: cleanOptions,
        correctOption,
        explanation: a.explanation,
        createdAt: a.createdAt,
        submittedAt: a.submittedAt,
      };
    });

    const score =
      typeof raw.score === "number"
        ? raw.score
        : transformed.filter((t) => t.selectedOptions.includes(t.correctOption))
            .length;
    const totalQuestions =
      typeof raw.totalQuestions === "number"
        ? raw.totalQuestions
        : transformed.length;
    const percentage =
      raw.percentage !== undefined
        ? raw.percentage
        : ((score / Math.max(1, totalQuestions)) * 100).toFixed(2);

    return {
      score,
      percentage: String(percentage),
      totalQuestions,
      selectedAnswers: transformed,
    };
  };

  const isAnswerCorrect = (selectedOptions: number[], correctOption: number) =>
    selectedOptions.includes(correctOption);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
            <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
            <div className="h-64 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <Alert className="border-zinc-200 dark:border-zinc-800">
            <X className="h-4 w-4" />
            <AlertDescription>{error || "Result not found"}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const scorePercentage = Number.parseFloat(String(result.percentage));

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 relative overflow-hidden">
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <header className="mb-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Quiz Complete
              </h1>
            </div>
            <div className="text-right">
              <Badge className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                {result.totalQuestions} Questions
              </Badge>
            </div>
          </div>
        </header>

        <Card className="mb-8 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between gap-6">
              <div>
                <CardTitle className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {scorePercentage.toFixed(0)}%
                </CardTitle>
                <CardDescription className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  Overall Score
                </CardDescription>
              </div>
              <div className="min-w-[12rem]">
                <div className="flex items-center justify-end gap-4">
                  <div className="text-right">
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Correct
                    </div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {result.score}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-zinc-600 dark:text-zinc-400">
                      Total
                    </div>
                    <div className="font-medium text-zinc-900 dark:text-zinc-100">
                      {result.totalQuestions}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                <span>Performance</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {scorePercentage}%
                </span>
              </div>
              <Progress
                value={Math.max(0, Math.min(100, scorePercentage))}
                className="h-3 bg-zinc-100 dark:bg-zinc-800"
              />
              <div className="grid grid-cols-2 mt-5 sm:grid-cols-4 gap-4 sm:gap-4 w-full max-w-md md:max-w-3xl  mx-auto">
                <div className="text-center p-2 sm:p-4  rounded-lg sm:rounded-xl border bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-blue-600 dark:text-blue-400" />
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    Total
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {result.totalQuestions}
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4  rounded-lg sm:rounded-xl border bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 fill-green-500 text-white" />
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    Correct
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {result.score}
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4  rounded-lg sm:rounded-xl border bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <XCircle className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 fill-red-500 text-white" />
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    Incorrect
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {result.totalQuestions - result.score}
                  </p>
                </div>
                <div className="text-center p-2 sm:p-4  rounded-lg sm:rounded-xl border bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-1 sm:mb-2 text-amber-600 dark:text-amber-400" />
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
                    Accuracy
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                    {scorePercentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Separator className="my-8" />

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArchiveBook className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
              <div>
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  Question Review
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Review your answers and explanations
                </p>
              </div>
            </div>
          </div>

          {result.selectedAnswers.map((ans, idx) => {
            const correct = isAnswerCorrect(
              ans.selectedOptions,
              ans.correctOption
            );
            return (
              <article
                key={ans.questionId}
                className="border border-zinc-200 dark:border-zinc-800 rounded-lg bg-white dark:bg-zinc-900 p-5"
              >
                <header className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge
                        className={`px-2 py-1 text-sm ${"bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"}`}
                      >
                        {correct ? (
                          <span className="inline-flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 fill-green-500 text-white" />{" "}
                            Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center  gap-2">
                            <XCircle className="h-4 w-4 fill-red-500 text-white" />{" "}
                            Incorrect
                          </span>
                        )}
                      </Badge>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">
                        Question {idx + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                      <MarkdownRenderer>{ans.question}</MarkdownRenderer>
                    </h3>
                  </div>
                </header>

                <div className="space-y-3">
                  {ans.options.map((opt, oi) => {
                    const isSelected = ans.selectedOptions.includes(oi);
                    const isCorrectOption = ans.correctOption === oi;

                    let base = "rounded-lg p-3 border ";
                    let border = "border-zinc-200 dark:border-zinc-800";
                    let bg = "bg-zinc-50 dark:bg-zinc-900";

                    if (isCorrectOption) {
                      border = "border-zinc-300 dark:border-zinc-600";
                      bg = "bg-zinc-100 dark:bg-zinc-800";
                    } else if (isSelected && !isCorrectOption) {
                      border = "border-zinc-200 dark:border-zinc-700";
                      bg = "bg-zinc-50 dark:bg-zinc-900";
                    }

                    return (
                      <div
                        key={oi}
                        className={`${base} ${border} ${bg} flex lg:flex-row lg:item-center flex-col  justify-between gap-3`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-700 dark:text-zinc-200">
                            {String.fromCharCode(65 + oi)}
                          </div>
                          <div className="text-zinc-900 dark:text-zinc-100">
                            <MarkdownRenderer>{opt}</MarkdownRenderer>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <Badge className="text-xs bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border py-1  hover:bg-zinc-100 dark:hover:bg-zinc-800/70 border-zinc-200 dark:border-zinc-700">
                              Your Choice
                            </Badge>
                          )}
                          {isCorrectOption && (
                            <Badge className="text-xs bg-green-600 text-white">
                              Correct Answer
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4">
                  <Accordion type="single" collapsible>
                    <AccordionItem
                      value={`ex-${ans.questionId}`}
                      className="border-0"
                    >
                      <AccordionTrigger className="p-3 rounded-md bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                        <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300">
                          <Info className="h-4 w-4" />
                          <span className="font-medium">Explanation</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pt-3">
                        <Alert className="border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                          <Info className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                          <AlertDescription>
                            <div className="text-zinc-700 dark:text-zinc-300">
                              <MarkdownRenderer>
                                {ans.explanation ??
                                  (isAnswerCorrect(
                                    ans.selectedOptions,
                                    ans.correctOption
                                  )
                                    ? "Nice work — you selected the correct answer."
                                    : "No explanation provided. Review the correct answer above.")}
                              </MarkdownRenderer>
                            </div>
                          </AlertDescription>
                        </Alert>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
