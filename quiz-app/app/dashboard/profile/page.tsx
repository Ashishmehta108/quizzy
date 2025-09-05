"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const Profile = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { user, isLoaded } = useUser();
  const { signOut, openUserProfile } = useClerk();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isLoaded) {
    return (
      <Card className="max-w-md mx-auto mt-10 bg-zinc-100/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-4 w-48" />
      </Card>
    );
  }

  return (
    <Card className="max-w-xl mx-auto mt-10 bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl transition-colors">
      {/* Header */}
      <CardHeader className="flex flex-col items-center text-center pb-6">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-zinc-300 via-zinc-200 to-zinc-400 dark:from-zinc-700 dark:via-zinc-600 dark:to-zinc-400 blur-md opacity-40" />
          <Avatar className="h-20 w-20 ring-2 ring-zinc-300 dark:ring-zinc-700 relative z-10">
            <AvatarImage
              src={user?.imageUrl || "https://github.com/shadcn.png"}
              alt={user?.fullName || "User"}
            />
            <AvatarFallback className="bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </div>
        <CardTitle className="mt-4 text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          {user?.fullName ?? "Unnamed User"}
        </CardTitle>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {user?.username
            ? `@${user.username}`
            : user?.primaryEmailAddress?.emailAddress}
        </p>
      </CardHeader>

      {/* Content */}
      <CardContent className="space-y-4 px-6">
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400 mr-3">Email</span>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {user?.primaryEmailAddress?.emailAddress ??
              user?.emailAddresses?.[0]?.emailAddress ??
              "No email"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500 dark:text-zinc-400">Joined</span>
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString()
              : "Unknown"}
          </span>
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="flex gap-3 px-6 pb-6">
        <Button
          variant="outline"
          onClick={() => openUserProfile()}
          className="flex-1 border-zinc-300 text-zinc-700 hover:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800 hover:text-zinc-800"
        >
          Edit Profile
        </Button>
        <Button
          onClick={() => signOut()}
          className="flex-1 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 dark:bg-zinc-700 dark:hover:bg-zinc-600"
        >
          Sign Out
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Profile;
