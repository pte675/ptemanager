"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"

interface Achievement {
  name: string
  icon: LucideIcon
  earned: boolean
}

interface AchievementBadgesProps {
  achievements: Achievement[]
}

export function AchievementBadges({ achievements }: AchievementBadgesProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {achievements.map((achievement, index) => {
        const Icon = achievement.icon

        return (
          <motion.div
            key={achievement.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex flex-col items-center"
          >
            <div
              className={`relative rounded-full p-4 ${
                achievement.earned
                  ? "bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
                  : "bg-slate-100 text-slate-400 dark:bg-slate-800"
              }`}
            >
              <Icon className="h-8 w-8" />
              {achievement.earned && (
                <div className="absolute -top-1 -right-1 bg-green-500 rounded-full w-4 h-4 border-2 border-white dark:border-slate-900" />
              )}
            </div>
            <div className="mt-2 text-center">
              <div className="text-sm font-medium">{achievement.name}</div>
              <div className="text-xs text-muted-foreground">{achievement.earned ? "Earned" : "In progress"}</div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
