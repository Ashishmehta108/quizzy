/**
 * @layer component
 * @owner agent-4
 */
"use client";

import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer 
} from "recharts";

export default function PerformanceChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="currentColor"
          className="opacity-[0.12] text-zinc-400 dark:text-zinc-600"
        />
        <XAxis
          dataKey="name"
          fontSize={11}
          axisLine={false}
          tickLine={false}
          className="text-zinc-400 dark:text-zinc-500"
        />
        <YAxis
          fontSize={11}
          axisLine={false}
          tickLine={false}
          width={36}
          className="text-zinc-400 dark:text-zinc-500"
        />
        <ReTooltip
          cursor={{ fill: "rgba(99,102,241,0.06)" }}
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(161,161,170,0.25)",
            fontSize: 12,
          }}
        />
        <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  );
}
