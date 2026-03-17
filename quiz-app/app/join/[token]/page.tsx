/**
 * @layer page
 * @owner agent-3
 */
"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ClipboardList, ArrowRight } from "lucide-react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function JoinAssignmentPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const joinMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`http://localhost:5000/api/assignments/join`, {
        shareToken: token,
      }, { withCredentials: true });
      return data.data;
    },
    onSuccess: (data) => {
      toast.success("Joined assignment!");
      router.push(`/dashboard/assignments/${data.assignmentId}`);
    },
    onError: () => {
      toast.error("Failed to join. Invalid token or already a member.");
    }
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950">
      <Card className="max-w-md w-full shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full w-fit mb-4">
            <ClipboardList className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Join Assignment</CardTitle>
          <CardDescription>
            You've been invited to complete a quiz. Click below to accept and start.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full gap-2 h-12 text-lg" 
            onClick={() => joinMutation.mutate()}
            disabled={joinMutation.isPending}
          >
            {joinMutation.isPending ? "Joining..." : "Accept Invitation"}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
