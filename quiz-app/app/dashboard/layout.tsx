"use client";

import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/dashboard/Sidebar";
import { ModeToggle } from "@/components/Modetoggle";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className=" w-full relative  flex flex-col bg-white dark:bg-zinc-900 min-h-screen ">
        <div className="flex  items-center pb-3 justify-between border-b border-zinc-200 dark:border-zinc-800 ">
          <SidebarTrigger className=" translate-x-5 translate-y-2" />
          <ModeToggle className="mr-5  translate-y-2" />
        </div>
        {children}
      </main>
    </SidebarProvider>
  );
}
