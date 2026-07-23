import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Navbar from './Navbar'
import * as pdfjsLib from 'pdfjs-dist'
import DateRangePicker from './DateRangePicker'
import CityInput from './CityInput'
import SuggestionsIA from './SuggestionsIA'
import { FORMATIONS } from './formationsData'
import { Download, CheckCircle, User, Briefcase, GraduationCap, Zap, Plus, FileText, Lock, Trash2, Edit2, BookOpen, MapPin, Calendar, ClipboardList, FolderOpen, PartyPopper, AlertTriangle, RefreshCw, Camera, Sparkles } from 'lucide-react'

// Mots-clés d'un titre de poste -> tags "metiers" utilisés dans formationsData.js
const METIER_KEYWORDS = [
  [/compt/i, 'comptable'],
  [/assistant/i, 'assistant'],
  [/commercial|vente|business developer/i, 'commercial'],
  [/marketing/i, 'marketing'],
  [/communication/i, 'communication'],
  [/d[ée]veloppeur|informatique|logiciel|ingénieur.*(logiciel|informatique)/i, 'developpeur'],
  [/data|données/i, 'data'],
  [/chef de projet|project manager/i, 'chef de projet'],
  [/manager|responsable|directeur/i, 'manager'],
  [/rh|ressources humaines|recrut/i, 'rh'],
  [/designer|graphiste|ux|ui/i, 'designer'],
  [/cr[ée]atif|cr[ée]ation/i, 'creatif'],
  [/finance/i, 'finance'],
  [/international|export/i, 'international'],
]

