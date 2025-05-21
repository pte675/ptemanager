"use client"

import { motion } from "framer-motion"
import { Mic, Pencil, BookOpen, Headphones, Brain, Award, Clock, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeatureSection() {
  const features = [
    {
      icon: Mic,
      title: "Speaking",
      description: "Practice pronunciation with our AI speech recognition that provides instant feedback.",
      color: "text-rose-500",
      bgColor: "bg-rose-100 dark:bg-rose-950/40",
    },
    {
      icon: Pencil,
      title: "Writing",
      description: "Develop writing skills with interactive exercises and personalized corrections.",
      color: "text-sky-500",
      bgColor: "bg-sky-100 dark:bg-sky-950/40",
    },
    {
      icon: BookOpen,
      title: "Reading",
      description: "Improve comprehension with adaptive texts that match your current level.",
      color: "text-purple-500",
      bgColor: "bg-purple-100 dark:bg-purple-950/40",
    },
    {
      icon: Headphones,
      title: "Listening",
      description: "Train your ear with native speakers at various speeds and difficulty levels.",
      color: "text-amber-500",
      bgColor: "bg-amber-100 dark:bg-amber-950/40",
    },
    {
      icon: Brain,
      title: "Adaptive Learning",
      description: "Our AI adapts to your learning style and pace for maximum efficiency.",
      color: "text-emerald-500",
      bgColor: "bg-emerald-100 dark:bg-emerald-950/40",
    },
    {
      icon: Award,
      title: "Gamification",
      description: "Stay motivated with points, badges, and leaderboards that make learning fun.",
      color: "text-indigo-500",
      bgColor: "bg-indigo-100 dark:bg-indigo-950/40",
    },
    {
      icon: Clock,
      title: "Spaced Repetition",
      description: "Review words and concepts at optimal intervals for long-term retention.",
      color: "text-pink-500",
      bgColor: "bg-pink-100 dark:bg-pink-950/40",
    },
    {
      icon: Zap,
      title: "Immersion Mode",
      description: "Accelerate learning with our unique immersive environment simulations.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100 dark:bg-yellow-950/40",
    },
  ]

  return (
    <section id="features" className="py-20 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Comprehensive Language Learning
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Our platform covers all aspects of language acquisition with scientifically-proven methods that accelerate
            your progress.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-4`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-700 dark:text-slate-300 text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
