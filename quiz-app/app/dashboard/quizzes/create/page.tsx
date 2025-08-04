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
import { useAuthStore } from "@/store/auth";
import api from "@/lib/api";
import type { Question, Quiz, QuizResponse } from "@/lib/types";
import Link from "next/link";

interface CreateQuizForm {
  title: string;
  query: string;
  files: FileList;
}

export default function CreateQuizPage() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateQuizForm>();
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
        Array.from(data.files).forEach((file) => {
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
                <Link href={`/quizzes/${success.id}`}>
                  <Button variant={"secondary"}>Take Quiz Now</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline" className="hover:bg-zinc-100 dark:hover:bg-zinc-800">Back to Dashboard</Button>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Quiz</CardTitle>
            <CardDescription>
              Upload documents and create a quiz based on the content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  className="focus-visible:border-zinc-400 focus-visible:ring-transparent"
                  placeholder="Enter quiz title"
                  {...register("title", {
                    required: "Title is required",
                    minLength: {
                      value: 3,
                      message: "Title must be at least 3 characters",
                    },
                  })}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="query">Quiz Description/Query</Label>
                <Textarea
                  id="query"
                  className="focus-visible:border-zinc-400 focus-visible:ring-transparent"
                  placeholder="Describe what the quiz should focus on..."
                  rows={4}
                  {...register("query", {
                    required: "Description is required",
                    minLength: {
                      value: 10,
                      message: "Description must be at least 10 characters",
                    },
                  })}
                />
                {errors.query && (
                  <p className="text-sm text-destructive">
                    {errors.query.message}
                  </p>
                )}
              </div>

              <div className="space-y-2 relative  ">
                <Label htmlFor="files">Upload Documents (Optional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-zinc-400  cursor-pointer dark:hover:border-zinc-500 dark:border-zinc-600">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4">
                      <Label htmlFor="files" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Upload files or drag and drop
                        </span>
                        <span className="mt-1 block text-sm dark:text-zinc-300 text-gray-600">
                          pdf, text, csv files up to 10MB each
                        </span>
                      </Label>
                      <Input
                        id="files"
                        type="file"
                        multiple
                        accept=".pdf,.txt,.csv"
                        className="w-full h-full left-0 top-8 absolute opacity-0 cursor-pointer"
                        {...register("files")}
                      />
                    </div>
                  </div>
                </div>
                {files && files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected files:</p>
                    <ul className="mt-1 text-sm text-gray-900">
                      {Array.from(files).map((file, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {file.name} ({Math.round(file.size / 1024)}KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="dark:bg-white dark:hover:bg-zinc-200 dark:text-black text-white bg-zinc-900 hover:bg-zinc-800"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating Quiz...
                    </>
                  ) : (
                    "Create Quiz"
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
