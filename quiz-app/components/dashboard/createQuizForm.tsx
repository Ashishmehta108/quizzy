"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, Globe } from "lucide-react";
import api from "@/lib/api";
import type { Question, Quiz } from "@/lib/types";
import { createQuizSchema, type CreateQuizForm } from "@/utils/schema";
import { useSocket } from "@/app/context/socket.context";
import StatusUpdates from "@/components/agent/animateUpdate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function CreateQuizForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [webSearch, setWebSearch] = useState(false);
  const { socket } = useSocket();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateQuizForm>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: { title: "", query: "", files: [], description: "" },
  });

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { message: string; step: number }) => {
      setStatus(`${data.step}. ${data.message}`);
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
      formData.append("webSearch", String(webSearch));
      formData.append("description", data.description);
      console.log(socket?.id);
      formData.append("socketId", socket?.id!);
      if (data.files && data.files.length > 0) {
        Array.from(data.files as FileList).forEach((file) =>
          formData.append("files", file)
        );
      }

      await api.post<{ quiz: Quiz; questions: Question[] }>(
        "/quizzes",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create quiz");
    } finally {
      setIsLoading(false);
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh] overflow-y-auto p-4 space-y-4">
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
            placeholder="Enter quiz title"
            {...register("title")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="query">Quiz Description</Label>
          <Textarea
            id="query"
            placeholder="Describe your quiz..."
            rows={3}
            {...register("query")}
          />
        </div>

        <div className="space-y-2 relative">
          <Label htmlFor="files">Upload Documents (Optional)</Label>
          <div className="border-2 border-dashed border-zinc-300/60 dark:border-white/20 rounded-xl p-6 hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors bg-white/40 dark:bg-zinc-900/20 backdrop-blur-sm">
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
              className="absolute h-full inset-0 opacity-0 cursor-pointer"
              {...register("files")}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-zinc-700 dark:text-zinc-200">
            Summary of Quiz
          </Label>
          <Textarea
            className="rounded-md border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-600"
            placeholder="Briefly describe what the quiz is about..."
            rows={3}
            {...register("description")}
          />
        </div>

        {(isThinking || status) && (
          <div className="p-3 border rounded-lg text-sm bg-zinc-50 dark:bg-zinc-800/40">
            {isThinking && <p className="animate-pulse">🤔 Thinking...</p>}
            {status && <StatusUpdates text={status} />}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label>Agentic options</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => setWebSearch((prev) => !prev)}
                    className="p-2 rounded-full transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Globe
                      className={`h-5 w-5 transition-colors ${
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
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
              {isLoading ? "Creating Quiz..." : "Create Quiz"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
