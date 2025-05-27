"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/home-page/theme-toggle"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${isScrolled ? "bg-white/80 dark:bg-slate-950/80 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Globe className="h-8 w-8 text-purple-600 dark:text-purple-400 mr-2" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                PTEGoGlobal
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="#features"
              className="text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#methodology"
              className="text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Methodology
            </Link>
            <Link
              href="#pricing"
              className="text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              Pricing
            </Link>
            <LanguageSelector />
            <ThemeToggle />
            <Link href="https://chat.whatsapp.com/C0mnlnA1jqyKQJfPooQNi3">
              <Button className="w-full">Join Group</Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden space-x-4">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 space-y-4">
            <Link
              href="#features"
              className="block py-2 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#methodology"
              className="block py-2 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Methodology
            </Link>
            <Link
              href="#pricing"
              className="block py-2 text-slate-700 dark:text-slate-200 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <div className="py-2">
              <LanguageSelector />
            </div>
            <div className="pt-2">
              <Link href="https://chat.whatsapp.com/C0mnlnA1jqyKQJfPooQNi3">
                <Button className="w-full">Join Group</Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}

function LanguageSelector() {
  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "ja", name: "日本語" },
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">English</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem key={lang.code}>{lang.name}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
