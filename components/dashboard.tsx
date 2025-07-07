"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Mail, User, Clock, MessageSquare, TestTube, Globe, ExternalLink, FileText } from "lucide-react"

interface Submission {
  id: string
  timestamp: string
  formType: string
  isTest: boolean
  data: {
    _normalizedName?: string
    _normalizedEmail?: string
    _normalizedMessage?: string
    isEmbedded?: boolean
    embedUrl?: string
    embedDomain?: string
    originalFormTitle?: string
    files?: string[]
    [key: string]: any
  }
  files?: string[]
}

export function Dashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [stats, setStats] = useState({ total: 0, tests: 0, real: 0, embedded: 0 })
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<"all" | "test" | "real" | "embedded">("all")

  const fetchSubmissions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/collect")
      const data = await response.json()
      setSubmissions(data.submissions || [])
      setStats({
        total: data.total || 0,
        tests: data.tests || 0,
        real: data.real || 0,
        embedded: data.embedded || 0,
      })
    } catch (error) {
      console.error("Erreur chargement:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSubmissions()
    // Actualisation automatique toutes les 10 secondes
    const interval = setInterval(fetchSubmissions, 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredSubmissions = submissions.filter((submission) => {
    if (filter === "test") return submission.isTest
    if (filter === "real") return !submission.isTest
    if (filter === "embedded") return submission.data.isEmbedded
    return true
  })

  const getFormTypeIcon = (formType: string) => {
    switch (formType) {
      case "sondage":
        return "📊"
      case "devis":
        return "💰"
      case "candidature":
        return "💼"
      case "inscription":
        return "🎫"
      case "contact":
        return "📧"
      case "custom":
        return "🎨"
      default:
        return "📝"
    }
  }

  const getFormTypeColor = (formType: string) => {
    switch (formType) {
      case "sondage":
        return "bg-purple-100 text-purple-800"
      case "devis":
        return "bg-green-100 text-green-800"
      case "candidature":
        return "bg-blue-100 text-blue-800"
      case "inscription":
        return "bg-orange-100 text-orange-800"
      case "contact":
        return "bg-gray-100 text-gray-800"
      case "custom":
        return "bg-indigo-100 text-indigo-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const renderSubmissionDetails = (submission: Submission) => {
    const details = []
    const data = submission.data

    // Afficher les détails spécifiques selon le type
    if (submission.formType === "sondage") {
      if (data.note_globale) details.push(`Note: ${data.note_globale}`)
      if (data.satisfaction) details.push(`Satisfaction: ${data.satisfaction}`)
      if (data.recommandation) details.push(`Recommandation: ${data.recommandation}`)
    } else if (submission.formType === "devis") {
      if (data.entreprise) details.push(`Entreprise: ${data.entreprise}`)
      if (data.secteur) details.push(`Secteur: ${data.secteur}`)
      if (data.budget) details.push(`Budget: ${data.budget}€`)
    } else if (submission.formType === "candidature") {
      if (data.disponibilite) details.push(`Disponibilité: ${data.disponibilite}`)
    } else if (submission.formType === "inscription") {
      if (data.session) details.push(`Session: ${data.session}`)
    } else if (submission.formType === "custom") {
      // Pour les formulaires personnalisés, afficher quelques champs clés
      if (data.pays_expedition) details.push(`De: ${data.pays_expedition}`)
      if (data.pays_arrivee) details.push(`Vers: ${data.pays_arrivee}`)
      if (data.type_envoi) details.push(`Type: ${data.type_envoi}`)
      if (data.poids) details.push(`Poids: ${data.poids}kg`)
    }

    return details
  }

  const getDisplayName = (submission: Submission) => {
    const data = submission.data
    return (
      data._normalizedName ||
      (data.prenom && data.nom ? `${data.prenom} ${data.nom}` : data.nom || data.prenom || "Anonyme")
    )
  }

  const getDisplayEmail = (submission: Submission) => {
    return submission.data._normalizedEmail || submission.data.email
  }

  const getDisplayMessage = (submission: Submission) => {
    const data = submission.data
    return data._normalizedMessage || data.message || data.commentaires || data.description
  }

  return (
    <Card className="glass-card border-0 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Dashboard des Soumissions</h3>
        <Button
          onClick={fetchSubmissions}
          disabled={loading}
          variant="outline"
          size="sm"
          className="rounded-xl glass-card border-0 bg-transparent"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card className="glass-card border-0 p-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-indigo-600" />
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-slate-500">Total</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-0 p-4">
          <div className="flex items-center gap-3">
            <User className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{stats.real}</p>
              <p className="text-sm text-slate-500">Réelles</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-0 p-4">
          <div className="flex items-center gap-3">
            <TestTube className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{stats.tests}</p>
              <p className="text-sm text-slate-500">Tests</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-0 p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{stats.embedded}</p>
              <p className="text-sm text-slate-500">Embeds</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card border-0 p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">
                {submissions.filter((s) => new Date(s.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-slate-500">24h</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        <Button
          onClick={() => setFilter("all")}
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          className="rounded-xl"
        >
          Toutes ({stats.total})
        </Button>
        <Button
          onClick={() => setFilter("real")}
          variant={filter === "real" ? "default" : "outline"}
          size="sm"
          className="rounded-xl"
        >
          Réelles ({stats.real})
        </Button>
        <Button
          onClick={() => setFilter("test")}
          variant={filter === "test" ? "default" : "outline"}
          size="sm"
          className="rounded-xl"
        >
          Tests ({stats.tests})
        </Button>
        <Button
          onClick={() => setFilter("embedded")}
          variant={filter === "embedded" ? "default" : "outline"}
          size="sm"
          className="rounded-xl"
        >
          <Globe className="w-4 h-4 mr-1" />
          Embeds ({stats.embedded})
        </Button>
      </div>

      {/* Liste des soumissions */}
      <div className="space-y-4">
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune soumission pour le moment</p>
            <p className="text-sm">Testez le formulaire ou intégrez-le sur votre site pour voir les résultats ici</p>
          </div>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="glass-card border-0 p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getFormTypeIcon(submission.formType)}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{getDisplayName(submission)}</h4>
                      {submission.isTest && <Badge className="bg-purple-100 text-purple-800 text-xs">TEST</Badge>}
                      {submission.data.isEmbedded && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          EMBED
                        </Badge>
                      )}
                      <Badge className={`text-xs ${getFormTypeColor(submission.formType)}`}>
                        {submission.formType.toUpperCase()}
                      </Badge>
                    </div>
                    {getDisplayEmail(submission) && (
                      <p className="text-sm text-slate-500 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {getDisplayEmail(submission)}
                      </p>
                    )}
                    {submission.data.isEmbedded && (
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-blue-600 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" />
                          {submission.data.embedDomain}
                        </p>
                        {submission.data.originalFormTitle && (
                          <Badge variant="outline" className="text-xs">
                            {submission.data.originalFormTitle}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="glass-card border-0 text-xs mb-1">
                    {new Date(submission.timestamp).toLocaleString()}
                  </Badge>
                  {(submission.files?.length || submission.data.files?.length) && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <FileText className="w-3 h-3" />
                      {submission.files?.length || submission.data.files?.length} fichier(s)
                    </div>
                  )}
                </div>
              </div>

              {/* Détails spécifiques au type de formulaire */}
              {renderSubmissionDetails(submission).length > 0 && (
                <div className="mb-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <div className="flex flex-wrap gap-2">
                    {renderSubmissionDetails(submission).map((detail, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {detail}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Message principal */}
              {getDisplayMessage(submission) && (
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg text-sm">
                  {getDisplayMessage(submission)}
                </p>
              )}

              {/* URL d'embed si applicable */}
              {submission.data.isEmbedded && submission.data.embedUrl && (
                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    <strong>Soumis depuis :</strong>{" "}
                    <a
                      href={submission.data.embedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-blue-800"
                    >
                      {submission.data.embedUrl}
                    </a>
                  </p>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </Card>
  )
}
