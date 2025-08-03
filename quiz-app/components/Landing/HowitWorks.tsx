"use client"
import { AnimatedElement } from "@/app/page";
import { Book, Check, Users, Zap } from "lucide-react";
import { useEffect, useState } from "react";


const StepAnimation = ({
    step,
    index,
    isActive,
}: {
    step: any;
    index: number;
    isActive: boolean;
}) => {
    return (
        <div className="text-center relative">
            <div className="relative mb-8">
                <div
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 shadow-lg ${isActive
                        ? "bg-blue-600 dark:bg-blue-500 scale-110"
                        : "bg-blue-100 dark:bg-blue-900/50"
                        }`}
                >
                    <step.icon
                        className={`h-10 w-10 transition-colors duration-500 ${isActive ? "text-white" : "text-blue-600 dark:text-blue-400"
                            }`}
                    />
                </div>
                <div
                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm transition-all duration-500 ${isActive
                        ? "bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500"
                        : "bg-white dark:bg-gray-800 border-blue-600 dark:border-blue-400"
                        }`}
                >
                    {isActive ? (
                        <Check className="w-4 h-4 text-white" />
                    ) : (
                        <span
                            className={`text-sm font-bold ${isActive ? "text-white" : "text-blue-600 dark:text-blue-400"
                                }`}
                        >
                            {index + 1}
                        </span>
                    )}
                </div>
            </div>
            <h3
                className={`text-xl font-bold mb-4 transition-colors duration-500 ${isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-900 dark:text-white"
                    }`}
            >
                {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-xs mx-auto">
                {step.description}
            </p>
        </div>
    );
};
const steps = [
    {
        icon: Book,
        title: "Choose Your Content",
        description:
            "Select a topic, upload documents, or write a custom prompt to get started",
    },
    {
        icon: Zap,
        title: "AI Creates Quiz",
        description:
            "Our advanced AI instantly analyzes and generates tailored questions",
    },
    {
        icon: Users,
        title: "Learn & Engage",
        description:
            "Take interactive quizzes and ask questions to enhance learning",
    },
];

export default function HowItworks() {

    const [activeStep, setActiveStep] = useState(0);
    useEffect(() => {
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % 3);
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    return (<section
        className="py-32 bg-zinc-950 dark:border-t   dark:bg-zinc-950 px-4 sm:px-6 lg:px-8"
    >
        <div className="max-w-7xl mx-auto">
            <AnimatedElement delay={200}>
                <div className="text-center mb-24">
                    <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-8 tracking-tight">
                        How it{" "}
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                            works
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                        Get started in three beautifully simple steps
                    </p>
                </div>
            </AnimatedElement>

            <div className="grid md:grid-cols-3 gap-12 relative">
                {steps.map((step, index) => (
                    <AnimatedElement key={index} delay={400 + index * 300}>
                        <StepAnimation
                            step={step}
                            index={index}
                            isActive={activeStep >= index}
                        />
                    </AnimatedElement>
                ))}
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center mt-12 space-x-2">
                {steps.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveStep(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${activeStep >= index
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                            : "bg-gray-300 dark:bg-gray-600"
                            }`}
                    />
                ))}
            </div>
        </div>
    </section>)
}