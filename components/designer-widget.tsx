"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wand2, RotateCcw, CheckCircle, Code, Eye, Cloud } from "lucide-react"
import { EmbedGenerator } from "@/components/embed-generator"
import { FormPreview } from "@/components/form-preview"

const examplePrompts = [
  "Expédier un colis d'Abidjan vers Paris avec poids et type d'envoi",
  "Réserver une table au restaurant avec nombre de personnes et allergies",
  "Louer un appartement avec surface, prix et nombre de pièces",
  "Commander une pizza avec taille, ingrédients et mode de livraison",
  "Prendre rendez-vous médecin avec symptômes et urgence",
  "Inscription formation avec niveau, disponibilités et objectifs",
  "Demande de crédit avec montant, durée et revenus",
  "Réservation hôtel avec dates, nombre de chambres et services",
]

interface FormSchema {
  title: string
  description: string
  fields: Array<{
    name: string
    type: string
    placeholder: string
    required: boolean
    options?: string[]
  }>
  _metadata?: {
    formType: string
    timestamp: string
    specification: string
  }
  id?: string
}

export function DesignerWidget() {
  const [specification, setSpecification] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedForm, setGeneratedForm] = useState<FormSchema | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<"preview" | "embed">("preview")
  const [testResult, setTestResult] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleGenerate = async () => {
    if (!specification.trim()) return

    setIsGenerating(true)
    setError(null)
    setGeneratedForm(null)
    setTestResult(null)

    try {
      const response = await fetch("/api/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request: specification }),
      })

      const result = await response.json()

      if (response.ok) {
        setGeneratedForm(result)
        setActiveView("preview")

        // Dans la fonction handleGenerate, après setGeneratedForm(result), ajouter :
        console.log("📝 Formulaire généré:", result.title, "ID:", result.id)

        // Sauvegarder automatiquement dans Blob Store
        setIsSaving(true)
        try {
          const saveResponse = await fetch("/api/forms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(result),
          })

          const saveResult = await saveResponse.json()
          console.log("💾 Sauvegarde résultat:", saveResult)

          if (saveResult.success) {
            // Mettre à jour le formulaire avec l'ID de sauvegarde si différent
            if (saveResult.form && saveResult.form.id !== result.id) {
              setGeneratedForm(saveResult.form)
            }
          }
        } catch (saveError) {
          console.error("❌ Erreur sauvegarde:", saveError)
        } finally {
          setIsSaving(false)
        }
      } else {
        setError(result.error || "Erreur lors de la génération")
      }
    } catch (err) {
      setError("Erreur de connexion")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setGeneratedForm(null)
    setError(null)
    setSpecification("")
    setActiveView("preview")
    setTestResult(null)
  }

  const handleTestResult = (result: any) => {
    setTestResult(result)
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0 p-8 animate-fade-in">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Designer de Formulaires IA
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Décrivez votre formulaire en détail - sauvegarde automatique dans Blob Store
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
              <Cloud className="w-3 h-3" />
              Auto-Save
            </Badge>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="specification">Décrivez votre formulaire *</Label>
            <Textarea
              id="specification"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              placeholder="Ex: Expédier un colis d'Abidjan vers Paris avec pays d'expédition, pays d'arrivée, type d'envoi (colis/pli), poids estimé en KG, nom complet, téléphone, email et message optionnel..."
              rows={4}
              className="rounded-xl border-0 glass-input resize-none"
              maxLength={1000}
            />
            <p className="text-sm text-slate-500">{specification.length}/1000 caractères</p>
          </div>

          <div className="space-y-2">
            <Label>Exemples rapides :</Label>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSpecification(prompt)}
                  className="text-xs rounded-full glass-card border-0 h-auto py-1 px-3"
                >
                  {prompt.slice(0, 30)}...
                </Button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !specification.trim()}
              className="flex-1 rounded-xl py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Créer le Formulaire
                </>
              )}
            </Button>
            {generatedForm && (
              <Button onClick={handleReset} variant="outline" className="rounded-xl glass-card border-0 bg-transparent">
                <RotateCcw className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert className="mt-6 rounded-xl border-0 glass-error animate-fade-in">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>

      {generatedForm && (
        <>
          <Card className="glass-card border-0 p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-xl font-bold text-slate-800 dark:text-slate-100">{generatedForm.title}</h4>
                <p className="text-slate-600 dark:text-slate-300">{generatedForm.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => setActiveView("preview")}
                  variant={activeView === "preview" ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Test
                </Button>
                <Button
                  onClick={() => setActiveView("embed")}
                  variant={activeView === "embed" ? "default" : "outline"}
                  size="sm"
                  className="rounded-xl"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Intégrer
                </Button>
              </div>
            </div>

            {activeView === "preview" && <FormPreview formData={generatedForm} onTestResult={handleTestResult} />}

            {activeView === "embed" && <EmbedGenerator formData={generatedForm} />}

            <Alert className="mt-6 rounded-xl border-0 glass-success animate-fade-in">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Formulaire créé avec succès !{isSaving && " 💾 Sauvegarde en cours..."}
                {!isSaving && " ✅ Sauvegardé dans Blob Store."}
                {testResult && " 🧪 Test effectué - vérifiez le Dashboard."}
                {activeView === "preview"
                  ? " Testez-le directement ci-dessus pour voir les résultats dans le Dashboard."
                  : " Utilisez le code d'intégration pour l'ajouter à votre site."}
              </AlertDescription>
            </Alert>
          </Card>
        </>
      )}
    </div>
  )
}
