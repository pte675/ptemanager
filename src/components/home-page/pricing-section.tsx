"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle, XCircle, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function PricingSection() {
  const [annual, setAnnual] = useState(true)

  const plans = [
    {
      name: "Free",
      description: "Basic language learning to get started",
      price: {
        monthly: 0,
        annual: 0,
      },
      features: [
        { name: "Access to 1 language", included: true },
        { name: "Basic vocabulary exercises", included: true },
        { name: "Limited daily lessons", included: true },
        { name: "Community forum access", included: true },
        { name: "Progress tracking", included: true },
        { name: "Speaking practice", included: false },
        { name: "Personalized learning path", included: false },
        { name: "Offline mode", included: false },
        { name: "Native speaker feedback", included: false },
      ],
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Premium",
      description: "Comprehensive learning for serious language students",
      price: {
        monthly: 12.99,
        annual: 8.99,
      },
      features: [
        { name: "Access to all 40+ languages", included: true },
        { name: "Unlimited vocabulary exercises", included: true },
        { name: "Unlimited daily lessons", included: true },
        { name: "Community forum access", included: true },
        { name: "Advanced progress analytics", included: true },
        { name: "AI speaking practice", included: true },
        { name: "Personalized learning path", included: true },
        { name: "Offline mode", included: true },
        { name: "Native speaker feedback", included: false, tooltip: "Available in Pro plan" },
      ],
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
    },
    {
      name: "Pro",
      description: "Ultimate language mastery with premium features",
      price: {
        monthly: 24.99,
        annual: 19.99,
      },
      features: [
        { name: "Access to all 40+ languages", included: true },
        { name: "Unlimited vocabulary exercises", included: true },
        { name: "Unlimited daily lessons", included: true },
        { name: "Priority community support", included: true },
        { name: "Advanced progress analytics", included: true },
        { name: "AI speaking practice", included: true },
        { name: "Personalized learning path", included: true },
        { name: "Offline mode", included: true },
        { name: "Unlimited native speaker feedback", included: true },
      ],
      popular: false,
      buttonText: "Start Free Trial",
      buttonVariant: "outline" as const,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300 mb-8">
            Choose the plan that fits your language learning goals. All plans include a 7-day free trial.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Label
              htmlFor="billing-toggle"
              className={annual ? "text-slate-500" : "text-slate-900 dark:text-white font-medium"}
            >
              Monthly
            </Label>
            <Switch id="billing-toggle" checked={annual} onCheckedChange={setAnnual} />
            <Label
              htmlFor="billing-toggle"
              className={!annual ? "text-slate-500" : "text-slate-900 dark:text-white font-medium"}
            >
              Annual <span className="text-green-600 dark:text-green-400 font-medium">Save 30%</span>
            </Label>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white dark:bg-slate-950 rounded-xl shadow-sm border ${plan.popular
                ? "border-purple-400 dark:border-purple-500 shadow-lg relative"
                : "border-slate-200 dark:border-slate-800"
                }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-gradient-to-r from-purple-600 to-blue-500 text-white text-sm font-medium px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-slate-900 dark:text-white">
                      ${annual ? plan.price.annual : plan.price.monthly}
                    </span>
                    {plan.price.monthly > 0 && <span className="text-slate-600 dark:text-slate-400 ml-2">/month</span>}
                  </div>
                  {plan.price.monthly > 0 && (
                    <p className="text-slate-500 dark:text-slate-500 text-sm mt-1">
                      {annual ? "Billed annually" : "Billed monthly"}
                    </p>
                  )}
                </div>

                <Button
                  variant={plan.buttonVariant}
                  className={`w-full mb-6 ${plan.popular
                    ? "bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
                    : ""
                    }`}
                >
                  {plan.buttonText}
                </Button>

                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature.name} className="flex items-start">
                      {feature.included ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-5 w-5 text-slate-300 dark:text-slate-700 mr-3 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex items-center">
                        <span
                          className={
                            feature.included
                              ? "text-slate-700 dark:text-slate-300"
                              : "text-slate-500 dark:text-slate-500"
                          }
                        >
                          {feature.name}
                        </span>

                        {"tooltip" in feature && feature.tooltip && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-slate-400 ml-1.5 inline-block" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{feature.tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
