"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
    Eye,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import rawQuestions from "./highlight-incorrect-word.json"
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar"


export default function HighlightIncorrectWordInterface() {
    const [questionNumber, setQuestionNumber] = useState(0)
    const parseExercise = (questionObj: (typeof rawQuestions)[0]) => {
        const wordList = questionObj.question.split(/\s+/)
        const incorrectWords: { index: number; correct: string }[] = []
        const cleanWords: string[] = []

        let i = 0
        while (i < wordList.length) {
            const word = wordList[i]
            const next = wordList[i + 1]
            const nextNext = wordList[i + 2]

            // Pattern: word (Answer: correct)
            if (next === "(Answer:" && nextNext && nextNext.endsWith(")")) {
                const correct = nextNext.slice(0, -1) // remove trailing ')'
                incorrectWords.push({ index: cleanWords.length, correct })
                cleanWords.push(word)
                i += 3 // skip word + (Answer: + correct)
            } else {
                cleanWords.push(word)
                i++
            }
        }

        console.log("Clean transcript:", cleanWords.join(" "))
        console.log("Incorrect words array:", incorrectWords)

        return {
            id: questionObj.id,
            title: questionObj.title,
            transcript: cleanWords.join(" "),
            audioUrl: questionObj.audio.includes("uc?id=")
                ? questionObj.audio.replace(
                    /https:\/\/drive\.google\.com\/uc\?id=([^&]+)/,
                    "https://drive.google.com/file/d/$1/preview"
                )
                : questionObj.audio,
            incorrectWords,
            difficulty: "Medium",
            category: "General",
            duration: 35,
        }
    }
    const [exercise, setExercise] = useState(parseExercise(rawQuestions[0]))

    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(exercise.duration)
    const [volume, setVolume] = useState(80)
    const [isMuted, setIsMuted] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(1)
    const [selectedWords, setSelectedWords] = useState<number[]>([])
    const [showAnswers, setShowAnswers] = useState(false)
    const [isBookmarked, setIsBookmarked] = useState(false)
    const [progress, setProgress] = useState(1)
    const [totalQuestions, setTotalQuestions] = useState(250)
    const [activeTab, setActiveTab] = useState("exercise")
    const [remainingTime, setRemainingTime] = useState(0)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [hasStarted, setHasStarted] = useState(false)
    const [hasSubmitted, setHasSubmitted] = useState(false)
    const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null)

    const audioRef = useRef<HTMLAudioElement>(null)

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

    // Handle word selection
    const toggleWordSelection = (index: number) => {
        if (hasSubmitted) return

        setSelectedWords((prev) => {
            if (prev.includes(index)) {
                return prev.filter((i) => i !== index)
            } else {
                return [...prev, index]
            }
        })
    }

    // Handle form submission
    const handleSubmit = () => {
        setHasSubmitted(true)
        setIsTimerRunning(false)

        // Calculate score
        const correctAnswers = exercise.incorrectWords.filter((word) => selectedWords.includes(word.index)).length
        const incorrectSelections = selectedWords.filter(
            (index) => !exercise.incorrectWords.some((word) => word.index === index),
        ).length

        toast.success(`You identified ${correctAnswers} of ${exercise.incorrectWords.length} with ${incorrectSelections} wrong selections.`)

        //update progress in local storage
        const prevProgress = JSON.parse(localStorage.getItem("progress") || "{}")

        const prevData = prevProgress?.listening?.["highlight-incorrect-words"] || {
            completed: 0,
            accuracy: null,
            streak: 0,
        }

        const isCurrentCorrect =
            exercise.incorrectWords.length > 0 &&
            selectedWords.length === exercise.incorrectWords.length &&
            selectedWords.every((idx) => exercise.incorrectWords.some((w) => w.index === idx))

        const isNewQuestion = exercise.id > prevData.completed

        const newCompleted = isNewQuestion ? exercise.id : prevData.completed
        const newStreak = isCurrentCorrect ? prevData.streak + 1 : 0
        const newAccuracy = isNewQuestion
            ? prevData.accuracy === null
                ? (isCurrentCorrect ? 1 : 0)
                : ((prevData.accuracy * prevData.completed) + (isCurrentCorrect ? 1 : 0)) / newCompleted
            : prevData.accuracy

        const updatedProgress = {
            ...prevProgress,
            listening: {
                ...prevProgress.listening,
                "highlight-incorrect-words": {
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
        setSelectedWords([])
        setShowAnswers(false)
        setHasSubmitted(false)
        setHasStarted(false)
        setIsTimerRunning(false)
        setRemainingTime(120)
        setCurrentWordIndex(null)
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
        toast(isBookmarked ? "Removed from bookmarks" : "Added to bookmarks", {
            description: `Exercise #${exercise.id} has been ${isBookmarked ? "removed from" : "added to"
                } your bookmarks.`,
        })
    }

    // Navigate to previous question
    const handlePrevious = () => {
        toast("Navigation", {
            description: "Previous question would be loaded here.",
        })
        setProgress((prev) => Math.max(prev - 1, 1))
    }

    // Navigate to next question
    const handleNext = () => {
        if (questionNumber + 1 < rawQuestions.length) {
            const next = questionNumber + 1
            setQuestionNumber(next)
            setExercise(parseExercise(rawQuestions[next]))
            resetExercise()
            setProgress(next + 1)
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

    // Split transcript into words
    const words = exercise.transcript.split(/\s+/)

    // Check if a word is incorrect
    const isIncorrectWord = (index: number) => {
        return exercise.incorrectWords.some((word) => word.index === index)
    }

    // Get the correct word for an incorrect word
    const getCorrectWord = (index: number) => {
        const incorrectWord = exercise.incorrectWords.find((word) => word.index === index)
        return incorrectWord ? incorrectWord.correct : words[index]
    }

    // Render transcript with interactive words
    const renderInteractiveTranscript = () => {
        return (
            <div className="text-base leading-relaxed flex flex-wrap gap-x-1">
                {words.map((word, index) => {
                    const isSelected = selectedWords.includes(index)
                    const isIncorrect = isIncorrectWord(index)
                    const isHovered = currentWordIndex === index

                    return (
                        <span
                            key={index}
                            onClick={() => toggleWordSelection(index)}
                            onMouseEnter={() => setCurrentWordIndex(index)}
                            onMouseLeave={() => setCurrentWordIndex(null)}
                            className={cn(
                                "px-0.5 py-0.5 rounded cursor-pointer transition-colors",
                                isSelected && !hasSubmitted && "bg-purple-200 dark:bg-purple-900",
                                hasSubmitted && isSelected && isIncorrect && "bg-green-200 dark:bg-green-900",
                                hasSubmitted && isSelected && !isIncorrect && "bg-red-200 dark:bg-red-900",
                                hasSubmitted && !isSelected && isIncorrect && "bg-amber-200 dark:bg-amber-900",
                                hasSubmitted &&
                                showAnswers &&
                                isIncorrect &&
                                "underline decoration-red-500 decoration-wavy underline-offset-4",
                                !hasSubmitted && isHovered && "bg-slate-100 dark:bg-slate-700"
                            )}
                        >
                            {word}
                            {hasSubmitted && showAnswers && isIncorrect && (
                                <span className="text-xs text-green-600 dark:text-green-400 ml-1 font-medium">
                                    ({getCorrectWord(index)})
                                </span>
                            )}
                        </span>
                    )
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
                questionType="Highlight Incorrect Word"
                instruction={`Click the words in the transcript that are different from the audio. The incorrect words(which are supposed to be choosed by students) in the transcript are: ${exercise.incorrectWords.map(w => words[w.index]).join(", ")}`}
                passage={rawQuestions[questionNumber].question}
                userResponse={selectedWords.map((i) => words[i]).join(", ")}
            />
            <Card className="shadow-lg border-t-4 border-t-purple-500 dark:border-t-purple-400">
                <CardHeader className="pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">Highlight Incorrect Word</h1>
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
                                        Listen to the audio and click on words in the transcript that are different from what you hear. You
                                        have 2 minutes to complete this task.
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
                                You will hear a recording. Below is a transcription of the recording. Some words in the transcription
                                differ from what the speaker(s) said. As you listen, click on the words that are different.
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
                            <iframe
                                src={exercise.audioUrl}
                                width="100%"
                                height="60"
                                allow="autoplay"
                                title={`Audio for ${exercise.title}`}
                                className="rounded-md border"
                            />

                            {/* Interactive transcript */}
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="mb-3 flex justify-between items-center">
                                    <h3 className="font-medium">Transcript</h3>
                                    {hasSubmitted && (
                                        <Badge
                                            variant={showAnswers ? "outline" : "secondary"}
                                            className="cursor-pointer"
                                            onClick={() => setShowAnswers(!showAnswers)}
                                        >
                                            {showAnswers ? "Hiding Corrections" : "Show Corrections"}
                                        </Badge>
                                    )}
                                </div>
                                {renderInteractiveTranscript()}
                                {!hasSubmitted && (
                                    <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                        <Info className="h-4 w-4" />
                                        <span>Click on words that sound different from what you hear.</span>
                                    </div>
                                )}
                            </div>

                            {/* Selected words summary */}
                            {selectedWords.length > 0 && !hasSubmitted && (
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg border border-purple-100 dark:border-purple-800">
                                    <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">Selected Words:</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedWords.map((index) => (
                                            <Badge
                                                key={index}
                                                variant="secondary"
                                                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 cursor-pointer"
                                                onClick={() => toggleWordSelection(index)}
                                            >
                                                {words[index]} <span className="ml-1 text-xs">×</span>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Results summary */}
                            {hasSubmitted && (
                                <div
                                    className={cn(
                                        "p-3 rounded-lg border",
                                        selectedWords.some((index) => isIncorrectWord(index))
                                            ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800"
                                            : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800",
                                    )}
                                >
                                    <h3
                                        className={cn(
                                            "text-sm font-medium mb-2",
                                            selectedWords.some((index) => isIncorrectWord(index))
                                                ? "text-green-700 dark:text-green-300"
                                                : "text-red-700 dark:text-red-300",
                                        )}
                                    >
                                        Results:
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2
                                                className={cn(
                                                    "h-5 w-5",
                                                    selectedWords.some((index) => isIncorrectWord(index)) ? "text-green-500" : "text-slate-400",
                                                )}
                                            />
                                            <span>
                                                You identified{" "}
                                                <strong>
                                                    {exercise.incorrectWords.filter((word) => selectedWords.includes(word.index)).length}
                                                </strong>{" "}
                                                out of <strong>{exercise.incorrectWords.length}</strong> incorrect words.
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <AlertCircle
                                                className={cn(
                                                    "h-5 w-5",
                                                    selectedWords.filter(
                                                        (index) => !exercise.incorrectWords.some((word) => word.index === index),
                                                    ).length > 0
                                                        ? "text-red-500"
                                                        : "text-slate-400",
                                                )}
                                            />
                                            <span>
                                                You made{" "}
                                                <strong>
                                                    {
                                                        selectedWords.filter(
                                                            (index) => !exercise.incorrectWords.some((word) => word.index === index),
                                                        ).length
                                                    }
                                                </strong>{" "}
                                                incorrect selections.
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="tips" className="mt-0">
                            <div className="min-h-[300px] border rounded-md p-4 bg-white dark:bg-slate-900 overflow-y-auto">
                                <h3 className="font-medium text-lg mb-3">Highlight Incorrect Word Tips</h3>
                                <ul className="space-y-3">
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Listen carefully to each word and compare it with what you see in the transcript.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Pay attention to similar-sounding words (e.g., "affect" vs "effect", "their" vs "there").
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>
                                            Focus on content words (nouns, verbs, adjectives) as they are more likely to be changed.
                                        </span>
                                    </li>
                                    <li className="flex gap-2">
                                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>Use the context to help identify words that don't make sense in the sentence.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span>Don't select words just because they're pronounced differently than you expected.</span>
                                    </li>
                                    <li className="flex gap-2">
                                        <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <span>Be careful with proper nouns and technical terms that might be unfamiliar to you.</span>
                                    </li>
                                </ul>

                                <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/30 rounded-md border border-purple-100 dark:border-purple-800">
                                    <h4 className="font-medium flex items-center gap-1 text-purple-700 dark:text-purple-300">
                                        <Lightbulb className="h-4 w-4" />
                                        Pro Tip
                                    </h4>
                                    <p className="text-sm mt-1 text-purple-700 dark:text-purple-300">
                                        If you're unsure about a word, listen to that section again at a slower speed. The incorrect words
                                        often have a similar sound or meaning to the correct ones, so listen for subtle differences.
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
                                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                                                <span className="font-medium text-purple-600 dark:text-purple-300">EM</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Emily M.</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">3 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I found "discovered" and "contain" to be the incorrect words. The speaker actually said "found"
                                            and "consume" instead.
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                                                <span className="font-medium text-blue-600 dark:text-blue-300">RJ</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Ryan J.</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">2 days ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            I almost missed "contain" because it sounds similar to "consume". This is tricky!
                                        </p>
                                    </div>

                                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                                                <span className="font-medium text-green-600 dark:text-green-300">LT</span>
                                            </div>
                                            <div>
                                                <p className="font-medium">Lisa T.</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">1 day ago</p>
                                            </div>
                                        </div>
                                        <p className="text-sm">
                                            A tip that helped me: I slowed down the playback to 0.75x for the parts I was unsure about. It
                                            made it much easier to catch the differences.
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
                            <Button variant="outline" size="sm" onClick={() => setShowAnswers(!showAnswers)}>
                                <Eye className="h-4 w-4 mr-2" />
                                {showAnswers ? "Hide Corrections" : "Show Corrections"}
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
                            className="bg-purple-600 hover:bg-purple-700"
                            disabled={hasSubmitted || selectedWords.length === 0}
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
