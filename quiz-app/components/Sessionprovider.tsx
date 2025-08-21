"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Loader from "./loader/loader";

interface SessionContextType {
  tkn: string | null;
  setToken: (tkn: string | null) => void;
}

const SessionContext = createContext<SessionContextType>({
  tkn: null,
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

  const [localToken, setToken] = useState<string | null>(token);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const verify = async () => {
      setIsChecking(true);
      try {
        await restoreSession();
        const newToken = useAuthStore.getState().token;
        setToken(newToken);
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setIsChecking(false);
      }
    };
    verify();
  }, [router, restoreSession]);

  if (!localToken && isChecking) return <Loader />;

  return (
    <SessionContext.Provider value={{ tkn: localToken, setToken }}>
      {children}
    </SessionContext.Provider>
  );
};
