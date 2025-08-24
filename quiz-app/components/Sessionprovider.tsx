"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import Loader from "./loader/loader";

interface SessionContextType {
  logged: boolean;
  setIslogged: React.Dispatch<React.SetStateAction<boolean>>;
}

const SessionContext = createContext<SessionContextType>({
  logged: false,
  setIslogged: () => {},
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const { isLogged, restoreSession } = useAuthStore();

  const [Islogged, setIslogged] = useState<boolean>(isLogged);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    const verify = async () => {
      setIsChecking(true);
      try {
        await restoreSession();
        const isLogged = useAuthStore.getState().isLogged;
        setIslogged(true);
      } catch (err) {
        console.error("Session verification failed:", err);
      } finally {
        setIsChecking(false);
      }
    };
    verify();
  }, [router, restoreSession]);

  if (!isLogged && isChecking) return <Loader />;

  return (
    <SessionContext.Provider
      value={{ logged: Islogged, setIslogged: setIslogged }}
    >
      {children}
    </SessionContext.Provider>
  );
};
