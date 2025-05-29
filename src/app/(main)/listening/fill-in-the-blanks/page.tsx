"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
    ListChecks,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestions from "./fill-in-the-blanks.json"
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar"

type RawQuestion = {
    id: number;
    title: string;
    question: string;
    answer: string;
    audio: string;
};

type ExerciseType = {
    id: number;
    title: string;
    transcript: string;
    blanks: { id: number; answer: string }[];
    audioUrl: string;
    difficulty: string;
    category: string;
    duration: number;
};

export default function ListeningFillBlanksInterface() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [exercise, setExercise] = useState(() => parseExercise(rawQuestions[0]))

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(exercise.duration)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [answers, setAnswers] = useState<string[]>(Array(exercise.blanks.length).fill(""))
    const [showAnswers, setShowAnswers] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(2)
    const [totalQuestions, setTotalQuestions] = useState(43)
    const [activeTab, setActiveTab] = useState("exercise")
    const [remainingTime, setRemainingTime] = useState(0)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)

    const audioRef = useRef<HTMLAudioElement>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Initialize input refs
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, exercise.blanks.length)
    }, [])

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

    function parseExercise(questionData: RawQuestion): ExerciseType {
        let blankCounter = 0

        return {
            id: questionData.id,
            title: questionData.title,
            transcript: questionData.question.replace(/\[input\]/g, () => `[${++blankCounter}]`),
            blanks: questionData.answer
                .replace("Answer:", "")
                .trim()
                .split(",")
                .map((ans: string, index: number) => ({
                    id: index + 1,
                    answer: ans.replace(/^\s*\d+\./, "").trim(),
                })),
            audioUrl: questionData.audio.includes("uc?id=")
                ? questionData.audio.replace(
                    /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
                    "https://drive.google.com/file/d/$1/preview"
                )
                : questionData.audio,
            difficulty: "Medium",
            category: "General",
            duration: 90,
        }
    }

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
            setRemainingTime(180) // 3 minutes for the exercise
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

    // Handle answer change
    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers]
        newAnswers[index] = value
        setAnswers(newAnswers)
    }

    // Handle form submission
    const handleSubmit = () => {
        setHasSubmitted(true)
        setIsTimerRunning(false)

        // Calculate score
        const correctAnswers = answers.filter(
            (answer, index) => answer.toLowerCase().trim() === exercise.blanks[index].answer.toLowerCase(),
        ).length

        toast.success(`You got ${correctAnswers} out of ${exercise.blanks.length} correct.`)

    }

    // Reset exercise
    const resetExercise = () => {
        // setAnswers(Array(exercise.blanks.length).fill(""))
        setShowAnswers(false)
        setHasSubmitted(false)
        setHasStarted(false)
        setIsTimerRunning(false)
        setRemainingTime(180)
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            setCurrentTime(0)
            audioRef.current.pause()
            setIsPlaying(false)
        }
    }

    // Toggle bookmark
    const toggleBookmark = () => {
        const newStatus = !isBookmarked;
        setIsBookmarked(newStatus);

        toast(newStatus ? "Added to bookmarks" : "Removed from bookmarks", {
            description: `Exercise #${exercise.id} has been ${newStatus ? "added to" : "removed from"} your bookmarks.`,
        });
    };

    // Navigate to previous question
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            const prevIndex = currentQuestionIndex - 1
            const prevExercise = parseExercise(rawQuestions[prevIndex])

            setCurrentQuestionIndex(prevIndex)
            setExercise(prevExercise)
            setProgress(prevIndex + 1)
            setAnswers(Array(prevExercise.blanks.length).fill(""))
            resetExercise()
        } else {
            toast("Start of questions", {
                description: "You're already on the first question.",
            })
        }
    }

    const handleNext = () => {
        if (currentQuestionIndex < rawQuestions.length - 1) {
            const nextIndex = currentQuestionIndex + 1
            const nextExercise = parseExercise(rawQuestions[nextIndex])

            setCurrentQuestionIndex(nextIndex)
            setExercise(nextExercise)
            setProgress(nextIndex + 1)
            setAnswers(Array(nextExercise.blanks.length).fill("")) // ✅ Fix: use new exercise
            resetExercise() // call after setting new exercise
        } else {
            toast("End of questions", {
                description: "You've reached the last question.",
            })
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
        if (remainingTime > 120) return "text-green-500" // More than 2 minutes
        if (remainingTime > 60) return "text-amber-500" // Between 1-2 minutes
        return "text-red-500" // Less than 1 minute
    }

    // Create transcript with input fields for blanks
    const renderTranscriptWithBlanks = () => {
        const parts = exercise.transcript.split(/\[(\d+)\]/)

        return (
            <div className="text-base leading-relaxed">
                {parts.map((part, index) => {
                    // Check if this part is a blank indicator (e.g., [1], [2], etc.)
                    if (/^\d+$/.test(part)) {
                        const blankIndex = Number.parseInt(part) - 1
                        return (
                            <span key={index} className="inline-block mx-1">
                                <Input
                                    ref={(el) => {
                                        inputRefs.current[blankIndex] = el;
                                    }}
                                    className={cn(
                                        "w-32 inline-block px-2 py-1 h-8 font-medium",
                                        hasSubmitted &&
                                        (answers[blankIndex]?.toLowerCase().trim() === exercise.blanks[blankIndex]?.answer?.toLowerCase()
                                            ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                            : "border-red-500 bg-red-50 dark:bg-red-900/20"),
                                    )}
                                    placeholder={`Blank ${part}`}
                                    value={showAnswers ? exercise.blanks[blankIndex].answer : answers[blankIndex]}
                                    onChange={(e) => handleAnswerChange(blankIndex, e.target.value)}
                                    disabled={showAnswers || hasSubmitted}
                                />
                                {hasSubmitted &&
                                    answers[blankIndex].toLowerCase().trim() !==
                                    exercise.blanks[blankIndex].answer.toLowerCase() && (
                                        <span className="text-xs text-red-500 block">
                                            Correct: {exercise.blanks[blankIndex].answer}
                                        </span>
                                    )}
                            </span>
                        )
                    }
                    // Otherwise, it's just text
                    return <span key={index}>{part}</span>
                })}
            </div>
        )
    }

    const difficultyColor = {
        Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }[exercise.difficulty]

    return (
        <div className="container mx-auto py-6 px-4 max-w-5xl">
            <AIChatSidebar
                section="Listening"
                questionType="Fill in the Blanks"
                instruction={`Listen to the audio and type the missing words in each blank. Correct answers: ${exercise.blanks.map(b => b.answer).join(", ")}`}
                passage={exercise.transcript.replace(/\[\d+\]/g, "_____")} // convert [1], [2], etc. to blanks
                userResponse={answers.join(", ")}
            />
            <Card className="shadow-lg border-t-4 border-t-blue-500 dark:border-t-blue-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Fill in the Blanks</h1>
                            <Badge variant="outline" className="ml-2">
                                {progress}/{totalQuestions}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="font-normal">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {exercise.category}
                            </Badge>
                            <Badge variant="secondary" className={cn("font-normal", difficultyColor)}>
                                <Info className="w-3 h-3 mr-1" />
                                {exercise.difficulty}
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
                                <TooltipContent>{isBookmarked ? "Remove bookmark" : "Bookmark this exercise"}</TooltipContent>
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
                                        Listen to the audio and fill in the missing words in each blank. You have 3 minutes to complete this
                                        task.
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
                                You will hear a recording. Type the missing words in each blank. You can play the audio as many times as
                                you need within the time limit.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">{exercise.title}</h2>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="exercise" className="flex items-center gap-1">
                                <Headphones className="h-4 w-4" />
                                <span className="hidden sm:inline">Exercise</span>
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

                        <TabsContent value="exercise" className="mt-0 space-y-4">
                            {/* <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col space-y-4">
                                    <audio
                                        ref={audioRef}
                                        src={exercise.audioUrl}
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

                            {/* iframe  */}
                            <iframe
                                src={exercise.audioUrl}
                                width="100%"
                                height="60"
                                allow="autoplay"
                                title={`Audio for ${exercise.title}`}
                                className="rounded-md border"
                            />

                            {/* Transcript with blanks */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                {renderTranscriptWithBlanks()}
                            </div>
                        </TabsContent>

                        <TabsContent value="tips" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <h3 className="font-medium text-lg mb-3">Listening Fill in the Blanks Tips</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Read the transcript before playing the audio to understand the context.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Pay attention to the words that come before and after each blank.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Listen for keywords, especially nouns, verbs, and adjectives.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Use the context to predict what type of word might fit in each blank.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span>Don't spend too much time on one blank; move on and come back to it later.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span>Be careful with spelling - even minor spelling errors will be marked incorrect.</span>
                                    </li>
                                </ul>

                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-100 dark:border-blue-800">
                                    <h4 className="font-medium flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                        <Lightbulb className="h-4 w-4" />
                                        Pro Tip
                                    </h4>
                                    <p className="text-sm mt-1 text-blue-700 dark:text-blue-300">
                                        Use the playback speed controls to slow down difficult sections. This can help you catch words that
                                        are spoken quickly or with unfamiliar accents.
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
                                                <span className="font-medium text-blue-600 dark:text-blue-300">JD</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">John Doe</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I found this exercise quite challenging. The speaker talks quite fast in the middle section. Does
                                            anyone have tips for catching fast speech?
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md ml-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <span className="font-medium text-green-600 dark:text-green-300">AS</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Alex Smith</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Try using the 0.75x playback speed for difficult sections. Also, focus on the context rather than
                                            trying to catch every word.
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
                        <Button variant="outline" size="sm" onClick={() => setShowAnswers(!showAnswers)} disabled={!hasSubmitted}>
                            <ListChecks className="h-4 w-4 mr-2" />
                            {showAnswers ? "Hide Answers" : "Show Answers"}
                        </Button>
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
                            // disabled={hasSubmitted || !hasStarted}
                            disabled={hasSubmitted}
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
