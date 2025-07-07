import { NextResponse } from "next/server"
import { getFormsFromBlob } from "@/lib/blob-storage"

// API de debug pour voir tous les formulaires
export async function GET() {
  try {
    const forms = await getFormsFromBlob()

    const debug = {
      total: forms.length,
      forms: forms.map((f) => ({
        id: f.id,
        title: f.title,
        fieldsCount: f.fields?.length || 0,
        createdAt: f.createdAt,
        metadata: f._metadata,
      })),
    }

    return NextResponse.json(debug)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
