"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader/loader";
import { syncUser } from "@/lib/auth";

export default function PostLogin() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isPending) return;
    (async () => {
      await syncUser({ getToken: async () => session?.session?.token || null });
      console.log("req sent");
      router.push("/dashboard");
    })();
  }, [session, isPending, router]);

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
