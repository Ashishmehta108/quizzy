"use client";

import * as React from "react";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Loading03Icon,
  FileUploadIcon,
  File01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { BACKEND_URL } from "@/lib/constants";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const fieldLabel = "text-xs font-medium text-neutral-500 dark:text-neutral-400";

export default function AddContentModal({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const { activeWorkspace } = useWorkspaceContext();
  const queryClient = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle("");
    setFile(null);
    setDragging(false);
  };

  const pickFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const form = new FormData();
      form.append("file", file as File);
      if (title.trim()) form.append("title", title.trim());
      const { data } = await axios.post(`${BACKEND_URL}/library/upload`, form, {
        headers: {
          "x-workspace-id": activeWorkspace?.id,
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      return data;
    },
    onSuccess: () => {
      toast.success("Material uploaded");
      queryClient.invalidateQueries({ queryKey: ["library"] });
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
          "Upload failed"
      );
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="gap-2 h-9 bg-[#1B2B4B] hover:bg-[#162240] text-white">
            <HugeiconsIcon icon={PlusSignIcon} size={16} />
            Add Material
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className={cn(
          "w-[92%] sm:max-w-[420px] rounded-xl p-5 gap-0",
          "border border-neutral-200 dark:border-neutral-800",
          "bg-white dark:bg-neutral-900"
        )}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (file) uploadMutation.mutate();
          }}
          className="flex flex-col gap-5"
        >
          <DialogHeader className="gap-1">
            <DialogTitle className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Add material
            </DialogTitle>
            <DialogDescription className="text-xs text-neutral-400 dark:text-neutral-500 leading-relaxed">
              Upload a PDF, image, or text file to your content library.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-3.5">
            {/* Dropzone */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
              }
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className={cn(
                "rounded-lg border border-dashed flex flex-col items-center justify-center gap-2 py-7 px-4 text-center cursor-pointer transition-colors",
                dragging
                  ? "border-[#1B2B4B]/50 bg-[#1B2B4B]/5 dark:border-zinc-500 dark:bg-zinc-800/40"
                  : "border-neutral-200 dark:border-zinc-700 bg-neutral-50/60 dark:bg-zinc-800/30 hover:border-neutral-300 dark:hover:border-zinc-600"
              )}
            >
              {file ? (
                <div className="flex items-center gap-2 max-w-full">
                  <span className="w-8 h-8 rounded-md bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center flex-shrink-0">
                    <HugeiconsIcon
                      icon={File01Icon}
                      size={15}
                      className="text-neutral-500 dark:text-zinc-400"
                    />
                  </span>
                  <span className="text-xs text-neutral-700 dark:text-zinc-200 truncate">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 flex-shrink-0"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={14} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="w-9 h-9 rounded-lg bg-white dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center">
                    <HugeiconsIcon
                      icon={FileUploadIcon}
                      size={16}
                      className="text-neutral-400 dark:text-zinc-500"
                    />
                  </span>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400">
                    <span className="text-[#1B2B4B] dark:text-zinc-200 font-medium">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-[10px] text-neutral-400 dark:text-zinc-600">
                    PDF, PNG, JPG or TXT
                  </p>
                </>
              )}
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.txt,.md"
                className="hidden"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="material-title" className={fieldLabel}>
                Title
              </Label>
              <Input
                id="material-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4 Notes"
                className="h-9 text-sm rounded-md border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus-visible:ring-1 focus-visible:ring-[#1B2B4B]/30 focus-visible:border-[#1B2B4B]/40 dark:focus-visible:ring-neutral-500"
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
              disabled={!file || uploadMutation.isPending}
              className="flex-1 h-9 rounded-md text-xs font-medium bg-[#1B2B4B] hover:bg-[#162240] text-white disabled:opacity-40 disabled:cursor-not-allowed gap-1.5"
            >
              {uploadMutation.isPending && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  size={14}
                  className="animate-spin"
                />
              )}
              {uploadMutation.isPending ? "Uploading…" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
