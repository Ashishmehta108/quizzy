"use client";

import { useCallback } from "react";
import { useSession } from "@/lib/auth/auth-client";

/**
 * Hook to get session token from Better Auth
 */
export function useSessionToken() {
  const { data: session, isPending } = useSession();

  const getToken = useCallback(async () => {
    return session?.session?.token || null;
  }, [session]);

  return {
    getToken,
    isLoaded: !isPending,
    session,
  };
}
