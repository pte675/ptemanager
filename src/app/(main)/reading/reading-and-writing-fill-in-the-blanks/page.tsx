"use client"

import { useState, useEffect } from "react"
import { ChevronRight, ChevronLeft, RotateCcw, Upload, Check, BookOpen, Award } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import AIChatSidebar from "@/components/ai-sidebar/ai-sidebar"

interface Question {
    id: number
    text: string
    blanks: {
        id: string
        options: string[]
        correctAnswer: string
    }[]
    rawContent: string
}

export default function QuizPage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [score, setScore] = useState(0)
    const [showCelebration, setShowCelebration] = useState(false)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const loadQuestions = async () => {
            const module = await import("./reading-and-writing-fill-in-the-blanks.json")
            const raw = module.default

            const transformed = raw.map((item: any, qIndex: number) => {
                const regex = /【(.*?)】/g
                let match
                let blankCount = 1
                const blanks: Question["blanks"] = []

                let modifiedText = item.content

                while ((match = regex.exec(item.content)) !== null) {
                    const rawOptions = match[1].split(",")
                    const options = rawOptions.map((o) => o.replace(/_$/, ""))
                    const correctAnswer = rawOptions.find((o) => o.endsWith("_"))?.replace(/_$/, "") || ""

                    const blankId = `blank${blankCount}`
                    blanks.push({ id: blankId, options, correctAnswer })

                    // Replace first occurrence of this exact match with [blankX]
                    modifiedText = modifiedText.replace(match[0], `[${blankId}]`)

                    blankCount++
                }

                return {
                    id: item.id,
                    text: modifiedText,
                    blanks,
                    rawContent: item.content, //for ai sidebar
                }
            })

            setQuestions(transformed)
        }

        loadQuestions()
    }, [])

    const currentQuestion = questions[currentQuestionIndex]
    const totalQuestions = questions.length

    useEffect(() => {
        setProgress(((currentQuestionIndex + 1) / totalQuestions) * 100)
    }, [currentQuestionIndex, totalQuestions])

    const handleSelectAnswer = (blankId: string, answer: string) => {
        if (isSubmitted) return

        setSelectedAnswers((prev) => ({
            ...prev,
            [blankId]: answer,
        }))
    }

    const handleSubmit = () => {
        if (isSubmitted) {
            // Move to next question
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex((prev) => prev + 1)
                setSelectedAnswers({})
                setIsSubmitted(false)
            } else {
                setShowCelebration(true)
            }
            return
        }

        // Check if all blanks are filled
        const allBlanksAnswered = currentQuestion.blanks.every((blank) => selectedAnswers[blank.id] !== undefined)

        if (!allBlanksAnswered) {
            alert("Please fill in all blanks before submitting")
            return
        }

        // Calculate score for current question
        let correctAnswers = 0
        currentQuestion.blanks.forEach((blank) => {
            if (selectedAnswers[blank.id] === blank.correctAnswer) {
                correctAnswers++
            }
        })

        const questionScore = (correctAnswers / currentQuestion.blanks.length) * 100
        setScore((prev) => prev + questionScore)
        setIsSubmitted(true)
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex((prev) => prev - 1)
            setSelectedAnswers({})
            setIsSubmitted(false)
        }
    }

    const handleRestart = () => {
        setCurrentQuestionIndex(0)
        setSelectedAnswers({})
        setIsSubmitted(false)
        setScore(0)
        setShowCelebration(false)
    }

    const renderText = () => {
        const parts = currentQuestion.text.split(/(\[blank\d+\])/)

        return parts.map((part, index) => {
            const blankMatch = part.match(/\[blank(\d+)\]/)

            if (blankMatch) {
                const blankId = `blank${blankMatch[1]}`
                const blank = currentQuestion.blanks.find((b) => b.id === blankId)

                if (!blank) return null

                const selectedAnswer = selectedAnswers[blankId]
                const isCorrect = isSubmitted && selectedAnswer === blank.correctAnswer
                const isIncorrect = isSubmitted && selectedAnswer !== blank.correctAnswer

                return (
                    <Popover key={index}>
                        <PopoverTrigger asChild>
                            <Button
                                variant={isCorrect ? "outline" : isIncorrect ? "destructive" : "outline"}
                                className={`mx-1 min-w-[120px] border-dashed ${isCorrect ? "border-green-500" : ""} ${!selectedAnswer ? "italic text-muted-foreground" : ""}`}
                            >
                                {selectedAnswer || "Select answer"}
                                {isCorrect && <Check className="ml-2 h-4 w-4 text-green-500" />}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" align="start">
                            <Command>
                                <CommandInput placeholder="Search options..." />
                                <CommandList>
                                    <CommandEmpty>No options found.</CommandEmpty>
                                    <CommandGroup>
                                        {blank.options.map((option) => (
                                            <CommandItem
                                                key={option}
                                                onSelect={() => handleSelectAnswer(blankId, option)}
                                                disabled={isSubmitted}
                                            >
                                                {option}
                                                {selectedAnswer === option && <Check className="ml-auto h-4 w-4" />}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                )
            }

            return <span key={index}>{part}</span>
        })
    }

    if (showCelebration) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 p-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <Card className="border-0 shadow-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-center text-2xl font-bold">Quiz Completed!</CardTitle>
                            <CardDescription className="text-center">You've completed all questions</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center space-y-6 pt-6">
                            <Award className="h-24 w-24 text-yellow-500" />
                            <div className="text-center">
                                <p className="text-xl font-semibold">Your Score</p>
                                <p className="text-4xl font-bold text-primary">{Math.round(score / totalQuestions)}%</p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center pb-6">
                            <Button onClick={handleRestart} className="gap-2">
                                <RotateCcw className="h-4 w-4" />
                                Try Again
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        )
    }

    if (!currentQuestion) {
        return <div className="p-4 text-center">Loading questions...</div>
    }


    return (
        <div>
            <AIChatSidebar
                section="PTE Reading"
                questionType="Reading & Writing Fill in the Blanks"
                instruction="Select the most appropriate word for each blank. Pay close attention: in the passage below, the correct options are clearly marked with an underscore (_). Only one option is correct per blank."
                passage={questions[currentQuestionIndex].rawContent}
                userResponse={Object.entries(selectedAnswers)
                    .map(([blankId, answer]) => `${blankId}: ${answer}`)
                    .join(" | ")}
            />
            <div className="flex min-h-screen flex-col bg-gradient-to-b from-sky-50 to-white dark:from-black dark:to-blacks p-4">
                <div className="container mx-auto max-w-4xl">
                    <header className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BookOpen className="h-6 w-6 text-primary" />
                            <h1 className="text-2xl font-bold text-primary">Interactive Language Quiz</h1>
                        </div>
                        <Badge variant="outline" className="gap-1 px-3 py-1">
                            {currentQuestionIndex + 1}/{totalQuestions}
                        </Badge>
                    </header>

                    <Card className="dark:border-2 shadow-lg">
                        <CardHeader className="border-b bg-muted/20 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle>Fill in the Blanks</CardTitle>
                                <Badge variant="secondary">
                                    {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                                </Badge>
                            </div>
                            <CardDescription>Select the most appropriate word for each blank in the text below.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-6">
                                <h2 className="mb-4 text-lg font-semibold">
                                    {currentQuestion.id}.{" "}
                                    {currentQuestion.id === 1
                                        ? "Wrist Watch"
                                        : currentQuestion.id === 2
                                            ? "Solar Energy"
                                            : "Artificial Intelligence"}
                                </h2>
                                <div className="rounded-lg bg-white p-6 shadow-sm">
                                    <p className="leading-relaxed text-gray-700">{renderText()}</p>
                                </div>
                            </div>

                            {isSubmitted && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 rounded-lg bg-muted p-4"
                                >
                                    <h3 className="mb-2 font-semibold">Feedback</h3>
                                    <ul className="space-y-2">
                                        {currentQuestion.blanks.map((blank) => {
                                            const isCorrect = selectedAnswers[blank.id] === blank.correctAnswer
                                            return (
                                                <li key={blank.id} className="flex items-center gap-2">
                                                    <span
                                                        className={`flex h-6 w-6 items-center justify-center rounded-full ${isCorrect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                                    >
                                                        {isCorrect ? "✓" : "✗"}
                                                    </span>
                                                    <span>
                                                        {blank.id}:{" "}
                                                        {isCorrect ? "Correct" : `Incorrect. The correct answer is "${blank.correctAnswer}"`}
                                                    </span>
                                                </li>
                                            )
                                        })}
                                    </ul>
                                </motion.div>
                            )}
                        </CardContent>
                        <CardFooter className="flex flex-col border-t bg-muted/10 px-6 py-4">
                            <Progress value={progress} className="mb-4 h-2" />
                            <div className="flex w-full items-center justify-between">
                                <div>
                                    <Button
                                        variant="outline"
                                        onClick={handlePrevious}
                                        disabled={currentQuestionIndex === 0}
                                        className="gap-1"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handleRestart} className="gap-1">
                                        <RotateCcw className="h-4 w-4" />
                                        Restart
                                    </Button>
                                    <Button onClick={handleSubmit} className="gap-1">
                                        {isSubmitted ? (
                                            <>
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </>
                                        ) : (
                                            <>
                                                Submit
                                                <Upload className="h-4 w-4" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    )
}
