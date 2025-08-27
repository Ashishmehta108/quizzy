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
  FileText,
  Users,
  BarChart,
  Puzzle,
  History,
  CreditCard,
  LogOut,
  User,
  ClipboardList,
  LineChart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Logo from "../../public/quizzy_logo.png";
import Image from "next/image";
import { FavoriteChart, Home, Note, Notepad2 } from "iconsax-reactjs";
import { useAuth, useUser } from "@clerk/nextjs";
export default function AppSidebar() {
  const { user } = useUser();
  const { signOut } = useAuth()

  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };
  // if (!user) return null;

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
        <SidebarMenu aria-label="Main" className="mb-4 flex flex-col">
          <SidebarMenuItem className="text-xs my-2 font-normal active:bg-black ">
            Home
          </SidebarMenuItem>
          <SidebarMenuItem className="hover:bg-zinc-100 font-normal  py-0 rounded-xl dark:hover:bg-zinc-800">
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
        <SidebarMenu aria-label="Quizzes" className="mb-4 ">
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
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-zinc-200 dark:border-zinc-800 p-4">
        <SidebarGroup>
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 p-2  -translate-x-4 rounded-md"
          >
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.imageUrl || "https://github.com/shadcn.png"} alt="@user" />
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
            className="w-full justify-center  cursor-pointer mt-3"
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
