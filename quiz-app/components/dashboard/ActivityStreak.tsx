"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  FlameIcon,
  ChampionIcon,
  CalendarCheckIcon,
  FlashIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface ActivityDatum {
  date?: string; // YYYY-MM-DD
  quizzes: number;
  score?: number;
}

interface Props {
  data: ActivityDatum[];
  /** number of weeks to render in the heatmap */
  weeks?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function toKey(d: Date) {
  return d.toISOString().split("T")[0];
}

/** intensity bucket 0–4 for a quiz count */
function level(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  if (count <= 4) return 3;
  return 4;
}

const CELL_COLORS = [
  "bg-zinc-100 dark:bg-zinc-800/50", // 0
  "bg-indigo-200 dark:bg-indigo-900/70", // 1
  "bg-indigo-300 dark:bg-indigo-700", // 2
  "bg-indigo-500 dark:bg-indigo-500", // 3
  "bg-indigo-600 dark:bg-indigo-400", // 4
];

const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function StatChip({
  icon,
  label,
  value,
}: {
  icon: typeof FlameIcon;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-neutral-200/70 dark:border-zinc-800/70 bg-neutral-50/60 dark:bg-zinc-800/30 px-3 py-2">
      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-indigo-50 text-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-400">
        <HugeiconsIcon icon={icon} size={15} />
      </div>
      <div className="min-w-0">
        <p className="text-base font-semibold text-neutral-900 dark:text-zinc-100 leading-none">
          {value}
        </p>
        <p className="text-[11px] text-neutral-400 dark:text-zinc-500 mt-1 truncate">
          {label}
        </p>
      </div>
    </div>
  );
}

export default function ActivityStreak({ data, weeks = 14 }: Props) {
  const { cells, stats } = React.useMemo(() => {
    // date -> quizzes map
    const map = new Map<string, number>();
    (data ?? []).forEach((d) => {
      if (d?.date) map.set(d.date, (map.get(d.date) ?? 0) + (d.quizzes ?? 0));
    });

    // build the grid: end at today, walk back to the start of the week `weeks` ago
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    // pad to end of current week (Sat)
    end.setDate(end.getDate() + (6 - end.getDay()));
    const totalDays = weeks * 7;
    const start = new Date(end.getTime() - (totalDays - 1) * DAY_MS);

    const grid: { date: Date; key: string; count: number; future: boolean }[] =
      [];
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(start.getTime() + i * DAY_MS);
      const key = toKey(date);
      grid.push({
        date,
        key,
        count: map.get(key) ?? 0,
        future: date.getTime() > today.getTime(),
      });
    }

    // streaks computed on the real daily series up to today
    let current = 0;
    let longest = 0;
    let run = 0;
    let activeDays = 0;
    let totalQuizzes = 0;

    const upToToday = grid.filter((c) => !c.future);
    upToToday.forEach((c) => {
      if (c.count > 0) {
        run += 1;
        activeDays += 1;
        totalQuizzes += c.count;
        longest = Math.max(longest, run);
      } else {
        run = 0;
      }
    });
    // current streak = trailing run ending today (or yesterday if today empty)
    for (let i = upToToday.length - 1; i >= 0; i--) {
      const c = upToToday[i];
      if (c.count > 0) current += 1;
      else if (i === upToToday.length - 1) continue; // allow today to be empty
      else break;
    }

    return {
      cells: grid,
      stats: { current, longest, activeDays, totalQuizzes },
    };
  }, [data, weeks]);

  return (
    <div className="rounded-2xl border border-neutral-200/70 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-zinc-100">
            Activity
          </h3>
          <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-0.5">
            Your quiz activity over the last {weeks} weeks
          </p>
        </div>
      </div>

      {/* Streak stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        <StatChip
          icon={FlameIcon}
          label="Current streak"
          value={`${stats.current} ${stats.current === 1 ? "day" : "days"}`}
        />
        <StatChip
          icon={ChampionIcon}
          label="Longest streak"
          value={`${stats.longest} ${stats.longest === 1 ? "day" : "days"}`}
        />
        <StatChip
          icon={CalendarCheckIcon}
          label="Active days"
          value={stats.activeDays}
        />
        <StatChip
          icon={FlashIcon}
          label="Quizzes taken"
          value={stats.totalQuizzes}
        />
      </div>

      {/* Heatmap */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {/* weekday labels */}
        <div className="grid grid-rows-7 gap-[3px] pr-1 flex-shrink-0">
          {WEEKDAY_LABELS.map((d, i) => (
            <div
              key={i}
              className="h-[13px] text-[9px] leading-[13px] text-neutral-400 dark:text-zinc-600 text-right w-7"
            >
              {d}
            </div>
          ))}
        </div>

        {/* week columns */}
        <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
          {cells.map((c) => (
            <div
              key={c.key}
              title={
                c.future
                  ? ""
                  : `${c.count} quiz${c.count === 1 ? "" : "zes"} • ${c.date.toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" }
                    )}`
              }
              className={cn(
                "h-[13px] w-[13px] rounded-[3px] transition-colors",
                c.future
                  ? "bg-transparent"
                  : CELL_COLORS[level(c.count)],
                !c.future &&
                  "ring-1 ring-inset ring-black/[0.02] dark:ring-white/[0.02] hover:ring-black/10 dark:hover:ring-white/20"
              )}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-4">
        <span className="text-[10px] text-neutral-400 dark:text-zinc-600">
          Less
        </span>
        {CELL_COLORS.map((c, i) => (
          <span key={i} className={cn("h-[11px] w-[11px] rounded-[3px]", c)} />
        ))}
        <span className="text-[10px] text-neutral-400 dark:text-zinc-600">
          More
        </span>
      </div>
    </div>
  );
}
