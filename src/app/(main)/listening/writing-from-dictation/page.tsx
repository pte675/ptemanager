"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Bookmark,
    ChevronLeft,
    ChevronRight,
    RotateCcw,
    CheckCircle2,
    Settings,
    HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import rawQuesitons from "./writing-from-dictation.json"


export default function DictationExercise() {
    const mockExercises = rawQuesitons.map((q) => ({
        id: `WFD-${q.id}`,
        text: q.question,
        audio: q.audio,
    }))

    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
    const [response, setResponse] = useState("")
    const [isPlaying, setIsPlaying] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [voiceType, setVoiceType] = useState("us-male")
    const [autoPlay, setAutoPlay] = useState(false)
    const [showHints, setShowHints] = useState(false)
    const [playCount, setPlayCount] = useState(0)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [accuracy, setAccuracy] = useState(0)

    const audioRef = useRef<HTMLAudioElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const animationRef = useRef<number>()

    const currentExercise = mockExercises[currentExerciseIndex]
    const wordCount = response.trim() === "" ? 0 : response.trim().split(/\s+/).length
    const progress = ((currentExerciseIndex + 1) / mockExercises.length) * 100

    // Initialize audio context and analyzer
    useEffect(() => {
        if (!audioRef.current) return

        const audio = audioRef.current
        audio.addEventListener("timeupdate", updateTime)
        audio.addEventListener("loadedmetadata", () => {
            setDuration(audio.duration)
        })
        audio.addEventListener("ended", () => {
            setIsPlaying(false)
            setPlayCount((prev) => prev + 1)
        })

        // Canvas visualization setup would go here in a real implementation

        return () => {
            audio.removeEventListener("timeupdate", updateTime)
            audio.removeEventListener("loadedmetadata", () => { })
            audio.removeEventListener("ended", () => { })
            cancelAnimationFrame(animationRef.current!)
        }
    }, [])

    // Format time to MM:SS
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    const updateTime = () => {
        if (!audioRef.current) return
        setCurrentTime(audioRef.current.currentTime)
    }

    const togglePlay = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
        } else {
            audioRef.current.play()
        }
        setIsPlaying(!isPlaying)
    }

    const handlePlaybackRateChange = (value: number[]) => {
        if (!audioRef.current) return
        const rate = value[0]
        setPlaybackRate(rate)
        audioRef.current.playbackRate = rate
    }

    const handleVolumeChange = (value: number[]) => {
        if (!audioRef.current) return
        const vol = value[0]
        setVolume(vol)
        audioRef.current.volume = vol / 100
        if (vol === 0) {
            setIsMuted(true)
        } else {
            setIsMuted(false)
        }
    }

    const toggleMute = () => {
        if (!audioRef.current) return

        if (isMuted) {
            audioRef.current.volume = volume / 100
        } else {
            audioRef.current.volume = 0
        }
        setIsMuted(!isMuted)
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!audioRef.current) return
        const seekTime = Number.parseFloat(e.target.value)
        audioRef.current.currentTime = seekTime
        setCurrentTime(seekTime)
    }

    const handleNext = () => {
        if (currentExerciseIndex < mockExercises.length - 1) {
            setCurrentExerciseIndex(currentExerciseIndex + 1)
            resetExercise()
        }
    }

    const handlePrevious = () => {
        if (currentExerciseIndex > 0) {
            setCurrentExerciseIndex(currentExerciseIndex - 1)
            resetExercise()
        }
    }

    const resetExercise = () => {
        setResponse("")
        setShowAnswer(false)
        setIsPlaying(false)
        setCurrentTime(0)
        setPlayCount(0)
        setIsSubmitted(false)
        if (audioRef.current) {
            audioRef.current.currentTime = 0
        }
        if (textareaRef.current) {
            textareaRef.current.focus()
        }
    }

    const handleRestart = () => {
        resetExercise()
    }

    const handleSubmit = () => {
        setIsSubmitted(true)

        // Calculate accuracy (simplified version)
        const correctWords = currentExercise.text.toLowerCase().split(/\s+/)
        const userWords = response.toLowerCase().split(/\s+/)

        let correctCount = 0
        userWords.forEach((word, index) => {
            if (index < correctWords.length && word === correctWords[index]) {
                correctCount++
            }
        })

        const calculatedAccuracy = correctWords.length > 0 ? Math.round((correctCount / correctWords.length) * 100) : 0

        setAccuracy(calculatedAccuracy)
    }

    const toggleBookmark = () => {
        setIsBookmarked(!isBookmarked)
    }

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="text-2xl font-bold">Write From Dictation</CardTitle>
                        <CardDescription className="text-blue-100 mt-1">
                            Listen carefully and transcribe what you hear
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white hover:bg-blue-600">
                                        <HelpCircle className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Help & Instructions</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-white hover:bg-blue-600">
                                        <Settings className="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Settings</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-sm font-medium">
                                {currentExercise.id}
                            </Badge>
                            <Badge
                                variant={isBookmarked ? "default" : "outline"}
                                className={cn("cursor-pointer", isBookmarked ? "bg-amber-500 hover:bg-amber-600" : "")}
                                onClick={toggleBookmark}
                            >
                                <Bookmark className="h-3.5 w-3.5 mr-1" />
                                {isBookmarked ? "Bookmarked" : "Bookmark"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={voiceType} onValueChange={setVoiceType}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Voice" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="us-male">US Male</SelectItem>
                                    <SelectItem value="us-female">US Female</SelectItem>
                                    <SelectItem value="uk-male">UK Male</SelectItem>
                                    <SelectItem value="uk-female">UK Female</SelectItem>
                                    <SelectItem value="au-male">AU Male</SelectItem>
                                    <SelectItem value="au-female">AU Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border">
                        <h3 className="text-lg font-semibold mb-2">Instructions:</h3>
                        <p className="text-slate-700 dark:text-slate-300">
                            You will hear a sentence. Type the sentence in the box below exactly as you hear it. Write as much of the
                            sentence as you can. You will hear the sentence only once.
                        </p>
                    </div>

                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4 border">
                        <div className="flex flex-col space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={togglePlay}
                                        disabled={playCount >= 1 && !showAnswer}
                                        className={cn(
                                            "h-12 w-12 rounded-full",
                                            isPlaying
                                                ? "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300"
                                                : "bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300",
                                        )}
                                    >
                                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                    </Button>
                                    <div>
                                        <div className="text-sm font-medium">{playCount > 0 ? "Played" : "Ready to play"}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400">
                                            {playCount > 0 ? `${playCount}/1 times` : "Press play to listen"}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPlaybackRate(1)}
                                                    className={cn(
                                                        "text-xs font-mono",
                                                        playbackRate === 1 ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" : "",
                                                    )}
                                                >
                                                    {playbackRate.toFixed(2)}X
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Playback Speed</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>

                                    <div className="w-24 hidden sm:block">
                                        <Slider
                                            value={[playbackRate]}
                                            min={0.5}
                                            max={2}
                                            step={0.05}
                                            onValueChange={handlePlaybackRateChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="relative">
                                <canvas ref={canvasRef} className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-md" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-full px-4">
                                        <div className="relative w-full">
                                            <div className="h-1 w-full bg-slate-300 dark:bg-slate-600 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-100"
                                                    style={{ width: `${(currentTime / duration) * 100}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                <span>{formatTime(currentTime)}</span>
                                                <span>{formatTime(duration)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                                        {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                                    </Button>
                                    <div className="w-24">
                                        <Slider
                                            value={[volume]}
                                            min={0}
                                            max={100}
                                            step={1}
                                            onValueChange={handleVolumeChange}
                                            disabled={isMuted}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <div className="flex items-center space-x-2">
                                        <Switch id="auto-play" checked={autoPlay} onCheckedChange={setAutoPlay} />
                                        <Label htmlFor="auto-play" className="text-sm">
                                            Auto-play
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <Label htmlFor="response" className="text-base font-medium">
                                Your Response
                            </Label>
                            <div className="text-sm text-slate-500 dark:text-slate-400">Word count: {wordCount}</div>
                        </div>
                        <Textarea
                            id="response"
                            ref={textareaRef}
                            placeholder="Type your response here..."
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            className="min-h-[120px] text-base"
                            disabled={isSubmitted}
                        />

                        {isSubmitted && (
                            <div
                                className={cn(
                                    "p-4 rounded-md mt-4",
                                    accuracy >= 80
                                        ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                        : accuracy >= 50
                                            ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                            : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
                                )}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="font-medium flex items-center gap-1">
                                        <CheckCircle2 className="h-4 w-4" />
                                        <span>Accuracy: {accuracy}%</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setShowAnswer(!showAnswer)} className="text-xs">
                                        {showAnswer ? "Hide Answer" : "Show Answer"}
                                    </Button>
                                </div>

                                {showAnswer && (
                                    <div className="text-sm mt-2 p-2 bg-white/50 dark:bg-black/20 rounded border">
                                        <div className="font-medium mb-1">Correct Answer:</div>
                                        <p>{currentExercise.text}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t p-6">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        onClick={handlePrevious}
                        disabled={currentExerciseIndex === 0}
                        className="flex-1 sm:flex-none"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                    </Button>
                    <Button variant="outline" onClick={handleRestart} className="flex-1 sm:flex-none">
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restart
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleNext}
                        disabled={currentExerciseIndex === mockExercises.length - 1}
                        className="flex-1 sm:flex-none"
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" onClick={() => setShowAnswer(!showAnswer)} className="flex-1 sm:flex-none">
                        {showAnswer ? "Hide Answer" : "Show Answer"}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={response.trim() === "" || isSubmitted}
                        className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700"
                    >
                        Submit
                    </Button>
                </div>
            </CardFooter>

            <div className="px-6 pb-6">
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                    <span>Progress</span>
                    <span>
                        {currentExerciseIndex + 1}/{mockExercises.length}
                    </span>
                </div>
                <Progress value={progress} className="h-2" />
            </div>

            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                src={currentExercise.audio} // This would be a real audio file in production
                preload="auto"
            />
        </Card>
    )
}
