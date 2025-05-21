"use client"
import { Check, ChevronDown, Globe } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface LanguageSelectorProps {
  selectedLanguage: string
  onSelectLanguage: (language: string) => void
}

export function LanguageSelector({ selectedLanguage, onSelectLanguage }: LanguageSelectorProps) {
  const languages = ["Spanish", "French", "German", "Italian", "Japanese", "Korean", "Chinese"]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          {selectedLanguage}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language}
            onClick={() => onSelectLanguage(language)}
            className="flex items-center justify-between"
          >
            {language}
            {selectedLanguage === language && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
