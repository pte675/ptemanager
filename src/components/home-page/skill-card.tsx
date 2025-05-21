"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

interface SkillProps {
  skill: {
    id: string
    name: string
    points: number
    icon: LucideIcon
    color: string
    lightColor: string
    progress: number
    level: number
    nextMilestone: number
  }
  isLoading: boolean
}

export function SkillCard({ skill, isLoading }: SkillProps) {
  const Icon = skill.icon

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-start mb-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
        <Skeleton className="h-12 w-full mb-4" />
        <Skeleton className="h-2 w-full mb-4" />
        <Skeleton className="h-10 w-full" />
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 * Number.parseInt(skill.id.charAt(0)) }}
    >
      <Card className={`p-6 border-t-4 ${skill.color} overflow-hidden relative`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Icon className="h-24 w-24" />
        </div>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold">{skill.name}</h3>
          <div className={`${skill.lightColor} ${skill.color.replace("bg-", "text-")} p-2 rounded-full`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="mb-4">
          <div className="text-3xl font-bold mb-1">{skill.points.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">Level {skill.level}</div>
        </div>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Progress to next level</span>
            <span>{skill.progress}%</span>
          </div>
          <Progress value={skill.progress} className="h-2" />
          <div className="text-xs text-muted-foreground mt-1">
            {skill.nextMilestone - skill.points} points to reach {skill.nextMilestone}
          </div>
        </div>
        <Button variant="outline" className="w-full">
          Practice Now
        </Button>
      </Card>
    </motion.div>
  )
}
