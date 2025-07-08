import { GoogleGenerativeAI } from "@google/generative-ai"

const ALLOWED_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"]

// Circuit breaker pour éviter de surcharger l'API
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private readonly threshold = 3
  private readonly timeout = 60000 // 1 minute

  isOpen(): boolean {
    if (this.failures >= this.threshold) {
      if (Date.now() - this.lastFailureTime < this.timeout) {
        return true
      } else {
        // Reset après timeout
        this.failures = 0
      }
    }
    return false
  }

  recordFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
  }

  recordSuccess(): void {
    this.failures = 0
  }
}

const circuitBreaker = new CircuitBreaker()

export function getGeminiClient(apiKey: string) {
  if (!apiKey) {
    throw new Error("Clé API Gemini manquante")
  }
  return new GoogleGenerativeAI(apiKey)
}

// Fonction de retry avec backoff exponentiel et circuit breaker
async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 2, baseDelay = 1000): Promise<T> {
  // Vérifier le circuit breaker
  if (circuitBreaker.isOpen()) {
    throw new Error("Circuit breaker ouvert - API temporairement indisponible")
  }

  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn()
      circuitBreaker.recordSuccess()
      return result
    } catch (error: any) {
      lastError = error

      // Enregistrer l'échec dans le circuit breaker
      circuitBreaker.recordFailure()

      // Ne pas retry sur les erreurs de permission ou de quota
      if (
        error.message?.includes("PERMISSION_DENIED") ||
        error.message?.includes("403") ||
        error.message?.includes("QUOTA_EXCEEDED") ||
        error.message?.includes("429")
      ) {
        throw error
      }

      // Si c'est la dernière tentative, on lance l'erreur
      if (attempt === maxRetries) {
        throw error
      }

      // Attendre avant la prochaine tentative (backoff plus court)
      const delay = Math.min(baseDelay * Math.pow(1.5, attempt), 5000) + Math.random() * 1000
      console.log(`Tentative ${attempt + 1}/${maxRetries + 1} échouée, retry dans ${Math.round(delay)}ms...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

export async function callGemini(prompt: string, apiKey: string, model = "gemini-1.5-flash", options: any = {}) {
  return retryWithBackoff(
    async () => {
      try {
        const genAI = getGeminiClient(apiKey)
        const geminiModel = genAI.getGenerativeModel({
          model,
          generationConfig: {
            maxOutputTokens: options.maxOutputTokens || 1000,
            temperature: options.temperature || 0.7,
            topP: options.topP || 0.8,
          },
        })

        const result = await geminiModel.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        if (!text || text.trim() === "") {
          throw new Error("Réponse vide de Gemini")
        }

        return text.trim()
      } catch (error: any) {
        console.error("Erreur Gemini:", error.message)

        // Gestion spécifique des différents types d'erreurs
        if (error.message?.includes("PERMISSION_DENIED") || error.message?.includes("403")) {
          throw new Error(`Clé API invalide ou permissions insuffisantes: ${error.message}`)
        }

        if (error.message?.includes("overloaded") || error.message?.includes("503")) {
          throw new Error(`Modèle surchargé: ${error.message}`)
        }

        if (error.message?.includes("QUOTA_EXCEEDED") || error.message?.includes("429")) {
          throw new Error(`Quota API dépassé: ${error.message}`)
        }

        throw new Error(`Erreur API Gemini: ${error.message}`)
      }
    },
    2, // Réduire à 2 tentatives
    1500, // Délai de base plus court
  )
}

// Agent collecteur intelligent avec fallback amélioré
export async function processFormResponse(formData: any, apiKey: string) {
  // Vérifier le circuit breaker avant d'essayer
  if (circuitBreaker.isOpen()) {
    console.log("Circuit breaker ouvert, utilisation du fallback immédiat")
    return generateFallbackResponse(formData)
  }

  let prompt = `Tu es un agent intelligent spécialisé dans le service client. Analyse cette soumission et génère une réponse personnalisée.

Données reçues:
${JSON.stringify(formData, null, 2)}

`

  // Traitement spécialisé pour l'expédition
  if (formData.formType === "expedition" || formData.ville_origine || formData.poids_colis) {
    prompt += `CONTEXTE SPÉCIAL - EXPÉDITION DE COLIS:
Cette demande concerne l'expédition d'un colis.

Instructions spéciales:
1. Confirme la réception de la demande d'expédition
2. Récapitule les détails : origine, destination, poids
3. Mentionne que l'équipe va calculer le devis
4. Donne un délai de réponse (ex: "sous 2h")
5. Propose les services disponibles si pertinent
6. Sois professionnel mais chaleureux
7. Maximum 200 mots

Exemple de ton à adopter:
"Bonjour [Nom], nous avons bien reçu votre demande d'expédition de colis de [Origine] vers [Destination]. Notre équipe calcule actuellement le meilleur tarif pour votre envoi de [Poids]kg. Vous recevrez votre devis détaillé sous 2h par email ou téléphone. 📦✈️"

`
  } else {
    prompt += `Instructions générales:
1. Analyse le type de formulaire et les données
2. Génère une réponse personnalisée et professionnelle
3. Si c'est un contact: remercie et indique un délai de réponse
4. Si c'est un devis: confirme la réception et les prochaines étapes
5. Si c'est une inscription: confirme l'inscription et donne les détails
6. Sois chaleureux mais professionnel
7. Maximum 200 mots

`
  }

  prompt += `Réponds maintenant de manière personnalisée:`

  try {
    const response = await callGemini(prompt, apiKey, "gemini-1.5-flash", {
      maxOutputTokens: 300,
      temperature: 0.7,
    })
    return response
  } catch (error) {
    console.error("Erreur agent IA, utilisation du fallback:", error)
    return generateFallbackResponse(formData)
  }
}

// Fonction de fallback améliorée
function generateFallbackResponse(formData: any): string {
  const nom = formData.nom_expediteur || formData.name || formData.nom || "cher client"

  // Réponse spécialisée pour l'expédition
  if (formData.formType === "expedition" || formData.ville_origine) {
    const origine = formData.ville_origine || "votre ville"
    const destination = formData.ville_destination || "la destination"
    const poids = formData.poids_colis || "votre colis"

    return `Bonjour ${nom}, nous avons bien reçu votre demande d'expédition de ${origine} vers ${destination}. Notre équipe calcule le meilleur tarif pour votre envoi de ${poids}kg. Vous recevrez votre devis sous 2h ! 📦✈️`
  }

  // Réponses par type de formulaire
  switch (formData.formType) {
    case "devis":
      return `Bonjour ${nom}, merci pour votre demande de devis ! Notre équipe commerciale étudie votre projet et vous recontactera sous 24h avec une proposition personnalisée. 💼`

    case "contact":
      return `Bonjour ${nom}, merci pour votre message ! Nous avons bien reçu votre demande et notre équipe vous recontactera dans les plus brefs délais. 📧`

    case "inscription":
      return `Bonjour ${nom}, votre inscription a été prise en compte ! Vous recevrez un email de confirmation avec tous les détails dans quelques minutes. 🎫`

    default:
      return `Bonjour ${nom}, merci pour votre soumission ! Nous avons bien reçu vos informations et vous recontacterons bientôt. 📧`
  }
}
