"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Mic, Pencil, BookOpen, Headphones, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HeroSection() {
  const [email, setEmail] = useState("")

  return (
    <section className="relative overflow-hidden py-20 md:py-32">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 -z-10" />

      {/* Animated background shapes */}
      <div className="absolute inset-0 -z-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-yellow-300 dark:bg-yellow-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-pink-300 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-lighten filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left column - Text content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Master Any Language
              </span>
              <br />
              <span className="text-slate-900 dark:text-white">With Proven Methods</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0">
              Our AI-powered platform adapts to your learning style, making language acquisition faster and more
              effective than traditional methods.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <div className="flex-1 max-w-md">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600"
              >
                Start Learning Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-x-8 gap-y-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-slate-700 dark:text-slate-300">No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-slate-700 dark:text-slate-300">Cancel anytime</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <span className="text-slate-700 dark:text-slate-300">40+ languages</span>
              </div>
            </div>
          </motion.div>

          {/* Right column - App preview */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative">
              {/* Main app preview */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div className="ml-2 text-sm text-slate-500 dark:text-slate-400">PTEGoGlobal App</div>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Your Learning Dashboard</h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <SkillCard
                      name="Speaking"
                      points={3291}
                      icon={Mic}
                      color="bg-rose-500"
                      lightColor="bg-rose-100"
                      progress={82}
                    />
                    <SkillCard
                      name="Writing"
                      points={402}
                      icon={Pencil}
                      color="bg-sky-500"
                      lightColor="bg-sky-100"
                      progress={40}
                    />
                    <SkillCard
                      name="Reading"
                      points={2004}
                      icon={BookOpen}
                      color="bg-purple-500"
                      lightColor="bg-purple-100"
                      progress={67}
                    />
                    <SkillCard
                      name="Listening"
                      points={2016}
                      icon={Headphones}
                      color="bg-amber-500"
                      lightColor="bg-amber-100"
                      progress={72}
                    />
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <h4 className="font-medium mb-2 text-slate-900 dark:text-white">Today's Goal</h4>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-2">
                      <div className="bg-green-500 h-2.5 rounded-full" style={{ width: "65%" }}></div>
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      15 minutes left to complete your daily goal
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 border border-slate-200 dark:border-slate-700 rotate-3">
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-white">Streak: 12 days</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Keep it up!</div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border border-slate-200 dark:border-slate-700 -rotate-6">
                <div className="text-sm font-medium text-slate-900 dark:text-white">Next lesson: Spanish Verbs</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

interface SkillCardProps {
  name: string
  points: number
  icon: React.ElementType
  color: string
  lightColor: string
  progress: number
}

function SkillCard({ name, points, icon: Icon, color, lightColor, progress }: SkillCardProps) {
  return (
    <div className={`p-4 rounded-lg border-t-4 ${color} shadow-sm`}>
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-slate-900 dark:text-white">{name}</div>
        <div className={`${lightColor} ${color.replace("bg-", "text-")} p-1.5 rounded-full`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="text-xl font-bold mb-1 text-slate-900 dark:text-white">{points.toLocaleString()}</div>
      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mb-1">
        <div className={`${color} h-1.5 rounded-full`} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  )
}
