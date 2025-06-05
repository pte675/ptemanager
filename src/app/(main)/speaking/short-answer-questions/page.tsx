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
    EyeOff,
    Repeat,
    Target,
    Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestions from "./short-answer-questions.json"

const TEST_PROVIDERS = [
    { value: "mypte", label: "MYPTE" },
    { value: "pte-official", label: "PTE Official" },
    { value: "practice", label: "Practice Mode" },
]

const CATEGORIES = [
    { value: "all", label: "All Categories" },
    { value: "geography", label: "Geography" },
    { value: "history", label: "History" },
    { value: "science", label: "Science" },
    { value: "general", label: "General Knowledge" },
    { value: "academic", label: "Academic" },
]

export default function ShortAnswerInterface() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

    const SAMPLE_QUESTIONS = rawQuestions.map((q) => ({
        rawid: q.id, // ✅ keep rawid for updatate localStorage
        id: `ASQ-${q.id}`,
        audioUrl: q.audio,
        duration: 5,
        transcript: q.question,
        expectedAnswer: q.answer,
        alternativeAnswers: [] as string[], // ✅ explicitly set type
        category: "General Knowledge",
        difficulty: "Medium",
        responseTime: 10,
        tips: [
            "Listen carefully to the question.",
            "Give a short and direct answer.",
            "Usually 1–3 words is enough.",
            "Speak confidently.",
        ],
        explanation: `The correct answer is "${q.answer}".`,
    }))

    const [phase, setPhase] = useState<"ready" | "listening" | "countdown" | "recording" | "completed">("ready")
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [selectedProvider, setSelectedProvider] = useState("mypte")
    const [selectedCategory, setSelectedCategory] = useState("all")
    const [countdownValue, setCountdownValue] = useState(3)
    const [recordingTime, setRecordingTime] = useState(10)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isPlayingRecording, setIsPlayingRecording] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(2)
    const [totalQuestions, setTotalQuestions] = useState(1022)
    const [activeTab, setActiveTab] = useState("task")
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [microphonePermission, setMicrophonePermission] = useState<"granted" | "denied" | "prompt">("prompt")
    const [showTranscript, setShowTranscript] = useState(false)
    const [showAnswer, setShowAnswer] = useState(false)
    const [notesContent, setNotesContent] = useState("")
    const [hasListenedOnce, setHasListenedOnce] = useState(false)
    const [playCount, setPlayCount] = useState(0)
    const [userAnswer, setUserAnswer] = useState("")
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
    const [streak, setStreak] = useState(0)
    const [totalCorrect, setTotalCorrect] = useState(0)
    const [totalAttempted, setTotalAttempted] = useState(0)

    const audioRef = useRef<HTMLAudioElement>(null)
    const recordingAudioRef = useRef<HTMLAudioElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    const currentQuestion = SAMPLE_QUESTIONS[currentQuestionIndex]

    const [evaluationResult, setEvaluationResult] = useState<{ score?: string; feedback?: string } | null>(null);

    // Request microphone permission
    useEffect(() => {
        const requestMicrophonePermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                setMicrophonePermission("granted")
                stream.getTracks().forEach((track) => track.stop())
            } catch (error) {
                setMicrophonePermission("denied")
                toast.error("Microphone Access Required", {
                    description: "Please allow microphone access to complete this speaking task.",
                })
            }
        }

        requestMicrophonePermission()
    }, [toast])

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
        setPhase("countdown")
        setCountdownValue(3)
        setHasListenedOnce(true)
        setPlayCount((prev) => prev + 1)

        toast("Question Complete", {
            description: "Get ready to record your answer!",
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

    // Skip countdown
    const skipCountdown = () => {
        setCountdownValue(0)
    }

    // Start recording
    const startRecording = async () => {
        if (microphonePermission !== "granted") {
            toast.error("Microphone Access Required", {
                description: "Please allow microphone access to start recording.",
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
                description: `Give your answer now. You have ${currentQuestion.responseTime} seconds.`,
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

    // Check answer (simulated)
    const checkAnswer = (answer: string) => {
        const normalizedAnswer = answer.toLowerCase().trim()
        const expectedAnswer = currentQuestion.expectedAnswer.toLowerCase()
        const alternativeAnswers = currentQuestion.alternativeAnswers.map((a) => a.toLowerCase())

        const correct =
            normalizedAnswer === expectedAnswer || alternativeAnswers.some((alt) => normalizedAnswer.includes(alt))

        setIsCorrect(correct)
        setTotalAttempted((prev) => prev + 1)

        if (correct) {
            setTotalCorrect((prev) => prev + 1)
            setStreak((prev) => prev + 1)
            toast.success("Correct!", {
                description: "Great job! Your answer is correct.",
            })
        } else {
            setStreak(0)
            toast.error("Incorrect", {
                description: `The correct answer is: ${currentQuestion.expectedAnswer}`,
            })
        }

        return correct
    }

    // Handle form submission
    const handleSubmit = async () => {

        //updatelocalStorage
        const updatelocalStorage = (result: { score: number }) => {
            // Update local storage with progress
            const isCurrentQuestionRight = result.score >= 4 // or adjust threshold as needed

            const prevProgress = JSON.parse(localStorage.getItem("progress") || "{}")
            const prevData = prevProgress?.speaking?.["short-answer-questions"] || {
                completed: 0,
                accuracy: null,
                streak: 0,
            }

            const isNewQuestion = currentQuestion.rawid > prevData.completed
            const newCompleted = isNewQuestion ? currentQuestion.rawid : prevData.completed
            const newStreak = isCurrentQuestionRight ? prevData.streak + 1 : 0
            const newAccuracy = isNewQuestion
                ? prevData.accuracy === null
                    ? (isCurrentQuestionRight ? 1 : 0)
                    : ((prevData.accuracy * prevData.completed) + (isCurrentQuestionRight ? 1 : 0)) / newCompleted
                : prevData.accuracy

            const updatedProgress = {
                ...prevProgress,
                speaking: {
                    ...prevProgress.speaking,
                    "short-answer-questions": {
                        completed: newCompleted,
                        accuracy: parseFloat(newAccuracy.toFixed(2)),
                        streak: newStreak,
                    },
                },
            }

            localStorage.setItem("progress", JSON.stringify(updatedProgress))
        }


        //rest logic to handle submission
        if (!recordedAudio) {
            toast.error("No recording found", {
                description: "Please complete the recording before submitting.",
            })
            return
        }

        // Simulate answer checking
        // const simulatedAnswer = currentQuestion.expectedAnswer // In real app, this would come from speech recognition
        // setUserAnswer(simulatedAnswer)
        // checkAnswer(simulatedAnswer)
        setHasSubmitted(true)

        toast.success("Response Submitted", {
            description: "Your answer has been submitted and evaluated.",
        })

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
            const res = await fetch("/api/speaking/short-answer-questions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    sampleAnswer: currentQuestion.expectedAnswer,
                    question: currentQuestion.transcript,
                    userResponse: data_text.text,
                }),
            });

            const result = await res.json();

            setEvaluationResult(result);
            updatelocalStorage(result);
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
        setCountdownValue(3)
        setRecordingTime(currentQuestion.responseTime)
        setIsRecording(false)
        setRecordedAudio(null)
        setAudioUrl(null)
        setIsPlayingRecording(false)
        setHasSubmitted(false)
        setHasListenedOnce(false)
        setPlayCount(0)
        setUserAnswer("")
        setIsCorrect(null)
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
            description: `Question #${currentQuestion.id} has been ${isBookmarked ? "removed from" : "added to"} your bookmarks.`,
        })
    }

    // Navigate to previous question
    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1)
            resetExercise()
            setProgress((prev) => Math.max(prev - 1, 1))
        }
    }

    // Navigate to next question
    const handleNext = () => {
        if (currentQuestionIndex < SAMPLE_QUESTIONS.length - 1) {
            setCurrentQuestionIndex((prev) => prev + 1)
            resetExercise()
            setProgress((prev) => Math.min(prev + 1, totalQuestions))
        } else {
            // Load next question from database in real app
            toast("Navigation", {
                description: "Next question would be loaded here.",
            })
            setProgress((prev) => Math.min(prev + 1, totalQuestions))
        }
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
    }[currentQuestion.difficulty]

    const accuracyPercentage = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0

    return (
        <div className="container mx-auto py-6 px-4 max-w-6xl">
            <Card className="shadow-lg border-t-4 border-t-blue-500 dark:border-t-blue-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400">Answer Short Question</h1>
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
                                <Info className="w-3 h-3 mr-1" />
                                {currentQuestion.difficulty}
                            </Badge>
                            <Badge variant="secondary" className="font-normal">
                                <Clock className="w-3 h-3 mr-1" />
                                {currentQuestion.responseTime}s
                            </Badge>
                            {streak > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="font-normal bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
                                >
                                    <Zap className="w-3 h-3 mr-1" />
                                    {streak} streak
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={cn("flex items-center gap-1 font-mono font-medium", getPhaseColor())}>
                            <Clock className="h-4 w-4" />
                            {phase === "listening" && formatTime(currentTime)}
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
                                        Listen to the question and give a simple, short answer. Usually just one or a few words is enough.
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
                                You will hear a question. Please give a simple and short answer. Often just one or a few words is
                                enough.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">{currentQuestion.id}</h2>
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

                        {/* Performance Stats */}
                        {totalAttempted > 0 && (
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{accuracyPercentage}%</div>
                                    <div className="text-xs text-slate-500">Accuracy</div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{streak}</div>
                                    <div className="text-xs text-slate-500">Current Streak</div>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                        {totalCorrect}/{totalAttempted}
                                    </div>
                                    <div className="text-xs text-slate-500">Correct</div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-4 mb-4">
                            <TabsTrigger value="task" className="flex items-center gap-1">
                                <Headphones className="h-4 w-4" />
                                <span className="hidden sm:inline">Task</span>
                            </TabsTrigger>
                            <TabsTrigger value="practice" className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                <span className="hidden sm:inline">Practice</span>
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
                                        <h3 className="text-2xl font-bold mb-4">Get Ready to Answer!</h3>
                                        <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-6">{countdownValue}</div>
                                        <Button onClick={skipCountdown}>Skip</Button>
                                    </div>
                                </div>
                            )}

                            {/* Audio Player */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col space-y-4">
                                    {/* Audio element (hidden) */}
                                    <audio
                                        ref={audioRef}
                                        src={currentQuestion.audioUrl}
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={handleAudioEnded}
                                        onLoadedMetadata={() => {
                                            if (audioRef.current) {
                                                setCurrentTime(0)
                                            }
                                        }}
                                    />

                                    {/* Waveform visualization (simulated) */}
                                    <div className="relative h-16 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-blue-100 dark:bg-blue-900/30"
                                            style={{ width: `${(currentTime / currentQuestion.duration) * 100}%` }}
                                        ></div>
                                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                            <svg className="w-full h-12" viewBox="0 0 300 100" preserveAspectRatio="none">
                                                {/* Simulated short waveform for question */}
                                                {Array.from({ length: 30 }).map((_, i) => {
                                                    const height = 20 + Math.random() * 60
                                                    return (
                                                        <rect
                                                            key={i}
                                                            x={i * 10}
                                                            y={(100 - height) / 2}
                                                            width="6"
                                                            height={height}
                                                            rx="2"
                                                            fill={i * 10 < (currentTime / currentQuestion.duration) * 300 ? "#3b82f6" : "#cbd5e1"}
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

                                                <Button
                                                    variant="default"
                                                    size="icon"
                                                    className="h-12 w-12 rounded-full bg-blue-500 hover:bg-blue-600"
                                                    onClick={togglePlay}
                                                >
                                                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                                                </Button>

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
                                                            {[0.5, 0.75, 1, 1.25, 1.5].map((rate) => (
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
                                            <span className="text-sm font-mono">{formatTime(currentQuestion.duration)}</span>
                                        </div>

                                        <Slider
                                            value={[currentTime]}
                                            min={0}
                                            max={currentQuestion.duration}
                                            step={0.1}
                                            onValueChange={handleSeek}
                                            className="w-full"
                                        />

                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>Question {currentQuestion.id}</span>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center space-x-2">
                                                    <span>Transcript</span>
                                                    <Switch checked={showTranscript} onCheckedChange={setShowTranscript} />
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span>Answer</span>
                                                    <Switch checked={showAnswer} onCheckedChange={setShowAnswer} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transcript (conditionally shown) */}
                            {showTranscript && (
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium flex items-center gap-1">
                                            <FileText className="h-4 w-4" />
                                            Question Transcript (Practice Mode)
                                        </h3>
                                        <Button variant="outline" size="sm" onClick={() => setShowTranscript(false)} className="text-xs">
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Hide
                                        </Button>
                                    </div>
                                    <div className="text-lg text-slate-700 dark:text-slate-300 font-medium">
                                        "{currentQuestion.transcript}"
                                    </div>
                                </div>
                            )}

                            {/* Expected Answer (conditionally shown) */}
                            {showAnswer && (
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium flex items-center gap-1">
                                            <Target className="h-4 w-4" />
                                            Expected Answer (Practice Mode)
                                        </h3>
                                        <Button variant="outline" size="sm" onClick={() => setShowAnswer(false)} className="text-xs">
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Hide
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                                            {currentQuestion.expectedAnswer}
                                        </div>
                                        {currentQuestion.alternativeAnswers.length > 0 && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">Alternative acceptable answers:</p>
                                                <ul className="text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                                                    {currentQuestion.alternativeAnswers.map((alt, i) => (
                                                        <li key={i}>"{alt}"</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                                            <strong>Explanation:</strong> {currentQuestion.explanation}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Recording controls */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col items-center space-y-4">
                                    {phase === "ready" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Headphones className="h-5 w-5 text-blue-500" />
                                                <span className="font-medium">Click play to listen to the question</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Listen carefully and prepare a short, direct answer
                                            </p>
                                        </div>
                                    )}

                                    {phase === "listening" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="font-medium text-green-600 dark:text-green-400">Listening to question</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Focus on what is being asked</p>
                                        </div>
                                    )}

                                    {phase === "recording" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="font-medium text-red-600 dark:text-red-400">Recording your answer</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">Give a short, direct answer</p>
                                            <Progress
                                                value={((currentQuestion.responseTime - recordingTime) / currentQuestion.responseTime) * 100}
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
                                                            Play Your Answer
                                                        </>
                                                    )}
                                                </Button>
                                            </div>

                                            {hasSubmitted && isCorrect !== null && (
                                                <div
                                                    className={cn(
                                                        "mt-4 p-3 rounded-md",
                                                        isCorrect ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20",
                                                    )}
                                                >
                                                    <div
                                                        className={cn(
                                                            "flex items-center gap-2 mb-2",
                                                            isCorrect ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300",
                                                        )}
                                                    >
                                                        {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                                                        <span className="font-medium">{isCorrect ? "Correct!" : "Incorrect"}</span>
                                                    </div>
                                                    <p
                                                        className={cn(
                                                            "text-sm",
                                                            isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
                                                        )}
                                                    >
                                                        {isCorrect
                                                            ? "Great job! Your answer is correct."
                                                            : `The correct answer is: "${currentQuestion.expectedAnswer}"`}
                                                    </p>
                                                </div>
                                            )}

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

                                    {evaluationResult && (
                                        <div className="w-full p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-slate-800 dark:to-slate-900 shadow-xl">
                                            <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-2 flex items-center gap-2">
                                                ✅ Evaluation Result
                                            </h4>
                                            <div className="text-sm space-y-2 text-slate-800 dark:text-slate-300">
                                                <p>
                                                    <strong className="text-emerald-600 dark:text-emerald-400">Score:</strong>{" "}
                                                    <span className="font-medium">{evaluationResult.score || "N/A"} / 5</span>
                                                </p>
                                                <p>
                                                    <strong className="text-emerald-600 dark:text-emerald-400">Feedback:</strong><br />
                                                    <span className="italic">{evaluationResult.feedback}</span>
                                                </p>
                                            </div>
                                            <div className="text-sm text-slate-700 dark:text-slate-400 pt-3">
                                                <strong className="text-emerald-600 dark:text-emerald-400">Model Answer:</strong><br />
                                                <p className="whitespace-pre-line">{currentQuestion.expectedAnswer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="practice" className="mt-0">
                            <div className="space-y-4">
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-medium flex items-center gap-1">
                                            <Target className="h-4 w-4" />
                                            Practice Mode
                                        </h3>
                                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                            <SelectTrigger className="w-48">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {CATEGORIES.map((category) => (
                                                    <SelectItem key={category.value} value={category.value}>
                                                        {category.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {SAMPLE_QUESTIONS.length}
                                            </div>
                                            <div className="text-xs text-slate-500">Available Questions</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalCorrect}</div>
                                            <div className="text-xs text-slate-500">Correct Answers</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalAttempted}</div>
                                            <div className="text-xs text-slate-500">Total Attempted</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h4 className="font-medium">Quick Practice Questions:</h4>
                                        {SAMPLE_QUESTIONS.map((question, index) => (
                                            <div
                                                key={question.id}
                                                className={cn(
                                                    "p-3 rounded-md border cursor-pointer transition-colors",
                                                    index === currentQuestionIndex
                                                        ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                                        : "bg-slate-50 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700",
                                                )}
                                                onClick={() => {
                                                    setCurrentQuestionIndex(index)
                                                    resetExercise()
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{question.id}</div>
                                                        <div className="text-sm text-slate-600 dark:text-slate-400">{question.category}</div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className={difficultyColor}>
                                                            {question.difficulty}
                                                        </Badge>
                                                        {index === currentQuestionIndex && (
                                                            <Badge variant="default" className="bg-blue-500">
                                                                Current
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tips" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <h3 className="font-medium text-lg mb-3">Short Answer Tips</h3>
                                <ul className="space-y-3">
                                    {currentQuestion.tips.map((tip, index) => (
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
                                        For short answer questions, your first instinct is usually correct. Don't overthink the answer -
                                        these questions test your immediate knowledge and understanding, not complex reasoning.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Common Question Types:</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "What is the capital of...?"
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "In which year did...?"
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "What do you call...?"
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "Who invented...?"
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "How many...?"
                                        </Badge>
                                        <Badge variant="secondary" className="text-xs justify-start">
                                            "What color is...?"
                                        </Badge>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Answer Length Guidelines:</h4>
                                    <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                                        <li>
                                            • <strong>One word:</strong> Names, colors, numbers, yes/no
                                        </li>
                                        <li>
                                            • <strong>2-3 words:</strong> Compound names, short phrases
                                        </li>
                                        <li>
                                            • <strong>Short phrase:</strong> Only when necessary for clarity
                                        </li>
                                        <li>
                                            • <strong>Avoid:</strong> Full sentences or explanations
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="discussion" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-medium text-lg">Discussion</h3>
                                    <Badge variant="outline">8 comments</Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                                <span className="font-medium text-blue-600 dark:text-blue-300">LM</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Lisa Martinez</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I sometimes overthink these questions and give longer answers than needed. Any tips for keeping
                                            answers concise?
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md ml-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <span className="font-medium text-green-600 dark:text-green-300">JW</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">James Wilson</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Practice with a timer! Give yourself only 2-3 seconds to think after hearing the question. Your
                                            first instinct is usually the right length and content.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                                <span className="font-medium text-purple-600 dark:text-purple-300">SK</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Sarah Kim</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            For geography questions like "What's the capital of Australia?", just say "Canberra" - no need for
                                            "The capital of Australia is Canberra." Keep it simple!
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-800 flex items-center justify-center">
                                                <span className="font-medium text-orange-600 dark:text-orange-300">RT</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Robert Taylor</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I struggle with year questions. Should I say "nineteen forty-five" or "1945" for dates?
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md ml-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center">
                                                <span className="font-medium text-teal-600 dark:text-teal-300">AM</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Anna Miller</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Both are acceptable! I usually say the numbers as words ("nineteen forty-five") because it sounds
                                            more natural in speech, but "1945" works too.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800 flex items-center justify-center">
                                                <span className="font-medium text-red-600 dark:text-red-300">DL</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">David Lee</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">12 hours ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            The key is confidence! Even if you're not 100% sure, give your best guess clearly and move on.
                                            Hesitation hurts your score more than a slightly wrong answer.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-800 flex items-center justify-center">
                                                <span className="font-medium text-indigo-600 dark:text-indigo-300">MJ</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Maria Johnson</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">8 hours ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I practice with trivia apps and quiz shows. It helps build that quick-response muscle memory you
                                            need for these questions. The more you practice, the more automatic it becomes.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center">
                                                <span className="font-medium text-pink-600 dark:text-pink-300">EB</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Emma Brown</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">4 hours ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Remember that these questions test general knowledge, not specialized expertise. If you don't know
                                            something, make an educated guess - partial credit is better than silence!
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
                            <div className="text-sm text-slate-600 dark:text-slate-400">Click play to listen to the question</div>
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
                            <Button variant="outline" size="sm" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </Button>

                            <Button variant="outline" size="sm" onClick={resetExercise}>
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Restart
                            </Button>

                            <Button variant="outline" size="sm" onClick={handleNext}>
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
