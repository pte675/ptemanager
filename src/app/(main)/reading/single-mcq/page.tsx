"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Check, X, ChevronRight, ChevronLeft, RotateCcw, Bookmark, BookmarkCheck, Award, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import rawQuestions from "./single-mcq.json"
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar"

interface Question {
    id: number
    category: string
    text: string
    context?: string
    options: {
        id: string
        text: string
    }[]
    correctAnswer: string
    explanation?: string
}


const showTimer = true
const timePerQuestion = 120

const sampleQuestions: Question[] = rawQuestions.map((q: any) => {
    const optionRegex = /\n([a-z])\)\s(.*?)(?=\n[a-z]\)|$)/gis
    const options: { id: string; text: string }[] = []

    let match
    while ((match = optionRegex.exec(q.question)) !== null) {
        options.push({ id: match[1], text: match[2].trim() })
    }

    const questionText = q.question.split(/\na\)/)[0].trim()

    const correctAnswer = q.answer
        .toLowerCase()
        .trim()
        .match(/[a-z]/)?.[0] || ""

    return {
        id: q.id,
        category: q.title || "General",
        text: questionText,
        context: q.content || "",
        options,
        correctAnswer,
        explanation: q.explanation || "",
    }
})

export default function EnhancedQuiz() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({})
    const [isBookmarked, setIsBookmarked] = useState<Record<number, boolean>>({})
    const [timeLeft, setTimeLeft] = useState(timePerQuestion)
    const [isCompleted, setIsCompleted] = useState(false)

    const questions: Question[] = sampleQuestions

    const currentQuestion = questions[currentIndex]
    const totalQuestions = questions.length
    const progress = ((currentIndex + 1) / totalQuestions) * 100

    // Timer effect
    useEffect(() => {
        if (!showTimer || isAnswerSubmitted || isCompleted) return

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer)
                    handleSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [currentIndex, isAnswerSubmitted, showTimer, isCompleted])

    // Reset timer when moving to next question
    useEffect(() => {
        setTimeLeft(timePerQuestion)
    }, [currentIndex, timePerQuestion])

    const handleOptionSelect = (optionId: string) => {
        if (isAnswerSubmitted) return
        setSelectedAnswer(optionId)
    }

    const handleSubmit = () => {
        if (!selectedAnswer && !isAnswerSubmitted) return

        setIsAnswerSubmitted(true)
        setUserAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: selectedAnswer || "",
        }))


        // Update local storage with progress
        const isCurrentQuestionRight = selectedAnswer === currentQuestion.correctAnswer
        const prevProgress = JSON.parse(localStorage.getItem("progress") || "{}")

        const prevData = prevProgress?.reading?.["single-mcq"] || {
            completed: 0,
            accuracy: null,
            streak: 0,
        }

        const isNewQuestion = currentQuestion.id > prevData.completed
        const newCompleted = isNewQuestion ? currentQuestion.id : prevData.completed
        const newStreak = isCurrentQuestionRight ? prevData.streak + 1 : 0
        const newAccuracy = isNewQuestion
            ? prevData.accuracy === null
                ? (isCurrentQuestionRight ? 1 : 0)
                : ((prevData.accuracy * prevData.completed) + (isCurrentQuestionRight ? 1 : 0)) / newCompleted
            : prevData.accuracy

        const updatedProgress = {
            ...prevProgress,
            reading: {
                ...prevProgress.reading,
                "single-mcq": {
                    completed: newCompleted,
                    accuracy: parseFloat(newAccuracy.toFixed(2)),
                    streak: newStreak,
                },
            },
        }

        localStorage.setItem("progress", JSON.stringify(updatedProgress))
    }

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(currentIndex + 1)
            setSelectedAnswer(null)
            setIsAnswerSubmitted(false)
        } else if (!isCompleted) {
            setIsCompleted(true)
            const correctCount = Object.entries(userAnswers).reduce((count, [questionId, answer]) => {
                const question = questions.find((q) => q.id.toString() === questionId)
                return question && question.correctAnswer === answer ? count + 1 : count
            }, 0)

            // onComplete?.({
            //     correct: correctCount,
            //     total: totalQuestions,
            //     answers: userAnswers,
            // })
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
            setSelectedAnswer(userAnswers[currentQuestion.id] || null)
            setIsAnswerSubmitted(!!userAnswers[currentQuestion.id])
        }
    }

    const handleRestart = () => {
        setCurrentIndex(0)
        setSelectedAnswer(null)
        setIsAnswerSubmitted(false)
        setUserAnswers({})
        setIsCompleted(false)
        setTimeLeft(timePerQuestion)
    }

    const toggleBookmark = () => {
        setIsBookmarked((prev) => ({
            ...prev,
            [currentQuestion.id]: !prev[currentQuestion.id],
        }))
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`
    }

    if (isCompleted) {
        const correctCount = Object.entries(userAnswers).reduce((count, [questionId, answer]) => {
            const question = questions.find((q) => q.id.toString() === questionId)
            return question && question.correctAnswer === answer ? count + 1 : count
        }, 0)

        const score = Math.round((correctCount / totalQuestions) * 100)

        return (
            <Card className="w-full max-w-3xl mx-auto shadow-lg">
                <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl">
                    <CardTitle className="text-3xl font-bold">Quiz Completed!</CardTitle>
                    <CardDescription className="text-white/90 text-lg">Here's how you did</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative w-48 h-48">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-bold">{score}%</span>
                            </div>
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke={score > 70 ? "#10b981" : score > 40 ? "#f59e0b" : "#ef4444"}
                                    strokeWidth="10"
                                    strokeDasharray={`${score * 2.83} 283`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-xl mb-2">
                                You got <span className="font-bold">{correctCount}</span> out of{" "}
                                <span className="font-bold">{totalQuestions}</span> questions correct
                            </p>
                            <p className="text-muted-foreground">
                                {score >= 80
                                    ? "Excellent work! You've mastered this topic."
                                    : score >= 60
                                        ? "Good job! You have a solid understanding."
                                        : score >= 40
                                            ? "Not bad! Keep studying to improve."
                                            : "Keep practicing! You'll get better with time."}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-6">
                            <Button variant="outline" className="flex items-center gap-2" onClick={handleRestart}>
                                <RotateCcw className="w-4 h-4" />
                                Restart Quiz
                            </Button>
                            <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                                <Award className="w-4 h-4" />
                                View Certificate
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <AIChatSidebar
                section="PTE Reading"
                questionType="Single Answer Multiple Choice"
                instruction={`Only one option is correct per question. The correct answer for this question is: ${currentQuestion.correctAnswer
                    }) ${currentQuestion.options.find(o => o.id === currentQuestion.correctAnswer)?.text}`}
                passage={`${currentQuestion.context}\n\nQuestion:\n${currentQuestion.text}\n\nOptions:\n${currentQuestion.options
                    .map(o => `${o.id}) ${o.text}`)
                    .join("\n")}`}
                userResponse={
                    selectedAnswer
                        ? `${selectedAnswer}) ${currentQuestion.options.find(o => o.id === selectedAnswer)?.text}`
                        : "No answer selected"
                }
            />
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-black dark:to-black p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                            Interactive Learning Platform
                        </h1>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Test your knowledge with our enhanced quiz experience featuring interactive elements, detailed explanations,
                            and real-time feedback.
                        </p>
                    </header>
                    <Card className="w-full max-w-3xl mx-auto shadow-lg">
                        <CardHeader className="relative border-b">
                            <div className="flex justify-between items-center">
                                <Badge variant="outline" className="px-3 py-1 text-sm">
                                    {currentQuestion.category}
                                </Badge>
                                <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className="px-3 py-1">
                                        {currentIndex + 1}/{totalQuestions}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={toggleBookmark}
                                        className="text-muted-foreground hover:text-primary"
                                    >
                                        {isBookmarked[currentQuestion.id] ? (
                                            <BookmarkCheck className="w-5 h-5 text-primary" />
                                        ) : (
                                            <Bookmark className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <Progress value={progress} className="h-1 absolute bottom-0 left-0 right-0" />
                        </CardHeader>

                        <CardContent className="p-6">
                            <div className="space-y-6">
                                {showTimer && (
                                    <div className="flex justify-end">
                                        <Badge
                                            variant={timeLeft < 10 ? "destructive" : "outline"}
                                            className={cn("px-3 py-1 flex items-center gap-1", timeLeft < 10 && "animate-pulse")}
                                        >
                                            <Clock className="w-4 h-4" />
                                            {formatTime(timeLeft)}
                                        </Badge>
                                    </div>
                                )}

                                {currentQuestion.context && (
                                    <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed">{currentQuestion.context}</div>
                                )}

                                <h3 className="text-xl font-semibold leading-tight">{currentQuestion.text}</h3>

                                <div className="space-y-3 pt-2">
                                    <AnimatePresence>
                                        {currentQuestion.options.map((option) => (
                                            <motion.div
                                                key={option.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div
                                                    className={cn(
                                                        "border rounded-lg p-4 cursor-pointer transition-all",
                                                        selectedAnswer === option.id && !isAnswerSubmitted && "border-primary ring-1 ring-primary",
                                                        isAnswerSubmitted &&
                                                        option.id === currentQuestion.correctAnswer &&
                                                        "bg-green-50 border-green-500",
                                                        isAnswerSubmitted &&
                                                        selectedAnswer === option.id &&
                                                        option.id !== currentQuestion.correctAnswer &&
                                                        "bg-red-50 border-red-500",
                                                        isAnswerSubmitted &&
                                                        option.id !== currentQuestion.correctAnswer &&
                                                        option.id !== selectedAnswer &&
                                                        "opacity-60",
                                                        !isAnswerSubmitted && "hover:border-primary hover:bg-muted/30",
                                                    )}
                                                    onClick={() => handleOptionSelect(option.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div
                                                            className={cn(
                                                                "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border",
                                                                selectedAnswer === option.id && !isAnswerSubmitted && "border-primary text-primary",
                                                                isAnswerSubmitted &&
                                                                option.id === currentQuestion.correctAnswer &&
                                                                "bg-green-500 border-green-500 text-white",
                                                                isAnswerSubmitted &&
                                                                selectedAnswer === option.id &&
                                                                option.id !== currentQuestion.correctAnswer &&
                                                                "bg-red-500 border-red-500 text-white",
                                                            )}
                                                        >
                                                            {isAnswerSubmitted && option.id === currentQuestion.correctAnswer && (
                                                                <Check className="w-4 h-4" />
                                                            )}
                                                            {isAnswerSubmitted &&
                                                                selectedAnswer === option.id &&
                                                                option.id !== currentQuestion.correctAnswer && <X className="w-4 h-4" />}
                                                            {(!isAnswerSubmitted ||
                                                                (isAnswerSubmitted &&
                                                                    option.id !== currentQuestion.correctAnswer &&
                                                                    option.id !== selectedAnswer)) &&
                                                                option.id}
                                                        </div>
                                                        <span className="text-base">{option.text}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>

                                {isAnswerSubmitted && currentQuestion.explanation && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        className="bg-muted/50 p-4 rounded-lg mt-4"
                                    >
                                        <h4 className="font-medium mb-1">Explanation:</h4>
                                        <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                                    </motion.div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="flex justify-between p-6 pt-2">
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentIndex === 0}
                                className="flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Previous
                            </Button>

                            <div className="flex gap-2">
                                {!isAnswerSubmitted ? (
                                    <Button onClick={handleSubmit} disabled={!selectedAnswer}>
                                        Submit Answer
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleNext}
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 flex items-center gap-1"
                                    >
                                        {currentIndex < totalQuestions - 1 ? (
                                            <>
                                                Next <ChevronRight className="w-4 h-4" />
                                            </>
                                        ) : (
                                            "Finish Quiz"
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    )
}
