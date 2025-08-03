"use client";

import api from "@/lib/api";
import { Quiz } from "@/lib/types";
import { Marquee } from "@/components/magicui/marquee";

export default function Test() {

  return (
    <Marquee>
      <span>Next.js</span>
      <span>React</span>
      <span>TypeScript</span>
      <span>Tailwind CSS</span>
    </Marquee>
  );
}
