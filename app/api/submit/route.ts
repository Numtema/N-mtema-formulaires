import { type NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string
    const model = formData.get("model") as string
    const file = formData.get("file") as File | null
    const apiKey = (formData.get("apiKey") as string) || "AIzaSyCGxrPEJK_JHsb8ZA8YoAPtK4CfmD7c5eI"

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json({ error: "Tous les champs requis doivent être remplis" }, { status: 400 })
    }

    if (!apiKey) {
      return NextResponse.json({ error: "Clé API Gemini manquante" }, { status: 400 })
    }

    // Validate file if present
    if (file) {
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: "Type de fichier non autorisé. Utilisez PDF, PNG ou JPG." }, { status: 400 })
      }
    }

    // Create prompt for Gemini
    const prompt = `Tu es un assistant IA bienveillant et professionnel propulsé par ${model}.

Informations de l'utilisateur :
- Nom : ${name}
- Email : ${email}
- Message : "${message}"
${file ? `- Fichier joint : ${file.name} (${file.type})` : ""}

Instructions :
1. Réponds de manière gentille et professionnelle
2. Adresse-toi à l'utilisateur par son nom
3. Traite sa demande de façon utile et pertinente
4. Si un fichier est joint, mentionne-le dans ta réponse
5. Garde une tonalité chaleureuse mais professionnelle
6. Limite ta réponse à 300 mots maximum
7. Montre que tu comprends sa demande et propose une aide concrète

Réponds maintenant à ${name} de manière personnalisée :`

    // Call Gemini API
    const response = await callGemini(prompt, apiKey, model, {
      maxOutputTokens: 400,
      temperature: 0.7,
      topP: 0.8,
    })

    return NextResponse.json({
      message: response,
      status: "success",
      metadata: {
        model: model,
        apiKeyUsed: `${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("Error in submit API:", error)

    let errorMessage = "Erreur interne du serveur"
    if (error.message?.includes("API key") || error.message?.includes("API_KEY")) {
      errorMessage = "Clé API Gemini invalide ou manquante"
    } else if (error.message?.includes("quota") || error.message?.includes("QUOTA")) {
      errorMessage = "Quota API dépassé. Veuillez réessayer plus tard."
    } else if (error.message?.includes("Modèle non autorisé")) {
      errorMessage = error.message
    } else if (error.message?.includes("PERMISSION_DENIED")) {
      errorMessage = "Accès refusé. Vérifiez votre clé API Gemini."
    } else if (error.message?.includes("INVALID_ARGUMENT")) {
      errorMessage = "Paramètres invalides envoyés à l'API Gemini."
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
