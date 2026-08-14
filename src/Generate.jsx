import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as pdfjsLib from 'pdfjs-dist'
import {
  Laptop, HeartPulse, HardHat, UtensilsCrossed, ShoppingCart, Truck, Palette, Shield, Sparkles,
  GraduationCap, Briefcase, BarChart2, CheckCircle, FolderOpen, User, MessageCircle, Zap, Loader2,
  Edit2, Check, ClipboardList, FileText, Mail, Download, Eye,
} from 'lucide-react'
import { supabase } from './supabase'
import { CVTemplatePro, TEMPLATES_PRO_META } from './CVTemplatesPro'
import { TEMPLATES_EXTRA_META } from './CVTemplatesExtra'
import CVEditorBlocks from './CVEditorBlocks'
import Navbar from './Navbar'
import { detecterSecteur, getSecteurConfig, buildPromptCV } from './secteurConfig'
import { downloadCVasPDF, downloadLettreasePDF } from './pdfUtils'
import ATSScore from './ATSScore'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const TEMPLATES_META = { ...TEMPLATES_PRO_META, ...TEMPLATES_EXTRA_META }

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

const ADMIN_EMAILS = ['fernandochokki@gmail.com', 'chokkifernando@gmail.com', 'carlinazon@gmail.com']

const PRESET_COLORS = [
  '#4f46e5', '#0a66c2', '#0f6e56', '#dc2626', '#0d9488',
  '#7c3aed', '#ea580c', '#1e3a5f', '#374151', '#c9a84c',
]

const SECTEUR_LABELS = {
  tech: { icon: Laptop, label: 'Tech' }, sante: { icon: HeartPulse, label: 'Sante' }, btp: { icon: HardHat, label: 'BTP' },
  restauration: { icon: UtensilsCrossed, label: 'Restauration' }, commerce: { icon: ShoppingCart, label: 'Commerce' },
  transport: { icon: Truck, label: 'Transport' }, creatif: { icon: Palette, label: 'Creatif' },
  securite: { icon: Shield, label: 'Securite' }, beaute: { icon: Sparkles, label: 'Beaute' },
  junior: { icon: GraduationCap, label: 'Junior' }, cadre: { icon: Briefcase, label: 'Cadre' }, tertiaire: { icon: BarChart2, label: 'Tertiaire' },
}

// Utilisé quand on arrive avec ?template=auto (depuis Offres.jsx ou une candidature)
const SECTEUR_TO_TEMPLATE = {
  tech: 'signal', sante: 'soin', btp: 'terrain', restauration: 'meridien',
  commerce: 'chiffre', transport: 'terrain', creatif: 'vitrine',
  securite: 'plan', beaute: 'ruban', junior: 'flux',
  cadre: 'prestige', tertiaire: 'meridien',
}

