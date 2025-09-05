"use client";

import { useEffect, useState } from "react";
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
import { Upload, FileText, Loader2, Globe } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import api from "@/lib/api";
import type { Question, Quiz } from "@/lib/types";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { createQuizSchema } from "@/utils/schema";
import type { CreateQuizForm } from "@/utils/schema";
import { useSocket } from "@/app/context/socket.context";
import StatusUpdates from "@/components/agent/animateUpdate";

export default function CreateQuizPage() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<Quiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [webSearch, setWebSearch] = useState(false);

  const { socket } = useSocket();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateQuizForm>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      title: "",
      query: "",
      files: [],
      description: "",
      websearch: false,
    },
  });

  const files = watch("files");

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { message: string; step: number }) => {
      setStatus(` ${data.message}`);
      setIsThinking(false);
    };
    socket.on("status", handler);
    return () => {
      socket.off("status", handler);
    };
  }, [socket]);

  const onSubmit = async (data: CreateQuizForm) => {
    try {
      setError("");
      setIsLoading(true);
      setIsThinking(true);
      setStatus(null);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("query", data.query);
      formData.append("description", data.description || "");
      formData.append("webSearch", String(webSearch));
      formData.append("socketId", socket?.id || "");

      if (data.files && data.files.length > 0) {
        Array.from(data.files).forEach((file) =>
          formData.append("files", file as File)
        );
      }

      const response = await api.post<{ quiz: Quiz; questions: Question[] }>(
        "/quizzes",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setSuccess(response.data.quiz);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-zinc-900 py-8">
        <div className="max-w-2xl container mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Quiz Created Successfully!
              </h2>
              <p className="text-gray-600 text-center dark:text-zinc-400 mb-6">
                Your quiz "{success.title}" has been created
              </p>
              <div className="flex gap-4">
                <Link href={`/dashboard/quizzes/${success.id}`}>
                  <Button variant="secondary">Take Quiz Now</Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="outline">Back to Dashboard</Button>
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
        <Card className="rounded-2xl border backdrop-blur-md border-zinc-200/70 dark:border-white/10 transition-colors">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              Create New Quiz
            </CardTitle>
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
                  {...register("title")}
                  placeholder="Enter quiz title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="query">Quiz Description/Query</Label>
                <Textarea
                  id="query"
                  {...register("query")}
                  placeholder="Describe what the quiz should focus on..."
                  rows={4}
                />
                {errors.query && (
                  <p className="text-red-500 text-sm">{errors.query.message}</p>
                )}
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="files">Upload Documents (Optional)</Label>
                <div className="border-2 border-dashed rounded-xl p-6 relative">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-zinc-500 dark:text-zinc-400" />
                    <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                      Upload files or drag and drop
                    </p>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      PDF, TXT, Markdown — up to 5MB each, max 3 files
                    </span>

                    {files && files.length > 0 && (
                      <div className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
                        Selected:{" "}
                        {Array.from(files as File[])
                          .map((f: File) => f.name)
                          .join(", ")}
                      </div>
                    )}

                    {errors.files && (
                      <p className="text-red-500 text-sm">
                        {errors.files?.message?.toString()}
                      </p>
                    )}
                  </div>

                  <Input
                    id="files"
                    type="file"
                    multiple
                    accept=".pdf,.txt,.md"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (!e.target.files) return;
                      setValue("files", e.target.files, {
                        shouldValidate: true,
                      });
                    }}
                  />
                </div>
              </div>

              {(isThinking || status) && (
                <div className="p-3 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800/30">
                  {isThinking && (
                    <p className="animate-pulse">🤔 Thinking...</p>
                  )}
                  {status && <StatusUpdates text={status} />}
                </div>
              )}

              <div className="space-y-2">
                <Label>Summary of Quiz</Label>
                <Textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Brief description..."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setWebSearch(!webSearch)}
                        className="p-2 rounded-full"
                      >
                        <Globe
                          className={`${
                            webSearch ? "text-blue-500" : "text-zinc-500"
                          }`}
                        />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {webSearch ? "Web Search Enabled" : "Enable Web Search"}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  )}
                  {isLoading ? "Creating Quiz..." : "Create Quiz"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
