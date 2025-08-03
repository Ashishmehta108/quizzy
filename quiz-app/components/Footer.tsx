import { Brain } from "lucide-react";
import { AnimatedElement } from "@/app/page";
import Image from "next/image";
import Logo from "../public/quizzy_logo.png";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 dark:bg-white border-t border-zinc-800 dark:border-zinc-200 py-16 px-4 mx-3 min-h-[400px] my-20 sm:px-6 lg:px-8 rounded-3xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <AnimatedElement delay={200}>
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-8 md:mb-0">
              <div className="p-3 rounded-xl">
                <Image
                  className="bg-white rounded"
                  src={Logo}
                  alt="logo"
                  width={50}
                  height={50}
                />
              </div>
              <span className="text-2xl font-bold text-white dark:text-zinc-900">
                QuizAI
              </span>
            </div>

            <div className="flex items-center space-x-8 mb-8 md:mb-0">
              {["About", "Contact", "Privacy", "Terms"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-zinc-300 dark:text-zinc-600 hover:text-blue-400 dark:hover:text-blue-600 transition-colors font-medium"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          <div className="border-t border-zinc-800 dark:border-zinc-200 max-w-4xl mx-auto mt-12 pt-8 text-center">
            <p className="text-zinc-400 dark:text-zinc-500">
              © 2025 QuizAI. Crafted with care for learners worldwide.
            </p>
          </div>
        </AnimatedElement>
      </div>
    </footer>
  );
}
