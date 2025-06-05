"use client"

import { useEffect, useState } from "react"
import {
    BookOpen, Flame, CheckCircle, BarChart3, Clock, Award,
    ChevronRight, PlusCircle, Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"

export default function PTEWritingDashboard() {
    const [activeTab, setActiveTab] = useState("overview")

    const [dashboardData, setDashboardData] = useState<{
        score: number
        stats: {
            title: string
            value: string
            description: string
            icon: React.ReactNode
            trend: "up" | "down" | "same"
            trendValue: string
        }[]
        tasks: {
            title: string
            path: string
            completed: number
            total: number
            streak: number
            accuracy: number
            color: "orange" | "amber"
        }[]
    } | null>(null)

    useEffect(() => {
        const raw = localStorage.getItem("progress")
        if (!raw) return

        try {
            const progress = JSON.parse(raw)
            const writing = progress.writing || {}

            const tasks = [
                { title: "Essay Writing", path: "essay-writing", total: 100, color: "orange" },
                { title: "Summarize Written Text", path: "summarize-text", total: 100, color: "amber" },
            ].map(task => {
                const data = writing[task.path] || { completed: 0, accuracy: 0, streak: 0 }
                return {
                    ...task,
                    completed: data.completed as number,
                    accuracy: data.accuracy ?? 0,
                    streak: data.streak ?? 0,
                    color: task.color as "orange" | "amber"
                }
            })

            const score = tasks.length
                ? Math.round(tasks.reduce((acc, task) => acc + (task.accuracy || 0), 0) / tasks.length)
                : 0

            const stats = [
                {
                    title: "Writing Progress",
                    value: `${score}%`,
                    description: "Based on recent activity",
                    icon: <BarChart3 className="h-5 w-5 text-emerald-500" />,
                    trend: "same" as const,
                    trendValue: "",
                },
                {
                    title: "Writing Time",
                    value: "—",
                    description: "Time tracking not implemented",
                    icon: <Clock className="h-5 w-5 text-blue-500" />,
                    trend: "same" as const,
                    trendValue: "",
                },
                {
                    title: "Writing Level",
                    value: score >= 85 ? "Advanced" : score >= 60 ? "Intermediate" : "Beginner",
                    description: "Compared to top PTE students",
                    icon: <Award className="h-5 w-5 text-amber-500" />,
                    trend: "same" as const,
                    trendValue: "",
                },
            ]

            setDashboardData({ score, stats, tasks })
        } catch (err) {
            console.error("Failed to load writing progress from localStorage", err)
        }
    }, [])

    if (!dashboardData) return null

    return (
        <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
                                <BookOpen className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">PTE Writing</h1>
                                <p className="text-slate-500 dark:text-slate-400">Polish your writing skills with real test tasks</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <OverallScoreCard score={dashboardData.score} />
                            <Button className="hidden md:flex gap-2 bg-orange-600 hover:bg-orange-700">
                                <PlusCircle className="h-4 w-4" />
                                New Practice
                            </Button>
                        </div>
                    </div>
                </header>

                <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="practice">Practice</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {dashboardData.stats.map((stat, index) => (
                                <StatsCard
                                    key={index}
                                    title={stat.title}
                                    value={stat.value}
                                    description={stat.description}
                                    icon={stat.icon}
                                    trend={stat.trend}
                                    trendValue={stat.trendValue}
                                />
                            ))}
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Question Types</h2>
                                <Button variant="ghost" size="sm" className="text-orange-600 dark:text-orange-400">
                                    View All <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {dashboardData.tasks.map((task) => (
                                    <QuestionTypeCard
                                        key={task.path}
                                        title={task.title}
                                        completed={task.completed}
                                        total={task.total}
                                        streak={task.streak}
                                        accuracy={task.accuracy}
                                        color={task.color}
                                        path={task.path}
                                    />
                                ))}
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="practice">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full mb-4">
                                <Sparkles className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Start Practicing</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                                Select a writing task or begin a full mock test
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <Button className="bg-orange-600 hover:bg-orange-700">Start Full Test</Button>
                                <Button variant="outline">Practice Individual Tasks</Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full mb-4">
                                <BarChart3 className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Writing Analytics</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                                Review your grammar, coherence, and structure performance
                            </p>
                            <Button className="bg-orange-600 hover:bg-orange-700">View Reports</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

function OverallScoreCard({ score }: { score: number }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 flex items-center gap-3">
                        <div className="relative h-12 w-12">
                            <svg className="h-12 w-12 transform -rotate-90">
                                <circle cx="24" cy="24" r="20" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                                <circle
                                    cx="24"
                                    cy="24"
                                    r="20"
                                    fill="none"
                                    stroke={score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444"}
                                    strokeWidth="4"
                                    strokeDasharray={`${score * 1.26} 126`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">{score}</div>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-xs text-slate-500 dark:text-slate-400">Overall Score</p>
                            <p className="font-semibold text-slate-800 dark:text-white">
                                {score >= 80 ? "Excellent" : score >= 60 ? "Good" : "Needs Work"}
                            </p>
                        </div>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Your overall PTE Writing score</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function StatsCard({
    title, value, description, icon, trend, trendValue
}: {
    title: string
    value: string
    description: string
    icon: React.ReactNode
    trend: "up" | "down" | "same"
    trendValue: string
}) {
    return (
        <Card>
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</CardTitle>
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>
            </CardContent>
            {trend !== "same" && (
                <CardFooter className="pt-0">
                    <Badge variant={trend === "up" ? "default" : "destructive"} className="text-xs">
                        {trend === "up" ? "↑" : "↓"} {trendValue}
                    </Badge>
                </CardFooter>
            )}
        </Card>
    )
}

function QuestionTypeCard({
    title, completed, total, streak, accuracy, color, path
}: {
    title: string
    completed: number
    total: number
    streak: number
    accuracy: number
    color: "orange" | "amber"
    path: string
}) {
    const colorMap = {
        orange: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        amber: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    }

    const progressColor = {
        orange: "bg-orange-600",
        amber: "bg-amber-600",
    }

    return (
        <Link href={`writing/${path}`}>
            <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex justify-between items-center">
                        {title}
                        <span className={`text-2xl font-bold ${colorMap[color]?.split(" ")[1]}`}>{completed}</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
                        <span>Progress</span>
                        <span>{Math.round((completed / total) * 100)}%</span>
                    </div>
                    <Progress value={(completed / total) * 100} className="h-1.5" />
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-1.5">
                            <div className={`p-1 rounded-full ${colorMap[color]}`}>
                                <Flame className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium">{streak}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`p-1 rounded-full ${colorMap[color]}`}>
                                <CheckCircle className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-medium">{accuracy}%</span>
                        </div>
                        <Button variant="ghost" size="sm" className={`text-xs px-2 py-1 h-auto ${colorMap[color]?.split(" ")[1]}`}>
                            Practice
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}