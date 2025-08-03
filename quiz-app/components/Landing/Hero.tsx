"use client";
import { AnimatedElement, WipeText } from "@/app/page";
import {
  ArrowRight,
  ArrowUpRight,
  Brain,
  ChevronsRight,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { SafariDashboard } from "./SafariDashboard";

export default function Hero() {
  const router = useRouter();

  const handleLink = (link: string) => {
    router.push(`/${link}`);
  };
  return (
    <section className="pt-10 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center max-w-5xl mx-auto">
          <AnimatedElement delay={200}>
            <div className=" mb-8 inline-flex max-w-full items-center gap-2 rounded-full bg-sky-50/50 px-2 py-0.5 pr-2.5 pl-0.5 font-medium text-gray-900 text-xs ring-1 shadow-lg shadow-sky-400/20 ring-sky-200/20 filter backdrop-blur-[1px] transition-colors hover:bg-sky-500/[2.5%] focus:outline-hidden sm:text-sm dark:bg-sky-950/20 dark:text-gray-100 dark:ring-sky-800/30 dark:shadow-sky-400/10 cursor-pointer">
              <span className="shrink-0 truncate rounded-full border border-sky-200/20 bg-sky-50 px-2 py-0.5 text-xs text-sky-600 dark:border-sky-800/30 dark:bg-sky-900/20 dark:text-sky-300">
                New
              </span>
              <span className="flex items-center gap-0.5 truncate sm:gap-1">
                <span className="w-full truncate text-xs sm:text-sm">
                  Start creating quiz
                </span>
                <ArrowUpRight className="w-4 h-4 text-sky-500 hover:-translate-y-0.5 transition-transform hover:translate-x-0.5 " />
              </span>
            </div>
            {/* <Badge className="mb-8 bg-white text-neutral-800 shadow-md shadow-cyan-500/20 border border-cyan-100/30  px-5 text-xs ">
						<Sparkles className="w-4 h-4 mr-2" />
						Powered by AI
					</Badge> */}
          </AnimatedElement>

          <AnimatedElement delay={400}>
            <h1 className="text-5xl gzap-y-2 sm:text-6xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-8 leading-tight tracking-tight">
              Create Smart Quizzes
              <br />
              <WipeText />
            </h1>
          </AnimatedElement>

          <AnimatedElement delay={600}>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed">
              Transform any topic, document, or idea into engaging quizzes using
              cutting-edge AI.
              <br className="hidden sm:block" />
              Perfect for students, educators, and professionals who demand
              excellence.
            </p>
          </AnimatedElement>

          <AnimatedElement delay={800}>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
             
              <Button className="text-sm bg-blue-500 hover:bg-blue-600   font-medium group rounded-full py-6">
                Start Creating Now{" "}
              </Button>
            </div>
          </AnimatedElement>

          <AnimatedElement
            delay={1000}
            type="scale"
            className="container mx-auto max-w-7xl "
          >
            <SafariDashboard />
          </AnimatedElement>
        </div>
      </div>
    </section>
  );
}
