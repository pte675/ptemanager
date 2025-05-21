"use client"

import { motion } from "framer-motion"
import { Clock, BookOpen, Mic, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Lesson {
  title: string
  type: string
  duration: number
  difficulty: string
}

interface RecommendedLessonsProps {
  lessons: Lesson[]
}

export function RecommendedLessons({ lessons }: RecommendedLessonsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Grammar":
        return <BarChart2 className="h-4 w-4" />
      case "Speaking":
        return <Mic className="h-4 w-4" />
      case "Reading":
        return <BookOpen className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "Medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
      case "Hard":
        return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  return (
    <div className="space-y-4">
      {lessons.map((lesson, index) => (
        <motion.div
          key={lesson.title}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="mb-3 sm:mb-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded">{getTypeIcon(lesson.type)}</div>
              <h3 className="font-medium">{lesson.title}</h3>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{lesson.duration} min</span>
              </div>
              <Badge variant="outline" className={`text-xs ${getDifficultyColor(lesson.difficulty)}`}>
                {lesson.difficulty}
              </Badge>
            </div>
          </div>
          <Button size="sm">Start Lesson</Button>
        </motion.div>
      ))}
      <Button variant="ghost" className="w-full mt-2">
        View All Lessons
      </Button>
    </div>
  )
}
