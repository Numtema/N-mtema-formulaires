import { type NextRequest, NextResponse } from "next/server"
import { processFormResponse } from "@/lib/gemini"
import { saveSubmissionToBlob, getSubmissionsFromBlob, uploadFileToBlob, getFormsFromBlob } from "@/lib/blob-storage"

// Fonction pour détecter les champs de nom
function findNameField(submission: any): string | null {
  const nameFields = [
    "nom",
    "prenom",
    "nom_complet",
    "nom_du_contact",
    "contact",
    "name",
    "full_name",
    "first_name",
    "last_name",
    "client_name",
    "nom_client",
  ]

  for (const field of nameFields) {
    if (submission[field] && submission[field].trim()) {
      return submission[field].trim()
    }
  }
  return null
}

// Fonction pour détecter les champs d'email
function findEmailField(submission: any): string | null {
  const emailFields = ["email", "mail", "e_mail", "adresse_email", "courriel"]
  for (const field of emailFields) {
    if (submission[field] && submission[field].trim()) {
      return submission[field].trim()
    }
  }
  return null
}

// Fonction pour détecter les champs de message
function findMessageField(submission: any): string | null {
  const messageFields = [
    "message",
    "commentaires",
    "description",
    "demande",
    "details",
    "contenu",
    "texte",
    "remarques",
    "observations",
    "notes",
  ]
  for (const field of messageFields) {
    if (submission[field] && submission[field].trim()) {
      return submission[field].trim()
    }
  }
  return null
}

// Ajouter ces fonctions de détection spécialisées après les fonctions existantes :

// Fonction pour détecter les formulaires d'expédition
function detectExpeditionFields(submission: any) {
  const expeditionFields = {
    origine: submission.ville_origine || submission.origine || submission.depart,
    destination: submission.ville_destination || submission.destination || submission.arrivee,
    poids: submission.poids_colis || submission.poids,
    expediteur: submission.nom_expediteur || submission.expediteur,
    tel_expediteur: submission.tel_expediteur || submission.telephone_expediteur,
    destinataire: submission.nom_destinataire || submission.destinataire,
    tel_destinataire: submission.tel_destinataire || submission.telephone_destinataire,
    type_envoi: submission.type_envoi || submission.service,
  }

  return expeditionFields
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extraire tous les champs du formulaire
    const submission: any = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      isTest: formData.get("_test") === "true",
      formType: (formData.get("_formType") as string) || "custom",
      files: [] as string[],
      // Métadonnées d'embed
      isEmbedded: formData.get("_embedded") === "true",
      formId: formData.get("_formId") as string,
      embedUrl: formData.get("_embedUrl") as string,
      embedDomain: formData.get("_embedDomain") as string,
    }

    // Si c'est un formulaire embedé, récupérer les infos du formulaire original
    if (submission.isEmbedded && submission.formId) {
      try {
        const forms = await getFormsFromBlob()
        const originalForm = forms.find((f) => f.id === submission.formId)
        if (originalForm) {
          submission.originalFormTitle = originalForm.title
          submission.originalFormDescription = originalForm.description
          submission.formType = originalForm._metadata?.formType || "custom"
        }
      } catch (error) {
        console.error("Erreur récupération formulaire original:", error)
      }
    }

    // Dans la fonction POST, après la détection du type de formulaire, ajouter :
    if (submission.formType === "expedition" || submission.ville_origine || submission.poids_colis) {
      const expeditionData = detectExpeditionFields(submission)
      submission._expeditionData = expeditionData
      submission.formType = "expedition"
    }

    // Traiter les fichiers uploadés
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        try {
          const fileUrl = await uploadFileToBlob(value, "submissions")
          submission.files.push(fileUrl)
          submission[key] = fileUrl // Garder aussi l'URL dans le champ original
        } catch (error) {
          console.error("Erreur upload fichier:", error)
          submission[key] = `Erreur upload: ${value.name}`
        }
      } else if (!key.startsWith("_")) {
        submission[key] = value as string
      }
    }

    // Validation flexible
    const nameValue = findNameField(submission)
    const emailValue = findEmailField(submission)
    const messageValue = findMessageField(submission)

    if (!nameValue && !emailValue && !messageValue) {
      return NextResponse.json({ error: "Veuillez remplir au moins un champ (nom, email ou message)" }, { status: 400 })
    }

    // Ajouter les champs normalisés
    if (nameValue) submission._normalizedName = nameValue
    if (emailValue) submission._normalizedEmail = emailValue
    if (messageValue) submission._normalizedMessage = messageValue

    // Sauvegarder dans Blob Store
    await saveSubmissionToBlob({
      id: submission.id,
      timestamp: submission.timestamp,
      formType: submission.formType,
      isTest: submission.isTest,
      data: submission,
      files: submission.files,
    })

    // Traitement par l'agent IA avec contexte d'embed
    const apiKey = "AIzaSyCGxrPEJK_JHsb8ZA8YoAPtK4CfmD7c5eI"
    let aiResponse = ""

    try {
      let contextPrompt = ""

      if (submission.isEmbedded) {
        contextPrompt = `Cette soumission provient d'un formulaire intégré sur ${submission.embedDomain}. `
      }

      switch (submission.formType) {
        case "sondage":
          contextPrompt += `Analyse ce sondage de satisfaction et remercie chaleureusement.`
          break
        case "devis":
          contextPrompt += `Traite cette demande de devis professionnellement.`
          break
        case "candidature":
          contextPrompt += `Réponds à cette candidature avec professionnalisme.`
          break
        case "inscription":
          contextPrompt += `Confirme cette inscription à l'événement.`
          break
        default:
          if (submission.pays_expedition && submission.pays_arrivee) {
            contextPrompt += `Traite cette demande d'expédition de colis.`
          } else {
            contextPrompt += `Traite cette soumission de formulaire de manière professionnelle.`
          }
      }

      aiResponse = await processFormResponse(
        {
          ...submission,
          context: contextPrompt,
          name: nameValue,
          email: emailValue,
          message: messageValue,
        },
        apiKey,
      )
    } catch (error) {
      console.error("Erreur agent IA:", error)
      const displayName = nameValue || "cher client"

      // Réponses par défaut selon le contexte
      if (submission.isEmbedded) {
        if (submission.pays_expedition && submission.pays_arrivee) {
          aiResponse = `Bonjour ${displayName}, nous avons bien reçu votre demande d'expédition de ${submission.pays_expedition} vers ${submission.pays_arrivee}. Notre équipe vous contactera pour finaliser les détails. 📦✈️`
        } else {
          aiResponse = `Bonjour ${displayName}, merci pour votre message ! Nous avons bien reçu votre demande et vous recontacterons rapidement. 📧`
        }
      } else {
        aiResponse = `Bonjour ${displayName}, merci pour votre message ! Nous vous recontacterons bientôt. 📧`
      }
    }

    return NextResponse.json({
      success: true,
      message: aiResponse,
      submissionId: submission.id,
      isTest: submission.isTest,
      isEmbedded: submission.isEmbedded,
      filesUploaded: submission.files.length,
    })
  } catch (error: any) {
    console.error("Erreur collecte:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// GET - Récupérer toutes les soumissions
export async function GET() {
  try {
    const submissions = await getSubmissionsFromBlob()

    return NextResponse.json({
      submissions: submissions.slice(0, 50), // Limiter à 50 pour les performances
      total: submissions.length,
      tests: submissions.filter((s) => s.isTest).length,
      real: submissions.filter((s) => !s.isTest).length,
      embedded: submissions.filter((s) => s.data.isEmbedded).length,
    })
  } catch (error) {
    console.error("Erreur récupération soumissions:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
