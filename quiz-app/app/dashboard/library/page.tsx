/**
 * @layer page
 * @owner agent-2
 */
"use client";

import React, { useState } from "react";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  File01Icon,
  Delete02Icon,
  Search01Icon,
  LibraryIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "@/lib/constants";
import AddContentModal from "@/components/dashboard/AddContentModal";

interface LibraryDoc {
  id: string;
  title: string;
  createdAt: string;
  indexingStatus: string;
}

export default function LibraryPage() {
  const { activeWorkspace } = useWorkspaceContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: documents, isLoading } = useQuery<LibraryDoc[]>({
    queryKey: ["library", activeWorkspace?.id],
    queryFn: async () => {
      const { data } = await axios.get(`${BACKEND_URL}/library`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
        withCredentials: true,
      });
      return data.data;
    },
    enabled: !!activeWorkspace?.id,
  });

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${BACKEND_URL}/library/${id}`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
        withCredentials: true,
      });
      toast.success("Document deleted");
      queryClient.invalidateQueries({ queryKey: ["library"] });
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredDocs = documents?.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#111113]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/60 dark:border-zinc-800/60">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <HugeiconsIcon
                icon={LibraryIcon}
                size={14}
                className="text-neutral-400 dark:text-zinc-500"
              />
              <span className="text-[11px] uppercase tracking-widest font-medium text-neutral-400 dark:text-zinc-500">
                Content
              </span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100">
              Content Library
            </h1>
            <p className="text-sm text-neutral-500 dark:text-zinc-400">
              Upload and manage your teaching materials.
            </p>
          </div>
          <AddContentModal />
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            <HugeiconsIcon icon={Search01Icon} size={14} />
          </span>
          <Input
            placeholder="Search documents..."
            className="pl-9 h-9 text-sm rounded-md border-neutral-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-neutral-300 dark:focus-visible:ring-zinc-600 placeholder:text-neutral-400"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-[92px] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs?.map((doc) => (
              <Card
                key={doc.id}
                className="group rounded-xl border border-neutral-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none p-4 transition-colors hover:border-neutral-300 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-md border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-800/60 flex items-center justify-center flex-shrink-0">
                      <HugeiconsIcon
                        icon={File01Icon}
                        size={16}
                        className="text-neutral-400 dark:text-zinc-500"
                      />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-neutral-900 dark:text-zinc-100 truncate">
                        {doc.title}
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-red-500 dark:hover:text-red-400 flex-shrink-0"
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={15} />
                  </button>
                </div>
                <div className="mt-3 flex items-center">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      doc.indexingStatus === "completed"
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "bg-neutral-100 text-neutral-500 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                  >
                    {doc.indexingStatus}
                  </span>
                </div>
              </Card>
            ))}

            {filteredDocs?.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 px-8 rounded-lg border border-dashed border-neutral-200 dark:border-zinc-800 bg-neutral-50/40 dark:bg-zinc-900/30 text-center">
                <div className="mb-4 w-9 h-9 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                  <HugeiconsIcon
                    icon={File01Icon}
                    size={16}
                    className="text-neutral-400 dark:text-zinc-500"
                  />
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-zinc-100 mb-1">
                  {search ? "No documents match your search" : "No documents found"}
                </p>
                <p className="text-xs text-neutral-400 dark:text-zinc-500 max-w-xs leading-relaxed mb-4">
                  Upload your PDFs, images, or text files to get started.
                </p>
                {!search && (
                  <AddContentModal
                    trigger={
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs rounded-md border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-800 gap-1.5 font-medium"
                      >
                        Upload first document
                      </Button>
                    }
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
