"use client"

import type React from "react"

import { useState } from "react"
import { BookOpen, Flame, CheckCircle, BarChart3, Clock, Award, ChevronRight, PlusCircle, Sparkles } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PTEReadingDashboard() {
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-8">
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                                <BookOpen className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">PTE Reading</h1>
                                <p className="text-slate-500 dark:text-slate-400">Master your reading skills for exam success</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <OverallScoreCard score={85} />
                            <Button className="hidden md:flex gap-2 bg-purple-600 hover:bg-purple-700">
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
                            <StatsCard
                                title="Weekly Progress"
                                value="87%"
                                description="You've improved by 12% this week"
                                icon={<BarChart3 className="h-5 w-5 text-emerald-500" />}
                                trend="up"
                                trendValue="12%"
                            />
                            <StatsCard
                                title="Study Time"
                                value="14.5h"
                                description="Total time spent on reading exercises"
                                icon={<Clock className="h-5 w-5 text-blue-500" />}
                                trend="up"
                                trendValue="2.3h"
                            />
                            <StatsCard
                                title="Mastery Level"
                                value="Advanced"
                                description="Top 15% of all PTE students"
                                icon={<Award className="h-5 w-5 text-amber-500" />}
                                trend="same"
                                trendValue=""
                            />
                        </section>

                        <section>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Question Types</h2>
                                <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400">
                                    View All <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <QuestionTypeCard
                                    title="MCQ - Single Answer"
                                    completed={176}
                                    total={200}
                                    streak={4}
                                    accuracy={88}
                                    color="purple"
                                />
                                <QuestionTypeCard
                                    title="MCQ - Multiple Answers"
                                    completed={153}
                                    total={200}
                                    streak={4}
                                    accuracy={77}
                                    color="indigo"
                                />
                                <QuestionTypeCard
                                    title="Re-order Paragraphs"
                                    completed={412}
                                    total={500}
                                    streak={85}
                                    accuracy={82}
                                    color="fuchsia"
                                />
                                <QuestionTypeCard
                                    title="Fill in the Blanks"
                                    completed={750}
                                    total={800}
                                    streak={164}
                                    accuracy={94}
                                    color="violet"
                                />
                                <QuestionTypeCard
                                    title="Reading & Writing Fill in Blanks"
                                    completed={513}
                                    total={600}
                                    streak={90}
                                    accuracy={85}
                                    color="pink"
                                />
                            </div>
                        </section>
                    </TabsContent>

                    <TabsContent value="practice">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4">
                                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Ready for Practice?</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                                Choose a question type to start practicing or take a full-length reading test
                            </p>
                            <div className="flex flex-wrap gap-3 justify-center">
                                <Button className="bg-purple-600 hover:bg-purple-700">Start Full Test</Button>
                                <Button variant="outline">Practice Specific Skills</Button>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4">
                                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">Detailed Analytics</h3>
                            <p className="text-slate-500 dark:text-slate-400 max-w-md mb-6">
                                Track your progress over time and identify areas for improvement
                            </p>
                            <Button className="bg-purple-600 hover:bg-purple-700">View Detailed Reports</Button>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="md:hidden flex justify-center mt-6">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 flex items-center justify-center gap-2">
                        <PlusCircle className="h-4 w-4" />
                        New Practice
                    </Button>
                </div>
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
                    <p>Your overall PTE Reading score</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

function StatsCard({
    title,
    value,
    description,
    icon,
    trend,
    trendValue,
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
    title,
    completed,
    total,
    streak,
    accuracy,
    color,
}: {
    title: string
    completed: number
    total: number
    streak: number
    accuracy: number
    color: "purple" | "indigo" | "fuchsia" | "violet" | "pink"
}) {
    const colorMap = {
        purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
        indigo: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
        fuchsia: "bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400",
        violet: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
        pink: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
    }

    const progressColor = {
        purple: "bg-purple-600",
        indigo: "bg-indigo-600",
        fuchsia: "bg-fuchsia-600",
        violet: "bg-violet-600",
        pink: "bg-pink-600",
    }

    return (
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
    )
}
