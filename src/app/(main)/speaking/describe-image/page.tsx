"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import {
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    Upload,
    Mic,
    Play,
    Pause,
    Square,
    Clock,
    BookOpen,
    HelpCircle,
    Bookmark,
    BookmarkCheck,
    Info,
    ImageIcon,
    Volume2,
    Eye,
    Lightbulb,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    Maximize2,
    Minimize2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestions from "./describe-image.json"

const DEFAULT_TIMINGS = {
    preparationTime: 25,
    responseTime: 40,
}

export default function DescribeImageInterface() {
    const [questionIndex, setQuestionIndex] = useState(0)
    const question = rawQuestions[questionIndex]

    const SAMPLE_TASK = {
        id: question.id,
        title: question.title,
        imageUrl: question.photo,
        imageDescription: question.answer,
        preparationTime: DEFAULT_TIMINGS.preparationTime,
        responseTime: DEFAULT_TIMINGS.responseTime,
        difficulty: "Medium",
        category: "Data Analysis",
        tips: [
            "Start with an overview of what the image shows",
            "Mention what is being measured or presented",
            "Describe the main elements or steps",
            "Use chronological or spatial order",
            "Highlight any comparisons or extremes",
            "Conclude with the overall purpose or insight",
        ],
    }

    const [phase, setPhase] = useState<"preparation" | "countdown" | "recording" | "completed">("preparation")
    const [preparationTime, setPreparationTime] = useState(SAMPLE_TASK.preparationTime)
    const [responseTime, setResponseTime] = useState(SAMPLE_TASK.responseTime)
    const [countdownValue, setCountdownValue] = useState(3)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isPlayingRecording, setIsPlayingRecording] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(2)
    const [totalQuestions, setTotalQuestions] = useState(358)
    const [activeTab, setActiveTab] = useState("task")
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [isImageExpanded, setIsImageExpanded] = useState(false)
    const [microphonePermission, setMicrophonePermission] = useState<"granted" | "denied" | "prompt">("prompt")

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const audioRef = useRef<HTMLAudioElement>(null)

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
                        <p className="text-sm text-muted-foreground">
                            Please allow microphone access to complete this speaking task.
                        </p>
                    </div>
                )
            }
        }

        requestMicrophonePermission()
    }, [])

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

    // Response timer
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (phase === "recording" && responseTime > 0) {
            timer = setInterval(() => {
                setResponseTime((prev) => prev - 1)
            }, 1000)
        } else if (phase === "recording" && responseTime === 0) {
            stopRecording()
        }

        return () => clearInterval(timer)
    }, [phase, responseTime])

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
                    <p className="text-sm text-muted-foreground">
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
                        You have {SAMPLE_TASK.responseTime} seconds to describe the image.
                    </p>
                </div>
            )
        } catch (error) {
            toast(
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

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    }

    // Handle form submission
    const handleSubmit = () => {
        if (!recordedAudio) {
            toast(
                <div>
                    <p className="font-semibold">No recording found</p>
                    <p className="text-sm text-red-500">
                        Please complete the recording before submitting.
                    </p>
                </div>
            )
            return
        }

        setHasSubmitted(true)

        toast(
            <div>
                <p className="font-semibold">Response Submitted</p>
                <p className="text-sm text-muted-foreground">
                    Your speaking response has been submitted successfully.
                </p>
            </div>
        )
    }

    // Reset exercise
    const resetExercise = () => {
        setPhase("preparation")
        setPreparationTime(SAMPLE_TASK.preparationTime)
        setResponseTime(SAMPLE_TASK.responseTime)
        setCountdownValue(3)
        setIsRecording(false)
        setRecordedAudio(null)
        setAudioUrl(null)
        setIsPlayingRecording(false)
        setHasSubmitted(false)
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
    }

    // Toggle bookmark
    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked)
        toast(
            <div>
                <p className="font-semibold">
                    {isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"}
                </p>
                <p className="text-sm text-muted-foreground">
                    Task #{SAMPLE_TASK.id} has been {isBookmarked ? "removed from" : "added to"} your bookmarks.
                </p>
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
        setQuestionIndex((prev) => prev - 1)
        resetExercise()
        setProgress((prev) => Math.max(prev - 1, 1))
    }

    // Navigate to next question
    const handleNext = () => {
        // toast({
        //     title: "Navigation",
        //     description: "Next question would be loaded here.",
        //     variant: "default",
        // })
        setQuestionIndex((prev) => prev + 1)
        resetExercise()
        setProgress((prev) => Math.min(prev + 1, totalQuestions))
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

    const difficultyColor = {
        Easy: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
        Hard: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }[SAMPLE_TASK.difficulty]

    return (
        <div className="container mx-auto py-6 px-4 max-w-6xl">
            <Card className="shadow-lg border-t-4 border-t-emerald-500 dark:border-t-emerald-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Describe Image</h1>
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
                                <Mic className="w-3 h-3 mr-1" />
                                Speaking
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn("flex items-center gap-1 font-mono font-medium", getPhaseColor())}>
                            <Clock className="h-4 w-4" />
                            {phase === "preparation" && formatTime(preparationTime)}
                            {phase === "countdown" && `${countdownValue}s`}
                            {phase === "recording" && formatTime(responseTime)}
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
                                        You have {SAMPLE_TASK.preparationTime} seconds to study the image, then {SAMPLE_TASK.responseTime}{" "}
                                        seconds to describe it in detail.
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
                                Look at the image below. In {SAMPLE_TASK.preparationTime} seconds, please speak into the microphone and
                                describe in detail what the image is showing. You will have {SAMPLE_TASK.responseTime} seconds to give
                                your response.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">{SAMPLE_TASK.title}</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsImageExpanded(!isImageExpanded)}
                                    className="flex items-center gap-1"
                                >
                                    {isImageExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                                    {isImageExpanded ? "Minimize" : "Expand"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="task" className="flex items-center gap-1">
                                <ImageIcon className="h-4 w-4" />
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
                                        <h3 className="text-2xl font-bold mb-4">Get Ready to Speak!</h3>
                                        <div className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 mb-6">
                                            {countdownValue}
                                        </div>
                                        <Button onClick={skipCountdown}>Skip</Button>
                                    </div>
                                </div>
                            )}

                            {/* Image placeholder */}
                            <div
                                className={cn(
                                    "bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center",
                                    isImageExpanded ? "h-[800px]" : "h-[550px]",
                                )}
                            >
                                {/* <div className="text-center p-8">
                                    <ImageIcon className="h-16 w-16 mx-auto text-slate-400 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">Image Placeholder</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">{SAMPLE_TASK.imageDescription}</p>
                                    <p className="text-xs text-slate-400 mt-4">
                                        In a real implementation, the actual image would be displayed here
                                    </p>
                                </div> */}
                                <iframe
                                    src={`https://drive.google.com/file/d/${SAMPLE_TASK.imageUrl.split("id=")[1]}/preview`}
                                    allow="autoplay"
                                    className="w-full h-full rounded-lg"
                                />
                            </div>

                            {/* Recording controls */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col items-center space-y-4">
                                    {phase === "preparation" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Eye className="h-5 w-5 text-blue-500" />
                                                <span className="font-medium">Study the image carefully</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Use this time to analyze the image and plan your description
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
                                                Describe the image in detail. Speak clearly into your microphone.
                                            </p>
                                            <Progress
                                                value={((SAMPLE_TASK.responseTime - responseTime) / SAMPLE_TASK.responseTime) * 100}
                                                className="w-64 mt-3"
                                            // indicatorClassName="bg-red-500"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={stopRecording}
                                                className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                                <Square className="h-4 w-4 mr-2" />
                                                Stop Early
                                            </Button>
                                        </div>
                                    )}

                                    {phase === "completed" && recordedAudio && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                <span className="font-medium text-green-600 dark:text-green-400">Recording completed</span>
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
                                <h3 className="font-medium text-lg mb-3">Image Description Tips</h3>
                                <ul className="space-y-3">
                                    {SAMPLE_TASK.tips.map((tip, index) => (
                                        <li key={index} className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-md border border-emerald-100 dark:border-emerald-800">
                                    <h4 className="font-medium flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                                        <Lightbulb className="h-4 w-4" />
                                        Pro Tip
                                    </h4>
                                    <p className="text-sm mt-1 text-emerald-700 dark:text-emerald-300">
                                        Structure your response: Start with what the image shows overall, then describe specific details,
                                        trends, or patterns. End with any significant conclusions or implications you can draw from the
                                        data.
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
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800 flex items-center justify-center">
                                                <span className="font-medium text-emerald-600 dark:text-emerald-300">SK</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Sarah Kim</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">5 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            For graph descriptions, I find it helpful to mention the axes first, then describe the overall
                                            trend before getting into specific details. Anyone else have good strategies?
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md ml-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                                <span className="font-medium text-blue-600 dark:text-blue-300">MJ</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Mike Johnson</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">4 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Great tip! I also try to use comparative language when there are multiple data series. Words like
                                            "in contrast," "similarly," and "whereas" help make the description flow better.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                                <span className="font-medium text-purple-600 dark:text-purple-300">AL</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Anna Lee</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">3 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Don't forget to practice speaking at a steady pace! I used to rush through descriptions and miss
                                            important details. Taking your time and speaking clearly is just as important as the content.
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
                                Study the image carefully during preparation time
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
                            className="bg-emerald-600 hover:bg-emerald-700"
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
