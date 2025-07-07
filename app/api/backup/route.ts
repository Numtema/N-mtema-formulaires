import { NextResponse } from "next/server"
import { createBackup, getFormsFromBlob, getSubmissionsFromBlob } from "@/lib/blob-storage"

// GET - Créer un backup
export async function GET() {
  try {
    const backupUrl = await createBackup()

    return NextResponse.json({
      success: true,
      backupUrl,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Erreur création backup:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Obtenir les statistiques
export async function POST() {
  try {
    const forms = await getFormsFromBlob()
    const submissions = await getSubmissionsFromBlob()

    const stats = {
      forms: {
        total: forms.length,
        byType: forms.reduce(
          (acc, form) => {
            const type = form._metadata?.formType || "custom"
            acc[type] = (acc[type] || 0) + 1
            return acc
          },
          {} as Record<string, number>,
        ),
        recent: forms.filter((f) => new Date(f.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
      },
      submissions: {
        total: submissions.length,
        tests: submissions.filter((s) => s.isTest).length,
        real: submissions.filter((s) => !s.isTest).length,
        withFiles: submissions.filter((s) => s.files && s.files.length > 0).length,
        recent: submissions.filter((s) => new Date(s.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
      },
      storage: {
        lastBackup: new Date().toISOString(),
        blobConnected: true,
      },
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Erreur statistiques:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
