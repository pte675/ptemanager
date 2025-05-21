"use client"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FaqSection() {
  const faqs = [
    {
      question: "How long does it take to learn a language with PTEGoGlobal?",
      answer:
        "Learning time varies based on your target language, prior experience, and study consistency. On average, our users reach conversational fluency in 3-6 months with 15-20 minutes of daily practice. Our adaptive system personalizes your learning path to maximize efficiency for your specific goals.",
    },
    {
      question: "Can I learn multiple languages simultaneously?",
      answer:
        "Yes! You can learn multiple languages at once with our Premium and Pro plans. However, we recommend focusing on one language at a time until you reach an intermediate level to avoid confusion, especially for beginners or if the languages are similar.",
    },
    {
      question: "How is PTEGoGlobal different from other language apps?",
      answer:
        "PTEGoGlobal combines AI-powered adaptive learning with proven language acquisition methods. Unlike other apps that focus mainly on vocabulary, we develop all four skills: speaking, listening, reading, and writing. Our spaced repetition system and native speaker feedback ensure you retain what you learn and develop authentic pronunciation.",
    },
    {
      question: "Do I need to practice every day?",
      answer:
        "Consistent practice yields the best results, but our system is designed to accommodate different schedules. Even 10-15 minutes daily is more effective than longer, infrequent sessions. Our spaced repetition system adjusts to your schedule to maintain optimal retention.",
    },
    {
      question: "Can I use PTEGoGlobal offline?",
      answer:
        "Yes! Premium and Pro users can download lessons for offline use. The app will sync your progress when you reconnect to the internet. This feature is perfect for learning during travel or in areas with limited connectivity.",
    },
    {
      question: "How do I get feedback on my pronunciation?",
      answer:
        "Our AI speech recognition technology provides instant feedback on your pronunciation in all plans. Premium users get automated detailed feedback, while Pro users receive personalized feedback from native speakers who can address nuances the AI might miss.",
    },
  ]

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
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-slate-700 dark:text-slate-300">
            Find answers to common questions about our language learning platform.
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-900 text-left font-medium text-slate-900 dark:text-white">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pt-2 text-slate-700 dark:text-slate-300">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
