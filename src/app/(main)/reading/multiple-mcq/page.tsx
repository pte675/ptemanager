"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, ChevronLeft, RotateCcw, Award, Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import rawQuestions from "./multiple-mcq.json"

interface Option {
    id: string
    text: string
}

interface Question {
    id: number
    category: string
    text: string
    context?: string
    options: Option[]
    correctAnswers: string[] // Array of correct option IDs
    explanation?: string
    minRequired?: number // Minimum number of options that must be selected
}


// Sample questions for demo
const sampleQuestions: Question[] = rawQuestions.map((q: any) => {
    // Extract question + options
    const [questionText, ...optionParts] = q.question.split(/\na\)|\nb\)|\nc\)|\nd\)|\ne\)/).map((t: string) => t.trim())
    const optionsRaw = q.question.match(/\na\)(.*?)\nb\)(.*?)\nc\)(.*?)\nd\)(.*?)\ne\)(.*)/s)

    // Extract correct answer keys from the answer string
    const correctAnswers = [...q.answer.matchAll(/([a-e])\)/gi)].map(match => match[1].toLowerCase())
    return {
        id: q.id,
        category: q.title || "General",
        text: questionText,
        context: q.content || "",
        options: [
            { id: "a", text: optionsRaw?.[1]?.trim() || "" },
            { id: "b", text: optionsRaw?.[2]?.trim() || "" },
            { id: "c", text: optionsRaw?.[3]?.trim() || "" },
            { id: "d", text: optionsRaw?.[4]?.trim() || "" },
            { id: "e", text: optionsRaw?.[5]?.trim() || "" }
        ],
        correctAnswers,
        explanation: q.explanation || "",
        minRequired: 2 // default value, or you can derive from question type
    }
})

const showTimer = true
const timePerQuestion = 120

