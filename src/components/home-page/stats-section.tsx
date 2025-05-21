"use client"

import { motion } from "framer-motion"
import { Users, Globe, Award, Clock } from "lucide-react"

export function StatsSection() {
  const stats = [
    {
      icon: Users,
      value: "20M+",
      label: "Active Users",
      description: "Learners worldwide trust our platform",
    },
    {
      icon: Globe,
      value: "40+",
      label: "Languages",
      description: "From popular to rare languages",
    },
    {
      icon: Award,
      value: "95%",
      label: "Success Rate",
      description: "Users who achieve conversational fluency",
    },
    {
      icon: Clock,
      value: "2.5x",
      label: "Faster Learning",
      description: "Compared to traditional methods",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="bg-white/10 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                <stat.icon className="h-8 w-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-xl font-medium text-white mb-2">{stat.label}</div>
              <div className="text-white/80">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
