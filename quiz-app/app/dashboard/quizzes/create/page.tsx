"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, FileText, Loader2 } from "lucide-react";
import api from "@/lib/api";
import type { Question, Quiz, QuizResponse } from "@/lib/types";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod"
import { createQuizSchema } from "@/utils/schema"
import type { CreateQuizForm } from "@/utils/schema"

export default function CreateQuizPage() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateQuizForm>(
    {
      resolver: zodResolver(createQuizSchema),
      defaultValues: {
        title: "",
        query: "",
        files: [],
      },
    }
  );
  const files = watch("files");
  const inputRef = register("files").ref;

  const onSubmit = async (data: CreateQuizForm) => {
    try {
      setError("");
      setIsLoading(true);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("query", data.query);

      if (data.files && data.files.length > 0) {
        Array.from(data.files as FileList).forEach((file: File) => {
          formData.append("files", file);
        });
      }

      const response = await api.post<{
        quiz: Quiz;
        questions: Question[];
      }>("/quizzes", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      const quiz = response.data.quiz;
      setSuccess(quiz);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    console.log(success);
    return (
      <div className=" bg-white dark:bg-zinc-900 py-8">
        <div className="max-w-2xl  container mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900   dark:text-white mb-2">
                Quiz Created Successfully!
              </h2>
              <p className="text-gray-600 text-center dark:text-zinc-400 mb-6">
                Your quiz "{success.title}" has been created
              </p>
              <div className="flex gap-4">
                <Link href={`/dashboard/quizzes/${success.id}`}>
                  <Button variant={"secondary"}>Take Quiz Now</Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card
          className="
    rounded-2xl border
    backdrop-blur-md 
    
    border-zinc-200/70 dark:border-white/10
    transition-colors
  "
        >
          <CardHeader>
            <CardTitle className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-400">
              Create New Quiz
            </CardTitle>
            <CardDescription className="text-zinc-600 dark:text-zinc-400">
              Upload documents and create a quiz based on the content
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-xl bg-red-100/70 dark:bg-red-900/30 border-red-300/50 dark:border-red-800/50"
                >
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  className="
            rounded-xl bg-white/60 dark:bg-zinc-800/40
            border border-zinc-300/60 dark:border-white/10
            focus-visible:ring-0 focus-visible:border-zinc-400 dark:focus-visible:border-zinc-600
            transition-colors
          "
                  placeholder="Enter quiz title"
                  {...register("title", { required: "Title is required" })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="query">Quiz Description/Query</Label>
                <Textarea
                  id="query"
                  className="
            rounded-xl bg-white/60 dark:bg-zinc-800/40
            border border-zinc-300/60 dark:border-white/10
            focus-visible:ring-0 focus-visible:border-zinc-400 dark:focus-visible:border-zinc-600
            transition-colors
          "
                  placeholder="Describe what the quiz should focus on..."
                  rows={4}
                  {...register("query", { required: "Description is required" })}
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="files">Upload Documents (Optional)</Label>
                <div
                  className="
            border-2 border-dashed
            border-zinc-300/60 dark:border-white/20
            rounded-xl p-6
            hover:border-zinc-400 dark:hover:border-zinc-500
            transition-colors
            bg-white/40 dark:bg-zinc-900/20
            backdrop-blur-sm
          "
                >
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-zinc-500 dark:text-zinc-400" />
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      Upload files or drag and drop
                    </p>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      PDF, TXT, or Markdown — up to 5MB each, max 3 files
                    </span>
                  </div>
                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md,.markdown"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    {...register("files")}
                  />
                </div>
              </div>

              {/* Button */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isLoading}
                  size="lg"
                  className="
            relative overflow-hidden
            rounded-xl px-6 py-3 font-semibold
            transition-all duration-300
            backdrop-blur-md
            border
            text-zinc-900 bg-white/50 border-zinc-300/50
            dark:text-white dark:bg-zinc-800/30 dark:border-white/10
            hover:bg-zinc-200/60 dark:hover:bg-white/[0.1]
            disabled:opacity-60 disabled:cursor-not-allowed
          "
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Creating Quiz...</span>
                    </>
                  ) : (
                    <span>Create Quiz</span>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
