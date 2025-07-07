"use client"

import { Card } from "@/components/ui/card"
import { Brain, Zap, Palette, Shield, Globe, Sparkles } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "IA Générative",
    description: "Créez des formulaires intelligents en décrivant simplement vos besoins",
  },
  {
    icon: Zap,
    title: "Réponses Instantanées",
    description: "L'IA traite et répond automatiquement à chaque soumission",
  },
  {
    icon: Palette,
    title: "Design Moderne",
    description: "Interface glassmorphisme avec animations fluides",
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Validation avancée et protection contre les attaques",
  },
  {
    icon: Globe,
    title: "Déploiement Simple",
    description: "Prêt pour Vercel avec configuration minimale",
  },
  {
    icon: Sparkles,
    title: "Modèles Flexibles",
    description: "Choisissez entre Gemini Pro, Flash ou Flash-Lite",
  },
]

export function Features() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Fonctionnalités Clés
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-300">
            Tout ce dont vous avez besoin pour révolutionner vos formulaires
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="glass-card border-0 p-8 hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-slate-800 dark:text-slate-100">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
