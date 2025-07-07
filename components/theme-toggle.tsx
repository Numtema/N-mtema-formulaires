"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const theme = localStorage.getItem("theme")
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    setIsDark(theme === "dark" || (!theme && systemDark))
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  return (
    <Button
      onClick={() => setIsDark(!isDark)}
      variant="outline"
      size="icon"
      className="rounded-full glass-card border-0 w-12 h-12 transition-all duration-300 hover:scale-110"
    >
      {isDark ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-slate-600" />}
    </Button>
  )
}
