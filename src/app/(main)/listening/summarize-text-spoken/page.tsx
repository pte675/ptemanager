"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import {
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Upload,
    Play,
    Pause,
    Volume2,
    Volume1,
    VolumeX,
    Repeat,
    SkipBack,
    SkipForward,
    Clock,
    BookOpen,
    HelpCircle,
    Bookmark,
    BookmarkCheck,
    Info,
    FileText,
    Edit3,
    List,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from 'sonner'
import rawQuestions from "./summarize-text-spoken.json"
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar"

export default function SummarizeSpokenTextInterface() {
    const [currentIndex, setcurrentIndex] = useState(0)
    const currentRaw = rawQuestions[currentIndex]

    const SAMPLE_LECTURE = {
        id: currentRaw.id,
        title: currentRaw.title,
        audioUrl: currentRaw.audio,
        transcript: currentRaw.question,
        difficulty: "Medium",
        category: "General",
        duration: 65, // You may calculate this dynamically later
        wordCountTarget: {
            min: 50,
            max: 70,
        },
        keyPoints: currentRaw.answer_ai?.split("###").filter((line) => line.trim()) || [],
    }

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(SAMPLE_LECTURE.duration)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [summaryContent, setSummaryContent] = useState("")
    const [wordCount, setWordCount] = useState(0)
    const [showTranscript, setShowTranscript] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(2)
    const [totalQuestions, setTotalQuestions] = useState(165)
    const [activeTab, setActiveTab] = useState("write")
    const [remainingTime, setRemainingTime] = useState(0)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [showKeyPoints, setShowKeyPoints] = useState(false)
    const [notesContent, setNotesContent] = useState("")
    const [playCount, setPlayCount] = useState(0)

    const audioRef = useRef<HTMLAudioElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [evaluationResult, setEvaluationResult] = useState<{ score?: string; feedback?: string } | null>(null);

    // Timer effect
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isTimerRunning && remainingTime > 0) {
            timer = setInterval(() => {
                setRemainingTime((prev) => prev - 1)
            }, 1000)
        } else if (remainingTime === 0 && isTimerRunning) {
            toast.error("Time's up! Your answers have been automatically submitted.")
            handleSubmit()
        }

        return () => clearInterval(timer)
    }, [isTimerRunning, remainingTime])

    // Word count effect
    useEffect(() => {
        const words = summaryContent.trim().split(/\s+/)
        setWordCount(summaryContent.trim() === "" ? 0 : words.length)
    }, [summaryContent])

    // Format time as MM:SS
    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60)
        const seconds = Math.floor(timeInSeconds % 60)
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    // Handle audio time update
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    // Handle audio play/pause
    const togglePlay = () => {
        if (!hasStarted) {
            setHasStarted(true)
            setIsTimerRunning(true)
            setRemainingTime(600) // 10 minutes for the exercise
        }

        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlaying(!isPlaying)
        }
    }

    // Handle audio ended
    const handleAudioEnded = () => {
        setIsPlaying(false)
        setPlayCount((prev) => prev + 1)
        if (playCount === 0) {
            toast("First listen complete. You can now start writing your summary or listen again if needed.")
        }
    }

    // Handle seeking in audio
    const handleSeek = (value: number[]) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value[0]
            setCurrentTime(value[0])
        }
    }

    // Handle volume change
    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0]
        setVolume(newVolume)
        if (audioRef.current) {
            audioRef.current.volume = newVolume / 100
        }
        if (newVolume === 0) {
            setIsMuted(true)
        } else {
            setIsMuted(false)
        }
    }

    // Toggle mute
    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    // Handle playback rate change
    const handlePlaybackRateChange = (rate: number) => {
        setPlaybackRate(rate)
        if (audioRef.current) {
            audioRef.current.playbackRate = rate
        }
    }

    // Restart audio
    const restartAudio = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            setCurrentTime(0)
            if (!isPlaying) {
                audioRef.current.play()
                setIsPlaying(true)
            }
        }
    }

    // Skip backward 5 seconds
    const skipBackward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5)
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    // Skip forward 5 seconds
    const skipForward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 5)
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    // Handle form submission
    const handleSubmit = async () => {

        // Update progress in localStorage
        const updateLocalStorage = (result: { score?: string }) => {
            const prevProgress = JSON.parse(localStorage.getItem("progress") || "{}")

            const prevData = prevProgress?.listening?.["summarize-text-spoken"] || {
                completed: 0,
                accuracy: null,
                streak: 0,
            }

            const isCurrentSummaryGood = result?.score && Number(result.score) >= 4

            const isNewQuestion = SAMPLE_LECTURE.id > prevData.completed
            const newCompleted = isNewQuestion ? SAMPLE_LECTURE.id : prevData.completed
            const newStreak = isCurrentSummaryGood ? prevData.streak + 1 : 0
            const newAccuracy = isNewQuestion
                ? prevData.accuracy === null
                    ? (isCurrentSummaryGood ? 1 : 0)
                    : ((prevData.accuracy * prevData.completed) + (isCurrentSummaryGood ? 1 : 0)) / newCompleted
                : prevData.accuracy

            const updatedProgress = {
                ...prevProgress,
                listening: {
                    ...prevProgress.listening,
                    "summarize-text-spoken": {
                        completed: newCompleted,
                        accuracy: parseFloat(newAccuracy.toFixed(2)),
                        streak: newStreak,
                    },
                },
            }

            localStorage.setItem("progress", JSON.stringify(updatedProgress))
        }

        //rest logic to handle submission
        if (wordCount < SAMPLE_LECTURE.wordCountTarget.min || wordCount > SAMPLE_LECTURE.wordCountTarget.max) {
            toast(
                `❗ Word count should be between ${SAMPLE_LECTURE.wordCountTarget.min}-${SAMPLE_LECTURE.wordCountTarget.max}. You wrote ${wordCount} words.`
            )
            return
        }

        setHasSubmitted(true)
        setIsTimerRunning(false)
        toast(`✅ Your ${wordCount}-word summary has been submitted successfully.`)

        try {
            const res = await fetch("/api/writing/essay-writing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    prompt: SAMPLE_LECTURE.transcript,
                    response: summaryContent.trim(),
                }),
            });

            const result = await res.json();

            setEvaluationResult(result);
            updateLocalStorage(result);

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


    // Reset exercise
    const resetExercise = () => {
        setEvaluationResult(null)
        setSummaryContent("")
        setNotesContent("")
        setShowTranscript(false)
        setShowKeyPoints(false)
        setHasSubmitted(false)
        setHasStarted(false)
        setIsTimerRunning(false)
        setRemainingTime(600)
        setPlayCount(0)
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            setCurrentTime(0)
            audioRef.current.pause()
            setIsPlaying(false)
        }
    }

    // Toggle bookmark
    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked)
        toast(
            `Lecture #${SAMPLE_LECTURE.id} has been ${isBookmarked ? "removed from" : "added to"} your bookmarks.`
        )
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setcurrentIndex(currentIndex - 1)
            setProgress((prev) => Math.max(prev - 1, 1))
            resetExercise()
        }
    }

    const handleNext = () => {
        if (currentIndex < rawQuestions.length - 1) {
            setcurrentIndex(currentIndex + 1)
            setProgress((prev) => Math.min(prev + 1, rawQuestions.length))
            resetExercise()
        }
    }

    // Get volume icon based on volume level
    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />
        if (volume < 50) return <Volume1 className="h-4 w-4" />
        return <Volume2 className="h-4 w-4" />
    }

    // Get timer color based on remaining time
    const getTimerColor = () => {
        if (remainingTime > 300) return "text-green-500" // More than 5 minutes
        if (remainingTime > 120) return "text-amber-500" // Between 2-5 minutes
        return "text-red-500" // Less than 2 minutes
    }

    // Get word count color based on target range
    const getWordCountColor = () => {
        if (wordCount < SAMPLE_LECTURE.wordCountTarget.min) return "text-amber-500"
        if (wordCount <= SAMPLE_LECTURE.wordCountTarget.max) return "text-green-500"
        return "text-red-500"
    }

    // Focus textarea when tab changes to write
    useEffect(() => {
        if (activeTab === "write" && textareaRef.current) {
            textareaRef.current.focus()
        }
    }, [activeTab])

    const difficultyColor = {
        Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }[SAMPLE_LECTURE.difficulty]

    return (
        <div className="container mx-auto py-6 px-4 max-w-5xl">
            <AIChatSidebar
                section="listening"
                questionType="summarize-spoken-text"
                instruction="You will hear a short lecture. You should write 50-70 words."
                passage={SAMPLE_LECTURE.transcript}
                userResponse={summaryContent}
            />
            <Card className="shadow-lg border-t-4 border-t-violet-500 dark:border-t-violet-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-violet-600 dark:text-violet-400">Summarize Spoken Text</h1>
                            <Badge variant="outline" className="ml-2">
                                {progress}/{totalQuestions}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="font-normal">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {SAMPLE_LECTURE.category}
                            </Badge>
                            <Badge variant="secondary" className={cn("font-normal", difficultyColor)}>
                                <Info className="w-3 h-3 mr-1" />
                                {SAMPLE_LECTURE.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="font-normal">
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(SAMPLE_LECTURE.duration)}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {hasStarted && (
                            <div className={cn("flex items-center gap-1 font-mono font-medium", getTimerColor())}>
                                <Clock className="h-4 w-4" />
                                {formatTime(remainingTime)}
                            </div>
                        )}

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
                                <TooltipContent>{isBookmarked ? "Remove bookmark" : "Bookmark this lecture"}</TooltipContent>
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
                                    <p>
                                        Listen to the lecture and write a summary for a fellow student who was not present. Your summary
                                        should be {SAMPLE_LECTURE.wordCountTarget.min}-{SAMPLE_LECTURE.wordCountTarget.max} words.
                                    </p>
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
                                You will hear a short lecture. Write a summary for a fellow student who was not present at the lecture.
                                You should write {SAMPLE_LECTURE.wordCountTarget.min}-{SAMPLE_LECTURE.wordCountTarget.max} words.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">{SAMPLE_LECTURE.title}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Audio Player */}
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                        <div className="flex flex-col space-y-4">
                            {/* Audio element (hidden) */}
                            <audio
                                ref={audioRef}
                                src={SAMPLE_LECTURE.audioUrl}
                                onTimeUpdate={handleTimeUpdate}
                                onEnded={handleAudioEnded}
                                onLoadedMetadata={() => {
                                    if (audioRef.current) {
                                        setDuration(audioRef.current.duration)
                                    }
                                }}
                            />

                            {/* Waveform visualization (simulated) */}
                            <div className="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                                <div
                                    className="absolute top-0 left-0 h-full bg-violet-100 dark:bg-violet-900/30"
                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                ></div>
                                <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                    <svg className="w-full h-8" viewBox="0 0 1200 100" preserveAspectRatio="none">
                                        {/* Simulated waveform - in a real app, this would be generated from the actual audio */}
                                        {Array.from({ length: 100 }).map((_, i) => {
                                            const height = 10 + Math.random() * 80
                                            return (
                                                <rect
                                                    key={i}
                                                    x={i * 12}
                                                    y={(100 - height) / 2}
                                                    width="6"
                                                    height={height}
                                                    rx="2"
                                                    fill={i * 12 < (currentTime / duration) * 1200 ? "#8b5cf6" : "#cbd5e1"}
                                                    className="dark:fill-slate-600"
                                                />
                                            )
                                        })}
                                    </svg>
                                </div>
                            </div>

                            {/* Playback controls */}
                            <div className="flex flex-col space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-mono">{formatTime(currentTime)}</span>
                                    <div className="flex items-center space-x-2">
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={restartAudio}>
                                                        <Repeat className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Restart</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={skipBackward}>
                                                        <SkipBack className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Back 5s</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <Button
                                            variant="default"
                                            size="icon"
                                            className="h-10 w-10 rounded-full bg-violet-500 hover:bg-violet-600"
                                            onClick={togglePlay}
                                        >
                                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                                        </Button>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button variant="ghost" size="icon" onClick={skipForward}>
                                                        <SkipForward className="h-4 w-4" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Forward 5s</TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <div className="relative group">
                                            <Button variant="ghost" size="icon" onClick={toggleMute}>
                                                {getVolumeIcon()}
                                            </Button>
                                            <div className="absolute hidden group-hover:block bottom-full left-1/2 -translate-x-1/2 w-24 p-2 bg-white dark:bg-slate-800 rounded-md shadow-md z-10">
                                                <Slider
                                                    value={[volume]}
                                                    min={0}
                                                    max={100}
                                                    step={1}
                                                    onValueChange={handleVolumeChange}
                                                    className="w-full"
                                                />
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <Button variant="ghost" size="sm" className="text-xs">
                                                {playbackRate}x
                                            </Button>
                                            <div className="absolute hidden group-hover:block bottom-full right-0 w-24 p-2 bg-white dark:bg-slate-800 rounded-md shadow-md z-10">
                                                <div className="flex flex-col space-y-1">
                                                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                                                        <Button
                                                            key={rate}
                                                            variant="ghost"
                                                            size="sm"
                                                            className={cn(
                                                                "text-xs justify-start",
                                                                playbackRate === rate && "bg-violet-100 dark:bg-violet-900/30",
                                                            )}
                                                            onClick={() => handlePlaybackRateChange(rate)}
                                                        >
                                                            {rate}x
                                                        </Button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono">{formatTime(duration)}</span>
                                </div>

                                <Slider
                                    value={[currentTime]}
                                    min={0}
                                    max={duration}
                                    step={0.1}
                                    onValueChange={handleSeek}
                                    className="w-full"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm">Transcript</span>
                                        <Switch checked={showTranscript} onCheckedChange={setShowTranscript} />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm">Key Points</span>
                                        <Switch checked={showKeyPoints} onCheckedChange={setShowKeyPoints} />
                                    </div>
                                </div>

                                <div className="text-sm text-slate-500">
                                    Played {playCount} {playCount === 1 ? "time" : "times"}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Transcript (conditionally rendered) */}
                    {showTranscript && (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                Transcript
                            </h3>
                            <div className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-40 overflow-y-auto">
                                {SAMPLE_LECTURE.transcript.split("\n\n").map((paragraph, i) => (
                                    <p key={i} className="mb-2">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Key Points (conditionally rendered) */}
                    {showKeyPoints && (
                        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-4">
                            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                                <List className="h-4 w-4" />
                                Key Points
                            </h3>
                            <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 pl-5 list-disc">
                                {SAMPLE_LECTURE.keyPoints.map((point, i) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-2 mb-4">
                            <TabsTrigger value="write" className="flex items-center gap-1">
                                <Edit3 className="h-4 w-4" />
                                <span className="hidden sm:inline">Write Summary</span>
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Notes</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="write" className="mt-0">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium">Your Summary</h3>
                                    <div className={cn("text-sm font-medium", getWordCountColor())}>
                                        {wordCount} / {SAMPLE_LECTURE.wordCountTarget.min}-{SAMPLE_LECTURE.wordCountTarget.max} words
                                    </div>
                                </div>

                                <Textarea
                                    ref={textareaRef}
                                    placeholder="Write your summary here..."
                                    className="min-h-[200px] resize-y text-base p-4 leading-relaxed"
                                    value={summaryContent}
                                    onChange={(e) => setSummaryContent(e.target.value)}
                                    disabled={hasSubmitted}
                                />

                                <Progress
                                    value={Math.min((wordCount / SAMPLE_LECTURE.wordCountTarget.max) * 100, 100)}
                                    className="h-1"
                                // indicatorClassName={cn(
                                //     wordCount < SAMPLE_LECTURE.wordCountTarget.min
                                //         ? "bg-amber-500"
                                //         : wordCount <= SAMPLE_LECTURE.wordCountTarget.max
                                //             ? "bg-green-500"
                                //             : "bg-red-500",
                                // )}
                                />

                                <div className="text-xs text-slate-500 flex justify-between">
                                    <span>Min: {SAMPLE_LECTURE.wordCountTarget.min} words</span>
                                    <span>Max: {SAMPLE_LECTURE.wordCountTarget.max} words</span>
                                </div>

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
                            </div>
                        </TabsContent>

                        <TabsContent value="notes" className="mt-0">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-medium">Your Notes (not submitted)</h3>
                                </div>

                                <Textarea
                                    placeholder="Take notes here while listening to the lecture..."
                                    className="min-h-[200px] resize-y text-base p-4 leading-relaxed"
                                    value={notesContent}
                                    onChange={(e) => setNotesContent(e.target.value)}
                                />

                                <p className="text-xs text-slate-500">
                                    These notes are for your reference only and will not be submitted as part of your answer.
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                        <div className="text-sm">
                            <span className="font-medium">Target:</span>{" "}
                            <span>
                                {SAMPLE_LECTURE.wordCountTarget.min}-{SAMPLE_LECTURE.wordCountTarget.max} words
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={progress === 1}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>

                            <Button variant="outline" size="sm" onClick={resetExercise}>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restart
                            </Button>

                            <Button variant="outline" size="sm" onClick={handleNext} disabled={progress === totalQuestions}>
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="bg-violet-600 hover:bg-violet-700"
                            disabled={
                                hasSubmitted ||
                                // !hasStarted ||
                                wordCount < SAMPLE_LECTURE.wordCountTarget.min ||
                                wordCount > SAMPLE_LECTURE.wordCountTarget.max
                            }
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Submit
                        </Button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
