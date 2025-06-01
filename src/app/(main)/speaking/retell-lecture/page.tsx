"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
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
    Volume1,
    VolumeX,
    Headphones,
    Lightbulb,
    MessageSquare,
    CheckCircle2,
    AlertCircle,
    FileText,
    PenTool,
    EyeOff,
    Repeat,
    SkipBack,
    SkipForward,
    Brain,
    Target,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestions from "./retell-lecture-120.json"


const TEST_PROVIDERS = [
    { value: "mypte", label: "MYPTE" },
    { value: "pte-official", label: "PTE Official" },
    { value: "practice", label: "Practice Mode" },
]

export default function RetellLectureInterface() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const currentRaw = rawQuestions[currentIndex]

    const SAMPLE_TASK = {
        id: `RL-${currentRaw.id}`,
        title: currentRaw.title || "Untitled Lecture",
        audioUrl: currentRaw.audio.includes("uc?id=")
            ? currentRaw.audio.replace(
                /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
                "https://drive.google.com/file/d/$1/preview"
            )
            : currentRaw.audio,
        transcript: currentRaw.question,
        preparationTime: 10,
        responseTime: 40,
        duration: 90,
        wordCount: currentRaw.question.trim().split(/\s+/).length,
        estimatedDuration: 90,
        difficulty: "Medium",
        category: "General",
        keyPoints: currentRaw.answer_ai
            ? currentRaw.answer_ai
                .split("###")
                .map((s) => s.trim())
                .filter((s) => s.length > 0)
            : [],
        tips: [
            "Listen for the main topic and key supporting points",
            "Take notes on specific facts, numbers, and examples",
            "Organize your retelling with a clear structure",
            "Use your own words rather than memorizing exact phrases",
            "Include important details but focus on main ideas",
            "Speak naturally and maintain good pace",
        ],
    }

    const [phase, setPhase] = useState<"ready" | "listening" | "preparation" | "countdown" | "recording" | "completed">(
        "ready",
    )
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(SAMPLE_TASK.duration)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [selectedProvider, setSelectedProvider] = useState("mypte")
    const [preparationTime, setPreparationTime] = useState(SAMPLE_TASK.preparationTime)
    const [countdownValue, setCountdownValue] = useState(3)
    const [recordingTime, setRecordingTime] = useState(SAMPLE_TASK.responseTime)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isPlayingRecording, setIsPlayingRecording] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(1)
    const [totalQuestions, setTotalQuestions] = useState(132)
    const [activeTab, setActiveTab] = useState("task")
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [microphonePermission, setMicrophonePermission] = useState<"granted" | "denied" | "prompt">("prompt")
    const [showTranscript, setShowTranscript] = useState(false)
    const [showKeyPoints, setShowKeyPoints] = useState(false)
    const [notesContent, setNotesContent] = useState("")
    const [hasListenedOnce, setHasListenedOnce] = useState(false)
    const [playCount, setPlayCount] = useState(0)

    const audioRef = useRef<HTMLAudioElement>(null)
    const recordingAudioRef = useRef<HTMLAudioElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])
    const notesRef = useRef<HTMLTextAreaElement>(null)

    const [evaluationResult, setEvaluationResult] = useState<{ score?: string; feedback?: string } | null>(null);

    // Request microphone permission
    useEffect(() => {
        const requestMicrophonePermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                setMicrophonePermission("granted")
                stream.getTracks().forEach((track) => track.stop()) // Stop the stream immediately
            } catch (error) {
                setMicrophonePermission("denied")
                toast.error("Microphone Access Required", {
                    description: "Please allow microphone access to complete this speaking task.",
                })
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

    // Recording timer
    useEffect(() => {
        let timer: NodeJS.Timeout

        if (phase === "recording" && recordingTime > 0) {
            timer = setInterval(() => {
                setRecordingTime((prev) => prev - 1)
            }, 1000)
        } else if (phase === "recording" && recordingTime === 0) {
            stopRecording()
        }

        return () => clearInterval(timer)
    }, [phase, recordingTime])

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

    // Handle audio ended
    const handleAudioEnded = () => {
        setIsPlaying(false)
        setPhase("preparation")
        setPreparationTime(SAMPLE_TASK.preparationTime)
        setHasListenedOnce(true)
        setPlayCount((prev) => prev + 1)

        toast("Lecture Complete", {
            description: `You have ${SAMPLE_TASK.preparationTime} seconds to prepare before recording starts.`,
        })
    }

    // Handle audio play/pause
    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause()
                setIsPlaying(false)
            } else {
                setPhase("listening")
                audioRef.current.play()
                setIsPlaying(true)
            }
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
                setPhase("listening")
            }
        }
    }

    // Skip backward 10 seconds
    const skipBackward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    // Skip forward 10 seconds
    const skipForward = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10)
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    // Skip countdown
    const skipCountdown = () => {
        setCountdownValue(0)
    }

    // Start recording
    const startRecording = async () => {
        if (microphonePermission !== "granted") {
            toast.error("Microphone Access Required", {
                description: "Please allow microphone access to complete this speaking task.",
            })
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


            toast("Recording Started", {
                description: `Retell the lecture now. You have ${SAMPLE_TASK.responseTime} seconds.`,
            })
        } catch (error) {
            toast.error("Recording Error", {
                description: "Failed to start recording. Please check your microphone.",
            })
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
        if (recordingAudioRef.current) {
            if (isPlayingRecording) {
                recordingAudioRef.current.pause()
            } else {
                recordingAudioRef.current.play()
            }
            setIsPlayingRecording(!isPlayingRecording)
        }
    }

    // Handle form submission
    const handleSubmit = async () => {
        if (!recordedAudio) {
            toast.error("No recording found", {
                description: "Please complete the recording before submitting.",
            })
            return
        }

        setHasSubmitted(true)

        // toast({
        //     title: "Response Submitted",
        //     description: "Your lecture retelling has been submitted successfully.",
        //     variant: "default",
        // })

        const formData = new FormData()
        formData.append("file", recordedAudio, "audio.wav")

        var data_text;
        try {
            const res = await fetch("/api/speaking/transcribe", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("Failed to get transcription")

            data_text = await res.json()

            toast(
                <div>
                    <p className="font-semibold">Transcription Received</p>
                    <p className="text-sm text-muted-foreground">
                        {data_text.text}
                    </p>
                </div>
            )
        } catch (err) {
            console.error(err)
            toast(
                <div>
                    <p className="font-semibold">Submission Failed</p>
                    <p className="text-sm text-red-500">
                        Could not transcribe your recording.
                    </p>
                </div>
            )
        }


        try {
            const res = await fetch("/api/speaking/retell-lecture", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    transcript: SAMPLE_TASK.transcript,
                    response: data_text.text,
                }),
            });

            const result = await res.json();

            setEvaluationResult(result);

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
        setPhase("ready")
        setIsPlaying(false)
        setCurrentTime(0)
        setPreparationTime(SAMPLE_TASK.preparationTime)
        setCountdownValue(3)
        setRecordingTime(SAMPLE_TASK.responseTime)
        setIsRecording(false)
        setRecordedAudio(null)
        setAudioUrl(null)
        setIsPlayingRecording(false)
        setHasSubmitted(false)
        setHasListenedOnce(false)
        setPlayCount(0)
        setNotesContent("")
        if (audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.pause()
        }
        if (recordingAudioRef.current) {
            recordingAudioRef.current.pause()
            recordingAudioRef.current.currentTime = 0
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

    // Get volume icon based on volume level
    const getVolumeIcon = () => {
        if (isMuted || volume === 0) return <VolumeX className="h-4 w-4" />
        if (volume < 50) return <Volume1 className="h-4 w-4" />
        return <Volume2 className="h-4 w-4" />
    }

    // Get phase color
    const getPhaseColor = () => {
        switch (phase) {
            case "ready":
                return "text-blue-500"
            case "listening":
                return "text-green-500"
            case "preparation":
                return "text-amber-500"
            case "countdown":
                return "text-orange-500"
            case "recording":
                return "text-red-500"
            case "completed":
                return "text-purple-500"
            default:
                return "text-slate-500"
        }
    }

    // Get phase text
    const getPhaseText = () => {
        switch (phase) {
            case "ready":
                return "Ready to Listen"
            case "listening":
                return "Listening"
            case "preparation":
                return "Preparation"
            case "countdown":
                return "Get Ready"
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
            <Card className="shadow-lg border-t-4 border-t-orange-500 dark:border-t-orange-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Retell Lecture</h1>
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
                                <Clock className="w-3 h-3 mr-1" />
                                {formatTime(SAMPLE_TASK.duration)}
                            </Badge>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn("flex items-center gap-1 font-mono font-medium", getPhaseColor())}>
                            <Clock className="h-4 w-4" />
                            {phase === "listening" && formatTime(currentTime)}
                            {phase === "preparation" && formatTime(preparationTime)}
                            {phase === "countdown" && `${countdownValue}s`}
                            {phase === "recording" && formatTime(recordingTime)}
                            {(phase === "ready" || phase === "completed") && "Ready"}
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
                                        Listen to the lecture, then retell what you heard in your own words. You have{" "}
                                        {SAMPLE_TASK.preparationTime} seconds to prepare and {SAMPLE_TASK.responseTime} seconds to speak.
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
                                You will hear a lecture. After listening to the lecture, in {SAMPLE_TASK.preparationTime} seconds,
                                please speak into the microphone and retell what you have just heard from the lecture in your own words.
                                You will have {SAMPLE_TASK.responseTime} seconds to give your response.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">{SAMPLE_TASK.title}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">Provider:</span>
                                    <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TEST_PROVIDERS.map((provider) => (
                                                <SelectItem key={provider.value} value={provider.value}>
                                                    {provider.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="task" className="flex items-center gap-1">
                                <Headphones className="h-4 w-4" />
                                <span className="hidden sm:inline">Task</span>
                            </TabsTrigger>
                            <TabsTrigger value="notes" className="flex items-center gap-1">
                                <PenTool className="h-4 w-4" />
                                <span className="hidden sm:inline">Notes</span>
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
                                        <div className="text-5xl font-bold text-orange-600 dark:text-orange-400 mb-6">{countdownValue}</div>
                                        <Button onClick={skipCountdown}>Skip</Button>
                                    </div>
                                </div>
                            )}

                            {/* Audio Player */}

                            {/* Key Points (conditionally shown) */}
                            {showKeyPoints && (
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium flex items-center gap-1">
                                            <Target className="h-4 w-4" />
                                            Key Points (Practice Mode)
                                        </h3>
                                        <Button variant="outline" size="sm" onClick={() => setShowKeyPoints(false)} className="text-xs">
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Hide
                                        </Button>
                                    </div>
                                    <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-1 pl-5 list-disc">
                                        {SAMPLE_TASK.keyPoints.map((point, i) => (
                                            <li key={i}>{point}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Recording controls */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col items-center space-y-4">
                                    {phase === "ready" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Headphones className="h-5 w-5 text-orange-500" />
                                                <span className="font-medium">Click play to listen to the lecture</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Take notes while listening to help you remember key points
                                            </p>
                                        </div>
                                    )}

                                    {/* {phase === "listening" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="font-medium text-green-600 dark:text-green-400">Listening to lecture</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Focus on main ideas, supporting details, and examples
                                            </p>
                                        </div>
                                    )}

                                    {phase === "preparation" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Brain className="h-5 w-5 text-amber-500" />
                                                <span className="font-medium text-amber-600 dark:text-amber-400">Preparation time</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Organize your thoughts and plan your retelling
                                            </p>
                                            <Progress
                                                value={((SAMPLE_TASK.preparationTime - preparationTime) / SAMPLE_TASK.preparationTime) * 100}
                                                className="w-64 mt-3"
                                            // indicatorClassName="bg-amber-500"
                                            />
                                        </div>
                                    )} */}

                                    {phase === "recording" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="font-medium text-red-600 dark:text-red-400">Recording your retelling</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Retell the lecture in your own words, covering main points
                                            </p>
                                            <Progress
                                                value={((SAMPLE_TASK.responseTime - recordingTime) / SAMPLE_TASK.responseTime) * 100}
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
                                                    Stop Recording
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {phase === "completed" && recordedAudio && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-4">
                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                <span className="font-medium text-green-600 dark:text-green-400">Recording completed</span>
                                            </div>

                                            <audio
                                                ref={recordingAudioRef}
                                                src={audioUrl || undefined}
                                                onEnded={() => setIsPlayingRecording(false)}
                                            />

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
                                                            Play Your Recording
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

                            <iframe
                                src={SAMPLE_TASK.audioUrl}
                                width="100%"
                                height="60"
                                allow="autoplay"
                                title={`Audio for ${SAMPLE_TASK.title}`}
                                className="rounded-md border"
                            />

                            {evaluationResult && (
                                <div className="p-4 rounded-xl border border-orange-300 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-xl">
                                    <h4 className="text-lg font-bold text-orange-700 dark:text-orange-300 mb-2 flex items-center gap-2">
                                        ✅ Evaluation Result
                                    </h4>
                                    <div className="text-sm space-y-2 text-slate-800 dark:text-slate-300">
                                        <p>
                                            <strong className="text-orange-600 dark:text-orange-400">Score:</strong>{" "}
                                            <span className="font-medium">{evaluationResult.score || "N/A"} / 5</span>
                                        </p>
                                        <p>
                                            <strong className="text-orange-600 dark:text-orange-400">Feedback:</strong><br />
                                            <span className="italic">{evaluationResult.feedback}</span>
                                        </p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>



                        <TabsContent value="notes" className="mt-0">
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium flex items-center gap-1">
                                            <PenTool className="h-4 w-4" />
                                            Your Notes
                                        </h3>
                                        <span className="text-xs text-slate-500">Take notes while listening</span>
                                    </div>

                                    <Textarea
                                        ref={notesRef}
                                        placeholder="Take notes here while listening to the lecture..."
                                        className="min-h-[300px] resize-y text-base p-4 leading-relaxed"
                                        value={notesContent}
                                        onChange={(e) => setNotesContent(e.target.value)}
                                    />

                                    <p className="text-xs text-slate-500 mt-2">
                                        These notes are for your reference only and will not be submitted as part of your answer.
                                    </p>
                                </div>

                                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-100 dark:border-orange-800">
                                    <h4 className="font-medium flex items-center gap-1 text-orange-700 dark:text-orange-300 mb-2">
                                        <Lightbulb className="h-4 w-4" />
                                        Note-Taking Tips
                                    </h4>
                                    <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1 pl-5 list-disc">
                                        <li>Focus on main ideas and key supporting points</li>
                                        <li>Note specific examples, numbers, and facts</li>
                                        <li>Use abbreviations and symbols to write quickly</li>
                                        <li>Organize notes with bullet points or numbering</li>
                                        <li>Leave space to add details during preparation time</li>
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tips" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <h3 className="font-medium text-lg mb-3">Retell Lecture Tips</h3>
                                <ul className="space-y-3">
                                    {SAMPLE_TASK.tips.map((tip, index) => (
                                        <li key={index} className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-md border border-orange-100 dark:border-orange-800">
                                    <h4 className="font-medium flex items-center gap-1 text-orange-700 dark:text-orange-300">
                                        <Lightbulb className="h-4 w-4" />
                                        Pro Tip
                                    </h4>
                                    <p className="text-sm mt-1 text-orange-700 dark:text-orange-300">
                                        Structure your retelling with a clear beginning, middle, and end. Start with the main topic, cover
                                        2-3 key points with supporting details, and conclude with any important implications or conclusions
                                        mentioned in the lecture.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Useful Phrases for Retelling:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "The lecture discussed..."
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "According to the speaker..."
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "The main point was..."
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "For example..."
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "Additionally..."
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "In conclusion..."
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="discussion" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-lg">Discussion</h3>
                                    <Badge variant="outline">6 comments</Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                                                <span className="font-medium text-orange-600 dark:text-orange-300">JL</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Jessica Liu</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1 week ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I struggle with remembering all the details from longer lectures like this one. Any strategies for
                                            better retention during the listening phase?
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md ml-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <span className="font-medium text-green-600 dark:text-green-300">MK</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Michael Kim</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">6 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Try the Cornell note-taking method! Divide your notes into main points, details, and summary.
                                            Focus on the structure: introduction, 2-3 main points, conclusion.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                                <span className="font-medium text-blue-600 dark:text-blue-300">SP</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Sarah Patel</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">5 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            For this Venus lecture, I focused on: 1) Why it's called Earth's twin, 2) Extreme conditions
                                            (greenhouse effect, pressure), 3) Unique rotation, 4) Space missions. Having a mental framework
                                            helps!
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                                <span className="font-medium text-purple-600 dark:text-purple-300">DT</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">David Thompson</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">4 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Don't try to memorize everything word-for-word. Focus on understanding the concepts and use your
                                            own words to explain them. The scoring values content and fluency over exact recall.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center">
                                                <span className="font-medium text-teal-600 dark:text-teal-300">AL</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Anna Lopez</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">3 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I practice with TED talks at home. Start with shorter ones (5-6 minutes) and gradually work up to
                                            longer lectures. It really helps build your listening stamina and note-taking speed.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                                                <span className="font-medium text-amber-600 dark:text-amber-300">RC</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Robert Chen</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Time management is crucial! I spend about 5 seconds organizing my notes during prep time, then
                                            jump straight into speaking. Don't overthink the structure - just start with the main topic and
                                            let it flow naturally.
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
                        {phase === "ready" && (
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Click play to listen to the lecture and take notes
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
                            {(phase !== "recording" && phase !== "completed") && (
                                <Button
                                    onClick={() => {
                                        setPhase("recording")
                                        startRecording()
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white"
                                    size="sm"
                                >
                                    Start Recording
                                </Button>
                            )}

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
                            className="bg-orange-600 hover:bg-orange-700"
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
