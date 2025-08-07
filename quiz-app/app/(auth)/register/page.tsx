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
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { Loader, Loader2, Loader2Icon } from "lucide-react";
import Image from "next/image";
import Logo from "@/public/quizzy_logo.png";
interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const [error, setError] = useState<string>("");
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterForm>();
  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError("");
      console.log("registering");
      await registerUser(data.name, data.email, data.password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-zinc-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="md:text-2xl  text-xl  flex justify-center items-center font-bold text-center">
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
                className="focus-visible:border-zinc-400 placeholder:text-sm text-sm md:text-base md:placeholder:text-base focus-visible:ring-transparent"
                placeholder="Enter your full name"
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
                className="focus-visible:border-zinc-400  placeholder:text-sm text-sm md:text-base md:placeholder:text-basefocus-visible:ring-transparent"
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
                className="focus-visible:border-zinc-400 placeholder:text-sm text-sm md:text-base md:placeholder:text-base focus-visible:ring-transparent"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                className="focus-visible:border-zinc-400 placeholder:text-sm text-sm md:text-base md:placeholder:text-base focus-visible:ring-transparent"
                placeholder="Confirm your password"
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
              className="w-full flex items-center bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 text-sm dark:hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-3">
                  Creating account...
                  <Loader className="animate-spin ease-in-out h-3 w-3 " />
                </span>
              ) : (
                <span className="flex items-center gap-3">Create account</span>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
