import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import logo from "../public/quizzy_logo.png";
import TanstackQuery from "../components/Tanstackquery";
import { ClerkProvider } from "@clerk/nextjs";
import { Arimo } from "next/font/google";
import { SocketProvider } from "./context/socket.context";
import { NavigationProvider } from "@/components/navigator/navigationProvider";

const arimo = Arimo({
  subsets: ["greek"],
});
export const metadata: Metadata = {
  title: "Quiz App - Create and Take Quizzes",
  description: "A modern quiz application built with Next.js",
  generator: "v0.dev",
  icons: {
    icon: logo.src,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={arimo.className}>
        <ClerkProvider key={process.env.CLERK_SECRET_KEY}>
          <SocketProvider>
            <NavigationProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <TanstackQuery>{children}</TanstackQuery>
              </ThemeProvider>
            </NavigationProvider>
          </SocketProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
