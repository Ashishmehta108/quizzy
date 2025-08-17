"use client";

import { useEffect } from "react";
import { animate } from "framer-motion";

export function useSmoothScroll() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const start = window.scrollY;
      const target = start + e.deltaY;

      animate(start, target, {
        duration: 0.1,
        ease: "easeOut",
        onUpdate: (val) => window.scrollTo(0, val),
      });
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);
}

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();
export function SmoothScrollWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  // useSmoothScroll();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
