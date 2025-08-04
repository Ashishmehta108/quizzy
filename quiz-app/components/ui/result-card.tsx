"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Result } from "@/lib/types";

interface ResultTableProps {
  results: { data: Result[] }; 
}

export default function ResultTable({ results }: ResultTableProps) {
  console.log(results);
  const [_, setIsMobile] = useState(false);
  const [sortDesc, setSortDesc] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);
  const filteredResults = useMemo(() => {
    //@ts-ignore
    const sorted = results.data.sort((a, b) => {
      const dateA = new Date(a?.submittedAt || Date.now()).getTime();
      const dateB = new Date(b?.submittedAt || Date.now()).getTime();
      return sortDesc ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  }, [results, sortDesc]);

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-6xl  mx-auto px-2 sm:px-4 md:px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Your Quiz Results</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSortDesc((prev) => !prev)}
          className="flex items-center gap-2"
        >
          {sortDesc ? (
            <Trophy className="w-4 h-4" />
          ) : (
            <Calendar className="w-4 h-4" />
          )}
          Sort by Date
        </Button>
      </div>

      <Table className="cursor-pointer">
        <TableHeader>
          <TableRow>
            <TableHead>Quiz Title</TableHead>
            <TableHead className="text-center">Score</TableHead>
            <TableHead className="text-center">Percentage</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredResults.map((result: Result) => {
            const total = JSON.parse(result.optionsReview).length || 1;
            const percentage = Math.round((result.score / total) * 100);
            const date = result?.submittedAt
              ? new Date(result?.submittedAt).toLocaleDateString()
              : "Not specified";

            return (
              <TableRow key={result.id}>
                <TableCell>{result.title || "Untitled Quiz"}</TableCell>
                <TableCell className="text-center">
                  {result.score}/{total}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    className={`text-white ${getScoreColor(
                      percentage
                    )} hover:bg-${getScoreColor(percentage)}/50`}
                  >
                    {percentage}%
                  </Badge>
                </TableCell>
                <TableCell>{date}</TableCell>
                <TableCell className="text-center">
                  <Link href={`/dashboard/results/${result.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-blue-900 text-white  hover:bg-blue-800"
                    >
                      View
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filteredResults.length === 0 && (
        <div className="text-center text-muted-foreground text-sm py-6">
          No results found.
        </div>
      )}
    </div>
  );
}
