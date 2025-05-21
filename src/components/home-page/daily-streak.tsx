"use client"

import { motion } from "framer-motion"
import { FlameIcon as Fire } from "lucide-react"

interface DailyStreakProps {
  days: number
}

export function DailyStreak({ days }: DailyStreakProps) {
  // Generate last 7 days
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const today = new Date().getDay() // 0 is Sunday, 1 is Monday, etc.
  const adjustedToday = today === 0 ? 6 : today - 1 // Convert to 0 = Monday, 6 = Sunday

  // Reorder days to start with the day that was 6 days ago
  const orderedDays = [...weekDays.slice(adjustedToday + 1 - 7), ...weekDays.slice(0, adjustedToday + 1)]

  return (
    <div className="flex justify-between items-end">
      {orderedDays.map((day, index) => {
        const isActive = index < 6 || (index === 6 && days % 7 === 0)
        const height = isActive ? 100 : 40

        return (
          <div key={day} className="flex flex-col items-center">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`w-8 rounded-t-md ${isActive ? "bg-rose-500" : "bg-slate-200 dark:bg-slate-700"} relative`}
              style={{ minHeight: "20px" }}
            >
              {index === 6 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.7, type: "spring" }}
                  className="absolute -top-3 -right-3 bg-amber-500 rounded-full p-1"
                >
                  <Fire className="h-4 w-4 text-white" />
                </motion.div>
              )}
            </motion.div>
            <div className="mt-2 text-xs font-medium">{day}</div>
          </div>
        )
      })}
    </div>
  )
}
