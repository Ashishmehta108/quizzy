"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";

const Profile = () => {
  const [isMounted, setisMounted] = useState(false);
  useEffect(() => {
    setisMounted(true);
  }, []);
  const { userId } = useAuth()
  const { user } = useUser()
  console.log(userId)
  if (!isMounted) return <div>hello</div>;
  return (
    <Card className="max-w-sm mx-auto mt-6 shadow-md">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.imageUrl || "https://github.com/shadcn.png"} alt="profile" />
            <AvatarFallback>
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback> </Avatar><div>
            <CardTitle className="text-lg">Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              {user?.primaryEmailAddress?.emailAddress ??
               user?.emailAddresses?.[0]?.emailAddress ??
            "No email"}
            </p> </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          <span className="font-medium text-muted-foreground">Email:</span>{" "}
         {user?.primaryEmailAddress?.emailAddress ??
           user?.emailAddresses?.[0]?.emailAddress ??
         "No email"}
        </p>
      </CardContent>
    </Card>
  );
};

export default Profile;
