"use client";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
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
import { Loader, Github, Mail, EyeOffIcon, EyeClosed } from "lucide-react";
import google from "@/public/google.svg";
import { syncUser } from "@/lib/actions/syncUser";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/schema/loginSchema";
import { ROUTES } from "@/constants";
import { Eye, EyeOff, Lock } from "lucide-react";

export interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const { isLoaded, signIn, setActive } = useSignIn();
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

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
        await syncUser({ getToken });
        router.push("/dashboard");
      } else {
        console.log(result);
      }
    } catch (err: unknown) {
      const clerkError = err as { errors?: any[] };
      setError(clerkError.errors?.[0]?.longMessage ?? "Login failed");
    }
  };

  const oauthLogin = async (provider: "oauth_google" | "oauth_github") => {
    if (!isLoaded) return;

    await signIn.authenticateWithRedirect({
      strategy: provider,
      redirectUrl: ROUTES.SSO_CALLBACK,
      redirectUrlComplete: ROUTES.POST_LOGIN,
    });
  };
  useEffect(() => {
    if (userId) {
      router.replace("/dashboard");
    }
  }, [userId, router]);

  return (
    <div className="flex pt-20 justify-center bg-white dark:bg-zinc-900 px-4">
      <Card className="w-full max-w-md border-none shadow-none  rounded-2xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl md:text-3xl font-bold text-center flex items-center justify-center">
            Sign in to
            <Image
              src={Logo}
              alt="logo"
              width={60}
              height={60}
              className="ml-2 bg-transparent dark:mix-blend-lighten"
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

          <div className="flex  gap-2 mb-4">
            <Button
              aria-label="Sign in with Google"
              onClick={() => oauthLogin("oauth_google")}
              variant="outline"
              disabled={isSubmitting || !isLoaded}
              className="w-full flex items-center gap-2 border-zinc-300 hover:bg-zinc-100 
               dark:border-zinc-700 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:text-white"
            >
              <Image src={google} alt="Google" className="h-4 w-4" />
              Google
            </Button>
            <Button
              onClick={() => oauthLogin("oauth_github")}
              variant="outline"
              disabled={isSubmitting || !isLoaded}
              className="w-full flex items-center gap-2 border-zinc-300 hover:bg-zinc-100 
               dark:border-zinc-700  hover:text-zinc-900 dark:hover:bg-zinc-800 dark:text-white"
            >
              <Github className="h-4 w-4" /> GitHub
            </Button>
          </div>

          <div className="relative flex items-center my-4">
            <div className="flex-grow border-t border-gray-300 dark:border-zinc-700"></div>
            <span className="mx-2 text-xs uppercase text-zinc-500 dark:text-zinc-400">
              or
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-zinc-700"></div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative group">
                <Mail className="      absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4
      text-zinc-400 dark:text-zinc-500
      transition-colors duration-200
      group-focus-within:text-zinc-700
      dark:group-focus-within:text-zinc-300" />

                <Input
                  id="email"
                  type="email"
                  autoFocus
                  placeholder="Enter your email"
                  className="pl-10 focus-visible:ring-transparent focus-visible:border-zinc-400"
                  {...register("email")}
                />
              </div>

              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative group">
  <Lock
    aria-hidden
    className="
      absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4
      text-zinc-400 dark:text-zinc-500
      transition-colors duration-200
      group-focus-within:text-zinc-700
      dark:group-focus-within:text-zinc-300
    "
  />

  <Input
    id="password"
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    className="
      pl-10 pr-10
      bg-white dark:bg-zinc-900
      border-zinc-200 dark:border-zinc-700
      text-zinc-900 dark:text-zinc-100
      placeholder:text-zinc-400 dark:placeholder:text-zinc-500
      transition-all duration-200
      focus-visible:ring-0
      focus-visible:border-zinc-400
      dark:focus-visible:border-zinc-500
    "
    {...register("password")}
  />

    {/* Eye toggle */}
<Button
  type="button"
  aria-label={showPassword ? "Hide password" : "Show password"}
  onClick={() => setShowPassword((v) => !v)}
  variant={"ghost"}
  className="
    absolute right-3 top-1/2 -translate-y-1/2
    flex items-center justify-center
    rounded-md
    text-zinc-400 dark:text-zinc-500
    hover:text-zinc-700 dark:hover:text-zinc-300
    hover:bg-transparent dark:hover:bg-zinc-800
    transition-colors duration-200
    focus-visible:outline-none
    focus-visible:ring-2
    focus-visible:ring-zinc-300 dark:focus-visible:ring-zinc-600
  "
>
  {showPassword ? (
    <EyeClosed className="h-4 w-4" />
  ) : (
    <Eye className="h-4 w-4" />
  )}
</Button>

</div>

              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-800 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                <>Sign in with Email</>
              )}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a
              href="/register"
              className="text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
