"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, Code, Eye, Settings, CheckCircle, ExternalLink, Globe, AlertTriangle } from "lucide-react"

interface EmbedConfig {
  theme: string
  width: string
  height: string
}

export function EmbedGenerator({ formData }: { formData?: any }) {
  const [config, setConfig] = useState<EmbedConfig>({
    theme: "light",
    width: "400px",
    height: "auto",
  })
  const [copied, setCopied] = useState<string | null>(null)

  const formId = formData?.id || formData?._metadata?.formId || Date.now().toString()
  console.log("🔍 FormID pour embed:", formId, "FormData:", formData)

  // Logique améliorée pour déterminer l'URL de base
  const getBaseUrl = () => {
    // 1. Priorité absolue : variable d'environnement NEXT_PUBLIC_APP_URL
    if (process.env.NEXT_PUBLIC_APP_URL) {
      const url = process.env.NEXT_PUBLIC_APP_URL
      return url.endsWith("/") ? url.slice(0, -1) : url
    }

    // 2. Si on est côté client, essayer de détecter l'environnement
    if (typeof window !== "undefined") {
      const origin = window.location.origin

      // Si on est dans un environnement de prévisualisation v0, utiliser l'URL configurée
      if (origin.includes("lite.vusercontent.net") || origin.includes("v0.dev")) {
        console.warn("⚠️ Environnement de prévisualisation détecté. Utilisation de l'URL de production configurée.")
        return "https://v0-formulaireai.vercel.app" // URL de production configurée
      }

      return origin
    }

    // 3. Fallback serveur avec l'URL configurée
    return "https://v0-formulaireai.vercel.app"
  }

  const baseUrl = getBaseUrl()

  // Ajouter cette détection après la déclaration de baseUrl
  const isPreviewEnvironment =
    typeof window !== "undefined" &&
    (window.location.origin.includes("lite.vusercontent.net") || window.location.origin.includes("v0.dev")) &&
    !process.env.NEXT_PUBLIC_APP_URL

  const generateEmbedCode = () => {
    return `<iframe 
  src="${baseUrl}/api/embed?id=${formId}&theme=${config.theme}&width=${config.width}&height=${config.height}" 
  width="${config.width}" 
  height="${config.height === "auto" ? "600" : config.height}"
  frameborder="0" 
  style="border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); max-width: 100%;"
  title="Formulaire ${formData?.title || "Nümtema"}">
</iframe>

<script>
// Auto-resize pour iframe responsive
window.addEventListener('message', function(e) {
  if (e.data.type === 'numtema-resize') {
    const iframe = document.querySelector('iframe[src*="numtema"]');
    if (iframe) iframe.style.height = e.data.height + 'px';
  }
});
</script>`
  }

  const generateScriptCode = () => {
    return `<div id="numtema-form-container"></div>

<script>
(function() {
  // Configuration
  const config = {
    formId: '${formId}',
    theme: '${config.theme}',
    width: '${config.width}',
    height: '${config.height}',
    baseUrl: '${baseUrl}'
  };
  
  // Créer l'iframe
  const iframe = document.createElement('iframe');
  iframe.src = config.baseUrl + '/api/embed?id=' + config.formId + 
               '&theme=' + config.theme + 
               '&width=' + config.width + 
               '&height=' + config.height;
  iframe.width = config.width;
  iframe.height = config.height === 'auto' ? '600' : config.height;
  iframe.frameBorder = '0';
  iframe.style.borderRadius = '20px';
  iframe.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)';
  iframe.style.maxWidth = '100%';
  iframe.title = 'Formulaire ${formData?.title || "Nümtema"}';
  
  // Auto-resize
  window.addEventListener('message', function(e) {
    if (e.data.type === 'numtema-resize') {
      iframe.style.height = e.data.height + 'px';
    }
  });
  
  // Callback personnalisé (optionnel)
  window.numtemaCallback = function(result) {
    console.log('Formulaire soumis:', result);
    // Ajoutez votre logique personnalisée ici
  };
  
  // Insérer dans le container
  const container = document.getElementById('numtema-form-container');
  if (container) {
    container.appendChild(iframe);
  }
})();
</script>`
  }

  const generateWordPressCode = () => {
    return `<!-- Shortcode WordPress -->
[iframe src="${baseUrl}/api/embed?id=${formId}&theme=${config.theme}&width=${config.width}&height=${config.height}" width="${config.width}" height="${config.height === "auto" ? "600" : config.height}" frameborder="0" style="border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); max-width: 100%;"]

<!-- Ou code HTML direct -->
${generateEmbedCode()}`
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const previewUrl = () => {
    return `${baseUrl}/api/embed?id=${formId}&theme=${config.theme}&width=${config.width}&height=${config.height}`
  }

  return (
    <Card className="glass-card border-0 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Code className="w-5 h-5 text-indigo-600" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Générateur d'Embed</h3>
        {isPreviewEnvironment && (
          <Alert className="mb-4 rounded-xl border-0 bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>⚠️ Environnement de prévisualisation détecté</strong>
              <br />
              Pour obtenir le code embed final avec la bonne URL, accédez à votre application déployée sur Vercel et
              générez le code depuis là.
              <br />
              <strong>URL recommandée :</strong> Configurez NEXT_PUBLIC_APP_URL dans vos variables d'environnement
              Vercel.
            </AlertDescription>
          </Alert>
        )}
        {formData && (
          <div className="ml-auto flex items-center gap-2">
            <Globe className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-600 font-medium">Formulaire: {formData.title}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Thème</Label>
            <Select value={config.theme} onValueChange={(value) => setConfig({ ...config, theme: value })}>
              <SelectTrigger className="rounded-xl border-0 glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">🌞 Clair</SelectItem>
                <SelectItem value="dark">🌙 Sombre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Largeur</Label>
              <Select value={config.width} onValueChange={(value) => setConfig({ ...config, width: value })}>
                <SelectTrigger className="rounded-xl border-0 glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="300px">300px (Mobile)</SelectItem>
                  <SelectItem value="400px">400px (Standard)</SelectItem>
                  <SelectItem value="500px">500px (Large)</SelectItem>
                  <SelectItem value="100%">100% (Responsive)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hauteur</Label>
              <Select value={config.height} onValueChange={(value) => setConfig({ ...config, height: value })}>
                <SelectTrigger className="rounded-xl border-0 glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto (Recommandé)</SelectItem>
                  <SelectItem value="500px">500px</SelectItem>
                  <SelectItem value="600px">600px</SelectItem>
                  <SelectItem value="700px">700px</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => window.open(previewUrl(), "_blank")}
              variant="outline"
              className="flex-1 rounded-xl glass-card border-0"
            >
              <Eye className="w-4 h-4 mr-2" />
              Prévisualiser
            </Button>
            <Button
              onClick={() => window.open(previewUrl(), "_blank")}
              variant="outline"
              className="rounded-xl glass-card border-0"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Codes d'intégration */}
        <div className="space-y-4">
          {/* Code iframe */}
          <div className="space-y-2">
            <Label>Code iframe (Recommandé)</Label>
            <Textarea
              value={generateEmbedCode()}
              readOnly
              rows={8}
              className="rounded-xl border-0 glass-input font-mono text-xs"
            />
            <Button
              onClick={() => copyToClipboard(generateEmbedCode(), "iframe")}
              size="sm"
              className="w-full rounded-xl"
            >
              {copied === "iframe" ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied === "iframe" ? "Copié !" : "Copier iframe"}
            </Button>
          </div>

          {/* Code JavaScript */}
          <div className="space-y-2">
            <Label>Code JavaScript Avancé</Label>
            <Textarea
              value={generateScriptCode()}
              readOnly
              rows={6}
              className="rounded-xl border-0 glass-input font-mono text-xs"
            />
            <Button
              onClick={() => copyToClipboard(generateScriptCode(), "js")}
              size="sm"
              variant="outline"
              className="w-full rounded-xl glass-card border-0"
            >
              {copied === "js" ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied === "js" ? "Copié !" : "Copier JavaScript"}
            </Button>
          </div>

          {/* Code WordPress */}
          <div className="space-y-2">
            <Label>Code WordPress</Label>
            <Textarea
              value={generateWordPressCode()}
              readOnly
              rows={4}
              className="rounded-xl border-0 glass-input font-mono text-xs"
            />
            <Button
              onClick={() => copyToClipboard(generateWordPressCode(), "wp")}
              size="sm"
              variant="outline"
              className="w-full rounded-xl glass-card border-0"
            >
              {copied === "wp" ? <CheckCircle className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied === "wp" ? "Copié !" : "Copier WordPress"}
            </Button>
          </div>
        </div>
      </div>

      <Alert className="mt-6 rounded-xl border-0 glass-card">
        <Settings className="h-4 w-4" />
        <AlertDescription>
          <strong>🎯 Instructions d'intégration :</strong>
          <br />
          1. **Copiez** le code iframe ou JavaScript
          <br />
          2. **Collez-le** sur votre site web (HTML, WordPress, etc.)
          <br />
          3. **Les réponses** arrivent automatiquement dans votre Dashboard
          <br />
          4. **L'agent IA** traite et répond automatiquement aux visiteurs
          <br />
          5. **Traçabilité complète** : vous voyez qui remplit depuis quel site !
        </AlertDescription>
      </Alert>

      {formData && (
        <Alert className="mt-4 rounded-xl border-0 glass-success">
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>✅ Formulaire lié :</strong> "{formData.title}"
            <br />
            Toutes les soumissions de ce formulaire embedé apparaîtront dans votre Dashboard avec les détails du site
            d'origine.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
