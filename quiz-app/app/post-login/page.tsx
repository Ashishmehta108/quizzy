"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader/loader";

export default function PostLogin() {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return; // wait until auth is ready
    (async () => {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sync`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("req sent", token);
      router.push("/dashboard");
    })();
  }, [getToken, isLoaded, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Loader />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-zinc-900 dark:text-white">
            Setting up your account
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            This will only take a moment...
          </p>
        </div>
      </div>
    </div>
  );
}
