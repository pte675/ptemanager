"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Download, FileText, Play, QrCode, Star, Users, BookOpen, Award, Globe, ArrowRight } from "lucide-react"

export default function Component() {
    const [hoveredCard, setHoveredCard] = useState<number | null>(null)

    const pdfs = [
        {
            id: 1,
            title: "PTE Speaking Practice Questions",
            description: "Complete guide with 50+ speaking questions and detailed answers",
            category: "Speaking",
            pages: 24,
            difficulty: "Intermediate",
            downloadCount: "2.3K",
            rating: 4.9,
        },
        {
            id: 2,
            title: "PTE Writing Task Solutions",
            description: "Essay templates and summarize written text practice with solutions",
            category: "Writing",
            pages: 32,
            difficulty: "Advanced",
            downloadCount: "1.8K",
            rating: 4.8,
        },
        {
            id: 3,
            title: "PTE Reading Comprehension",
            description: "Multiple choice, fill in blanks, and reorder paragraphs practice",
            category: "Reading",
            pages: 28,
            difficulty: "All Levels",
            downloadCount: "3.1K",
            rating: 4.9,
        },
        {
            id: 4,
            title: "PTE Listening Strategies",
            description: "Summarize spoken text, multiple choice, and highlight correct summary",
            category: "Listening",
            pages: 20,
            difficulty: "Intermediate",
            downloadCount: "2.7K",
            rating: 4.7,
        },
        {
            id: 5,
            title: "PTE Mock Test Papers",
            description: "Full-length practice tests with detailed scoring guidelines",
            category: "Mock Tests",
            pages: 45,
            difficulty: "All Levels",
            downloadCount: "4.2K",
            rating: 5.0,
        },
        {
            id: 6,
            title: "PTE Vocabulary Builder",
            description: "Essential vocabulary with academic word lists and usage examples",
            category: "Vocabulary",
            pages: 18,
            difficulty: "Beginner",
            downloadCount: "1.9K",
            rating: 4.6,
        },
    ]

    const getCategoryColor = (category: string) => {
        const colors = {
            Speaking: "bg-blue-500",
            Writing: "bg-green-500",
            Reading: "bg-purple-500",
            Listening: "bg-orange-500",
            "Mock Tests": "bg-red-500",
            Vocabulary: "bg-teal-500",
        }
        return colors[category as keyof typeof colors] || "bg-gray-500"
    }

    const getDifficultyColor = (difficulty: string) => {
        const colors = {
            Beginner: "bg-green-100 text-green-800",
            Intermediate: "bg-yellow-100 text-yellow-800",
            Advanced: "bg-red-100 text-red-800",
            "All Levels": "bg-blue-100 text-blue-800",
        }
        return colors[difficulty as keyof typeof colors] || "bg-gray-100 text-gray-800"
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23ffffff&quot; fillOpacity=&quot;0.1&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

                <div className="relative container mx-auto px-4 py-16 md:py-24">
                    <div className="text-center text-white">
                        <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <Globe className="w-4 h-4" />
                            <span className="text-sm font-medium">pteglobal.com</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                            Master PTE with Expert
                            <br />
                            Practice Materials
                        </h1>

                        <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
                            Access premium PDF guides created by PTE experts. Each resource is linked to our comprehensive video
                            tutorials.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 mb-12">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <Users className="w-5 h-5" />
                                <span className="font-semibold">50K+ Students</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <Award className="w-5 h-5" />
                                <span className="font-semibold">Expert Created</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                <BookOpen className="w-5 h-5" />
                                <span className="font-semibold">Updated Weekly</span>
                            </div>
                        </div>

                        <Button
                            size="lg"
                            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <QrCode className="w-5 h-5 mr-2" />
                            Scan QR from Videos
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* PDF Showcase */}
            <div className="container mx-auto px-4 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Premium Practice Materials</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Download comprehensive PDF guides that complement our YouTube video series. Each PDF contains detailed
                        solutions and expert tips.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {pdfs.map((pdf, index) => (
                        <Card
                            key={pdf.id}
                            className={`group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 ${hoveredCard === index ? "scale-105" : ""
                                }`}
                            onMouseEnter={() => setHoveredCard(index)}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 ${getCategoryColor(pdf.category)}`}></div>

                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`p-3 rounded-lg ${getCategoryColor(pdf.category)} bg-opacity-10`}>
                                        <FileText className={`w-6 h-6 ${getCategoryColor(pdf.category).replace("bg-", "text-")}`} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm font-semibold text-gray-700">{pdf.rating}</span>
                                    </div>
                                </div>

                                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {pdf.title}
                                </CardTitle>

                                <CardDescription className="text-gray-600 leading-relaxed">{pdf.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="pt-0">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <Badge
                                        variant="secondary"
                                        className={getCategoryColor(pdf.category).replace("bg-", "bg-") + " text-white"}
                                    >
                                        {pdf.category}
                                    </Badge>
                                    <Badge variant="outline" className={getDifficultyColor(pdf.difficulty)}>
                                        {pdf.difficulty}
                                    </Badge>
                                </div>

                                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                                    <span className="flex items-center gap-1">
                                        <BookOpen className="w-4 h-4" />
                                        {pdf.pages} pages
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Download className="w-4 h-4" />
                                        {pdf.downloadCount} downloads
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                                        <Download className="w-4 h-4 mr-2" />
                                        Download PDF
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 font-medium py-2.5 rounded-lg"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Watch Video Tutorial
                                    </Button>
                                </div>
                            </CardContent>

                            {/* Hover Effect Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </Card>
                    ))}
                </div>

                {/* Call to Action */}
                <div className="text-center mt-16">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white">
                        <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Ace Your PTE Exam?</h3>
                        <p className="text-lg mb-8 text-blue-100 max-w-2xl mx-auto">
                            Join thousands of successful students who have improved their PTE scores with our comprehensive materials
                            and expert guidance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-3 rounded-full"
                            >
                                Visit pteglobal.com
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3 rounded-full"
                            >
                                <QrCode className="w-5 h-5 mr-2" />
                                Scan QR Code
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-8">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Globe className="w-6 h-6 text-blue-400" />
                        <span className="text-xl font-bold">pteglobal.com</span>
                    </div>
                    <p className="text-gray-400">
                        Your trusted partner for PTE exam preparation. Expert guidance, premium materials, proven results.
                    </p>
                </div>
            </footer>
        </div>
    )
}
