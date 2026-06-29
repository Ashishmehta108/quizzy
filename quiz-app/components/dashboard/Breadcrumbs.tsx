"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home09Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  quizzes: "Quizzes",
  results: "Results",
  courses: "Courses",
  assignments: "Assignments",
  analytics: "Analytics",
  library: "Library",
  pricing: "Pricing",
  profile: "Profile",
  settings: "Settings",
  chat: "Chat",
  ai: "AI Chat",
  notifications: "Notifications",
  members: "Members",
  workspace: "Workspace",
  create: "Create",
  detail: "Details",
};

function isIdLike(seg: string) {
  return (
    seg.length > 18 ||
    /^[0-9a-fA-F-]{16,}$/.test(seg) ||
    /^\d+$/.test(seg)
  );
}

function labelFor(seg: string) {
  if (isIdLike(seg)) return "Details";
  return (
    LABELS[seg] ??
    seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")
  );
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // ["dashboard", ...]
  const rest = segments.slice(1); // after "dashboard"

  const crumbs = rest.map((seg, i) => ({
    label: labelFor(seg),
    href: "/" + ["dashboard", ...rest.slice(0, i + 1)].join("/"),
    isLast: i === rest.length - 1,
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden md:flex items-center gap-1.5 text-xs min-w-0"
    >
      <Link
        href="/dashboard"
        className={cn(
          "flex items-center gap-1.5 text-neutral-400 dark:text-zinc-500 hover:text-neutral-700 dark:hover:text-zinc-300 transition-colors",
          crumbs.length === 0 && "text-neutral-700 dark:text-zinc-200"
        )}
      >
        <HugeiconsIcon icon={Home09Icon} size={14} />
        <span>Dashboard</span>
      </Link>

      {crumbs.map((c) => (
        <React.Fragment key={c.href}>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={13}
            className="text-neutral-300 dark:text-zinc-700 flex-shrink-0"
          />
          {c.isLast ? (
            <span className="text-neutral-700 dark:text-zinc-200 font-medium truncate">
              {c.label}
            </span>
          ) : (
            <Link
              href={c.href}
              className="text-neutral-400 dark:text-zinc-500 hover:text-neutral-700 dark:hover:text-zinc-300 transition-colors truncate"
            >
              {c.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
