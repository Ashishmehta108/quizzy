"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LogOut,
  User,
  MessageSquare,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Logo from "../../public/quizzy_logo.png";
import Image from "next/image";
import {
  ArrowDown,
  FavoriteChart,
  Home,
  Note,
  Notepad2,
} from "iconsax-reactjs";
import { useAuth, useUser } from "@clerk/nextjs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";

export default function AppSidebar() {
  const { user } = useUser();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  return (
    <Sidebar className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* Header */}
      <SidebarHeader className="p-4 font-bold text-xl tracking-tight">
        <Link href="/dashboard" className="flex items-center">
          <div className="relative flex flex-row items-center">
            <div className="absolute top-[20px] left-[22px] h-[25px] w-[25px] bg-white z-0"></div>
            <Image
              src={Logo}
              height={70}
              width={70}
              alt="logo"
              className="relative z-10"
            />
            Quizzy
          </div>
        </Link>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-4 flex-1 overflow-y-auto">
        {/* Main */}
        <SidebarMenu aria-label="Main" className="mb-4 flex flex-col">
          <SidebarMenuItem className="text-xs my-2 font-normal">
            Home
          </SidebarMenuItem>
          <SidebarMenuItem className="hover:bg-zinc-100 font-normal py-0 rounded-xl dark:hover:bg-zinc-800">
            <SidebarMenuButton asChild>
              <Link href="/dashboard">
                <span className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Home
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Quizzes */}
        <SidebarMenu aria-label="Quizzes" className="mb-4">
          <SidebarMenuItem className="text-xs my-2 font-medium">
            Quizzes
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-zinc-100 py-0 rounded-xl dark:hover:bg-zinc-800"
              asChild
            >
              <Link href="/dashboard/quizzes/create">
                <span className="flex items-center gap-2">
                  <Note className="w-5 h-5" />
                  Create new Quiz
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-zinc-100 py-0 rounded-xl dark:hover:bg-zinc-800"
              asChild
            >
              <Link href="/dashboard/quizzes">
                <span className="flex items-center gap-2">
                  <Notepad2 className="w-5 h-5" />
                  All Quizzes
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-zinc-100 py-0 rounded-xl dark:hover:bg-zinc-800"
              asChild
            >
              <Link href="/dashboard/results">
                <span className="flex items-center gap-2">
                  <FavoriteChart className="w-5 h-5" />
                  Results
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarMenu aria-label="AI Assistant" className="mb-4">
          <SidebarMenuItem className="text-xs my-2 font-medium">
            AI Assistant
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              className="hover:bg-zinc-100 py-0 rounded-xl dark:hover:bg-zinc-800"
              asChild
            >
              <Link href="/dashboard/chat/ai">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" strokeWidth={1.4} />
                  Chat with AI
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <Collapsible>
              <CollapsibleTrigger className="w-full flex items-center justify-between text-xs px-2 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <span className="text-zinc-700 dark:text-zinc-200">Chats</span>
                <ChevronDown className="h-4 w-4 text-zinc-500 dark:text-zinc-400 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-2 mt-1 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-2 text-xs"
                >
                  Personal Chats
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-2 text-xs"
                >
                  Group Chats
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-2 text-xs"
                >
                  Archived
                </Button>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-200 dark:border-zinc-800 p-4">
        <SidebarGroup>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 p-2 -translate-x-4 rounded-md"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage
                src={user?.imageUrl || "https://github.com/shadcn.png"}
                alt="@user"
              />
              <AvatarFallback>
                <User className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.firstName}</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {user?.emailAddresses[0].emailAddress}
              </span>
            </div>
          </Link>

          <Button
            variant="secondary"
            size="sm"
            className="w-full justify-center cursor-pointer mt-3"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
