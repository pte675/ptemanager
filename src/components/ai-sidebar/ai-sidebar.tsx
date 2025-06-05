"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
    MessageCircle,
    Send,
    Search,
    Settings,
    Mic,
    MicOff,
    Paperclip,
    Copy,
    Share,
    Reply,
    Sparkles,
    Zap,
    Brain,
    Target,
    BookOpen,
    TrendingUp,
    X,
    Plus,
    CheckCheck,
    Volume2,
    VolumeX,
} from "lucide-react"

interface Message {
    id: string
    type: "user" | "ai"
    content: string
    timestamp: Date
    category?: "question" | "tip" | "practice" | "feedback" | "general"
    reactions?: { emoji: string; count: number; userReacted: boolean }[]
    suggestions?: string[]
    isTyping?: boolean
    hasAudio?: boolean
    attachments?: { name: string; type: string; size: string }[]
}

interface QuickAction {
    icon: React.ReactNode
    label: string
    action: string
    color: string
}

const quickActions: QuickAction[] = [
    { icon: <Target className="w-4 h-4" />, label: "Help Me Understand", action: "assist", color: "bg-blue-500" },
    { icon: <Brain className="w-4 h-4" />, label: "Give Me Hints", action: "hint", color: "bg-purple-500" },
    { icon: <TrendingUp className="w-4 h-4" />, label: "Explain My Mistake", action: "explain", color: "bg-green-500" },
    { icon: <BookOpen className="w-4 h-4" />, label: "Teach Me", action: "teach", color: "bg-orange-500" },
]

const suggestionChips = [
    "Explain this concept",
    "Give me a hint",
    "Review my answer",
    "Suggest improvements",
    "Show similar questions",
    "Teach me this topic",
    "Summarize the question",
    "How can I do better?",
]


interface AIChatSidebarProps {
    section: string;
    questionType: string;
    instruction: string;
    passage: string;
    userResponse: string;
}

