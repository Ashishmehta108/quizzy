"use client";

import type React from "react";
import { motion } from "framer-motion";
import { useInView, Variants } from "framer-motion";
import { useRef } from "react";
import { TestimonialsSection } from "@/components/Landing/Testimonials";
import { Features } from "@/components/Landing/Features";
import Footer from "@/components/Footer";
import CTA from "@/components/Landing/CTA";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Landing/Hero";
import { NavbarDemo } from "@/components/Landing/LandingNavbar";
import Info from "@/components/Landing/Info";

interface AnimatedElementProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  type?: "fadeUp" | "fadeIn" | "scale";
}

const variants: Record<NonNullable<AnimatedElementProps["type"]>, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
};

export const AnimatedElement = ({
  children,
  delay = 0,
  className = "",
  type = "fadeUp",
}: AnimatedElementProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={variants[type]}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ delay: delay / 1000, duration: 0.6, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export function WipeText() {
  return (
    <div className="relative -rotate-2 my-2 inline-block overflow-hidden rounded">
      <motion.div
        className="absolute inset-0 bg-blue-500"
        initial={{ x: "-100%" }}
        animate={{ x: "0%" }}
        transition={{
          duration: 1.5,
          ease: "easeInOut",
        }}
      />

      <span className="relative  inline-block px-4 py-1  text-white">
        In Seconds
      </span>
    </div>
  );
}

const QuizAppLanding = () => {
  return (
    <div className="min-h-screen pb-8 relative  dark:bg-zinc-950 transition-colors duration-300">
      <NavbarDemo />
      <Hero />
      <Features />
      <Info />
      <TestimonialsSection />
      <CTA />
      <Footer />
    </div>
  );
};

export default QuizAppLanding;
