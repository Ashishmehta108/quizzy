"use client";

import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/lib/constants";
import { useAuth } from "@clerk/nextjs";

export default function GetUserButton() {
  const { getToken } = useAuth();

  const handleGetUser = async () => {
    const token = await getToken();
    const res = await fetch(`${BACKEND_URL}/api/user`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const data = await res.json();
    console.log("User info:", data);
  };

  return <Button onClick={handleGetUser}>Get User Info</Button>;
}
