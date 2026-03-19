"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/lib/auth/auth-client";
import { BACKEND_URL } from "@/lib/constants";
import { getAuthFetchOptions } from "@/lib/auth/authService";
import { ContestDetail, LeaderboardEntry } from "@/lib/types";
import Link from "next/link";
import { Trophy, Clock, Users, Calendar, ArrowLeft, Medal } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export default function ContestDetailPage() {
  const params = useParams();
  const contestId = params.id as string;
  const { data: session } = useSession();
  const [contest, setContest] = useState<ContestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestDetail();
  }, [contestId]);

  const fetchContestDetail = async () => {
    try {
      const token = session?.session?.token;
      const res = await fetch(`${BACKEND_URL}/contests/${contestId}`, getAuthFetchOptions(token || ""));
      const data = await res.json();
      setContest(data.contest);
    } catch (error) {
      console.error("Failed to fetch contest detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: ContestDetail["status"]) => {
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
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="h-5 w-5 flex items-center justify-center font-semibold">{rank}</span>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Contest not found</h2>
        <Link href="/dashboard/contests">
          <Button variant="link">Back to Contests</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/dashboard/contests">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{contest.title}</h1>
          <p className="text-muted-foreground">{contest.description}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Contest Details</CardTitle>
              <CardDescription>Information about this contest</CardDescription>
            </div>
            {getStatusBadge(contest.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Time</p>
                <p className="text-sm text-muted-foreground">{formatDate(contest.startTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End Time</p>
                <p className="text-sm text-muted-foreground">{formatDate(contest.endTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Participants</p>
                <p className="text-sm text-muted-foreground">{contest.participantCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {contest.topParticipants && contest.topParticipants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Top Participants
            </CardTitle>
            <CardDescription>Leaderboard for this contest</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contest.topParticipants.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={entry.userAvatar} alt={entry.userName} />
                      <AvatarFallback>{entry.userName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{entry.userName}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      Score: {entry.score}
                    </span>
                    <span className="text-muted-foreground">
                      Accuracy: {entry.accuracy}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {contest.status === "active" && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ready to participate?</p>
                <p className="text-sm text-muted-foreground">
                  Start the quiz now and compete with others
                </p>
              </div>
              <Button asChild>
                <Link href={`/dashboard/quiz/${contest.quizId}`}>
                  Start Quiz
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
