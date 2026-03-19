"use client";

import { useCallback } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { BACKEND_URL } from "@/lib/constants";

/**
 * Hook to sync user with backend
 * Returns a function that can be called to perform the sync
 */
export function useAuthSync() {
  const { data: session } = useSession();

  const syncUser = useCallback(async () => {
    try {
      if (!BACKEND_URL) {
        throw new Error("Missing BACKEND_URL environment variable");
      }

      if (!session?.session?.token) {
        throw new Error("Missing session token");
      }

      const res = await fetch(`${BACKEND_URL}/api/auth/sync`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session.session.token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Sync failed");
      }
    } catch (err) {
      console.error("Sync error:", err);
      throw err;
    }
  }, [session]);

  return { syncUser };
}
