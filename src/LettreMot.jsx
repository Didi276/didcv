import { useState } from 'react'
import { supabase } from './supabase'
import './App.css'

function LettreMot() {
  const [offreEmploi, setOffreEmploi] = useState('')
  const [cvFile, setCvFile] = useState(null)
  const [cvTexte, setCvTexte] = useState('')
  const [loading, setLoading] = useState(false)
  const [lettre, setLettre] = useState('')
  const [copied, setCopied] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCvFile(file)
    const pdfjsLib = await import('pdfjs-dist')
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString()
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
    setLettre('')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: `Tu es un expert en recrutement et rédaction de lettres de motivation.

Voici le CV du candidat :
${cvTexte}

Voici l'offre d'emploi :
${offreEmploi}

Rédige une lettre de motivation professionnelle, personnalisée et convaincante.

Règles :
- Commence par "Madame, Monsieur,"
- 3 paragraphes maximum
- Ton professionnel mais humain
- Met en valeur les compétences du candidat en lien avec l'offre
- Termine par "Cordialement," suivi du prénom et nom du candidat
- Maximum 300 mots
- Ne mets pas de date ni d'adresse
- Retourne UNIQUEMENT le texte de la lettre, sans commentaire`
          }]
        })
      })

      const data = await response.json()
      const texte = data.content[0].text
      setLettre(texte)
    } catch (error) {
      alert('Une erreur est survenue.')
      console.error(error)
    }

    setLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(lettre)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([lettre], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'lettre-motivation-didcv.txt'
    a.click()
  }

  return (
    <div className="generate-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
        <div className="nav-btns">
          <a href="/dashboard" className="btn-ghost">Mon dashboard</a>
          <a href="/templates" className="btn-ghost">Générer un CV</a>
        </div>
      </nav>

      <div className="generate-wrap">
        <div className="generate-left">
          <h2>Ta lettre de motivation</h2>
          <p className="generate-sub">Upload ton CV et colle l'offre — l'IA génère une lettre personnalisée.</p>

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
                ✓ CV lu avec succès
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
            {loading ? '⏳ Génération en cours...' : '✉️ Générer ma lettre'}
          </button>
        </div>

        <div className="generate-right">
          <div className="result-box">
            <div className="result-header">
              <span>Ta lettre de motivation</span>
              {lettre && (
                <div style={{display:'flex', gap:'8px'}}>
                  <button className="btn-download" onClick={handleCopy}>
                    {copied ? '✅ Copié !' : '📋 Copier'}
                  </button>
                  <button className="btn-download" onClick={handleDownload}>
                    📥 Télécharger
                  </button>
                </div>
              )}
            </div>
            <div className="result-content">
              {lettre ? (
                <div style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  color: '#222',
                  whiteSpace: 'pre-wrap',
                  width: '100%',
                  alignSelf: 'flex-start',
                  padding: '8px'
                }}>
                  {lettre}
                </div>
              ) : (
                <div className="result-empty">
                  <div className="empty-icon">✉️</div>
                  <div>{loading ? 'L\'IA rédige ta lettre...' : 'Ta lettre apparaîtra ici'}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LettreMot