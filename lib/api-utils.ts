export function getGeminiApiKey(): string {
  if (typeof window !== "undefined") {
    return localStorage.getItem("gemini_api_key") || "AIzaSyCGxrPEJK_JHsb8ZA8YoAPtK4CfmD7c5eI"
  }
  return "AIzaSyCGxrPEJK_JHsb8ZA8YoAPtK4CfmD7c5eI"
}

// Ajouter une nouvelle fonction pour l'URL de base
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = process.env.NEXT_PUBLIC_APP_URL
    return url.endsWith("/") ? url.slice(0, -1) : url
  }

  if (typeof window !== "undefined") {
    return window.location.origin
  }

  return "https://v0-formulaireai.vercel.app"
}
