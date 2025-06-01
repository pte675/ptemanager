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
    Eye,
    EyeOff,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestions from "./repeat_sentence.json"

const ACCENT_OPTIONS = [
    { value: "us-male", label: "US Male" },
    { value: "us-female", label: "US Female" },
    { value: "uk-male", label: "UK Male" },
    { value: "uk-female", label: "UK Female" },
    { value: "au-male", label: "Australian Male" },
    { value: "au-female", label: "Australian Female" },
]

export default function RepeatSentenceInterface() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const SAMPLE_TASK = {
        id: `RS-${rawQuestions[currentIndex].id}`,
        sentence: rawQuestions[currentIndex].question,
        audioUrl: rawQuestions[currentIndex].audio,
        duration: 6.5, // You can optionally set this dynamically from audio metadata
        difficulty: "Medium", // Placeholder, since not in JSON
        category: "General",  // Placeholder, since not in JSON
        wordCount: rawQuestions[currentIndex].question.split(" ").length,
        accent: "US Male", // Default; you already have accent dropdown
        tips: [
            "Listen carefully to the entire sentence before repeating",
            "Pay attention to word stress and intonation patterns",
            "Speak at the same pace as the original recording",
            "Don't add or omit any words from the sentence",
            "Focus on clear pronunciation of each word",
            "Maintain the natural rhythm and flow of speech",
        ],
        keyWords: [], // Optional; can be auto-generated later if needed
    }
    const [phase, setPhase] = useState<"ready" | "listening" | "countdown" | "recording" | "completed">("ready")
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(SAMPLE_TASK.duration)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [selectedAccent, setSelectedAccent] = useState("us-male")
    const [countdownValue, setCountdownValue] = useState(3)
    const [recordingTime, setRecordingTime] = useState(15) // 15 seconds to repeat
    const [isRecording, setIsRecording] = useState(false)
    const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null)
    const [audioUrl, setAudioUrl] = useState<string | null>(null)
    const [isPlayingRecording, setIsPlayingRecording] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(5)
    const [totalQuestions, setTotalQuestions] = useState(1179)
    const [activeTab, setActiveTab] = useState("task")
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [microphonePermission, setMicrophonePermission] = useState<"granted" | "denied" | "prompt">("prompt")
    const [showTranscript, setShowTranscript] = useState(false)
    const [hasPlayedOnce, setHasPlayedOnce] = useState(false)
    const [playCount, setPlayCount] = useState(0)
    const [maxPlays] = useState(1) // Can only play once in real test

    const audioRef = useRef<HTMLAudioElement>(null)
    const recordingAudioRef = useRef<HTMLAudioElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

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
        setHasPlayedOnce(true)
        setPlayCount((prev) => prev + 1)

        toast("Audio Complete", {
            description: "Get ready to repeat the sentence. Recording will start in 3 seconds.",
        })
    }

    // dont use audio from json
    // create us male voice here
    // Handle audio play/pause
    // const togglePlay = () => {
    //     if (playCount >= maxPlays && hasPlayedOnce) {
    //         toast.error("Audio Already Played", {
    //             description: "You can only listen to the sentence once in this task.",
    //         })
    //         return
    //     }

    //     if (audioRef.current) {
    //         if (isPlaying) {
    //             audioRef.current.pause()
    //             setIsPlaying(false)
    //         } else {
    //             setPhase("listening")
    //             audioRef.current.play()
    //             setIsPlaying(true)
    //         }
    //     }
    // }

    const togglePlay = () => {
        if (playCount >= maxPlays && hasPlayedOnce) {
            toast.error("Audio Already Played", {
                description: "You can only listen to the sentence once in this task.",
            })
            return
        }

        const synth = window.speechSynthesis

        const speakNow = () => {
            const utterance = new SpeechSynthesisUtterance(SAMPLE_TASK.sentence)

            const voices = synth.getVoices()
            const preferredVoices = [
                "Google US English",
                "Microsoft David Desktop",
                "Matthew",
                "John"
            ]

            const usMaleVoice =
                voices.find((v) => preferredVoices.includes(v.name)) ||
                voices.find((v) => v.lang === "en-US")

            if (usMaleVoice) {
                utterance.voice = usMaleVoice
            }

            utterance.rate = 0.95 // slower for clarity
            utterance.pitch = 1   // natural tone
            utterance.volume = volume / 100

            utterance.onend = () => {
                setIsPlaying(false)
                setPhase("countdown")
                setCountdownValue(3)
                setHasPlayedOnce(true)
                setPlayCount((prev) => prev + 1)

                toast("Audio Complete", {
                    description: "Get ready to repeat the sentence. Recording will start in 3 seconds.",
                })
            }

            synth.cancel()
            synth.speak(utterance)
            setPhase("listening")
            setIsPlaying(true)
        }

        // Some browsers need a delay to load voices
        if (synth.getVoices().length === 0) {
            synth.onvoiceschanged = () => speakNow()
        } else {
            speakNow()
        }
    }

    // Handle seeking in audio
    const handleSeek = (value: number[]) => {
        if (audioRef.current && !hasPlayedOnce) {
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
                description: `Repeat the sentence now. You have ${recordingTime} seconds.`,
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

    function evaluateResponse(transcribed: string, expected: string): { score: string; feedback: string } {
        const transcribedWords = transcribed.trim().toLowerCase().split(/\s+/)
        const expectedWords = expected.trim().toLowerCase().split(/\s+/)

        const matchedWords = transcribedWords.filter((word, index) => word === expectedWords[index])
        const score = Math.round((matchedWords.length / expectedWords.length) * 5)

        const feedback =
            score === 5
                ? "Excellent! You repeated the sentence perfectly."
                : score >= 4
                    ? "Great job! Just a couple of minor mistakes."
                    : score >= 3
                        ? "Fair attempt, but try to be more accurate with wording and order."
                        : "Needs improvement. Focus on listening carefully and repeating the sentence word for word."

        return { score: `${score}`, feedback }
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
        //     description: "Your sentence repetition has been submitted successfully.",
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

        const result = evaluateResponse(data_text.text, SAMPLE_TASK.sentence)
        setEvaluationResult(result)

    }

    // Reset exercise
    const resetExercise = () => {
        setEvaluationResult(null)
        setPhase("ready")
        setIsPlaying(false)
        setCurrentTime(0)
        setCountdownValue(3)
        setRecordingTime(15)
        setIsRecording(false)
        setRecordedAudio(null)
        setAudioUrl(null)
        setIsPlayingRecording(false)
        setHasSubmitted(false)
        setHasPlayedOnce(false)
        setPlayCount(0)
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
            setCurrentIndex(currentIndex - 1)
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
            setCurrentIndex(currentIndex + 1)
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
            case "countdown":
                return "text-amber-500"
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
    }[SAMPLE_TASK.difficulty]

    return (
        <div className="container mx-auto py-6 px-4 max-w-5xl">
            <Card className="shadow-lg border-t-4 border-t-purple-500 dark:border-t-purple-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Repeat Sentence</h1>
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
                                <Headphones className="w-3 h-3 mr-1" />
                                {SAMPLE_TASK.wordCount} words
                            </Badge>
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
                                        You will hear a sentence once. Listen carefully and repeat it exactly as you hear it. You have 15
                                        seconds to repeat the sentence.
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
                                You will hear a sentence. Please repeat the sentence exactly as you hear it. You will hear the sentence
                                only once.
                            </p>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h2 className="font-semibold">{SAMPLE_TASK.id}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500">Voice:</span>
                                    <Select value={selectedAccent} onValueChange={setSelectedAccent}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ACCENT_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid grid-cols-3 mb-4">
                            <TabsTrigger value="task" className="flex items-center gap-1">
                                <Headphones className="h-4 w-4" />
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
                                        <h3 className="text-2xl font-bold mb-4">Get Ready to Repeat!</h3>
                                        <div className="text-5xl font-bold text-purple-600 dark:text-purple-400 mb-6">{countdownValue}</div>
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
                                        src={SAMPLE_TASK.audioUrl}
                                        onTimeUpdate={handleTimeUpdate}
                                        onEnded={handleAudioEnded}
                                        onLoadedMetadata={() => {
                                            if (audioRef.current) {
                                                setDuration(audioRef.current.duration)
                                            }
                                        }}
                                    />

                                    {/* Waveform visualization (simulated) */}
                                    <div className="relative h-16 bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-purple-100 dark:bg-purple-900/30"
                                            style={{ width: `${(currentTime / duration) * 100}%` }}
                                        ></div>
                                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                                            <svg className="w-full h-12" viewBox="0 0 1200 100" preserveAspectRatio="none">
                                                {/* Simulated waveform - in a real app, this would be generated from the actual audio */}
                                                {Array.from({ length: 80 }).map((_, i) => {
                                                    const height = 15 + Math.random() * 70
                                                    return (
                                                        <rect
                                                            key={i}
                                                            x={i * 15}
                                                            y={(100 - height) / 2}
                                                            width="8"
                                                            height={height}
                                                            rx="2"
                                                            fill={i * 15 < (currentTime / duration) * 1200 ? "#8b5cf6" : "#cbd5e1"}
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
                                                <Button
                                                    variant="default"
                                                    size="icon"
                                                    className="h-12 w-12 rounded-full bg-purple-500 hover:bg-purple-600"
                                                    onClick={togglePlay}
                                                    disabled={playCount >= maxPlays && hasPlayedOnce}
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
                                                                        playbackRate === rate && "bg-purple-100 dark:bg-purple-900/30",
                                                                    )}
                                                                    onClick={() => handlePlaybackRateChange(rate)}
                                                                    disabled={hasPlayedOnce}
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
                                            disabled={hasPlayedOnce}
                                        />

                                        <div className="flex items-center justify-between text-xs text-slate-500">
                                            <span>
                                                {playCount >= maxPlays && hasPlayedOnce
                                                    ? "Audio played (1/1)"
                                                    : `Plays remaining: ${maxPlays - playCount}`}
                                            </span>
                                            <span>
                                                {SAMPLE_TASK.wordCount} words • {SAMPLE_TASK.accent}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Transcript (conditionally shown) */}
                            {showTranscript && (
                                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-medium">Transcript (Practice Mode)</h3>
                                        <Button variant="outline" size="sm" onClick={() => setShowTranscript(false)} className="text-xs">
                                            <EyeOff className="h-3 w-3 mr-1" />
                                            Hide
                                        </Button>
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{SAMPLE_TASK.sentence}</p>
                                </div>
                            )}

                            {/* Recording controls */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex flex-col items-center space-y-4">
                                    {phase === "ready" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <Headphones className="h-5 w-5 text-purple-500" />
                                                <span className="font-medium">Click play to listen to the sentence</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                You can only listen once, so pay close attention
                                            </p>
                                            <div className="flex items-center justify-center gap-2 mt-3">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setShowTranscript(!showTranscript)}
                                                    className="text-xs"
                                                >
                                                    <Eye className="h-3 w-3 mr-1" />
                                                    Practice Mode (Show Transcript)
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {phase === "listening" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="font-medium text-green-600 dark:text-green-400">Listening to sentence</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Pay attention to pronunciation, stress, and intonation
                                            </p>
                                        </div>
                                    )}

                                    {phase === "recording" && (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center gap-2 mb-2">
                                                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                                                <span className="font-medium text-red-600 dark:text-red-400">Recording your repetition</span>
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                Repeat the sentence exactly as you heard it
                                            </p>
                                            <Progress
                                                value={((15 - recordingTime) / 15) * 100}
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
                                                <strong className="text-emerald-600 dark:text-emerald-400">Correct Answer:</strong><br />
                                                <p className="whitespace-pre-line">{SAMPLE_TASK.sentence}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tips" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <h3 className="font-medium text-lg mb-3">Repeat Sentence Tips</h3>
                                <ul className="space-y-3">
                                    {SAMPLE_TASK.tips.map((tip, index) => (
                                        <li key={index} className="flex gap-2">
                                            <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>{tip}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-md border border-purple-100 dark:border-purple-800">
                                    <h4 className="font-medium flex items-center gap-1 text-purple-700 dark:text-purple-300">
                                        <Lightbulb className="h-4 w-4" />
                                        Pro Tip
                                    </h4>
                                    <p className="text-sm mt-1 text-purple-700 dark:text-purple-300">
                                        Focus on chunking the sentence into meaningful phrases rather than individual words. This helps with
                                        natural rhythm and makes it easier to remember longer sentences. Practice shadowing exercises to
                                        improve your ability to repeat speech patterns accurately.
                                    </p>
                                </div>

                                <div className="mt-4">
                                    <h4 className="font-medium mb-2">Key Phrases to Listen For:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {SAMPLE_TASK.keyWords.map((phrase, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {phrase}
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
                                    <Badge variant="outline">5 comments</Badge>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                                <span className="font-medium text-purple-600 dark:text-purple-300">AM</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Alex Morgan</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1 week ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I struggle with longer sentences like this one. Any strategies for remembering all the words in
                                            the correct order?
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md ml-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <span className="font-medium text-green-600 dark:text-green-300">ST</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Sarah Thompson</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">6 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Try breaking it into chunks: "The research team discovered" / "that regular exercise significantly
                                            improves" / "cognitive function and memory retention" / "in older adults." Focus on the meaning of
                                            each chunk.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                                <span className="font-medium text-blue-600 dark:text-blue-300">RK</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Raj Kumar</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">5 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I practice with similar sentence structures at home. The more you expose yourself to academic
                                            language patterns, the easier it becomes to process and repeat them quickly.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center">
                                                <span className="font-medium text-amber-600 dark:text-amber-300">LC</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Linda Chen</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">3 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Pay attention to the stress patterns! In "significantly improves," the stress is on "sig-NIF-i-
                                            cant-ly" and "im-PROVES." Getting the rhythm right helps with memory too.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-800 flex items-center justify-center">
                                                <span className="font-medium text-teal-600 dark:text-teal-300">MR</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Maria Rodriguez</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            Don't panic if you miss a word! It's better to maintain the flow and rhythm than to stop and
                                            restart. The scoring considers overall fluency and accuracy together.
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
                                Click play to listen to the sentence (you can only listen once)
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
                            className="bg-purple-600 hover:bg-purple-700"
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
