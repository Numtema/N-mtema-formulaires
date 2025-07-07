import type { NextRequest } from "next/server"
import { getFormsFromBlob } from "@/lib/blob-storage"

// Générateur de widget embeddable intelligent
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const formId = searchParams.get("id")
  const theme = searchParams.get("theme") || "light"
  const width = searchParams.get("width") || "400px"
  const height = searchParams.get("height") || "auto"

  let formData = null
  let formTitle = "Formulaire Intelligent"
  let formFields: any[] = []

  // Si un ID de formulaire est fourni, récupérer le formulaire depuis Blob Store
  if (formId && formId !== "default") {
    try {
      console.log("🔍 Embed API: Recherche formulaire ID:", formId)
      const forms = await getFormsFromBlob()
      console.log("📋 Embed API: Formulaires trouvés dans Blob:", forms.length)

      // Chercher par ID exact d'abord
      formData = forms.find((f) => f.id === formId)

      // Si pas trouvé, chercher par ID dans les métadonnées (pour compatibilité)
      if (!formData) {
        formData = forms.find((f) => f._metadata?.formId === formId)
      }

      // Si toujours pas trouvé, prendre le plus récent comme fallback
      if (!formData && forms.length > 0) {
        formData = forms[0] // Le plus récent est le premier après le tri
        console.log("⚠️ Embed API: Formulaire non trouvé pour ID, utilisation du plus récent:", formData.title)
      }

      if (formData) {
        console.log("✅ Embed API: Formulaire trouvé:", formData.title, "avec", formData.fields.length, "champs")
        formTitle = formData.title
        formFields = formData.fields
      } else {
        console.log("❌ Embed API: Aucun formulaire trouvé pour ID:", formId, "Utilisation du formulaire par défaut.")
      }
    } catch (error) {
      console.error("❌ Embed API: Erreur récupération formulaire pour embed:", error)
    }
  }

  // Si pas de formulaire trouvé (ou si formId était "default"), utiliser un formulaire par défaut simple
  if (!formData || formId === "default") {
    formTitle = "Formulaire de Contact Rapide"
    formFields = [
      { name: "nom", type: "text", placeholder: "Votre nom complet", required: true },
      { name: "email", type: "email", placeholder: "votre@email.com", required: true },
      { name: "message", type: "textarea", placeholder: "Votre message...", required: true },
    ]
    console.log("ℹ️ Embed API: Formulaire par défaut utilisé.")
  }

  // Générer les champs HTML dynamiquement
  const generateFieldHTML = (field: any) => {
    const fieldId = `field-${field.name}`
    const required = field.required ? "required" : ""

    switch (field.type) {
      case "textarea":
        return `
          <div class="numtema-field">
            <label class="numtema-label" for="${fieldId}">
              ${field.name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              ${field.required ? '<span style="color: #ef4444;">*</span>' : ""}
            </label>
            <textarea 
              id="${fieldId}"
              name="${field.name}" 
              class="numtema-textarea" 
              rows="4" 
              placeholder="${field.placeholder}" 
              ${required}
            ></textarea>
          </div>`

      case "select":
        const options = field.options || ["Option 1", "Option 2", "Option 3"]
        const optionsHTML = options.map((opt: string) => `<option value="${opt}">${opt}</option>`).join("")
        return `
          <div class="numtema-field">
            <label class="numtema-label" for="${fieldId}">
              ${field.name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              ${field.required ? '<span style="color: #ef4444;">*</span>' : ""}
            </label>
            <select 
              id="${fieldId}"
              name="${field.name}" 
              class="numtema-input" 
              ${required}
            >
              <option value="">${field.placeholder}</option>
              ${optionsHTML}
            </select>
          </div>`

      case "file":
        return `
          <div class="numtema-field">
            <label class="numtema-label" for="${fieldId}">
              ${field.name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              ${field.required ? '<span style="color: #ef4444;">*</span>' : ""}
            </label>
            <input 
              id="${fieldId}"
              type="file" 
              name="${field.name}" 
              class="numtema-input" 
              accept=".pdf,.png,.jpg,.jpeg"
              ${required}
            />
            <small style="color: #64748b; font-size: 12px;">PDF, PNG ou JPG uniquement</small>
          </div>`

      case "date": // Ajout du type date
        return `
          <div class="numtema-field">
            <label class="numtema-label" for="${fieldId}">
              ${field.name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              ${field.required ? '<span style="color: #ef4444;">*</span>' : ""}
            </label>
            <input 
              id="${fieldId}"
              type="date" 
              name="${field.name}" 
              class="numtema-input" 
              placeholder="${field.placeholder}" 
              ${required}
            />
          </div>`

      default:
        return `
          <div class="numtema-field">
            <label class="numtema-label" for="${fieldId}">
              ${field.name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
              ${field.required ? '<span style="color: #ef4444;">*</span>' : ""}
            </label>
            <input 
              id="${fieldId}"
              type="${field.type}" 
              name="${field.name}" 
              class="numtema-input" 
              placeholder="${field.placeholder}" 
              ${required}
            />
          </div>`
    }
  }

  const fieldsHTML = formFields.map(generateFieldHTML).join("")

  const embedCode = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Nümtema Form Widget - ${formTitle}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: transparent;
        }
        .numtema-widget {
            width: ${width};
            height: ${height};
            background: ${theme === "dark" ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)"};
            backdrop-filter: blur(20px);
            border-radius: 20px;
            padding: 24px;
            border: 1px solid ${theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            color: ${theme === "dark" ? "#f1f5f9" : "#1e293b"};
            max-width: 100%;
        }
        .numtema-title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .numtema-field {
            margin-bottom: 16px;
        }
        .numtema-label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            font-size: 14px;
        }
        .numtema-input, .numtema-textarea, select.numtema-input {
            width: 100%;
            padding: 12px;
            border: none;
            border-radius: 12px;
            background: ${theme === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"};
            backdrop-filter: blur(10px);
            font-size: 14px;
            color: inherit;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        .numtema-input:focus, .numtema-textarea:focus, select.numtema-input:focus {
            outline: none;
            background: ${theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
        }
        .numtema-textarea {
            resize: vertical;
            min-height: 80px;
        }
        .numtema-button {
            width: 100%;
            padding: 12px 24px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            border: none;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
        }
        .numtema-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(99, 102, 241, 0.3);
        }
        .numtema-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .numtema-response {
            margin-top: 16px;
            padding: 12px;
            border-radius: 12px;
            font-size: 14px;
            line-height: 1.4;
        }
        .numtema-success {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.2);
            color: #059669;
        }
        .numtema-error {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #dc2626;
        }
        .numtema-loading {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        .numtema-powered {
            text-align: center;
            margin-top: 16px;
            font-size: 11px;
            color: #64748b;
        }
        .numtema-powered a {
            color: #6366f1;
            text-decoration: none;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        @media (max-width: 480px) {
            .numtema-widget {
                padding: 16px;
                border-radius: 16px;
            }
        }
    </style>
</head>
<body>
    <div class="numtema-widget" id="numtema-form-${formId || "default"}">
        <div class="numtema-title">${formTitle}</div>
        <form id="numtema-form" onsubmit="submitForm(event)">
            ${fieldsHTML}
            <button type="submit" class="numtema-button" id="submit-btn">
                Envoyer
            </button>
        </form>
        <div id="response-area"></div>
        <div class="numtema-powered">
            Propulsé par <a href="#" target="_blank">Nümtema Formulaires</a>
        </div>
    </div>

    <script>
        // Configuration
        const FORM_ID = '${formId || "default"}';
        const API_BASE = '${process.env.NEXT_PUBLIC_APP_URL || "https://v0-formulaireai.vercel.app"}';
        const cleanApiBase = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
        
        console.log("Numtema Embed Script Loaded!");
        console.log("FORM_ID:", FORM_ID);
        console.log("API_BASE:", API_BASE);

        async function submitForm(event) {
            event.preventDefault();
            
            const form = event.target;
            const formData = new FormData(form);
            const submitBtn = document.getElementById('submit-btn');
            const responseArea = document.getElementById('response-area');
            
            // Ajouter les métadonnées pour traçabilité
            formData.append('_formId', FORM_ID);
            formData.append('_embedded', 'true');
            formData.append('_embedUrl', window.location.href);
            formData.append('_embedDomain', window.location.hostname);
            formData.append('_formType', '${formData?._metadata?.formType || "custom"}');
            
            // État de chargement
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="numtema-loading"></span> Envoi en cours...';
            responseArea.innerHTML = '';
            
            try {
                const response = await fetch(cleanApiBase + '/api/collect', {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    responseArea.innerHTML = \`
                        <div class="numtema-response numtema-success">
                            ✅ \${result.message}
                        </div>
                    \`;
                    form.reset();
                    
                    // Optionnel: callback personnalisé
                    if (window.numtemaCallback) {
                        window.numtemaCallback(result);
                    }
                } else {
                    throw new Error(result.error || 'Erreur lors de l\\'envoi');
                }
            } catch (error) {
                console.error("Numtema Embed Error:", error); // Log the error
                responseArea.innerHTML = \`
                    <div class="numtema-response numtema-error">
                        ❌ Erreur: \${error.message}
                    </div>
                \`;
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Envoyer';
            }
        }
        
        // Auto-resize pour iframe
        function resizeIframe() {
            const height = document.body.scrollHeight;
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    type: 'numtema-resize',
                    height: height
                }, '*');
            }
        }
        
        // Observer les changements de taille
        if (window.ResizeObserver) {
            new ResizeObserver(resizeIframe).observe(document.body);
        }
        
        // Resize initial
        setTimeout(resizeIframe, 100);
    </script>
</body>
</html>
  `

  return new Response(embedCode, {
    headers: {
      "Content-Type": "text/html",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=300", // Cache 5 minutes
    },
  })
}
