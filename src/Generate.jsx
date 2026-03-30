import { useState } from 'react'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

function Generate() {
  const [offreEmploi, setOffreEmploi] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [cvTexte, setCvTexte] = useState('')
  const [loading, setLoading] = useState(false)
  const [cvGenere, setCvGenere] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCvFile(file)

    const reader = new FileReader()
    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target.result)
      const pdf = await pdfjsLib.getDocument(typedArray).promise
      let texteComplet = ''

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const texte = content.items.map(item => item.str).join(' ')
        texteComplet += texte + '\n'
      }

      setCvTexte(texteComplet)
    }
    reader.readAsArrayBuffer(file)
  }

  const handleGenerate = async () => {
    if (!cvFile || !offreEmploi) {
      alert('Merci d\'uploader ton CV et de coller une offre d\'emploi !')
      return
    }
    setLoading(true)
    setCvGenere('')

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content: `Tu es un expert en recrutement et optimisation de CV pour les systèmes ATS.

Voici le CV actuel du candidat :
${cvTexte}

Voici l'offre d'emploi ciblée :
${offreEmploi}

Génère un CV optimisé en français qui :
1. Intègre naturellement les mots-clés importants de l'offre
2. Restructure les expériences pour correspondre au poste
3. Met en avant les compétences pertinentes
4. Est optimisé pour passer les filtres ATS
5. Reste authentique et professionnel

Retourne uniquement le CV optimisé, sans commentaires.`
            }
          ]
        })
      })

      const data = await response.json()
      setCvGenere(data.content[0].text)
    } catch (error) {
      alert('Une erreur est survenue. Vérifie ta clé API.')
      console.error(error)
    }

    setLoading(false)
  }

  return (
    <div className="generate-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
      </nav>

      <div className="generate-wrap">
        <div className="generate-left">
          <h2>Génère ton CV optimisé</h2>
          <p className="generate-sub">Upload ton CV PDF et colle l'offre d'emploi — l'IA fait le reste.</p>

          <div className="upload-box">
            <div className="upload-label">1. Ton CV actuel (PDF)</div>
            <label className="upload-zone">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                style={{display:'none'}}
              />
              {cvFile ? (
                <div className="upload-done">📄 {cvFile.name} ✓</div>
              ) : (
                <div className="upload-placeholder">
                  <div className="upload-icon">📁</div>
                  <div>Clique pour uploader ton CV</div>
                  <div className="upload-hint">PDF uniquement</div>
                </div>
              )}
            </label>
            {cvTexte && (
              <div style={{marginTop:'8px', fontSize:'12px', color:'#16a34a'}}>
                ✓ CV lu avec succès — {cvTexte.length} caractères extraits
              </div>
            )}
          </div>

          <div className="offre-box">
            <div className="upload-label">2. L'offre d'emploi</div>
            <textarea
              className="offre-textarea"
              placeholder="Colle ici le texte complet de l'offre d'emploi..."
              value={offreEmploi}
              onChange={(e) => setOffreEmploi(e.target.value)}
              rows={8}
            />
          </div>

          <button
            className="btn-generate"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? '⏳ Génération en cours...' : '⚡ Générer mon CV optimisé'}
          </button>
        </div>

        <div className="generate-right">
          <div className="result-box">
            <div className="result-header">
              <span>Ton CV optimisé</span>
              {cvGenere && (
                <button
                  className="btn-download"
                  onClick={() => {
                    const blob = new Blob([cvGenere], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'mon-cv-optimise.txt'
                    a.click()
                  }}
                >
                  📥 Télécharger
                </button>
              )}
            </div>
            <div className="result-content">
              {cvGenere ? (
                <div className="result-text">{cvGenere}</div>
              ) : (
                <div className="result-empty">
                  <div className="empty-icon">✨</div>
                  <div>{loading ? 'L\'IA génère ton CV...' : 'Ton CV optimisé apparaîtra ici'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Generate
