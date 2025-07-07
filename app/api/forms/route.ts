import { type NextRequest, NextResponse } from "next/server"
import { saveFormToBlob, getFormsFromBlob, deleteFormFromBlob } from "@/lib/blob-storage"

// GET - Récupérer tous les formulaires
export async function GET() {
  try {
    const forms = await getFormsFromBlob()
    return NextResponse.json({ forms, total: forms.length })
  } catch (error) {
    console.error("Erreur récupération formulaires:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// POST - Sauvegarder un nouveau formulaire
export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    const newForm = {
      ...formData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }

    await saveFormToBlob(newForm)

    return NextResponse.json({ success: true, form: newForm })
  } catch (error) {
    console.error("Erreur sauvegarde formulaire:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

// DELETE - Supprimer un formulaire
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const formId = searchParams.get("id")

    if (!formId) {
      return NextResponse.json({ error: "ID formulaire manquant" }, { status: 400 })
    }

    await deleteFormFromBlob(formId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erreur suppression formulaire:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
