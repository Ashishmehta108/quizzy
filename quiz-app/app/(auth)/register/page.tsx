"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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

import Link from "next/link";
import { Github, Loader } from "lucide-react";
import Image from "next/image";
import Logo from "@/public/quizzy_logo.png";
import { useAuth, useSignUp } from "@clerk/nextjs";
import GoogleLogo from "@/public/google.svg";

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>();

  const password = watch("password");
  const { getToken } = useAuth();
  const { signUp, setActive, isLoaded } = useSignUp();

  const syncUser = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACK_URL;
      if (!backendUrl) throw new Error("Missing BACKEND URL env");

      const jwt = await getToken();
      if (!jwt) throw new Error("Missing Clerk session token");

      const res = await fetch(`${backendUrl}/api/auth/sync`, {
        method: "GET",
        headers: { Authorization: `Bearer ${jwt}` },
      });

      if (!res.ok) throw new Error("Sync failed");
    } catch (err) {
      console.error("Sync error:", err);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    try {
      if (!isLoaded) return;
      setError("");
      setIsLoading(true);

      const result = await signUp.create({
        emailAddress: data.email,
        password: data.password,
        firstName: data.name,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        await syncUser();
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.errors?.[0]?.longMessage || err.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const oauthLogin = async (provider: "oauth_google" | "oauth_github") => {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sso-callback?redirect=/post-login",
        redirectUrlComplete: "/post-login",
      });
    } catch (err) {
      console.error(`${provider} login failed:`, err);
      setError("OAuth login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8 clerk-captcha">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="md:text-2xl text-xl flex justify-center items-center font-bold text-center">
            Create account with{" "}
            <div className="relative">
              <div className="absolute top-[20px] left-[22px] h-[25px] w-[25px] bg-white z-0"></div>
              <Image
                src={Logo}
                height={70}
                width={70}
                alt="logo"
                className="relative z-10"
              />
            </div>
          </CardTitle>
          <CardDescription className="text-center md:text-sm text-xs">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mb-4">
            <Button
              onClick={() => oauthLogin("oauth_google")}
              variant="outline"
              className="w-full flex items-center gap-2 border-zinc-300 hover:bg-zinc-100 
                 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-white"
            >
              <Image src={GoogleLogo} alt="Google" className="h-4 w-4" />
              Sign up with Google
            </Button>
            <Button
              onClick={() => oauthLogin("oauth_github")}
              variant="outline"
              className="w-full flex items-center gap-2 border-zinc-300 hover:bg-zinc-100 
               dark:border-zinc-700  hover:text-zinc-900 dark:hover:bg-zinc-800 dark:text-white"
            >
              <Github className="h-4 w-4" /> Sign up with GitHub
            </Button>
          </div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 text-xs md:text-sm"
          >
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                className="focus-visible:border-zinc-400 placeholder:text-sm text-sm md:text-base md:placeholder:text-base focus-visible:ring-transparent"
                {...register("name", {
                  required: "Name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="focus-visible:border-zinc-400 placeholder:text-sm text-sm md:text-base md:placeholder:text-base focus-visible:ring-transparent"
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
                className="focus-visible:border-zinc-400 placeholder:text-sm text-sm md:text-base md:placeholder:text-base focus-visible:ring-transparent"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                className="focus-visible:border-zinc-400 placeholder:text-sm text-sm md:text-base md:placeholder:text-base focus-visible:ring-transparent"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 text-sm dark:hover:bg-blue-600"
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  Creating account...
                  <Loader className="animate-spin ease-in-out h-3 w-3" />
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/register" className="text-accent hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
