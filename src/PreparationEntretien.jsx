import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'
import { supabase } from './supabase'
import { CheckCircle, AlertTriangle, RefreshCw, Sparkles, Target, Briefcase, Calendar, Mail, Lightbulb, ClipboardList } from 'lucide-react'

const FICHES_STATIQUES = {
  RH: {
    intro: "Les recruteurs RH évaluent ta motivation, ton savoir-être et l'adéquation avec la culture d'entreprise. Prépare des réponses structurées et authentiques.",
    questions: [
      { q: 'Parlez-moi de vous.', conseil: 'Structure en 3 temps : parcours (bref), poste actuel, ce que tu recherches. Reste sous 2 minutes et relie tout au poste visé.' },
      { q: 'Pourquoi voulez-vous rejoindre notre entreprise ?', conseil: 'Montre que tu as fait des recherches, mentionne un projet, une valeur ou une actualité récente de l\'entreprise.' },
      { q: 'Pourquoi ce poste vous intéresse-t-il ?', conseil: 'Fais le lien explicite entre tes compétences, tes expériences passées et les missions décrites dans l\'offre.' },
      { q: 'Quelles sont vos principales qualités ?', conseil: 'Donne 2 à 3 qualités avec un exemple concret pour chacune, avec la méthode STAR (Situation, Tâche, Action, Résultat).' },
      { q: 'Quel est votre principal défaut ?', conseil: 'Choisis un vrai défaut, pas un faux défaut déguisé, et explique ce que tu fais concrètement pour le corriger.' },
      { q: 'Où vous voyez-vous dans 5 ans ?', conseil: 'Montre une ambition réaliste et cohérente avec une évolution possible dans l\'entreprise, sans donner l\'impression de vouloir partir vite.' },
      { q: 'Pourquoi quittez-vous votre poste actuel ?', conseil: 'Reste toujours positif, ne critique jamais un ancien employeur. Parle plutôt de ce que tu recherches de nouveau.' },
      { q: 'Quelles sont vos prétentions salariales ?', conseil: 'Donne une fourchette réaliste basée sur le marché, en laissant une marge de négociation.' },
      { q: 'Racontez un échec et ce que vous en avez retiré.', conseil: 'Choisis un vrai échec, explique le contexte, ce que tu as appris et comment tu as changé ta façon de faire ensuite.' },
      { q: 'Avez-vous des questions ?', conseil: 'Prépare toujours 2 à 3 questions sur l\'équipe, les enjeux du poste ou les prochaines étapes du recrutement.' },
    ],
  },
  Technique: {
    intro: "Un entretien technique évalue ta méthode de raisonnement autant que la bonne réponse. Voici comment structurer ta réponse à n'importe quelle question technique.",
    etapes: [
      "Clarifie l'énoncé : reformule la question et pose des questions si un point n'est pas clair avant de répondre.",
      'Réfléchis à voix haute, explique ton raisonnement étape par étape plutôt que de rester silencieux.',
      'Structure ta réponse : définition ou rappel du concept, puis démarche, puis exemple concret vécu.',
      "Illustre avec un exemple réel de ton expérience si possible, c'est toujours plus convaincant qu'une réponse théorique.",
      'Assume tes limites, si tu ne sais pas, dis-le honnêtement et propose une piste de réflexion plutôt que d\'inventer une réponse.',
      "Termine en demandant si ta réponse répond à l'attente ou si l'interlocuteur veut que tu creuses un point.",
    ],
  },
  Manager: {
    intro: 'Un entretien avec un manager évalue ton leadership, ta gestion d\'équipe et ta capacité à prendre des décisions. Prépare des exemples concrets avec la méthode STAR.',
    questions: [
      { q: 'Décrivez une situation où vous avez géré un conflit dans une équipe.', conseil: 'Explique le contexte, ton rôle de médiateur, les actions prises et le résultat obtenu.' },
      { q: 'Comment motivez-vous une équipe en période difficile ?', conseil: 'Donne un exemple concret : communication transparente, reconnaissance, objectifs clairs.' },
      { q: 'Racontez une décision difficile que vous avez dû prendre.', conseil: 'Montre ton processus de décision : les options considérées, les critères utilisés, le résultat.' },
      { q: "Comment déléguez-vous les tâches au sein d'une équipe ?", conseil: "Parle de ta méthode pour évaluer les compétences de chacun et adapter le niveau d'autonomie donné." },
      { q: 'Comment gérez-vous un collaborateur en difficulté ou peu performant ?', conseil: "Insiste sur l'accompagnement, le dialogue et le suivi plutôt que la sanction immédiate." },
    ],
  },
  'Cas pratique': {
    intro: 'Un cas pratique évalue ta capacité à structurer un raisonnement face à un problème inconnu, pas seulement à trouver la bonne réponse.',
    etapes: [
      "Reformule le problème à voix haute pour vérifier que tu l'as bien compris.",
      'Clarifie les contraintes et objectifs, pose des questions sur le contexte, les données disponibles, les priorités.',
      'Prends un instant pour structurer ton approche avant de te lancer dans les détails (cadre, hypothèses de départ).',
      'Présente ton raisonnement étape par étape, à voix haute, en expliquant chaque choix.',
      'Conclus avec une recommandation claire et synthétique, même si elle reste ouverte à la discussion.',
      "Reste ouvert aux objections de l'interlocuteur, c'est souvent un test pour voir si tu sais faire évoluer ta position.",
    ],
  },
  Final: {
    intro: "Un entretien final confirme ta motivation et vérifie qu'il n'y a plus de doute avant une décision. Sois synthétique et montre que tu es prêt à t'engager.",
    questions: [
      { q: 'Après ces différents échanges, pourquoi êtes-vous le bon candidat pour ce poste ?', conseil: 'Fais une synthèse courte de tes atouts clés en les reliant directement aux besoins exprimés lors des précédents entretiens.' },
      { q: 'Avez-vous des interrogations qui pourraient vous empêcher de vous engager ?', conseil: 'Sois honnête, mais rassure sur ta motivation à avancer si un point mérite clarification.' },
      { q: 'Quand seriez-vous disponible pour commencer ?', conseil: 'Prépare une réponse claire sur ton préavis ou ta disponibilité.' },
    ],
  },
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

function ChecklistSection({ titre, items, sectionKey, checked, onToggle }) {
  const filtered = (items || []).filter(Boolean)
  if (!filtered.length) return null
  return (
    <div style={{ marginBottom: '18px' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>{titre}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filtered.map((item, i) => {
          const isChecked = !!checked[sectionKey]?.[i]
          return (
            <div key={i} onClick={() => onToggle(sectionKey, i)}
              style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', padding: '9px 12px', background: isChecked ? '#f0fdf4' : '#fafafa', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', color: isChecked ? '#16a34a' : '#374151', textDecoration: isChecked ? 'line-through' : 'none', transition: 'background 0.15s' }}>
              {isChecked
                ? <CheckCircle size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '1px' }} />
                : <div style={{ width: '16px', height: '16px', borderRadius: '5px', border: '1.5px solid #d1d5db', flexShrink: 0, marginTop: '1px', boxSizing: 'border-box' }} />
              }
              <span>{item}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FicheStatique({ type }) {
  const fiche = FICHES_STATIQUES[type] || FICHES_STATIQUES.RH
  return (
    <div>
      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 20px' }}>{fiche.intro}</p>
      {fiche.questions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {fiche.questions.map((item, i) => (
            <div key={i} style={{ padding: '14px 16px', background: '#f8f9ff', borderRadius: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '5px' }}>{i + 1}. {item.q}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.6', display: 'flex', gap: '6px' }}>
                <Lightbulb size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{item.conseil}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {fiche.etapes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {fiche.etapes.map((etape, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#ede9fe', color: '#7c3aed', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: '13px', color: '#374151', lineHeight: '1.6' }}>{etape}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function PreparationEntretien() {
  const [params] = useSearchParams()
  const poste = params.get('poste') || ''
  const entreprise = params.get('entreprise') || ''
  const type = params.get('type') || 'RH'
  const date = params.get('date') || ''
  const urlOffre = params.get('url_offre') || ''

  const w = useWidth()
  const isMobile = w < 768

  const [user, setUser] = useState(null)
  const [checklist, setChecklist] = useState(null)
  const [loadingChecklist, setLoadingChecklist] = useState(false)
  const [erreurChecklist, setErreurChecklist] = useState('')
  const [checked, setChecked] = useState({})
  const [envoiEmail, setEnvoiEmail] = useState('idle')

  const prepKey = `didcv-prep-${encodeURIComponent(`${poste}|${entreprise}|${type}|${date}`)}`

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
    }
    init()
  }, [])

  useEffect(() => {
    const savedChecked = localStorage.getItem(`${prepKey}-checked`)
    if (savedChecked) {
      try { setChecked(JSON.parse(savedChecked)) } catch { setChecked({}) }
    } else {
      setChecked({})
    }

    const savedData = localStorage.getItem(`${prepKey}-data`)
    if (savedData) {
      try { setChecklist(JSON.parse(savedData)); return } catch { /* régénère si corrompu */ }
    }
    genererChecklist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prepKey])

  const genererChecklist = async () => {
    setLoadingChecklist(true)
    setErreurChecklist('')
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          system: 'Tu es un coach de carrière expert en préparation d\'entretiens. Tu retournes UNIQUEMENT un JSON valide, sans texte avant ou après, sans balises markdown.',
          messages: [{
            role: 'user',
            content: `Pour un entretien de type ${type} pour le poste de ${poste}${entreprise ? ` chez ${entreprise}` : ''}, génère une checklist de préparation en JSON :\n{\n  "a_connaitre": ["", ""],\n  "competences_a_reviser": ["", ""],\n  "questions_a_preparer": ["", ""],\n  "questions_a_poser": ["", ""],\n  "documents_a_apporter": ["", ""],\n  "tenue_recommandee": "",\n  "checklist_j1": ["", ""]\n}`,
          }],
        }),
      })
      if (!res.ok) throw new Error(`Erreur API : ${res.status}`)
      const data = await res.json()
      if (!data.content?.[0]) throw new Error('Réponse IA invalide')
      const texteJSON = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      let json
      try { json = JSON.parse(texteJSON) } catch { const m = texteJSON.match(/\{[\s\S]*\}/); if (m) json = JSON.parse(m[0]); else throw new Error('JSON invalide') }
      setChecklist(json)
      localStorage.setItem(`${prepKey}-data`, JSON.stringify(json))
    } catch (err) {
      console.error('Erreur génération checklist:', err)
      setErreurChecklist(err.message)
    }
    setLoadingChecklist(false)
  }

  const toggleCheck = (section, i) => {
    const next = { ...checked, [section]: { ...checked[section], [i]: !checked[section]?.[i] } }
    setChecked(next)
    localStorage.setItem(`${prepKey}-checked`, JSON.stringify(next))
  }

  const simulerEntretien = () => {
    sessionStorage.setItem('entretien_poste', poste)
    sessionStorage.setItem('entretien_entreprise', entreprise)
    if (urlOffre) sessionStorage.setItem('entretien_url', urlOffre)
    sessionStorage.setItem('entretien_mode', 'preparation')
    window.location.href = '/entretien'
  }

  const construireHtmlEmail = () => {
    const section = (titre, items) => (items || []).filter(Boolean).length
      ? `<h3 style="font-size:15px;color:#111;margin:18px 0 8px">${titre}</h3><ul style="margin:0;padding-left:18px;color:#374151;font-size:13px;line-height:1.7">${items.filter(Boolean).map(i => `<li>${i}</li>`).join('')}</ul>`
      : ''
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#111">
        <h2 style="margin:0 0 4px">Préparation d'entretien</h2>
        <p style="color:#6b7280;font-size:13px;margin:0 0 20px">${poste}${entreprise ? ` chez ${entreprise}` : ''} - Entretien ${type}${date ? ` · ${new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}</p>
        ${section('À connaître', checklist?.a_connaitre)}
        ${section('Compétences à réviser', checklist?.competences_a_reviser)}
        ${section('Questions à préparer', checklist?.questions_a_preparer)}
        ${section('Questions à poser', checklist?.questions_a_poser)}
        ${section('Documents à apporter', checklist?.documents_a_apporter)}
        ${checklist?.tenue_recommandee ? `<h3 style="font-size:15px;color:#111;margin:18px 0 8px">Tenue recommandée</h3><p style="font-size:13px;color:#374151">${checklist.tenue_recommandee}</p>` : ''}
        ${section('Checklist J-1', checklist?.checklist_j1)}
      </div>
    `
  }

  const envoyerParEmail = async () => {
    if (!user?.email || !checklist) return
    setEnvoiEmail('envoi')
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: user.email,
          subject: `Fiche de préparation - ${poste}${entreprise ? ' chez ' + entreprise : ''}`,
          html: construireHtmlEmail(),
        }),
      })
      if (!res.ok) throw new Error('Erreur envoi email')
      setEnvoiEmail('ok')
    } catch (err) {
      console.error('Erreur envoi email:', err)
      setEnvoiEmail('erreur')
    }
    setTimeout(() => setEnvoiEmail('idle'), 3000)
  }

  const CARD = { background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: isMobile ? '20px' : '28px', marginBottom: '20px' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="candidatures" />

      <div style={{ maxWidth: '780px', margin: '0 auto', padding: isMobile ? '24px 16px 80px' : '40px 24px 100px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#7c3aed', background: '#f5f3ff', padding: '3px 10px', borderRadius: '10px' }}>{type}</span>
            {date && (
              <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={11} /> {new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
            {poste || 'Préparation entretien'}
          </h1>
          {entreprise && <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}><Briefcase size={13} /> {entreprise}</p>}
          {urlOffre && <a href={urlOffre} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>Voir l'offre →</a>}
        </div>

        {/* SECTION 1 — Checklist IA */}
        <div style={CARD}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '15px', fontWeight: '700', color: '#111' }}>
              <Sparkles size={16} color="#4f46e5" /> Checklist personnalisée IA
            </div>
            {!loadingChecklist && checklist && (
              <button onClick={genererChecklist} title="Régénérer"
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                <RefreshCw size={11} /> Régénérer
              </button>
            )}
          </div>

          {loadingChecklist && (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #ede9fe', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>L'IA prépare ta checklist...</div>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {!loadingChecklist && erreurChecklist && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '24px 0', textAlign: 'center' }}>
              <AlertTriangle size={28} color="#dc2626" />
              <div style={{ fontSize: '13px', color: '#6b7280' }}>{erreurChecklist}</div>
              <button onClick={genererChecklist}
                style={{ padding: '8px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Réessayer
              </button>
            </div>
          )}

          {!loadingChecklist && !erreurChecklist && checklist && (
            <div>
              <ChecklistSection titre="À connaître" items={checklist.a_connaitre} sectionKey="a_connaitre" checked={checked} onToggle={toggleCheck} />
              <ChecklistSection titre="Compétences à réviser" items={checklist.competences_a_reviser} sectionKey="competences_a_reviser" checked={checked} onToggle={toggleCheck} />
              <ChecklistSection titre="Questions à préparer" items={checklist.questions_a_preparer} sectionKey="questions_a_preparer" checked={checked} onToggle={toggleCheck} />
              <ChecklistSection titre="Questions à poser au recruteur" items={checklist.questions_a_poser} sectionKey="questions_a_poser" checked={checked} onToggle={toggleCheck} />
              <ChecklistSection titre="Documents à apporter" items={checklist.documents_a_apporter} sectionKey="documents_a_apporter" checked={checked} onToggle={toggleCheck} />
              {checklist.tenue_recommandee && (
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Tenue recommandée</div>
                  <div style={{ padding: '10px 14px', background: '#fffbeb', borderRadius: '9px', fontSize: '13px', color: '#92400e' }}>{checklist.tenue_recommandee}</div>
                </div>
              )}
              <ChecklistSection titre="Checklist J-1" items={checklist.checklist_j1} sectionKey="checklist_j1" checked={checked} onToggle={toggleCheck} />
            </div>
          )}
        </div>

        {/* SECTION 2 — Fiche statique selon le type */}
        <div style={CARD}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '18px' }}>
            <ClipboardList size={16} color="#7c3aed" /> Fiche de préparation - Entretien {type}
          </div>
          <FicheStatique type={type} />
        </div>

        {/* SECTION 3 — Simuler */}
        <button onClick={simulerEntretien}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '12px', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
          <Target size={16} /> Simuler cet entretien
        </button>

        {/* SECTION 4 — Email */}
        <button onClick={envoyerParEmail} disabled={envoiEmail === 'envoi' || !checklist}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px', background: envoiEmail === 'ok' ? '#16a34a' : '#fff', color: envoiEmail === 'ok' ? '#fff' : '#374151', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: checklist ? 'pointer' : 'default', fontFamily: 'inherit' }}>
          <Mail size={16} />
          {envoiEmail === 'envoi' ? 'Envoi...' : envoiEmail === 'ok' ? 'Envoyé !' : envoiEmail === 'erreur' ? "Erreur d'envoi, réessaie" : 'Recevoir par email'}
        </button>
      </div>
    </div>
  )
}
