"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Marketing Director",
      language: "Spanish",
      image: "/testmonials/testimonial-1.jpg",
      content:
        "After trying multiple language apps, PTEGoGlobal was the only one that actually got me speaking confidently. The immersive approach and personalized feedback made all the difference. I went from basic phrases to having business conversations in Spanish within 6 months.",
      rating: 5,
    },
    {
      id: 2,
      name: "Michael Camilo",
      role: "Software Engineer",
      language: "Japanese",
      image: "/testmonials/testimonial-2.jpg",
      content:
        "The adaptive learning system is incredible. It somehow knows exactly when I'm about to forget something and reviews it at the perfect time. I've retained so much more vocabulary compared to other methods I've tried. Now I can watch anime without subtitles!",
      rating: 5,
    },
    {
      id: 3,
      name: "Elena Petrov",
      role: "University Student",
      language: "French",
      image: "/testmonials/testimonial-3.jpg",
      content:
        "I needed to learn French quickly for my study abroad program. PTEGoGlobal's focused approach helped me achieve more in 3 months than my previous 2 years of classroom learning. The speaking practice with natives was especially valuable.",
      rating: 4,
    },
    {
      id: 4,
      name: "David Okafor",
      role: "Travel Blogger",
      language: "Portuguese",
      image: "/testmonials/testimonial-4.jpg",
      content:
        "As someone who travels constantly, I've used PTEGoGlobal to learn basics in multiple languages. The bite-sized lessons are perfect for my busy schedule, and the offline mode means I can practice even in remote locations. It's transformed my travel experiences.",
      rating: 5,
    },
  ]

  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)

  useEffect(() => {
    if (!autoplay) return

    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [autoplay, testimonials.length])

  const handlePrev = () => {
    setAutoplay(false)
    setActiveIndex((current) => (current - 1 + testimonials.length) % testimonials.length)
  }

  const handleNext = () => {
    setAutoplay(false)
    setActiveIndex((current) => (current + 1) % testimonials.length)
  }

  return (
    <section className="py-20 bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Success Stories</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Hear from our community of learners who have achieved their language goals with our platform.
          </p>
        </motion.div>

        <div className="relative max-w-4xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 md:p-10 shadow-sm border border-slate-200 dark:border-slate-800 relative">
                    <Quote className="absolute top-6 left-6 h-12 w-12 text-slate-200 dark:text-slate-800 -z-10" />

                    <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                      <Image
                        src={testimonial.image || "/placeholder.svg"}
                        alt={testimonial.name}
                        width={100}
                        height={100}
                        className="rounded-full"
                      />

                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{testimonial.name}</h3>
                        <p className="text-slate-600 dark:text-slate-400">{testimonial.role}</p>
                        <p className="text-purple-600 dark:text-purple-400">Learned {testimonial.language}</p>

                        <div className="flex mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${i < testimonial.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-slate-300 dark:text-slate-700"
                                }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <blockquote className="text-lg text-slate-700 dark:text-slate-300 italic">
                      "{testimonial.content}"
                    </blockquote>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-4">
            <Button variant="outline" size="icon" onClick={handlePrev} aria-label="Previous testimonial">
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setAutoplay(false)
                    setActiveIndex(index)
                  }}
                  className={`w-3 h-3 rounded-full ${index === activeIndex ? "bg-purple-600 dark:bg-purple-400" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <Button variant="outline" size="icon" onClick={handleNext} aria-label="Next testimonial">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
