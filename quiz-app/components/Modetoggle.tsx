"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon } from "iconsax-reactjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sun } from "lucide-react";
export function ModeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();
  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    }
  };
  return (
    <Button
      variant="ghost"
      className={cn(
        "hover:bg-zinc-100 dark:hover:bg-zinc-800  hover:text-zinc-900 dark:text-zinc-50",
        className
      )}
      size="icon"
      onClick={toggleTheme}
    >
      <Sun className="h-20 absolute w-20  scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
