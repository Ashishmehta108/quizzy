import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import logo from "../public/quizzy_metadata_logo.png";
import { SmoothScrollWrapper } from "@/components/SmoothScroll";
import { cookies } from "next/headers";
import { ClerkProvider } from "@clerk/nextjs";
import { Arimo } from "next/font/google";
const arimo = Arimo({
  subsets: [
    "greek"
  ]
})
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
  const token = (await cookies()).get("auth_token")?.value || null;
  console.log(token);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={arimo.className}>
        <ClerkProvider>
          {/* <SessionProvider> */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* <Navbar /> */}
            <SmoothScrollWrapper>{children}</SmoothScrollWrapper>
          </ThemeProvider>
          {/* </SessionProvider> */}
        </ClerkProvider>
      </body>
    </html>
  );
}
