import { type NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/gemini"

// Templates de base améliorés comme fallback
const FALLBACK_FORMS = {
  expedition: {
    title: "Formulaire d'Expédition de Colis",
    description: "Expédiez vos colis d'Abidjan vers Paris - Devis gratuit",
    fields: [
      { name: "origine", type: "text", placeholder: "Ville d'origine (Abidjan)", required: true },
      { name: "destination", type: "text", placeholder: "Ville de destination (Paris)", required: true },
      { name: "poids", type: "number", placeholder: "Poids du colis en kg", required: true },
      { name: "nom_expediteur", type: "text", placeholder: "Nom de l'expéditeur", required: true },
      { name: "tel_expediteur", type: "tel", placeholder: "Téléphone de l'expéditeur", required: true },
      { name: "nom_destinataire", type: "text", placeholder: "Nom du destinataire", required: true },
      { name: "tel_destinataire", type: "tel", placeholder: "Téléphone du destinataire", required: true },
      { name: "message", type: "textarea", placeholder: "Message à envoyer", required: false },
    ],
    _metadata: {
      formType: "expedition",
      cta: "Demander un Devis",
    },
  },
  contact: {
    title: "Formulaire de Contact",
    description: "Contactez-nous facilement",
    fields: [
      { name: "nom", type: "text", placeholder: "Votre nom complet", required: true },
      { name: "email", type: "email", placeholder: "votre@email.com", required: true },
      { name: "telephone", type: "tel", placeholder: "Votre téléphone", required: false },
      { name: "message", type: "textarea", placeholder: "Votre message...", required: true },
    ],
    _metadata: {
      formType: "contact",
      cta: "Envoyer le Message",
    },
  },
  devis: {
    title: "Demande de Devis",
    description: "Obtenez votre devis personnalisé",
    fields: [
      { name: "nom", type: "text", placeholder: "Votre nom complet", required: true },
      { name: "email", type: "email", placeholder: "votre@email.com", required: true },
      { name: "entreprise", type: "text", placeholder: "Nom de votre entreprise", required: false },
      { name: "telephone", type: "tel", placeholder: "Votre téléphone", required: true },
      { name: "projet", type: "textarea", placeholder: "Décrivez votre projet...", required: true },
      {
        name: "budget",
        type: "select",
        placeholder: "Budget estimé",
        required: false,
        options: ["< 1000€", "1000€ - 5000€", "5000€ - 10000€", "> 10000€"],
      },
    ],
    _metadata: {
      formType: "devis",
      cta: "Demander un Devis",
    },
  },
  restaurant: {
    title: "Réservation de Table",
    description: "Réservez votre table en quelques clics",
    fields: [
      { name: "nom", type: "text", placeholder: "Nom de la réservation", required: true },
      { name: "email", type: "email", placeholder: "votre@email.com", required: true },
      { name: "telephone", type: "tel", placeholder: "Votre téléphone", required: true },
      { name: "date_reservation", type: "date", placeholder: "Date souhaitée", required: true },
      { name: "heure_reservation", type: "time", placeholder: "Heure souhaitée", required: true },
      { name: "nombre_personnes", type: "number", placeholder: "Nombre de personnes", required: true },
      { name: "allergies", type: "textarea", placeholder: "Allergies ou demandes spéciales", required: false },
    ],
    _metadata: {
      formType: "restaurant",
      cta: "Réserver la Table",
    },
  },
}

// Détection intelligente du type de formulaire
function detectFormType(specification: string): keyof typeof FALLBACK_FORMS {
  const spec = specification.toLowerCase()

  if (
    spec.includes("expédi") ||
    spec.includes("colis") ||
    spec.includes("abidjan") ||
    spec.includes("paris") ||
    spec.includes("envoi") ||
    spec.includes("transport")
  ) {
    return "expedition"
  } else if (
    spec.includes("restaurant") ||
    spec.includes("table") ||
    spec.includes("réserv") ||
    spec.includes("repas") ||
    spec.includes("dîner")
  ) {
    return "restaurant"
  } else if (spec.includes("devis") || spec.includes("prix") || spec.includes("tarif") || spec.includes("coût")) {
    return "devis"
  } else if (spec.includes("contact") || spec.includes("message") || spec.includes("question")) {
    return "contact"
  }

  return "contact"
}

// Générateur de formulaire intelligent avec fallback immédiat
function generateIntelligentFallback(specification: string): any {
  const formType = detectFormType(specification)
  const baseForm = FALLBACK_FORMS[formType]

  // Personnaliser le formulaire selon la spécification
  const customizedForm = { ...baseForm }

  // Personnalisation basée sur les mots-clés
  if (specification.includes("urgent")) {
    customizedForm.description += " - Traitement prioritaire"
  }

  if (specification.includes("professionnel")) {
    customizedForm.fields = customizedForm.fields.map((field) =>
      field.name === "entreprise" ? { ...field, required: true } : field,
    )
  }

  return {
    ...customizedForm,
    id: Date.now().toString(),
    title: customizedForm.title,
    description: `${customizedForm.description} - Basé sur: "${specification.slice(0, 100)}${specification.length > 100 ? "..." : ""}"`,
    _metadata: {
      ...customizedForm._metadata,
      generatedBy: "numtema-intelligent-fallback",
      timestamp: new Date().toISOString(),
      specification: specification,
      method: "intelligent-fallback",
      formId: Date.now().toString(),
    },
  }
}

// Agent créateur intelligent avec timeout court
async function generateSmartForm(specification: string, apiKey: string) {
  const prompt = `Tu es un expert en création de formulaires web. Analyse cette demande et génère un formulaire JSON précis.

DEMANDE: "${specification}"

INSTRUCTIONS SPÉCIALES POUR EXPÉDITION/COLIS:
Si la demande concerne l'expédition, le transport, les colis, ou contient des mots comme "Abidjan", "Paris", "expédier", "colis", "envoi", utilise EXACTEMENT cette structure :

{
  "title": "Formulaire d'Expédition de Colis",
  "description": "Expédiez vos colis d'Abidjan vers Paris - Devis gratuit",
  "fields": [
    {
      "name": "origine",
      "type": "text",
      "placeholder": "Ville d'origine (Abidjan)",
      "required": true
    },
    {
      "name": "destination", 
      "type": "text",
      "placeholder": "Ville de destination (Paris)",
      "required": true
    },
    {
      "name": "poids",
      "type": "number",
      "placeholder": "Poids du colis en kg",
      "required": true
    },
    {
      "name": "nom_expediteur",
      "type": "text", 
      "placeholder": "Nom de l'expéditeur",
      "required": true
    },
    {
      "name": "tel_expediteur",
      "type": "tel",
      "placeholder": "Téléphone de l'expéditeur",
      "required": true
    },
    {
      "name": "nom_destinataire",
      "type": "text",
      "placeholder": "Nom du destinataire", 
      "required": true
    },
    {
      "name": "tel_destinataire",
      "type": "tel",
      "placeholder": "Téléphone du destinataire",
      "required": true
    },
    {
      "name": "message",
      "type": "textarea",
      "placeholder": "Message à envoyer",
      "required": false
    }
  ],
  "_metadata": {
    "formType": "expedition",
    "cta": "Demander un Devis"
  }
}

POUR AUTRES TYPES DE FORMULAIRES:
1. Analyse la demande pour identifier le type
2. Extrais tous les champs nécessaires  
3. Détermine les types appropriés (text, email, tel, number, select, textarea, file, date, time)
4. Pour les select, génère des options pertinentes
5. Identifie les champs obligatoires vs optionnels
6. Crée un titre et description appropriés
7. Ajoute un CTA adapté dans _metadata

TYPES DE CHAMPS DISPONIBLES:
- text: texte simple
- email: adresse email
- tel: numéro de téléphone  
- number: nombre
- select: liste déroulante (avec options)
- textarea: texte long
- file: fichier
- date: date
- time: heure

FORMAT DE RÉPONSE (JSON strict):
{
  "title": "Titre du formulaire",
  "description": "Description courte",
  "fields": [
    {
      "name": "nom_du_champ",
      "type": "type_du_champ", 
      "placeholder": "Texte d'aide",
      "required": true/false,
      "options": ["option1", "option2"] // SEULEMENT pour type "select"
    }
  ],
  "_metadata": {
    "formType": "type_detecte",
    "cta": "Texte du bouton principal",
    "ctaSecondary": "Texte du bouton secondaire (optionnel)"
  }
}

GÉNÈRE MAINTENANT LE FORMULAIRE JSON:`

  try {
    // Timeout plus court pour éviter d'attendre trop longtemps
    const response = await Promise.race([
      callGemini(prompt, apiKey, "gemini-1.5-flash", {
        maxOutputTokens: 1200,
        temperature: 0.2,
      }),
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout - API trop lente")), 10000)),
    ])

    // Nettoyer la réponse pour extraire le JSON
    let jsonStr = response.trim()
    jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    const firstBrace = jsonStr.indexOf("{")
    if (firstBrace > 0) {
      jsonStr = jsonStr.substring(firstBrace)
    }

    const lastBrace = jsonStr.lastIndexOf("}")
    if (lastBrace > 0) {
      jsonStr = jsonStr.substring(0, lastBrace + 1)
    }

    const formData = JSON.parse(jsonStr)

    // Validation et nettoyage
    if (!formData.title || !formData.fields || !Array.isArray(formData.fields)) {
      throw new Error("Format invalide")
    }

    // Validation des champs
    for (const field of formData.fields) {
      if (!field.name || !field.type || !field.placeholder) {
        throw new Error("Champ invalide")
      }

      field.name = field.name.toLowerCase().replace(/[^a-z0-9_]/g, "_")

      const validTypes = ["text", "email", "tel", "number", "select", "textarea", "file", "date", "time"]
      if (!validTypes.includes(field.type)) {
        field.type = "text"
      }

      field.required = Boolean(field.required)
    }

    // S'assurer que les métadonnées existent
    if (!formData._metadata) {
      formData._metadata = {}
    }

    // Détecter le type si pas spécifié
    if (!formData._metadata.formType) {
      formData._metadata.formType = detectFormType(specification)
    }

    // CTA par défaut si pas spécifié
    if (!formData._metadata.cta) {
      switch (formData._metadata.formType) {
        case "expedition":
          formData._metadata.cta = "Demander un Devis"
          formData._metadata.ctaSecondary = "Réserver l'Expédition"
          break
        case "contact":
          formData._metadata.cta = "Envoyer le Message"
          break
        case "devis":
          formData._metadata.cta = "Demander un Devis"
          break
        case "restaurant":
          formData._metadata.cta = "Réserver la Table"
          break
        default:
          formData._metadata.cta = "Envoyer"
      }
    }

    return formData
  } catch (error) {
    console.error("Erreur génération intelligente:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const { request: specification } = await request.json()

    if (!specification || specification.length < 10) {
      return NextResponse.json({ error: "Description trop courte (minimum 10 caractères)" }, { status: 400 })
    }

    const apiKey = "AIzaSyCGxrPEJK_JHsb8ZA8YoAPtK4CfmD7c5eI"

    // Vérifier immédiatement si on doit utiliser le fallback
    const shouldUseFallback = !apiKey || apiKey.length < 20

    if (shouldUseFallback) {
      console.log("🔄 Utilisation immédiate du fallback intelligent (pas de clé API valide)")
      const fallbackForm = generateIntelligentFallback(specification)
      return NextResponse.json(fallbackForm)
    }

    try {
      console.log("🤖 Tentative de génération IA pour:", specification.substring(0, 50) + "...")

      // Tentative de génération intelligente avec Gemini
      const smartForm = await generateSmartForm(specification, apiKey)

      // Ajouter les métadonnées
      const customForm = {
        ...smartForm,
        id: Date.now().toString(),
        _metadata: {
          ...smartForm._metadata,
          generatedBy: "numtema-ai-smart",
          timestamp: new Date().toISOString(),
          specification: specification,
          method: "ai-generated",
          formId: Date.now().toString(),
        },
      }

      console.log("✅ Formulaire IA créé avec succès:", customForm.title)
      return NextResponse.json(customForm)
    } catch (aiError: any) {
      console.error("❌ Erreur IA, utilisation du fallback intelligent:", aiError.message)

      // Utiliser le fallback intelligent au lieu du template basique
      const fallbackForm = generateIntelligentFallback(specification)
      fallbackForm._metadata.aiError = aiError.message
      fallbackForm._metadata.errorType = aiError.message?.includes("503")
        ? "overload"
        : aiError.message?.includes("403")
          ? "permission"
          : aiError.message?.includes("429")
            ? "quota"
            : "unknown"

      console.log("🔄 Formulaire fallback intelligent créé:", fallbackForm.title)
      return NextResponse.json(fallbackForm)
    }
  } catch (error: any) {
    console.error("💥 Erreur serveur génération:", error)

    // Même en cas d'erreur serveur, retourner un fallback
    try {
      const { request: specification } = await request.json()
      const emergencyFallback = generateIntelligentFallback(specification || "Formulaire de contact")
      emergencyFallback._metadata.serverError = error.message
      return NextResponse.json(emergencyFallback)
    } catch {
      return NextResponse.json(
        {
          error: "Erreur serveur lors de la génération du formulaire",
          details: error.message,
        },
        { status: 500 },
      )
    }
  }
}
