"use client";
export const dummyFollowUps = [
    {
        id: "1",
        role: "user",
        message: "Can you explain more about closures?",
        timestamp: "10:15 AM",
    },
    {
        id: "2",
        role: "assistant",
        message:
            "Sure! A closure is when a function remembers variables from its outer scope even after that scope has finished executing.",
        timestamp: "10:16 AM",
    },
    {
        id: "3",
        role: "user",
        message: "Can you give me a real-world example?",
        timestamp: "10:17 AM",
    },
    {
        id: "4",
        role: "assistant",
        message:
            "For example, imagine a counter function that increments a value. Each call remembers the current value because of closure.",
        timestamp: "10:18 AM",
    },
];



import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FollowUpMessageProps {
    message: string;
    role?: "user" | "assistant";
    timestamp?: string;
}

export function FollowUpMessage({
    message,
    role = "assistant",
    timestamp,
}: FollowUpMessageProps) {
    const isUser = role === "user";

    return (
        <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
                "flex items-end gap-2 w-full",
                isUser ? "justify-end" : "justify-start"
            )}
        >
            {!isUser && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-zinc-300 text-zinc-700 text-xs">
                        AI
                    </AvatarFallback>
                </Avatar>
            )}

            <div className="flex flex-col max-w-[200px]">
                <Card
                    className={cn(
                        "rounded-2xl shadow-sm px-4 py-2 text-sm",
                        isUser
                            ? "bg-zinc-800 text-zinc-100 border-zinc-700"
                            : "bg-zinc-800 text-zinc-100 border-zinc-700"
                    )}
                >
                    <CardContent className="p-0">{message}</CardContent>
                </Card>
                {timestamp && (
                    <span className="text-[10px] text-zinc-500 mt-1 self-end">
                        {timestamp}
                    </span>
                )}
            </div>

            {isUser && (
                <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-zinc-700 text-zinc-100 text-xs">
                        U
                    </AvatarFallback>
                </Avatar>
            )}
        </motion.div>
    );
}
