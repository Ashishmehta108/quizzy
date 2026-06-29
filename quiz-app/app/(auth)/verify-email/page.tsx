"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react"

export default function VerifyEmailPage() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);
    const syncUser = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACK_URL;
        if (!backendUrl) throw new Error("Missing BACKEND URL env");

        const resToken = await fetch("/api/getToken");
        const { token } = await resToken.json();
        if (!token) throw new Error("Missing Better Auth session token");

        const res = await fetch(`${backendUrl}/api/auth/sync`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Sync failed");
      } catch (err) {
        console.error("Sync error:", err);
      }
    };

    try {
      await authClient.verifyEmail({
        code,
      }, {
        onSuccess: async () => {
          await syncUser();
          router.push("/dashboard");
        },
        onError: (ctx) => {
          setError(ctx.error.message || "Invalid code, please try again.");
        }
      });
    } catch (err: any) {
      console.error("Verification error:", err);
      setError("Invalid code, please try again.");
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Verify your email</CardTitle>
          <CardDescription>
            Enter the verification code sent to your email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            <Input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter verification code"
            />

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
