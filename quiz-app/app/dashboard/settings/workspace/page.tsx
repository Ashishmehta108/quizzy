/**
 * @layer page
 * @owner agent-1
 */
"use client";

import React, { useState, useEffect } from "react";
import { useWorkspaceContext } from "@/app/context/WorkspaceContext";
import { useWorkspaceDetail } from "@/hooks/useWorkspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";

export default function WorkspaceSettingsPage() {
  const { activeWorkspace } = useWorkspaceContext();
  const { data: workspace, isLoading } = useWorkspaceDetail(activeWorkspace?.id || "");
  const [name, setName] = useState("");

  useEffect(() => {
    if (workspace) {
      setName(workspace.name);
    }
  }, [workspace]);

  const handleUpdate = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/workspaces/${activeWorkspace?.id}`, { name }, {
        withCredentials: true,
      });
      toast.success("Workspace updated successfully");
    } catch (error) {
      toast.error("Failed to update workspace");
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Workspace Settings</h1>
      
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage your workspace details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Enter workspace name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Workspace Slug (unique)</label>
            <Input value={workspace?.slug} disabled />
            <p className="text-xs text-zinc-500">The slug is used in your unique URLs and cannot be changed.</p>
          </div>
          <Button onClick={handleUpdate} className="mt-4">Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="max-w-2xl border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-500">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">Delete Workspace</Button>
        </CardContent>
      </Card>
    </div>
  );
}
