"use client";
import { Safari } from "@/components/magicui/safari";
import Dashboard from "@/public/dashboard.png";
import DarkDashboard from "../../public/darkdashboard.png";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function SafariDashboard() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; 

  const imageSrc = resolvedTheme === "dark" ? DarkDashboard.src : Dashboard.src;

  return (
    <div className="relative container max-w-7xl mx-auto">
      <Safari
        url="quizzy.vercel.app"
        width={1200}
        height={753}
        className="size-full mx-auto hidden lg:block"
        imageSrc={imageSrc}
      />
    </div>
  );
}
