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
import { QuizResponse, QuizWithQuestions } from "@/lib/types";
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
  quizzes: QuizWithQuestions[];
}

export function QuizTable({ quizzes }: QuizTableProps) {
  const [search, setSearch] = useState("");
  const [minQuestions, setMinQuestions] = useState("0");
  const [sortDesc, setSortDesc] = useState(true);
  console.log(quizzes);
  const filteredQuizzes = useMemo(() => {
    return quizzes
      .filter((quiz) => {
        const matchesTitle = quiz.title
          .toLowerCase()
          .includes(search.toLowerCase());
        const hasMinQuestions = quiz.questions.length >= parseInt(minQuestions);
        return matchesTitle && hasMinQuestions;
      })
      .sort((a, b) => {
        const dateA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortDesc ? dateB - dateA : dateA - dateB;
      });
  }, [quizzes, search, minQuestions, sortDesc]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-row sm:justify-center   gap-4">
        <div className="max-w-md pb-10">
          <Label htmlFor="search mb-10 bg-white">Search by title</Label>
          <div className="relative mt-2">
            <SearchNormal className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search quizzes..."
              className="pl-8 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-zinc-300  dark:focus-visible:border-zinc-700"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="w-48 gap-y-10">
          <Label>Min Questions</Label>
          <div className="mt-2">
            <Select value={minQuestions} onValueChange={setMinQuestions}>
              <SelectTrigger className="focus:ring-0 focus:ring-offset-0  ">
                <SelectValue placeholder="Min Questions" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem value="0">Any</SelectItem>
                <SelectItem value="5">5+</SelectItem>
                <SelectItem value="10">10+</SelectItem>
                <SelectItem value="15">15+</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
                const createdDate = quiz?.createdAt
                  ? new Date(quiz.createdAt).toLocaleDateString()
                  : "Date not specified";

                const attempted = quiz.submitted;

                return (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium py-3">
                      {quiz.title}
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
                            ? `/dashboard/results/${quiz.resultId}` //result id here
                            : `/dashboard/quizzes/${quiz.id}`
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
            const createdDate = quiz?.createdAt
              ? new Date(quiz.createdAt).toLocaleDateString()
              : "Date not specified";

            const attempted = quiz.submitted;
            return (
              <div
                key={quiz.id}
                className="rounded-xl border px-4 py-4 shadow-sm bg-background hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
              >
                <div className="font-semibold text-base">{quiz.title}</div>
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
                  <Link href={`/dashboard/quizzes/${quiz.id}`}>
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
