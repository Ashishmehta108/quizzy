"use client";

import { useEffect } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

interface UseAuthRedirectOptions {
  redirectPath?: string;
  enabled?: boolean;
}

/**
 * Hook to redirect authenticated users to a specified path
 * Default redirect is to /dashboard
 */
export function useAuthRedirect({
  redirectPath = "/dashboard",
  enabled = true,
}: UseAuthRedirectOptions = {}) {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    if (session?.user) {
      router.replace(redirectPath);
    }
  }, [session, redirectPath, router, enabled]);
}
