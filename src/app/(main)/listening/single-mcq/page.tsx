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
    AlertCircle,
    Info,
    Headphones,
    Lightbulb,
    MessageSquare,
    CheckSquare,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestion from "./single-mcq.json"
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar"

export default function SingleChoiceInterface() {
    const parseQuestion = (raw: typeof rawQuestion[number]) => {
        const parts = raw.question.split("###")
        const questionText = parts[0].trim()

        // Extract correct answer letter (e.g., 'C')
        const correctLetterMatch = raw.answer.match(/Answer:\s*([A-D])/)
        const correctLetter = correctLetterMatch ? correctLetterMatch[1] : ""

        const options = parts.slice(1).map((opt, index) => ({
            id: String.fromCharCode(97 + index), // 'a', 'b', 'c', ...
            text: opt.replace(/^[A-D]\)/, "").trim(),
            isCorrect: String.fromCharCode(65 + index) === correctLetter, // Only the correct one
        }))

        const transcript = raw.answer.split("###Transcript:")[1]?.trim() || ""

        return {
            id: raw.id,
            title: raw.title,
            question: questionText,
            options,
            audioUrl: raw.audio.includes("uc?id=")
                ? raw.audio.replace(
                    /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
                    "https://drive.google.com/file/d/$1/preview"
                )
                : raw.audio,
            transcript,
            difficulty: "Medium",
            category: "General",
            duration: 65,
        }
    }
    const [currentIndex, setCurrentIndex] = useState(0)
    const SAMPLE_QUESTION = parseQuestion(rawQuestion[currentIndex])

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(SAMPLE_QUESTION.duration)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [selectedOption, setSelectedOption] = useState<string | undefined>(undefined)
    const [showAnswers, setShowAnswers] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(2)
    const [totalQuestions, setTotalQuestions] = useState(85)
    const [activeTab, setActiveTab] = useState("question")
    const [countdownValue, setCountdownValue] = useState(3)
    const [isCountingDown, setIsCountingDown] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [remainingTime, setRemainingTime] = useState(0)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [showTranscript, setShowTranscript] = useState(false)
    const [showHint, setShowHint] = useState(false)
    const [hintsUsed, setHintsUsed] = useState(0)

    const audioRef = useRef<HTMLAudioElement>(null)

    // Countdown effect
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (isCountingDown && countdownValue > 0) {
            timer = setInterval(() => {
                setCountdownValue((prev) => prev - 1)
            }, 1000)
        } else if (isCountingDown && countdownValue === 0) {
            setIsCountingDown(false)
            startExercise()
        }

        return () => clearInterval(timer)
    }, [isCountingDown, countdownValue])

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

    // Start the exercise
    const startExercise = () => {
        setHasStarted(true)
        setIsTimerRunning(true)
        setRemainingTime(90) // 1.5 minutes for the exercise
        if (audioRef.current) {
            audioRef.current.play()
            setIsPlaying(true)
        }
    }

    // Skip countdown
    const skipCountdown = () => {
        setIsCountingDown(false)
        startExercise()
    }

    // Begin countdown
    const beginCountdown = () => {
        setIsCountingDown(true)
        setCountdownValue(3)
    }

    // Handle audio play/pause
    const togglePlay = () => {
        if (!hasStarted) {
            beginCountdown()
            return
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

    // Handle radio selection
    const handleRadioChange = (value: string) => {
        setSelectedOption(value)
    }

    // Handle form submission
    const handleSubmit = () => {
        if (!selectedOption) {
            toast.error("Please select an answer before submitting.")
            return
        }

        setHasSubmitted(true)
        setIsTimerRunning(false)

        const isCorrect = SAMPLE_QUESTION.options.find(
            (option) => option.id === selectedOption
        )?.isCorrect

        toast(
            isCorrect
                ? "✅ Correct! Well done."
                : "❌ Incorrect. Try reviewing the audio again."
        )

        // Update progress in localStorage
        const prevProgress = JSON.parse(localStorage.getItem("progress") || "{}")

        const prevData = prevProgress?.listening?.["single-mcq"] || {
            completed: 0,
            accuracy: null,
            streak: 0,
        }

        const isNewQuestion = SAMPLE_QUESTION.id > prevData.completed
        const newCompleted = isNewQuestion ? SAMPLE_QUESTION.id : prevData.completed
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
                "single-mcq": {
                    completed: newCompleted,
                    accuracy: parseFloat(newAccuracy.toFixed(2)),
                    streak: newStreak,
                },
            },
        }

        localStorage.setItem("progress", JSON.stringify(updatedProgress))
    }

    // Reset exercise
    const resetExercise = () => {
        setSelectedOption(undefined)
        setShowAnswers(false)
        setHasSubmitted(false)
        setHasStarted(false)
        setIsTimerRunning(false)
        setRemainingTime(90)
        setShowTranscript(false)
        setShowHint(false)
        setHintsUsed(0)
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
            <div>
                <strong>{isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"}</strong>
                <div>
                    Question #{SAMPLE_QUESTION.id} has been {isBookmarked ? "removed from" : "added to"} your bookmarks.
                </div>
            </div>
        )
    }

    // Navigate to previous question
    const handlePrevious = () => {
        // toast({
        //     title: "Navigation",
        //     description: "Previous question would be loaded here.",
        //     variant: "default",
        // })
        resetExercise();
        setCurrentIndex((prev) => Math.max(prev - 1, 0))
        setProgress((prev) => Math.max(prev - 1, 1))
    }

    // Navigate to next question
    const handleNext = () => {
        // toast({
        //     title: "Navigation",
        //     description: "Next question would be loaded here.",
        //     variant: "default",
        // })
        resetExercise();
        setCurrentIndex((prev) => Math.min(prev + 1, rawQuestion.length - 1))
        setProgress((prev) => Math.min(prev + 1, totalQuestions))
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

    // Show hint
    const handleShowHint = () => {
        if (hintsUsed < 2) {
            setShowHint(true)
            setHintsUsed((prev) => prev + 1)
        } else {
            // toast({
            //     title: "No more hints",
            //     description: "You've used all available hints for this question.",
            //     variant: "destructive",
            // })
        }
    }

    // Get hint text based on the question
    const getHintText = () => {
        if (hintsUsed === 1) {
            return "Listen carefully to what the lecturer says about the survival of whales in certain environments."
        }
        return "The correct answer relates to the long-term viability of whale populations in noisy environments."
    }

    const difficultyColor = {
        Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }[SAMPLE_QUESTION.difficulty]

    return (
        <div className="container mx-auto py-6 px-4 max-w-5xl">
            <AIChatSidebar
                section="Listening"
                questionType="Multiple Choice Single Answer"
                instruction={`Choose the correct answer. Correct answer: ${SAMPLE_QUESTION.options.find(o => o.isCorrect)?.text}`}
                passage={SAMPLE_QUESTION.transcript}
                userResponse={SAMPLE_QUESTION.options.find(o => o.id === selectedOption)?.text || ""}
            />
            < Card className="shadow-lg border-t-4 border-t-blue-500 dark:border-t-blue-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Multiple Choice Question</h1>
                            <Badge variant="outline" className="ml-2">
                                {progress}/{totalQuestions}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="font-normal">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {SAMPLE_QUESTION.category}
                            </Badge>
                            <Badge variant="secondary" className={cn("font-normal", difficultyColor)}>
                                <Info className="w-3 h-3 mr-1" />
                                {SAMPLE_QUESTION.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="font-normal">
                                <CheckSquare className="w-3 h-3 mr-1" />
                                Single Answer
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
                                        Listen to the audio and select the correct answer. Only one answer is correct. You have 1.5 minutes
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
                                Listen to the recording and answer the multiple-choice question by selecting the correct response. Only
                                one response is correct.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">{SAMPLE_QUESTION.title}</h2>
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
                            {/* Countdown overlay */}
                            {isCountingDown && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg text-center">
                                        <h3 className="text-2xl font-bold mb-4">Get Ready!</h3>
                                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6">{countdownValue}</div>
                                        <Button onClick={skipCountdown}>Skip</Button>
                                    </div>
                                </div>
                            )}

                            {/* Audio Player */}
                            {/* <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col space-y-4">
                                    <audio
                                        ref={audioRef}
                                        src={SAMPLE_QUESTION.audioUrl}
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
                                            className="absolute top-0 left-0 h-full bg-blue-100 dark:bg-blue-900/30"
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
                                                            fill={i * 12 < (currentTime / duration) * 1200 ? "#3b82f6" : "#cbd5e1"}
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
                                                    className="h-10 w-10 rounded-full bg-blue-500 hover:bg-blue-600"
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
                                                                        playbackRate === rate && "bg-blue-100 dark:bg-blue-900/30",
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
                                src={SAMPLE_QUESTION.audioUrl}
                                width="100%"
                                height="60"
                                allow="autoplay"
                                title={`Audio for ${SAMPLE_QUESTION.title}`}
                                className="rounded-md border"
                            />

                            {/* Question and options */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <h3 className="text-lg font-medium mb-4">{SAMPLE_QUESTION.question}</h3>

                                {showHint && (
                                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-100 dark:border-blue-800">
                                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                            <Lightbulb className="h-4 w-4 flex-shrink-0" />
                                            <span>Hint: {getHintText()}</span>
                                        </p>
                                    </div>
                                )}

                                <RadioGroup
                                    key={SAMPLE_QUESTION.id} // ✅ This forces remount on question change
                                    value={selectedOption}
                                    onValueChange={handleRadioChange}
                                    className="space-y-3"
                                >
                                    {SAMPLE_QUESTION.options.map((option) => (
                                        <div
                                            key={option.id}
                                            className={cn(
                                                "flex items-start space-x-3 p-3 rounded-md",
                                                hasSubmitted &&
                                                (option.isCorrect
                                                    ? "bg-green-50 dark:bg-green-900/20"
                                                    : selectedOption === option.id
                                                        ? "bg-red-50 dark:bg-red-900/20"
                                                        : ""),
                                            )}
                                        >
                                            <RadioGroupItem
                                                value={option.id}
                                                id={option.id}
                                                // disabled={hasSubmitted || !hasStarted}
                                                disabled={hasSubmitted}
                                                className={cn(
                                                    hasSubmitted &&
                                                    (option.isCorrect
                                                        ? "border-green-500 text-green-500"
                                                        : selectedOption === option.id
                                                            ? "border-red-500 text-red-500"
                                                            : ""),
                                                )}
                                            />
                                            <div className="space-y-1 leading-none">
                                                <Label
                                                    htmlFor={option.id}
                                                    className={cn(
                                                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                                        hasSubmitted &&
                                                        (option.isCorrect
                                                            ? "text-green-700 dark:text-green-300"
                                                            : selectedOption === option.id
                                                                ? "text-red-700 dark:text-red-300"
                                                                : ""),
                                                    )}
                                                >
                                                    {option.id}) {option.text}
                                                </Label>
                                                {hasSubmitted && option.isCorrect && (
                                                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Correct answer
                                                    </p>
                                                )}
                                                {hasSubmitted && !option.isCorrect && selectedOption === option.id && (
                                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                                        <AlertCircle className="h-3 w-3" /> Incorrect answer
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </RadioGroup>

                                {hasSubmitted && (
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowTranscript(!showTranscript)}
                                            className="text-blue-600 dark:text-blue-400"
                                        >
                                            {showTranscript ? "Hide Transcript" : "Show Transcript"}
                                        </Button>
                                        {showTranscript && (
                                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-md text-sm">
                                                <h4 className="font-medium mb-2">Audio Transcript:</h4>
                                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                                                    {SAMPLE_QUESTION.transcript}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        <TabsContent value="tips" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <h3 className="font-medium text-lg mb-3">Single Choice Tips</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Listen to the entire recording before selecting your answer.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Pay attention to the speaker's tone and emphasis, which may indicate important information.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Look for options that accurately summarize the main point rather than minor details from the
                                            recording.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Use the playback controls to listen again to sections you're unsure about or that contain key
                                            information.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Be careful with options that contain partially correct information but misrepresent the overall
                                            message.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Don't select an option just because it contains words from the recording - context matters.
                                        </span>
                                    </li>
                                </ul>

                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-100 dark:border-blue-800">
                                    <h4 className="font-medium flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                        <Lightbulb className="h-4 w-4" />
                                        Pro Tip
                                    </h4>
                                    <p className="text-sm mt-1 text-blue-700 dark:text-blue-300">
                                        Use the process of elimination. First identify options that are clearly incorrect, then focus on
                                        distinguishing between the remaining choices. This approach is especially helpful when you're unsure
                                        about the answer.
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="discussion" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-lg">Discussion</h3>
                                    <Badge variant="outline">2 comments</Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                                <span className="font-medium text-blue-600 dark:text-blue-300">TN</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Taylor Nguyen</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">4 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I was torn between options B and C. The lecturer does mention communication between whales, but I
                                            think the main point was about survival in noisy environments.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <span className="font-medium text-green-600 dark:text-green-300">DR</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Dr. Rodriguez</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                                    <span>Instructor</span> • 3 days ago
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Good observation, Taylor. The key part of the lecture is when the speaker says "in areas with high
                                            levels of sound pollution, whale populations show signs of chronic stress..." and then mentions
                                            that "some whale populations may not be able to survive long-term" in noisy environments. This
                                            directly corresponds to option C.
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
                        {hasStarted && !hasSubmitted && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShowHint}
                                disabled={hintsUsed >= 2}
                                className="text-blue-600 dark:text-blue-400"
                            >
                                <Lightbulb className="h-4 w-4 mr-2" />
                                {hintsUsed === 0 ? "Get Hint" : hintsUsed === 1 ? "Get Final Hint" : "No More Hints"}
                                {hintsUsed > 0 && <span className="ml-1">({hintsUsed}/2 used)</span>}
                            </Button>
                        )}
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
                            className="bg-blue-600 hover:bg-blue-700"
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
