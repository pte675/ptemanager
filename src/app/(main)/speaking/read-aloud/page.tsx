"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import {
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Upload,
    Play,
    Pause,
    Square,
    Clock,
    BookOpen,
    HelpCircle,
    Bookmark,
    BookmarkCheck,
    Info,
    Volume2,
    Eye,
    Lightbulb,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    FileText,
    Zap,
    BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestions from "./read-aloud.json"


export default function ReadAloudInterface() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const currentTask = rawQuestions[currentIndex]
    const SAMPLE_TASK = {
        id: currentTask.id,
        title: `Read Aloud #${currentTask.id}`,
        text: currentTask.question as string, // 👈 this line ensures correct typing
        preparationTime: 40,
        readingTime: 40,
        difficulty: "Medium",
        category: "General",
        wordCount: (currentTask.question as string).trim().split(/\s+/).length,
        estimatedReadingTime: Math.round((currentTask.question as string).trim().split(/\s+/).length / 2),
        tips: [
            "Read the text silently first to understand the content",
            "Pay attention to punctuation for natural pauses",
            "Speak at a natural, conversational pace",
            "Pronounce each word clearly and distinctly",
            "Use appropriate intonation and stress",
            "Don't rush - clarity is more important than speed",
        ],
        keyWords: [] as string[], // 👈 make sure keyWords is typed
    }

    const [phase, setPhase] = useState<"preparation" | "countdown" | "recording" | "completed">("preparation")
    const [preparationTime, setPreparationTime] = useState(SAMPLE_TASK.preparationTime)
    const [readingTime, setReadingTime] = useState(SAMPLE_TASK.readingTime)
    const [countdownValue, setCountdownValue] = useState(3)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isPlayingRecording, setIsPlayingRecording] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(2)
    const [totalQuestions, setTotalQuestions] = useState(600)
    const [activeTab, setActiveTab] = useState("task")
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [microphonePermission, setMicrophonePermission] = useState<"granted" | "denied" | "prompt">("prompt")
    const [fontSize, setFontSize] = useState(16)
    const [highlightedWords, setHighlightedWords] = useState<Set<string>>(new Set())
    const [showKeyWords, setShowKeyWords] = useState(false)
    const [readingSpeed, setReadingSpeed] = useState(0) // words per minute

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const audioRef = useRef<HTMLAudioElement>(null)
    const textRef = useRef<HTMLDivElement>(null)

    // Request microphone permission
    useEffect(() => {
        const requestMicrophonePermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                setMicrophonePermission("granted")
                stream.getTracks().forEach((track) => track.stop()) // Stop the stream immediately
            } catch (error) {
                setMicrophonePermission("denied")
                toast.error(
                    <div>
                        <p className="font-semibold">Microphone Access Required</p>
                        <p className="text-sm text-red-500">
                            Please allow microphone access to complete this speaking task.
                        </p>
                    </div>
                )
            }
        }

        requestMicrophonePermission()
    }, [toast])

    // Preparation timer
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (phase === "preparation" && preparationTime > 0) {
            timer = setInterval(() => {
                setPreparationTime((prev) => prev - 1)
            }, 1000)
        } else if (phase === "preparation" && preparationTime === 0) {
            setPhase("countdown")
            setCountdownValue(3)
        }

        return () => clearInterval(timer)
    }, [phase, preparationTime])

    // Countdown timer
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (phase === "countdown" && countdownValue > 0) {
            timer = setInterval(() => {
                setCountdownValue((prev) => prev - 1)
            }, 1000)
        } else if (phase === "countdown" && countdownValue === 0) {
            startRecording()
        }

        return () => clearInterval(timer)
    }, [phase, countdownValue])

    // Reading timer
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (phase === "recording" && readingTime > 0) {
            timer = setInterval(() => {
                setReadingTime((prev) => prev - 1)
            }, 1000)
        } else if (phase === "recording" && readingTime === 0) {
            stopRecording()
        }

        return () => clearInterval(timer)
    }, [phase, readingTime])

    // Calculate reading speed
    useEffect(() => {
        if (phase === "recording") {
            const timeElapsed = SAMPLE_TASK.readingTime - readingTime
            if (timeElapsed > 0) {
                const wordsPerMinute = Math.round((SAMPLE_TASK.wordCount / timeElapsed) * 60)
                setReadingSpeed(wordsPerMinute)
            }
        }
    }, [phase, readingTime])

    // Format time as MM:SS
    const formatTime = (timeInSeconds: number) => {
        const minutes = Math.floor(timeInSeconds / 60)
        const seconds = Math.floor(timeInSeconds % 60)
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    // Start preparation phase
    const startPreparation = () => {
        setPhase("preparation")
        setPreparationTime(SAMPLE_TASK.preparationTime)
    }

    // Skip countdown
    const skipCountdown = () => {
        setCountdownValue(0)
    }

    // Start recording
    const startRecording = async () => {
        if (microphonePermission !== "granted") {
            toast.error(
                <div>
                    <p className="font-semibold">Microphone Access Required</p>
                    <p className="text-sm text-red-500">
                        Please allow microphone access to complete this speaking task.
                    </p>
                </div>
            )
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mediaRecorder = new MediaRecorder(stream)
            mediaRecorderRef.current = mediaRecorder
            audioChunksRef.current = []

            mediaRecorder.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
                setRecordedAudio(audioBlob)
                setAudioUrl(URL.createObjectURL(audioBlob))
                stream.getTracks().forEach((track) => track.stop())
                setPhase("completed")
            }

            mediaRecorder.start()
            setIsRecording(true)
            setPhase("recording")

            toast(
                <div>
                    <p className="font-semibold">Recording Started</p>
                    <p className="text-sm text-muted-foreground">
                        You have {SAMPLE_TASK.readingTime} seconds to read the text aloud.
                    </p>
                </div>
            )
        } catch (error) {
            toast.error(
                <div>
                    <p className="font-semibold">Recording Error</p>
                    <p className="text-sm text-red-500">
                        Failed to start recording. Please check your microphone.
                    </p>
                </div>
            )
        }
    }

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    // Play/pause recorded audio
    const togglePlayRecording = () => {
        if (audioRef.current) {
            if (isPlayingRecording) {
                audioRef.current.pause()
            } else {
                audioRef.current.play()
            }
            setIsPlayingRecording(!isPlayingRecording)
        }
    }

    // Handle form submission
    const handleSubmit = () => {
        if (!recordedAudio) {
            toast.error("No recording found", {
                description: "Please complete the recording before submitting.",
            })
            return
        }

        setHasSubmitted(true)

        // toast({
        //     title: "Response Submitted",
        //     description: "Your reading has been submitted successfully.",
        //     variant: "default",
        // })
    }

    // Reset exercise
    const resetExercise = () => {
        setPhase("preparation")
        setPreparationTime(SAMPLE_TASK.preparationTime)
        setReadingTime(SAMPLE_TASK.readingTime)
        setCountdownValue(3)
        setIsRecording(false)
        setRecordedAudio(null)
        setAudioUrl(null)
        setIsPlayingRecording(false)
        setHasSubmitted(false)
        setReadingSpeed(0)
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
    }

    // Toggle bookmark
    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked)
        toast(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks", {
            description: `Task #${SAMPLE_TASK.id} has been ${isBookmarked ? "removed from" : "added to"} your bookmarks.`,
        })
    }

    // Navigate to previous question
    const handlePrevious = () => {
        // toast({
        //     title: "Navigation",
        //     description: "Previous question would be loaded here.",
        //     variant: "default",
        // })
        if (currentIndex > 0) {
            setCurrentIndex((prev) => prev - 1)
            resetExercise()
        }
        setProgress((prev) => Math.max(prev - 1, 1))
    }

    // Navigate to next question
    const handleNext = () => {
        // toast({
        //     title: "Navigation",
        //     description: "Next question would be loaded here.",
        //     variant: "default",
        // })
        if (currentIndex < rawQuestions.length - 1) {
            setCurrentIndex((prev) => prev + 1)
            resetExercise()
        }
        setProgress((prev) => Math.min(prev + 1, totalQuestions))
    }

    // Toggle word highlighting
    const toggleWordHighlight = (word: string) => {
        setHighlightedWords((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(word)) {
                newSet.delete(word)
            } else {
                newSet.add(word)
            }
            return newSet
        })
    }

    // Get phase color
    const getPhaseColor = () => {
        switch (phase) {
            case "preparation":
                return "text-blue-500"
            case "countdown":
                return "text-amber-500"
            case "recording":
                return "text-red-500"
            case "completed":
                return "text-green-500"
            default:
                return "text-slate-500"
        }
    }

    // Get phase text
    const getPhaseText = () => {
        switch (phase) {
            case "preparation":
                return "Preparation Time"
            case "countdown":
                return "Starting Soon"
            case "recording":
                return "Recording"
            case "completed":
                return "Completed"
            default:
                return "Ready"
        }
    }

    // Render text with highlighting
    const renderTextWithHighlighting = () => {
        const words = SAMPLE_TASK.text.split(/(\s+|[.,;:!?])/)
        return words.map((word, index) => {
            const cleanWord = word.toLowerCase().replace(/[.,;:!?]/g, "")
            const isKeyWord = SAMPLE_TASK.keyWords.some((kw) => kw.toLowerCase().includes(cleanWord) && cleanWord.length > 2)
            const isHighlighted = highlightedWords.has(cleanWord)

            return (
                <span
                    key={index}
                    className={cn(
                        "transition-colors duration-200",
                        isKeyWord && showKeyWords && "bg-yellow-100 dark:bg-yellow-900/30",
                        isHighlighted && "bg-blue-100 dark:bg-blue-900/30",
                        word.trim() && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800",
                    )}
                    onClick={() => word.trim() && toggleWordHighlight(cleanWord)}
                >
                    {word}
                </span>
            )
        })
    }

    const difficultyColor = {
        Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }[SAMPLE_TASK.difficulty]

    return (
        <div className="container mx-auto py-6 px-4 max-w-5xl">
            <Card className="shadow-lg border-t-4 border-t-blue-500 dark:border-t-blue-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Read Aloud</h1>
                            <Badge variant="outline" className="ml-2">
                                {progress}/{totalQuestions}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="font-normal">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {SAMPLE_TASK.category}
                            </Badge>
                            <Badge variant="secondary" className={cn("font-normal", difficultyColor)}>
                                <Info className="w-3 h-3 mr-1" />
                                {SAMPLE_TASK.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="font-normal">
                                <FileText className="w-3 h-3 mr-1" />
                                {SAMPLE_TASK.wordCount} words
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn("flex items-center gap-1 font-mono font-medium", getPhaseColor())}>
                            <Clock className="h-4 w-4" />
                            {phase === "preparation" && formatTime(preparationTime)}
                            {phase === "countdown" && `${countdownValue}s`}
                            {phase === "recording" && formatTime(readingTime)}
                            {phase === "completed" && "Done"}
                        </div>

                        <Badge variant="outline" className={getPhaseColor()}>
                            {getPhaseText()}
                        </Badge>

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
                                <TooltipContent>{isBookmarked ? "Remove bookmark" : "Bookmark this task"}</TooltipContent>
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
                                        You have {SAMPLE_TASK.preparationTime} seconds to read the text silently, then{" "}
                                        {SAMPLE_TASK.readingTime} seconds to read it aloud clearly and naturally.
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
                                Look at the text below. In {SAMPLE_TASK.preparationTime} seconds, you must read this text aloud as
                                naturally and as clearly as possible. You have {SAMPLE_TASK.readingTime} seconds to read aloud.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">{SAMPLE_TASK.title}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">Font size:</span>
                                    <Slider
                                        value={[fontSize]}
                                        min={12}
                                        max={24}
                                        step={1}
                                        onValueChange={(value) => setFontSize(value[0])}
                                        className="w-20"
                                    />
                                    <span className="text-sm text-slate-500 w-8">{fontSize}px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="task" className="flex items-center gap-1">
                                <FileText className="h-4 w-4" />
                                <span className="hidden sm:inline">Task</span>
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

                        <TabsContent value="task" className="mt-0 space-y-4">
                            {/* Countdown overlay */}
                            {phase === "countdown" && (
                                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-lg text-center">
                                        <h3 className="text-2xl font-bold mb-4">Get Ready to Read!</h3>
                                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6">{countdownValue}</div>
                                        <Button onClick={skipCountdown}>Skip</Button>
                                    </div>
                                </div>
                            )}

                            {/* Text display */}
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-medium">{SAMPLE_TASK.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowKeyWords(!showKeyWords)}
                                            className="text-xs"
                                        >
                                            <Zap className="h-3 w-3 mr-1" />
                                            {showKeyWords ? "Hide" : "Show"} Key Words
                                        </Button>
                                    </div>
                                </div>

                                <div
                                    ref={textRef}
                                    className="leading-relaxed text-justify select-text"
                                    style={{ fontSize: `${fontSize}px`, lineHeight: 1.6 }}
                                >
                                    {renderTextWithHighlighting()}
                                </div>

                                <div className="mt-4 flex justify-between items-center text-xs text-slate-500">
                                    <span>{SAMPLE_TASK.wordCount} words</span>
                                    <span>Est. reading time: {SAMPLE_TASK.estimatedReadingTime}s</span>
                                </div>
                            </div>

                            {/* Recording controls */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col items-center space-y-4">
                                    {phase === "preparation" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Eye className="h-5 w-5 text-blue-500" />
                                                <span className="font-medium">Read the text silently</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Use this time to understand the content and practice pronunciation
                                            </p>
                                            <Progress
                                                value={((SAMPLE_TASK.preparationTime - preparationTime) / SAMPLE_TASK.preparationTime) * 100}
                                                className="w-64 mt-3"
                                            // indicatorClassName="bg-blue-500"
                                            />
                                        </div>
                                    )}

                                    {phase === "recording" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="font-medium text-red-600 dark:text-red-400">Recording in progress</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Read the text aloud clearly and naturally. Speak at a comfortable pace.
                                            </p>
                                            <Progress
                                                value={((SAMPLE_TASK.readingTime - readingTime) / SAMPLE_TASK.readingTime) * 100}
                                                className="w-64 mt-3"
                                            // indicatorClassName="bg-red-500"
                                            />
                                            <div className="flex items-center justify-center gap-4 mt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={stopRecording}
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                >
                                                    <Square className="h-4 w-4 mr-2" />
                                                    Stop Early
                                                </Button>
                                                {readingSpeed > 0 && (
                                                    <div className="flex items-center gap-1 text-sm text-slate-500">
                                                        <BarChart3 className="h-4 w-4" />
                                                        {readingSpeed} WPM
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {phase === "completed" && recordedAudio && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                <span className="font-medium text-green-600 dark:text-green-400">Reading completed</span>
                                            </div>

                                            <audio ref={audioRef} src={audioUrl || undefined} onEnded={() => setIsPlayingRecording(false)} />

                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={togglePlayRecording}
                                                    className="flex items-center gap-2"
                                                >
                                                    {isPlayingRecording ? (
                                                        <>
                                                            <Pause className="h-4 w-4" />
                                                            Pause
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="h-4 w-4" />
                                                            Play Recording
                                                        </>
                                                    )}
                                                </Button>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button variant="outline" size="icon">
                                                                <Volume2 className="h-4 w-4" />
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>Adjust your system volume to hear the playback</TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>

                                            <p className="text-xs text-slate-500 mt-2">
                                                Review your recording before submitting your response
                                            </p>
                                        </div>
                                    )}

                                    {microphonePermission === "denied" && (
                                        <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
                                            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                                                Microphone access is required for this task
                                            </p>
                                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                Please enable microphone permissions in your browser settings
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tips" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <h3 className="font-medium text-lg mb-3">Read Aloud Tips</h3>
                                <ul className="space-y-3">
                                    {SAMPLE_TASK.tips.map((tip, index) => (
                                        <li key={index} className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-100 dark:border-blue-800">
                                    <h4 className="font-medium flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                        <Lightbulb className="h-4 w-4" />
                                        Pro Tip
                                    </h4>
                                    <p className="text-sm mt-1 text-blue-700 dark:text-blue-300">
                                        During preparation time, identify difficult words and practice their pronunciation silently. Pay
                                        special attention to word stress and sentence rhythm. Remember, natural delivery is more important
                                        than perfect pronunciation.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Key Words in This Text:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {SAMPLE_TASK.keyWords.map((word, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {word}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="discussion" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-lg">Discussion</h3>
                                    <Badge variant="outline">4 comments</Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                                <span className="font-medium text-blue-600 dark:text-blue-300">LM</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Lisa Martinez</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">6 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I struggle with the word "pathogens" - any tips for pronunciation? I keep stumbling over it during
                                            practice.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md ml-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <span className="font-medium text-green-600 dark:text-green-300">DW</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Dr. Wilson</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3 text-blue-500" />
                                                    <span>Instructor</span> • 5 days ago
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Break it down: PATH-o-gens. The stress is on the first syllable. Practice saying "path" + "oh" +
                                            "jens" slowly, then speed up gradually.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                                <span className="font-medium text-purple-600 dark:text-purple-300">RC</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Robert Chen</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">4 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I find it helpful to read the text multiple times during preparation, focusing on different
                                            aspects each time - first for meaning, then for difficult words, then for rhythm and flow.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                                                <span className="font-medium text-amber-600 dark:text-amber-300">EP</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Emma Parker</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Great advice! I also practice reading aloud at home with similar texts. The more you practice
                                            natural reading rhythm, the easier it becomes during the actual test.
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
                        {phase === "preparation" && (
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Read the text silently and prepare for recording
                            </div>
                        )}
                        {phase === "completed" && recordedAudio && (
                            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                                <CheckCircle2 className="h-4 w-4" />
                                Recording ready for submission
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
                            className="bg-blue-600 hover:bg-blue-700"
                            disabled={hasSubmitted || phase !== "completed" || !recordedAudio}
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
