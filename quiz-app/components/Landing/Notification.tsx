"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AnimatedList } from "../magicui/animated-list";
import ip from "@/public/iPhone 16 Pro Max.png";

interface NotificationItem {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
}

const notifications: NotificationItem[] = [
  {
    name: "New Quiz Available",
    description: "Test your knowledge on Science!",
    time: "just now",
    icon: "🧪",
    color: "#1E86FF",
  },
  {
    name: "Score Update",
    description: "You scored 85% on 'Math Basics' quiz.",
    time: "5m ago",
    icon: "📊",
    color: "#FFB800",
  },
  {
    name: "Daily Streak",
    description: "You completed 3 quizzes today! 🔥",
    time: "10m ago",
    icon: "🔥",
    color: "#FF3D71",
  },
  {
    name: "Friend Challenge",
    description: "Rohit challenged you to a 'History' quiz.",
    time: "15m ago",
    icon: "⚔️",
    color: "#00C9A7",
  },
  {
    name: "Achievement Unlocked",
    description: "Completed 10 quizzes this week.",
    time: "30m ago",
    icon: "🏆",
    color: "#FFD700",
  },
  {
    name: "General Knowledge Quiz",
    description: "New quiz is live now!",
    time: "35m ago",
    icon: "🧠",
    color: "#6B21A8",
  },
  {
    name: "Challenge Completed",
    description: "You completed 'Science Quiz Challenge'!",
    time: "45m ago",
    icon: "🎯",
    color: "#F97316",
  },
];

const NotificationCard = ({
  name,
  description,
  icon,
  color,
  time,
  delay = 0,
}: NotificationItem & { delay?: number }) => (
  <motion.figure
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 300, damping: 25, delay }}
    className={cn(
      "relative mx-auto min-h-fit w-full max-w-[250px] cursor-pointer overflow-hidden rounded-2xl p-3",
      "bg-white/80 dark:bg-zinc-900/70 backdrop-blur-md border border-zinc-200 dark:border-zinc-700",
      "transition-all duration-200 ease-in-out hover:scale-[103%]"
    )}
  >
    <div className="flex items-center gap-2">
      <div
        className="flex w-10 h-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: color }}
      >
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex flex-col overflow-hidden">
        <figcaption className="flex items-center text-sm font-medium dark:text-white">
          <span>{name}</span>
          <span className="mx-1 text-gray-400 text-xs">·</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {time}
          </span>
        </figcaption>
        <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
          {description}
        </p>
      </div>
    </div>
  </motion.figure>
);

export function IphonePopup() {
  return (
    <div className="relative w-full max-w-xl mx-auto mt-16 mb-10">
      <div className="text-center mb-8 gap-y-3">
        <h2 className="text-4xl   font-bold text-zinc-900 dark:text-white">
          Upcoming Quizzy App Features
        </h2>
        <p className="text-sm sm:text-base mt-2 text-zinc-600 dark:text-zinc-300">
          Stay updated with live notifications from your favorite quizzes
        </p>
      </div>

      <div className="relative  max-w-xs mx-auto">
        <Image
          src={ip}
          alt="iPhone 16 Pro Max"
          width={300}
          height={600}
          className="w-full h-auto relative z-0"
        />

        {/* Notifications inside phone */}
        <div className="absolute inset-x-0 top-16 px-4 flex flex-col gap-2 overflow-hidden z-10">
          <AnimatedList className="flex flex-col gap-2">
            {notifications.map((item, idx) => (
              <NotificationCard key={idx} {...item} delay={idx * 0.15} />
            ))}
          </AnimatedList>
        </div>
      </div>
    </div>
  );
}
