"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CtaSection() {
  const [email, setEmail] = useState("")

  return (
    <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-500">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Start Your Language Journey Today</h2>
          <p className="text-lg text-white/90 mb-8">
            Join millions of successful learners and achieve fluency faster than you ever thought possible.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <p className="mt-4 text-white/80 text-sm">No credit card required. Start your 7-day free trial.</p>
        </motion.div>
      </div>
    </section>
  )
}
