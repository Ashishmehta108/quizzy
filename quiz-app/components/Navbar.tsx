"use client";

import Link from "next/link";
import { Brain } from "lucide-react";
import { Button } from "./ui/button";
import { ModeToggle } from "./Modetoggle";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-200/50 dark:border-zinc-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center space-x-3"
            aria-label="Go to homepage"
          >
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              QuizAI
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="#features"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              How it works
            </Link>
            <ModeToggle />
            <Button asChild variant="outline" size="sm">
              <Link href="/login" aria-label="Sign in to your account">
                Sign in
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
