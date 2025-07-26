"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import rawQuestions from "./multiple-mcq.json"
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar"

export default function MultipleChoiceInterface() {
    const [questionIndex, setQuestionIndex] = useState(0)

    const currentRaw = rawQuestions[questionIndex]

    // Extract correct letters like ["C", "D"]
    const correctLetters = currentRaw.answer
        .split("Answer:")[1]
        .split("###")[0]
        .replace(/\s+/g, "")
        .split(",")

    const SAMPLE_QUESTION = {
        id: currentRaw.id,
        title: currentRaw.title,
        question: currentRaw.question.split("###")[1].trim(),
        options: currentRaw.question
            .split("###")
            .slice(2)
            .map((optionText, i) => {
                const letter = String.fromCharCode(65 + i) // "A", "B", "C", ...
                return {
                    id: letter.toLowerCase(),
                    text: optionText.trim().slice(3).trim(), // Remove "A) ", "B) ", etc.
                    isCorrect: correctLetters.includes(letter),
                }
            }),

        audioUrl: currentRaw.audio.includes("uc?id=")
            ? currentRaw.audio.replace(
                /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
                "https://drive.google.com/file/d/$1/preview"
            )
            : currentRaw.audio,
        transcript: currentRaw.answer.split("###Transcript:")[1].trim(),
        difficulty: "Medium",
        category: "General",
        duration: 65,
    }

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(SAMPLE_QUESTION.duration)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [selectedOptions, setSelectedOptions] = useState<string[]>([])
    const [showAnswers, setShowAnswers] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(2)
    const [totalQuestions, setTotalQuestions] = useState(65)
    const [activeTab, setActiveTab] = useState("question")
    const [countdownValue, setCountdownValue] = useState(3)
    const [isCountingDown, setIsCountingDown] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [remainingTime, setRemainingTime] = useState(0)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [showTranscript, setShowTranscript] = useState(false)

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
        setRemainingTime(120) // 2 minutes for the exercise
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

    // Handle checkbox change
    const handleCheckboxChange = (optionId: string) => {
        setSelectedOptions((prev) => {
            if (prev.includes(optionId)) {
                return prev.filter((id) => id !== optionId)
            } else {
                return [...prev, optionId]
            }
        })
    }

    // Handle form submission
    const handleSubmit = () => {
        setHasSubmitted(true)
        setIsTimerRunning(false)

        // Calculate score
        const correctAnswers = SAMPLE_QUESTION.options.filter((option) => option.isCorrect).map((option) => option.id)
        const userCorrectCount = selectedOptions.filter((id) => correctAnswers.includes(id)).length
        const userIncorrectCount = selectedOptions.filter((id) => !correctAnswers.includes(id)).length
        const missedCorrectCount = correctAnswers.filter((id) => !selectedOptions.includes(id)).length

        // Calculate score (partial credit)
        const totalCorrectOptions = correctAnswers.length
        const score = Math.max(0, Math.round(((userCorrectCount - userIncorrectCount) / totalCorrectOptions) * 100))

        toast(
            <div>
                <strong>Answers Submitted</strong>
                <div>Your score: {score}%. You selected {userCorrectCount} correct and {userIncorrectCount} incorrect options.</div>
            </div>
        )

        // Update progress in localStorage
        const prevProgress = JSON.parse(localStorage.getItem("progress") || "{}")

        const prevData = prevProgress?.listening?.["multiple-mcq"] || {
            completed: 0,
            accuracy: null,
            streak: 0,
        }

        const isCurrentFullyCorrect = userCorrectCount === correctAnswers.length && userIncorrectCount === 0
        const isNewQuestion = SAMPLE_QUESTION.id > prevData.completed
        const newCompleted = isNewQuestion ? SAMPLE_QUESTION.id : prevData.completed
        const newStreak = isCurrentFullyCorrect ? prevData.streak + 1 : 0
        const newAccuracy = isNewQuestion
            ? prevData.accuracy === null
                ? (isCurrentFullyCorrect ? 1 : 0)
                : ((prevData.accuracy * prevData.completed) + (isCurrentFullyCorrect ? 1 : 0)) / newCompleted
            : prevData.accuracy

        const updatedProgress = {
            ...prevProgress,
            listening: {
                ...prevProgress.listening,
                "multiple-mcq": {
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
        setSelectedOptions([])
        setShowAnswers(false)
        setHasSubmitted(false)
        setHasStarted(false)
        setIsTimerRunning(false)
        setRemainingTime(120)
        setShowTranscript(false)
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
            `Question #${SAMPLE_QUESTION.id} has been ${isBookmarked ? "removed from" : "added to"} your bookmarks.`
        )
    }

    // Navigate to previous question
    const handlePrevious = () => {
        // toast("Previous question would be loaded here.")
        setQuestionIndex((prev) => Math.max(prev - 1, 0))
        resetExercise()
        setProgress((prev) => Math.max(prev - 1, 1))
    }

    // Navigate to next question
    const handleNext = () => {
        // toast("Next question would be loaded here.")
        setQuestionIndex((prev) => Math.min(prev + 1, rawQuestions.length - 1))
        resetExercise()
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

    // Check if an option is correct
    const isOptionCorrect = (optionId: string) => {
        return SAMPLE_QUESTION.options.find((option) => option.id === optionId)?.isCorrect
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
                questionType="Multiple Choice Multiple Answer"
                instruction={`Select all correct answers. Correct answers: ${SAMPLE_QUESTION.options
                    .filter(o => o.isCorrect)
                    .map(o => `${o.id}) ${o.text}`)
                    .join(", ")}`}
                passage={SAMPLE_QUESTION.transcript}
                userResponse={selectedOptions.map(id => `${id}) ${SAMPLE_QUESTION.options.find(o => o.id === id)?.text}`).join(", ")}
            />
            <Card className="shadow-lg border-t-4 border-t-indigo-500 dark:border-t-indigo-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Multiple Choice Question</h1>
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
                                Multiple Answers
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
                                    <p>Listen to the audio and select all correct answers. You have 2 minutes to complete this task.</p>
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
                                Listen to the recording and answer the question by selecting all the correct responses. You will need to
                                select more than one response.
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
                                        <div className="text-5xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">{countdownValue}</div>
                                        <Button onClick={skipCountdown}>Skip</Button>
                                    </div>
                                </div>
                            )}

                            {/* Audio Player */}
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

                                <div className="space-y-3">
                                    {SAMPLE_QUESTION.options.map((option) => (
                                        <div
                                            key={option.id}
                                            className={cn(
                                                "flex items-start space-x-3 p-3 rounded-md",
                                                hasSubmitted &&
                                                (option.isCorrect
                                                    ? "bg-green-50 dark:bg-green-900/20"
                                                    : selectedOptions.includes(option.id)
                                                        ? "bg-red-50 dark:bg-red-900/20"
                                                        : ""),
                                            )}
                                        >
                                            <Checkbox
                                                id={option.id}
                                                checked={selectedOptions.includes(option.id)}
                                                onCheckedChange={() => handleCheckboxChange(option.id)}
                                                // disabled={hasSubmitted || !hasStarted}
                                                disabled={hasSubmitted}
                                                className={cn(
                                                    hasSubmitted &&
                                                    (option.isCorrect
                                                        ? "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                                                        : selectedOptions.includes(option.id)
                                                            ? "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white"
                                                            : ""),
                                                )}
                                            />
                                            <div className="space-y-1 leading-none">
                                                <label
                                                    htmlFor={option.id}
                                                    className={cn(
                                                        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                                                        hasSubmitted &&
                                                        (option.isCorrect
                                                            ? "text-green-700 dark:text-green-300"
                                                            : selectedOptions.includes(option.id)
                                                                ? "text-red-700 dark:text-red-300"
                                                                : ""),
                                                    )}
                                                >
                                                    {option.id}) {option.text}
                                                </label>
                                                {hasSubmitted && option.isCorrect && (
                                                    <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                                                        <CheckCircle2 className="h-3 w-3" /> Correct answer
                                                    </p>
                                                )}
                                                {hasSubmitted && !option.isCorrect && selectedOptions.includes(option.id) && (
                                                    <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1 mt-1">
                                                        <AlertCircle className="h-3 w-3" /> Incorrect answer
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {hasSubmitted && (
                                    <div className="mt-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowTranscript(!showTranscript)}
                                            className="text-indigo-600 dark:text-indigo-400"
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
                                <h3 className="font-medium text-lg mb-3">Multiple Choice Tips</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Listen carefully to the entire recording before making your final selections.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Pay attention to qualifying words like "most important," "primarily," or "mainly" in the question.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Remember that multiple answers are required - typically 2-3 options will be correct.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Look for keywords and phrases in the options that match or paraphrase what you hear.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Be careful with options that contain partially correct information but are ultimately incorrect.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Don't select an option just because you hear the exact words in the recording - context matters.
                                        </span>
                                    </li>
                                </ul>

                                <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md border border-indigo-100 dark:border-indigo-800">
                                    <h4 className="font-medium flex items-center gap-1 text-indigo-700 dark:text-indigo-300">
                                        <Lightbulb className="h-4 w-4" />
                                        Pro Tip
                                    </h4>
                                    <p className="text-sm mt-1 text-indigo-700 dark:text-indigo-300">
                                        Take quick notes while listening to help you remember key points. For this question type, it's often
                                        helpful to mark options as "definitely yes," "definitely no," or "maybe" during your first listen,
                                        then review the "maybe" options during a second listen.
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
                                                <span className="font-medium text-indigo-600 dark:text-indigo-300">MK</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Maria Kim</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">3 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I was confused between options A and B. The speaker mentions aesthetics but says it's not the most
                                            important factor, right?
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md ml-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <span className="font-medium text-green-600 dark:text-green-300">JT</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">James Taylor</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Yes, exactly! The speaker mentions that "many people focus on aesthetics" but then says "I believe
                                            the most important qualities are more practical." So A and B are mentioned but not as important
                                            qualities.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                                <span className="font-medium text-purple-600 dark:text-purple-300">RL</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Ryan Lee</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            This question tests your ability to identify the speaker's main points versus what they mention
                                            but don't endorse. The three key qualities they emphasize are integration with surroundings (C),
                                            durability (D), and functionality (E).
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
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">
                                    Selected: {selectedOptions.length} of {SAMPLE_QUESTION.options.filter((o) => o.isCorrect).length}{" "}
                                    required
                                </span>
                                <Progress
                                    value={
                                        (selectedOptions.filter((id) => isOptionCorrect(id)).length /
                                            SAMPLE_QUESTION.options.filter((o) => o.isCorrect).length) *
                                        100
                                    }
                                    className="w-24 h-2"
                                // indicatorClassName={
                                //     selectedOptions.filter((id) => isOptionCorrect(id)).length ===
                                //         SAMPLE_QUESTION.options.filter((o) => o.isCorrect).length
                                //         ? "bg-green-500"
                                //         : "bg-amber-500"
                                // }
                                />
                            </div>
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
                            className="bg-indigo-600 hover:bg-indigo-700"
                            disabled={hasSubmitted || selectedOptions.length === 0}
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
