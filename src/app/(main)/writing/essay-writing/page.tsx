"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
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
    Eye,
    Bookmark,
    BookmarkCheck,
    HelpCircle,
    Lightbulb,
    BarChart2,
    ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestions from "./essay-writing.json"
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar"

export default function EssayWritingInterface() {
    const [activeTab, setActiveTab] = useState("write")
    const [essayContent, setEssayContent] = useState("")
    const [wordCount, setWordCount] = useState(0)
    const [timeRemaining, setTimeRemaining] = useState(20 * 60) // 20 minutes in seconds
    const [isTimerRunning, setIsTimerRunning] = useState(true)
    const [currentEssayIndex, setCurrentEssayIndex] = useState(0)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(5)
    const [totalQuestions, setTotalQuestions] = useState(144)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Calculate time remaining in minutes and seconds
    const minutes = Math.floor(timeRemaining / 60)
    const seconds = timeRemaining % 60

    // Format time as MM:SS
    const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`

    const ESSAY_TOPICS = rawQuestions.map((q, index) => ({
        id: q.id,
        topic: q.content,
        category: "General", // or derive from q if available
        difficulty: index % 3 === 0 ? "Easy" : index % 3 === 1 ? "Medium" : "Hard", // simple cycling
    }))

    const [evaluationResult, setEvaluationResult] = useState<{ score?: string; feedback?: string } | null>(null);


    // Timer effect
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isTimerRunning && timeRemaining > 0) {
            timer = setInterval(() => {
                setTimeRemaining((prev) => prev - 1)
            }, 1000)
        } else if (timeRemaining === 0) {
            toast.error("Time's up! Your essay has been automatically submitted.")
        }

        return () => clearInterval(timer)
    }, [isTimerRunning, timeRemaining])

    // Word count effect
    useEffect(() => {
        const words = essayContent.trim().split(/\s+/)
        setWordCount(essayContent.trim() === "" ? 0 : words.length)
    }, [essayContent])

    // Focus textarea when tab changes to write
    useEffect(() => {
        if (activeTab === "write" && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [activeTab])

    // Timer color based on remaining time
    const getTimerColor = () => {
        if (timeRemaining > 10 * 60) return "text-green-500" // More than 10 minutes
        if (timeRemaining > 5 * 60) return "text-amber-500" // Between 5-10 minutes
        return "text-red-500" // Less than 5 minutes
    }

    // Word count color based on target (200-300 words)
    const getWordCountColor = () => {
        if (wordCount < 200) return "text-amber-500"
        if (wordCount <= 300) return "text-green-500"
        return "text-red-500"
    }

    const handleSubmit = async () => {
        //update the local storage with the essay progress
        const updateLocalStorage = (score: number) => {
            const isCorrect = score >= 4
            const prevProgress = JSON.parse(localStorage.getItem("progress") || "{}")

            const prevData = prevProgress?.writing?.["essay-writing"] || {
                completed: 0,
                accuracy: null,
                streak: 0,
            }

            const isNewEssay = currentEssay.id > prevData.completed
            const newCompleted = isNewEssay ? currentEssay.id : prevData.completed
            const newStreak = isCorrect ? prevData.streak + 1 : 0
            const newAccuracy = isNewEssay
                ? prevData.accuracy === null
                    ? (isCorrect ? 1 : 0)
                    : ((prevData.accuracy * prevData.completed) + (isCorrect ? 1 : 0)) / newCompleted
                : prevData.accuracy

            const updatedProgress = {
                ...prevProgress,
                writing: {
                    ...prevProgress.writing,
                    "essay-writing": {
                        completed: newCompleted,
                        accuracy: parseFloat(newAccuracy.toFixed(2)),
                        streak: newStreak,
                    },
                },
            }

            localStorage.setItem("progress", JSON.stringify(updatedProgress))
        }

        //rest logic to handle submit
        toast.success(`Your ${wordCount} word essay has been submitted successfully.`)
        setIsTimerRunning(false)

        try {
            const res = await fetch("/api/writing/essay-writing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: currentEssay.topic,
                    response: essayContent.trim(),
                }),
            });

            const result = await res.json();

            setEvaluationResult(result);
            updateLocalStorage(parseInt(result.score || "0"))

            toast.success("Evaluation Complete", {
                description: `Score: ${result.score || "N/A"} - ${result.feedback || "No feedback"}`,
            });

        } catch (err: any) {
            toast.error("Evaluation failed. Please try again later.", {
                description: err.message || "Unexpected error",
            });

            setEvaluationResult({
                score: undefined,
                feedback: "An error occurred while evaluating your summary.",
            });
        }
    }

    const handleNext = () => {
        if (currentEssayIndex < ESSAY_TOPICS.length - 1) {
            setCurrentEssayIndex((prev) => prev + 1)
            setProgress((prev) => Math.min(prev + 1, totalQuestions))
            resetEssay()
        }
    }

    const handlePrevious = () => {
        if (currentEssayIndex > 0) {
            setCurrentEssayIndex((prev) => prev - 1)
            setProgress((prev) => Math.max(prev - 1, 1))
            resetEssay()
        }
    }

    const resetEssay = () => {
        setEvaluationResult(null)
        setEssayContent("")
        setTimeRemaining(20 * 60)
        setIsTimerRunning(true)
    }

    const toggleBookmark = () => {
        const newStatus = !isBookmarked
        setIsBookmarked(newStatus)

        toast(newStatus ? "Added to bookmarks" : "Removed from bookmarks", {
            description: `Essay #${ESSAY_TOPICS[currentEssayIndex].id} has been ${newStatus ? "added to" : "removed from"} your bookmarks.`,
        })
    }

    const currentEssay = ESSAY_TOPICS[currentEssayIndex]
    const difficultyColor = {
        Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }[currentEssay.difficulty]

    return (
        <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <AIChatSidebar
                section="Writing"
                questionType="Write Essay"
                instruction="Write a 200–300 word essay in response to the given prompt."
                passage={currentEssay.topic} // instead of currentPassage.content
                userResponse={essayContent}
            />
            <div className="container mx-auto py-6 px-4 max-w-5xl">
                <Card className="shadow-lg border-t-4 border-t-violet-500 dark:border-t-violet-400">
                    <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-violet-600 dark:text-violet-400">Essay Writing</h1>
                                <Badge variant="outline" className="ml-2">
                                    {progress}/{totalQuestions}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="font-normal">
                                    <BookOpen className="w-3 h-3 mr-1" />
                                    {currentEssay.category}
                                </Badge>
                                <Badge variant="secondary" className={cn("font-normal", difficultyColor)}>
                                    <BarChart2 className="w-3 h-3 mr-1" />
                                    {currentEssay.difficulty}
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
                                    <TooltipContent>{isBookmarked ? "Remove bookmark" : "Bookmark this essay"}</TooltipContent>
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
                                        <p>You have 20 minutes to write an essay of 200-300 words.</p>
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
                                    You will have 20 minutes to plan, write and revise an essay about the topic below. Your response will be
                                    judged on how well you develop a position, organize your ideas, present supporting details, and control
                                    the elements of standard written English. You should write 200-300 words.
                                </p>
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <h2 className="font-semibold">Essay-{currentEssay.id}</h2>
                                    <div className={cn("flex items-center gap-1 font-mono font-medium", getTimerColor())}>
                                        <Clock className="h-4 w-4" />
                                        {formattedTime}
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                                    <p className="text-slate-800 dark:text-slate-200 font-medium">{currentEssay.topic}</p>
                                </div>
                            </div>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid grid-cols-3 mb-4">
                                <TabsTrigger value="write" className="flex items-center gap-1">
                                    <PenLine className="h-4 w-4" />
                                    <span className="hidden sm:inline">Write</span>
                                </TabsTrigger>
                                <TabsTrigger value="preview" className="flex items-center gap-1">
                                    <Eye className="h-4 w-4" />
                                    <span className="hidden sm:inline">Preview</span>
                                </TabsTrigger>
                                <TabsTrigger value="tips" className="flex items-center gap-1">
                                    <Lightbulb className="h-4 w-4" />
                                    <span className="hidden sm:inline">Tips</span>
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="write" className="flex flex-col mt-0 gap-5">
                                <Textarea
                                    ref={textareaRef}
                                    placeholder="Write your essay here..."
                                    className="min-h-[300px] resize-y text-base p-4 leading-relaxed"
                                    value={essayContent}
                                    onChange={(e) => setEssayContent(e.target.value)}
                                />
                                {/* Evaluation Result Card */}
                                {evaluationResult && (
                                    <div className="p-4 rounded-xl border border-purple-300 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-xl">
                                        <h4 className="text-lg font-bold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
                                            ✅ Evaluation Result
                                        </h4>
                                        <div className="text-sm space-y-2 text-slate-800 dark:text-slate-300">
                                            <p>
                                                <strong className="text-purple-600 dark:text-purple-400">Score:</strong>{" "}
                                                <span className="font-medium">{evaluationResult.score || "N/A"} / 5</span>
                                            </p>
                                            <p>
                                                <strong className="text-purple-600 dark:text-purple-400">Feedback:</strong><br />
                                                <span className="italic">{evaluationResult.feedback}</span>
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="preview" className="mt-0">
                                <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900">
                                    {essayContent ? (
                                        <div className="prose dark:prose-invert max-w-none">
                                            {essayContent.split("\n").map((paragraph, i) => (
                                                <p key={i}>{paragraph || <br />}</p>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-400">
                                            <p>Your essay preview will appear here</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="tips" className="mt-0">
                                <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                    <h3 className="font-medium text-lg mb-3">Essay Writing Tips</h3>
                                    <ul className="space-y-3">
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Start with a clear thesis statement that directly addresses the question.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Use specific examples to support your arguments.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Organize your essay with a clear introduction, body paragraphs, and conclusion.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>Use transition words to connect your ideas smoothly.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <span>Avoid repetition and vague language.</span>
                                        </li>
                                        <li className="flex gap-2">
                                            <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                            <span>Don't introduce new ideas in your conclusion.</span>
                                        </li>
                                    </ul>

                                    <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-900/30 rounded-md border border-violet-100 dark:border-violet-800">
                                        <h4 className="font-medium flex items-center gap-1 text-violet-700 dark:text-violet-300">
                                            <ArrowUpRight className="h-4 w-4" />
                                            Pro Tip
                                        </h4>
                                        <p className="text-sm mt-1 text-violet-700 dark:text-violet-300">
                                            Spend the first 3-5 minutes planning your essay structure before you start writing. This will help
                                            you organize your thoughts and create a more coherent argument.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                        <div className="flex items-center gap-4">
                            <div className={cn("font-medium", getWordCountColor())}>
                                {wordCount} words
                                {wordCount < 200 && wordCount > 0 && <span className="text-xs ml-1">(need {200 - wordCount} more)</span>}
                                {wordCount > 300 && <span className="text-xs ml-1">({wordCount - 300} over limit)</span>}
                            </div>

                            <Progress
                                value={Math.min((wordCount / 300) * 100, 100)}
                                className="w-24 h-2"
                            // indicatorClassName={cn(
                            //     wordCount < 200 ? "bg-amber-500" : wordCount <= 300 ? "bg-green-500" : "bg-red-500",
                            // )}
                            />
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentEssayIndex === 0}>
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Previous
                                </Button>

                                <Button variant="outline" size="sm" onClick={resetEssay}>
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Restart
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleNext}
                                    disabled={currentEssayIndex === ESSAY_TOPICS.length - 1}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>

                            <Button
                                onClick={handleSubmit}
                                className="bg-violet-600 hover:bg-violet-700"
                                disabled={evaluationResult != null}
                            >
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
