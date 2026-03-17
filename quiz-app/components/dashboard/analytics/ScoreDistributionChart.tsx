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
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="range" fontSize={12} />
        <YAxis fontSize={12} />
        <ReTooltip />
        <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
