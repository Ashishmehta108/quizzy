"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/sidebar";
import { LogOut, User, Sparkles, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "../../public/quizzy_logo.png";
import Image from "next/image";
import { FavoriteChart, Home, Note, Notepad2 } from "iconsax-reactjs";
import { authClient } from "@/auth-client";
import { useRouter } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/constants";
import { useSocket } from "@/app/context/socket.context";
import { cn } from "@/lib/utils";

function ShimmerItem({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-zinc-100 dark:bg-zinc-800/50 h-7",
        className
      )}
    >
      <span
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.45) 50%, transparent 100%)",
          animation: "shimmer 1.8s ease-in-out infinite",
        }}
      />
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 mb-0.5 mt-5 first:mt-1 text-[10px] font-semibold tracking-[0.08em] uppercase text-zinc-400 dark:text-zinc-600 select-none">
      {children}
    </p>
  );
}

function NavItem({
  href,
  icon,
  label,
  exact = false,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  exact?: boolean;
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2.5 py-[6px] rounded-lg text-[13px] transition-colors duration-150",
        isActive
          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 font-normal"
      )}
    >
      <span
        className={cn(
          "flex-shrink-0 transition-colors",
          isActive
            ? "text-zinc-900 dark:text-zinc-300"
            : "text-zinc-600 dark:text-zinc-500"
        )}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}

export default function AppSidebar() {
  const { socket } = useSocket();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const [chats, setChats] = React.useState([]);
  const [chatsLoading, setChatsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!socket) return;
    socket.on("chat_update", getQuizChats);
    return () => { socket.off("chat_update", getQuizChats); };
  }, [socket]);

  React.useEffect(() => {
    getQuizChats();
  }, []);

  const getQuizChats = async () => {
    try {
      const resToken = await fetch("/api/getToken");
      const { token } = await resToken.json();
      const data = await fetch(`${BACKEND_URL}/chats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });
      const res = await data.json();
      setChats(res.chats);
    } catch (error: any) {
      toast.error(`Failed to fetch chats ${error.message}`, { duration: 4000 });
    } finally {
      setChatsLoading(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/") },
    });
  };

  return (
    <Sidebar className="bg-zinc-100 dark:bg-[#0d0d0f] border-none">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-4 pt-5 pb-3 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-1.5">
            <div className="relative flex items-center">
              <div className="absolute top-[14px] left-[15px] h-4 w-4 bg-zinc-50 dark:bg-zinc-950 z-0" />
              <Image
                src={Logo}
                height={46}
                width={46}
                alt="logo"
                className="relative z-10"
              />
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-zinc-800 dark:text-zinc-100">
              Quizzy
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-2.5 pb-4">
          <SectionLabel>Home</SectionLabel>
          <NavItem
            href="/dashboard"
            exact
            icon={<Home size={16} variant="Linear" />}
            label="Home"
          />

          <SectionLabel>Library</SectionLabel>
          <NavItem
            href="/dashboard/library"
            icon={<Note size={16} variant="Linear" />}
            label="My Content"
          />

          <SectionLabel>Classroom</SectionLabel>
          <NavItem
            href="/dashboard/courses"
            icon={<User size={15} strokeWidth={1.4} />}
            label="Courses & Cohorts"
          />
          <NavItem
            href="/dashboard/assignments"
            icon={<Notepad2 size={16} variant="Linear" />}
            label="Assignments"
          />

          <SectionLabel>Workspace</SectionLabel>
          <NavItem
            href="/dashboard/analytics"
            icon={<FavoriteChart size={16} variant="Linear" />}
            label="Analytics"
          />
          <NavItem
            href="/dashboard/pricing"
            icon={<Sparkles size={15} strokeWidth={1.4} />}
            label="Billing & Plans"
          />

          <SectionLabel>AI Assistant</SectionLabel>
          <NavItem
            href="/dashboard/chat/ai"
            icon={<Sparkles size={15} strokeWidth={1.4} />}
            label="Chat with AI"
          />

          <Collapsible className="mt-0.5">
            <CollapsibleTrigger className="group w-full flex items-center justify-between px-2.5 py-[6px] rounded-lg text-[13px] font-normal text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 transition-colors duration-150">
              <span>Chats</span>
              <ChevronDown
                size={13}
                strokeWidth={1.6}
                className="text-zinc-400 dark:text-zinc-600 transition-transform duration-200 group-data-[state=open]:rotate-180"
              />
            </CollapsibleTrigger>

            <CollapsibleContent>
              {chatsLoading ? (
                <div className="mt-1.5 ml-2 flex flex-col gap-1.5">
                  {[...Array(4)].map((_, i) => (
                    <ShimmerItem key={i} className="w-full" />
                  ))}
                </div>
              ) : chats.length > 0 ? (
                <div className="mt-1 ml-2 flex flex-col gap-0.5 max-h-52 overflow-y-auto">
                  {chats.map((chat: any) => (
                    <Link
                      key={chat.id}
                      href={`/dashboard/chat/ai/${chat.quizId}`}
                      className="block px-2.5 py-[5px] rounded-md text-[12.5px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 truncate transition-colors duration-150"
                    >
                      {chat.title}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="ml-2 mt-2 text-[12px] text-zinc-400 dark:text-zinc-600 italic">
                  No chats yet
                </p>
              )}
            </CollapsibleContent>
          </Collapsible>
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-zinc-200/60 dark:border-zinc-800/50 px-3 py-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 transition-colors duration-150"
          >
            <Avatar className="w-7 h-7">
              <AvatarImage
                src={user?.image || "https://github.com/shadcn.png"}
                alt="@user"
              />
              <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800">
                <User size={13} strokeWidth={1.4} className="text-zinc-500" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-[12.5px] font-medium text-zinc-700 dark:text-zinc-300 truncate">
                {user?.name?.split(" ")[0]}
              </span>
              <span className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                {user?.email}
              </span>
            </div>
          </Link>

          <button
            onClick={handleLogout}
            className="mt-1 w-full flex items-center justify-center gap-2 px-3 py-[7px] rounded-lg text-[12.5px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/40 transition-colors duration-150 cursor-pointer"
          >
            <LogOut size={13} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </div>
    </Sidebar>
  );
}