export default function AIChatSidebar({
    section,
    questionType,
    instruction,
    passage,
    userResponse,
}: AIChatSidebarProps) {
    const [messages, setMessages] = useState<Message[]>()
    const [inputValue, setInputValue] = useState("")
    const [isExpanded, setIsExpanded] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("all")
    const [isVoiceMode, setIsVoiceMode] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(true)
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const [hasMounted, setHasMounted] = useState(false)
    const [sidebarWidth, setSidebarWidth] = useState(384); // default: 384px (w-96)
    const isDraggingRef = useRef(false);

    const categories: string[] = ["all", "question", "tip", "practice", "feedback", "general"];

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current) return;
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth >= 280 && newWidth <= 600) setSidebarWidth(newWidth);
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, []);

    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    //optional
    useEffect(() => {
        setHasMounted(true)
    }, [])

    const handleSendMessage = async (content: string) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: "user",
            content: content.trim(),
            timestamp: new Date(),
            category: "question",
        };

        setMessages((prev) => [...(prev || []), userMessage]);
        setInputValue("");
        setIsTyping(true);

        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: Message = {
            id: aiMessageId,
            type: "ai",
            content: "",
            timestamp: new Date(),
            category: "tip",
            suggestions: generateSuggestions(content),
            isTyping: true,
        };

        setMessages((prev) => [...(prev || []), aiMessage]);

        try {
            const response = await fetch("/api/streaming-sidebar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    section,
                    questionType,
                    instruction,
                    passage,
                    userResponse,
                    userQuery: content,
                    previousQA: messages?.length
                        ? {
                            question: messages[messages.length - 2]?.content || "",
                            answer: messages[messages.length - 1]?.content || "",
                        }
                        : null,
                }),
            });

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let done = false;
            let accumulated = "";

            while (!done && reader) {
                const { value, done: streamDone } = await reader.read();
                if (value) {
                    const chunk = decoder.decode(value);
                    accumulated += chunk;

                    setMessages((prev) =>
                        prev?.map((msg) =>
                            msg.id === aiMessageId ? { ...msg, content: accumulated } : msg
                        )
                    );
                }
                done = streamDone;
            }
        } catch (error: any) {
            console.error("Streaming error:", error);
            setMessages((prev) =>
                prev?.map((msg) =>
                    msg.id === aiMessageId
                        ? {
                            ...msg,
                            content: "❌ Something went wrong. Please try again.",
                        }
                        : msg
                )
            );
        } finally {
            setIsTyping(false);
        }
    };

    const generateSuggestions = (userInput: string): string[] => {
        return suggestionChips.slice(0, 4)
    }

    const handleReaction = (messageId: string, emoji: string) => {
        setMessages((prev = []) =>
            prev.map((msg) => {
                if (msg.id === messageId) {
                    const reactions = msg.reactions || []
                    const existingReaction = reactions.find((r) => r.emoji === emoji)

                    if (existingReaction) {
                        return {
                            ...msg,
                            reactions: reactions.map((r) =>
                                r.emoji === emoji
                                    ? { ...r, count: r.userReacted ? r.count - 1 : r.count + 1, userReacted: !r.userReacted }
                                    : r,
                            ),
                        }
                    } else {
                        return {
                            ...msg,
                            reactions: [...reactions, { emoji, count: 1, userReacted: true }],
                        }
                    }
                }
                return msg
            }),
        )
    }

    const filteredMessages = messages?.filter((msg) => {
        const matchesSearch = msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === "all" || msg.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const formatTime = (date: Date) => {
        if (typeof window === "undefined") return "" // avoid SSR mismatch
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const handleExport = () => {
        if (!messages || messages.length === 0) {
            alert("No messages to export.")
            return
        }

        const formatted = messages.map((msg) => {
            const prefix = msg.type === "user" ? "You" : "AI"
            return `${prefix}: ${msg.content}`
        }).join("\n\n")

        const blob = new Blob([formatted], { type: "text/plain" })
        const url = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = url
        link.download = "chat-export.txt"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }

    if (!isExpanded) {
        return (
            // <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
            <div className="fixed right-4 bottom-4 -translate-y-1/2 z-50">
                <Button
                    onClick={() => setIsExpanded(true)}
                    className="h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <MessageCircle className="w-6 h-6" />
                </Button>
            </div>
        )
    }

    return (
        <div
            className="fixed right-0 top-0 h-screen bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-2xl z-40 flex flex-col"
            style={{ width: `${sidebarWidth}px` }}
        >
            {/* Drag Handle */}
            <div
                onMouseDown={() => (isDraggingRef.current = true)}
                className="absolute left-0 top-0 h-full w-1 cursor-ew-resize bg-transparent hover:bg-blue-200 z-50"
            />
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">AI Study Assistant</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Online • Always ready to help</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => setIsVoiceMode(!isVoiceMode)}>
                            {isVoiceMode ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                    {quickActions.map((action, index) => (
                        <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs justify-start"
                            onClick={() => handleSendMessage(action.label)}
                        >
                            <div className={`w-2 h-2 rounded-full ${action.color} mr-2`}></div>
                            {action.label}
                        </Button>
                    ))}
                </div>

                {/* Search and Filter */}
                <div className="flex space-x-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search messages..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-8 text-sm"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-2 py-1 text-xs border rounded-md bg-white dark:bg-gray-800"
                    >
                        {categories.map((cat: string) => (
                            <option key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
                <div className="space-y-4">
                    {(filteredMessages ?? []).map((message) => (
                        <div key={message.id} className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[85%] ${message.type === "user" ? "order-2" : "order-1"}`}>
                                {message.type === "ai" && (
                                    <div className="flex items-center space-x-2 mb-1">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                            <Brain className="w-3 h-3 text-white" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">AI Assistant</span>
                                        {message.category && (
                                            <Badge variant="secondary" className="text-xs px-1 py-0">
                                                {message.category}
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`rounded-2xl px-4 py-3 ${message.type === "user"
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
                                        }`}
                                >
                                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

                                    {message.attachments && (
                                        <div className="mt-2 space-y-1">
                                            {message.attachments.map((attachment, index) => (
                                                <div key={index} className="flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                                                    <Paperclip className="w-4 h-4" />
                                                    <span className="text-xs">{attachment.name}</span>
                                                    <span className="text-xs opacity-70">({attachment.size})</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {message.hasAudio && (
                                        <div className="mt-2 flex items-center space-x-2 p-2 bg-white/10 rounded-lg">
                                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                                <Volume2 className="w-3 h-3" />
                                            </Button>
                                            <div className="flex-1 h-1 bg-white/20 rounded-full">
                                                <div className="w-1/3 h-full bg-white rounded-full"></div>
                                            </div>
                                            <span className="text-xs">0:15</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-1">
                                    <div className="flex items-center space-x-1">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {hasMounted ? formatTime(message.timestamp) : ""}
                                        </span>
                                        {message.type === "user" && <CheckCheck className="w-3 h-3 text-blue-500" />}
                                    </div>

                                    {message.type === "ai" && (
                                        <div className="flex items-center space-x-1">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => navigator.clipboard.writeText(message.content)}
                                            >
                                                <Copy className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Share className="w-3 h-3" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Reply className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                {/* Reactions */}
                                {message.reactions && message.reactions.length > 0 && (
                                    <div className="flex items-center space-x-1 mt-2">
                                        {message.reactions.map((reaction, index) => (
                                            <Button
                                                key={index}
                                                variant="ghost"
                                                size="sm"
                                                className={`h-6 px-2 text-xs ${reaction.userReacted ? "bg-blue-100 dark:bg-blue-900" : ""}`}
                                                onClick={() => handleReaction(message.id, reaction.emoji)}
                                            >
                                                {reaction.emoji} {reaction.count}
                                            </Button>
                                        ))}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0"
                                            onClick={() => handleReaction(message.id, "👍")}
                                        >
                                            <Plus className="w-3 h-3" />
                                        </Button>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {message.suggestions && message.suggestions.length > 0 && showSuggestions && (
                                    <div className="mt-3 space-y-1">
                                        <div className="flex items-center space-x-2">
                                            <Zap className="w-3 h-3 text-yellow-500" />
                                            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Quick actions:</span>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            {message.suggestions.map((suggestion, index) => (
                                                <Button
                                                    key={index}
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-6 text-xs px-2 hover:bg-blue-50 dark:hover:bg-blue-900"
                                                    onClick={() => handleSendMessage(suggestion)}
                                                >
                                                    {suggestion}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                    <Brain className="w-3 h-3 text-white" />
                                </div>
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.1s" }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                            style={{ animationDelay: "0.2s" }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Suggestion Chips */}
            {/* {showSuggestions && (
                <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Suggestions:</span>
                        <Button variant="ghost" size="sm" className="h-4 w-4 p-0" onClick={() => setShowSuggestions(false)}>
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                        {suggestionChips.slice(0, 4).map((chip, index) => (
                            <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="h-6 text-xs px-2 hover:bg-blue-50 dark:hover:bg-blue-900"
                                onClick={() => handleSendMessage(chip)}
                            >
                                {chip}
                            </Button>
                        ))}
                    </div>
                </div>
            )} */}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center space-x-2">
                    {/* <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Paperclip className="w-4 h-4" />
                    </Button> */}
                    <div className="flex-1 relative">
                        <Input
                            ref={inputRef}
                            placeholder="Ask anything about this question..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                            className="pr-10"
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setIsVoiceMode(!isVoiceMode)}
                        >
                            {isVoiceMode ? <MicOff className="w-4 h-4 text-red-500" /> : <Mic className="w-4 h-4" />}
                        </Button>
                    </div>
                    <Button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={!inputValue.trim()}
                        className="h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Press Enter to send</span>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 text-xs p-0"
                            onClick={() => setInputValue("")}
                        >
                            Clear chat
                        </Button>
                        <Button
                            onClick={handleExport}
                            variant="ghost"
                            size="sm"
                            className="h-4 text-xs p-0"
                        >
                            Export
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
