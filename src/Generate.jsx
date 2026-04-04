import { supabase } from './supabase'
import { CVTemplate } from './CVTemplates'
import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
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
  const [lettre, setLettre] = useState('')
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [searchParams] = useSearchParams()
  const templateChoisi = searchParams.get('template') || 'finance'

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
        if (data && data.prenom) setProfile(data)
      }
    }
    fetchProfile()
  }, [])

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

  const buildProfileText = (profile) => {
    let text = `Prénom: ${profile.prenom}\nNom: ${profile.nom}\nEmail: ${profile.email}\nTéléphone: ${profile.telephone}\nVille: ${profile.ville}\nLinkedIn: ${profile.linkedin}\nTitre: ${profile.titre}\nAccroche: ${profile.accroche}\n\n`
    
    if (profile.experiences?.length > 0) {
      text += 'EXPÉRIENCES:\n'
      profile.experiences.forEach(exp => {
        text += `- ${exp.poste} chez ${exp.entreprise} (${exp.periode}) à ${exp.lieu}\n`
        exp.missions?.forEach(m => { if(m) text += `  • ${m}\n` })
      })
    }
    
    if (profile.formations?.length > 0) {
      text += '\nFORMATIONS:\n'
      profile.formations.forEach(f => {
        text += `- ${f.diplome} à ${f.etablissement} (${f.periode})\n`
      })
    }
    
    if (profile.competences?.length > 0) {
      text += '\nCOMPÉTENCES:\n' + profile.competences.filter(c => c).join(', ') + '\n'
    }
    
    if (profile.langues?.length > 0) {
      text += '\nLANGUES:\n'
      profile.langues.forEach(l => { text += `- ${l.langue}: ${l.niveau}\n` })
    }

    if (profile.certifications?.length > 0) {
      text += '\nCERTIFICATIONS:\n'
      profile.certifications.forEach(c => { text += `- ${c.titre} (${c.organisme}, ${c.annee})\n` })
    }

    return text
  }

  const handleGenerate = async () => {
    if (!offreEmploi) {
      alert('Merci de coller une offre d\'emploi !')
      return
    }
    if (!profile && !cvFile) {
      alert('Merci d\'uploader ton CV ou de remplir ton profil !')
      return
    }
    setLoading(true)
    setCvData(null)
    setLettre('')

    if (user) {
      const { count } = await supabase
        .from('cvs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      const adminEmails = ['fernandochokki@gmail.com', 'chokkifernando@gmail.com', 'carlinazon@gmail.com']
      if (count >= 1 && !adminEmails.includes(user.email)) {
        alert('Tu as utilisé ton CV gratuit ! Passe au plan Pro pour générer des CV illimités.')
        setLoading(false)
        return
      }
    }

    const sourceCV = profile ? buildProfileText(profile) : cvTexte

    try {
      const [responseCV, responseLM] = await Promise.all([
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 3000,
            messages: [{
              role: 'user',
              content: `Tu es un expert en recrutement et optimisation de CV pour les systèmes ATS.

Voici le profil du candidat :
${sourceCV}

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
  "experiences": [{"poste":"...","entreprise":"...","periode":"...","lieu":"...","missions":["...","...","..."]}],
  "formations": [{"diplome":"...","etablissement":"...","periode":"...","mention":"..."}],
  "competences": ["..."],
  "langues": [{"langue":"...","niveau":"..."}],
  "atouts": ["..."]
}`
            }]
          })
        }),
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1000,
            messages: [{
              role: 'user',
              content: `Tu es un expert en recrutement.

Voici le profil du candidat :
${sourceCV}

Voici l'offre d'emploi :
${offreEmploi}

Rédige une lettre de motivation professionnelle et personnalisée.

Règles :
- Commence par "Madame, Monsieur,"
- 3 paragraphes maximum
- Ton professionnel mais humain
- Maximum 300 mots
- Termine par "Cordialement," suivi du prénom et nom
- Retourne UNIQUEMENT le texte de la lettre`
            }]
          })
        })
      ])

      const dataCV = await responseCV.json()
      const dataLM = await responseLM.json()
      const texteCV = dataCV.content[0].text
      const jsonPropre = texteCV.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const json = JSON.parse(jsonPropre)
      const lettreGeneree = dataLM.content[0].text

      setCvData(json)
      setLettre(lettreGeneree)

      if (user) {
        const offreTitre = offreEmploi.substring(0, 60).trim()
        await supabase.from('cvs').insert({
          user_id: user.id,
          template: templateChoisi,
          cv_data: json,
          lettre_motivation: lettreGeneree,
          offre_titre: offreTitre
        })
      }

    } catch (error) {
      alert('Une erreur est survenue. Vérifie ta clé API.')
      console.error(error)
    }

    setLoading(false)
  }

  const handleDownloadCV = async () => {
    const element = document.getElementById('cv-to-print')
    if (!element) return
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: 1123
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
    pdf.save(`CV-DidCV-${cvData.prenom}-${cvData.nom}.pdf`)
  }

  const handleDownloadLettre = () => {
    const blob = new Blob([lettre], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Lettre-Motivation-${cvData.prenom}-${cvData.nom}.txt`
    a.click()
  }

  return (
    <div className="generate-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
        <a href="/dashboard" className="btn-ghost" style={{marginLeft:'auto', marginRight:'12px'}}>Mon dashboard</a>
        <a href="/templates" className="btn-ghost">← Changer de template</a>
      </nav>

      <div className="generate-wrap">
        <div className="generate-left">
          <h2>Génère ton CV optimisé</h2>
          <p className="generate-sub">
            {profile ? `Bonjour ${profile.prenom} ! Ton profil est chargé — colle juste l'offre d'emploi.` : 'Upload ton CV PDF et colle l\'offre — l\'IA génère ton CV et ta lettre de motivation.'}
          </p>

          {profile ? (
            <div className="profile-loaded-box">
              <div className="profile-loaded-info">
                <div className="profile-loaded-avatar">{profile.prenom[0]}{profile.nom[0]}</div>
                <div>
                  <div style={{fontWeight:'600', fontSize:'14px'}}>{profile.prenom} {profile.nom}</div>
                  <div style={{fontSize:'12px', color:'var(--muted)'}}>{profile.titre}</div>
                </div>
              </div>
              <a href="/profile" style={{fontSize:'12px', color:'var(--blue)'}}>Modifier mon profil →</a>
            </div>
          ) : (
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
          )}

          <div className="offre-box">
            <div className="upload-label">{profile ? '1.' : '2.'} L'offre d'emploi</div>
            <textarea
              className="offre-textarea"
              placeholder="Colle ici le texte complet de l'offre d'emploi..."
              value={offreEmploi}
              onChange={(e) => setOffreEmploi(e.target.value)}
              rows={8}
            />
          </div>

          <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? '⏳ Génération en cours...' : '⚡ Générer mon CV + Lettre de motivation'}
          </button>

          {cvData && (
            <a href="/dashboard" style={{display:'block', textAlign:'center', textDecoration:'none', marginTop:'12px', padding:'14px', background:'#16a34a', color:'#fff', borderRadius:'10px', fontSize:'15px', fontWeight:'500'}}>
              ✅ Terminer → Aller au dashboard
            </a>
          )}
        </div>

        <div className="generate-right">
          <div className="result-box">
            <div className="result-header">
              <span>Template : <strong>{templateChoisi}</strong></span>
              {cvData && (
                <div style={{display:'flex', gap:'8px'}}>
                  <button className="btn-download" onClick={handleDownloadCV}>📥 CV PDF</button>
                  {lettre && <button className="btn-download" onClick={handleDownloadLettre}>📄 Lettre</button>}
                </div>
              )}
            </div>
            <div className="result-content">
              {cvData ? (
                <CVTemplate cvData={cvData} template={templateChoisi} />
              ) : (
                <div className="result-empty">
                  <div className="empty-icon">✨</div>
                  <div>{loading ? 'L\'IA génère ton CV et ta lettre...' : 'Ton CV optimisé apparaîtra ici'}</div>
                </div>
              )}
            </div>
          </div>

          {lettre && (
            <div className="result-box" style={{marginTop:'20px'}}>
              <div className="result-header">
                <span>✉️ Lettre de motivation</span>
                <button className="btn-download" onClick={handleDownloadLettre}>📄 Télécharger</button>
              </div>
              <div className="result-content" style={{alignItems:'flex-start'}}>
                <div style={{fontFamily:'Georgia,serif', fontSize:'13px', lineHeight:'1.8', color:'#222', whiteSpace:'pre-wrap', width:'100%', padding:'8px'}}>
                  {lettre}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Generate