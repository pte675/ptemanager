"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Upload,
    Clock,
    CheckCircle2,
    AlertCircle,
    BookOpen,
    PenLine,
    Bookmark,
    BookmarkCheck,
    HelpCircle,
    Lightbulb,
    Scissors,
    ArrowUpRight,
    BarChart2,
    Maximize2,
    Minimize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import summarizeData from "./summarize-text.json"

export default function TextSummarizationInterface() {
    const [activeTab, setActiveTab] = useState("read")
    const [summaryContent, setSummaryContent] = useState("")
    const [wordCount, setWordCount] = useState(0)
    const [sentenceCount, setSentenceCount] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(10 * 60) // 10 minutes in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(true)
    const [currentPassageIndex, setCurrentPassageIndex] = useState(0)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(2)
    const [totalQuestions, setTotalQuestions] = useState(258)
    const [isExpanded, setIsExpanded] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Calculate time remaining in minutes and seconds
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60

    // Format time as MM:SS
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    const difficultyLevels = ["Easy", "Medium", "Hard"]
    const categories = ["Economics", "Technology", "Environment"]

    const PASSAGES = summarizeData.map((item, index) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        category: categories[index % categories.length],
        difficulty: difficultyLevels[index % difficultyLevels.length],
    }))

    // Timer effect
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isTimerRunning && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining((prev) => prev - 1)
            }, 1000)
        } else if (timeRemaining === 0) {
            toast.error("Time's up! Your summary has been automatically submitted.")
        }

        return () => clearInterval(timer)
    }, [isTimerRunning, timeRemaining])

    // Word count effect
    useEffect(() => {
        const words = summaryContent.trim().split(/\s+/)
        setWordCount(summaryContent.trim() === "" ? 0 : words.length)

        // Count sentences by looking for ending punctuation followed by space or end of string
        const sentences = summaryContent
            .trim()
            .split(/[.!?]+\s*/)
            .filter((s) => s.length > 0)
        setSentenceCount(sentences.length)
    }, [summaryContent])

    // Focus textarea when tab changes to write
    useEffect(() => {
        if (activeTab === "write" && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [activeTab])

    // Timer color based on remaining time
    const getTimerColor = () => {
        if (timeRemaining > 5 * 60) return "text-green-500" // More than 5 minutes
        if (timeRemaining > 2 * 60) return "text-amber-500" // Between 2-5 minutes
        return "text-red-500" // Less than 2 minutes
    }

    const handleSubmit = () => {
        if (sentenceCount !== 1) {
            toast.error("Warning: Your summary should be exactly one sentence. Please revise before submitting.")
            return
        }

        toast.success(`Summary Submitted: Your ${wordCount} word summary has been submitted successfully.`)
        setIsTimerRunning(false)
    }

    const handleNext = () => {
        if (currentPassageIndex < PASSAGES.length - 1) {
            setCurrentPassageIndex((prev) => prev + 1)
            setProgress((prev) => Math.min(prev + 1, totalQuestions))
            resetSummary()
        }
    }

    const handlePrevious = () => {
        if (currentPassageIndex > 0) {
            setCurrentPassageIndex((prev) => prev - 1)
            setProgress((prev) => Math.max(prev - 1, 1))
            resetSummary()
        }
    }

    const resetSummary = () => {
        setSummaryContent("")
        setTimeRemaining(10 * 60)
        setIsTimerRunning(true)
    }

    const toggleBookmark = () => {
        const newStatus = !isBookmarked
        setIsBookmarked(newStatus)

        toast(newStatus ? "Added to bookmarks" : "Removed from bookmarks", {
            description: `Passage #${PASSAGES[currentPassageIndex].id} has been ${newStatus ? "added to" : "removed from"} your bookmarks.`,
        })
    }

    const toggleExpand = () => {
        setIsExpanded(!isExpanded)
    }

    const currentPassage = PASSAGES[currentPassageIndex]
    const difficultyColor = {
        Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }[currentPassage.difficulty]

    return (
        <main className="min-h-screen bg-gradient-to-b from-teal-50 to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <div className={cn("container mx-auto py-6 px-4", isExpanded ? "max-w-7xl" : "max-w-5xl")}>
                <Card className="shadow-lg border-t-4 border-t-teal-500 dark:border-t-teal-400">
                    <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-teal-600 dark:text-teal-400">Summarize Written Text</h1>
                                <Badge variant="outline" className="ml-2">
                                    {progress}/{totalQuestions}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="font-normal">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    {currentPassage.category}
                                </Badge>
                                <Badge variant="secondary" className={cn("font-normal", difficultyColor)}>
                                    <BarChart2 className="w-3 h-3 mr-1" />
                                    {currentPassage.difficulty}
                                </Badge>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={toggleBookmark}
                                            className={isBookmarked ? "text-amber-500" : ""}
                                        >
                                            {isBookmarked ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{isBookmarked ? "Remove bookmark" : "Bookmark this passage"}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={toggleExpand}>
                                            {isExpanded ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{isExpanded ? "Collapse view" : "Expand view"}</TooltipContent>
                                </Tooltip>
                            </TooltipProvider>

                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon">
                                            <HelpCircle className="h-5 w-5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p>You have 10 minutes to read the passage and write a one-sentence summary.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        </div>
                    </CardHeader>

                    <CardContent className="pt-4">
                        <div className="mb-6 space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Instructions:</h2>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    Read the passage below and summarize it using one sentence. Type your response in the box at the bottom
                                    of the screen. You have 10 minutes to finish this task. Your response will be judged on the quality of
                                    your writing and on how well your response presents the key points in the passage.
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="font-semibold">{currentPassage.title}</h2>
                                    <div className={cn("flex items-center gap-1 font-mono font-medium", getTimerColor())}>
                                        <Clock className="h-4 w-4" />
                                        {formattedTime}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-3 mb-4">
                                <TabsTrigger value="read" className="flex items-center gap-1">
                                    <BookOpen className="h-4 w-4" />
                                    <span className="hidden sm:inline">Read</span>
                                </TabsTrigger>
                                <TabsTrigger value="write" className="flex items-center gap-1">
                                    <PenLine className="h-4 w-4" />
                                    <span className="hidden sm:inline">Write</span>
                                </TabsTrigger>
                                <TabsTrigger value="tips" className="flex items-center gap-1">
                                    <Lightbulb className="h-4 w-4" />
                                    <span className="hidden sm:inline">Tips</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="read" className="mt-0">
                                <div
                                    className={cn(
                                        "border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto",
                                        isExpanded ? "h-[500px]" : "h-[350px]",
                                    )}
                                >
                                    <h3 className="font-medium text-lg mb-3">{currentPassage.title}</h3>
                                    <div className="prose dark:prose-invert max-w-none">
                                        {currentPassage.content.split("\n\n").map((paragraph, i) => (
                                            <p key={i} className="mb-4 leading-relaxed">
                                                {paragraph}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="write" className="mt-0">
                                <div className={cn(isExpanded ? "h-[500px]" : "h-[350px]", "flex flex-col")}>
                                    <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-t-md border border-teal-100 dark:border-teal-800 mb-1">
                                        <div className="flex items-start gap-2">
                                            <Scissors className="h-5 w-5 text-teal-600 dark:text-teal-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-medium text-teal-700 dark:text-teal-300">Your Task</h4>
                                                <p className="text-sm text-teal-700 dark:text-teal-300">
                                                    Write a <strong>single sentence</strong> that captures the main points of the passage.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Textarea
                                        ref={textareaRef}
                                        placeholder="Write your one-sentence summary here..."
                                        className="flex-1 resize-none text-base p-4 leading-relaxed"
                                        value={summaryContent}
                                        onChange={(e) => setSummaryContent(e.target.value)}
                                    />

                                    <div className="mt-2 flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className={sentenceCount === 1 ? "text-green-500" : "text-red-500"}>
                                                {sentenceCount} {sentenceCount === 1 ? "sentence" : "sentences"}
                                            </span>
                                            {sentenceCount !== 1 && <span className="text-red-500">(Must be exactly 1 sentence)</span>}
                                        </div>
                                        <span className="text-slate-500">{wordCount} words</span>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="tips" className="mt-0">
                                <div
                                    className={cn(
                                        "border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto",
                                        isExpanded ? "h-[500px]" : "h-[350px]",
                                    )}
                                >
                                    <h3 className="font-medium text-lg mb-3">Summarization Tips</h3>
                                    <ul className="space-y-3">
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Identify the main topic or central idea of the passage first.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Look for repeated concepts or themes throughout the passage.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>
                                                Use connecting words (and, while, although, etc.) to combine multiple ideas into one sentence.
                                            </span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Focus on the key points rather than minor details.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <span>Avoid simply copying phrases directly from the passage.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <span>Don't include your personal opinion or information not present in the passage.</span>
                                        </li>
                                    </ul>

                                    <div className="mt-4 p-3 bg-teal-50 dark:bg-teal-900/30 rounded-md border border-teal-100 dark:border-teal-800">
                                        <h4 className="font-medium flex items-center gap-1 text-teal-700 dark:text-teal-300">
                                            <ArrowUpRight className="h-4 w-4" />
                                            Pro Tip
                                        </h4>
                                        <p className="text-sm mt-1 text-teal-700 dark:text-teal-300">
                                            Use complex sentence structures with clauses to include multiple key points while maintaining a
                                            single sentence. For example: "While X is important, Y contributes significantly to Z, resulting in
                                            broader impacts across multiple domains."
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                        <div className="flex items-center gap-4">
                            <div className={sentenceCount === 1 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                                {sentenceCount === 1 ? (
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Valid summary
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        Must be one sentence
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentPassageIndex === 0}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>

                                <Button variant="outline" size="sm" onClick={resetSummary}>
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Restart
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={currentPassageIndex === PASSAGES.length - 1}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>

                            <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700" disabled={sentenceCount !== 1}>
                                <Upload className="h-4 w-4 mr-2" />
                                Submit
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </main >
    )
}
