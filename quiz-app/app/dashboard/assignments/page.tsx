/**
 * @layer page
 * @owner agent-3
 */
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ClipboardListIcon,
  Share08Icon,
  Calendar03Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/constants";
import CreateAssignmentModal from "@/components/dashboard/CreateAssignmentModal";

interface Assignment {
  id: string;
  title: string;
  dueDate?: string;
  shareToken: string;
  publishedAt?: string | null;
}

function AssignmentsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-[68px] rounded-lg bg-neutral-100/70 dark:bg-zinc-800/40 animate-pulse"
        />
      ))}
    </div>
  );
}

export default function AssignmentsPage() {
  const { activeWorkspace } = useWorkspaceContext();
  const router = useRouter();

  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ["assignments", activeWorkspace?.id],
    queryFn: async () => {
      const { data } = await axios.get(`${BACKEND_URL}/assignments`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
        withCredentials: true,
      });
      return data.data;
    },
    enabled: !!activeWorkspace?.id,
  });

  const copyLink = (token: string) => {
    const url = `${window.location.origin}/join/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Assignment link copied!");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#111113]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/60 dark:border-zinc-800/60">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <HugeiconsIcon icon={Task01Icon} size={14} className="text-neutral-400 dark:text-zinc-500" />
              <span className="text-[11px] uppercase tracking-widest font-medium text-neutral-400 dark:text-zinc-500">
                Assessments
              </span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100">
              Assignments
            </h1>
            <p className="text-sm text-neutral-500 dark:text-zinc-400">
              Track and manage active student assessments.
            </p>
          </div>
          <CreateAssignmentModal />
        </div>

        {/* List */}
        {isLoading ? (
          <AssignmentsSkeleton />
        ) : (
          <div className="space-y-3">
            {assignments?.map((assignment) => (
              <Card
                key={assignment.id}
                className="group flex items-center justify-between gap-4 rounded-lg border border-neutral-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none px-4 py-3.5 transition-colors duration-150 hover:border-neutral-300 dark:hover:border-zinc-700"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-9 h-9 rounded-md border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-800/60 flex items-center justify-center flex-shrink-0">
                    <HugeiconsIcon icon={ClipboardListIcon} size={16} className="text-neutral-400 dark:text-zinc-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-neutral-900 dark:text-zinc-100 truncate">
                        {assignment.title}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 ${
                          assignment.publishedAt
                            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-neutral-100 text-neutral-500 dark:bg-zinc-800 dark:text-zinc-400"
                        }`}
                      >
                        {assignment.publishedAt ? "Active" : "Draft"}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-zinc-500 flex items-center gap-1 mt-0.5">
                      <HugeiconsIcon icon={Calendar03Icon} size={12} />
                      Due:{" "}
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString()
                        : "No deadline"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 text-xs rounded-md border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-800 hover:text-neutral-900 dark:hover:text-zinc-200 gap-1.5 font-medium"
                    onClick={() => copyLink(assignment.shareToken)}
                  >
                    <HugeiconsIcon icon={Share08Icon} size={14} />
                    Copy link
                  </Button>
                  <Button
                    size="sm"
                    className="h-8 px-3 text-xs rounded-md bg-[#1B2B4B] hover:bg-[#162240] text-white border-0 font-medium"
                    onClick={() =>
                      router.push(
                        `/dashboard/assignments/${assignment.id}/results`
                      )
                    }
                  >
                    View results
                  </Button>
                </div>
              </Card>
            ))}

            {assignments?.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 px-8 rounded-lg border border-dashed border-neutral-200 dark:border-zinc-800 bg-neutral-50/40 dark:bg-zinc-900/30 text-center">
                <div className="mb-4 w-9 h-9 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
                  <HugeiconsIcon icon={ClipboardListIcon} size={16} className="text-neutral-400 dark:text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-neutral-900 dark:text-zinc-100 mb-1">
                  No assignments active
                </p>
                <p className="text-xs text-neutral-400 dark:text-zinc-500 max-w-xs leading-relaxed">
                  Pick a quiz and assign it to a cohort to see it here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
