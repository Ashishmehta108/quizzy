/**
 * @layer page
 * @owner agent-3
 */
"use client";

import React from "react";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export default function CoursesPage() {
  const { activeWorkspace } = useWorkspaceContext();

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses", activeWorkspace?.id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:5000/api/courses`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
        withCredentials: true,
      });
      return data.data;
    },
    enabled: !!activeWorkspace?.id,
  });

  if (isLoading) return <div className="p-8">Loading Courses...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Courses & Cohorts</h1>
          <p className="text-zinc-500">Organize your content and manage student groups.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Users className="h-4 w-4" />
            New Cohort
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Course
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses?.map((course: any) => (
          <Card key={course.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-32 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
              <BookOpen className="h-10 w-10 text-zinc-300" />
            </div>
            <CardHeader>
              <CardTitle>{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full text-blue-600 dark:text-blue-400">View Details</Button>
            </CardContent>
          </Card>
        ))}

        {courses?.length === 0 && (
          <Card className="col-span-full border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4">
             <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <BookOpen className="h-12 w-12 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No courses yet</h3>
              <p className="text-sm text-zinc-500">Create a course to group your quizzes and materials.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
