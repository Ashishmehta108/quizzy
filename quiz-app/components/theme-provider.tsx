"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACK_URL}/`, {
          method: "GET",
          cache: "no-store",
        });
        const data = await res.json();
        console.log("Polled data:", data);
        // Optionally handle/store the response
      } catch (err) {
        console.error("Polling failed:", err);
      }
    };

    poll(); // Initial call

    const interval = setInterval(poll, 60000); // Every 1 minute

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
