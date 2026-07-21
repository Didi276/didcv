import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import { supabase } from './supabase'

const TYPES = ['RH', 'Technique', 'Manager', 'Commercial']
const NB_QUESTIONS = 5
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

function buildSystemPrompt(poste, type, offre, cvResume) {
  return `Tu es [prénom] [nom], recruteur(euse) chez [entreprise extraite de l'offre ou 'une grande entreprise française'] qui fait passer un entretien ${type} pour le poste de ${poste}.
Si une offre d'emploi a été fournie, adapte tes questions exactement aux compétences et missions mentionnées dans cette offre.

${offre ? `OFFRE D'EMPLOI FOURNIE PAR LE CANDIDAT :\n${offre.slice(0, 2000)}\n` : "Aucune offre d'emploi fournie — utilise \"une grande entreprise française\" comme entreprise."}
${cvResume ? `\nCV DU CANDIDAT (utilise-le pour poser des questions adaptées à son parcours réel) :\n${cvResume.slice(0, 1500)}\n` : ''}

Choisis toi-même un prénom et un nom de recruteur(euse) français crédibles, ainsi qu'un intitulé de poste RH cohérent (ex: DRH, Chargé de recrutement, Talent Manager). Communique cette identité UNE SEULE FOIS, dans ta toute première réponse (avant la première question), via le champ "recruteur".

Pose UNE question à la fois. Après chaque réponse du candidat, donne un feedback structuré en JSON :
{ "recruteur": null, "question_suivante": "", "feedback": { "points_forts": "", "a_ameliorer": "", "note": 8, "conseil": "" }, "bilan_final": null }

Sur ta toute première réponse (avant toute réponse du candidat), remplis le champ "recruteur": { "prenom": "", "nom": "", "role": "", "entreprise": "" }, laisse "feedback" à null, et pose la première question dans "question_suivante".

Après la 5ème question, mets "question_suivante" à null et remplis "bilan_final": { "score_moyen": 7, "forces": "", "axes_amelioration": "", "conseil_final": "" }

