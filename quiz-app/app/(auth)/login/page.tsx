"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Logo from "@/public/quizzy_logo.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import Image from "next/image";
import { Loader } from "lucide-react";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [error, setError] = useState<string>("");
  const { login, isLoading, user } = useAuthStore();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading]);
  const onSubmit = async (data: LoginForm) => {
    try {
      setError("");
      await login(data.email, data.password);
      console.log("logged in ");
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <>
      <div className=" min-h-screen flex items-center justify-center bg-white dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md border-none outline-none shadow-none">
          <CardHeader className="space-y-1">
            <CardTitle className="md:text-3xl text-2xl flex  justify-center items-center font-bold text-center">
              Sign in to
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
            <CardDescription className="text-center text-xs md:text-base max-w-xs mx-auto">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className=" focus-visible:border-zinc-400  placeholder:text-sm text-sm md:text-base md:placeholder:text-base focus-visible:ring-transparent"
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
                  className=" focus-visible:border-zinc-400  placeholder:text-sm text-sm md:text-base md:placeholder:text-base focus-visible:ring-transparent  "
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
                className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">Sign in</span>
                )}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Link
                href="/register"
                className=" text-accent hover:text-blue-600 hover:underline dark:text-accent-foreground"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
