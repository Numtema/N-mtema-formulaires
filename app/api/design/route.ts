import { type NextRequest, NextResponse } from "next/server"
import { callGemini } from "@/lib/gemini"

// Templates de base comme fallback
const FALLBACK_FORMS = {
  contact: {
    title: "Formulaire de Contact",
    description: "Contactez-nous facilement",
    fields: [
      { name: "nom", type: "text", placeholder: "Votre nom complet", required: true },
      { name: "email", type: "email", placeholder: "votre@email.com", required: true },
      { name: "message", type: "textarea", placeholder: "Votre message...", required: true },
    ],
  },
}

// Agent créateur intelligent
async function generateSmartForm(specification: string, apiKey: string) {
  const prompt = `Tu es un expert en création de formulaires web. Analyse cette demande et génère un formulaire JSON précis.

DEMANDE: "${specification}"

INSTRUCTIONS:
1. Analyse la demande pour identifier le type de formulaire
2. Extrais tous les champs nécessaires
3. Détermine les types de champs appropriés (text, email, tel, number, select, textarea, file)
4. Pour les champs select, génère des options pertinentes
5. Identifie les champs obligatoires vs optionnels
6. Crée un titre et une description appropriés

TYPES DE CHAMPS DISPONIBLES:
- text: texte simple
- email: adresse email
- tel: numéro de téléphone  
- number: nombre
- select: liste déroulante (avec options)
- textarea: texte long
- file: fichier

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
  ]
}

EXEMPLES DE CHAMPS SELON LE CONTEXTE:
- Expédition: pays_expedition, pays_arrivee, type_envoi, poids, dimensions
- E-commerce: produit, quantite, couleur, taille, mode_livraison
- Immobilier: type_bien, surface, prix, localisation, nb_pieces
- Restauration: plat, allergies, nb_personnes, date_reservation
- Santé: symptomes, age, antecedents, urgence

GÉNÈRE MAINTENANT LE FORMULAIRE JSON:`

  try {
    const response = await callGemini(prompt, apiKey, "gemini-1.5-flash", {
      maxOutputTokens: 1000,
      temperature: 0.3,
    })

    // Nettoyer la réponse pour extraire le JSON
    let jsonStr = response.trim()

    // Supprimer les balises markdown si présentes
    jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "")

    // Supprimer tout texte avant le premier {
    const firstBrace = jsonStr.indexOf("{")
    if (firstBrace > 0) {
      jsonStr = jsonStr.substring(firstBrace)
    }

    // Supprimer tout texte après le dernier }
    const lastBrace = jsonStr.lastIndexOf("}")
    if (lastBrace > 0) {
      jsonStr = jsonStr.substring(0, lastBrace + 1)
    }

    const formData = JSON.parse(jsonStr)

    // Validation du format
    if (!formData.title || !formData.fields || !Array.isArray(formData.fields)) {
      throw new Error("Format invalide")
    }

    // Validation des champs
    for (const field of formData.fields) {
      if (!field.name || !field.type || !field.placeholder) {
        throw new Error("Champ invalide")
      }

      // Nettoyer le nom du champ
      field.name = field.name.toLowerCase().replace(/[^a-z0-9_]/g, "_")

      // Valider le type
      const validTypes = ["text", "email", "tel", "number", "select", "textarea", "file"]
      if (!validTypes.includes(field.type)) {
        field.type = "text"
      }

      // S'assurer que required est un boolean
      field.required = Boolean(field.required)
    }

    return formData
  } catch (error) {
    console.error("Erreur génération intelligente:", error)
    throw error
  }
}

// Détection de type pour fallback
function detectFormType(specification: string): string {
  const spec = specification.toLowerCase()
  if (spec.includes("contact")) return "contact"
  return "contact"
}

export async function POST(request: NextRequest) {
  try {
    const { request: specification } = await request.json()

    if (!specification || specification.length < 10) {
      return NextResponse.json({ error: "Description trop courte (minimum 10 caractères)" }, { status: 400 })
    }

    const apiKey = "AIzaSyCGxrPEJK_JHsb8ZA8YoAPtK4CfmD7c5eI"

    try {
      // Tentative de génération intelligente avec Gemini
      const smartForm = await generateSmartForm(specification, apiKey)

      // Ajouter les métadonnées
      const customForm = {
        ...smartForm,
        id: Date.now().toString(), // S'assurer qu'on a un ID unique
        _metadata: {
          generatedBy: "numtema-ai-smart",
          timestamp: new Date().toISOString(),
          specification: specification,
          formType: "custom",
          method: "ai-generated",
          formId: Date.now().toString(), // Ajouter aussi dans les métadonnées
        },
      }

      console.log("💾 Formulaire créé avec ID:", customForm.id)

      return NextResponse.json(customForm)
    } catch (aiError) {
      console.error("Erreur IA, utilisation du fallback:", aiError)

      // Fallback vers les templates prédéfinis
      const formType = detectFormType(specification)
      const baseForm = FALLBACK_FORMS[formType as keyof typeof FALLBACK_FORMS]

      const fallbackForm = {
        ...baseForm,
        title: `${baseForm.title} - ${specification.slice(0, 50)}`,
        _metadata: {
          generatedBy: "numtema-ai-fallback",
          timestamp: new Date().toISOString(),
          specification: specification,
          formType: formType,
          method: "template-based",
          aiError: aiError.message,
        },
      }

      return NextResponse.json(fallbackForm)
    }
  } catch (error: any) {
    console.error("Erreur génération:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
