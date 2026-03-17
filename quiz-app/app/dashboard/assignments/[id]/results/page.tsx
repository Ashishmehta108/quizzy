/**
 * @layer page
 * @owner agent-4
 */
"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export default function AssignmentResultsPage() {
  const params = useParams();
  const { activeWorkspace } = useWorkspaceContext();
  const assignmentId = params.id as string;

  const { data: results, isLoading } = useQuery({
    queryKey: ["assignment-results", assignmentId],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:5000/api/assignments/${assignmentId}/results`, {
        headers: { "x-workspace-id": activeWorkspace?.id },
        withCredentials: true,
      });
      return data.data;
    },
    enabled: !!activeWorkspace?.id,
  });

  if (isLoading) return <div className="p-8">Loading results...</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Assignment Grading</h1>
          <p className="text-zinc-500">Review and grade individual student submissions.</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input placeholder="Search students..." className="pl-10" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Auto Score</TableHead>
              <TableHead>Final Grade</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results?.map((res: any) => (
              <TableRow key={res.id}>
                <TableCell className="font-medium">{res.studentName || res.userId}</TableCell>
                <TableCell>
                  <Badge variant={res.status === 'graded' ? 'default' : 'secondary'}>
                    {res.status}
                  </Badge>
                </TableCell>
                <TableCell>{res.score}%</TableCell>
                <TableCell>{res.overrideScore !== null ? `${res.overrideScore}%` : "-"}</TableCell>
                <TableCell>{new Date(res.submittedAt).toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