export default function MultiSelectQuiz() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
    const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false)
    const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({})
    const [timeLeft, setTimeLeft] = useState(timePerQuestion)
    const [isCompleted, setIsCompleted] = useState(false)
    const [score, setScore] = useState<Record<number, number>>({})

    const questions: Question[] = sampleQuestions

    const currentQuestion = questions[currentIndex]
    const totalQuestions = questions.length
    const progress = ((currentIndex + 1) / totalQuestions) * 100
    const minRequired = currentQuestion.minRequired || 1

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

        // Load previous answers if navigating back
        if (userAnswers[currentQuestion.id]) {
            setSelectedAnswers(userAnswers[currentQuestion.id])
            setIsAnswerSubmitted(true)
        } else {
            setSelectedAnswers([])
            setIsAnswerSubmitted(false)
        }
    }, [currentIndex, timePerQuestion, currentQuestion.id, userAnswers])

    const handleOptionToggle = (optionId: string) => {
        if (isAnswerSubmitted) return

        setSelectedAnswers((prev) => {
            if (prev.includes(optionId)) {
                return prev.filter((id) => id !== optionId)
            } else {
                return [...prev, optionId]
            }
        })
    }

    const calculateScore = (selected: string[], correct: string[]): number => {
        // Count correct selections
        const correctSelections = selected.filter((id) => correct.includes(id)).length

        // Count incorrect selections (false positives)
        const incorrectSelections = selected.filter((id) => !correct.includes(id)).length

        // Count missed correct answers (false negatives)
        const missedCorrect = correct.filter((id) => !selected.includes(id)).length

        // Calculate total possible points (number of correct answers)
        const totalPossible = correct.length

        // Calculate score: start with correct selections, penalize for incorrect ones
        // but ensure score doesn't go below 0
        const rawScore = correctSelections - incorrectSelections
        const finalScore = Math.max(0, rawScore) / totalPossible

        return Math.round(finalScore * 100)
    }

    const handleSubmit = () => {
        if (selectedAnswers.length < minRequired && !isAnswerSubmitted) return

        setIsAnswerSubmitted(true)

        const questionScore = calculateScore(selectedAnswers, currentQuestion.correctAnswers)

        setScore((prev) => ({
            ...prev,
            [currentQuestion.id]: questionScore,
        }))

        setUserAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: selectedAnswers,
        }))
    }

    const handleNext = () => {
        if (currentIndex < totalQuestions - 1) {
            setCurrentIndex(currentIndex + 1)
        } else if (!isCompleted) {
            setIsCompleted(true)

            // Calculate overall score
            const totalScore = Object.values(score).reduce((sum, questionScore) => sum + questionScore, 0)
            const averageScore = Math.round(totalScore / totalQuestions)

            // onComplete?.({
            //     correct: totalScore,
            //     total: totalQuestions * 100,
            //     answers: userAnswers,
            // })
        }
    }

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1)
        }
    }

    const handleRestart = () => {
        setCurrentIndex(0)
        setSelectedAnswers([])
        setIsAnswerSubmitted(false)
        setUserAnswers({})
        setIsCompleted(false)
        setTimeLeft(timePerQuestion)
        setScore({})
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`
    }

    if (isCompleted) {
        const totalScore = Object.values(score).reduce((sum, questionScore) => sum + questionScore, 0)
        const averageScore = Math.round(totalScore / totalQuestions)

        return (
            <Card className="w-full max-w-3xl mx-auto shadow-lg">
                <CardHeader className="text-center bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-t-xl">
                    <CardTitle className="text-3xl font-bold">Quiz Completed!</CardTitle>
                    <CardDescription className="text-white/90 text-lg">Here's how you did</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="relative w-48 h-48">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-4xl font-bold">{averageScore}%</span>
                            </div>
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke={averageScore > 70 ? "#10b981" : averageScore > 40 ? "#f59e0b" : "#ef4444"}
                                    strokeWidth="10"
                                    strokeDasharray={`${averageScore * 2.83} 283`}
                                    strokeDashoffset="0"
                                    transform="rotate(-90 50 50)"
                                />
                            </svg>
                        </div>
                        <div className="text-center">
                            <p className="text-xl mb-2">
                                Your average score: <span className="font-bold">{averageScore}%</span>
                            </p>
                            <p className="text-muted-foreground">
                                {averageScore >= 80
                                    ? "Excellent work! You've mastered this topic."
                                    : averageScore >= 60
                                        ? "Good job! You have a solid understanding."
                                        : averageScore >= 40
                                            ? "Not bad! Keep studying to improve."
                                            : "Keep practicing! You'll get better with time."}
                            </p>
                        </div>

                        <div className="w-full mt-4">
                            <h3 className="font-medium text-lg mb-3">Question Breakdown:</h3>
                            <div className="space-y-3">
                                {questions.map((question, idx) => (
                                    <div key={question.id} className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        score[question.id] > 70
                                                            ? "bg-green-500"
                                                            : score[question.id] > 40
                                                                ? "bg-amber-500"
                                                                : "bg-red-500",
                                                    )}
                                                    style={{ width: `${score[question.id] || 0}%` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-shrink-0 w-12 text-right font-medium">{score[question.id] || 0}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mt-6">
                            <Button variant="outline" className="flex items-center gap-2" onClick={handleRestart}>
                                <RotateCcw className="w-4 h-4" />
                                Restart Quiz
                            </Button>
                            <Button className="flex items-center gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600">
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
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600 mb-2">
                        Multiple Select Quiz Platform
                    </h1>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        Test your knowledge with our advanced multiple-choice quiz where you can select multiple correct answers for
                        each question.
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
                            </div>
                        </div>
                        <Progress value={progress} className="h-1 absolute bottom-0 left-0 right-0" />
                    </CardHeader>

                    <CardContent className="p-6">
                        <div className="space-y-6">
                            {showTimer && (
                                <div className="flex justify-end">
                                    <Badge
                                        variant={timeLeft < 20 ? "destructive" : "outline"}
                                        className={cn("px-3 py-1 flex items-center gap-1", timeLeft < 20 && "animate-pulse")}
                                    >
                                        <Clock className="w-4 h-4" />
                                        {formatTime(timeLeft)}
                                    </Badge>
                                </div>
                            )}

                            <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-violet-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-medium text-violet-700">Multiple Select Question</p>
                                    <p className="text-sm text-violet-600">
                                        Select {currentQuestion.correctAnswers.length > 1 ? "all" : "the"} correct{" "}
                                        {currentQuestion.correctAnswers.length > 1 ? "answers" : "answer"}.
                                        {/* {currentQuestion.minRequired > 1 && ` (At least ${currentQuestion.minRequired} selections required)`} */}
                                    </p>
                                </div>
                            </div>

                            {currentQuestion.context && (
                                <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed">{currentQuestion.context}</div>
                            )}

                            <h3 className="text-xl font-semibold leading-tight">{currentQuestion.text}</h3>

                            <div className="space-y-3 pt-2">
                                <AnimatePresence>
                                    {currentQuestion.options.map((option) => {
                                        const isSelected = selectedAnswers.includes(option.id)
                                        const isCorrect = currentQuestion.correctAnswers.includes(option.id)

                                        return (
                                            <motion.div
                                                key={option.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div
                                                    className={cn(
                                                        "border rounded-lg p-4 cursor-pointer transition-all",
                                                        isSelected && !isAnswerSubmitted && "border-primary ring-1 ring-primary bg-primary/5",
                                                        isAnswerSubmitted && isCorrect && "bg-green-50 border-green-500",
                                                        isAnswerSubmitted && isSelected && !isCorrect && "bg-red-50 border-red-500",
                                                        !isAnswerSubmitted && "hover:border-primary hover:bg-muted/30",
                                                    )}
                                                    onClick={() => handleOptionToggle(option.id)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onCheckedChange={() => handleOptionToggle(option.id)}
                                                            disabled={isAnswerSubmitted}
                                                            className={cn(
                                                                isAnswerSubmitted &&
                                                                isCorrect &&
                                                                "border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white",
                                                                isAnswerSubmitted &&
                                                                isSelected &&
                                                                !isCorrect &&
                                                                "border-red-500 data-[state=checked]:bg-red-500 data-[state=checked]:text-white",
                                                            )}
                                                        />
                                                        <div className="grid gap-1.5 leading-none">
                                                            <span className="text-base">{option.text}</span>
                                                            {isAnswerSubmitted && (
                                                                <div className="flex items-center mt-1">
                                                                    {isCorrect && (
                                                                        <Badge
                                                                            variant="outline"
                                                                            className="bg-green-50 text-green-700 border-green-200 text-xs"
                                                                        >
                                                                            Correct
                                                                        </Badge>
                                                                    )}
                                                                    {isSelected && !isCorrect && (
                                                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-xs">
                                                                            Incorrect
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>

                            {selectedAnswers.length < minRequired && !isAnswerSubmitted && (
                                <Alert variant="destructive" className="bg-amber-50 text-amber-800 border-amber-200">
                                    <AlertDescription>
                                        Please select at least {minRequired} {minRequired === 1 ? "option" : "options"} to continue.
                                    </AlertDescription>
                                </Alert>
                            )}

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

                            {isAnswerSubmitted && (
                                <div className="bg-muted/30 p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium">Your score for this question:</h4>
                                        <Badge
                                            className={cn(
                                                "px-3 py-1",
                                                score[currentQuestion.id] > 70
                                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                    : score[currentQuestion.id] > 40
                                                        ? "bg-amber-100 text-amber-800 hover:bg-amber-100"
                                                        : "bg-red-100 text-red-800 hover:bg-red-100",
                                            )}
                                        >
                                            {score[currentQuestion.id] || 0}%
                                        </Badge>
                                    </div>
                                </div>
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
                                <Button
                                    onClick={handleSubmit}
                                    disabled={selectedAnswers.length < minRequired}
                                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
                                >
                                    Submit Answers
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 flex items-center gap-1"
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
    )
}