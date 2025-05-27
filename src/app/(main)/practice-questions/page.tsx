"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Mic, Pencil, BookOpen, Headphones, Trophy, Clock, Calendar } from "lucide-react"
import Link from "next/link"

export default function LanguageDashboard() {
    const [activeTab, setActiveTab] = useState("overview")

    // Animation variants for cards
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const item = {
        hidden: { y: 20, opacity: 0 },
        show: { y: 0, opacity: 1 },
    }

    const cards = [
        {
            title: "Speaking",
            icon: <Mic className="h-6 w-6 text-white" />,
            bg: "from-rose-400 to-red-500",
            points: 3291,
            level: 8,
            progress: 82,
            description: "Conversation fluency",
        },
        {
            title: "Writing",
            icon: <Pencil className="h-6 w-6 text-white" />,
            bg: "from-blue-400 to-blue-600",
            points: 402,
            level: 3,
            progress: 35,
            description: "Written expression",
        },
        {
            title: "Reading",
            icon: <BookOpen className="h-6 w-6 text-white" />,
            bg: "from-purple-400 to-purple-600",
            points: 2004,
            level: 6,
            progress: 67,
            description: "Comprehension skills",
        },
        {
            title: "Listening",
            icon: <Headphones className="h-6 w-6 text-white" />,
            bg: "from-amber-300 to-amber-500",
            points: 2016,
            level: 7,
            progress: 73,
            description: "Audio comprehension",
        },
    ]


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Language Skills Dashboard</h1>
                        <p className="text-muted-foreground mt-1">Track your progress across all language skills</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Trophy className="h-3 w-3 text-amber-500" />
                            <span>Level 7</span>
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Day 42</span>
                        </Badge>
                        <Badge variant="outline" className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Streak: 12 days</span>
                        </Badge>
                    </div>
                </div>

                <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-md">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="progress">Progress</TabsTrigger>
                        <TabsTrigger value="achievements">Achievements</TabsTrigger>
                        <TabsTrigger value="goals">Goals</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                            variants={container}
                            initial="hidden"
                            animate="show"
                        >
                            {cards.map((card, idx) => (
                                <motion.div key={card.title} variants={item}>
                                    <Card className="relative overflow-hidden border-0 shadow-lg h-full">
                                        <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-90`} />
                                        <CardHeader className="relative">
                                            <div className="flex justify-between items-start">
                                                <CardTitle className="text-white text-2xl font-bold">{card.title}</CardTitle>
                                                <div className="bg-white/20 p-2 rounded-full">{card.icon}</div>
                                            </div>
                                            <CardDescription className="text-white/80">{card.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="relative">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-5xl font-bold text-white">{card.points.toLocaleString()}</span>
                                                    <span className="text-white/80 text-sm">points</span>
                                                </div>
                                                <div className="mt-2">
                                                    <Progress value={card.progress} className="h-2 bg-white/20" />
                                                    <div className="flex justify-between mt-1">
                                                        <span className="text-xs text-white/80">Level {card.level}</span>
                                                        <span className="text-xs text-white/80">{card.progress}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="relative">
                                            <Link href={card.title.toLocaleLowerCase()}>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
                                                >
                                                    Practice Now
                                                </Button>
                                            </Link>
                                        </CardFooter>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>

                        <div className="mt-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Weekly Activity</CardTitle>
                                    <CardDescription>Your language learning progress over time</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[200px] flex items-end justify-between gap-2">
                                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
                                            <div key={day} className="flex flex-col items-center gap-2">
                                                <div className="flex gap-1">
                                                    <div
                                                        className="w-3 bg-rose-400 rounded-t-sm"
                                                        style={{ height: `${Math.random() * 60 + 20}px` }}
                                                    />
                                                    <div
                                                        className="w-3 bg-blue-400 rounded-t-sm"
                                                        style={{ height: `${Math.random() * 40 + 10}px` }}
                                                    />
                                                    <div
                                                        className="w-3 bg-purple-400 rounded-t-sm"
                                                        style={{ height: `${Math.random() * 70 + 30}px` }}
                                                    />
                                                    <div
                                                        className="w-3 bg-amber-400 rounded-t-sm"
                                                        style={{ height: `${Math.random() * 50 + 40}px` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{day}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="progress">
                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Detailed Progress</CardTitle>
                                    <CardDescription>Track your improvement in each skill area</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>Progress charts and detailed analytics would appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="achievements">
                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Your Achievements</CardTitle>
                                    <CardDescription>Badges and milestones you've reached</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>Achievement badges and rewards would appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="goals">
                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Learning Goals</CardTitle>
                                    <CardDescription>Set and track your language learning objectives</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p>Goal setting and tracking interface would appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
