// src/components/pricing-page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define the structure for plan data
interface PlanFeature {
    text: string;
    footnote?: string;
}

interface Plan {
    name: string;
    price: {
        monthly: number;
        annual: number;
    } | 'Custom';
    description: string;
    features: PlanFeature[];
    isPopular?: boolean;
    cta: string;
}

// Pricing data inspired by the image
const plansData: Plan[] = [
    {
        name: 'Free',
        price: { monthly: 0, annual: 0 },
        description: 'For your hobby projects',
        features: [
            { text: 'Free e-mail alerts' },
            { text: '3-minute checks' },
            { text: 'Automatic data enrichment' },
            { text: '10 monitors' },
            { text: 'Up to 3 seats' },
        ],
        cta: 'Get started for free',
    },
    {
        name: 'Pro',
        price: { monthly: 99, annual: 85 }, // Assuming a monthly price for toggle functionality
        description: 'Great for small businesses',
        features: [
            { text: 'Unlimited phone calls' },
            { text: '30 second checks' },
            { text: 'Single-user account' },
            { text: '20 monitors' },
            { text: 'Up to 6 seats' },
        ],
        isPopular: true,
        cta: 'Get started with Pro',
    },
    {
        name: 'Enterprise',
        price: 'Custom',
        description: 'For multiple teams',
        features: [
            { text: 'Everything in Pro' },
            { text: 'Up to 5 team members' },
            { text: '100 monitors' },
            { text: '15 status pages' },
            { text: '200+ integrations' },
        ],
        cta: 'Get started with Enterprise',
    },
];

export function PricingPage() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950/50">
            <div className="container mx-auto px-4 py-12 sm:py-16 lg:py-24">
                {/* Header */}
                <div className="text-center">
                    <h1 className="text-4xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 sm:text-5xl lg:text-6xl">
                        Plans and Pricing
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-500 dark:text-gray-400">
                        Receive unlimited credits when you pay yearly, and save on your plan.
                    </p>
                </div>

                {/* Pricing Toggle */}
                <div className="mt-10 flex justify-center">
                    <Tabs
                        defaultValue="annual"
                        onValueChange={(value) => setBillingCycle(value as 'monthly' | 'annual')}
                        className="w-auto"
                    >
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            <TabsTrigger value="annual" className="relative">
                                Annual
                                <Badge
                                    variant="secondary"
                                    className="absolute -top-3 -right-8 bg-green-100 text-green-700 border-green-200"
                                >
                                    Save 36%
                                </Badge>
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Pricing Cards */}
                <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
                    {plansData.map((plan, index) => (
                        <Card
                            key={index}
                            className={cn(
                                'relative flex flex-col h-full transition-transform duration-300 hover:scale-105 hover:shadow-xl',
                                {
                                    'border-2 border-primary shadow-lg': plan.isPopular,
                                    'bg-gray-900 text-white border-gray-700': plan.name === 'Enterprise',
                                }
                            )}
                        >
                            {plan.isPopular && (
                                <Badge
                                    className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground"
                                >
                                    Popular
                                </Badge>
                            )}
                            <CardHeader className="pt-8">
                                <CardTitle className={cn('text-2xl font-bold', { 'text-white': plan.name === 'Enterprise' })}>
                                    {plan.name}
                                </CardTitle>
                                <div className="mt-4 flex items-baseline">
                                    {plan.price === 'Custom' ? (
                                        <span className="text-5xl font-extrabold tracking-tight">Custom</span>
                                    ) : (
                                        <>
                                            <span className="text-5xl font-extrabold tracking-tight">
                                                ${billingCycle === 'annual' ? plan.price.annual : plan.price.monthly}
                                            </span>
                                            <span className="ml-2 text-lg font-medium text-gray-500 dark:text-gray-400">
                                                / user/month
                                            </span>
                                        </>
                                    )}
                                </div>
                                <CardDescription className={cn({ 'text-gray-400': plan.name === 'Enterprise' })}>
                                    Per user/month, billed {billingCycle}ly
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow">
                                <p className={cn("mt-2 mb-6 font-medium", { 'text-gray-300': plan.name === 'Enterprise' })}>{plan.description}</p>
                                <ul className="space-y-4">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start">
                                            <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                            <span className={cn('text-sm', { 'text-gray-300': plan.name === 'Enterprise' })}>
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={
                                        plan.isPopular ? 'default' : (plan.name === 'Enterprise' ? 'secondary' : 'outline')
                                    }
                                >
                                    {plan.cta}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}