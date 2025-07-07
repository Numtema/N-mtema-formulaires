"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FormPreview } from "@/components/form-preview"
import { TestTube, Calendar, Trash2, RefreshCw, Cloud, Download } from "lucide-react"

interface SavedForm {
  id: string
  title: string
  description: string
  fields: Array<{
    name: string
    type: string
    placeholder: string
    required: boolean
    options?: string[]
  }>
  createdAt: string
  _metadata?: any
}

export function FormTester() {
  const [savedForms, setSavedForms] = useState<SavedForm[]>([])
  const [selectedFormId, setSelectedFormId] = useState<string>("")
  const [selectedForm, setSelectedForm] = useState<SavedForm | null>(null)
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const loadSavedForms = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/forms")
      const data = await response.json()
      setSavedForms(data.forms || [])

      // Si aucun formulaire sélectionné et qu'il y en a, sélectionner le premier
      if (!selectedFormId && data.forms && data.forms.length > 0) {
        setSelectedFormId(data.forms[0].id)
        setSelectedForm(data.forms[0])
      }
    } catch (error) {
      console.error("Erreur chargement formulaires:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSavedForms()
  }, [])

  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId)
    const form = savedForms.find((f) => f.id === formId)
    setSelectedForm(form || null)
    setTestResult(null)
  }

  const handleDeleteForm = async (formId: string) => {
    try {
      await fetch(`/api/forms?id=${formId}`, { method: "DELETE" })
      await loadSavedForms()

      if (selectedFormId === formId) {
        setSelectedFormId("")
        setSelectedForm(null)
      }
    } catch (error) {
      console.error("Erreur suppression:", error)
    }
  }

  const handleTestResult = (result: any) => {
    setTestResult(result)
  }

  const createBackup = async () => {
    try {
      const response = await fetch("/api/backup")
      const data = await response.json()

      if (data.success) {
        // Ouvrir le backup dans un nouvel onglet
        window.open(data.backupUrl, "_blank")
      }
    } catch (error) {
      console.error("Erreur backup:", error)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="glass-card border-0 p-8 animate-fade-in">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                Testeur de Formulaires
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Sélectionnez et testez tous vos formulaires sauvegardés dans Blob Store
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                Blob Store
              </Badge>
              <Button
                onClick={createBackup}
                variant="outline"
                size="sm"
                className="rounded-xl glass-card border-0 bg-transparent"
              >
                <Download className="w-4 h-4 mr-2" />
                Backup
              </Button>
              <Button
                onClick={async () => {
                  const response = await fetch("/api/debug-forms")
                  const data = await response.json()
                  console.log("🔍 Debug formulaires:", data)
                  alert(`${data.total} formulaires trouvés. Voir console pour détails.`)
                }}
                variant="outline"
                size="sm"
                className="rounded-xl glass-card border-0 bg-transparent"
              >
                🔍 Debug
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
            <p>Chargement depuis Blob Store...</p>
          </div>
        ) : savedForms.length === 0 ? (
          <Alert className="rounded-xl border-0 glass-card">
            <TestTube className="h-4 w-4" />
            <AlertDescription>
              <strong>Aucun formulaire sauvegardé</strong>
              <br />
              Créez d'abord un formulaire dans l'onglet "🎨 Designer" pour pouvoir le tester ici.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Sélecteur de formulaire */}
            <div className="flex items-center gap-4">
              <div className="flex-1 space-y-2">
                <Label>Choisir un formulaire à tester ({savedForms.length} disponibles)</Label>
                <Select value={selectedFormId} onValueChange={handleFormSelect}>
                  <SelectTrigger className="rounded-xl border-0 glass-input">
                    <SelectValue placeholder="Sélectionner un formulaire..." />
                  </SelectTrigger>
                  <SelectContent>
                    {savedForms.map((form) => (
                      <SelectItem key={form.id} value={form.id}>
                        <div className="flex items-center gap-2">
                          <span>{form.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {new Date(form.createdAt).toLocaleDateString()}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={loadSavedForms}
                variant="outline"
                size="icon"
                className="rounded-xl glass-card border-0 bg-transparent"
                title="Actualiser depuis Blob Store"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {/* Liste des formulaires */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedForms.map((form) => (
                <Card
                  key={form.id}
                  className={`glass-card border-0 p-4 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    selectedFormId === form.id ? "ring-2 ring-green-500" : ""
                  }`}
                  onClick={() => handleFormSelect(form.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{form.title}</h4>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteForm(form.id)
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{form.description}</p>

                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="text-xs">
                      {form.fields.length} champs
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(form.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Aperçu du formulaire sélectionné */}
            {selectedForm && <FormPreview formData={selectedForm} onTestResult={handleTestResult} />}

            {testResult && (
              <Alert className="rounded-xl border-0 glass-success animate-fade-in">
                <TestTube className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test effectué avec succès !</strong>
                  <br />
                  {testResult.filesUploaded > 0 && `${testResult.filesUploaded} fichier(s) uploadé(s). `}
                  Vérifiez le Dashboard pour voir le résultat complet.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
