"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"
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
    CheckCircle2,
    XCircle,
    Headphones,
    Lightbulb,
    MessageSquare,
    BarChart2,
    ArrowUpRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestions from "./highlight-correct-summary.json"
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar"

const SAMPLE_QUESTIONS = rawQuestions.map((item) => {
    const correctId = item.answer.split("###Transcript:")[0]?.trim().slice(-1).toLowerCase()
    const options = item.question
        .split("###")
        .filter(opt => /^[A-D]\)/.test(opt.trim()))
        .map(opt => {
            const id = opt.trim()[0].toLowerCase()
            return {
                id,
                text: opt.trim().slice(3).trim(),
                correct: id === correctId,
            }
        })
    const transcript = item.answer.split("###Transcript:")[1]?.replace("###", "").trim()
    return {
        id: item.id,
        title: item.title,
        audioUrl: item.audio.includes("uc?id=")
            ? item.audio.replace(
                /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
                "https://drive.google.com/file/d/$1/preview"
            )
            : item.audio,
        duration: 90,
        options,
        transcript,
        difficulty: "Medium",
        category: "General",
    }
})


export default function HighlightCorrectSummaryInterface() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(SAMPLE_QUESTIONS[currentQuestionIndex].duration)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(1)
    const [totalQuestions, setTotalQuestions] = useState(16)
    const [activeTab, setActiveTab] = useState("question")
    const [remainingTime, setRemainingTime] = useState(0)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)

    const audioRef = useRef<HTMLAudioElement>(null)

    // Timer effect
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isTimerRunning && remainingTime > 0) {
            timer = setInterval(() => {
                setRemainingTime((prev) => prev - 1)
            }, 1000)
        } else if (remainingTime === 0 && isTimerRunning) {
            toast.error("Time's up! Your essay has been automatically submitted.")
            handleSubmit()
        }

        return () => clearInterval(timer)
    }, [isTimerRunning, remainingTime])

    // Update duration when question changes
    useEffect(() => {
        setDuration(SAMPLE_QUESTIONS[currentQuestionIndex].duration)
        resetQuestion()
    }, [currentQuestionIndex])

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
            setRemainingTime(120) // 2 minutes for the exercise
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

    // Handle option selection
    const handleOptionSelect = (optionId: string) => {
        setSelectedOption(optionId)
    }

    // Handle form submission
    const handleSubmit = () => {
        if (!selectedOption) {
            toast.error(
                "Selection Required, Please select an option before submitting.",
            )
            return
        }

        setHasSubmitted(true)
        setIsTimerRunning(false)

        const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex]
        const selectedOptionObj = currentQuestion.options.find((opt) => opt.id === selectedOption)
        const isCorrect = selectedOptionObj?.correct || false

        toast(isCorrect ?
            "Correct! You selected the correct summary." : "Incorrect. The correct answer has been highlighted.")


        // Update progress in localStorage
        const prevProgress = JSON.parse(localStorage.getItem("progress") || "{}")
        const prevData = prevProgress?.listening?.["highlight-correct-summary"] || {
            completed: 0,
            accuracy: null,
            streak: 0,
        }

        const isNewQuestion = currentQuestion.id > prevData.completed
        const newCompleted = isNewQuestion ? currentQuestion.id : prevData.completed
        const newStreak = isCorrect ? prevData.streak + 1 : 0
        const newAccuracy = isNewQuestion
            ? prevData.accuracy === null
                ? (isCorrect ? 1 : 0)
                : ((prevData.accuracy * prevData.completed) + (isCorrect ? 1 : 0)) / newCompleted
            : prevData.accuracy

        const updatedProgress = {
            ...prevProgress,
            listening: {
                ...prevProgress.listening,
                "highlight-correct-summary": {
                    completed: newCompleted,
                    accuracy: parseFloat(newAccuracy.toFixed(2)),
                    streak: newStreak,
                },
            },
        }

        localStorage.setItem("progress", JSON.stringify(updatedProgress))

    }

    // Reset question
    const resetQuestion = () => {
        setSelectedOption(null)
        setHasSubmitted(false)
        setHasStarted(false)
        setIsTimerRunning(false)
        setRemainingTime(120)
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
            isBookmarked ? "Removed from bookmarks" : "Added to bookmarks",
            {
                description: `Question #${SAMPLE_QUESTIONS[currentQuestionIndex].id} has been ${isBookmarked ? "removed from" : "added to"} your bookmarks.`,
            }
        )
    }

    // Navigate to previous question
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
            setProgress(Math.max(progress - 1, 1))
        }
    }

    // Navigate to next question
    const handleNext = () => {
        if (currentQuestionIndex < SAMPLE_QUESTIONS.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
            setProgress(Math.min(progress + 1, totalQuestions))
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
        if (remainingTime > 60) return "text-green-500" // More than 1 minute
        if (remainingTime > 30) return "text-amber-500" // Between 30-60 seconds
        return "text-red-500" // Less than 30 seconds
    }

    const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex]
    const difficultyColor = {
        Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }[currentQuestion.difficulty]

    return (
        <div className="container mx-auto py-6 px-4 max-w-5xl">
            <AIChatSidebar
                section="Listening"
                questionType="Highlight Correct Summary"
                instruction={`Select the paragraph that best summarizes the recording. Correct option: "${currentQuestion.options.find(o => o.correct)?.text}"`}
                passage={`/Transcript:${currentQuestion.transcript}`}
                userResponse={selectedOption ? currentQuestion.options.find(o => o.id === selectedOption)?.text || "" : ""}
            />
            <Card className="shadow-lg border-t-4 border-t-indigo-500 dark:border-t-indigo-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Highlight Correct Summary</h1>
                            <Badge variant="outline" className="ml-2">
                                {progress}/{totalQuestions}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="font-normal">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {currentQuestion.category}
                            </Badge>
                            <Badge variant="secondary" className={cn("font-normal", difficultyColor)}>
                                <BarChart2 className="w-3 h-3 mr-1" />
                                {currentQuestion.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="font-normal">
                                <Headphones className="w-3 h-3 mr-1" />
                                Listening
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
                                <TooltipContent>{isBookmarked ? "Remove bookmark" : "Bookmark this question"}</TooltipContent>
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
                                        Listen to the audio and select the paragraph that best summarizes the recording. You have 2 minutes
                                        to complete this task.
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
                                You will hear a recording. Click on the paragraph that best relates to the recording. You can play the
                                audio as many times as you need within the time limit.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">{currentQuestion.title}</h2>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="question" className="flex items-center gap-1">
                                <Headphones className="h-4 w-4" />
                                <span className="hidden sm:inline">Question</span>
                            </TabsTrigger>
                            <TabsTrigger value="tips" className="flex items-center gap-1">
                                <Lightbulb className="h-4 w-4" />
                                <span className="hidden sm:inline">Tips</span>
                            </TabsTrigger>
                            <TabsTrigger value="discussion" className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                <span className="hidden sm:inline">Discussion</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="question" className="mt-0 space-y-4">
                            {/* Audio Player */}
                            {/* <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col space-y-4">
                                    <audio
                                        ref={audioRef}
                                        src={currentQuestion.audioUrl}
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={() => setIsPlaying(false)}
                                        onLoadedMetadata={() => {
                                            if (audioRef.current) {
                                                setDuration(audioRef.current.duration)
                                            }
                                        }}
                                    />

                                    <div className="relative h-12 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-indigo-100 dark:bg-indigo-900/30"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        ></div>
                                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                            <svg className="w-full h-8" viewBox="0 0 1200 100" preserveAspectRatio="none">
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
                                                            fill={i * 12 < (currentTime / duration) * 1200 ? "#6366f1" : "#cbd5e1"}
                                                            className="dark:fill-slate-600"
                                                        />
                                                    )
                                                })}
                                            </svg>
                                        </div>
                                    </div>

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
                                                    className="h-10 w-10 rounded-full bg-indigo-500 hover:bg-indigo-600"
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
                                                                        playbackRate === rate && "bg-indigo-100 dark:bg-indigo-900/30",
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
                                </div>
                            </div> */}

                            <iframe
                                src={currentQuestion.audioUrl}
                                width="100%"
                                height="60"
                                allow="autoplay"
                                title={`Audio for ${currentQuestion.title}`}
                                className="rounded-md border"
                            />

                            {/* Summary options */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <RadioGroup value={selectedOption || ""} onValueChange={handleOptionSelect} className="space-y-4">
                                    {currentQuestion.options.map((option) => {
                                        const isCorrectOption = option.correct
                                        const isSelectedOption = selectedOption === option.id

                                        return (
                                            <div
                                                key={option.id}
                                                className={cn(
                                                    "relative rounded-lg border p-4 transition-all",
                                                    hasSubmitted && isCorrectOption
                                                        ? "border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                                                        : hasSubmitted && isSelectedOption && !isCorrectOption
                                                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
                                                            : isSelectedOption
                                                                ? "border-indigo-500 dark:border-indigo-400"
                                                                : "border-slate-200 dark:border-slate-700",
                                                )}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <div className="flex items-center h-5 mt-0.5">
                                                        <RadioGroupItem
                                                            value={option.id}
                                                            id={option.id}
                                                            disabled={hasSubmitted}
                                                            className={cn(
                                                                hasSubmitted && isCorrectOption
                                                                    ? "border-green-500 text-green-500"
                                                                    : hasSubmitted && isSelectedOption && !isCorrectOption
                                                                        ? "border-red-500 text-red-500"
                                                                        : "",
                                                            )}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Label
                                                            htmlFor={option.id}
                                                            className={cn(
                                                                "text-base font-medium leading-relaxed",
                                                                hasSubmitted && isCorrectOption
                                                                    ? "text-green-700 dark:text-green-300"
                                                                    : hasSubmitted && isSelectedOption && !isCorrectOption
                                                                        ? "text-red-700 dark:text-red-300"
                                                                        : "",
                                                            )}
                                                        >
                                                            {option.id}) {option.text}
                                                        </Label>
                                                    </div>
                                                </div>
                                                {hasSubmitted && (
                                                    <div className="absolute right-4 top-4">
                                                        {isCorrectOption ? (
                                                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                        ) : isSelectedOption && !isCorrectOption ? (
                                                            <XCircle className="h-5 w-5 text-red-500" />
                                                        ) : null}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </RadioGroup>
                            </div>
                        </TabsContent>

                        <TabsContent value="tips" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <h3 className="font-medium text-lg mb-3">Highlight Correct Summary Tips</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Listen for the main idea or purpose of the recording, not just specific details or examples.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Quickly skim all options before playing the audio to know what to listen for specifically.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Eliminate obviously incorrect options that contain information not mentioned in the recording.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Be careful with options that are partially correct but misrepresent some key information.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Take notes while listening to help remember key points, especially for longer recordings.
                                        </span>
                                    </li>
                                </ul>

                                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md border border-indigo-100 dark:border-indigo-800">
                                    <h4 className="font-medium flex items-center gap-1 text-indigo-700 dark:text-indigo-300">
                                        <ArrowUpRight className="h-4 w-4" />
                                        Pro Tip
                                    </h4>
                                    <p className="text-sm mt-1 text-indigo-700 dark:text-indigo-300">
                                        The correct summary often captures the overall purpose or conclusion of the recording, not just a
                                        collection of facts. Look for options that accurately represent the speaker's main point or
                                        argument.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="discussion" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-lg">Discussion</h3>
                                    <Badge variant="outline">3 comments</Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                                                <span className="font-medium text-indigo-600 dark:text-indigo-300">RM</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Rachel M.</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">3 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I found this question tricky because options B and C both seemed plausible. How do you distinguish
                                            between them?
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md ml-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <span className="font-medium text-green-600 dark:text-green-300">TJ</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Tutor James</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Option C focuses on conservation efforts, which is the main point of the recording. Option B talks
                                            about breeding habits, which is only briefly mentioned.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                                <span className="font-medium text-purple-600 dark:text-purple-300">KL</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Kevin L.</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I've noticed that the correct answer often includes the conclusion or main purpose of the
                                            recording. Is that a good strategy to follow?
                                        </p>
                                    </div>

                                    <div className="pt-4">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Login to join the discussion</p>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>

                <CardFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-4">
                        {hasSubmitted && (
                            <div
                                className={cn(
                                    "flex items-center gap-1 font-medium",
                                    currentQuestion.options.find((opt) => opt.id === selectedOption)?.correct
                                        ? "text-green-500"
                                        : "text-red-500",
                                )}
                            >
                                {currentQuestion.options.find((opt) => opt.id === selectedOption)?.correct ? (
                                    <>
                                        <CheckCircle2 className="h-4 w-4" />
                                        Correct
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4" />
                                        Incorrect
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>

                            <Button variant="outline" size="sm" onClick={resetQuestion}>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restart
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleNext}
                                disabled={currentQuestionIndex === SAMPLE_QUESTIONS.length - 1}
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>

                        <Button
                            onClick={handleSubmit}
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={hasSubmitted || !selectedOption}
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
