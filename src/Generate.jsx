import CVEditorBlocks from './CVEditorBlocks'
import { supabase } from './supabase'
import { CVTemplate } from './CVTemplates'
import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as pdfjsLib from 'pdfjs-dist'
import Navbar from './Navbar'
import { detecterSecteur, getSecteurConfig, buildPromptCV } from './secteurConfig'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

function LettreRenderer({ lettre }) {
  const hasTags = lettre.includes('||EXP||')
  if (!hasTags) {
    return (
      <div style={{fontFamily:'Georgia,serif',fontSize:'13px',lineHeight:'1.9',color:'#222',whiteSpace:'pre-wrap',width:'100%',padding:'20px 28px'}}>
        {lettre}
      </div>
    )
  }
  const extract = (tag, nextTag) => {
    const start = lettre.indexOf(tag) + tag.length
    const end = nextTag ? lettre.indexOf(nextTag) : lettre.length
    return lettre.slice(start, end).trim()
  }
  const expStr   = extract('||EXP||',  '||DEST||')
  const destStr  = extract('||DEST||', '||DATE||')
  const dateStr  = extract('||DATE||', '||BODY||')
  const bodyStr  = extract('||BODY||', null)
  const expLines  = expStr.split('\n').filter(l => l.trim())
  const destLines = destStr.split('\n').filter(l => l.trim())
  return (
    <div style={{fontFamily:'Georgia,serif',fontSize:'13px',lineHeight:'1.9',color:'#222',width:'100%',padding:'24px 32px',background:'#fff'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',marginBottom:'24px'}}>
        <div>
          {expLines.map((l, i) => (
            <div key={i} style={{fontSize:'13px',color:'#222',fontWeight: i === 0 ? '700' : '400',lineHeight:'1.7'}}>{l}</div>
          ))}
        </div>
        <div>
          {destLines.map((l, i) => (
            <div key={i} style={{fontSize:'13px',color:'#222',fontWeight: i === 0 ? '700' : '400',lineHeight:'1.7'}}>{l}</div>
          ))}
          {dateStr && <div style={{fontSize:'13px',color:'#333',marginTop:'14px'}}>{dateStr}</div>}
        </div>
      </div>
      <div style={{whiteSpace:'pre-wrap',lineHeight:'1.9',fontSize:'13px'}}>{bodyStr}</div>
    </div>
  )
}

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
  const [showEditor, setShowEditor] = useState(false)
  const [photoManuelle, setPhotoManuelle] = useState(null)
  const [secteurDetecte, setSecteurDetecte] = useState(null)
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
    const prefill = sessionStorage.getItem('offre_prefill')
    if (prefill) { setOffreEmploi(prefill); sessionStorage.removeItem('offre_prefill') }
  }, [])

  // Détecter le secteur en temps réel quand l'offre change
  useEffect(() => {
    if (offreEmploi.length > 50) {
      const secteur = detecterSecteur(offreEmploi, '')
      setSecteurDetecte(secteur)
    } else {
      setSecteurDetecte(null)
    }
  }, [offreEmploi])

  const handlePhotoManuelle = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Merci de choisir une image (JPG, PNG...)'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Image trop lourde — max 2 Mo'); return }
    const reader = new FileReader()
    reader.onload = (event) => setPhotoManuelle(event.target.result)
    reader.readAsDataURL(file)
  }

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
    let text = `INFORMATIONS PERSONNELLES:
Prénom: ${profile.prenom}
Nom: ${profile.nom}
Email: ${profile.email}
Téléphone: ${profile.telephone}
Ville: ${profile.ville}
LinkedIn: ${profile.linkedin || ''}
Titre: ${profile.titre}
Accroche: ${profile.accroche}\n\n`
    if (profile.experiences?.length > 0) {
      text += `EXPÉRIENCES (${profile.experiences.length} au total):\n`
      profile.experiences.forEach((exp, i) => {
        text += `\n[Expérience ${i+1}]\nPoste: ${exp.poste}\nEntreprise: ${exp.entreprise}\nPériode: ${exp.periode}\nLieu: ${exp.lieu}\n`
        if (exp.missions?.filter(m => m).length > 0) {
          text += `Missions:\n`
          exp.missions.filter(m => m).forEach(m => { text += `  • ${m}\n` })
        }
      })
    }
    if (profile.formations?.length > 0) {
      text += `\nFORMATIONS:\n`
      profile.formations.forEach(f => {
        text += `  - ${f.diplome} | ${f.etablissement} | ${f.periode}${f.mention ? ` | ${f.mention}` : ''}${f.description ? ` | ${f.description}` : ''}\n`
      })
    }
    if (profile.competences?.filter(c => c).length > 0) {
      text += `\nCOMPÉTENCES: ${profile.competences.filter(c => c).join(', ')}\n`
    }
    if (profile.langues?.length > 0) {
      text += `\nLANGUES:\n`
      profile.langues.forEach(l => { text += `  - ${l.langue}: ${l.niveau}\n` })
    }
    if (profile.certifications?.filter(c => c.titre).length > 0) {
      text += `\nCERTIFICATIONS:\n`
      profile.certifications.filter(c => c.titre).forEach(c => {
        text += `  - ${c.titre} | ${c.organisme} | ${c.annee}\n`
      })
    }
    if (profile.centres_interet?.filter(c => c).length > 0) {
      text += `\nCENTRES D'INTÉRÊT: ${profile.centres_interet.filter(c => c).join(', ')}\n`
    }
    return text
  }

  const getDateJour = () => new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

  const handleGenerate = async () => {
    if (!offreEmploi) { alert("Merci de coller une offre d'emploi !"); return }
    if (!profile && !cvFile) { alert("Merci d'uploader ton CV ou de remplir ton profil !"); return }
    setLoading(true)
    setCvData(null)
    setLettre('')

    if (user) {
      const { count } = await supabase.from('cvs').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      const adminEmails = ['fernandochokki@gmail.com', 'chokkifernando@gmail.com', 'carlinazon@gmail.com']
      if (count >= 1 && !adminEmails.includes(user.email)) {
        alert('Tu as utilisé ton CV gratuit ! Passe au plan Pro pour générer des CV illimités.')
        setLoading(false)
        return
      }
    }

    const sourceCV = profile ? buildProfileText(profile) : cvTexte
    const nbExp = profile?.experiences?.length || 0
    const dateJour = getDateJour()
    const hasCertifications = profile?.certifications?.filter(c => c.titre).length > 0
    const hasCentresInteret = profile?.centres_interet?.filter(c => c).length > 0

    // ─── Détection secteur + config spécialisée ───
    const secteur = detecterSecteur(offreEmploi, sourceCV)
    const config = getSecteurConfig(secteur, nbExp, profile)
    const promptCV = buildPromptCV(sourceCV, offreEmploi, secteur, config, nbExp, hasCertifications, hasCentresInteret)

    const fetchWithRetry = async (url, options, retries = 1) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const res = await fetch(url, options)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res
        } catch (err) {
          if (i === retries) throw err
          await new Promise(r => setTimeout(r, 1500))
        }
      }
    }

    try {
      const [responseCV, responseLM] = await Promise.all([
        fetchWithRetry('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 6000,
            system: `Tu es un expert RH senior et consultant en optimisation de CV avec 15 ans d'expérience dans le secteur ${config.label}. Tu maîtrises parfaitement les ATS et les codes de chaque secteur professionnel. Tu retournes TOUJOURS et UNIQUEMENT un JSON valide, sans texte avant ou après, sans balises markdown. Jamais de JSON tronqué.`,
            messages: [{ role: 'user', content: promptCV }]
          })
        }),

        fetchWithRetry('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            messages: [{
              role: 'user',
              content: `Tu es un expert en rédaction de lettres de motivation pour le secteur ${config.label}.

PROFIL DU CANDIDAT :
${sourceCV}

OFFRE D'EMPLOI :
${offreEmploi}

DATE DU JOUR : ${dateJour}

GÉNÈRE LA LETTRE avec ces marqueurs EXACTS :

||EXP||
[Prénom Nom]
[Email]
[Téléphone]
[Ville du candidat]
||DEST||
[Nom de l'entreprise]
[Service RH]
||DATE||
[Ville], le ${dateJour}
||BODY||
Objet : Candidature au poste de [intitulé EXACT du poste]

[Madame, Monsieur,]

[PARAGRAPHE 1 — 3 phrases : accroche adaptée au secteur ${config.label}, connaissance de l'entreprise]

[PARAGRAPHE 2 — 4 phrases : expériences pertinentes AVEC chiffres, vocabulaire du secteur ${config.label}]

[PARAGRAPHE 3 — 3 phrases : valeur ajoutée, adéquation avec le poste]

[PARAGRAPHE 4 — 2 phrases : disponibilité, remerciement]

Cordialement,
[Prénom Nom]

RÈGLES : 300 à 380 mots. Ton adapté au secteur. Chiffres obligatoires. Retourne UNIQUEMENT le texte avec les marqueurs.`
            }]
          })
        })
      ])

      const dataCV = await responseCV.json()
      const dataLM = await responseLM.json()
      const texteCV = dataCV.content[0].text
      const jsonPropre = texteCV.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      let json
      try {
        json = JSON.parse(jsonPropre)
      } catch (parseError) {
        const match = jsonPropre.match(/\{[\s\S]*\}/)
        if (match) {
          try { json = JSON.parse(match[0]) }
          catch { throw new Error("Le CV généré est incomplet. Réessaie.") }
        } else {
          throw new Error("Le CV généré est incomplet. Réessaie.")
        }
      }

      if (!json.prenom || !json.experiences || !Array.isArray(json.experiences)) {
        throw new Error('CV généré invalide. Réessaie.')
      }

      const lettreGeneree = dataLM.content[0].text

      if (profile?.photo === null) {
        json.photo = null
      } else if (profile?.photo) {
        json.photo = profile.photo
      } else if (photoManuelle) {
        json.photo = photoManuelle
      }

      if (!json.certifications) json.certifications = []
      if (!json.centres_interet) json.centres_interet = []
      json._nbExp = json.experiences?.length || 0
      json._secteur = secteur

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
      const msg = error.message?.includes('incomplet') || error.message?.includes('invalide')
        ? error.message
        : 'Une erreur est survenue. Réessaie dans quelques secondes.'
      alert(msg)
      console.error(error)
    }

    setLoading(false)
  }

  const handleDownloadCV = async () => {
    const element = document.getElementById('cv-to-print')
    if (!element) return
    const canvas = await html2canvas(element, {
      scale: 4, useCORS: true, backgroundColor: '#ffffff',
      width: 794, height: 1123, logging: false, imageTimeout: 0, allowTaint: true
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4', true)
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST')
    pdf.save(`CV-DidCV-${cvData.prenom}-${cvData.nom}.pdf`)
  }

  const handleDownloadLettre = () => {
    const pdf = new jsPDF('p', 'mm', 'a4')
    pdf.setFont('helvetica', 'normal')
    const lines = lettre.split('\n')
    const objetIdx = lines.findIndex(l => l.trim().toLowerCase().startsWith('objet'))
    const headerLines = objetIdx > -1 ? lines.slice(0, objetIdx).filter(l => l.trim()) : []
    const bodyLines = objetIdx > -1 ? lines.slice(objetIdx) : lines
    let expediteurLines = [], destinataireLines = [], dateLine = '', phase = 'expediteur', count = 0
    for (const line of headerLines) {
      const t = line.trim()
      if (/le\s+\d{1,2}\s+\w+\s+\d{4}/i.test(t)) { dateLine = t; continue }
      if (/@|^\+/.test(t) && phase === 'expediteur') { expediteurLines.push(t); count++; continue }
      if (phase === 'expediteur' && count >= 2 && !/@/.test(t) && !/^\+/.test(t)) phase = 'destinataire'
      if (phase === 'expediteur') { expediteurLines.push(t); count++ }
      else destinataireLines.push(t)
    }
    const marginL = 20, marginR = 190
    let y = 20
    expediteurLines.forEach((l, i) => { pdf.setFontSize(11); pdf.setFont('helvetica', i === 0 ? 'bold' : 'normal'); pdf.text(l, marginL, y); y += 5.5 })
    let yRight = 20
    destinataireLines.forEach((l, i) => { pdf.setFontSize(11); pdf.setFont('helvetica', i === 0 ? 'bold' : 'normal'); pdf.text(l, marginR, yRight, { align: 'right' }); yRight += 5.5 })
    if (dateLine) { pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.text(dateLine, marginR, yRight + 4, { align: 'right' }) }
    y = Math.max(y, yRight + (dateLine ? 10 : 0)) + 12
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11)
    const splitBody = pdf.splitTextToSize(bodyLines.join('\n'), 170)
    splitBody.forEach(line => { if (y > 280) { pdf.addPage(); y = 20 } pdf.text(line, marginL, y); y += 5.5 })
    pdf.save(`Lettre-Motivation-${cvData.prenom}-${cvData.nom}.pdf`)
  }

  // Labels lisibles pour les secteurs
  const secteurLabels = {
    tech: '💻 Tech', sante: '🏥 Santé', btp: '🏗️ BTP', restauration: '🍽️ Restauration',
    commerce: '🛒 Commerce', transport: '🚛 Transport', creatif: '🎨 Créatif',
    securite: '🔒 Sécurité', beaute: '💅 Beauté', junior: '🎓 Junior/Étudiant',
    cadre: '👔 Cadre', tertiaire: '📊 Tertiaire'
  }

  return (
    <div className="generate-page">
      <Navbar currentPage="generate" />

      <div className="generate-wrap">
        <div className="generate-left">
          <h2>Génère ton CV optimisé</h2>
          <p className="generate-sub">
            {profile
              ? `Bonjour ${profile.prenom} ! Ton profil est chargé${profile.photo ? ' 📷' : ''} — colle juste l'offre d'emploi.`
              : "Upload ton CV PDF et colle l'offre — l'IA génère ton CV et ta lettre de motivation."}
          </p>

          {profile ? (
            <div style={{marginBottom:'24px'}}>
              <div className="profile-loaded-box">
                <div className="profile-loaded-info">
                  {profile.photo ? (
                    <img src={profile.photo} alt="Photo" style={{width:'40px',height:'40px',borderRadius:'50%',objectFit:'cover',flexShrink:0}} />
                  ) : (
                    <div className="profile-loaded-avatar">{profile.prenom[0]}{profile.nom[0]}</div>
                  )}
                  <div>
                    <div style={{fontWeight:'600',fontSize:'14px'}}>{profile.prenom} {profile.nom}</div>
                    <div style={{fontSize:'12px',color:'var(--muted)'}}>{profile.titre}</div>
                    {profile.experiences?.length > 0 && (
                      <div style={{fontSize:'11px',color:'#16a34a',marginTop:'2px'}}>
                        ✓ {profile.experiences.length} expérience{profile.experiences.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
                <a href="/profile" style={{fontSize:'12px',color:'var(--blue)'}}>Modifier →</a>
              </div>
              {!profile.photo && (
                <div style={{marginTop:'8px',padding:'8px 12px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'8px',fontSize:'12px',color:'#92400e'}}>
                  💡 Ajoute une photo dans ton <a href="/profile" style={{color:'#92400e',fontWeight:'600',textDecoration:'underline'}}>profil</a>
                </div>
              )}
              <button onClick={() => setProfile(null)} style={{fontSize:'12px',color:'var(--muted)',background:'none',border:'none',cursor:'pointer',marginTop:'8px',textDecoration:'underline',display:'block'}}>
                Utiliser un CV PDF à la place →
              </button>
            </div>
          ) : (
            <div style={{marginBottom:'24px'}}>
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
                {cvTexte && <div style={{marginTop:'8px',fontSize:'12px',color:'#16a34a'}}>✓ CV lu — {cvTexte.length} caractères extraits</div>}
              </div>
              <div style={{marginTop:'12px',padding:'14px',background:'#f7f8fc',border:'1px solid #e5e7ef',borderRadius:'12px'}}>
                <div style={{fontSize:'12px',fontWeight:'600',color:'var(--text)',marginBottom:'10px'}}>
                  📷 Ta photo <span style={{fontWeight:'400',color:'var(--muted)'}}>— optionnelle</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
                  {photoManuelle ? (
                    <img src={photoManuelle} alt="Photo" style={{width:'48px',height:'48px',borderRadius:'50%',objectFit:'cover',border:'2px solid var(--blue)',flexShrink:0}} />
                  ) : (
                    <div style={{width:'48px',height:'48px',borderRadius:'50%',background:'#e5e7ef',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>👤</div>
                  )}
                  <div style={{display:'flex',flexDirection:'column',gap:'6px',flex:1}}>
                    <label style={{cursor:'pointer'}}>
                      <input type="file" accept="image/*" onChange={handlePhotoManuelle} style={{display:'none'}} />
                      <div style={{padding:'7px 14px',background:'#fff',border:'1px solid #c7d9ff',color:'#1a56db',borderRadius:'8px',fontSize:'12px',fontWeight:'500',display:'inline-block',cursor:'pointer'}}>
                        {photoManuelle ? '🔄 Changer la photo' : '📷 Ajouter ma photo'}
                      </div>
                    </label>
                    {photoManuelle && (
                      <button onClick={() => setPhotoManuelle(null)} style={{background:'none',border:'none',color:'#dc2626',fontSize:'12px',cursor:'pointer',textAlign:'left',padding:0}}>
                        🗑 Supprimer
                      </button>
                    )}
                    <div style={{fontSize:'11px',color:'var(--muted)'}}>JPG, PNG · max 2 Mo</div>
                  </div>
                </div>
              </div>
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
            {/* Badge secteur détecté */}
            {secteurDetecte && (
              <div style={{marginTop:'8px',display:'flex',alignItems:'center',gap:'6px',fontSize:'12px',color:'#555'}}>
                <span>Secteur détecté :</span>
                <span style={{background:'#eff4ff',color:'#1a56db',border:'1px solid #c7d9ff',padding:'2px 10px',borderRadius:'20px',fontWeight:'600'}}>
                  {secteurLabels[secteurDetecte] || secteurDetecte}
                </span>
                <span style={{color:'#9ca3af'}}>— prompt IA adapté automatiquement</span>
              </div>
            )}
          </div>

          <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? '⏳ Génération en cours...' : '⚡ Générer mon CV + Lettre de motivation'}
          </button>

          {cvData && (
            <div style={{display:'flex',flexDirection:'column',gap:'8px',marginTop:'12px'}}>
              <button onClick={() => setShowEditor(true)} style={{display:'block',textAlign:'center',width:'100%',padding:'14px',background:'#1a56db',color:'#fff',borderRadius:'10px',fontSize:'15px',fontWeight:'500',border:'none',cursor:'pointer'}}>
                ✏️ Modifier mon CV
              </button>
              <a href="/dashboard" style={{display:'block',textAlign:'center',textDecoration:'none',padding:'14px',background:'#16a34a',color:'#fff',borderRadius:'10px',fontSize:'15px',fontWeight:'500'}}>
                ✅ Terminer → Aller au dashboard
              </a>
            </div>
          )}
        </div>

        <div className="generate-right">
          <div className="result-box">
            <div className="result-header">
              <span>Template : <strong>{templateChoisi}</strong></span>
              {cvData && (
                <div style={{display:'flex',gap:'8px'}}>
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
                  <div>{loading ? "L'IA génère ton CV et ta lettre..." : 'Ton CV optimisé apparaîtra ici'}</div>
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
                <LettreRenderer lettre={lettre} />
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditor && cvData && (
        <CVEditorBlocks
          cvData={cvData}
          template={templateChoisi}
          onSave={(cvModifie) => { setCvData(cvModifie); setShowEditor(false) }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  )
}

export default Generate
