"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useEffect } from "react";
import Loader from "@/components/loader/loader";

async function SsoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/post-login";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectTo);
    }, 3000);

    return () => clearTimeout(timer);
  }, [redirectTo, router]);

  return <AuthenticateWithRedirectCallback />;
}

export default function SsoCallbackPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-zinc-950 p-4">
      <Loader />
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
