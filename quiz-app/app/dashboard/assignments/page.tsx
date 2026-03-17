/**
 * @layer page
 * @owner agent-3
 */
"use client";

import React from "react";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardList, Share2 } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

export default function AssignmentsPage() {
  const { activeWorkspace } = useWorkspaceContext();

  const { data: assignments, isLoading } = useQuery({
    queryKey: ["assignments", activeWorkspace?.id],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:5000/api/assignments`, {
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

  if (isLoading) return <div className="p-8">Loading Assignments...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assignments</h1>
          <p className="text-zinc-500">Track and manage active student assessments.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Assignment
        </Button>
      </div>

      <div className="space-y-4">
        {assignments?.map((assignment: any) => (
          <Card key={assignment.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base">{assignment.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No deadline"}
                  </CardDescription>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => copyLink(assignment.shareToken)}
                >
                  <Share2 className="h-4 w-4" />
                  Copy Link
                </Button>
                <Button variant="secondary" size="sm">View Results</Button>
              </div>
            </CardHeader>
          </Card>
        ))}

        {assignments?.length === 0 && (
          <Card className="border-dashed p-12 flex flex-col items-center justify-center text-center space-y-4">
             <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-full">
              <ClipboardList className="h-12 w-12 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium">No assignments active</h3>
              <p className="text-sm text-zinc-500">Pick a quiz and assign it to a cohort to see it here.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
