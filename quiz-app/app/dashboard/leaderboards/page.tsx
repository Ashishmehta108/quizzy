"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/auth-client";
import { BACKEND_URL } from "@/lib/constants";
import { getAuthFetchOptions } from "@/lib/auth/authService";
import { LeaderboardResponse, LeaderboardEntry, Contest } from "@/lib/types";
import { Trophy, Medal, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LeaderboardsPage() {
  const { data: session } = useSession();
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContestId, setSelectedContestId] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests();
  }, []);

  useEffect(() => {
    if (selectedContestId) {
      fetchLeaderboard(selectedContestId);
    }
  }, [selectedContestId]);

  const fetchContests = async () => {
    try {
      const token = session?.session?.token;
      const res = await fetch(`${BACKEND_URL}/contests`, getAuthFetchOptions(token || ""));
      const data = await res.json();
      const endedContests = (data.contests || []).filter((c: Contest) => c.status === "ended");
      setContests(endedContests);
      if (endedContests.length > 0 && !selectedContestId) {
        setSelectedContestId(endedContests[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch contests:", error);
    }
  };

  const fetchLeaderboard = async (contestId: string) => {
    try {
      const token = session?.session?.token;
      const res = await fetch(`${BACKEND_URL}/contests/${contestId}/leaderboard`, getAuthFetchOptions(token || ""));
      const data = await res.json();
      setLeaderboard(data);
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Medal className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-amber-600" />;
    return (
      <span className="h-6 w-6 flex items-center justify-center font-semibold text-muted-foreground">
        {rank}
      </span>
    );
  };

  if (loading && !leaderboard) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Trophy className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No completed contests</h2>
        <p className="text-muted-foreground">Leaderboards will appear once contests end</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboards</h1>
        <p className="text-muted-foreground">See who&apos;s leading the competition</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Contest</CardTitle>
          <CardDescription>Choose a completed contest to view its leaderboard</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedContestId} onValueChange={setSelectedContestId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a contest" />
            </SelectTrigger>
            <SelectContent>
              {contests.map((contest) => (
                <SelectItem key={contest.id} value={contest.id}>
                  {contest.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {leaderboard && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{leaderboard.contestTitle}</CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {leaderboard.totalParticipants} participants
                    </span>
                  </CardDescription>
                </div>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Rankings based on score and accuracy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={entry.userAvatar} alt={entry.userName} />
                        <AvatarFallback className="text-sm">{entry.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{entry.userName}</p>
                        <p className="text-xs text-muted-foreground">
                          Completed {new Date(entry.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm font-semibold">{entry.score} pts</p>
                        <p className="text-xs text-muted-foreground">{entry.accuracy}% accuracy</p>
                      </div>
                      {entry.timeTaken && (
                        <div className="text-right hidden md:block">
                          <p className="text-xs text-muted-foreground">Time</p>
                          <p className="text-xs font-medium">{Math.floor(entry.timeTaken / 60)}m {entry.timeTaken % 60}s</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
