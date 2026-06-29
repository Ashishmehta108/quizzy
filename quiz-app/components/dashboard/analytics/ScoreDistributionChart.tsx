/**
 * @layer component
 * @owner agent-4
 */
"use client";

import React from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, AreaChart, Area 
} from "recharts";

export default function ScoreDistributionChart() {
  const data = [
    {range: '0-20', count: 5}, 
    {range: '21-40', count: 12}, 
    {range: '41-60', count: 45}, 
    {range: '61-80', count: 32}, 
    {range: '81-100', count: 18}
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="distFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="currentColor"
          className="opacity-[0.12] text-zinc-400 dark:text-zinc-600"
        />
        <XAxis
          dataKey="range"
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
          contentStyle={{
            borderRadius: 12,
            border: "1px solid rgba(161,161,170,0.25)",
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="count"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#distFill)"
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
