"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/lib/auth/auth-client";

export default function PricingPage() {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const currentPlan = userId ? "Free" : null;
  
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for getting started",
      features: [
        "1 Active Assignment",
        "Up to 25 Students",
        "Basic Analytics",
        "5 AI Quiz Generations",
        "50 Pages Material Ingestion"
      ],
      cta: "Get Started Free",
      isPopular: false
    },
    {
      name: "Educator Pro",
      price: isAnnual ? "$12" : "$15",
      period: "/month",
      description: "Everything you need for your classroom",
      features: [
        "Unlimited Assignments",
        "Up to 250 Students",
        "Advanced Analytics & Trends",
        "Unlimited AI Quiz Generations",
        "Unlimited Material Ingestion",
        "CSV Result Exports",
        "Priority Support"
      ],
      cta: "Start Pro Trial",
      isPopular: true
    },
    {
      name: "Corporate",
      price: "Custom",
      description: "For institutions and large teams",
      features: [
        "Unlimited Everything",
        "Custom Branding",
        "SSO Integration",
        "Dedicated Account Manager",
        "API Access",
        "Multi-instructor Support"
      ],
      cta: "Contact Sales",
      isPopular: false
    }
  ];

  const faqs = [
    {
      q: "Can I try Educator Pro for free?",
      a: "Yes! We offer a 14-day free trial on the Educator Pro plan so you can see if it's right for you."
    },
    {
      q: "How do student seats work?",
      a: "A student seat is counted when a unique student takes one of your quizzes. On the free plan, you can have up to 25 unique students."
    },
    {
      q: "Can I switch plans later?",
      a: "Absolutely. You can upgrade, downgrade, or cancel your plan at any time right from your dashboard."
    },
    {
      q: "What payment methods do you accept?",
      a: "We accept all major credit cards including Visa, Mastercard, and American Express."
    },
    {
      q: "Is there a discount for schools?",
      a: "Yes, we offer bulk licensing discounts for schools and districts. Contact our sales team for a custom quote."
    },
    {
      q: "What happens when I hit my plan limit?",
      a: "Your existing quizzes and data are safe. You'll just be unable to create new assignments or add new students until you upgrade."
    }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 pb-20">
      <div className="container mx-auto px-4 pt-20">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
            Choose the plan that best fits your teaching needs. Upgrade or downgrade at any time.
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${!isAnnual ? "font-semibold text-zinc-900 dark:text-white" : "text-zinc-500"}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-zinc-900 dark:bg-zinc-100 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-zinc-900 transition-transform ${isAnnual ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm ${isAnnual ? "font-semibold text-zinc-900 dark:text-white" : "text-zinc-500"}`}>
              Annually <Badge className="ml-1 bg-green-100 text-green-800 hover:bg-green-100">Save 20%</Badge>
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative flex flex-col p-8 rounded-3xl bg-white dark:bg-zinc-800 border ${
                plan.isPopular 
                ? "border-emerald-500 shadow-xl scale-105 z-10" 
                : "border-zinc-200 dark:border-zinc-700 shadow-sm"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2 flex items-center gap-2">
                  {plan.name}
                  {currentPlan === plan.name && (
                    <Badge variant="outline" className="text-xs">Current Plan</Badge>
                  )}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 h-10">{plan.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-zinc-900 dark:text-white">{plan.price}</span>
                  {plan.period && <span className="text-zinc-500 font-medium">{plan.period}</span>}
                </div>
              </div>

              <div className="flex-grow">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-zinc-600 dark:text-zinc-300">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                className={`w-full py-6 rounded-xl ${
                  plan.isPopular 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                  : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900"
                }`}
                variant={plan.isPopular ? "default" : "outline"}
                onClick={() => router.push(plan.name === "Corporate" ? "mailto:sales@quizzy.com" : "/dashboard")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-zinc-900 dark:text-zinc-50">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-700">
                <h4 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">{faq.q}</h4>
                <p className="text-zinc-600 dark:text-zinc-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
