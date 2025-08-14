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
  const [isRestored, setIsRestored] = useState(false);
  const [localToken, setToken] = useState<string | null>(token);

  useEffect(() => {
    const initSession = async () => {
      try {
        await restoreSession();
        const newToken = useAuthStore.getState().token;
        if (!newToken && window.location.pathname !== "/") {
          router.replace("/login");
        } else {
          setToken(newToken);
        }
        setIsRestored(true);
      } catch (err) {
        console.error("Session restoration error:", err);
        router.replace("/");
        setIsRestored(true);
      }
    };
    initSession();
  }, [router]);
  if (!isRestored) return <Loader />;

  return (
    <SessionContext.Provider value={{ tkn: localToken, setToken }}>
      {children}
    </SessionContext.Provider>
  );
};
