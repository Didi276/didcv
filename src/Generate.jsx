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
  const [cvData, setCvData] = useState(null)

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
    setCvData(null)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 3000,
          messages: [
            {
              role: 'user',
              content: `Tu es un expert en recrutement et optimisation de CV pour les systèmes ATS.

Voici le CV actuel du candidat :
${cvTexte}

Voici l'offre d'emploi ciblée :
${offreEmploi}

Génère un CV optimisé et retourne UNIQUEMENT un objet JSON valide avec cette structure exacte, sans aucun commentaire ni texte avant ou après :

{
  "prenom": "...",
  "nom": "...",
  "titre": "...",
  "email": "...",
  "telephone": "...",
  "ville": "...",
  "linkedin": "...",
  "accroche": "...",
  "experiences": [
    {
      "poste": "...",
      "entreprise": "...",
      "periode": "...",
      "lieu": "...",
      "missions": ["...", "...", "..."]
    }
  ],
  "formations": [
    {
      "diplome": "...",
      "etablissement": "...",
      "periode": "...",
      "mention": "..."
    }
  ],
  "competences": ["...", "...", "..."],
  "langues": [
    {
      "langue": "...",
      "niveau": "..."
    }
  ],
  "atouts": ["...", "...", "..."]
}`
            }
          ]
        })
      })
const data = await response.json()
      const texte = data.content[0].text
      const jsonPropre = texte.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const json = JSON.parse(jsonPropre)
      setCvData(json)
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
              {cvData && <button className="btn-download">📥 Télécharger</button>}
            </div>
            <div className="result-content">
              {cvData ? (
                <div className="cv-finance">
                  <div className="cv-header-finance">
                    <h1>{cvData.prenom} {cvData.nom}</h1>
                    <h2>{cvData.titre}</h2>
                    <div className="cv-contact">
                      <span>📧 {cvData.email}</span>
                      <span>📞 {cvData.telephone}</span>
                      <span>📍 {cvData.ville}</span>
                      {cvData.linkedin && <span>🔗 {cvData.linkedin}</span>}
                    </div>
                  </div>

                  {cvData.accroche && (
                    <div className="cv-section">
                      <h3 className="cv-section-title">Profil</h3>
                      <p className="cv-accroche">{cvData.accroche}</p>
                    </div>
                  )}

                  <div className="cv-section">
                    <h3 className="cv-section-title">Expériences professionnelles</h3>
                    {cvData.experiences.map((exp, i) => (
                      <div key={i} className="cv-exp">
                        <div className="cv-exp-header">
                          <div>
                            <div className="cv-exp-poste">{exp.poste}</div>
                            <div className="cv-exp-entreprise">{exp.entreprise} — {exp.lieu}</div>
                          </div>
                          <div className="cv-exp-periode">{exp.periode}</div>
                        </div>
                        <ul className="cv-missions">
                          {exp.missions.map((m, j) => <li key={j}>{m}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="cv-section">
                    <h3 className="cv-section-title">Formation</h3>
                    {cvData.formations.map((f, i) => (
                      <div key={i} className="cv-exp">
                        <div className="cv-exp-header">
                          <div>
                            <div className="cv-exp-poste">{f.diplome}</div>
                            <div className="cv-exp-entreprise">{f.etablissement}</div>
                          </div>
                          <div className="cv-exp-periode">{f.periode}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="cv-bottom">
                    <div className="cv-section">
                      <h3 className="cv-section-title">Compétences</h3>
                      <div className="cv-competences">
                        {cvData.competences.map((c, i) => (
                          <span key={i} className="cv-tag">{c}</span>
                        ))}
                      </div>
                    </div>

                    <div className="cv-section">
                      <h3 className="cv-section-title">Langues</h3>
                      {cvData.langues.map((l, i) => (
                        <div key={i} className="cv-langue">
                          <span>{l.langue}</span>
                          <span className="cv-niveau">{l.niveau}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
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