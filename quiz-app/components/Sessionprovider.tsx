"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface SessionContextType {
  token: string | null;
  setToken: (token: string | null) => void;
}

const SessionContext = createContext<SessionContextType>({
  token: null,
  setToken: () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();

  const { token, restoreSession } = useAuthStore();
  const [isRestored, setIsRestored] = useState(false);
  const [localToken, setToken] = useState<string | null>(token);

  useEffect(() => {
    const initSession = async () => {
      try {
        await restoreSession();
        const newToken = useAuthStore.getState().token;
        if (!newToken) {
          router.replace("/login");
        } else {
          setToken(newToken);
        }
      } catch (err) {
        console.error("Session restoration error:", err);
        router.replace("/login");
      } finally {
        setIsRestored(true);
      }
    };

    initSession();
  }, [router]);
  if (!isRestored) return <div className="p-6">Loading session...</div>;

  return (
    <SessionContext.Provider value={{ token: localToken, setToken }}>
      {children}
    </SessionContext.Provider>
  );
};
