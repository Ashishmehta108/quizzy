import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { AnimatedElement } from "@/app/page";
const reviews = [
  {
    name: "Anonymous",
    username: "@anonymous",
    body: "Fun, easy-to-use quiz app with a wide variety of topics, instant feedback, and great progress tracking.",
    img: "https://avatar.vercel.sh/anonymous",
  },
  {
    name: "Akshay",
    username: "@akshay",
    body: "Rest interface is good and features too.",
    img: "https://avatar.vercel.sh/akshay",
  },
  {
    name: "Nitesh",
    username: "@nitesh",
    body: "I played 2 types of quizzes, I enjoyed a lot.",
    img: "https://avatar.vercel.sh/nitesh",
  },
  {
    name: "Priya",
    username: "@priya",
    body: "This app makes learning so fun and interactive!",
    img: "https://avatar.vercel.sh/priya",
  },
  {
    name: "Rohan",
    username: "@rohan",
    body: "Great way to test my knowledge on different topics quickly.",
    img: "https://avatar.vercel.sh/rohan",
  },
  {
    name: "Sneha",
    username: "@sneha",
    body: "Love the instant feedback feature, keeps me motivated!",
    img: "https://avatar.vercel.sh/sneha",
  },
];

const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);

const ReviewCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <figure
      className={cn(
        "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4 transition-colors",
        "bg-white hover:bg-zinc-100 border-zinc-200",
        "dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img
          className="rounded-full"
          width="32"
          height="32"
          alt={name}
          src={img}
        />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium text-zinc-900 dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            {username}
          </p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
        {body}
      </blockquote>
    </figure>
  );
};

export function TestimonialsSection() {
  return (
    <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white dark:bg-zinc-950 dark:border-t">
      <div className="max-w-7xl mx-auto">
        <AnimatedElement>
          <div className="text-center mb-24">
            <h2 className="text-2xl sm:text-5xl font-bold text-zinc-900 dark:text-white mb-8 tracking-tight">
              Loved by{" "}
              <span className="text-blue-600 dark:text-blue-400">learners</span>{" "}
              everywhere
            </h2>
            <p className="text-lg text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto">
              Join thousands who have transformed their learning experience
            </p>
          </div>
        </AnimatedElement>

        <AnimatedElement>
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
            <Marquee pauseOnHover className="[--duration:20s]">
              {firstRow.map((review) => (
                <ReviewCard key={review.username} {...review} />
              ))}
            </Marquee>
            <Marquee reverse pauseOnHover className="[--duration:20s]">
              {secondRow.map((review) => (
                <ReviewCard key={review.username} {...review} />
              ))}
            </Marquee>

            {/* Gradient edges for light and dark mode */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-zinc-950"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-zinc-950"></div>
          </div>
        </AnimatedElement>
      </div>
    </section>
  );
}
