"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useEffect } from "react";

async function SsoCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = searchParams.get("redirect") || "/post-login";

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(redirectTo);
    }, 3000);

    return () => clearTimeout(timer);
  }, [redirectTo, router]);

  return <AuthenticateWithRedirectCallback />;
}

export default function SsoCallbackPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SsoCallback />
    </Suspense>
  );
}
