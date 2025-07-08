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
import { Loader2, Send, CheckCircle, AlertCircle, Play } from "lucide-react"

interface FormField {
  name: string
  type: string
  placeholder: string
  required: boolean
  options?: string[]
}

interface FormSchema {
  title: string
  description: string
  fields: FormField[]
  _metadata?: any
}

interface FormPreviewProps {
  formData: FormSchema
  onTestResult?: (result: any) => void
}

export function FormPreview({ formData, onTestResult }: FormPreviewProps) {
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<{ type: "success" | "error"; message: string } | null>(null)

  const handleInputChange = (fieldName: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }))
  }

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResponse(null)

    try {
      const formData = new FormData()

      // Ajouter tous les champs du formulaire
      Object.entries(formValues).forEach(([key, value]) => {
        formData.append(key, value)
      })

      // Ajouter des métadonnées pour identifier que c'est un test
      formData.append("_test", "true")
      formData.append("_formType", formData._metadata?.formType || "test")

      const res = await fetch("/api/collect", {
        method: "POST",
        body: formData,
      })

      const result = await res.json()

      if (res.ok) {
        setResponse({ type: "success", message: result.message })
        onTestResult?.(result)
        // Reset form
        setFormValues({})
      } else {
        setResponse({ type: "error", message: result.error || "Erreur lors du test" })
      }
    } catch (error) {
      setResponse({ type: "error", message: "Erreur de connexion" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass-card border-0 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Play className="w-5 h-5 text-green-600" />
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Aperçu Fonctionnel</h4>
      </div>

      <div className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">{formData.title}</h3>
          <p className="text-slate-600 dark:text-slate-300">{formData.description}</p>
        </div>

        <form onSubmit={handleTestSubmit} className="space-y-4">
          {formData.fields.map((field, index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={field.name}>
                {field.name.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </Label>

              {field.type === "textarea" ? (
                <Textarea
                  id={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formValues[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  rows={3}
                />
              ) : field.type === "select" && field.options ? (
                <Select
                  value={formValues[field.name] || ""}
                  onValueChange={(value) => handleInputChange(field.name, value)}
                  required={field.required}
                >
                  <SelectTrigger className="rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800">
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map((option, optIndex) => (
                      <SelectItem key={optIndex} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : field.type === "select" ? (
                <Input
                  id={field.name}
                  type="text"
                  placeholder={field.placeholder + " (options non définies)"}
                  required={field.required}
                  value={formValues[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              ) : field.type === "file" ? (
                <Input
                  id={field.name}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              ) : (
                <Input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  required={field.required}
                  value={formValues[field.name] || ""}
                  onChange={(e) => handleInputChange(field.name, e.target.value)}
                  className="rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                />
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {formData._metadata?.cta || "Tester le Formulaire"}
              </>
            )}
          </Button>

          {formData._metadata?.ctaSecondary && (
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-xl py-3 mt-2 border-green-200 text-green-700 hover:bg-green-50 bg-transparent"
              onClick={() => alert(`Action: ${formData._metadata.ctaSecondary}`)}
            >
              {formData._metadata.ctaSecondary}
            </Button>
          )}
        </form>

        {response && (
          <Alert
            className={`mt-4 rounded-xl ${response.type === "success" ? "border-green-200 bg-green-50 text-green-800" : "border-red-200 bg-red-50 text-red-800"}`}
          >
            {response.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription className="font-medium whitespace-pre-line">{response.message}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 <strong>Test en direct :</strong> Ce formulaire est entièrement fonctionnel. Les soumissions de test
          apparaîtront dans le Dashboard avec le tag "TEST".
        </p>
      </div>
    </Card>
  )
}
