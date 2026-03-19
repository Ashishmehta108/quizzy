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
import { signUp } from "@/lib/auth/auth-client";
import GoogleLogo from "@/public/google.svg";
import { syncUser } from "@/lib/auth";
import { AUTH_ROUTES, OAUTH_PROVIDERS, type OAuthProvider } from "@/lib/auth/authConstants";
import { useAuthRedirect } from "@/hooks/auth";

interface RegisterForm {
  name: string;
  lastName: string;
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

  // Use the new auth redirect hook
  useAuthRedirect();

  const onSubmit = async (data: RegisterForm) => {
    try {
      setError("");
      setIsLoading(true);

      const result = await signUp.email({
        email: data.email,
        password: data.password,
        name: `${data.name} ${data.lastName}`.trim(),
      });

      if (result.data?.session) {
        await syncUser({ getToken: async () => result.data?.session?.token || null });
        router.push("/dashboard");
      } else if (result.error) {
        setError(result.error.message || "Signup failed");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const oauthLogin = async (provider: "google" | "github") => {
    await signUp.social({
      providerId: provider,
      callbackURL: AUTH_ROUTES.POST_LOGIN,
    });
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
              onClick={() => oauthLogin("google")}
              variant="outline"
              className="w-full flex items-center gap-2 border-zinc-300 hover:bg-zinc-100
                 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-white"
            >
              <Image src={GoogleLogo} alt="Google" className="h-4 w-4" />
              Sign up with Google
            </Button>
            <Button
              onClick={() => oauthLogin("github")}
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
              <Label htmlFor="name">First Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your first name"
                {...register("name", { required: "First name is required" })}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Enter your last name"
                {...register("lastName", { required: "Last name is required" })}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register("email", { required: "Email is required" })}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
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
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
