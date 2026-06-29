"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/post-login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-zinc-900">
      <div className="flex flex-col items-center">
        <div
          aria-hidden="true"
          className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"
        />
        <p className="mt-3 text-gray-600 dark:text-gray-300">Signing you in…</p>
      </div>
    </div>
  );
}
