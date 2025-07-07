import { put, list, del } from "@vercel/blob"

// Types pour la structure des données
export interface SavedForm {
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

export interface StoredSubmission {
  id: string
  timestamp: string
  formType: string
  isTest: boolean
  data: Record<string, any>
  files?: string[] // URLs des fichiers uploadés
}

// Sauvegarder un formulaire dans Blob
export async function saveFormToBlob(form: SavedForm): Promise<void> {
  try {
    const blob = await put(`forms/${form.id}.json`, JSON.stringify(form), {
      access: "public",
      addRandomSuffix: false,
    })
    console.log("Formulaire sauvegardé:", blob.url)
  } catch (error) {
    console.error("Erreur sauvegarde formulaire:", error)
    throw error
  }
}

// Récupérer tous les formulaires depuis Blob
export async function getFormsFromBlob(): Promise<SavedForm[]> {
  try {
    const { blobs } = await list({ prefix: "forms/" })
    const forms: SavedForm[] = []

    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url)
        const form = await response.json()
        forms.push(form)
      } catch (error) {
        console.error("Erreur lecture formulaire:", blob.pathname, error)
      }
    }

    return forms.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (error) {
    console.error("Erreur récupération formulaires:", error)
    return []
  }
}

// Supprimer un formulaire
export async function deleteFormFromBlob(formId: string): Promise<void> {
  try {
    await del(`forms/${formId}.json`)
    console.log("Formulaire supprimé:", formId)
  } catch (error) {
    console.error("Erreur suppression formulaire:", error)
    throw error
  }
}

// Sauvegarder une soumission dans Blob
export async function saveSubmissionToBlob(submission: StoredSubmission): Promise<void> {
  try {
    const blob = await put(`submissions/${submission.id}.json`, JSON.stringify(submission), {
      access: "public",
      addRandomSuffix: false,
    })
    console.log("Soumission sauvegardée:", blob.url)
  } catch (error) {
    console.error("Erreur sauvegarde soumission:", error)
    throw error
  }
}

// Récupérer toutes les soumissions depuis Blob
export async function getSubmissionsFromBlob(): Promise<StoredSubmission[]> {
  try {
    const { blobs } = await list({ prefix: "submissions/" })
    const submissions: StoredSubmission[] = []

    for (const blob of blobs) {
      try {
        const response = await fetch(blob.url)
        const submission = await response.json()
        submissions.push(submission)
      } catch (error) {
        console.error("Erreur lecture soumission:", blob.pathname, error)
      }
    }

    return submissions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  } catch (error) {
    console.error("Erreur récupération soumissions:", error)
    return []
  }
}

// Upload d'un fichier
export async function uploadFileToBlob(file: File, folder = "uploads"): Promise<string> {
  try {
    const filename = `${folder}/${Date.now()}-${file.name}`
    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: true,
    })
    return blob.url
  } catch (error) {
    console.error("Erreur upload fichier:", error)
    throw error
  }
}

// Créer un backup complet
export async function createBackup(): Promise<string> {
  try {
    const forms = await getFormsFromBlob()
    const submissions = await getSubmissionsFromBlob()

    const backup = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      forms,
      submissions,
      stats: {
        totalForms: forms.length,
        totalSubmissions: submissions.length,
        testSubmissions: submissions.filter((s) => s.isTest).length,
      },
    }

    const filename = `backups/backup-${Date.now()}.json`
    const blob = await put(filename, JSON.stringify(backup, null, 2), {
      access: "public",
      addRandomSuffix: false,
    })

    return blob.url
  } catch (error) {
    console.error("Erreur création backup:", error)
    throw error
  }
}
