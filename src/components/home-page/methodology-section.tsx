"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import { CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function MethodologySection() {
  const methodologies = [
    {
      id: "immersion",
      title: "Immersive Learning",
      description:
        "Our immersive approach surrounds you with your target language through interactive scenarios, native content, and real-world simulations. This creates a natural learning environment that mimics how you learned your first language.",
      benefits: [
        "Accelerates language acquisition",
        "Improves contextual understanding",
        "Builds cultural awareness",
        "Develops natural speaking patterns",
      ],
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "spaced",
      title: "Spaced Repetition",
      description:
        "Our scientifically-proven spaced repetition system optimizes your memory by presenting information at precisely calculated intervals. This ensures you review words and concepts right before you would naturally forget them.",
      benefits: [
        "Maximizes long-term retention",
        "Reduces study time by 30%",
        "Prevents forgetting previously learned material",
        "Adapts to your personal memory patterns",
      ],
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "adaptive",
      title: "Adaptive AI",
      description:
        "Our advanced AI engine analyzes your performance in real-time to create a personalized learning path. It identifies your strengths and weaknesses, then adjusts lesson difficulty and content to optimize your progress.",
      benefits: [
        "Personalizes your learning journey",
        "Focuses on areas needing improvement",
        "Prevents wasted time on mastered concepts",
        "Continuously optimizes your learning path",
      ],
      image: "/placeholder.svg?height=400&width=600",
    },
    {
      id: "community",
      title: "Community Practice",
      description:
        "Connect with native speakers and fellow learners through our global community. Practice conversations, participate in language exchanges, and receive feedback from fluent speakers to develop authentic communication skills.",
      benefits: [
        "Provides real conversation practice",
        "Offers cultural insights from natives",
        "Creates accountability through social learning",
        "Builds confidence in real-world settings",
      ],
      image: "/placeholder.svg?height=400&width=600",
    },
  ]

  return (
    <section id="methodology" className="py-20 bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">Our Proven Methodology</h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            We combine cutting-edge research in linguistics, cognitive science, and educational psychology to create the
            most effective language learning experience.
          </p>
        </motion.div>

        <Tabs defaultValue="immersion" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-8">
            {methodologies.map((method) => (
              <TabsTrigger key={method.id} value={method.id} className="text-sm md:text-base">
                {method.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {methodologies.map((method) => (
            <TabsContent key={method.id} value={method.id}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">{method.title}</h3>
                  <p className="text-slate-700 dark:text-slate-300 mb-6">{method.description}</p>

                  <div className="space-y-3">
                    {method.benefits.map((benefit) => (
                      <div key={benefit} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={method.image || "/placeholder.svg"}
                    alt={method.title}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                  />
                </div>
              </motion.div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