function LettreRenderer({ lettre }) {
  if (!lettre.includes('||EXP||')) {
    return <div style={{ fontFamily: 'Georgia,serif', fontSize: '13px', lineHeight: '1.9', color: '#222', whiteSpace: 'pre-wrap', padding: '32px' }}>{lettre}</div>
  }
  const extract = (tag, next) => {
    const start = lettre.indexOf(tag) + tag.length
    const end = next ? lettre.indexOf(next) : lettre.length
    return lettre.slice(start, end).trim()
  }
  const expLines = extract('||EXP||', '||DEST||').split('\n').filter(l => l.trim())
  const destLines = extract('||DEST||', '||DATE||').split('\n').filter(l => l.trim())
  const dateStr = extract('||DATE||', '||BODY||')
  const bodyStr = extract('||BODY||', null)
  return (
    <div style={{ fontFamily: 'Georgia,serif', fontSize: '13px', lineHeight: '1.9', color: '#222', padding: '32px 40px', background: '#fff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <div>{expLines.map((l, i) => <div key={i} style={{ fontWeight: i === 0 ? '700' : '400', lineHeight: '1.7' }}>{l}</div>)}</div>
        <div>
          {destLines.map((l, i) => <div key={i} style={{ fontWeight: i === 0 ? '700' : '400', lineHeight: '1.7' }}>{l}</div>)}
          {dateStr && <div style={{ marginTop: '12px', color: '#555' }}>{dateStr}</div>}
        </div>
      </div>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.9' }}>{bodyStr}</div>
    </div>
  )
}

export default function Generate() {
  const [searchParams] = useSearchParams()
  const templateChoisi = searchParams.get('template') || 'meridien'
  const [currentTemplate, setCurrentTemplate] = useState(templateChoisi === 'auto' ? 'meridien' : templateChoisi)
  const [templateAuto, setTemplateAuto] = useState(templateChoisi === 'auto')
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const w = useWidth()
  const isMobile = w < 768
  const [mobileTab, setMobileTab] = useState('form')

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [cvTexte, setCvTexte] = useState('')
  const [photoManuelle, setPhotoManuelle] = useState(null)
  const [offreEmploi, setOffreEmploi] = useState('')
  const [offreMeta, setOffreMeta] = useState(null)
  const [secteurDetecte, setSecteurDetecte] = useState(null)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [cvData, setCvData] = useState(null)
  const [lettre, setLettre] = useState('')
  const [activeTab, setActiveTab] = useState('cv')
  const [showEditor, setShowEditor] = useState(false)
  const [customColor, setCustomColor] = useState(null)
  const [cvSauvegardeId, setCvSauvegardeId] = useState(null)
  const [candidatureAjoutee, setCandidatureAjoutee] = useState(false)
  const [ajoutCandidatureEnCours, setAjoutCandidatureEnCours] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
        if (data?.prenom) setProfile(data)
      }
      const prefill = sessionStorage.getItem('offre_prefill')
      if (prefill) {
        sessionStorage.removeItem('offre_prefill')
        try {
          const parsed = JSON.parse(prefill)
          setOffreEmploi(parsed.texte || '')
          setOffreMeta({ titre: parsed.titre || '', entreprise: parsed.entreprise || '', url: parsed.url || '' })
        } catch {
          // Ancien format (texte brut) — conservé par compatibilité
          setOffreEmploi(prefill)
        }
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (offreEmploi.length > 50) setSecteurDetecte(detecterSecteur(offreEmploi, ''))
    else setSecteurDetecte(null)
  }, [offreEmploi])

  // ?template=auto : bascule automatiquement sur un template adapté au secteur détecté
  useEffect(() => {
    if (templateAuto && secteurDetecte) setCurrentTemplate(SECTEUR_TO_TEMPLATE[secteurDetecte] || 'meridien')
  }, [secteurDetecte, templateAuto])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCvFile(file)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const pdf = await pdfjsLib.getDocument(new Uint8Array(ev.target.result)).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map(item => item.str).join(' ') + '\n'
      }
      setCvTexte(text)
    }
    reader.readAsArrayBuffer(file)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoManuelle(ev.target.result)
    reader.readAsDataURL(file)
  }

  const buildProfileText = (p) => {
    let t = `Prenom: ${p.prenom}\nNom: ${p.nom}\nEmail: ${p.email}\nTel: ${p.telephone}\nVille: ${p.ville}\nTitre: ${p.titre}\nAccroche: ${p.accroche}\n\n`
    if (p.experiences?.length) {
      t += `EXPERIENCES:\n`
      p.experiences.forEach((exp, i) => {
        t += `[${i+1}] ${exp.poste} - ${exp.entreprise} - ${exp.periode} - ${exp.lieu}\n`
        exp.missions?.filter(m=>m).forEach(m => { t += `  - ${m}\n` })
      })
    }
    if (p.formations?.length) {
      t += `\nFORMATIONS:\n`
      p.formations.forEach(f => { t += `  ${f.diplome} | ${f.etablissement} | ${f.periode}\n` })
    }
    if (p.competences?.filter(c=>c).length) t += `\nCOMPETENCES: ${p.competences.filter(c=>c).join(', ')}\n`
    if (p.langues?.length) { t += `\nLANGUES:\n`; p.langues.forEach(l => { t += `  ${l.langue}: ${l.niveau}\n` }) }
    if (p.certifications?.filter(c=>c.titre).length) { t += `\nCERTIFICATIONS:\n`; p.certifications.filter(c=>c.titre).forEach(c => { t += `  ${c.titre} | ${c.organisme}\n` }) }
    if (p.centres_interet?.filter(c=>c).length) t += `\nINTERETS: ${p.centres_interet.filter(c=>c).join(', ')}\n`
    return t
  }

  const openChat = () => {
    setShowChat(true)
    if (chatMessages.length === 0) {
      setChatMessages([{
        role: 'assistant',
        content: `Bonjour ! Je suis là pour personnaliser ton CV selon tes souhaits.\n\nDis-moi ce que tu veux mettre en avant ou eviter. Par exemple :\n• "Je veux insister sur mon experience en management"\n• "Mettre ma formation en premier, j\'ai peu d\'experience"\n• "Ne pas mentionner mon stage chez X"\n• "Je veux un ton dynamique et ambitieux"\n\nQu\'est-ce qui est important pour toi dans ce CV ?`
      }])
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || chatLoading) return
    const userMsg = { role: 'user', content: chatInput }
    const newMessages = [...chatMessages, userMsg]
    setChatMessages(newMessages)
    setChatInput('')
    setChatLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 400,
          system: `Tu es un consultant RH qui aide un candidat a personaliser son CV. 
Tu poses des questions courtes et pertinentes pour mieux comprendre ses souhaits.
Apres 2-3 echanges, propose un resume des instructions sous la forme :
"[INSTRUCTIONS CV]
- Instruction 1
- Instruction 2
..."
Sois concis, bienveillant et professionnel. Reponds en francais.
Contexte offre : ${offreEmploi.substring(0, 200)}`,
          messages: newMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })
      const data = await res.json()
      const reply = data.content[0].text
      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }])

      // Extraire les instructions si présentes
      if (reply.includes('[INSTRUCTIONS CV]')) {
        const idx = reply.indexOf('[INSTRUCTIONS CV]')
        setInstructions(reply.slice(idx))
      }
    } catch (e) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Desolé, une erreur est survenue. Reessaie.' }])
    }
    setChatLoading(false)
  }

  const handleGenerate = async () => {
    if (!offreEmploi.trim()) { alert("Colle une offre d'emploi !"); return }
    if (!profile && !cvFile) { alert("Upload ton CV PDF ou remplis ton profil !"); return }
    setLoading(true)
    setCvData(null)
    setLettre('')
    setCvSauvegardeId(null)
    setCandidatureAjoutee(false)
    setProgress("Analyse de l'offre...")

    if (user) {
      const { count } = await supabase.from('cvs').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (count >= 1 && !ADMIN_EMAILS.includes(user.email)) {
        alert('CV gratuit deja utilise ! Passe au plan Pro pour des CV illimites.')
        setLoading(false)
        return
      }
    }

    const sourceCV = profile ? buildProfileText(profile) : cvTexte
    const nbExp = profile?.experiences?.length || 0
    const secteur = detecterSecteur(offreEmploi, sourceCV)
    const config = getSecteurConfig(secteur, nbExp, profile)
    const promptCV = buildPromptCV(sourceCV, offreEmploi, secteur, config, nbExp,
      profile?.certifications?.filter(c=>c.titre).length > 0,
      profile?.centres_interet?.filter(c=>c).length > 0)

    // Ajouter les instructions personnalisées si présentes
    const promptFinal = instructions
      ? `${promptCV}\n\nINSTRUCTIONS PERSONNALISEES DU CANDIDAT (a respecter absolument) :\n${instructions}`
      : promptCV
    const dateJour = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

    const fetchWithRetry = async (url, opts) => {
      for (let i = 0; i <= 1; i++) {
        try {
          const r = await fetch(url, opts)
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r
        } catch (e) {
          if (i === 1) throw e
          await new Promise(r => setTimeout(r, 1500))
        }
      }
    }

    try {
      setProgress("Generation du CV et de la lettre...")

      const [resCV, resLM] = await Promise.all([
        fetchWithRetry('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 6000,
            system: `Tu es un expert RH senior specialise en ${config.label}. Tu retournes UNIQUEMENT un JSON valide, sans texte avant ou apres, sans balises markdown.`,
            messages: [{ role: 'user', content: promptFinal }]
          })
        }),
        fetchWithRetry('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 1500,
            messages: [{ role: 'user', content: `Tu es expert en lettres de motivation pour le secteur ${config.label}.
PROFIL: ${sourceCV}
OFFRE: ${offreEmploi}
DATE: ${dateJour}
Redige une lettre avec ces marqueurs EXACTS:
||EXP||
[Prenom Nom]
[Email]
[Telephone]
[Ville]
||DEST||
[Entreprise]
[Service RH]
||DATE||
[Ville], le ${dateJour}
||BODY||
Objet: Candidature au poste de [intitule du poste]
[Corps de la lettre 300-380 mots, 4 paragraphes, chiffres obligatoires, ton adapte au secteur ${config.label}]
Cordialement,
[Prenom Nom]
Retourne UNIQUEMENT le texte avec les marqueurs.` }]
          })
        })
      ])

      const dataCV = await resCV.json()
      const dataLM = await resLM.json()
      const texteCV = dataCV.content[0].text
      const jsonPropre = texteCV.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      let json
      try { json = JSON.parse(jsonPropre) }
      catch {
        const match = jsonPropre.match(/\{[\s\S]*\}/)
        if (match) { try { json = JSON.parse(match[0]) } catch { throw new Error("CV incomplet. Reessaie.") } }
        else throw new Error("CV incomplet. Reessaie.")
      }

      if (!json.prenom || !json.experiences) throw new Error('CV invalide. Reessaie.')

      json.photo = profile?.photo ?? photoManuelle ?? undefined
      if (!json.certifications) json.certifications = []
      if (!json.centres_interet) json.centres_interet = []
      json._secteur = secteur

      setCvData(json)
      setLettre(dataLM.content[0].text)
      setActiveTab('cv')

      // Filet de sécurité : recharge la photo directement depuis le profil Supabase
      // (couvre le cas où le profil n'a pas été chargé en mémoire, ex. prenom manquant)
      if (user && !json.photo) {
        const { data: profil } = await supabase
          .from('profiles')
          .select('photo')
          .eq('user_id', user.id)
          .single()
        if (profil?.photo) setCvData(prev => ({ ...prev, photo: profil.photo }))
      }

      if (user) {
        const { data: cvInsere } = await supabase.from('cvs').insert({
          user_id: user.id, template: currentTemplate,
          cv_data: json, lettre_motivation: dataLM.content[0].text,
          offre_titre: offreEmploi.substring(0, 60).trim()
        }).select().single()
        if (cvInsere) setCvSauvegardeId(cvInsere.id)
      }
    } catch (err) {
      alert(err.message?.includes('incomplet') || err.message?.includes('invalide') ? err.message : 'Erreur de generation. Reessaie.')
      console.error(err)
    }
    setLoading(false)
    setProgress('')
  }

  const handleDownloadCV = () => {
    const el = document.getElementById('cv-to-print')
    downloadCVasPDF(el, cvData.prenom, cvData.nom)
  }

  const handleDownloadLettre = () => {
    downloadLettreasePDF(lettre, cvData?.prenom, cvData?.nom)
  }

  // Nécessite la colonne candidatures.cv_id (voir commentaire SQL en haut de Candidatures.jsx)
  const handleAjouterCandidature = async () => {
    if (!user || !cvSauvegardeId || ajoutCandidatureEnCours) return
    setAjoutCandidatureEnCours(true)
    const { error } = await supabase.from('candidatures').insert({
      user_id: user.id,
      titre: offreMeta?.titre || cvData?.titre || offreEmploi.split('\n')[0].slice(0, 80) || 'Candidature',
      entreprise: offreMeta?.entreprise || '',
      url_offre: offreMeta?.url || '',
      statut: 'postule',
      cv_id: cvSauvegardeId,
    })
    setAjoutCandidatureEnCours(false)
    if (error) alert("Impossible d'ajouter cette candidature au suivi pour le moment.")
    else setCandidatureAjoutee(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="generate" />

      {/* Onglets mobile */}
      {isMobile && (
        <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: '58px', zIndex: 50 }}>
          {[['form', FileText, 'Formulaire'], ['preview', Eye, 'Apercu']].map(t => {
            const TabIcon = t[1]
            return (
              <button key={t[0]} onClick={() => setMobileTab(t[0])}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '700', color: mobileTab === t[0] ? '#4f46e5' : '#9ca3af', borderBottom: mobileTab === t[0] ? '2px solid #4f46e5' : '2px solid transparent', transition: 'all 0.15s' }}>
                <TabIcon size={13} />{t[2]}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ display: isMobile ? 'block' : 'grid', gridTemplateColumns: '380px 1fr', height: isMobile ? 'auto' : 'calc(100vh - 58px)' }}>

        {/* ─── PANNEAU GAUCHE ─────────────────────────────── */}
        <div style={{ background: '#fff', borderRight: isMobile ? 'none' : '1px solid #f0f0f0', overflowY: 'auto', display: isMobile && mobileTab !== 'form' ? 'none' : 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100%' }}>

          {/* Header panneau */}
          <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f0f1a', margin: 0, letterSpacing: '-0.3px' }}>
                Generer mon CV
              </h2>
              <a href="/templates" style={{ fontSize: '12px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>
                Changer template
              </a>
            </div>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px' }}>Template : <strong style={{ color: '#374151' }}>{TEMPLATES_META[currentTemplate]?.nom || currentTemplate}</strong></p>
          </div>

          {/* Profil charge */}
          {profile ? (
            <div style={{ margin: '0 24px 16px', padding: '12px 14px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #ede9fe', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {profile.photo
                  ? <img src={profile.photo} alt="" loading="lazy" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>{profile.prenom?.[0]}{profile.nom?.[0]}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>{profile.prenom} {profile.nom}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.titre}</div>
                </div>
                <a href="/profile" style={{ fontSize: '11px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', flexShrink: 0 }}>Modifier</a>
              </div>
              <button onClick={() => setProfile(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '11px', cursor: 'pointer', padding: '6px 0 0', textDecoration: 'underline', fontFamily: 'inherit' }}>
                Utiliser un CV PDF
              </button>
            </div>
          ) : (
            <div style={{ margin: '0 24px 16px', flexShrink: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Ton CV actuel (PDF)</div>
              <label style={{ display: 'block', border: '2px dashed #e5e7eb', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: cvFile ? '#f0fdf4' : '#fafafa', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!cvFile) e.currentTarget.style.borderColor = '#4f46e5' }}
                onMouseLeave={e => { if (!cvFile) e.currentTarget.style.borderColor = '#e5e7eb' }}>
                <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                {cvFile ? (
                  <div>
                    <CheckCircle size={18} color="#16a34a" style={{ marginBottom: '4px' }} />
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>{cvFile.name}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{cvTexte.length} caracteres extraits</div>
                  </div>
                ) : (
                  <div>
                    <FolderOpen size={22} color="#9ca3af" style={{ marginBottom: '6px' }} />
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Clique pour uploader</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>PDF uniquement</div>
                  </div>
                )}
              </label>

              {/* Photo */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {photoManuelle
                  ? <img src={photoManuelle} alt="" loading="lazy" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={16} color="#9ca3af" /></div>
                }
                <div>
                  <label style={{ cursor: 'pointer' }}>
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                    <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600', textDecoration: 'underline' }}>
                      {photoManuelle ? 'Changer la photo' : 'Ajouter ma photo'}
                    </span>
                  </label>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>JPG, PNG - max 2 Mo</div>
                </div>
                {photoManuelle && <button onClick={() => setPhotoManuelle(null)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', cursor: 'pointer', padding: 0 }}>Supprimer</button>}
              </div>
            </div>
          )}

          {/* Offre d'emploi */}
          <div style={{ margin: '0 24px 16px', flexShrink: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Offre d'emploi
            </div>
            <textarea
              value={offreEmploi}
              onChange={e => setOffreEmploi(e.target.value)}
              placeholder="Colle ici le texte complet de l'offre d'emploi..."
              rows={8}
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', lineHeight: '1.6', color: '#374151', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            {secteurDetecte && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ color: '#9ca3af' }}>Secteur detecte :</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ede9fe', color: '#5b21b6', padding: '2px 10px', borderRadius: '20px', fontWeight: '600', fontSize: '11px' }}>
                  {(() => {
                    const info = SECTEUR_LABELS[secteurDetecte]
                    return info ? <><info.icon size={11} /> {info.label}</> : secteurDetecte
                  })()}
                </span>
              </div>
            )}
          </div>

          {/* Color picker */}
          <div style={{ margin: '0 24px 16px', flexShrink: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
              Couleur du template
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {PRESET_COLORS.map(c => (
                <button key={c} onClick={() => setCustomColor(customColor === c ? null : c)}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', background: c, border: customColor === c ? '3px solid #111' : '2px solid rgba(0,0,0,0.1)', cursor: 'pointer', flexShrink: 0, transition: 'transform 0.1s', transform: customColor === c ? 'scale(1.2)' : 'scale(1)' }} />
              ))}
              <label title="Couleur personnalisee" style={{ position: 'relative', cursor: 'pointer' }}>
                <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: customColor && !PRESET_COLORS.includes(customColor) ? customColor : 'linear-gradient(135deg,#f093fb,#667eea,#22d3ee)', border: '2px solid rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Palette size={12} color="#fff" /></div>
                <input type="color" onChange={e => setCustomColor(e.target.value)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
              </label>
              {customColor && (
                <button onClick={() => setCustomColor(null)} style={{ fontSize: '11px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* ─── DISCUSSION IA ─── */}
          <div style={{ margin: '0 24px 16px', flexShrink: 0 }}>
            <button onClick={() => setShowChat(!showChat)}
              style={{ width: '100%', padding: '11px 16px', background: showChat ? '#ede9fe' : '#f8f9ff', border: `1.5px solid ${showChat ? '#4f46e5' : '#e5e7eb'}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageCircle size={16} color="#4f46e5" />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: showChat ? '#4f46e5' : '#374151' }}>Personnaliser avec l'IA</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
                    {instructions ? <><CheckCircle size={11} /> Instructions enregistrees</> : 'Dis a l\'IA ce que tu veux mettre en avant'}
                  </div>
                </div>
              </div>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>{showChat ? '▲' : '▼'}</span>
            </button>

            {showChat && (
              <div style={{ marginTop: '10px', border: '1.5px solid #ede9fe', borderRadius: '12px', overflow: 'hidden', background: '#fff' }}>
                {/* Messages */}
                <div style={{ height: '260px', overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#faf9ff' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '85%', padding: '9px 13px', borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                        background: msg.role === 'user' ? '#4f46e5' : '#fff',
                        color: msg.role === 'user' ? '#fff' : '#374151',
                        fontSize: '12px', lineHeight: '1.6',
                        border: msg.role === 'assistant' ? '1px solid #ede9fe' : 'none',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div style={{ display: 'flex', gap: '4px', padding: '8px 12px', background: '#fff', border: '1px solid #ede9fe', borderRadius: '12px', width: 'fit-content' }}>
                      {[0,1,2].map(i => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4f46e5', animation: `bounce 1s ease infinite ${i*0.2}s` }} />)}
                      <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }`}</style>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div style={{ padding: '10px', borderTop: '1px solid #ede9fe', display: 'flex', gap: '8px', background: '#fff' }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Dis-moi tes souhaits..."
                    style={{ flex: 1, padding: '8px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', outline: 'none', fontFamily: 'inherit' }}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button onClick={chatMessages.length === 0 ? openChat : sendChatMessage}
                    disabled={chatLoading && chatMessages.length > 0}
                    style={{ padding: '8px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                    {chatMessages.length === 0 ? 'Commencer' : '→'}
                  </button>
                </div>

                {/* Instructions extraites */}
                {instructions && (
                  <div style={{ padding: '10px 14px', background: '#f0fdf4', borderTop: '1px solid #86efac' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: '700', color: '#16a34a', marginBottom: '4px' }}><CheckCircle size={12} /> Instructions prises en compte</div>
                    <div style={{ fontSize: '11px', color: '#166534', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{instructions}</div>
                    <button onClick={() => { setInstructions(''); setChatMessages([]) }}
                      style={{ marginTop: '6px', fontSize: '11px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 }}>
                      Reinitialiser la discussion
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bouton generer */}
          <div style={{ padding: '0 24px 24px', flexShrink: 0 }}>
            <button onClick={handleGenerate} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px', transition: 'background 0.15s', boxShadow: loading ? 'none' : '0 4px 12px rgba(79,70,229,0.3)' }}>
              {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Zap size={16} />}
              {loading ? `${progress || 'Generation...'}` : 'Generer CV + Lettre'}
            </button>
            <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>

            {cvData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {isMobile && (
                  <button onClick={() => setMobileTab('preview')}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Eye size={15} /> Voir mon CV
                  </button>
                )}
                <button onClick={() => setShowEditor(true)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px', background: '#fff', color: '#4f46e5', border: '1.5px solid #4f46e5', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <Edit2 size={14} /> Modifier mon CV
                </button>
                <a href="/dashboard" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', textAlign: 'center', padding: '11px', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
                  <CheckCircle size={15} /> Aller au dashboard
                </a>
                {user && cvSauvegardeId && (
                  candidatureAjoutee ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '11px', textAlign: 'center', background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '10px', fontSize: '13px', fontWeight: '700' }}>
                      <Check size={13} /> Ajoutée au suivi des candidatures
                    </div>
                  ) : (
                    <button onClick={handleAjouterCandidature} disabled={ajoutCandidatureEnCours}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px', background: '#fff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: ajoutCandidatureEnCours ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                      {ajoutCandidatureEnCours ? 'Ajout...' : <><ClipboardList size={14} /> Ajouter au suivi des candidatures</>}
                    </button>
                  )
                )}
                <ATSScore cvData={cvData} offreEmploi={offreEmploi} />
              </div>
            )}
          </div>
        </div>

        {/* ─── PANNEAU DROIT ──────────────────────────────── */}
        <div style={{ overflowY: 'auto', display: isMobile && mobileTab !== 'preview' ? 'none' : 'flex', flexDirection: 'column', background: '#f0f0f5', minHeight: isMobile ? '80vh' : 'auto', position: 'relative' }}>

          {cvData ? (
            <>
              {/* Onglets + actions */}
              <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[['cv', FileText, 'CV'], ...(lettre ? [['lettre', Mail, 'Lettre']] : [])].map(t => {
                    const TabIcon = t[1]
                    return (
                      <button key={t[0]} onClick={() => setActiveTab(t[0])}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: activeTab === t[0] ? '#4f46e5' : '#f3f4f6', color: activeTab === t[0] ? '#fff' : '#374151' }}>
                        <TabIcon size={13} />{t[2]}
                      </button>
                    )
                  })}
                  <button onClick={() => setShowTemplatePicker(!showTemplatePicker)}
                    style={{ display: 'flex', alignItems: 'center', padding: '7px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: showTemplatePicker ? '#ede9fe' : '#f3f4f6', color: showTemplatePicker ? '#4f46e5' : '#374151' }}>
                    <Palette size={14} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {activeTab === 'cv' && (
                    <button onClick={handleDownloadCV}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Download size={13} /> Telecharger CV
                    </button>
                  )}
                  {activeTab === 'lettre' && (
                    <button onClick={handleDownloadLettre}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Download size={13} /> Telecharger Lettre
                    </button>
                  )}
                </div>
              </div>

              {/* Contenu */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: isMobile ? '16px' : '32px 24px' }}>
                {activeTab === 'cv' ? (
                  <div style={{ transform: isMobile ? `scale(${Math.min(0.45, (w-32)/794)})` : 'scale(1)', transformOrigin: 'top center', boxShadow: '0 8px 40px rgba(0,0,0,0.15)', borderRadius: '4px', overflow: 'hidden', marginBottom: isMobile ? `-${Math.round(1123*(1-Math.min(0.45,(w-32)/794)))}px` : 0 }}>
                    <CVTemplatePro cvData={cvData} template={currentTemplate} color={customColor} />
                  </div>
                ) : (
                  <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '680px', overflow: 'hidden' }}>
                    <LettreRenderer lettre={lettre} />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Etat vide */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              {loading ? (
                <div>
                  <div style={{ width: '48px', height: '48px', border: '4px solid #ede9fe', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>{progress}</div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>Optimisation ATS en cours...</div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              ) : (
                <div>
                  <Sparkles size={52} color="#c4c4c4" strokeWidth={1.5} style={{ marginBottom: '20px' }} />
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 10px', letterSpacing: '-0.3px' }}>Ton CV apparaitra ici</h3>
                  <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, lineHeight: '1.6', maxWidth: '300px' }}>
                    Colle une offre d'emploi et clique sur Generer pour voir le resultat en temps reel.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editeur */}
      {/* Template Picker */}
      {showTemplatePicker && cvData && (
        <div onClick={() => setShowTemplatePicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 150, background: 'rgba(0,0,0,0.3)' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: isMobile ? 'auto' : '70px', bottom: isMobile ? 0 : 'auto', right: 0, left: isMobile ? 0 : 'auto', width: isMobile ? '100%' : '320px', background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : '14px 0 0 14px', padding: '20px', boxShadow: '-8px 0 32px rgba(0,0,0,0.1)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>Changer de template</div>
            <a href="/templates" style={{ display: 'block', fontSize: '11px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', marginBottom: '14px' }}>
              Voir les 50 modèles avec filtres →
            </a>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {Object.keys(TEMPLATES_META).map(t => (
                <button key={t} onClick={() => { setCurrentTemplate(t); setTemplateAuto(false); setShowTemplatePicker(false) }}
                  style={{ padding: '8px 6px', background: currentTemplate === t ? '#4f46e5' : '#f8f9ff', color: currentTemplate === t ? '#fff' : '#374151', border: `1.5px solid ${currentTemplate === t ? '#4f46e5' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '11px', fontWeight: currentTemplate === t ? '700' : '500', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'center' }}>
                  {currentTemplate === t ? '✓ ' : ''}{TEMPLATES_META[t].nom}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showEditor && cvData && (
        <CVEditorBlocks
          cvData={cvData}
          template={currentTemplate}
          onSave={(d) => { setCvData(d); setShowEditor(false) }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  )
}