Sois bienveillant mais honnête. Réponds UNIQUEMENT en JSON valide, sans texte avant ni après, sans markdown.`
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

function choisirVoixFrancaise() {
  const voix = window.speechSynthesis?.getVoices() || []
  const fr = voix.filter(v => v.lang?.toLowerCase().startsWith('fr'))
  const feminines = fr.filter(v => /amelie|amélie|audrey|marie|female|femme|google français/i.test(v.name))
  return feminines[0] || fr[0] || null
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

export default function Entretien() {
  const w = useWidth()
  const isMobile = w < 768

  const [step, setStep] = useState('setup') // setup | chat | bilan
  const [poste, setPoste] = useState('')
  const [type, setType] = useState('RH')
  const [offre, setOffre] = useState('')
  const [cvUtilise, setCvUtilise] = useState(null) // { titre, resume }
  const [mesCandidatures, setMesCandidatures] = useState([])
  const [candidatureSelectionnee, setCandidatureSelectionnee] = useState('')

  const [recruteur, setRecruteur] = useState(null)
  const [historique, setHistorique] = useState([]) // items affichés dans le chat
  const [apiHistory, setApiHistory] = useState([]) // messages envoyés a Claude
  const [questionIndex, setQuestionIndex] = useState(0)
  const [reponse, setReponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [bilan, setBilan] = useState(null)

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

  // Préremplissage depuis une candidature (Candidatures.jsx -> "🎯 Préparer l'entretien")
  useEffect(() => {
    const appliquerPrefill = async () => {
      const offrePrefill = sessionStorage.getItem('entretien_offre')
      const cvPrefillRaw = sessionStorage.getItem('entretien_cv')
      sessionStorage.removeItem('entretien_offre')
      sessionStorage.removeItem('entretien_cv')

      let cvPrefill = null
      try { cvPrefill = cvPrefillRaw ? JSON.parse(cvPrefillRaw) : null } catch { cvPrefill = null }

      const posteInitial = cvPrefill?.titre || (offrePrefill ? offrePrefill.split('\n')[0] : '')

      if (offrePrefill) setOffre(offrePrefill)
      if (cvPrefill) setCvUtilise(cvPrefill)
      if (posteInitial) setPoste(posteInitial)
    }
    appliquerPrefill()
  }, [])

  // Candidatures "en entretien" pour le sélecteur
  useEffect(() => {
    const charger = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('candidatures').select('*').eq('user_id', user.id).eq('statut', 'entretien').order('created_at', { ascending: false })
      setMesCandidatures(data || [])
    }
    charger()
  }, [])

  const choisirCandidature = async (id) => {
    setCandidatureSelectionnee(id)
    if (!id) return
    const candidature = mesCandidatures.find(c => c.id === id)
    if (!candidature) return
    setPoste(candidature.titre)
    setOffre([candidature.titre, candidature.entreprise && `${candidature.entreprise}${candidature.lieu ? ' - ' + candidature.lieu : ''}`, candidature.salaire, '', candidature.notes].filter(Boolean).join('\n'))
    setCvUtilise(null)
    if (candidature.cv_id) {
      const { data: cv } = await supabase.from('cvs').select('cv_data').eq('id', candidature.cv_id).maybeSingle()
      if (cv?.cv_data) setCvUtilise({ titre: candidature.titre, resume: resumerCV(cv.cv_data) })
    }
  }

  useEffect(() => () => {
    recognitionRef.current?.stop()
    window.speechSynthesis?.cancel()
  }, [])

  const lire = (texte) => {
    if (!vocalActif || !synthSupported || !texte) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(texte)
    utterance.lang = 'fr-FR'
    utterance.rate = 1.0
    const voix = choisirVoixFrancaise()
    if (voix) utterance.voice = voix
    window.speechSynthesis.speak(utterance)
  }

  const demarrerEcoute = () => {
    if (!recognitionSupported) return
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'fr-FR'
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

  const demarrer = async () => {
    if (!poste.trim()) return
    setStep('chat')
    setLoading(true)
    setErreur('')
    setHistorique([])
    setQuestionIndex(0)
    setRecruteur(null)
    setBilan(null)

    const system = buildSystemPrompt(poste.trim(), type, offre.trim(), cvUtilise?.resume)
    const premierMessage = [{ role: 'user', content: "Commence l'entretien : donne ton identité de recruteur, puis pose la première question." }]

    try {
      const json = await appelerClaude(system, premierMessage)
      if (json.recruteur) setRecruteur(json.recruteur)
      setHistorique([{ type: 'question', text: json.question_suivante }])
      setApiHistory([...premierMessage, { role: 'assistant', content: `Question 1 : "${json.question_suivante}"` }])
      setQuestionIndex(1)
      lire(json.question_suivante)
    } catch {
      setErreur("Impossible de démarrer l'entretien pour le moment. Réessaie.")
    }
    setLoading(false)
  }

  const envoyer = async () => {
    if (!reponse.trim() || loading) return
    const texteReponse = reponse.trim()
    const derniereQuestion = questionIndex === NB_QUESTIONS

    const nouvelHistorique = [...historique, { type: 'reponse', text: texteReponse }]
    setHistorique(nouvelHistorique)
    setReponse('')
    setLoading(true)
    setErreur('')

    const contenuUser = derniereQuestion
      ? `${texteReponse}\n\n(Ceci était la réponse à la 5ème et dernière question. Donne le feedback de cette réponse puis remplis bilan_final, sans poser de nouvelle question.)`
      : texteReponse

    const nouvelApiHistory = [...apiHistory, { role: 'user', content: contenuUser }]

    try {
      const system = buildSystemPrompt(poste.trim(), type, offre.trim(), cvUtilise?.resume)
      const json = await appelerClaude(system, nouvelApiHistory)
      const suite = [...nouvelHistorique]
      if (json.feedback) suite.push({ type: 'feedback', data: json.feedback })
      setHistorique(suite)

      if (json.bilan_final) {
        setBilan(json.bilan_final)
        setStep('bilan')
        comptabiliserEntretienComplete()
      } else if (json.question_suivante) {
        suite.push({ type: 'question', text: json.question_suivante })
        setHistorique(suite)
        setApiHistory([...nouvelApiHistory, {
          role: 'assistant',
          content: `Feedback donné (note ${json.feedback?.note ?? '?'}/10). Question ${questionIndex + 1} : "${json.question_suivante}"`,
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

  const nouvelEntretien = () => {
    setStep('setup')
    setPoste('')
    setType('RH')
    setOffre('')
    setCvUtilise(null)
    setCandidatureSelectionnee('')
    setRecruteur(null)
    setHistorique([])
    setApiHistory([])
    setQuestionIndex(0)
    setReponse('')
    setErreur('')
    setBilan(null)
    setModeEcrit(!isMobile)
  }

  const telechargerBilan = () => window.print()

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <style>{`@media print { nav, .no-print { display: none !important; } }`}</style>
      <div className="no-print"><Navbar currentPage="entretien" /></div>

      <div className="no-print" style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Entraîne-toi aux entretiens
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Un recruteur IA disponible 24h/24, adapté à chaque offre
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {step === 'setup' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Configure ton entretien</h2>

            {mesCandidatures.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Choisir parmi mes candidatures</label>
                <select value={candidatureSelectionnee} onChange={e => choisirCandidature(e.target.value)}
                  style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box', cursor: 'pointer', background: '#fff' }}>
                  <option value="">— Configurer manuellement —</option>
                  {mesCandidatures.map(c => (
                    <option key={c.id} value={c.id}>{c.titre}{c.entreprise ? ` — ${c.entreprise}` : ''}</option>
                  ))}
                </select>
              </div>
            )}

            {cvUtilise && (
              <div style={{ marginBottom: '20px', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '9px', fontSize: '13px', color: '#16a34a', fontWeight: '600' }}>
                📄 CV utilisé : {cvUtilise.titre}
              </div>
            )}

            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Poste visé</label>
            <input value={poste} onChange={e => setPoste(e.target.value)} placeholder="Ex : Responsable Marketing Digital"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }}
              onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />

            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Type d'entretien</label>
            <select value={type} onChange={e => setType(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box', marginBottom: '20px', cursor: 'pointer', background: '#fff' }}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
              Coller l'offre d'emploi <span style={{ fontWeight: '400', color: '#9ca3af' }}>(optionnel)</span>
            </label>
            <textarea value={offre} onChange={e => setOffre(e.target.value)} rows={6} placeholder="Colle ici le texte de l'offre pour un entretien adapté à l'entreprise et au poste exact..."
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: '28px', lineHeight: '1.6' }}
              onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />

            <button onClick={demarrer} disabled={!poste.trim()}
              style={{ width: '100%', padding: '13px', background: poste.trim() ? '#4f46e5' : '#e5e7eb', color: poste.trim() ? '#fff' : '#9ca3af', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: poste.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
              Démarrer l'entretien
            </button>
          </div>
        )}

        {step === 'chat' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Barre de progression + recruteur */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', gap: '10px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', minWidth: 0 }}>
                  {recruteur ? (
                    <>
                      {recruteur.prenom} {recruteur.nom} <span style={{ color: '#9ca3af', fontWeight: '500' }}>— {recruteur.role} chez {recruteur.entreprise}</span>
                    </>
                  ) : (
                    <>{poste} <span style={{ color: '#9ca3af', fontWeight: '500' }}>· {type}</span></>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  {synthSupported && (
                    <button onClick={() => { setVocalActif(v => !v); window.speechSynthesis.cancel() }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px' }}
                      title={vocalActif ? 'Désactiver la lecture vocale' : 'Activer la lecture vocale'}>
                      {vocalActif ? '🔊' : '🔇'}
                    </button>
                  )}
                  <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600', whiteSpace: 'nowrap' }}>
                    Question {Math.min(questionIndex, NB_QUESTIONS)}/{NB_QUESTIONS}
                  </div>
                </div>
              </div>
              <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(Math.min(questionIndex, NB_QUESTIONS) / NB_QUESTIONS) * 100}%`, height: '100%', background: '#4f46e5', borderRadius: '3px', transition: 'width 0.4s ease' }} />
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
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ background: '#4f46e5', color: '#fff', borderRadius: '14px', borderTopRightRadius: '4px', padding: '12px 16px', maxWidth: '80%', fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                        {item.text}
                      </div>
                    </div>
                  )
                }
                if (item.type === 'feedback') {
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
                          <div style={{ fontSize: '11px', color: '#4f46e5', fontWeight: '700', marginBottom: '3px' }}>💡 Conseil</div>
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
              {isMobile && !modeEcrit ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {reponse && <div style={{ fontSize: '13px', color: '#374151', textAlign: 'center', fontStyle: 'italic', padding: '0 8px' }}>« {reponse} »</div>}
                  {recognitionSupported ? (
                    <button onClick={ecoute ? arreterEtEnvoyer : demarrerEcoute} disabled={loading}
                      style={{
                        width: '72px', height: '72px', borderRadius: '50%', border: 'none', cursor: loading ? 'default' : 'pointer',
                        background: ecoute ? '#dc2626' : '#4f46e5', color: '#fff', fontSize: '28px',
                        boxShadow: ecoute ? '0 0 0 8px rgba(220,38,38,0.15)' : '0 4px 16px rgba(79,70,229,0.3)',
                        animation: ecoute ? 'pulseRouge 1.2s infinite' : 'none',
                      }}>
                      {ecoute ? '⏹' : '🎤'}
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
                  {recognitionSupported && (
                    <button onClick={ecoute ? arreterEtEnvoyer : demarrerEcoute} disabled={loading}
                      style={{
                        width: '44px', height: '44px', borderRadius: '10px', border: 'none', cursor: loading ? 'default' : 'pointer',
                        background: ecoute ? '#dc2626' : '#f3f4f6', color: ecoute ? '#fff' : '#374151', fontSize: '18px', flexShrink: 0,
                        animation: ecoute ? 'pulseRouge 1.2s infinite' : 'none',
                      }}
                      title={ecoute ? 'Arrêter et envoyer' : 'Répondre à la voix'}>
                      {ecoute ? '⏹' : '🎤'}
                    </button>
                  )}
                  <style>{`@keyframes pulseRouge{0%{box-shadow:0 0 0 0 rgba(220,38,38,0.35)}70%{box-shadow:0 0 0 10px rgba(220,38,38,0)}100%{box-shadow:0 0 0 0 rgba(220,38,38,0)}}`}</style>
                  <button onClick={envoyer} disabled={!reponse.trim() || loading}
                    style={{ padding: '12px 20px', background: reponse.trim() && !loading ? '#4f46e5' : '#e5e7eb', color: reponse.trim() && !loading ? '#fff' : '#9ca3af', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: reponse.trim() && !loading ? 'pointer' : 'default', fontFamily: 'inherit', flexShrink: 0 }}>
                    Envoyer
                  </button>
                  {isMobile && (
                    <button onClick={() => setModeEcrit(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '18px', cursor: 'pointer', flexShrink: 0 }} title="Revenir au micro">
                      🎤
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
            <div style={{ textAlign: 'center', fontSize: '13px', color: '#9ca3af', marginTop: '10px', marginBottom: '28px' }}>
              {poste} · {type}
            </div>

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
                <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7' }}>💡 {bilan.conseil_final}</div>
              </div>
            )}

            <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={telechargerBilan}
                style={{ width: '100%', padding: '13px', background: '#171412', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Télécharger mon bilan
              </button>
              <button onClick={nouvelEntretien}
                style={{ width: '100%', padding: '13px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Nouvel entretien
              </button>
              <Link to="/offres"
                style={{ display: 'block', textAlign: 'center', width: '100%', padding: '13px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', boxSizing: 'border-box' }}>
                Voir les offres d'emploi
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
