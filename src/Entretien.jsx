import { useState, useRef, useEffect } from 'react'
import Navbar from './Navbar'

const TYPES = ['RH', 'Technique', 'Manager', 'Commercial']
const NB_QUESTIONS = 5

function buildSystemPrompt(poste, type) {
  return `Tu es un recruteur expérimenté qui fait passer un entretien pour le poste de ${poste}. Type d'entretien : ${type}. Pose une question à la fois, attends la réponse, puis donne un feedback structuré (Points forts / Points à améliorer / Note /10) avant de passer à la question suivante. Après 5 questions pose un bilan global. Sois bienveillant mais honnête. Réponds en français.

Retourne UNIQUEMENT un JSON valide à chaque tour, sans texte avant ni après, sans markdown, dans l'un de ces formats :

Pour poser une question (au tout début) :
{ "feedback": null, "question": "la question posée", "bilan": null }

Pour donner le feedback de la réponse précédente puis poser la question suivante :
{ "feedback": { "points_forts": ["...", "..."], "points_a_ameliorer": ["...", "..."], "note": 7 }, "question": "la question suivante", "bilan": null }

Après la 5e réponse, au lieu d'une nouvelle question, donne le feedback de cette dernière réponse ET le bilan global :
{ "feedback": { "points_forts": ["...", "..."], "points_a_ameliorer": ["...", "..."], "note": 7 }, "question": null, "bilan": { "score_moyen": 7.2, "forces": ["...", "..."], "axes_amelioration": ["...", "..."], "conseils": ["...", "..."] } }`
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

export default function Entretien() {
  const [step, setStep] = useState('setup') // setup | chat
  const [poste, setPoste] = useState('')
  const [type, setType] = useState('RH')
  const [historique, setHistorique] = useState([]) // items affichés dans le chat
  const [apiHistory, setApiHistory] = useState([]) // messages envoyés a Claude
  const [questionIndex, setQuestionIndex] = useState(0)
  const [reponse, setReponse] = useState('')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [termine, setTermine] = useState(false)
  const finRef = useRef(null)

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [historique, loading])

  const demarrer = async () => {
    if (!poste.trim()) return
    setStep('chat')
    setLoading(true)
    setErreur('')
    setHistorique([])
    setQuestionIndex(0)
    setTermine(false)

    const system = buildSystemPrompt(poste.trim(), type)
    const premierMessage = [{ role: 'user', content: "Commence l'entretien avec la première question." }]

    try {
      const json = await appelerClaude(system, premierMessage)
      setHistorique([{ type: 'question', text: json.question }])
      setApiHistory([...premierMessage, { role: 'assistant', content: `Question 1 : "${json.question}"` }])
      setQuestionIndex(1)
    } catch {
      setErreur("Impossible de démarrer l'entretien pour le moment. Réessaie.")
    }
    setLoading(false)
  }

  const envoyer = async () => {
    if (!reponse.trim() || loading || termine) return
    const texteReponse = reponse.trim()
    const derniereQuestion = questionIndex === NB_QUESTIONS

    const nouvelHistorique = [...historique, { type: 'reponse', text: texteReponse }]
    setHistorique(nouvelHistorique)
    setReponse('')
    setLoading(true)
    setErreur('')

    const contenuUser = derniereQuestion
      ? `${texteReponse}\n\n(Ceci était la réponse à la 5e et dernière question. Donne le feedback de cette réponse puis le bilan global, sans poser de nouvelle question.)`
      : texteReponse

    const nouvelApiHistory = [...apiHistory, { role: 'user', content: contenuUser }]

    try {
      const system = buildSystemPrompt(poste.trim(), type)
      const json = await appelerClaude(system, nouvelApiHistory)
      const suite = [...nouvelHistorique]
      if (json.feedback) suite.push({ type: 'feedback', data: json.feedback })

      if (json.bilan) {
        suite.push({ type: 'bilan', data: json.bilan })
        setHistorique(suite)
        setTermine(true)
      } else if (json.question) {
        suite.push({ type: 'question', text: json.question })
        setHistorique(suite)
        setApiHistory([...nouvelApiHistory, {
          role: 'assistant',
          content: `Feedback donné (note ${json.feedback?.note ?? '?'}/10). Question ${questionIndex + 1} : "${json.question}"`,
        }])
        setQuestionIndex(i => i + 1)
      } else {
        setHistorique(suite)
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
    setHistorique([])
    setApiHistory([])
    setQuestionIndex(0)
    setReponse('')
    setErreur('')
    setTermine(false)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="entretien" />

      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Entraîne-toi aux entretiens
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Prépare-toi avec un recruteur IA disponible 24h/24
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {step === 'setup' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Configure ton entretien</h2>

            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Poste visé</label>
            <input value={poste} onChange={e => setPoste(e.target.value)} placeholder="Ex : Responsable Marketing Digital"
              style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '9px', fontSize: '14px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box', marginBottom: '20px' }}
              onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />

            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Type d'entretien</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                  style={{ padding: '8px 16px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: type === t ? '#4f46e5' : '#f3f4f6', color: type === t ? '#fff' : '#374151' }}>
                  {t}
                </button>
              ))}
            </div>

            <button onClick={demarrer} disabled={!poste.trim()}
              style={{ width: '100%', padding: '13px', background: poste.trim() ? '#4f46e5' : '#e5e7eb', color: poste.trim() ? '#fff' : '#9ca3af', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: poste.trim() ? 'pointer' : 'default', fontFamily: 'inherit' }}>
              Démarrer l'entretien
            </button>
          </div>
        )}

        {step === 'chat' && (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Barre de progression */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>
                  {poste} <span style={{ color: '#9ca3af', fontWeight: '500' }}>· {type}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  {termine ? 'Terminé' : `Question ${Math.min(questionIndex, NB_QUESTIONS)}/${NB_QUESTIONS}`}
                </div>
              </div>
              <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${(Math.min(questionIndex, NB_QUESTIONS) / NB_QUESTIONS) * 100}%`, height: '100%', background: '#4f46e5', borderRadius: '3px', transition: 'width 0.4s ease' }} />
              </div>
            </div>

            {/* Fil de discussion */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '60vh', overflowY: 'auto' }}>
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
                  const { points_forts, points_a_ameliorer, note } = item.data
                  return (
                    <div key={i} style={{ background: '#f8f9ff', border: '1px solid #ede9fe', borderRadius: '12px', padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feedback</div>
                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#fff', background: note >= 7 ? '#16a34a' : note >= 5 ? '#f59e0b' : '#dc2626', padding: '2px 10px', borderRadius: '20px' }}>
                          {note}/10
                        </div>
                      </div>
                      {points_forts?.length > 0 && (
                        <div style={{ marginBottom: '8px' }}>
                          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', marginBottom: '4px' }}>✓ Points forts</div>
                          {points_forts.map((p, j) => (
                            <div key={j} style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>· {p}</div>
                          ))}
                        </div>
                      )}
                      {points_a_ameliorer?.length > 0 && (
                        <div>
                          <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', marginBottom: '4px' }}>△ À améliorer</div>
                          {points_a_ameliorer.map((p, j) => (
                            <div key={j} style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>· {p}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                }
                if (item.type === 'bilan') {
                  const { score_moyen, forces, axes_amelioration, conseils } = item.data
                  return (
                    <div key={i} style={{ background: '#fff', border: '2px solid #4f46e5', borderRadius: '14px', padding: '20px' }}>
                      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Bilan de l'entretien</div>
                        <div style={{ fontSize: '38px', fontWeight: '800', color: '#111' }}>{score_moyen}<span style={{ fontSize: '16px', color: '#9ca3af', fontWeight: '600' }}>/10</span></div>
                      </div>
                      {forces?.length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', marginBottom: '6px' }}>Forces</div>
                          {forces.map((f, j) => <div key={j} style={{ fontSize: '13px', color: '#374151', padding: '3px 0' }}>✓ {f}</div>)}
                        </div>
                      )}
                      {axes_amelioration?.length > 0 && (
                        <div style={{ marginBottom: '14px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#dc2626', marginBottom: '6px' }}>Axes d'amélioration</div>
                          {axes_amelioration.map((f, j) => <div key={j} style={{ fontSize: '13px', color: '#374151', padding: '3px 0' }}>△ {f}</div>)}
                        </div>
                      )}
                      {conseils?.length > 0 && (
                        <div style={{ background: '#f8f9ff', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', marginBottom: '6px' }}>Conseils personnalisés</div>
                          {conseils.map((c, j) => <div key={j} style={{ fontSize: '13px', color: '#374151', padding: '3px 0', lineHeight: '1.6' }}>💡 {c}</div>)}
                        </div>
                      )}
                      <button onClick={nouvelEntretien}
                        style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Nouvel entretien
                      </button>
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
            {!termine && (
              <div style={{ borderTop: '1px solid #f0f0f0', padding: '14px 20px', display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <textarea value={reponse} onChange={e => setReponse(e.target.value)} rows={2} placeholder="Écris ta réponse..."
                  disabled={loading}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); envoyer() } }}
                  style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontFamily: 'inherit', color: '#111', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                <button onClick={envoyer} disabled={!reponse.trim() || loading}
                  style={{ padding: '12px 20px', background: reponse.trim() && !loading ? '#4f46e5' : '#e5e7eb', color: reponse.trim() && !loading ? '#fff' : '#9ca3af', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: reponse.trim() && !loading ? 'pointer' : 'default', fontFamily: 'inherit', flexShrink: 0 }}>
                  Envoyer
                </button>
              </div>
            )}

            {termine && (
              <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 20px', textAlign: 'center' }}>
                <button onClick={nouvelEntretien}
                  style={{ padding: '11px 24px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Nouvel entretien
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
