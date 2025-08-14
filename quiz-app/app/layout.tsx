import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Image from "next/image";
import logo from "../public/quizzy_metadata_logo.png";
import Navbar from "@/components/Navbar";
import { SessionProvider } from "@/components/Sessionprovider";
import {
  SmoothScrollWrapper,
  useSmoothScroll,
} from "@/components/SmoothScroll";
const inter = Inter({ subsets: ["greek"] });

export const metadata: Metadata = {
  title: "Quiz App - Create and Take Quizzes",
  description: "A modern quiz application built with Next.js",
  generator: "v0.dev",
  icons: {
    icon: logo.src,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <Navbar /> */}
            <SmoothScrollWrapper>{children}</SmoothScrollWrapper>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
