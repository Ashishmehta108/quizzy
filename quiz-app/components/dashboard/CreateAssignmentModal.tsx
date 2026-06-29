"use client";

import * as React from "react";
import axios from "axios";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon, Loading03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { BACKEND_URL } from "@/lib/constants";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface QuizOption {
  id: string;
  title: string;
}

const fieldLabel =
  "text-xs font-medium text-neutral-500 dark:text-neutral-400";
const fieldClass = cn(
  "h-9 text-sm rounded-md",
  "border-neutral-200 dark:border-neutral-700",
  "bg-neutral-50 dark:bg-neutral-800/50",
  "text-neutral-900 dark:text-neutral-100",
  "placeholder:text-neutral-300 dark:placeholder:text-neutral-600",
  "focus-visible:ring-1 focus-visible:ring-[#1B2B4B]/30 focus-visible:border-[#1B2B4B]/40",
  "dark:focus-visible:ring-neutral-500 dark:focus-visible:border-neutral-600"
);

export default function CreateAssignmentModal() {
  const { activeWorkspace } = useWorkspaceContext();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);

  const [title, setTitle] = React.useState("");
  const [quizId, setQuizId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [maxAttempts, setMaxAttempts] = React.useState("1");
  const [timeLimit, setTimeLimit] = React.useState("");

  const reset = () => {
    setTitle("");
    setQuizId("");
    setDescription("");
    setDueDate("");
    setMaxAttempts("1");
    setTimeLimit("");
  };

  const { data: quizzes, isLoading: quizzesLoading } = useQuery<QuizOption[]>({
    queryKey: ["quizzes-for-assignment"],
    queryFn: async () => {
      const { data } = await axios.get(`${BACKEND_URL}/quizzes`, {
        withCredentials: true,
      });
      return Array.isArray(data) ? data : (data?.data ?? []);
    },
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `${BACKEND_URL}/assignments`,
        {
          title: title.trim(),
          quizId,
          description: description.trim() || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          maxAttempts: Number(maxAttempts) || 1,
          timeLimitMinutes: timeLimit ? Number(timeLimit) : undefined,
        },
        {
          headers: { "x-workspace-id": activeWorkspace?.id },
          withCredentials: true,
        }
      );
      return data;
    },
    onSuccess: () => {
      toast.success("Assignment created");
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      reset();
      setOpen(false);
    },
    onError: (err: unknown) => {
      const e = err as {
        response?: { data?: { error?: string; message?: string } };
      };
      toast.error(
        e.response?.data?.error ||
          e.response?.data?.message ||
          "Failed to create assignment"
      );
    },
  });

  const canSubmit = title.trim().length > 0 && quizId.length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2 h-9 bg-[#1B2B4B] hover:bg-[#162240] text-white">
          <HugeiconsIcon icon={PlusSignIcon} size={16} />
          Create Assignment
        </Button>
      </DialogTrigger>

      <DialogContent
        className={cn(
          "w-[92%] sm:max-w-[440px] rounded-xl p-5 gap-0",
          "border border-neutral-200 dark:border-neutral-800",
          "bg-white dark:bg-neutral-900"
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) createMutation.mutate();
          }}
          className="flex flex-col gap-5"
        >
          <DialogHeader className="gap-1">
            <DialogTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              New assignment
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
              Assign a quiz to your cohort and share a join link.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3.5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-title" className={fieldLabel}>
                Title
              </Label>
              <Input
                id="assignment-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4 Assessment"
                className={fieldClass}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label className={fieldLabel}>Quiz</Label>
              <Select value={quizId} onValueChange={setQuizId}>
                <SelectTrigger className={fieldClass}>
                  <SelectValue
                    placeholder={
                      quizzesLoading ? "Loading quizzes…" : "Select a quiz"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {quizzes?.length ? (
                    quizzes.map((q) => (
                      <SelectItem key={q.id} value={q.id} className="text-sm">
                        {q.title}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-2 py-3 text-xs text-neutral-400 text-center">
                      {quizzesLoading ? "Loading…" : "No quizzes yet"}
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-desc" className={fieldLabel}>
                Description{" "}
                <span className="text-neutral-300 dark:text-neutral-600">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="assignment-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add instructions for students…"
                className={cn(fieldClass, "h-auto min-h-[64px] py-2 resize-none")}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignment-due" className={fieldLabel}>
                  Due date
                </Label>
                <Input
                  id="assignment-due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={fieldClass}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="assignment-time" className={fieldLabel}>
                  Time limit (min)
                </Label>
                <Input
                  id="assignment-time"
                  type="number"
                  min={1}
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  placeholder="None"
                  className={fieldClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="assignment-attempts" className={fieldLabel}>
                Max attempts
              </Label>
              <Input
                id="assignment-attempts"
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(e.target.value)}
                className={fieldClass}
              />
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-2 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="flex-1 h-9 rounded-md text-xs font-normal text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit || createMutation.isPending}
              className="flex-1 h-9 rounded-md text-xs font-medium bg-[#1B2B4B] hover:bg-[#162240] text-white disabled:opacity-40 disabled:cursor-not-allowed gap-1.5"
            >
              {createMutation.isPending && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={14}
                  className="animate-spin"
                />
              )}
              {createMutation.isPending ? "Creating…" : "Create assignment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
