"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { BACKEND_URL } from "@/lib/constants";
import { getAuthFetchOptions } from "@/lib/auth/authService";
import { Contest } from "@/lib/types";
import Link from "next/link";
import { Trophy, Clock, Users, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function ContestsPage() {
  const { data: session } = useSession();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  const fetchContests = async () => {
    try {
      const token = session?.session?.token;
      const res = await fetch(`${BACKEND_URL}/contests`, getAuthFetchOptions(token || ""));
      const data = await res.json();
      setContests(data.contests || []);
    } catch (error) {
      console.error("Failed to fetch contests:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Contest["status"]) => {
    const variants = {
      upcoming: "secondary",
      active: "default",
      ended: "outline",
    } as const;

    return (
      <Badge variant={variants[status]} className="capitalize">
        {status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No contests yet</h2>
        <p className="text-muted-foreground">Check back later for upcoming contests</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contests</h1>
        <p className="text-muted-foreground">Participate in challenges and compete with others</p>
      </div>

      <div className="grid gap-4">
        {contests.map((contest) => (
          <Card key={contest.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{contest.title}</CardTitle>
                  <CardDescription>{contest.description}</CardDescription>
                </div>
                {getStatusBadge(contest.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDate(contest.startTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{contest.participantCount} participants</span>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Link
                  href={`/dashboard/contests/${contest.id}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
