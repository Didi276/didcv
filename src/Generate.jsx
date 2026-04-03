import { supabase } from './supabase'
import { CVTemplate } from './CVTemplates'
import { useSearchParams } from 'react-router-dom'
import { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
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
  const [searchParams] = useSearchParams()
  const templateChoisi = searchParams.get('template') || 'finance'

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: `Tu es un expert en recrutement et optimisation de CV pour les systèmes ATS.

Voici le CV actuel du candidat :
${cvTexte}

Voici l'offre d'emploi ciblée :
${offreEmploi}

Génère un CV optimisé UNE PAGE MAXIMUM et retourne UNIQUEMENT un objet JSON valide avec cette structure exacte, sans aucun commentaire ni texte avant ou après.

Règles strictes :
- Maximum 3 expériences avec 3 missions chacune
- Maximum 2 formations
- Maximum 8 compétences
- Accroche de 2 lignes maximum
- Le tout doit tenir sur UNE SEULE PAGE A4

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
          }]
        })
      })
      const data = await response.json()
      const texte = data.content[0].text
      const jsonPropre = texte.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const json = JSON.parse(jsonPropre)
      setTimeout(() => {
  window.location.href = '/dashboard'
}, 3000)

const { data: { user } } = await supabase.auth.getUser()
if (user) {
  await supabase.from('cvs').insert({
    user_id: user.id,
    template: templateChoisi,
    cv_data: json
  })
}
    } catch (error) {
      alert('Une erreur est survenue. Vérifie ta clé API.')
      console.error(error)
    }

    setLoading(false)
  }

  const handleDownload = async () => {
  const element = document.getElementById('cv-to-print')
  if (!element) return
  
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    width: 794,
    height: 1123
  })
  
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
  pdf.save(`CV-DidCV-${cvData.prenom}-${cvData.nom}.pdf`)
}

  return (
    <div className="generate-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
<a href="/dashboard" className="btn-ghost" style={{marginLeft:'auto', marginRight:'12px'}}>Mon dashboard</a>
        <a href="/templates" className="btn-ghost" style={{marginLeft:'auto'}}>← Changer de template</a>
      </nav>

      <div className="generate-wrap">
        <div className="generate-left">
          <h2>Génère ton CV optimisé</h2>
          <p className="generate-sub">Upload ton CV PDF et colle l'offre d'emploi — l'IA fait le reste.</p>

          <div className="upload-box">
            <div className="upload-label">1. Ton CV actuel (PDF)</div>
            <label className="upload-zone">
              <input type="file" accept=".pdf" onChange={handleFileChange} style={{display:'none'}} />
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

          <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? '⏳ Génération en cours...' : '⚡ Générer mon CV optimisé'}
          </button>
        </div>

        <div className="generate-right">
          <div className="result-box">
            <div className="result-header">
              <span>Template : <strong>{templateChoisi}</strong></span>
              {cvData && <button className="btn-download" onClick={handleDownload}>📥 Télécharger PDF</button>}
            </div>
            <div className="result-content">
              {cvData ? (
                <CVTemplate cvData={cvData} template={templateChoisi} />
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