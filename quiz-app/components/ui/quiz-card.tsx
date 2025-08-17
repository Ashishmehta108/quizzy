"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calendar,
  FileText,
  Search,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  CheckCircle,
  XCircle,
  CheckCircle2,
} from "lucide-react";
import { QuizResponse } from "@/lib/types";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SearchNormal } from "iconsax-reactjs";

interface QuizTableProps {
  quizzes: QuizResponse[];
}

export function QuizTable({ quizzes }: QuizTableProps) {
  const [search, setSearch] = useState("");
  const [minQuestions, setMinQuestions] = useState("0");
  const [sortDesc, setSortDesc] = useState(true);

  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter((quiz) => {
        const matchesTitle = quiz.quiz.title
          .toLowerCase()
          .includes(search.toLowerCase());
        const hasMinQuestions = quiz.questions.length >= parseInt(minQuestions);
        return matchesTitle && hasMinQuestions;
      })
      .sort((a, b) => {
        const dateA = a.quiz?.createdAt
          ? new Date(a.quiz.createdAt).getTime()
          : 0;
        const dateB = b.quiz?.createdAt
          ? new Date(b.quiz.createdAt).getTime()
          : 0;
        return sortDesc ? dateB - dateA : dateA - dateB;
      });
  }, [quizzes, search, minQuestions, sortDesc]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-row items-stretch items-end  gap-4">
        <div className="max-w-md">
          <Label htmlFor="search">Search by title</Label>
          <div className="relative">
            <SearchNormal className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search quizzes..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="w-48">
          <Label>Min Questions</Label>
          <Select value={minQuestions} onValueChange={setMinQuestions}>
            <SelectTrigger>
              <SelectValue placeholder="Min Questions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Any</SelectItem>
              <SelectItem value="5">5+</SelectItem>
              <SelectItem value="10">10+</SelectItem>
              <SelectItem value="15">15+</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Title</TableHead>
              <TableHead className="w-[150px]">Questions</TableHead>
              <TableHead className="w-[180px]">
                <div
                  onClick={() => setSortDesc((prev) => !prev)}
                  className="flex items-center gap-1 cursor-pointer select-none"
                >
                  Created
                  {sortDesc ? (
                    <ArrowDownWideNarrow className="h-4 w-4" />
                  ) : (
                    <ArrowUpWideNarrow className="h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[150px]">Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuizzes.length > 0 ? (
              filteredQuizzes.map((quiz, index) => {
                const createdDate = quiz.quiz?.createdAt
                  ? new Date(quiz.quiz.createdAt).toLocaleDateString()
                  : "Date not specified";

                const attempted = quiz.quiz.submitted;

                return (
                  <TableRow key={quiz.quiz.id}>
                    <TableCell className="font-medium py-3">
                      {quiz.quiz.title}
                    </TableCell>
                    <TableCell className="py-3">
                      {quiz.questions.length}{" "}
                      <span className="text-muted-foreground">questions</span>
                    </TableCell>
                    <TableCell className="py-3">{createdDate}</TableCell>
                    <TableCell className="py-3 flex items-center gap-2">
                      {attempted ? (
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="text-white fill-green-500 w-4 h-4" />
                          <span>Attempted</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <XCircle className="text-white fill-red-500 w-4 h-4" />
                          <span>Not Attempted</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right py-3">
                      <Link
                        href={
                          attempted
                            ? `/dashboard/results/${quiz.result?.id}`
                            : `/dashboard/quizzes/${quiz.quiz.id}`
                        }
                      >
                        <Button
                          className="bg-blue-900 hover:bg-blue-800 text-white "
                          size="sm"
                        >
                          {attempted ? "View Result" : "Take Quiz"}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground py-6"
                >
                  No quizzes found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden max-w-sm mx-auto space-y-4">
        {filteredQuizzes.length > 0 ? (
          filteredQuizzes.map((quiz) => {
            const createdDate = quiz.quiz?.createdAt
              ? new Date(quiz.quiz.createdAt).toLocaleDateString()
              : "Date not specified";

            const attempted = quiz.quiz.submitted;
            return (
              <div
                key={quiz.quiz.id}
                className="rounded-xl border px-4 py-4 shadow-sm bg-background hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="font-semibold text-base">{quiz.quiz.title}</div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {quiz.questions.length} questions
                </div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {createdDate}
                </div>
                <div className="text-sm mt-1 flex items-center gap-1">
                  {attempted ? (
                    <>
                      <CheckCircle2 className="text-white fill-green-500 w-5 h-5" />
                      <span>Result</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-white fill-red-500 w-4 h-4" />
                      <span>Not Attempted</span>
                    </>
                  )}
                </div>
                <div className="mt-3">
                  <Link href={`/dashboard/quizzes/${quiz.quiz.id}`}>
                    <Button
                      size="sm"
                      className="p-3 bg-blue-900 hover:bg-blue-800 dark:bg-blue-900 dark:hover:bg-blue-800"
                    >
                      {attempted ? "View Result" : "Take Quiz"}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-muted-foreground pt-4">
            No quizzes found
          </div>
        )}
      </div>
    </div>
  );
}
