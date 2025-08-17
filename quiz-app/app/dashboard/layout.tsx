"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/Sidebar";
import { ModeToggle } from "@/components/Modetoggle";
import { DirectNotification } from "iconsax-reactjs";
import Tooltip from "@/components/Tooltip";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className=" w-full relative  flex flex-col bg-white dark:bg-zinc-900 min-h-screen ">
        <div className="flex  items-center pb-3 justify-between border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-50 bg-white dark:bg-zinc-900 ">
          <SidebarTrigger className=" translate-x-5 translate-y-2" />
          <div className="flex items-center translate-y-2 gap-x-5">
            <span className=" cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 p-2 rounded-full">
              <Tooltip alignTooltip="top" hoverText="Notifications">
                <DirectNotification className=" h-5 w-5 " />
              </Tooltip>
            </span>
            <ModeToggle className="mr-5 " />
          </div>
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
