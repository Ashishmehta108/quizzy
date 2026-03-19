/**
 * @layer page
 * @owner agent-4
 */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Check, Zap, Mail } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  maxAiGenerations: number;
  maxStudentSeats: number;
  maxCourses: number;
  analyticsLevel: string;
  exportTypes: string[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function PricingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-96 rounded-lg bg-neutral-100/60 dark:bg-zinc-800/40 animate-pulse"
        />
      ))}
    </div>
  );
}

// ─── Feature Row ──────────────────────────────────────────────────────────────

function FeatureItem({ label }: { label: string }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-neutral-600 dark:text-zinc-400">
      <Check className="h-3.5 w-3.5 text-neutral-400 dark:text-zinc-500 flex-shrink-0" />
      {label}
    </li>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onUpgrade,
}: {
  plan: Plan;
  onUpgrade: (id: string) => void;
}) {
  const isPro = plan.name.toLowerCase().includes("pro");
  const isFree = plan.price === "0";

  const features = [
    `${plan.maxAiGenerations} AI Generations / month`,
    `${plan.maxStudentSeats} Student Seats`,
    `${plan.maxCourses} Courses`,
    `${plan.analyticsLevel} Analytics`,
    plan.exportTypes.includes("csv") ? "CSV & Export Tools" : "No Exports",
  ];

  return (
    <Card
      className={cn(
        "relative flex flex-col rounded-lg transition-colors duration-150",
        isPro
          ? "bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-700/60"
          : "bg-neutral-50/50 dark:bg-zinc-900/50 border border-neutral-200/60 dark:border-zinc-800/60"
      )}
      style={{ boxShadow: "none" }}
    >
      {isPro && (
        <div className="absolute -top-2.5 left-5">
          <Badge className="bg-[#1B2B4B] dark:bg-[#1B2B4B] text-white hover:bg-[#1B2B4B] px-2 py-0 text-[10px] font-medium tracking-wide gap-1 rounded-sm h-5">
            <Zap className="h-2.5 w-2.5" />
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className={cn("pb-4", isPro ? "pt-8" : "pt-6")}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-neutral-900 dark:text-zinc-100">
            {plan.name}
          </CardTitle>
          {isFree && (
            <span className="text-[11px] text-neutral-400 dark:text-zinc-500 font-normal">
              Current plan
            </span>
          )}
        </div>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-3xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100">
            ₹{plan.price}
          </span>
          <span className="text-xs text-neutral-400 dark:text-zinc-500">
            / mo
          </span>
        </div>

        <CardDescription className="text-xs text-neutral-400 dark:text-zinc-500 mt-1.5 leading-relaxed">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <div className="mx-5 h-px bg-neutral-100 dark:bg-zinc-800/80" />

      <CardContent className="flex-1 pt-4">
        <ul className="space-y-2">
          {features.map((f, i) => (
            <FeatureItem key={i} label={f} />
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-2 pb-5 px-5">
        <Button
          className={cn(
            "w-full h-8 text-xs font-medium rounded-md transition-colors",
            isPro
              ? "bg-[#1B2B4B] hover:bg-[#162240] text-white border-0"
              : "bg-transparent border border-neutral-200 dark:border-zinc-700/80 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100/60 dark:hover:bg-zinc-800/60 hover:text-neutral-900 dark:hover:text-zinc-200"
          )}
          variant="ghost"
          onClick={() => onUpgrade(plan.id)}
          disabled={isFree}
        >
          {isFree ? "Current Plan" : `Upgrade to ${plan.name}`}
        </Button>
      </CardFooter>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:5000/api/pricing`);
      return data.data;
    },
  });

  const handleUpgrade = (planId: string) => {
    window.location.href = `http://localhost:5000/api/pricing/checkout?planId=${planId}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20 space-y-10">

        {/* Header */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium uppercase tracking-widest text-neutral-400 dark:text-zinc-500">
            Pricing
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-zinc-100">
            Simple, transparent pricing
          </h1>
          <p className="text-sm text-neutral-500 dark:text-zinc-400 max-w-md leading-relaxed">
            Choose the plan that fits your teaching style. No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Plans */}
        {isLoading ? (
          <PricingSkeleton />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plans?.map((plan) => (
              <PlanCard key={plan.id} plan={plan} onUpgrade={handleUpgrade} />
            ))}
          </div>
        )}

        {/* CTA strip */}
        <div className="rounded-lg border border-neutral-200/60 dark:border-zinc-800/60 bg-white/60 dark:bg-zinc-900/40 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-neutral-900 dark:text-zinc-100">
              Need a custom plan for your school?
            </p>
            <p className="text-xs text-neutral-400 dark:text-zinc-500">
              Bulk licensing and custom integrations for educational institutions.
            </p>
          </div>
          <Button
            variant="ghost"
            className="flex-shrink-0 h-8 text-xs border border-neutral-200 dark:border-zinc-700/80 text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100/60 dark:hover:bg-zinc-800/60 hover:text-neutral-900 dark:hover:text-zinc-200 gap-1.5 rounded-md px-3"
          >
            <Mail className="h-3.5 w-3.5" />
            Contact Sales
          </Button>
        </div>
      </div>
    </div>
  );
}