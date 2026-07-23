import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Link as LinkIcon, FileText, Lightbulb, Download, RotateCcw, BookOpen, Play, Pause, Volume2, VolumeX, Square, Mic, Send, ChevronRight } from 'lucide-react'
import Navbar from './Navbar'
import { supabase } from './supabase'

const TYPES = ['RH', 'Technique', 'Manager', 'Commercial', 'Complet']
const DUREES = [{ label: 'Court', n: 10 }, { label: 'Standard', n: 20 }, { label: 'Approfondi', n: 30 }]
const NIVEAUX = ['Junior', 'Intermédiaire', 'Senior']
const LANGUES = ['Français', 'Anglais']
const CLE_ENTRETIENS_COMPLETES = 'didcv-entretiens-completes'

function comptabiliserEntretienComplete() {
  const total = parseInt(localStorage.getItem(CLE_ENTRETIENS_COMPLETES) || '0', 10) + 1
  localStorage.setItem(CLE_ENTRETIENS_COMPLETES, String(total))
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

function resumerCV(cvData) {
  if (!cvData) return ''
  const lignes = [
    `${cvData.prenom || ''} ${cvData.nom || ''}`.trim(),
    cvData.titre,
    cvData.accroche,
  ].filter(Boolean)
  if (cvData.experiences?.length) {
    lignes.push('Expériences : ' + cvData.experiences.map(e => `${e.poste} chez ${e.entreprise}`).filter(Boolean).join(', '))
  }
  if (cvData.competences?.filter(c => c).length) {
    lignes.push('Compétences : ' + cvData.competences.filter(c => c).join(', '))
  }
  return lignes.join('\n')
}

function formatTemps(s) {
  const m = Math.floor(s / 60).toString().padStart(2, '0')
  const sec = (s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

function buildSystemPrompt({ poste, entreprise, description, cvResume, type, niveau, langue, nbQuestions }) {
  const enAnglais = langue === 'Anglais'
  return `Tu es un recruteur professionnel${entreprise ? ` chez ${entreprise}` : ''} qui fait passer un entretien pour le poste de ${poste}.
Choisis toi-même un prénom, un nom et un intitulé de poste RH crédibles pour ton personnage (ex: DRH, Talent Acquisition Manager, Chargé de recrutement).

${description ? `CONTEXTE DE L'OFFRE :\n${description.slice(0, 3000)}\n` : "Aucune offre détaillée fournie — base-toi sur l'intitulé du poste."}
${cvResume ? `\nCV DU CANDIDAT (réfère-toi à ses éléments réels pour personnaliser tes questions) :\n${cvResume.slice(0, 1500)}\n` : ''}

Type d'entretien : ${type}. Niveau attendu : ${niveau}. Nombre total de questions notées : ${nbQuestions}.

Mène un vrai entretien professionnel${enAnglais ? ', entièrement en anglais (questions, feedback, conseils)' : ', en français'}. Adapte tes questions exactement aux compétences et missions de l'offre.
Structure l'entretien proportionnellement aux ${nbQuestions} questions selon le type choisi :
- Phase RH en début (motivation, parcours, soft skills)
- Phase Technique ensuite (compétences métier liées à l'offre), sauf si le type porte uniquement sur RH
- Phase Comportementale vers la fin (mises en situation selon la méthode STAR)
- Dernière question : demande si le candidat a des questions
Si le type est "Complet", couvre les quatre phases. Si le type est ciblé (RH, Technique, Manager, Commercial), concentre l'essentiel des questions sur cette dimension.

Ta TOUTE PREMIÈRE réponse est un message d'ouverture, avant toute question notée :
"Bonjour, je suis [prénom] [nom], [poste recruteur] chez ${entreprise || "l'entreprise"}. Merci de vous être déplacé. Avant de commencer, avez-vous des questions sur le déroulement de cet entretien ?"
Pour cette réponse : "question_suivante" = ce message, "numero_question": 0, "feedback": null, "bilan_final": null.

Après la réponse du candidat à ce message d'ouverture, enchaîne directement sur la question 1 (numero_question: 1) avec "feedback": null pour cette transition (la réponse à l'ouverture n'est pas notée).

Ensuite, pose UNE question notée à la fois. Après chaque réponse du candidat à une question notée, retourne un feedback structuré (méthode STAR pour les questions comportementales), dans ce format JSON exact :
{ "question_suivante": "...", "feedback": { "points_forts": "...", "a_ameliorer": "...", "note": 7, "conseil": "..." }, "numero_question": 3, "bilan_final": null }

Quand le candidat vient de répondre à la ${nbQuestions}ème question notée, mets "question_suivante" à null et remplis "bilan_final" :
{ "question_suivante": null, "feedback": { "points_forts": "...", "a_ameliorer": "...", "note": 7, "conseil": "..." }, "numero_question": ${nbQuestions}, "bilan_final": { "score_moyen": 7, "forces": "...", "axes_amelioration": "...", "conseil_final": "..." } }

Sois professionnel, bienveillant mais exigeant comme un vrai recruteur. Réponds UNIQUEMENT en JSON valide, sans texte avant ni après, sans balises markdown.`
}

async function appelerClaude(system, messages) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1200,
      system,
      messages,
    }),
  })
  const data = await res.json()
  const text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(text)
}

function choisirVoix(langue) {
  const voix = window.speechSynthesis?.getVoices() || []
  const prefix = langue === 'Anglais' ? 'en' : 'fr'
  const filtres = voix.filter(v => v.lang?.toLowerCase().startsWith(prefix))
  const feminines = filtres.filter(v => /amelie|amélie|audrey|marie|female|femme|samantha|zira|google (français|us english)/i.test(v.name))
  return feminines[0] || filtres[0] || null
}

function CircleScore({ score }) {
  const r = 64
  const circ = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(10, score)) / 10
  const offset = circ - pct * circ
  const color = score >= 7 ? '#16a34a' : score >= 5 ? '#f59e0b' : '#dc2626'
  return (
    <div style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto' }}>
      <svg width="160" height="160" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f0f0f0" strokeWidth="14" />
        <circle cx="80" cy="80" r={r} fill="none" stroke={color} strokeWidth="14"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease', strokeLinecap: 'round' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '38px', fontWeight: '800', color, lineHeight: 1 }}>{score}</div>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>/10</div>
      </div>
    </div>
  )
}

const CHAMP = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '9px',
  fontSize: '14px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box',
}

const STATUT_LABELS = { a_postuler: 'À postuler', postule: 'Postulé', entretien: 'Entretien', offre: 'Offre reçue', refuse: 'Refusé' }

export default function Entretien() {
  const w = useWidth()
  const isMobile = w < 768

  const [step, setStep] = useState('setup') // setup | chat | bilan

  // Source de l'offre
  const [source, setSource] = useState('manuel') // candidature | url | manuel
  const [mesCandidatures, setMesCandidatures] = useState([])
  const [candidaturesChargees, setCandidaturesChargees] = useState(false)
  const [candidatureId, setCandidatureId] = useState(null)
  const [urlOffre, setUrlOffre] = useState('')
  const [analyseEnCours, setAnalyseEnCours] = useState(false)
  const [offreAnalysee, setOffreAnalysee] = useState(null)
  const [erreurAnalyse, setErreurAnalyse] = useState('')
  const [banniere, setBanniere] = useState(null)

  const [poste, setPoste] = useState('')
  const [entreprise, setEntreprise] = useState('')
  const [description, setDescription] = useState('')
  const [cvResume, setCvResume] = useState('')

  // Paramètres
  const [type, setType] = useState('RH')
  const [dureeQuestions, setDureeQuestions] = useState(20)
  const [niveau, setNiveau] = useState('Intermédiaire')
  const [langue, setLangue] = useState('Français')
  const [modeVocal, setModeVocal] = useState(true)

  // Entretien
  const [historique, setHistorique] = useState([])
  const [apiHistory, setApiHistory] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionCourante, setQuestionCourante] = useState('')
  const [recapitulatif, setRecapitulatif] = useState([])
  const [reponse, setReponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [bilan, setBilan] = useState(null)
  const [tempsEcoule, setTempsEcoule] = useState(0)
  const [dureeFinale, setDureeFinale] = useState(0)
  const [pause, setPause] = useState(false)
  const [feedbackOuverts, setFeedbackOuverts] = useState({})
  const [noteAjoutee, setNoteAjoutee] = useState(false)

  const [vocalActif, setVocalActif] = useState(true)
  const [ecoute, setEcoute] = useState(false)
  const [modeEcrit, setModeEcrit] = useState(!isMobile)
  const recognitionRef = useRef(null)
  const finRef = useRef(null)

  const recognitionSupported = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  const synthSupported = typeof window !== 'undefined' && !!window.speechSynthesis

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historique, loading])

  useEffect(() => () => {
    recognitionRef.current?.stop()
    window.speechSynthesis?.cancel()
  }, [])

  // Timer de l'entretien
  useEffect(() => {
    if (step !== 'chat' || pause) return
    const interval = setInterval(() => setTempsEcoule(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [step, pause])

  const analyserOffre = async (urlACharger) => {
    const cible = (urlACharger || urlOffre).trim()
    if (!cible) return
    setAnalyseEnCours(true)
    setErreurAnalyse('')
    setOffreAnalysee(null)
    try {
      const r = await fetch(`/api/fetch-offer?url=${encodeURIComponent(cible)}`)
      const data = await r.json()
      if (!data.contenu) throw new Error('vide')
      setDescription(data.contenu)
      try {
        const extraction = await appelerClaude(
          "Tu extrais des informations depuis le contenu brut d'une page web. Retourne UNIQUEMENT du JSON valide.",
          [{ role: 'user', content: `Voici le contenu brut d'une offre d'emploi. Extrais le titre du poste et le nom de l'entreprise. Retourne UNIQUEMENT ce JSON : { "titre": "...", "entreprise": "..." }\n\nCONTENU:\n${data.contenu.slice(0, 3000)}` }]
        )
        setOffreAnalysee({ titre: extraction.titre || '', entreprise: extraction.entreprise || '' })
        if (extraction.titre) setPoste(extraction.titre)
        if (extraction.entreprise) setEntreprise(extraction.entreprise)
      } catch {
        setOffreAnalysee({ titre: '', entreprise: '' })
      }
    } catch {
      setErreurAnalyse("Impossible de récupérer cette offre. Vérifie le lien ou remplis manuellement.")
    }
    setAnalyseEnCours(false)
  }

  // Option A : candidatures éligibles
  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setCandidaturesChargees(true); return }
      const { data } = await supabase.from('candidatures').select('*').eq('user_id', user.id).in('statut', ['entretien', 'postule']).order('created_at', { ascending: false })
      setMesCandidatures(data || [])
      setCandidaturesChargees(true)
    }
    charger()
  }, [])

  const choisirCandidature = async (c) => {
    setCandidatureId(c.id)
    setPoste(c.titre || '')
    setEntreprise(c.entreprise || '')
    setDescription([c.salaire, c.notes].filter(Boolean).join('\n'))
    setCvResume('')
    if (c.cv_id) {
      const { data: cv } = await supabase.from('cvs').select('cv_data').eq('id', c.cv_id).maybeSingle()
      if (cv?.cv_data) setCvResume(resumerCV(cv.cv_data))
    }
    if (c.url_offre) analyserOffre(c.url_offre)
  }

  // Préremplissage depuis Candidatures.jsx
  useEffect(() => {
    const appliquerPrefill = async () => {
      const id = sessionStorage.getItem('entretien_candidature_id')
      const posteSS = sessionStorage.getItem('entretien_poste')
      const entrepriseSS = sessionStorage.getItem('entretien_entreprise')
      const urlSS = sessionStorage.getItem('entretien_url')
      const modeSS = sessionStorage.getItem('entretien_mode')
      sessionStorage.removeItem('entretien_candidature_id')
      sessionStorage.removeItem('entretien_poste')
      sessionStorage.removeItem('entretien_entreprise')
      sessionStorage.removeItem('entretien_url')
      sessionStorage.removeItem('entretien_mode')

      if (!id && !posteSS) return

      if (posteSS) setPoste(posteSS)
      if (entrepriseSS) setEntreprise(entrepriseSS)
      setSource('candidature')
      setBanniere({
        poste: posteSS || '',
        entreprise: entrepriseSS || '',
        entrainement: modeSS === 'entrainement',
      })

      if (id) {
        setCandidatureId(id)
        const { data: c } = await supabase.from('candidatures').select('*').eq('id', id).maybeSingle()
        if (c) {
          setDescription([c.salaire, c.notes].filter(Boolean).join('\n'))
          if (c.cv_id) {
            const { data: cv } = await supabase.from('cvs').select('cv_data').eq('id', c.cv_id).maybeSingle()
            if (cv?.cv_data) setCvResume(resumerCV(cv.cv_data))
          }
        }
      }
      if (urlSS) analyserOffre(urlSS)
    }
    appliquerPrefill()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lire = (texte) => {
    if (!modeVocal || !vocalActif || !synthSupported || !texte) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(texte)
    utterance.lang = langue === 'Anglais' ? 'en-US' : 'fr-FR'
    utterance.rate = 1.0
    const voix = choisirVoix(langue)
    if (voix) utterance.voice = voix
    window.speechSynthesis.speak(utterance)
  }

  const demarrerEcoute = () => {
    if (!recognitionSupported || !modeVocal) return
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = langue === 'Anglais' ? 'en-US' : 'fr-FR'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript
      setReponse(transcript)
    }
    recognition.onerror = () => setEcoute(false)
    recognition.onend = () => setEcoute(false)

    recognitionRef.current = recognition
    recognition.start()
    setEcoute(true)
  }

  const arreterEtEnvoyer = () => {
    recognitionRef.current?.stop()
    setEcoute(false)
    setTimeout(() => envoyer(), 150)
  }

  const togglePause = () => {
    if (!pause) {
      recognitionRef.current?.stop()
      window.speechSynthesis?.cancel()
      setEcoute(false)
    }
    setPause(p => !p)
  }

  const demarrer = async () => {
    if (!poste.trim()) return
    setStep('chat')
    setLoading(true)
    setErreur('')
    setHistorique([])
    setApiHistory([])
    setQuestionIndex(0)
    setQuestionCourante('')
    setRecapitulatif([])
    setBilan(null)
    setTempsEcoule(0)
    setPause(false)
    setFeedbackOuverts({})
    setNoteAjoutee(false)

    const system = buildSystemPrompt({ poste: poste.trim(), entreprise: entreprise.trim(), description: description.trim(), cvResume, type, niveau, langue, nbQuestions: dureeQuestions })
    const premierMessage = [{ role: 'user', content: "Commence l'entretien avec ton message d'ouverture." }]

    try {
      const json = await appelerClaude(system, premierMessage)
      setHistorique([{ type: 'question', text: json.question_suivante }])
      setQuestionCourante(json.question_suivante)
      setApiHistory([...premierMessage, { role: 'assistant', content: `Message d'ouverture : "${json.question_suivante}"` }])
      lire(json.question_suivante)
    } catch {
      setErreur("Impossible de démarrer l'entretien pour le moment. Réessaie.")
    }
    setLoading(false)
  }

  const envoyer = async () => {
    if (!reponse.trim() || loading || pause) return
    const texteReponse = reponse.trim()
    const derniereQuestion = questionIndex === dureeQuestions

    const nouvelHistorique = [...historique, { type: 'reponse', text: texteReponse }]
    setHistorique(nouvelHistorique)
    setReponse('')
    setLoading(true)
    setErreur('')

    const contenuUser = derniereQuestion
      ? `${texteReponse}\n\n(Ceci était la réponse à la dernière question notée. Donne le feedback de cette réponse puis remplis bilan_final, sans poser de nouvelle question.)`
      : texteReponse

    const nouvelApiHistory = [...apiHistory, { role: 'user', content: contenuUser }]

    try {
      const system = buildSystemPrompt({ poste: poste.trim(), entreprise: entreprise.trim(), description: description.trim(), cvResume, type, niveau, langue, nbQuestions: dureeQuestions })
      const json = await appelerClaude(system, nouvelApiHistory)
      const suite = [...nouvelHistorique]
      if (json.feedback) {
        suite.push({ type: 'feedback', data: json.feedback })
        setRecapitulatif(r => [...r, { question: questionCourante, note: json.feedback.note }])
      }
      setHistorique(suite)

      if (json.bilan_final) {
        setBilan(json.bilan_final)
        setStep('bilan')
        setDureeFinale(tempsEcoule)
        comptabiliserEntretienComplete()
      } else if (json.question_suivante) {
        suite.push({ type: 'question', text: json.question_suivante })
        setHistorique(suite)
        setQuestionCourante(json.question_suivante)
        setApiHistory([...nouvelApiHistory, {
          role: 'assistant',
          content: `Feedback donné (note ${json.feedback?.note ?? '?'}/10). Question ${json.numero_question ?? questionIndex + 1} : "${json.question_suivante}"`,
        }])
        setQuestionIndex(i => i + 1)
        lire(json.question_suivante)
      }
    } catch {
      setErreur("La réponse n'a pas pu être analysée. Réessaie d'envoyer ta réponse.")
      setHistorique(historique)
      setReponse(texteReponse)
    }
    setLoading(false)
  }

  const recommencer = () => {
    setStep('setup')
    setHistorique([])
    setApiHistory([])
    setQuestionIndex(0)
    setQuestionCourante('')
    setRecapitulatif([])
    setBilan(null)
    setTempsEcoule(0)
    setPause(false)
    setFeedbackOuverts({})
    setErreur('')
    setNoteAjoutee(false)
    setModeEcrit(!isMobile)
  }

  const ajouterNoteCandidature = async () => {
    if (!candidatureId || !bilan) return
    const { data: candidature } = await supabase.from('candidatures').select('notes').eq('id', candidatureId).maybeSingle()
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    const ligne = `[Entraînement entretien du ${dateStr}] Score : ${bilan.score_moyen}/10`
    const nouvellesNotes = candidature?.notes ? `${candidature.notes}\n\n${ligne}` : ligne
    const { error } = await supabase.from('candidatures').update({ notes: nouvellesNotes }).eq('id', candidatureId)
    if (!error) setNoteAjoutee(true)
  }

  const telechargerBilan = () => window.print()

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <style>{`@media print { nav, .no-print { display: none !important; } }`}</style>
      <div className="no-print"><Navbar currentPage="entretien" /></div>

      <div className="no-print" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            {step === 'setup' ? 'Prépare ton entretien' : 'Entraîne-toi aux entretiens'}
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Un recruteur IA disponible 24h/24, adapté à chaque offre
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {step === 'setup' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px' }}>

            {banniere && (
              <div style={{ marginBottom: '20px', padding: '12px 16px', background: banniere.entrainement ? '#fffbeb' : '#f0fdf4', border: `1px solid ${banniere.entrainement ? '#fde68a' : '#86efac'}`, borderRadius: '10px', fontSize: '13px', color: banniere.entrainement ? '#92400e' : '#16a34a' }}>
                {banniere.entrainement ? (
                  <><strong>Entraînement anticipé</strong> — Tu n'as pas encore eu de réponse mais tu peux t'entraîner en avance{banniere.poste && <> pour <strong>{banniere.poste}</strong>{banniere.entreprise && ` chez ${banniere.entreprise}`}</>}.</>
                ) : (
                  <>Préparation pour : <strong>{banniere.poste}</strong>{banniere.entreprise && ` chez ${banniere.entreprise}`}</>
                )}
              </div>
            )}

            {/* Source de l'offre */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {[['candidature', ClipboardList, 'Mes candidatures'], ['url', LinkIcon, 'Lien d\'offre'], ['manuel', null, 'Manuel']].map(([id, Icon, label]) => (
                <button key={id} type="button" onClick={() => setSource(id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: source === id ? '#4f46e5' : '#f3f4f6', color: source === id ? '#fff' : '#374151' }}>
                  {Icon && <Icon size={13} />}{label}
                </button>
              ))}
            </div>

            {source === 'candidature' && (
              <div style={{ marginBottom: '24px' }}>
                {!candidaturesChargees ? (
                  <div style={{ fontSize: '13px', color: '#9ca3af', padding: '12px 0' }}>Chargement...</div>
                ) : mesCandidatures.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#9ca3af', padding: '12px 0' }}>
                    Aucune candidature "postulé" ou "entretien" pour l'instant. <Link to="/candidatures" style={{ color: '#4f46e5', fontWeight: '600' }}>Va sur Candidatures →</Link>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {mesCandidatures.map(c => (
                      <button key={c.id} type="button" onClick={() => choisirCandidature(c)}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '10px', border: `1.5px solid ${candidatureId === c.id ? '#4f46e5' : '#e5e7eb'}`, background: candidatureId === c.id ? '#f8f9ff' : '#fff', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                        <span style={{ fontSize: '13px', color: '#111' }}>
                          <strong>{c.entreprise || 'Entreprise ?'}</strong> — {c.titre}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: '#f3f4f6', color: '#6b7280', flexShrink: 0 }}>{STATUT_LABELS[c.statut] || c.statut}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {source === 'url' && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={urlOffre} onChange={e => setUrlOffre(e.target.value)} placeholder="https://..." style={CHAMP}
                    onKeyDown={e => e.key === 'Enter' && analyserOffre()} />
                  <button type="button" onClick={() => analyserOffre()} disabled={!urlOffre.trim() || analyseEnCours}
                    style={{ padding: '11px 18px', background: !urlOffre.trim() || analyseEnCours ? '#e5e7eb' : '#4f46e5', color: !urlOffre.trim() || analyseEnCours ? '#9ca3af' : '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: !urlOffre.trim() || analyseEnCours ? 'default' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                    {analyseEnCours ? 'Analyse...' : 'Analyser l\'offre'}
                  </button>
                </div>
                {offreAnalysee && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '9px', fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>
                    ✓ Offre analysée{offreAnalysee.titre && ` : ${offreAnalysee.titre}`}{offreAnalysee.entreprise && ` chez ${offreAnalysee.entreprise}`}
                  </div>
                )}
                {erreurAnalyse && (
                  <div style={{ marginTop: '10px', padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '9px', fontSize: '13px', color: '#dc2626' }}>
                    {erreurAnalyse}
                  </div>
                )}
              </div>
            )}

            {/* Champs communs (toujours visibles, pré-remplis selon la source) */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Poste visé *</label>
                <input value={poste} onChange={e => setPoste(e.target.value)} placeholder="Ex : Responsable Marketing Digital" style={CHAMP} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Entreprise</label>
                <input value={entreprise} onChange={e => setEntreprise(e.target.value)} placeholder="Optionnel" style={CHAMP} />
              </div>
            </div>

            {(source === 'manuel' || description) && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Description du poste <span style={{ fontWeight: '400', color: '#9ca3af' }}>(optionnel)</span>
                </label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Colle ici le descriptif du poste pour un entretien encore plus précis..."
                  style={{ ...CHAMP, resize: 'vertical', lineHeight: '1.6', fontSize: '13px' }} />
              </div>
            )}

            {cvResume && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '20px', padding: '10px 14px', background: '#f8f9ff', border: '1px solid #ede9fe', borderRadius: '9px', fontSize: '13px', color: '#4f46e5', fontWeight: '600' }}>
                <FileText size={14} /> CV pris en compte pour personnaliser les questions
              </div>
            )}

            {/* Paramètres communs */}
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Type d'entretien</label>
                  <select value={type} onChange={e => setType(e.target.value)} style={{ ...CHAMP, cursor: 'pointer', background: '#fff' }}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Niveau</label>
                  <select value={niveau} onChange={e => setNiveau(e.target.value)} style={{ ...CHAMP, cursor: 'pointer', background: '#fff' }}>
                    {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Durée</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {DUREES.map(d => (
                    <button key={d.n} type="button" onClick={() => setDureeQuestions(d.n)}
                      style={{ padding: '8px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: dureeQuestions === d.n ? '#4f46e5' : '#f3f4f6', color: dureeQuestions === d.n ? '#fff' : '#374151' }}>
                      {d.label} ({d.n} questions)
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Langue</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {LANGUES.map(l => (
                      <button key={l} type="button" onClick={() => setLangue(l)}
                        style={{ padding: '8px 14px', borderRadius: '9px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: langue === l ? '#4f46e5' : '#f3f4f6', color: langue === l ? '#fff' : '#374151' }}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Mode vocal</label>
                  <button type="button" onClick={() => setModeVocal(v => !v)}
                    style={{ width: '46px', height: '26px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: modeVocal ? '#4f46e5' : '#e5e7eb', position: 'relative' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#fff', position: 'absolute', top: '3px', left: modeVocal ? '23px' : '3px', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                  </button>
                </div>
              </div>
            </div>

            <button onClick={demarrer} disabled={!poste.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '13px', background: poste.trim() ? '#4f46e5' : '#e5e7eb', color: poste.trim() ? '#fff' : '#9ca3af', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: poste.trim() ? 'pointer' : 'default', fontFamily: 'inherit', boxShadow: poste.trim() ? '0 4px 12px rgba(79,70,229,0.3)' : 'none' }}>
              Démarrer l'entretien <ChevronRight size={16} />
            </button>
          </div>
        )}

        {step === 'chat' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Barre de progression */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {poste} <span style={{ color: '#9ca3af', fontWeight: '500' }}>{entreprise && `· ${entreprise} `}· {type}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', whiteSpace: 'nowrap' }}>{formatTemps(tempsEcoule)}</div>
                  <button onClick={togglePause} title={pause ? 'Reprendre' : 'Mettre en pause'}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}>
                    {pause ? <Play size={15} color="#374151" /> : <Pause size={15} color="#374151" />}
                  </button>
                  {modeVocal && synthSupported && (
                    <button onClick={() => { setVocalActif(v => !v); window.speechSynthesis.cancel() }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                      title={vocalActif ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'}>
                      {vocalActif ? <Volume2 size={16} color="#374151" /> : <VolumeX size={16} color="#374151" />}
                    </button>
                  )}
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    {questionIndex === 0 ? 'Introduction' : `Question ${Math.min(questionIndex, dureeQuestions)}/${dureeQuestions}`}
                  </div>
                </div>
              </div>
              <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(Math.min(questionIndex, dureeQuestions) / dureeQuestions) * 100}%`, height: '100%', background: '#4f46e5', borderRadius: '3px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Fil de discussion */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '55vh', overflowY: 'auto' }}>
              {historique.map((item, i) => {
                if (item.type === 'question') {
                  return (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '22px', flexShrink: 0 }}>👔</div>
                      <div style={{ background: '#f3f4f6', borderRadius: '14px', borderTopLeftRadius: '4px', padding: '12px 16px', maxWidth: '80%', fontSize: '14px', color: '#111', lineHeight: '1.6' }}>
                        {item.text}
                      </div>
                    </div>
                  )
                }
                if (item.type === 'reponse') {
                  const feedbackSuivant = historique[i + 1]?.type === 'feedback' ? historique[i + 1] : null
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <div style={{ background: '#4f46e5', color: '#fff', borderRadius: '14px', borderTopRightRadius: '4px', padding: '12px 16px', maxWidth: '80%', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {item.text}
                      </div>
                      {feedbackSuivant && (
                        <button onClick={() => setFeedbackOuverts(f => ({ ...f, [i]: !f[i] }))}
                          style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', padding: '2px 4px' }}>
                          {feedbackOuverts[i] ? '▲ Masquer le feedback' : '▼ Voir le feedback'}
                        </button>
                      )}
                    </div>
                  )
                }
                if (item.type === 'feedback') {
                  if (!feedbackOuverts[i - 1]) return null
                  const { points_forts, a_ameliorer, note, conseil } = item.data
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', marginBottom: '3px' }}>✓ Points forts</div>
                          <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>{points_forts}</div>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff', background: note >= 7 ? '#16a34a' : note >= 5 ? '#f59e0b' : '#dc2626', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>
                          {note}/10
                        </div>
                      </div>
                      {a_ameliorer && (
                        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '10px 14px' }}>
                          <div style={{ fontSize: '11px', color: '#c2410c', fontWeight: '700', marginBottom: '3px' }}>△ À améliorer</div>
                          <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>{a_ameliorer}</div>
                        </div>
                      )}
                      {conseil && (
                        <div style={{ background: '#f8f9ff', border: '1px solid #ede9fe', borderRadius: '10px', padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#4f46e5', fontWeight: '700', marginBottom: '3px' }}><Lightbulb size={12} /> Conseil</div>
                          <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>{conseil}</div>
                        </div>
                      )}
                    </div>
                  )
                }
                return null
              })}

              {loading && (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ fontSize: '22px' }}>👔</div>
                  <div style={{ display: 'flex', gap: '4px', background: '#f3f4f6', borderRadius: '14px', padding: '14px 16px' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#9ca3af', animation: `blink 1.2s ${i * 0.2}s infinite ease-in-out` }} />
                    ))}
                    <style>{`@keyframes blink{0%,80%,100%{opacity:0.3}40%{opacity:1}}`}</style>
                  </div>
                </div>
              )}

              {erreur && (
                <div style={{ textAlign: 'center', padding: '8px' }}>
                  <div style={{ fontSize: '13px', color: '#dc2626', marginBottom: historique.length === 0 ? '10px' : 0 }}>{erreur}</div>
                  {historique.length === 0 && (
                    <button onClick={demarrer} style={{ padding: '9px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                      Réessayer
                    </button>
                  )}
                </div>
              )}

              <div ref={finRef} />
            </div>

            {/* Zone de saisie */}
            <div style={{ borderTop: '1px solid #f0f0f0', padding: '14px 20px' }}>
              {pause ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '10px' }}>Entretien en pause</div>
                  <button onClick={togglePause}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                    <Play size={15} /> Reprendre l'entretien
                  </button>
                </div>
              ) : modeVocal && isMobile && !modeEcrit ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {reponse && <div style={{ fontSize: '13px', color: '#374151', textAlign: 'center', fontStyle: 'italic', padding: '0 8px' }}>« {reponse} »</div>}
                  {recognitionSupported ? (
                    <button onClick={ecoute ? arreterEtEnvoyer : demarrerEcoute} disabled={loading}
                      style={{
                        width: '72px', height: '72px', borderRadius: '50%', border: 'none', cursor: loading ? 'default' : 'pointer',
                        background: ecoute ? '#dc2626' : '#4f46e5', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: ecoute ? '0 0 0 8px rgba(220,38,38,0.15)' : '0 4px 16px rgba(79,70,229,0.3)',
                        animation: ecoute ? 'pulseRouge 1.2s infinite' : 'none',
                      }}>
                      {ecoute ? <Square size={26} /> : <Mic size={28} />}
                    </button>
                  ) : (
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Micro non disponible sur ce navigateur</div>
                  )}
                  <style>{`@keyframes pulseRouge{0%{box-shadow:0 0 0 0 rgba(220,38,38,0.35)}70%{box-shadow:0 0 0 14px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}`}</style>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{ecoute ? 'Écoute en cours... touche pour envoyer' : 'Touche pour répondre à la voix'}</div>
                  <button onClick={() => setModeEcrit(true)} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
                    Répondre par écrit
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                  <textarea value={reponse} onChange={e => setReponse(e.target.value)} rows={2} placeholder="Écris ta réponse..."
                    disabled={loading}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer() } }}
                    style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', color: '#111', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                    onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  {modeVocal && recognitionSupported && (
                    <button onClick={ecoute ? arreterEtEnvoyer : demarrerEcoute} disabled={loading}
                      style={{
                        width: '44px', height: '44px', borderRadius: '10px', border: 'none', cursor: loading ? 'default' : 'pointer',
                        background: ecoute ? '#dc2626' : '#f3f4f6', color: ecoute ? '#fff' : '#374151', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        animation: ecoute ? 'pulseRouge 1.2s infinite' : 'none',
                      }}
                      title={ecoute ? 'Arrêter et envoyer' : 'Répondre à la voix'}>
                      {ecoute ? <Square size={17} /> : <Mic size={18} />}
                    </button>
                  )}
                  <style>{`@keyframes pulseRouge{0%{box-shadow:0 0 0 0 rgba(220,38,38,0.35)}70%{box-shadow:0 0 0 10px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}`}</style>
                  <button onClick={envoyer} disabled={!reponse.trim() || loading}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', background: reponse.trim() && !loading ? '#4f46e5' : '#e5e7eb', color: reponse.trim() && !loading ? '#fff' : '#9ca3af', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: reponse.trim() && !loading ? 'pointer' : 'default', fontFamily: 'inherit', flexShrink: 0 }}>
                    <Send size={14} /> Envoyer
                  </button>
                  {modeVocal && isMobile && (
                    <button onClick={() => setModeEcrit(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center' }} title="Revenir au micro">
                      <Mic size={18} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 'bilan' && bilan && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '36px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', marginBottom: '20px' }}>
              Bilan de l'entretien
            </div>
            <CircleScore score={bilan.score_moyen} />
            <div style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '10px' }}>
              {poste}{entreprise && ` · ${entreprise}`}
            </div>
            <div style={{ textAlign: 'center', fontSize: '12px', color: '#9ca3af', marginBottom: '28px' }}>
              Durée : {formatTemps(dureeFinale)}
            </div>

            {recapitulatif.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>Récapitulatif</div>
                <div style={{ border: '1px solid #f0f0f0', borderRadius: '10px', overflow: 'hidden' }}>
                  {recapitulatif.map((r, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: i < recapitulatif.length - 1 ? '1px solid #f0f0f0' : 'none', background: i % 2 ? '#fafafa' : '#fff' }}>
                      <div style={{ fontSize: '13px', color: '#374151', flex: 1, lineHeight: '1.5' }}>{r.question}</div>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff', background: r.note >= 7 ? '#16a34a' : r.note >= 5 ? '#f59e0b' : '#dc2626', padding: '3px 10px', borderRadius: '20px', flexShrink: 0 }}>{r.note}/10</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {bilan.forces && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Forces</div>
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7' }}>{bilan.forces}</div>
              </div>
            )}

            {bilan.axes_amelioration && (
              <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#c2410c', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Axes d'amélioration</div>
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7' }}>{bilan.axes_amelioration}</div>
              </div>
            )}

            {bilan.conseil_final && (
              <div style={{ background: '#f8f9ff', border: '1px solid #ede9fe', borderRadius: '12px', padding: '16px', marginBottom: '28px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Conseil personnalisé</div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '14px', color: '#374151', lineHeight: '1.7' }}><Lightbulb size={15} style={{ flexShrink: 0, marginTop: '2px' }} /> {bilan.conseil_final}</div>
              </div>
            )}

            <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={telechargerBilan}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '13px', background: '#171412', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
                <Download size={15} /> Télécharger mon bilan
              </button>
              <button onClick={recommencer}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '13px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                <RotateCcw size={15} /> Recommencer avec les mêmes paramètres
              </button>
              {candidatureId && (
                noteAjoutee ? (
                  <div style={{ width: '100%', padding: '13px', textAlign: 'center', background: '#f5f3ff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '10px', fontSize: '13px', fontWeight: '700', boxSizing: 'border-box' }}>
                    ✓ Note ajoutée à ta candidature
                  </div>
                ) : (
                  <button onClick={ajouterNoteCandidature}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '13px', background: '#fff', color: '#7c3aed', border: '1.5px solid #ddd6fe', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <ClipboardList size={15} /> Ajouter une note dans mes candidatures
                  </button>
                )
              )}
              <Link to="/formations"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', textAlign: 'center', width: '100%', padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', boxSizing: 'border-box' }}>
                <BookOpen size={15} /> Formations recommandées
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
