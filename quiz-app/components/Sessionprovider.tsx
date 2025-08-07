// context/SessionContext.tsx
"use client";
import React, { createContext, useContext, useEffect, useState } from "react";

interface SessionContextType {
  tkn: string | null;
  setToken: (token: string | null) => void;
}

const SessionContext = createContext<SessionContextType>({
  tkn: null,
  setToken: () => {},
});

export const useSession = () => useContext(SessionContext);

// Helper: read cookie from `document.cookie`
async function getCookie(name: string) {
  const match = await fetch("/api/cookie");
  const data = await match.json();
  console.log(data);
  return data;
}

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [tkn, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getCookiehelper = async () => {
      const cookieToken = await getCookie("access_token");
      if (cookieToken) {
        setToken(cookieToken);
      }
    };

    getCookiehelper();
  }, []);

  return (
    <SessionContext.Provider value={{ tkn, setToken }}>
      {children}
    </SessionContext.Provider>
  );
};
