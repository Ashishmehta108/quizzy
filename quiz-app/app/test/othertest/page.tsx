"use client";

import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/lib/constants";
import { useSession } from "@/lib/auth/auth-client";

export default function GetUserButton() {
  const { data: session } = useSession();

  const handleGetUser = async () => {
    const token = session?.session?.token;
    const res = await fetch(`${BACKEND_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });
    const data = await res.json();
    console.log("User info:", data);
  };

  return <Button onClick={handleGetUser}>Get User Info</Button>;
}
