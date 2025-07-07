"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function Hero() {
  return (
    <section className="relative py-32 px-4 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400 to-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center px-4 py-2 rounded-full glass-card mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Propulsé par Google Gemini AI</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-bold mb-8 animate-fade-in-up">
          <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Nümtema
          </span>
          <br />
          <span className="text-slate-800 dark:text-slate-100">Formulaires</span>
        </h1>

        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
          Concevez, Collectez, Répondez. <strong>Intelligemment.</strong>
          <br />
          L'IA au service de vos interactions utilisateur.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-400">
          <Button
            size="lg"
            className="rounded-2xl px-8 py-4 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            Essayer le Designer IA
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-2xl px-8 py-4 text-lg font-semibold glass-card border-0 hover:scale-105 transition-all duration-300 bg-transparent"
          >
            Voir la Démo
          </Button>
        </div>
      </div>
    </section>
  )
}
