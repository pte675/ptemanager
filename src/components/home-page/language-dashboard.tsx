"use client"

import { useState, useEffect } from "react"
import { Mic, Pencil, BookOpen, Headphones, Trophy, FlameIcon as Fire, Target, Calendar, BarChart2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { SkillCard } from "@/components/home-page/skill-card"
import { DailyStreak } from "@/components/home-page/daily-streak"
import { AchievementBadges } from "@/components/home-page/achievement-badges"
import { RecommendedLessons } from "@/components/home-page/recommended-lessons"
import { LanguageSelector } from "@/components/home-page/language-selector"
import { WeeklyProgress } from "@/components/home-page/weekly-progress"
import { ThemeToggle } from "@/components/home-page/theme-toggle"

export function LanguageDashboard() {
  const [selectedLanguage, setSelectedLanguage] = useState("Spanish")
  const [streakDays, setStreakDays] = useState(12)
  const [dailyGoalProgress, setDailyGoalProgress] = useState(65)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const skillData = [
    {
      id: "speaking",
      name: "Speaking",
      points: 3291,
      icon: Mic,
      color: "bg-rose-500",
      lightColor: "bg-rose-100",
      progress: 82,
      level: 7,
      nextMilestone: 3500,
    },
    {
      id: "writing",
      name: "Writing",
      points: 402,
      icon: Pencil,
      color: "bg-sky-500",
      lightColor: "bg-sky-100",
      progress: 40,
      level: 3,
      nextMilestone: 500,
    },
    {
      id: "reading",
      name: "Reading",
      points: 2004,
      icon: BookOpen,
      color: "bg-purple-500",
      lightColor: "bg-purple-100",
      progress: 67,
      level: 5,
      nextMilestone: 2500,
    },
    {
      id: "listening",
      name: "Listening",
      points: 2016,
      icon: Headphones,
      color: "bg-amber-500",
      lightColor: "bg-amber-100",
      progress: 72,
      level: 6,
      nextMilestone: 2500,
    },
  ]

  const achievements = [
    { name: "Perfect Week", icon: Calendar, earned: true },
    { name: "Vocabulary Master", icon: BookOpen, earned: true },
    { name: "Conversation Pro", icon: Mic, earned: false },
    { name: "Grammar Guru", icon: Pencil, earned: true },
    { name: "Listening Expert", icon: Headphones, earned: false },
  ]

  const recommendedLessons = [
    { title: "Past Tense Practice", type: "Grammar", duration: 15, difficulty: "Medium" },
    { title: "Restaurant Conversations", type: "Speaking", duration: 10, difficulty: "Easy" },
    { title: "News Article Reading", type: "Reading", duration: 20, difficulty: "Hard" },
  ]

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Language Learning Dashboard</h1>
          <p className="text-muted-foreground mt-2">Track your progress and improve your language skills</p>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSelector selectedLanguage={selectedLanguage} onSelectLanguage={setSelectedLanguage} />
          <ThemeToggle />
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {skillData.map((skill) => (
          <SkillCard key={skill.id} skill={skill} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Daily Streak</h2>
            <Fire className="h-5 w-5 text-rose-500" />
          </div>
          <DailyStreak days={streakDays} />
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium">Today's Goal</span>
              <span className="text-sm font-medium">{dailyGoalProgress}%</span>
            </div>
            <Progress value={dailyGoalProgress} className="h-2" />
          </div>
          <div className="mt-6">
            <Button className="w-full">Complete Daily Goal</Button>
          </div>
        </Card>

        <Card className="col-span-1 lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Weekly Progress</h2>
            <BarChart2 className="h-5 w-5 text-slate-500" />
          </div>
          <WeeklyProgress />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recommended for You</h2>
            <Target className="h-5 w-5 text-slate-500" />
          </div>
          <RecommendedLessons lessons={recommendedLessons} />
        </Card>

        <Card className="col-span-1 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Achievements</h2>
            <Trophy className="h-5 w-5 text-amber-500" />
          </div>
          <AchievementBadges achievements={achievements} />
        </Card>
      </div>
    </div>
  )
}
