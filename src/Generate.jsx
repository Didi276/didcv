import CVEditor from './CVEditor'
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
  const [showEditor, setShowEditor] = useState(false)
  const [photoManuelle, setPhotoManuelle] = useState(null)
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
        text += `\n[Expérience ${i+1}]\n`
        text += `Poste: ${exp.poste}\n`
        text += `Entreprise: ${exp.entreprise}\n`
        text += `Période: ${exp.periode}\n`
        text += `Lieu: ${exp.lieu}\n`
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

    // Certifications seulement si renseignées
    if (profile.certifications?.filter(c => c.titre).length > 0) {
      text += `\nCERTIFICATIONS:\n`
      profile.certifications.filter(c => c.titre).forEach(c => {
        text += `  - ${c.titre} | ${c.organisme} | ${c.annee}\n`
      })
    }

    // Centres d'intérêt seulement si renseignés
    if (profile.centres_interet?.filter(c => c).length > 0) {
      text += `\nCENTRES D'INTÉRÊT: ${profile.centres_interet.filter(c => c).join(', ')}\n`
    }

    return text
  }

  const getDateJour = () => {
    return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // ─── Calcul intelligent du nombre de missions selon les expériences ───
  const getMissionsConfig = (nbExp) => {
    if (nbExp <= 1) return { missions: 5, note: "Le candidat a peu d'expérience, enrichis chaque mission avec beaucoup de détails, contexte, chiffres et résultats. Ajoute du contexte sur l'équipe, le secteur, les enjeux." }
    if (nbExp === 2) return { missions: 4, note: "3-4 missions détaillées par expérience avec résultats chiffrés." }
    if (nbExp === 3) return { missions: 3, note: "3 missions concises mais percutantes par expérience." }
    if (nbExp === 4) return { missions: 3, note: "2-3 missions très concises par expérience. Garde l'essentiel." }
    return { missions: 2, note: "2 missions maximum par expérience. Sois très concis, priorise les plus récentes." }
  }

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
    const nbExp = profile?.experiences?.length || 3
    const { missions: nbMissions, note: noteExp } = getMissionsConfig(nbExp)
    const dateJour = getDateJour()
    const hasCertifications = profile?.certifications?.filter(c => c.titre).length > 0
    const hasCentresInteret = profile?.centres_interet?.filter(c => c).length > 0

    try {
      const [responseCV, responseLM] = await Promise.all([

        // ════════════════════════════════════════════════════
        // PROMPT CV — Béton, 1 page garantie, tout inclus
        // ════════════════════════════════════════════════════
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 4000,
            messages: [{
              role: 'user',
              content: `Tu es un expert RH senior et consultant en optimisation de CV avec 15 ans d'expérience. Tu maîtrises parfaitement les ATS (Applicant Tracking System) et tu sais exactement quels mots-clés, quelle structure et quel contenu maximisent les chances de passer les filtres automatiques ET de convaincre un recruteur humain.

━━━ PROFIL DU CANDIDAT ━━━
${sourceCV}

━━━ OFFRE D'EMPLOI CIBLÉE ━━━
${offreEmploi}

━━━ RÈGLES ABSOLUES ━━━

1. EXPÉRIENCES — TOUTES sans exception :
   - Inclus les ${nbExp} expérience(s) dans l'ordre chronologique inverse
   - ${nbMissions} missions maximum par expérience
   - ${noteExp}
   - Chaque mission commence par un verbe d'action fort (Piloté, Développé, Optimisé, Managé, Négocié, Conçu...)
   - Ajoute des chiffres et résultats concrets quand possible

2. PAGE UNIQUE OBLIGATOIRE :
   - Le CV DOIT tenir sur exactement une page A4 (794x1123 pixels)
   - Calibre la densité du contenu en fonction du nombre d'expériences
   - Ne jamais dépasser ${nbMissions} missions par expérience
   - L'accroche : 2 phrases maximum
   - Les compétences : 8 maximum

3. ACCROCHE ATS :
   - 2 phrases percutantes qui utilisent les mots-clés EXACTS de l'offre
   - Met en avant les 2-3 compétences les plus pertinentes pour CE poste
   - Mentionne les années d'expérience si significatif

4. CERTIFICATIONS : ${hasCertifications ? "Inclus TOUTES les certifications du candidat — ce sont des éléments différenciants importants." : "Le candidat n'a pas de certifications. Mets un tableau vide : []"}

5. CENTRES D'INTÉRÊT : ${hasCentresInteret ? "Inclus les centres d'intérêt du candidat." : "Le candidat n'a pas renseigné de centres d'intérêt. Mets un tableau vide : []  NE génère PAS de centres d'intérêt inventés."}

6. OPTIMISATION ATS :
   - Reprends les mots-clés EXACTS de l'offre dans les missions et compétences
   - Le titre du candidat doit correspondre exactement ou très proche du poste visé
   - Score ATS cible : 90%+

Retourne UNIQUEMENT un objet JSON valide, sans texte ni markdown autour :

{
  "prenom": "...",
  "nom": "...",
  "titre": "Titre calqué sur le poste visé",
  "email": "...",
  "telephone": "...",
  "ville": "...",
  "linkedin": "...",
  "accroche": "2 phrases max ultra-ciblées avec mots-clés ATS",
  "experiences": [
    {
      "poste": "...",
      "entreprise": "...",
      "periode": "...",
      "lieu": "...",
      "missions": ["Verbe d'action + détail + résultat chiffré", "...", "..."]
    }
  ],
  "formations": [
    {
      "diplome": "...",
      "etablissement": "...",
      "periode": "...",
      "mention": "...",
      "description": "..."
    }
  ],
  "competences": ["max 8 compétences clés de l'offre"],
  "langues": [{"langue": "...", "niveau": "..."}],
  "certifications": [],
  "centres_interet": [],
  "atouts": ["Atout 1", "Atout 2", "Atout 3"]
}`
            }]
          })
        }),

        // ════════════════════════════════════════════════════
        // PROMPT LETTRE — Vraie lettre pro avec destinataire intelligent
        // ════════════════════════════════════════════════════
        fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1500,
            messages: [{
              role: 'user',
              content: `Tu es un expert en rédaction de lettres de motivation professionnelles. Tu as aidé des milliers de candidats à décrocher des entretiens.

━━━ PROFIL DU CANDIDAT ━━━
${sourceCV}

━━━ OFFRE D'EMPLOI COMPLÈTE ━━━
${offreEmploi}

━━━ DATE DU JOUR ━━━
${dateJour}

━━━ TA MISSION ━━━
Rédige une lettre de motivation parfaite en analysant intelligemment l'offre pour extraire les informations du destinataire.

ÉTAPE 1 — ANALYSE DE L'OFFRE :
Cherche dans l'offre :
- Le nom de l'entreprise (obligatoire)
- L'adresse de l'entreprise (si mentionnée)
- Le service destinataire (si mentionné : "Service RH", "Direction Marketing", etc.)
- Le nom du recruteur (si mentionné : "Madame X", "Monsieur Y")
- L'intitulé exact du poste

ÉTAPE 2 — RÉDIGE LA LETTRE avec ce format EXACT :

[Prénom Nom du candidat]
[Ville du candidat], le [date du jour]
[Email du candidat] | [Téléphone du candidat]
[LinkedIn si disponible]

[Nom de l'entreprise extraite de l'offre]
[Adresse de l'entreprise si trouvée dans l'offre]
[Service RH / ou service mentionné dans l'offre]

Objet : Candidature au poste de [intitulé EXACT du poste]

[Si nom du recruteur trouvé: "Madame [Nom]," ou "Monsieur [Nom]," — sinon: "Madame, Monsieur,"]

[PARAGRAPHE 1 — ACCROCHE ET MOTIVATION — 3 phrases]
Phrase d'accroche qui montre ta connaissance de l'entreprise ou du secteur (cherche des indices dans l'offre : leur mission, leurs valeurs, leur marché). Exprime une motivation sincère et spécifique. Mentionne un élément concret de l'offre qui t'attire particulièrement.

[PARAGRAPHE 2 — TON PROFIL ET COMPÉTENCES — 4-5 phrases]
Présente tes expériences les plus pertinentes AVEC des chiffres et résultats concrets (obligatoire). Fais le lien direct entre tes réalisations et les besoins exprimés dans l'offre. Utilise les mots-clés EXACTS de l'offre. Mets en avant ta valeur différenciante.

[PARAGRAPHE 3 — VALEUR AJOUTÉE — 3 phrases]
Explique ce que tu apportes de spécifique à cette équipe/entreprise. Montre que tu comprends les enjeux du poste et du secteur. Démontre ton adéquation culturelle si possible.

[PARAGRAPHE 4 — CONCLUSION — 2 phrases]
Exprime ta disponibilité pour un entretien. Remercie chaleureusement pour l'attention portée à ta candidature.

Cordialement,

[Prénom Nom]

RÈGLES IMPORTANTES :
- Corps de la lettre : 300 à 380 mots exactement (hors en-tête et signature)
- Ton adapté au secteur : formel pour finance/droit/administration, dynamique pour tech/marketing/commercial
- JAMAIS de formules creuses : "Je me permets de vous adresser ma candidature"  est INTERDIT
- Les chiffres dans le paragraphe 2 sont OBLIGATOIRES
- Si l'adresse de l'entreprise n'est pas dans l'offre, ne mets pas de ligne adresse
- Si le service destinataire n'est pas mentionné, mets "Service des Ressources Humaines"
- Retourne UNIQUEMENT le texte de la lettre formatée, sans commentaires ni explications`
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

      // Photo
      if (profile?.photo) json.photo = profile.photo
      else if (photoManuelle) json.photo = photoManuelle

      // Garder certifications et centres_interet vides si non renseignés
      if (!json.certifications) json.certifications = []
      if (!json.centres_interet) json.centres_interet = []

      // Stocker aussi le nb d'expériences pour l'option B (taille dynamique)
      json._nbExp = json.experiences?.length || 0

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
      scale: 4, useCORS: true, backgroundColor: '#ffffff',
      width: 794, height: 1123, logging: false, imageTimeout: 0, allowTaint: true
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4', true)
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST')
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
        <a className="logo" href="/dashboard"><span>Did</span>CV</a>
        <a href="/dashboard" className="btn-ghost" style={{marginLeft:'auto', marginRight:'12px'}}>Mon dashboard</a>
        <a href="/templates" className="btn-ghost">← Changer de template</a>
      </nav>

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
                        {profile.certifications?.filter(c=>c.titre).length > 0 && ` · ${profile.certifications.filter(c=>c.titre).length} certification${profile.certifications.filter(c=>c.titre).length > 1 ? 's' : ''}`}
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
                <div style={{fontFamily:'Georgia,serif',fontSize:'13px',lineHeight:'1.8',color:'#222',whiteSpace:'pre-wrap',width:'100%',padding:'8px'}}>
                  {lettre}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditor && cvData && (
        <CVEditor
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