"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader/loader";

export default function PostLogin() {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    (async () => {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sync`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("req sent");

      router.push("/dashboard");
    })();
  }, [getToken, isLoaded, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <Loader />
        </div>
      </div>
    </div>
  );
}
