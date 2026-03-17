/**
 * @layer context
 * @owner agent-1
 */
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useWorkspaces } from "@/hooks/useWorkspace";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
  logoUrl?: string;
}

interface WorkspaceContextType {
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (workspace: Workspace) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: workspaces, isLoading } = useWorkspaces();
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);

  useEffect(() => {
    if (!activeWorkspace && workspaces && workspaces.length > 0) {
      const storedId = localStorage.getItem("activeWorkspaceId");
      const found = workspaces.find((w: Workspace) => w.id === storedId) || workspaces[0];
      setActiveWorkspaceState(found);
    }
  }, [workspaces, activeWorkspace]);

  const setActiveWorkspace = (workspace: Workspace) => {
    setActiveWorkspaceState(workspace);
    localStorage.setItem("activeWorkspaceId", workspace.id);
  };

  return (
    <WorkspaceContext.Provider value={{ activeWorkspace, setActiveWorkspace, isLoading }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspaceContext() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  }
  return context;
}
