"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Info, Zap, Clock } from "lucide-react"

interface TokenInfoProps {
  metadata?: {
    model: string
    apiKeyUsed: string
    timestamp: string
  }
}

export function TokenInfo({ metadata }: TokenInfoProps) {
  if (!metadata) return null

  return (
    <Card className="glass-card border-0 p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Info className="w-4 h-4 text-indigo-600" />
        <h4 className="font-semibold text-slate-700 dark:text-slate-300">Informations de traitement</h4>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary" className="glass-card border-0">
          <Zap className="w-3 h-3 mr-1" />
          {metadata.model}
        </Badge>

        <Badge variant="outline" className="glass-card border-0">
          🔑 {metadata.apiKeyUsed}
        </Badge>

        <Badge variant="outline" className="glass-card border-0">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(metadata.timestamp).toLocaleTimeString()}
        </Badge>
      </div>

      <p className="text-xs text-slate-500 mt-2">
        Réponse générée par l'API Gemini avec mise en cache automatique pour optimiser les performances.
      </p>
    </Card>
  )
}