function formationsPourMetier(titrePoste) {
  const tags = new Set()
  if (titrePoste) METIER_KEYWORDS.forEach(([regex, tag]) => { if (regex.test(titrePoste)) tags.add(tag) })
  let matches = tags.size ? FORMATIONS.filter(f => f.metiers.some(m => tags.has(m))) : []
  if (!matches.length) matches = FORMATIONS.filter(f => f.metiers.includes('tous'))
  return matches.slice(0, 3)
}

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const INPUT = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
  borderRadius: '9px', fontSize: '14px', fontFamily: '"Inter",system-ui,sans-serif',
  color: '#111', outline: 'none', boxSizing: 'border-box', background: '#fff',
  transition: 'border-color 0.15s',
}

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
        {label}
        {hint && <span style={{ fontWeight: '400', color: '#9ca3af', marginLeft: '6px' }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function Profile() {
  const w = useWidth()
  const isMobile = w < 768
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('import')
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const [showVerifModal, setShowVerifModal] = useState(false)
  const [savedCvs, setSavedCvs] = useState([])
  const [showSavedCvs, setShowSavedCvs] = useState(false)

  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [ville, setVille] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [titre, setTitre] = useState('')
  const [accroche, setAccroche] = useState('')
  const [photo, setPhoto] = useState(null)
  const [visibleRecruteurs, setVisibleRecruteurs] = useState(false)
  const [rechercheContrat, setRechercheContrat] = useState([])
  const [disponibilite, setDisponibilite] = useState('')

  const [experiences, setExperiences] = useState([{ poste: '', entreprise: '', periode: '', lieu: '', missions: ['', '', ''] }])
  const [formations, setFormations] = useState([{ diplome: '', etablissement: '', periode: '', mention: '', description: '' }])
  const [competences, setCompetences] = useState(['', '', '', '', '', ''])
  const [langues, setLangues] = useState([{ langue: '', niveau: '' }])
  const [certifications, setCertifications] = useState([{ titre: '', organisme: '', annee: '' }])
  const [centresInteret, setCentresInteret] = useState(['', '', ''])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
      if (data) {
        setPrenom(data.prenom || '')
        setNom(data.nom || '')
        setTelephone(data.telephone || '')
        setVille(data.ville || '')
        setLinkedin(data.linkedin || '')
        setTitre(data.titre || '')
        setAccroche(data.accroche || '')
        setPhoto(data.photo || null)
        setVisibleRecruteurs(data.visible_recruteurs || false)
        setRechercheContrat(data.recherche_contrat ? data.recherche_contrat.split(',').map(s => s.trim()).filter(Boolean) : [])
        setDisponibilite(data.disponibilite || '')
        if (data.experiences?.length) setExperiences(data.experiences)
        if (data.formations?.length) setFormations(data.formations)
        if (data.competences?.length) setCompetences(data.competences)
        if (data.langues?.length) setLangues(data.langues)
        if (data.certifications?.length) setCertifications(data.certifications)
        if (data.centres_interet?.length) setCentresInteret(data.centres_interet)
        if (data.prenom) setImportDone(true)
      }

      // Charger les CVs sauvegardés pour import rapide
      const { data: cvsData } = await supabase
        .from('cvs').select('id, cv_data, template, offre_titre, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (cvsData?.length) setSavedCvs(cvsData)
    }
    init()
  }, [])

  // ─── IMPORT PDF ─────────────────────────────────────────────
  const importFromSavedCV = (cv) => {
    const d = cv.cv_data
    // Infos de base — toujours sans erreur même si absent
    setPrenom(d.prenom || '')
    setNom(d.nom || '')
    setEmail(d.email || '')
    setTelephone(d.telephone || '')
    setVille(d.ville || '')
    setLinkedin(d.linkedin || '')
    setTitre(d.titre || '')
    setAccroche(d.accroche || '')
    // Sections optionnelles — ne plante pas si vides
    if (d.experiences?.length) setExperiences(d.experiences)
    if (d.formations?.length) setFormations(d.formations)
    if (d.competences?.filter(c => c).length) setCompetences(d.competences.filter(c => c))
    if (d.langues?.filter(l => l.langue).length) setLangues(d.langues.filter(l => l.langue))
    if (d.certifications?.filter(c => c.titre).length) setCertifications(d.certifications.filter(c => c.titre))
    // centres_interet est optionnel — pas d'erreur si absent
    if (d.centres_interet?.filter(c => c).length) setCentresInteret(d.centres_interet.filter(c => c))
    setImportDone(true)
    setShowVerifModal(true)
    setShowSavedCvs(false)
    setActiveSection('verification')
  }

  const handleImportCV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)

    try {
      const TIMEOUT = 20000
      let photoExtraite = null

      const result = await Promise.race([
        new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = async (ev) => {
            try {
              const pdf = await pdfjsLib.getDocument(new Uint8Array(ev.target.result)).promise
              let text = ''
              const maxPages = Math.min(pdf.numPages, 3)
              for (let i = 1; i <= maxPages; i++) {
                const page = await pdf.getPage(i)
                const content = await page.getTextContent()
                text += content.items.map(item => item.str).join(' ') + '\n'
                if (i === 1 && !photoExtraite) {
                  try {
                    const photoP = new Promise(async (resP) => {
                      const opList = await page.getOperatorList()
                      for (let j = 0; j < opList.fnArray.length; j++) {
                        if (opList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                          const name = opList.argsArray[j][0]
                          const img = await new Promise(r => { try { page.commonObjs.get(name, r) } catch { r(null) } })
                          if (!img?.data) continue
                          const ratio = img.width / img.height
                          if (ratio > 0.5 && ratio < 1.5 && img.width > 60 && img.height > 60) {
                            const tmp = document.createElement('canvas')
                            tmp.width = img.width; tmp.height = img.height
                            const d = tmp.getContext('2d').createImageData(img.width, img.height)
                            d.data.set(new Uint8ClampedArray(img.data))
                            tmp.getContext('2d').putImageData(d, 0, 0)
                            const MAX = 200
                            let w = img.width, h = img.height
                            if (w > MAX || h > MAX) { if (w > h) { h = Math.round(h*MAX/w); w=MAX } else { w=Math.round(w*MAX/h); h=MAX } }
                            const c = document.createElement('canvas')
                            c.width = w; c.height = h
                            c.getContext('2d').drawImage(tmp, 0, 0, w, h)
                            resP(c.toDataURL('image/jpeg', 0.8)); return
                          }
                        }
                      }
                      resP(null)
                    })
                    photoExtraite = await Promise.race([photoP, new Promise(r => setTimeout(() => r(null), 3000))])
                  } catch {}
                }
              }
              if (!text.trim()) reject(new Error('Ce PDF est un scan ou une image. Utilise un PDF avec du texte sélectionnable.'))
              else resolve({ texte: text, photo: photoExtraite })
            } catch (err) { reject(err) }
          }
          reader.onerror = () => reject(new Error('Erreur lecture fichier'))
          reader.readAsArrayBuffer(file)
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Délai dépassé (20s). Le PDF est peut-être trop lourd ou c\'est un scan.')), TIMEOUT))
      ])

      const { texte: textContent, photo: photoFound } = result

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          system: 'Tu es un expert en extraction de donnees de CV. Tu retournes UNIQUEMENT un JSON valide, sans texte avant ou apres, sans balises markdown.',
          messages: [{ role: 'user', content: `Extrais toutes les informations de ce CV. Si une information est absente, mets une chaine vide "".\n\nCV:\n${textContent.substring(0, 8000)}\n\nRetourne UNIQUEMENT ce JSON valide:\n{\n  "prenom": "",\n  "nom": "",\n  "email": "",\n  "telephone": "",\n  "ville": "",\n  "linkedin": "",\n  "titre": "",\n  "accroche": "",\n  "experiences": [{"poste":"","entreprise":"","periode":"","lieu":"","missions":["",""]}],\n  "formations": [{"diplome":"","etablissement":"","periode":"","mention":"","description":""}],\n  "competences": ["",""],\n  "langues": [{"langue":"","niveau":""}],\n  "certifications": [{"titre":"","organisme":"","annee":""}],\n  "centres_interet": ["",""]\n}` }]
        })
      })

      if (!res.ok) throw new Error(`Erreur API: ${res.status}`)
      const data = await res.json()
      if (!data.content?.[0]) throw new Error('Reponse IA invalide')
      const texteJSON = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      let json
      try { json = JSON.parse(texteJSON) } catch { const m = texteJSON.match(/\{[\s\S]*\}/); if (m) json = JSON.parse(m[0]); else throw new Error('JSON invalide') }

      if (!prenom) setPrenom(json.prenom || '')
      if (!nom) setNom(json.nom || '')
      if (json.email && !email) setEmail(json.email)
      if (json.telephone) setTelephone(json.telephone)
      if (json.ville) setVille(json.ville)
      if (json.linkedin) setLinkedin(json.linkedin)
      if (json.titre) setTitre(json.titre)
      if (json.accroche) setAccroche(json.accroche)
      if (json.experiences?.filter(e => e.poste || e.entreprise).length) setExperiences(json.experiences.map(exp => ({ ...exp, missions: exp.missions?.filter(m => m) || [''] })))
      if (json.formations?.filter(f => f.diplome || f.etablissement).length) setFormations(json.formations)
      if (json.competences?.filter(c => c).length) setCompetences(json.competences.filter(c => c))
      if (json.langues?.filter(l => l.langue).length) setLangues(json.langues.filter(l => l.langue))
      if (json.certifications?.filter(c => c.titre).length) setCertifications(json.certifications.filter(c => c.titre))
      if (json.centres_interet?.filter(c => c).length) setCentresInteret(json.centres_interet.filter(c => c))
      if (photoFound) setPhoto(photoFound)

      setImportDone(true)
      setShowVerifModal(true)
      setActiveSection('verification')

    } catch (err) {
      console.error('Erreur import CV:', err)
      alert(`Erreur lors de l'import : ${err.message}`)
    }

    setImporting(false)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image trop lourde. Utilise une image de moins de 10MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        // Redimensionner à 200x200px max et compresser
        const canvas = document.createElement('canvas')
        const MAX = 200
        let w = img.width, h = img.height
        if (w > h) { if (w > MAX) { h = Math.round(h * MAX / w); w = MAX } }
        else { if (h > MAX) { w = Math.round(w * MAX / h); h = MAX } }
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, w, h)
        // JPEG 80% — réduit à ~5-15KB au lieu de 3-5MB
        setPhoto(canvas.toDataURL('image/jpeg', 0.8))
      }
      img.src = ev.target.result
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const profileData = {
      user_id: user.id, prenom, nom, email, telephone, ville, linkedin,
      titre, accroche, photo,
      visible_recruteurs: visibleRecruteurs,
      recherche_contrat: visibleRecruteurs ? rechercheContrat.join(', ') : '',
      disponibilite: visibleRecruteurs ? disponibilite : '',
      experiences: experiences.filter(e => e.poste || e.entreprise),
      formations: formations.filter(f => f.diplome || f.etablissement),
      competences: competences.filter(c => c.trim()),
      langues: langues.filter(l => l.langue),
      certifications: certifications.filter(c => c.titre),
      centres_interet: centresInteret.filter(c => c.trim()),
    }

    // Vérifier si un profil existe déjà
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let error
    if (existing) {
      const { error: e } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)
      error = e
    } else {
      const { error: e } = await supabase
        .from('profiles')
        .insert(profileData)
      error = e
    }

    if (error) {
      alert('Erreur de sauvegarde : ' + error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const addExp = () => setExperiences([...experiences, { poste: '', entreprise: '', periode: '', lieu: '', missions: ['', '', ''] }])
  const removeExp = (i) => setExperiences(experiences.filter((_, j) => j !== i))
  const updateExp = (i, field, val) => setExperiences(experiences.map((e, j) => j === i ? { ...e, [field]: val } : e))
  const updateMission = (i, j, val) => setExperiences(experiences.map((e, k) => k === i ? { ...e, missions: e.missions.map((m, l) => l === j ? val : m) } : e))
  const addMission = (i) => setExperiences(experiences.map((e, j) => j === i ? { ...e, missions: [...e.missions, ''] } : e))
  const addForm = () => setFormations([...formations, { diplome: '', etablissement: '', periode: '', mention: '', description: '' }])
  const removeForm = (i) => setFormations(formations.filter((_, j) => j !== i))
  const updateForm = (i, field, val) => setFormations(formations.map((f, j) => j === i ? { ...f, [field]: val } : f))

  const focusStyle = (e) => { e.target.style.borderColor = '#4f46e5' }
  const blurStyle = (e) => { e.target.style.borderColor = '#e5e7eb' }

  const formationsRecommandees = formationsPourMetier(titre)

  const SECTIONS = [
    { id: 'import',       label: 'Import PDF',      icon: Download },
    { id: 'verification', label: 'Vérification',    icon: CheckCircle },
    { id: 'infos',        label: 'Infos',           icon: User },
    { id: 'experiences',  label: 'Experiences',     icon: Briefcase },
    { id: 'formations',   label: 'Formations',      icon: GraduationCap },
    { id: 'competences',  label: 'Competences',     icon: Zap },
    { id: 'plus',         label: 'Langues & Plus',  icon: Plus },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="profile" />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Mon profil</h1>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
              Importe ton CV PDF pour remplir automatiquement, puis ajuste
            </p>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 24px', background: saved ? '#16a34a' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'background 0.3s', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
            {saved && <CheckCircle size={15} />}
            {saving ? 'Sauvegarde...' : saved ? 'Sauvegarde !' : 'Sauvegarder'}
          </button>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#fff', padding: '5px', borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s', background: activeSection === s.id ? '#4f46e5' : 'transparent', color: activeSection === s.id ? '#fff' : '#6b7280', position: 'relative' }}>
              <s.icon size={13} />{s.label}
              {s.id === 'import' && !importDone && <span style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />}
            </button>
          ))}
        </div>

        {/* ─── IMPORT PDF ─── */}
        {activeSection === 'import' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '32px' }}>
            {importing ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #ede9fe', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Analyse en cours...</div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>L'IA extrait tes informations</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            ) : importDone ? (
              <div style={{ textAlign: 'center' }}>
                <CheckCircle size={44} color="#16a34a" strokeWidth={1.75} style={{ marginBottom: '14px' }} />
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Profil importé avec succès !</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Vérifie et ajuste tes informations dans les onglets.</div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setActiveSection('infos')}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 22px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                    <User size={14} /> Vérifier mes infos
                  </button>
                  <label style={{ padding: '11px 22px', background: '#f3f4f6', color: '#374151', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    <input type="file" accept=".pdf" onChange={handleImportCV} style={{ display: 'none' }} />
                    Mettre à jour depuis un PDF
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 6px', textAlign: 'center' }}>Remplis ton profil automatiquement</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 28px', textAlign: 'center', lineHeight: '1.6' }}>
                  Choisis une source pour importer tes informations
                </p>

                {/* Option 1 : CV sauvegardé sur DidCV */}
                {savedCvs.length > 0 && (
                  <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9ff', borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#4f46e5', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}><Zap size={14} /> Depuis un CV DidCV</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>Recommandé - import instantané sans IA</div>
                      </div>
                    </div>
                    {!showSavedCvs ? (
                      <button onClick={() => setShowSavedCvs(true)}
                        style={{ width: '100%', padding: '11px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Choisir parmi mes CV générés ({savedCvs.length})
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {savedCvs.map(cv => (
                          <button key={cv.id} onClick={() => importFromSavedCV(cv)}
                            style={{ padding: '10px 14px', background: '#fff', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{cv.cv_data.prenom} {cv.cv_data.nom}</div>
                              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{cv.cv_data.titre} · {cv.template}</div>
                            </div>
                            <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>Importer →</span>
                          </button>
                        ))}
                        <button onClick={() => setShowSavedCvs(false)}
                          style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textAlign: 'center', padding: '4px' }}>
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Option 2 : PDF */}
                <div style={{ padding: '20px', background: '#fafafa', borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}><FileText size={14} /> Uploader ton CV PDF</div>
                  <label
                    onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#faf9ff' }}
                    onDragLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = '#fff' }}
                    onDrop={e => {
                      e.preventDefault()
                      e.currentTarget.style.borderColor = '#d1d5db'
                      e.currentTarget.style.background = '#fff'
                      const file = e.dataTransfer.files[0]
                      if (file) handleImportCV({ target: { files: [file] } })
                    }}
                    style={{ display: 'block', padding: '24px 16px', background: '#fff', border: '2px dashed #d1d5db', borderRadius: '10px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                    <input type="file" accept=".pdf" onChange={handleImportCV} style={{ display: 'none' }} />
                    <FolderOpen size={26} color="#9ca3af" style={{ marginBottom: '8px' }} />
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                      Glisse ton CV ici ou clique pour choisir
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>PDF uniquement</div>
                  </label>
                </div>

                <button onClick={() => setActiveSection('infos')}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: '12px auto 0', background: 'none', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', color: '#6b7280', fontSize: '13px', cursor: 'pointer', textDecoration: 'none', fontFamily: 'inherit', padding: '8px 20px', borderRadius: '8px', width: '100%' }}>
                  <Edit2 size={13} /> Remplir mon profil manuellement
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── VÉRIFICATION ─── */}
        {activeSection === 'verification' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <PartyPopper size={44} color="#4f46e5" strokeWidth={1.5} style={{ marginBottom: '14px' }} />
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: '0 0 10px' }}>
                Profil importé avec succès !
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>
                L'IA a extrait tes informations. Vérifie que tout est correct avant de sauvegarder.
              </p>
            </div>

            {/* Récap des infos importées */}
            <div style={{ background: '#f8f9ff', borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ClipboardList size={14} /> Informations importées
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                {[
                  ['Prénom', prenom], ['Nom', nom], ['Email', email],
                  ['Téléphone', telephone], ['Ville', ville], ['Titre', titre],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#9ca3af', minWidth: '70px' }}>{label} :</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: val ? '#111' : '#f59e0b', fontWeight: val ? '500' : '400' }}>
                      {val || <><AlertTriangle size={11} /> Non trouvé</>}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '13px' }}>
                <span style={{ color: '#16a34a' }}>✓ {experiences.filter(e => e.poste).length} expérience(s)</span>
                <span style={{ color: '#16a34a' }}>✓ {formations.filter(f => f.diplome).length} formation(s)</span>
                <span style={{ color: '#16a34a' }}>✓ {competences.filter(c => c).length} compétence(s)</span>
                <span style={{ color: '#16a34a' }}>✓ {langues.filter(l => l.langue).length} langue(s)</span>
              </div>
            </div>

            {/* Avertissement */}
            <div style={{ background: '#fffbeb', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '10px', padding: '14px 16px', marginBottom: '12px', display: 'flex', gap: '10px' }}>
              <AlertTriangle size={18} color="#92400e" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                <strong>Vérifie bien tes informations avant de sauvegarder.</strong><br />
                L'IA peut faire des erreurs - contrôle les dates, les intitulés de poste et les missions. Corrige ce qui ne va pas dans les onglets.
              </div>
            </div>

            <div style={{ background: '#eff6ff', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
              <span style={{ flexShrink: 0, display: 'flex' }}>{photo ? <CheckCircle size={18} color="#16a34a" /> : <span style={{ fontSize: '18px' }}>📸</span>}</span>
              <div style={{ fontSize: '13px', color: '#1e40af', lineHeight: '1.6' }}>
                {photo
                  ? <><strong>Photo détectée et importée !</strong><br />Vérifie dans l'onglet "Infos" que c'est bien la bonne.</>
                  : <><strong>Ta photo n'a pas été importée.</strong><br />Les photos dans les PDFs ne sont pas toujours extractibles. Ajoute-la manuellement dans l'onglet "Infos".</>
                }
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveSection('infos')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                <User size={15} /> Vérifier mes infos
              </button>
              <button onClick={() => setActiveSection('experiences')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Briefcase size={15} /> Vérifier mes expériences
              </button>
            </div>
            <button onClick={handleSave}
              style={{ width: '100%', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(22,163,74,0.3)' }}>
              {saved && <CheckCircle size={15} />}
              {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Tout semble bon - Sauvegarder'}
            </button>
          </div>
        )}

        {/* ─── INFOS ─── */}
        {activeSection === 'infos' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 24px' }}>Informations personnelles</h2>

            {/* Avertissement 1 compte = 1 personne */}
            <div style={{ background: '#fffbeb', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '10px', padding: '12px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <AlertTriangle size={16} color="#92400e" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                <strong>1 compte = 1 personne.</strong> Ton nom et prénom sont liés à ce compte et ne peuvent pas être changés une fois enregistrés. Si tu veux changer de profil, crée un nouveau compte.
              </div>
            </div>

            {/* Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
              {photo
                ? <img src={photo} alt="Photo" loading="lazy" style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #4f46e5', flexShrink: 0 }} />
                : <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><User size={32} color="#4f46e5" strokeWidth={1.75} /></div>
              }
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '6px' }}>Photo de profil</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#4f46e5', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input type="file" accept="image/*" capture="user" onChange={handlePhoto} style={{ display: 'none' }} />
                    {photo ? <><RefreshCw size={13} /> Changer</> : <><Camera size={13} /> Ajouter</>}
                  </label>
                  {photo && <button onClick={() => setPhoto(null)} style={{ padding: '8px 14px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '5px' }}>JPG, PNG, compressée automatiquement</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
              <Field label="Prénom">
                {importDone && prenom ? (
                  <div style={{ padding: '9px 14px', border: '1.5px solid #f0f0f0', borderRadius: '9px', fontSize: '14px', color: '#374151', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600' }}>{prenom}</span>
                    <Lock size={11} color="#c4c4c4" />
                  </div>
                ) : (
                  <input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Marie" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                )}
              </Field>
              <Field label="Nom">
                {importDone && nom ? (
                  <div style={{ padding: '9px 14px', border: '1.5px solid #f0f0f0', borderRadius: '9px', fontSize: '14px', color: '#374151', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600' }}>{nom}</span>
                    <Lock size={11} color="#c4c4c4" />
                  </div>
                ) : (
                  <input value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                )}
              </Field>
              <Field label="Téléphone">
                <input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+33 6 12 34 56 78" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
              <Field label="Ville">
                <CityInput value={ville} onChange={setVille} placeholder="Paris" />
              </Field>
              <Field label="Email">
                <div style={{ padding: '9px 14px', border: '1.5px solid #f0f0f0', borderRadius: '9px', fontSize: '14px', color: '#9ca3af', background: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{email}</span>
                  <span style={{ fontSize: '11px', color: '#c4c4c4', display: 'flex', alignItems: 'center', gap: '4px' }}><Lock size={11} /> Email du compte</span>
                </div>
              </Field>
              <Field label="LinkedIn" hint="optionnel">
                <input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/..." style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
              </Field>
            </div>
            <Field label="Titre professionnel"><input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Responsable Marketing Digital" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
            <Field label="Accroche" hint="3-4 phrases">
              <textarea value={accroche} onChange={e => setAccroche(e.target.value)} rows={4} style={{ ...INPUT, resize: 'vertical', lineHeight: '1.6' }} onFocus={focusStyle} onBlur={blurStyle} />
              <SuggestionsIA
                poste={titre}
                type="accroche"
                onSelect={s => setAccroche(s)}
              />
            </Field>

            {/* Visibilité recruteurs */}
            <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '16px' }}>Visibilité recruteurs</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#111', marginBottom: '2px' }}>Être visible par les recruteurs</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>Apparaît dans la banque de talents recruteurs</div>
                </div>
                <button type="button" onClick={() => setVisibleRecruteurs(v => !v)}
                  style={{ width: '46px', height: '26px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: visibleRecruteurs ? '#4f46e5' : '#e5e7eb', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: visibleRecruteurs ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </button>
              </div>

              {visibleRecruteurs && (
                <div style={{ marginTop: '18px' }}>
                  <Field label="Je recherche" hint="plusieurs choix possibles">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance'].map(c => {
                        const actif = rechercheContrat.includes(c)
                        return (
                          <button key={c} type="button"
                            onClick={() => setRechercheContrat(actif ? rechercheContrat.filter(v => v !== c) : [...rechercheContrat, c])}
                            style={{ padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: actif ? '#4f46e5' : '#f3f4f6', color: actif ? '#fff' : '#374151' }}>
                            {actif ? '✓ ' : ''}{c}
                          </button>
                        )
                      })}
                    </div>
                  </Field>
                  <Field label="Disponibilité">
                    <select value={disponibilite} onChange={e => setDisponibilite(e.target.value)} style={{ ...INPUT, cursor: 'pointer' }}>
                      <option value="">Sélectionner</option>
                      {['Immédiatement', 'Dans 1 mois', 'Dans 3 mois'].map(d => <option key={d}>{d}</option>)}
                    </select>
                  </Field>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', background: '#f8f9ff', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', color: '#4f46e5', lineHeight: '1.6' }}>
                    <Sparkles size={14} style={{ flexShrink: 0, marginTop: '2px' }} /> Seuls ton prénom, initiale du nom, titre professionnel et ville sont visibles. Ton email reste masqué. Seuls les recruteurs certifiés par DidCV peuvent accéder à la banque.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── EXPERIENCES ─── */}
        {activeSection === 'experiences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {experiences.map((exp, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>
                    Experience {i + 1} {exp.poste && <span style={{ color: '#4f46e5' }}>- {exp.poste}</span>}
                  </h3>
                  {experiences.length > 1 && <button onClick={() => removeExp(i)} style={{ padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <Field label="Poste"><input value={exp.poste} onChange={e => updateExp(i, 'poste', e.target.value)} placeholder="Responsable Marketing" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Entreprise"><input value={exp.entreprise} onChange={e => updateExp(i, 'entreprise', e.target.value)} placeholder="TechStartup" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Période"><DateRangePicker value={exp.periode} onChange={v => updateExp(i, 'periode', v)} /></Field>
                  <Field label="Lieu"><CityInput value={exp.lieu} onChange={v => updateExp(i, 'lieu', v)} placeholder="Paris" /></Field>
                </div>
                <Field label="Missions">
                  {exp.missions?.map((m, j) => (
                    <input key={j} value={m} onChange={e => updateMission(i, j, e.target.value)} placeholder={`Mission ${j+1}`} style={{ ...INPUT, marginBottom: '8px' }} onFocus={focusStyle} onBlur={blurStyle} />
                  ))}
                  <button onClick={() => addMission(i)} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>+ Ajouter une mission</button>
                  <SuggestionsIA
                    poste={exp.poste}
                    type="missions"
                    onSelect={s => {
                      const missions = [...(exp.missions || []).filter(m => m), s]
                      updateExp(i, 'missions', missions)
                    }}
                  />
                </Field>
              </div>
            ))}
            <button onClick={addExp} style={{ padding: '14px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '14px', color: '#6b7280', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}>
              + Ajouter une experience
            </button>
          </div>
        )}

        {/* ─── FORMATIONS ─── */}
        {activeSection === 'formations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {formations.map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>Formation {i + 1} {f.diplome && <span style={{ color: '#4f46e5' }}>- {f.diplome}</span>}</h3>
                  {formations.length > 1 && <button onClick={() => removeForm(i)} style={{ padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <Field label="Diplome"><input value={f.diplome} onChange={e => updateForm(i, 'diplome', e.target.value)} placeholder="Master Marketing Digital" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Etablissement"><input value={f.etablissement} onChange={e => updateForm(i, 'etablissement', e.target.value)} placeholder="ESCP Business School" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Période"><DateRangePicker value={f.periode} onChange={v => updateForm(i, 'periode', v)} /></Field>
                  <Field label="Mention" hint="optionnel"><input value={f.mention} onChange={e => updateForm(i, 'mention', e.target.value)} placeholder="Tres Bien" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                </div>
                <Field label="Description"><input value={f.description} onChange={e => updateForm(i, 'description', e.target.value)} placeholder="Specialisation en..." style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              </div>
            ))}
            <button onClick={addForm} style={{ padding: '14px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '14px', color: '#6b7280', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}>
              + Ajouter une formation
            </button>
          </div>
        )}

        {/* ─── COMPETENCES ─── */}
        {activeSection === 'competences' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Competences</h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>Outils, logiciels, methodes - ex: Excel, Salesforce, Gestion de projet</p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {competences.map((c, i) => (
                <input key={i} value={c} onChange={e => setCompetences(competences.map((v, j) => j === i ? e.target.value : v))}
                  placeholder={`Competence ${i+1}`} style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
              ))}
            </div>
            <button onClick={() => setCompetences([...competences, ''])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              + Ajouter
            </button>
            <SuggestionsIA
              poste={titre || experiences[0]?.poste || ''}
              type="competences"
              onSelect={s => {
                if (!competences.includes(s)) setCompetences([...competences.filter(c => c), s])
              }}
            />

            {formationsRecommandees.length > 0 && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f0f0f0' }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#111', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '7px' }}><BookOpen size={15} /> Formations recommandées pour toi</h3>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '10px' }}>
                  {formationsRecommandees.map(f => (
                    <a key={f.id} href={f.lien} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'block', padding: '14px', background: '#f8f9ff', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '10px', textDecoration: 'none', transition: 'box-shadow 0.15s, background 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.15)'; e.currentTarget.style.background = '#faf9ff' }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.background = '#f8f9ff' }}>
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{f.categorie}</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '4px', lineHeight: '1.3' }}>{f.titre}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>⏱ {f.duree} · {f.niveau}</div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PLUS ─── */}
        {activeSection === 'plus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Langues */}
            <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Langues</h2>
              {langues.map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <Field label={i === 0 ? 'Langue' : ''}><input value={l.langue} onChange={e => setLangues(langues.map((v, j) => j === i ? { ...v, langue: e.target.value } : v))} placeholder="Francais" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label={i === 0 ? 'Niveau' : ''}>
                    <select value={l.niveau} onChange={e => setLangues(langues.map((v, j) => j === i ? { ...v, niveau: e.target.value } : v))} style={{ ...INPUT, cursor: 'pointer' }} onFocus={focusStyle} onBlur={blurStyle}>
                      <option value="">Choisir</option>
                      {['Langue maternelle', 'Bilingue (C2)', 'Courant (C1)', 'Avance (B2)', 'Intermediaire (B1)', 'Notions (A2/A1)'].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </Field>
                  {langues.length > 1 && <button onClick={() => setLangues(langues.filter((_, j) => j !== i))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '18px' }}><Trash2 size={14} /></button>}
                </div>
              ))}
              <button onClick={() => setLangues([...langues, { langue: '', niveau: '' }])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter une langue</button>
            </div>

            {/* Certifications */}
            <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Certifications</h2>
              {certifications.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 80px auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <Field label={i === 0 ? 'Titre' : ''}><input value={c.titre} onChange={e => setCertifications(certifications.map((v, j) => j === i ? { ...v, titre: e.target.value } : v))} placeholder="Google Analytics" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label={i === 0 ? 'Organisme' : ''}><input value={c.organisme} onChange={e => setCertifications(certifications.map((v, j) => j === i ? { ...v, organisme: e.target.value } : v))} placeholder="Google" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label={i === 0 ? 'Annee' : ''}><input value={c.annee} onChange={e => setCertifications(certifications.map((v, j) => j === i ? { ...v, annee: e.target.value } : v))} placeholder="2024" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  {certifications.length > 1 && <button onClick={() => setCertifications(certifications.filter((_, j) => j !== i))} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', marginBottom: '18px' }}><Trash2 size={14} /></button>}
                </div>
              ))}
              <button onClick={() => setCertifications([...certifications, { titre: '', organisme: '', annee: '' }])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter</button>
            </div>

            {/* Centres d'interet */}
            <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Centres d'interet</h2>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 16px' }}>Optionnel</p>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                {centresInteret.map((ci, i) => (
                  <input key={i} value={ci} onChange={e => setCentresInteret(centresInteret.map((v, j) => j === i ? e.target.value : v))}
                    placeholder={['Voyage', 'Photographie', 'Sport'][i] || `Interet ${i+1}`} style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                ))}
              </div>
              <button onClick={() => setCentresInteret([...centresInteret, ''])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter</button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODALE VÉRIFICATION OBLIGATOIRE ─── */}
      {showVerifModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '36px', maxWidth: '480px', width: '100%', boxShadow: '0 24px 64px rgba(0,0,0,0.2)', textAlign: 'center' }}>
            <AlertTriangle size={44} color="#f59e0b" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111', margin: '0 0 12px', letterSpacing: '-0.5px' }}>
              Vérifie bien tes informations !
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 20px', lineHeight: '1.7' }}>
              La lecture automatique du PDF n'est <strong>pas parfaite à 100%</strong>. L'IA peut faire des erreurs sur :
            </p>
            <div style={{ background: '#fef3c7', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', textAlign: 'left' }}>
              {[
                { icon: null, texte: 'Ton prénom et ton nom' },
                { icon: Calendar, texte: 'Les dates et périodes de poste' },
                { icon: null, texte: 'Les noms d\'entreprises' },
                { icon: MapPin, texte: 'Les villes et lieux' },
                { icon: ClipboardList, texte: 'Les intitulés de poste' },
              ].map(item => (
                <div key={item.texte} style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', color: '#92400e', marginBottom: '6px', fontWeight: '500' }}>
                  {item.icon && <item.icon size={13} />}{item.texte}
                </div>
              ))}
            </div>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>
              Prends 2 minutes pour vérifier chaque section avant de sauvegarder.
            </p>
            <button onClick={() => setShowVerifModal(false)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
              <CheckCircle size={16} /> Compris, je vais vérifier mes infos
            </button>
          </div>
        </div>
      )}

      {/* Bouton save fixe */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
        <button onClick={handleSave} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '13px 28px', background: saved ? '#16a34a' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(79,70,229,0.4)', transition: 'background 0.3s' }}>
          {saved && <CheckCircle size={15} />}
          {saving ? '...' : saved ? 'Sauvegarde !' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  )
}
