"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/Sidebar";
import { ModeToggle } from "@/components/Modetoggle";
import { DirectNotification } from "iconsax-reactjs";
import Tooltip from "@/components/Tooltip";
import { WorkspaceProvider } from "@/app/context/WorkspaceContext";
import WorkspaceSwitcher from "@/components/dashboard/WorkspaceSwitcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <SidebarProvider>
        <AppSidebar />
        <main className="w-full relative flex flex-col bg-white dark:bg-zinc-900 min-h-screen">
          <div className="flex items-center pb-2 pt-2 justify-between border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 bg-white dark:bg-zinc-900 backdrop-blur-sm bg-opacity-90">
            <div className="flex items-center gap-1 sm:gap-4 px-2 sm:px-4 min-w-0">
              <SidebarTrigger className="h-9 w-9 shrink-0 bg-transparent hover:tranparent dark:bg-transparent dark:hover:bg-transparent text-neutral-500 dark:text-neutral-300/90" />
              <div className="min-w-0">
                <WorkspaceSwitcher />
              </div>
            </div>
            <div className="flex items-center gap-x-1 sm:gap-x-5 px-2 sm:px-4 shrink-0">
              <span className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-full hidden sm:inline-block">
                <Tooltip alignTooltip="top" hoverText="Notifications">
                  <DirectNotification className="h-5 w-5" />
                </Tooltip>
              </span>
              <ModeToggle />
            </div>
          </div>
          {children}
        </main>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
