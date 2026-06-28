"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import AppSidebar from "@/components/dashboard/Sidebar";
import { ModeToggle } from "@/components/Modetoggle";
import { DirectNotification } from "iconsax-reactjs";
import { WorkspaceProvider } from "@/app/context/WorkspaceContext";
import WorkspaceSwitcher from "@/components/dashboard/WorkspaceSwitcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <TooltipProvider delayDuration={300}>
        <SidebarProvider className="bg-zinc-100 dark:bg-[#0d0d0f] md:h-screen md:overflow-hidden">
          <AppSidebar />
          <div className="flex-1 relative min-w-0">
          <main className="md:absolute md:inset-0 md:inset-y-[2vh] flex flex-col bg-zinc-50 dark:bg-[#111113] min-h-screen md:min-h-0 md:rounded-tl-2xl md:rounded-bl-2xl overflow-y-auto">
            <div className="flex items-center pb-2 pt-2 justify-between border-b border-zinc-200/80 dark:border-zinc-800/60 sticky top-0 z-50 bg-zinc-50 dark:bg-[#111113]">
              <div className="flex items-center gap-1 sm:gap-4 px-2 sm:px-4 min-w-0">
                {/* Mobile only — hidden on desktop */}
                <SidebarTrigger className="md:hidden h-9 w-9 shrink-0 bg-transparent dark:bg-transparent text-neutral-500 dark:text-neutral-300/90" />
                <div className="min-w-0">
                  <WorkspaceSwitcher />
                </div>
              </div>
              <div className="flex items-center gap-x-1 sm:gap-x-3 px-2 sm:px-4 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="hidden sm:inline-flex items-center justify-center h-8 w-8 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors duration-150">
                      <DirectNotification className="h-[18px] w-[18px]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    Notifications
                  </TooltipContent>
                </Tooltip>
                <ModeToggle />
              </div>
            </div>
            {children}
          </main>
          </div>
        </SidebarProvider>
      </TooltipProvider>
    </WorkspaceProvider>
  );
}
