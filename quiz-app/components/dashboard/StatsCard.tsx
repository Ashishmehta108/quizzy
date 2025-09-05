"use client";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
    title: string;
    value: number;
    icon?: React.ReactNode;
}

export function StatsCard({ title, value, icon }: StatsCardProps) {
    return (
        <Card className="flex-1 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800">
            <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        {value}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
