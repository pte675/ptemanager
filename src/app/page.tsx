import { HeroSection } from "@/components/home-page/hero-section"
import { FeatureSection } from "@/components/home-page/feature-section"
import { StatsSection } from "@/components/home-page/stats-section"
import { MethodologySection } from "@/components/home-page/methodology-section"
import { TestimonialsSection } from "@/components/home-page/testimonials-section"
import { PricingSection } from "@/components/home-page/pricing-section"
import { FaqSection } from "@/components/home-page/faq-section"
import { CtaSection } from "@/components/home-page/cta-section"
import { Footer } from "@/components/home-page/footer"
import { Navbar } from "@/components/home-page/navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main>
        <HeroSection />
        <FeatureSection />
        <StatsSection />
        <MethodologySection />
        <TestimonialsSection />
        <PricingSection />
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
