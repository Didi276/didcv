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


// ─── Composant affichage lettre avec en-tête pro ────────────
// ─── Affichage lettre format pro (comme un vrai courrier) ────
// Format : expéditeur en haut à gauche, destinataire en haut à droite
// Puis date à droite, objet centré, corps de la lettre
function LettreRenderer({ lettre }) {
  const lines = lettre.split('\n')
  
  // Trouver la ligne Objet
  const objetIdx = lines.findIndex(l => l.trim().toLowerCase().startsWith('objet'))
  if (objetIdx === -1) {
    return (
      <div style={{fontFamily:'Georgia,serif',fontSize:'13px',lineHeight:'1.8',color:'#222',whiteSpace:'pre-wrap',width:'100%',padding:'16px 20px'}}>
        {lettre}
      </div>
    )
  }

  // Tout ce qui est avant "Objet" = en-tête
  const headerLines = lines.slice(0, objetIdx).filter(l => l.trim())
  // Tout ce qui est à partir de "Objet" = corps
  const bodyLines = lines.slice(objetIdx)

  // Parser l'en-tête :
  // - Lignes expéditeur : nom, adresse, ville/CP, email, téléphone, linkedin
  // - Ligne date : contient "le " + un chiffre
  // - Lignes destinataire : entreprise, service, adresse destinataire
  // 
  // Heuristique : on split à la première ligne qui ressemble à une entreprise/service
  // (après les coordonnées perso = nom + adresse + email/tel)
  
  let expediteurLines = []
  let destinataireLines = []
  let dateLine = ''
  let phase = 'expediteur' // expediteur → destinataire
  let expediteurCount = 0

  for (const line of headerLines) {
    const t = line.trim()
    // Ligne de date : "Ville, le XX mois XXXX" ou similaire
    if (/le\s+\d{1,2}\s+\w+\s+\d{4}/i.test(t) || /le\s+\d{2}\/\d{2}\/\d{4}/i.test(t)) {
      dateLine = t
      continue
    }
    // Email ou téléphone = encore expéditeur
    if (/[@+]|^\d{2}\s/.test(t) && phase === 'expediteur') {
      expediteurLines.push(t)
      expediteurCount++
      continue
    }
    // Après 3-5 lignes expéditeur (nom + adresse + email/tel), on passe au destinataire
    if (phase === 'expediteur' && expediteurCount >= 2 && !/@/.test(t) && !/^\+/.test(t) && !/^\d{2}\s/.test(t) && !/linkedin/i.test(t)) {
      // Si ça ressemble à un nom d'entreprise ou service → destinataire
      phase = 'destinataire'
    }
    if (phase === 'expediteur') {
      expediteurLines.push(t)
      expediteurCount++
    } else {
      destinataireLines.push(t)
    }
  }

  return (
    <div style={{fontFamily:'Georgia,serif',fontSize:'13px',lineHeight:'1.85',color:'#222',width:'100%',padding:'24px 28px',background:'#fff'}}>
      
      {/* ─── EN-TÊTE : Expéditeur gauche | Destinataire droite ─── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',marginBottom:'20px'}}>
        
        {/* Gauche — Expéditeur */}
        <div>
          {expediteurLines.map((l, i) => (
            <div key={i} style={{
              fontSize:'13px', color:'#222',
              fontWeight: i === 0 ? '700' : '400'
            }}>{l}</div>
          ))}
        </div>

        {/* Droite — Destinataire */}
        <div>
          {destinataireLines.map((l, i) => (
            <div key={i} style={{
              fontSize:'13px', color:'#222',
              fontWeight: i === 0 ? '700' : '400'
            }}>{l}</div>
          ))}
          {/* Date en bas à droite */}
          {dateLine && (
            <div style={{fontSize:'13px',color:'#333',marginTop:'12px'}}>{dateLine}</div>
          )}
        </div>
      </div>

      {/* ─── OBJET + CORPS ─── */}
      <div style={{whiteSpace:'pre-wrap',lineHeight:'1.85',fontSize:'13px'}}>
        {bodyLines.join('\n')}
      </div>
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

  // ─── Calcul missions selon nb expériences ET type (stage vs poste) ───
  const getMissionsConfig = (nbExp) => {
    if (nbExp <= 1) return { missionsPoste: 5, missionsStage: 2, note: "Peu d'expérience : enrichis chaque mission avec beaucoup de détails, contexte, chiffres et résultats concrets. Ajoute le contexte : taille de l'équipe, secteur, budget géré, enjeux." }
    if (nbExp === 2) return { missionsPoste: 4, missionsStage: 2, note: "4 missions pour les postes permanents, 2 max pour les stages." }
    if (nbExp === 3) return { missionsPoste: 3, missionsStage: 2, note: "3 missions pour les postes permanents, 2 max pour les stages." }
    if (nbExp === 4) return { missionsPoste: 3, missionsStage: 2, note: "2-3 missions pour les postes, 2 max pour les stages. Sois concis." }
    return { missionsPoste: 2, missionsStage: 1, note: "2 missions max pour les postes, 1 pour les stages. Très concis, priorise les plus récentes." }
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
    const { missionsPoste, missionsStage, note: noteExp } = getMissionsConfig(nbExp)
    const dateJour = getDateJour()
    const hasCertifications = profile?.certifications?.filter(c => c.titre).length > 0
    const hasCentresInteret = profile?.centres_interet?.filter(c => c).length > 0

    // Fonction de génération avec retry automatique
    const fetchWithRetry = async (url, options, retries = 1) => {
      for (let i = 0; i <= retries; i++) {
        try {
          const res = await fetch(url, options)
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res
        } catch (err) {
          if (i === retries) throw err
          await new Promise(r => setTimeout(r, 1500)) // attente 1.5s avant retry
        }
      }
    }

    try {
      const [responseCV, responseLM] = await Promise.all([

        // ════════════════════════════════════════════════════
        // PROMPT CV — Béton, 1 page garantie, tout inclus
        // ════════════════════════════════════════════════════
        fetchWithRetry('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 6000,
            system: `Tu es un expert RH senior et consultant en optimisation de CV avec 15 ans d'expérience. Tu maîtrises parfaitement les ATS (Applicant Tracking System). Tu retournes TOUJOURS et UNIQUEMENT un JSON valide, sans texte avant ou après, sans balises markdown. Jamais de JSON tronqué.`,
            messages: [{
              role: 'user',
              content: `PROFIL DU CANDIDAT :
${sourceCV}

OFFRE D'EMPLOI CIBLÉE :
${offreEmploi}

RÈGLES ABSOLUES — respecte-les toutes sans exception :

1. CHIFFRES OBLIGATOIRES DANS CHAQUE MISSION :
   Chaque mission DOIT contenir au minimum 1 chiffre ou résultat mesurable.
   INTERDIT : "Optimisé les processus administratifs" → trop vague
   OBLIGATOIRE : "Optimisé les processus administratifs réduisant les délais de clôture de 3 jours"
   Si le candidat ne donne pas de chiffres, estime des ordres de grandeur plausibles selon le contexte (taille d'entreprise, secteur, poste).
   Verbes d'action forts obligatoires : Piloté, Développé, Optimisé, Managé, Négocié, Réduit, Augmenté, Structuré, Déployé, Coordonné...

2. DISTINCTION STAGE / POSTE PERMANENT :
   - Poste permanent (CDI, CDD, alternance longue) : ${missionsPoste} missions maximum, détaillées avec chiffres
   - Stage (mention "Stage", "Stagiaire", durée < 6 mois) : ${missionsStage} missions maximum, plus concises
   - ${noteExp}

3. COMPÉTENCES — FORMAT ATS STRICT :
   Chaque compétence = 1 à 3 mots MAXIMUM. Termes techniques précis reconnus par les ATS.
   INTERDIT : "Suivi budgétaire et analyse financière" (trop long, non-ATS)
   OBLIGATOIRE : "Power BI", "SAP FI", "Excel VBA", "IFRS", "Contrôle de gestion", "Reporting financier"
   Maximum 8 compétences, toutes tirées des mots-clés de l'offre.

4. ACCROCHE ULTRA-CIBLÉE :
   2 phrases MAXIMUM. Doit contenir :
   - Le titre EXACT du poste visé
   - Au moins 1 chiffre clé (années d'expérience, % d'amélioration, montant géré...)
   - 2 mots-clés EXACTS de l'offre d'emploi
   INTERDIT : commencer par "Actuellement..." ou "Doté de..."
   OBLIGATOIRE : commencer par le profil ou une réalisation forte

5. LINKEDIN :
   Si linkedin est vide ou absent dans le profil, mets "" dans le JSON.

6. EXPÉRIENCES : Inclus les ${nbExp} expériences dans l'ordre chronologique inverse (plus récente en premier).

7. CERTIFICATIONS : ${hasCertifications ? "Inclus TOUTES les certifications — éléments différenciants importants." : "Tableau vide []."}

8. CENTRES D'INTÉRÊT : ${hasCentresInteret ? "Inclus les centres d'intérêt du candidat." : "Tableau vide []. NE PAS inventer de centres d'intérêt."}

9. OPTIMISATION ATS : Score cible 95%+. Mots-clés EXACTS de l'offre dans missions et compétences.

Retourne UNIQUEMENT ce JSON valide et complet :

{
  "prenom": "...",
  "nom": "...",
  "titre": "Titre EXACT calqué sur le poste visé",
  "email": "...",
  "telephone": "...",
  "ville": "...",
  "linkedin": "",
  "accroche": "1 phrase forte avec chiffre + mots-clés ATS. 1 phrase sur valeur ajoutée pour ce poste.",
  "experiences": [
    {
      "poste": "...",
      "entreprise": "...",
      "periode": "...",
      "lieu": "...",
      "missions": ["Verbe d'action + contexte + CHIFFRE obligatoire", "Verbe + résultat mesurable", "..."]
    }
  ],
  "formations": [
    {"diplome": "...", "etablissement": "...", "periode": "...", "mention": "...", "description": "..."}
  ],
  "competences": ["Mot-clé ATS court", "Excel VBA", "Power BI", "SAP", "..."],
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
        fetchWithRetry('/api/generate', {
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

ÉTAPE 2 — RÉDIGE LA LETTRE avec ce format EXACT (respecte l'alignement gauche/droite) :

[Prénom Nom du candidat]                                    [Nom de l'entreprise]
[Email du candidat]                                         [Adresse si trouvée dans l'offre]
[Téléphone du candidat]                                     [Service RH ou service mentionné]
[LinkedIn si disponible]

                                                            [Ville du candidat], le [date du jour]

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

      let json
      try {
        json = JSON.parse(jsonPropre)
      } catch (parseError) {
        // Tentative de récupération : extraire le JSON entre { et }
        const match = jsonPropre.match(/\{[\s\S]*\}/)
        if (match) {
          try { json = JSON.parse(match[0]) }
          catch { throw new Error("Le CV généré est incomplet. Réessaie — l'offre est peut-être trop longue.") }
        } else {
          throw new Error("Le CV généré est incomplet. Réessaie — l'offre est peut-être trop longue.")
        }
      }

      // Vérification champs obligatoires
      if (!json.prenom || !json.experiences || !Array.isArray(json.experiences)) {
        throw new Error('CV généré invalide. Réessaie.')
      }

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
      const msg = error.message?.includes('incomplet') || error.message?.includes('invalide')
        ? error.message
        : 'Une erreur est survenue lors de la génération. Réessaie dans quelques secondes.'
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
    
    // Parser expéditeur / destinataire / date
    let expediteurLines = []
    let destinataireLines = []
    let dateLine = ''
    let phase = 'expediteur'
    let count = 0
    for (const line of headerLines) {
      const t = line.trim()
      if (/le\s+\d{1,2}\s+\w+\s+\d{4}/i.test(t) || /le\s+\d{2}\/\d{2}\/\d{4}/i.test(t)) { dateLine = t; continue }
      if (/@|^\+/.test(t) && phase === 'expediteur') { expediteurLines.push(t); count++; continue }
      if (phase === 'expediteur' && count >= 2 && !/@/.test(t) && !/^\+/.test(t) && !/linkedin/i.test(t)) phase = 'destinataire'
      if (phase === 'expediteur') { expediteurLines.push(t); count++ }
      else destinataireLines.push(t)
    }
    
    const marginL = 20
    const marginR = 190
    let y = 20
    
    // ─ Expéditeur (gauche) ─
    expediteurLines.forEach((l, i) => {
      pdf.setFontSize(11)
      pdf.setFont('helvetica', i === 0 ? 'bold' : 'normal')
      pdf.text(l, marginL, y)
      y += 5.5
    })
    
    // ─ Destinataire (droite) au même niveau que l'expéditeur ─
    let yRight = 20
    destinataireLines.forEach((l, i) => {
      pdf.setFontSize(11)
      pdf.setFont('helvetica', i === 0 ? 'bold' : 'normal')
      pdf.text(l, marginR, yRight, { align: 'right' })
      yRight += 5.5
    })
    
    // ─ Date (droite, sous le destinataire) ─
    if (dateLine) {
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(11)
      pdf.text(dateLine, marginR, yRight + 4, { align: 'right' })
    }
    
    // ─ Corps de la lettre ─
    y = Math.max(y, yRight + (dateLine ? 10 : 0)) + 12
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    const bodyText = bodyLines.join('\n')
    const splitBody = pdf.splitTextToSize(bodyText, 170)
    splitBody.forEach(line => {
      if (y > 280) { pdf.addPage(); y = 20 }
      pdf.text(line, marginL, y)
      y += 5.5
    })
    
    pdf.save(`Lettre-Motivation-${cvData.prenom}-${cvData.nom}.pdf`)
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
                <LettreRenderer lettre={lettre} />
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