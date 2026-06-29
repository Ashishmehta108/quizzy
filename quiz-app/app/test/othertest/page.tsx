"use client";

import { Button } from "@/components/ui/button";
import { BACKEND_URL } from "@/lib/constants";


export default function GetUserButton() {
  const handleGetUser = async () => {
    const resToken = await fetch("/api/getToken");
    const { token } = await resToken.json();
    const res = await fetch(`${BACKEND_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    const data = await res.json();
    console.log("User info:", data);
  };

  return <Button onClick={handleGetUser}>Get User Info</Button>;
}
