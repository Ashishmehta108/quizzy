"use client";
import { FollowUpMessage, dummyFollowUps } from "@/components/followups/followup";
export default function FollowUpThread() {
    return (
        <div className="flex flex-col gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl min-h-screen overflow-y-auto container max-w-xl">
            {dummyFollowUps.map((msg) => (
                <FollowUpMessage
                    key={msg.id}
                    role={msg.role as "user" | "assistant"}
                    message={msg.message}
                    timestamp={msg.timestamp}
                />
            ))}
        </div>
    );
}
