"use client";

import { useEffect } from "react";
import { authClient } from "@/auth-client";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader/loader";

export default function PostLogin() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (isSessionLoading) return;
    (async () => {
      try {
        const resToken = await fetch("/api/getToken");
        const { token } = await resToken.json();
        await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/sync`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error("Sync error:", e);
      }
      console.log("req sent");

      router.push("/dashboard");
    })();
  }, [isSessionLoading, router]);


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
