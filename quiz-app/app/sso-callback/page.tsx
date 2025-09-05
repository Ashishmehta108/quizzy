"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useEffect } from "react";

export default function SsoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/post-login";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectTo);
    }, 3000); // fallback redirect in case Clerk doesn't auto-redirect

    return () => clearTimeout(timer);
  }, [redirectTo, router]);

  return <AuthenticateWithRedirectCallback />;
}
