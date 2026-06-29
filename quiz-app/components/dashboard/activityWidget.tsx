import { HugeiconsIcon } from "@hugeicons/react";
import { Activity03Icon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ActivityChartProps {
  data: Array<{
    name: string;
    quizzes: number;
    score: number;
    date?: string;
    day?: string;
  }>;
}

const ActivityChart = ({ data }: ActivityChartProps) => {
  const hasData = data && data.length > 0 && data.some((d) => d.quizzes > 0);

  if (!hasData) {
    return (
      <Card className="col-span-full bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800/60 shadow-none rounded-2xl">
        <CardHeader className="p-5 sm:p-6 pb-4">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
              <HugeiconsIcon
                icon={Activity03Icon}
                size={16}
                className="text-indigo-500 dark:text-indigo-400"
              />
            </span>
            Performance Trend
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 sm:p-6 pt-2">
          <div className="h-[240px] w-full flex items-center justify-center rounded-xl border border-dashed border-neutral-200 dark:border-zinc-800 bg-neutral-50/40 dark:bg-zinc-900/30">
            <div className="text-center">
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800 shadow-sm flex items-center justify-center mb-3 mx-auto">
                <HugeiconsIcon
                  icon={Activity03Icon}
                  size={18}
                  className="text-neutral-400 dark:text-zinc-500"
                />
              </div>
              <p className="text-sm font-medium text-neutral-900 dark:text-zinc-100 mb-1">
                No activity yet
              </p>
              <p className="text-xs text-neutral-400 dark:text-zinc-500 max-w-xs">
                Take some quizzes to see your performance trend here.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalQuizzes = data.reduce((sum, d) => sum + (d.quizzes || 0), 0);
  const avgScore = (() => {
    const active = data.filter((d) => d.quizzes > 0);
    if (!active.length) return 0;
    return Math.round(
      active.reduce((sum, d) => sum + (d.score || 0), 0) / active.length
    );
  })();

  return (
    <Card className="col-span-full bg-white dark:bg-zinc-900 border border-neutral-200/70 dark:border-zinc-800/60 shadow-none rounded-2xl">
      <CardHeader className="p-5 sm:p-6 pb-4 flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            <span className="w-7 h-7 rounded-md bg-indigo-50 dark:bg-indigo-500/15 flex items-center justify-center">
              <HugeiconsIcon
                icon={Activity03Icon}
                size={16}
                className="text-indigo-500 dark:text-indigo-400"
              />
            </span>
            Performance Trend
          </CardTitle>
          <p className="text-xs text-neutral-400 dark:text-zinc-500 mt-1 ml-9">
            Average score over the last 30 days
          </p>
        </div>
        <div className="flex gap-5 flex-shrink-0">
          <div className="text-right">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
              {avgScore}%
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-zinc-500 mt-1">
              Avg score
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 leading-none">
              {totalQuizzes}
            </p>
            <p className="text-[11px] text-neutral-400 dark:text-zinc-500 mt-1">
              Quizzes
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6 pt-2">
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="currentColor"
                className="opacity-[0.12] text-zinc-400 dark:text-zinc-600"
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                className="text-zinc-400 dark:text-zinc-500"
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
                width={42}
                className="text-zinc-400 dark:text-zinc-500"
              />
              <Tooltip
                cursor={{ stroke: "#6366f1", strokeOpacity: 0.3, strokeWidth: 1 }}
                content={({
                  active,
                  payload,
                  label,
                }: {
                  active?: boolean;
                  payload?: any[];
                  label?: string;
                }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-zinc-200/60 dark:ring-zinc-700/60 rounded-xl p-3">
                        <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 mb-1.5">
                          {d.day} · {label}
                        </p>
                        <div className="space-y-0.5">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-indigo-500" />
                            Avg score: {payload[0].value}%
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 ml-3.5">
                            {d.quizzes} quiz{d.quizzes === 1 ? "" : "zes"} taken
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#scoreFill)"
                dot={false}
                activeDot={{
                  r: 4,
                  fill: "#6366f1",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityChart;
