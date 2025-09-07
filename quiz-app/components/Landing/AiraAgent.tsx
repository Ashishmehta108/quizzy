"use client";

import Image from "next/image";
import aira from "@/public/aira.jpg";
import Link from "next/link";
import { InteractiveHoverButton } from "../magicui/interactive-hover-button";

export default function AiraIntro() {
  return (
    <section className="max-w-5xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-16 h-[800px] py-5 px-4 rounded-2xl overflow-hidden">

      <div className="flex-1 text-center lg:text-left text-zinc-900 dark:text-zinc-100">
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 drop-shadow-lg">
          Meet Aira, Your Quiz Helper
        </h2>
        <p className="text-lg sm:text-xl text-zinc-700 dark:text-zinc-300 mb-8 drop-shadow-sm">
          Aira can help you quickly generate search resources and fetch
          knowledge from the web or your study database. Get instant guidance
          for quizzes, topics, and learning content!
        </p>
        <Link href="/dashboard/chat/ai">
          <InteractiveHoverButton>Ask Aira Now</InteractiveHoverButton>
        </Link>
      </div>

      <div className="flex-1 flex justify-center lg:justify-end">
        <Image
          src={aira}
          alt="Aira agent"
          className="rounded-2xl shadow-2xl w-full max-w-[450px] h-[520px] object-cover transition-transform hover:scale-[1.01]"
          priority
        />
      </div>
    </section>
  );
}
