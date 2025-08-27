'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlanFeature { text: string; }
interface Plan {
    name: string;
    price: { monthly: number; annual: number } | 'Custom';
    description: string;
    features: PlanFeature[];
    isPopular?: boolean;
    cta: string;
}

const plansData: Plan[] = [
    {
        name: 'Free',
        price: { monthly: 0, annual: 0 },
        description: 'For beginners starting their quiz journey',
        features: [
            { text: '30 quizzes per month' },
            { text: '10 web searches per month' },
            { text: '2 Notion page integrations' },
            { text: 'Participate in tournaments' },
            { text: 'Access to leaderboards' },
        ],
        cta: 'Current Plan',
    },
    {
        name: 'Chill',
        price: { monthly: 449, annual: 349 },
        description: 'For serious quiz makers who want more freedom',
        features: [
            { text: '300 quizzes per month' },
            { text: '100 web searches per month' },
            { text: '20 Notion page integrations' },
            { text: 'Create & manage tournaments' },
            { text: 'Full leaderboard access' },
            { text: 'Priority support' },
        ],
        isPopular: true,
        cta: 'Upgrade to Chill',
    },
    {
        name: 'Chigma',
        price: { monthly: 999, annual: 749 },
        description: 'Full-featured plan for power users and teams',
        features: [
            { text: '1000 quizzes per month' },
            { text: '300 web searches per month' },
            { text: '20 Notion page integrations' },
            { text: 'Full leaderboard access' },
            { text: 'Full Notion workspace integration' },
            { text: 'Create & manage unlimited tournaments' },
            { text: 'Advanced leaderboard & analytics' },
            { text: 'Team collaboration features' },
            { text: 'Priority support' },
        ],
        cta: 'Contact Sales',
    },
];

export function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center py-16 px-4 transition-colors duration-300 border-t border-b border-zinc-200 dark:border-zinc-800">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">Choose the Plan!</h1>
                <p className="text-zinc-600 dark:text-zinc-400 mt-2">Pick the plan that suits your quiz-making needs!</p>
            </div>
            <div className="relative w-full max-w-[220px]  bg-zinc-200 dark:bg-zinc-800 rounded-full shadow-inner overflow-hidden mb-12 mx-auto">
                <div
                    className={cn(
                        'absolute top-0 left-0 h-full w-1/2 bg-zinc-900 dark:bg-zinc-100 rounded-full shadow-md transition-all duration-300'
                    )}
                    style={{ transform: billingCycle === 'monthly' ? 'translateX(0%)' : 'translateX(100%)' }}
                />
                <div className="relative flex">
                    <button
                        className={cn(
                            'flex-1 py-2 rounded-full text-center transition-colors duration-300 z-10',
                            billingCycle === 'monthly' ? 'text-white dark:text-zinc-900' : 'text-zinc-700 dark:text-zinc-300'
                        )}
                        onClick={() => setBillingCycle('monthly')}
                    >
                        Monthly
                    </button>
                    <button
                        className={cn(
                            'flex-1 py-2 rounded-full text-center transition-colors duration-300 z-10',
                            billingCycle === 'annual' ? 'text-white dark:text-zinc-900' : 'text-zinc-700 dark:text-zinc-300'
                        )}
                        onClick={() => setBillingCycle('annual')}
                    >
                        Annual
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:grid md:grid-cols-3 gap-6 sm:gap-8 w-full md:max-w-6xl container max-w-md sm:max-w-2xl  ">
                {plansData.map((plan, idx) => (
                    <div
                        key={idx}
                        className={cn(
                            'relative rounded-2xl p-6 sm:p-8 flex flex-col border transition-colors duration-300 cursor-pointer mb-6 md:mb-0 py-12 sm:py-6',
                            plan.isPopular
                                ? 'bg-zinc-900 lg:scale-[1.1] text-zinc-100 border border-zinc-700 shadow-2xl'
                                : 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700'
                        )}
                    >
                        <h2 className="text-xl font-semibold mb-3 sm:mb-4">{plan.name}</h2>
                        <div className="text-3xl sm:text-4xl font-extrabold mb-2">
                            ₹{plan.price === 'Custom' ? 'Custom' : billingCycle === 'monthly' ? plan.price.monthly : plan.price.annual}
                            <span className="text-base sm:text-lg font-medium text-zinc-400 dark:text-zinc-300 ml-1">/month</span>
                        </div>
                        <p className="mb-4 sm:mb-6 text-zinc-500 dark:text-zinc-400">{plan.description}</p>

                        <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                            {plan.features.map((f, i) => (
                                <li key={i} className="flex items-center text-sm sm:text-base">
                                    <Check
                                        className={cn(
                                            'w-5 h-5 mr-2 sm:mr-3 flex-shrink-0',
                                            plan.isPopular ? 'text-zinc-200' : 'text-zinc-700 dark:text-zinc-300'
                                        )}
                                    />
                                    <span>{f.text}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            variant={plan.isPopular ? 'default' : 'outline'}
                            className={cn(
                                "w-full mt-auto relative overflow-hidden transition-colors duration-300",
                                "bg-zinc-800 dark:bg-zinc-100 text-white dark:text-zinc-900",
                                "hover:bg-zinc-900 dark:hover:bg-zinc-200",
                                "shadow-inner"
                            )}
                        >
                            <span className="absolute inset-0 bg-gradient-to-b from-zinc-100/20 to-zinc-600/20 dark:from-zinc-900/20 dark:to-zinc-400/20  pointer-events-none"></span>
                            <span className="relative z-10">{plan.cta}</span>
                        </Button>


                    </div>
                ))}
            </div>
        </div>
    );
}
