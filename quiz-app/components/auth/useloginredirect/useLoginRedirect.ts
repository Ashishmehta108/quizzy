"use client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function useLoginRedirect({}) {
  const { userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (userId) router.replace("/dashboard");
  }, [userId]);
}
