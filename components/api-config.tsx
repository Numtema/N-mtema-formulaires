"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Settings, Eye, EyeOff, CheckCircle, Key } from "lucide-react"

export function ApiConfig() {
  const [apiKey, setApiKey] = useState("")
  const [showKey, setShowKey] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [productionUrl] = useState(process.env.NEXT_PUBLIC_APP_URL || "Non configurée")

  useEffect(() => {
    // Charger la clé API depuis le localStorage ou utiliser la clé par défaut
    const savedKey = localStorage.getItem("gemini_api_key")
    if (savedKey) {
      setApiKey(savedKey)
    } else {
      // Clé par défaut fournie
      const defaultKey = "AIzaSyCGxrPEJK_JHsb8ZA8YoAPtK4CfmD7c5eI"
      setApiKey(defaultKey)
      localStorage.setItem("gemini_api_key", defaultKey)
    }
  }, [])

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem("gemini_api_key", apiKey.trim())
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    }
  }

  const handleReset = () => {
    const defaultKey = "AIzaSyCGxrPEJK_JHsb8ZA8YoAPtK4CfmD7c5eI"
    setApiKey(defaultKey)
    localStorage.setItem("gemini_api_key", defaultKey)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 2000)
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Button
        onClick={() => setIsConfigOpen(!isConfigOpen)}
        variant="outline"
        size="icon"
        className="rounded-full glass-card border-0 w-12 h-12 transition-all duration-300 hover:scale-110"
      >
        <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300" />
      </Button>

      {isConfigOpen && (
        <Card className="absolute top-16 left-0 w-96 glass-card border-0 p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Key className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Configuration API Gemini</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Clé API Gemini</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Votre clé API Gemini..."
                  className="rounded-xl border-0 glass-input pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                Obtenez votre clé API sur{" "}
                <a
                  href="https://makersuite.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-700 underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                Sauvegarder
              </Button>
              <Button onClick={handleReset} variant="outline" className="rounded-xl glass-card border-0 bg-transparent">
                Défaut
              </Button>
            </div>

            {isSaved && (
              <Alert className="rounded-xl border-0 glass-success animate-fade-in">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Clé API sauvegardée avec succès !</AlertDescription>
              </Alert>
            )}

            <Alert className="rounded-xl border-0 glass-card">
              <AlertDescription className="text-xs">
                <strong>🔑 Statut de la clé API :</strong>
                <br />
                {apiKey && apiKey.length > 20 ? (
                  <span className="text-green-600">✅ Clé API configurée (longueur: {apiKey.length} caractères)</span>
                ) : (
                  <span className="text-red-600">❌ Clé API invalide ou trop courte</span>
                )}
                <br />
                <strong>Note :</strong> Si l'API Gemini échoue, le système utilisera automatiquement des templates de
                fallback.
              </AlertDescription>
            </Alert>

            <Alert className="rounded-xl border-0 glass-card">
              <AlertDescription className="text-xs">
                <strong>Note :</strong> La clé API est stockée localement dans votre navigateur et utilisée pour les
                requêtes vers l'API Gemini.
              </AlertDescription>
            </Alert>

            <Alert className="rounded-xl border-0 glass-card">
              <AlertDescription className="text-xs">
                <strong>🌐 URL de Production :</strong> {productionUrl}
                <br />
                {productionUrl !== "Non configurée" ? (
                  <span className="text-green-600">✅ Correctement configurée pour les embeds</span>
                ) : (
                  <span className="text-orange-600">⚠️ Configurez NEXT_PUBLIC_APP_URL sur Vercel</span>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </Card>
      )}
    </div>
  )
}
