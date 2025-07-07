"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, CheckCircle, AlertCircle } from "lucide-react"
import { getGeminiApiKey } from "@/lib/api-utils"
import { TokenInfo } from "@/components/token-info"

const geminiModels = [
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro - Raisonnement complexe" },
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash - Équilibré" },
  { value: "gemini-2.5-flash-lite-preview-06-17", label: "Gemini Flash-Lite - Rapide & économique" },
]

export function FormWidget() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    model: "gemini-2.5-flash",
  })
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<{ type: "success" | "error"; message: string; metadata?: any } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResponse(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("message", formData.message)
      formDataToSend.append("model", formData.model)
      formDataToSend.append("apiKey", getGeminiApiKey())
      if (file) {
        formDataToSend.append("file", file)
      }

      const res = await fetch("/api/submit", {
        method: "POST",
        body: formDataToSend,
      })

      const result = await res.json()

      if (res.ok) {
        setResponse({
          type: "success",
          message: result.message,
          metadata: result.metadata,
        })
        setFormData({ name: "", email: "", message: "", model: "gemini-2.5-flash" })
        setFile(null)
      } else {
        setResponse({ type: "error", message: result.error || "Une erreur est survenue" })
      }
    } catch (error) {
      setResponse({ type: "error", message: "Erreur de connexion à l'API Gemini" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass-card border-0 p-8 animate-fade-in">
      <div className="mb-6">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Formulaire Intelligent
        </h3>
        <p className="text-slate-600 dark:text-slate-300">
          Soumettez votre message et recevez une réponse générée par l'IA Gemini
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Votre nom"
              required
              className="rounded-xl border-0 glass-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="votre@email.com"
              required
              className="rounded-xl border-0 glass-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Modèle Gemini</Label>
          <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
            <SelectTrigger className="rounded-xl border-0 glass-input">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {geminiModels.map((model) => (
                <SelectItem key={model.value} value={model.value}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Message *</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Décrivez votre demande..."
            required
            rows={4}
            className="rounded-xl border-0 glass-input resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">Fichier (optionnel)</Label>
          <Input
            id="file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="rounded-xl border-0 glass-input"
          />
          <p className="text-sm text-slate-500">PDF, PNG ou JPG uniquement</p>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Traitement par Gemini...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Envoyer à Gemini
            </>
          )}
        </Button>
      </form>

      {response && (
        <>
          <Alert
            className={`mt-6 rounded-xl border-0 ${response.type === "success" ? "glass-success" : "glass-error"} animate-fade-in`}
          >
            {response.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className="font-medium whitespace-pre-line">{response.message}</AlertDescription>
          </Alert>

          {response.type === "success" && response.metadata && <TokenInfo metadata={response.metadata} />}
        </>
      )}
    </Card>
  )
}
