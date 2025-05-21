"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export function WeeklyProgress() {
  const [chartData, setChartData] = useState<number[]>([])

  useEffect(() => {
    // Simulate fetching data
    setChartData([45, 65, 80, 30, 90, 75, 60])
  }, [])

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const maxValue = Math.max(...chartData, 100)

  return (
    <div className="h-[200px] flex items-end justify-between">
      {chartData.map((value, index) => {
        const height = (value / maxValue) * 100

        return (
          <div key={days[index]} className="flex flex-col items-center flex-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-full max-w-[40px] bg-purple-500 rounded-t-md relative group"
            >
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                {value} XP
              </div>
            </motion.div>
            <div className="mt-2 text-xs font-medium">{days[index]}</div>
          </div>
        )
      })}
    </div>
  )
}
