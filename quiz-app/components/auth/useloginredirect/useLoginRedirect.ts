"use client";
import { authClient } from "@/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useLoginRedirect({}) {
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id;
  const router = useRouter();

  useEffect(() => {
    if (userId) router.replace("/dashboard");
  }, [userId]);
}

