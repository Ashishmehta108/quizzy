/**
 * @layer page
 * @owner agent-3
 */
"use client";

import React from "react";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  MoreHorizontal,
  ChevronRight,
  Search,
  BookMarked,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Course {
  id: string;
  title: string;
  description?: string;
  createdAt?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CoursesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-44 rounded-lg bg-neutral-100/70 dark:bg-zinc-800/40 animate-pulse"
        />
      ))}
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────

function CourseCard({
  course,
  onView,
}: {
  course: Course;
  onView: (id: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
    >
      <Card className="group relative flex flex-col h-full rounded-lg border border-neutral-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 shadow-none transition-colors duration-150 hover:border-neutral-300 dark:hover:border-zinc-700">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            {/* Icon tile */}
            <div className="w-8 h-8 rounded-md border border-neutral-200 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-800/60 flex items-center justify-center flex-shrink-0">
              <BookMarked className="h-3.5 w-3.5 text-neutral-400 dark:text-zinc-500" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </div>

          <CardTitle className="text-sm font-medium text-neutral-900 dark:text-zinc-100 line-clamp-1">
            {course.title}
          </CardTitle>
          <CardDescription className="text-xs text-neutral-400 dark:text-zinc-500 line-clamp-2 leading-relaxed mt-0.5 min-h-[32px]">
            {course.description || "No description provided."}
          </CardDescription>
        </CardHeader>

        <CardContent className="px-5 pb-5 pt-0 mt-auto">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-xs rounded-md border border-neutral-200 dark:border-zinc-700/80 bg-transparent text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-800 hover:text-neutral-900 dark:hover:text-zinc-200 gap-1.5 font-medium justify-between group/btn"
            onClick={() => onView(course.id)}
          >
            View course
            <ChevronRight className="h-3 w-3 transition-transform group-hover/btn:translate-x-0.5" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({
  searchQuery,
  onClear,
  onCreate,
}: {
  searchQuery: string;
  onClear: () => void;
  onCreate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="col-span-full"
    >
      <div className="flex flex-col items-center justify-center py-20 px-8 rounded-lg border border-dashed border-neutral-200 dark:border-zinc-800 bg-neutral-50/40 dark:bg-zinc-900/30 text-center">
        <div className="mb-4 w-9 h-9 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 flex items-center justify-center shadow-sm">
          <BookMarked className="h-4 w-4 text-neutral-400 dark:text-zinc-500" />
        </div>
        <p className="text-sm font-medium text-neutral-900 dark:text-zinc-100 mb-1">
          {searchQuery ? "No courses match your search" : "No courses yet"}
        </p>
        <p className="text-xs text-neutral-400 dark:text-zinc-500 max-w-xs leading-relaxed">
          {searchQuery
            ? "Try a different keyword or clear the filter."
            : "Create your first course to start building your learning center."}
        </p>
        {searchQuery ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 h-8 px-3 text-xs rounded-md text-neutral-400 dark:text-zinc-500 hover:text-neutral-700 dark:hover:text-zinc-300"
            onClick={onClear}
          >
            Clear search
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-8 px-3 text-xs rounded-md border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-800 hover:text-neutral-900 dark:hover:text-zinc-200 gap-1.5 font-medium"
            onClick={onCreate}
          >
            <Plus className="h-3.5 w-3.5" />
            New Course
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Create Course Dialog ─────────────────────────────────────────────────────

function CreateCourseDialog({
  open,
  onOpenChange,
  name,
  setName,
  description,
  setDescription,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  name: string;
  setName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm     rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-0 shadow-lg gap-0 ">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-neutral-100 dark:border-zinc-800">
          <DialogTitle className="text-sm font-semibold text-neutral-900 dark:text-zinc-100">
            New Course
          </DialogTitle>
          <DialogDescription className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
            Add a title and optional description to get started.
          </DialogDescription>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-neutral-500 dark:text-zinc-400">
              Title
            </Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Intro to Machine Learning"
              className="h-9 rounded-md text-sm border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900   dark:focus-visible:ring-zinc-600"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-neutral-500 dark:text-zinc-400">
              Description{" "}
              <span className="text-neutral-300 dark:text-zinc-600 font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will students learn in this course?"
              className="min-h-[100px] rounded-md text-sm border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 dark:focus-visible:ring-zinc-600 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs rounded-md text-neutral-500 hover:text-neutral-700 dark:hover:text-zinc-300"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-8 px-4 text-xs rounded-md bg-blue-500 hover:bg-blue-600 text-white border-0 disabled:opacity-50"
            disabled={isPending || !name.trim()}
            onClick={onSubmit}
          >
            {isPending ? "Creating..." : "Create Course"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CoursesPage() {
  const { activeWorkspace } = useWorkspaceContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [showCourseDialog, setShowCourseDialog] = React.useState(false);
  const [showCohortDialog, setShowCohortDialog] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["courses", activeWorkspace?.id],
    queryFn: async () => {
      const { data } = await api.get(`/courses`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
      });
      return data.data || [];
    },
    enabled: !!activeWorkspace?.id,
  });

  const createCourse = useMutation({
    mutationFn: async (payload: { title: string; description: string }) =>
      api.post("/courses", payload, {
        headers: { "x-workspace-id": activeWorkspace?.id },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses", activeWorkspace?.id] });
      setShowCourseDialog(false);
      setName("");
      setDescription("");
      toast.success("Course created");
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || "Failed to create course");
    },
  });

  const createCohort = useMutation({
    mutationFn: async (payload: { name: string; description: string }) =>
      api.post("/courses/cohorts", payload, {
        headers: { "x-workspace-id": activeWorkspace?.id },
      }),
    onSuccess: () => {
      toast.success("Cohort created");
      setShowCohortDialog(false);
      setName("");
      setDescription("");
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      toast.error(error.response?.data?.error || "Failed to create cohort");
    },
  });

  const filteredCourses = courses?.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200/60 dark:border-zinc-800/60">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 mb-2">
              <Layers className="h-3.5 w-3.5 text-neutral-400 dark:text-zinc-500" />
              <span className="text-[11px] uppercase tracking-widest font-medium text-neutral-400 dark:text-zinc-500">
                Learning Center
              </span>
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100">
              Courses & Cohorts
            </h1>
            <p className="text-sm text-neutral-500 dark:text-zinc-400">
              Manage your courses and student cohorts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs rounded-md border-neutral-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-50 dark:hover:bg-zinc-800 gap-1.5 font-medium"
              onClick={() => setShowCohortDialog(true)}
            >
              <Users className="h-3.5 w-3.5" />
              New Cohort
            </Button>
            <Button
              size="sm"
              className="h-8 px-3 text-xs rounded-md bg-[#1B2B4B] hover:bg-[#162240] text-white border-0 gap-1.5 font-medium"
              onClick={() => setShowCourseDialog(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New Course
            </Button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
            <Input
              placeholder="Search courses..."
              className="pl-9 h-8 text-xs rounded-md border-neutral-200 dark:border-zinc-700/80 bg-white dark:bg-zinc-900 focus-visible:ring-1 focus-visible:ring-neutral-300 dark:focus-visible:ring-zinc-600 placeholder:text-neutral-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="text-xs text-neutral-400 dark:text-zinc-500 flex-shrink-0">
            {filteredCourses?.length ?? 0}{" "}
            {(filteredCourses?.length ?? 0) === 1 ? "course" : "courses"}
          </span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <CoursesSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCourses?.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onView={(id) => router.push(`/dashboard/courses/detail/${id}`)}
                />
              ))}
            </AnimatePresence>

            {filteredCourses?.length === 0 && (
              <EmptyState
                searchQuery={searchQuery}
                onClear={() => setSearchQuery("")}
                onCreate={() => setShowCourseDialog(true)}
              />
            )}
          </div>
        )}
      </div>

      {/* Create Course Dialog */}
      <CreateCourseDialog
        open={showCourseDialog}
        onOpenChange={setShowCourseDialog}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        onSubmit={() => createCourse.mutate({ title: name, description })}
        isPending={createCourse.isPending}
      />
    </div>
  );
}