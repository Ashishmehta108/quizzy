/**
 * @layer page
 * @owner agent-4
 */
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Check, Zap } from "lucide-react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export default function PricingPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await axios.get(`http://localhost:5000/api/pricing/plans`);
      return data.data;
    },
  });

  const handleUpgrade = async (planId: string) => {
    // Placeholder for checkout
    window.location.href = `http://localhost:5000/api/pricing/checkout?planId=${planId}`;
  };

  if (isLoading) return <div className="p-8 text-center">Loading plans...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight">Simple, Transparent Pricing</h1>
        <p className="text-xl text-zinc-500 max-w-2xl mx-auto">
          Choose the plan that fits your teaching style. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans?.map((plan: any) => (
          <Card key={plan.id} className={`relative flex flex-col ${plan.name.includes('Pro') ? 'border-blue-500 shadow-xl scale-105' : ''}`}>
            {plan.name.includes('Pro') && (
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 p-2 bg-blue-600 text-white rounded-full">
                <Zap className="h-5 w-5" />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold">₹{plan.price}</span>
                <span className="text-zinc-500">/month</span>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ul className="space-y-3">
                {[
                  `${plan.maxAiGenerations} AI Generations`,
                  `${plan.maxStudentSeats} Student Seats`,
                  `${plan.maxCourses} Courses`,
                  `${plan.analyticsLevel} Analytics`,
                  plan.exportTypes.includes("csv") ? "CSV Exports Included" : "No Exports",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full h-12 text-lg" 
                variant={plan.name.includes('Pro') ? 'default' : 'outline'}
                onClick={() => handleUpgrade(plan.id)}
              >
                {plan.price === "0" ? "Current Plan" : "Upgrade to Pro"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl text-center space-y-4">
        <h2 className="text-2xl font-bold">Need a custom plan for your school?</h2>
        <p className="text-zinc-500">We offer bulk licensing and custom integrations for educational institutions.</p>
        <Button variant="link" className="text-blue-600">Contact Sales &rarr;</Button>
      </div>
    </div>
  );
}
