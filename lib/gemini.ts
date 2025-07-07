import { GoogleGenerativeAI } from "@google/generative-ai"

const ALLOWED_MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp"]

export function getGeminiClient(apiKey: string) {
  if (!apiKey) {
    throw new Error("Clé API Gemini manquante")
  }
  return new GoogleGenerativeAI(apiKey)
}

export async function callGemini(prompt: string, apiKey: string, model = "gemini-1.5-flash", options: any = {}) {
  try {
    const genAI = getGeminiClient(apiKey)
    const geminiModel = genAI.getGenerativeModel({ model })

    const result = await geminiModel.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (!text || text.trim() === "") {
      throw new Error("Réponse vide de Gemini")
    }

    return text.trim()
  } catch (error: any) {
    console.error("Erreur Gemini:", error)
    throw new Error(`Erreur API Gemini: ${error.message}`)
  }
}

// Agent collecteur intelligent
export async function processFormResponse(formData: any, apiKey: string) {
  const prompt = `Tu es un agent collecteur intelligent. Analyse cette soumission de formulaire et génère une réponse personnalisée.

Données reçues:
${JSON.stringify(formData, null, 2)}

Instructions:
1. Analyse le type de formulaire et les données
2. Génère une réponse personnalisée et professionnelle
3. Si c'est un contact: remercie et indique un délai de réponse
4. Si c'est un devis: confirme la réception et les prochaines étapes
5. Si c'est une inscription: confirme l'inscription et donne les détails
6. Sois chaleureux mais professionnel
7. Maximum 200 mots

Réponds maintenant:`

  try {
    const response = await callGemini(prompt, apiKey, "gemini-1.5-flash")
    return response
  } catch (error) {
    return "Merci pour votre soumission ! Nous vous recontacterons bientôt."
  }
}
