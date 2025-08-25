"use client";

import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import Logo from "@/public/quizzy_logo.png";
import { Loader, Github, Mail, Chrome } from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const syncUser = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/sync`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Sync failed");
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    if (!isLoaded) return;
    try {
      setError("");
      const result = await signIn.create({
        identifier: data.email,
        password: data.password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await syncUser();
        router.push("/dashboard");
      } else {
        console.log(result);
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || "Login failed");
    }
  };

  const oauthLogin = async (provider: "oauth_google" | "oauth_github") => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/post-login",
      });
    } catch (err) {
      console.error(`${provider} login failed:`, err);
      setError("OAuth login failed");
    }
  };

  return (
    <div className=" flex pt-20 justify-center bg-white dark:bg-zinc-900 px-4">
      <Card className="w-full max-w-md border rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center flex items-center justify-center">
            Sign in to
            <Image
              src={Logo}
              alt="logo"
              width={60}
              height={60}
              className="ml-2"
            />
          </CardTitle>
          <CardDescription className="text-center text-sm text-muted-foreground">
            Welcome back! Choose a method to sign in
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-2 mb-4">
            <Button
              onClick={() => oauthLogin("oauth_google")}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Chrome className="h-4 w-4" /> Sign in with Google
            </Button>
            <Button
              onClick={() => oauthLogin("oauth_github")}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Github className="h-4 w-4" /> Sign in with GitHub
            </Button>
          </div>

          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-xs uppercase text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Email + Password form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" /> Sign in with Email
                </>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a
              href="/sign-up"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
