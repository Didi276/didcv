import { useEffect, useState } from 'react'
import { Target, Lightbulb, Plus, ChevronRight } from 'lucide-react'
import Navbar from './Navbar'
import SEO from './SEO'
import { supabase } from './supabase'
import { FORMATIONS_DATA, CATEGORIES_DATA } from './formationsData'

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

function estCpf(prix) {
  return (prix || '').toLowerCase().includes('cpf')
}

function estGratuit(prix) {
  return (prix || '').toLowerCase().startsWith('gratuit')
}

function TestCompetence({ formation }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [quiz, setQuiz] = useState(null)
  const [step, setStep] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  const demarrer = async () => {
    setOpen(true)
    setLoading(true)
    setErrorMsg('')
    setQuiz(null)
    setStep(0)
    setSelected(null)
    setRevealed(false)
    setScore(0)
    setFinished(false)
    setAdded(false)

    const prompt = `Génère 5 questions QCM pour tester le niveau ${formation.titre} niveau ${formation.niveau}. Retourne UNIQUEMENT ce JSON : { questions: [{ question: '', options: ['','','',''], reponse_correcte: 0, explication: '' }] }`

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1800,
          system: 'Tu retournes UNIQUEMENT du JSON valide, sans texte avant ou après, sans markdown.',
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const json = JSON.parse(text)
      if (!json.questions?.length) throw new Error('reponse vide')
      setQuiz(json.questions.slice(0, 5))
    } catch {
      setErrorMsg('Impossible de générer le quiz pour le moment. Réessaie dans un instant.')
    }
    setLoading(false)
  }

  const choisir = (i) => {
    if (revealed) return
    setSelected(i)
    setRevealed(true)
    if (i === quiz[step].reponse_correcte) setScore(s => s + 1)
  }

  const suivant = () => {
    if (step + 1 >= quiz.length) { setFinished(true); return }
    setStep(s => s + 1)
    setSelected(null)
    setRevealed(false)
  }

  const ajouterAuProfil = async () => {
    setAdding(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setAdding(false); return }
    const { data: profil } = await supabase.from('profiles').select('competences').eq('user_id', user.id).maybeSingle()
    if (!profil) {
      setAdding(false)
      alert("Complète d'abord ton profil (page Profil) pour pouvoir y ajouter des compétences.")
      return
    }
    const label = `${formation.titre}, Certifié DidJob`
    const competences = profil.competences || []
    if (!competences.includes(label)) {
      await supabase.from('profiles').update({ competences: [...competences, label] }).eq('user_id', user.id)
    }
    setAdding(false)
    setAdded(true)
  }

  const fermer = () => setOpen(false)

  const messageFinal = score >= 4
    ? 'Excellent niveau ! Cette compétence est acquise.'
    : score >= 2
      ? 'Pas mal, mais il reste des choses à consolider - la formation ci-dessus t\'aidera.'
      : "C'est le moment idéal pour suivre cette formation."

  return (
    <>
      <button onClick={demarrer}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#4f46e5', background: '#eef2ff', border: '1px solid #e0e7ff', borderRadius: '9px', padding: '9px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
        <Target size={13} /> Tester mon niveau
      </button>

      {open && (
        <div onClick={fermer} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', padding: '32px', maxWidth: '480px', width: '100%', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Test de niveau</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#111' }}>{formation.titre}</div>
              </div>
              <button onClick={fermer} style={{ background: '#f3f4f6', border: 'none', width: '30px', height: '30px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', color: '#6b7280', flexShrink: 0 }}>✕</button>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '36px', height: '36px', border: '3px solid #ede9fe', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ fontSize: '13px', color: '#6b7280' }}>Génération du quiz...</div>
              </div>
            )}

            {!loading && errorMsg && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>{errorMsg}</div>
                <button onClick={demarrer} style={{ padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Réessayer
                </button>
              </div>
            )}

            {!loading && !errorMsg && quiz && !finished && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', marginBottom: '12px' }}>Question {step + 1} / {quiz.length}</div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '16px', lineHeight: '1.5' }}>{quiz[step].question}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                  {quiz[step].options.map((opt, i) => {
                    const estCorrecte = i === quiz[step].reponse_correcte
                    const estChoisie = i === selected
                    let bg = '#fff', border = '#e5e7eb', color = '#374151'
                    if (revealed && estCorrecte) { bg = '#f0fdf4'; border = '#86efac'; color = '#16a34a' }
                    else if (revealed && estChoisie && !estCorrecte) { bg = '#fef2f2'; border = '#fecaca'; color = '#dc2626' }
                    return (
                      <button key={i} onClick={() => choisir(i)} disabled={revealed}
                        style={{ textAlign: 'left', padding: '11px 14px', background: bg, border: `1.5px solid ${border}`, borderRadius: '10px', fontSize: '13px', color, cursor: revealed ? 'default' : 'pointer', fontFamily: 'inherit', fontWeight: revealed && (estCorrecte || estChoisie) ? '700' : '500' }}>
                        {opt}
                      </button>
                    )
                  })}
                </div>
                {revealed && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', padding: '12px 14px', background: '#f8f9ff', border: '1px solid #ede9fe', borderRadius: '10px', fontSize: '12px', color: '#6b7280', lineHeight: '1.6', marginBottom: '16px' }}>
                    <Lightbulb size={14} style={{ flexShrink: 0, marginTop: '1px' }} /> {quiz[step].explication}
                  </div>
                )}
                <button onClick={suivant} disabled={!revealed}
                  style={{ width: '100%', padding: '12px', background: revealed ? '#4f46e5' : '#e5e7eb', color: revealed ? '#fff' : '#9ca3af', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: revealed ? 'pointer' : 'default', fontFamily: 'inherit' }}>
                  {step + 1 >= quiz.length ? 'Voir mon résultat' : 'Question suivante'}
                </button>
              </div>
            )}

            {finished && quiz && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '44px', marginBottom: '8px' }}>{score >= 4 ? '🏆' : score >= 2 ? '👍' : '📘'}</div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#111', marginBottom: '8px' }}>{score} / {quiz.length}</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: '1.6' }}>{messageFinal}</div>

                {score >= 4 && !added && (
                  <button onClick={ajouterAuProfil} disabled={adding}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '13px', background: '#0f6e56', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: adding ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: '10px', boxShadow: '0 4px 12px rgba(15,110,86,0.3)' }}>
                    {!adding && <Plus size={15} />}{adding ? 'Ajout...' : 'Ajouter à mon profil'}
                  </button>
                )}
                {added && (
                  <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', fontSize: '13px', color: '#16a34a', fontWeight: '600', marginBottom: '10px' }}>
                    ✓ Ajouté à ton profil : "{formation.titre}, Certifié DidJob"
                  </div>
                )}
                <button onClick={fermer} style={{ width: '100%', padding: '11px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function FormationCard({ f, recommandee }) {
  return (
    <div style={{
      borderRadius: '12px', border: recommandee ? '1px solid #6366f1' : '1px solid #f0f0f0',
      background: recommandee ? '#f0f0ff' : '#fff',
      padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px',
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>

      {recommandee && (
        <span style={{ alignSelf: 'flex-start', fontSize: '11px', fontWeight: '700', color: '#4f46e5', background: '#e0e7ff', padding: '4px 10px', borderRadius: '20px' }}>
          Recommandée pour vous ⭐
        </span>
      )}

      <div style={{ fontSize: '40px' }}>{f.emoji}</div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', background: '#f3f4f6', padding: '4px 10px', borderRadius: '20px' }}>{f.categorie}</span>
        {estCpf(f.prix) && (
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f6e56', background: '#e6f7f1', padding: '4px 10px', borderRadius: '20px' }}>CPF</span>
        )}
        {f.certifiant && (
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#1d4ed8', background: '#eff6ff', padding: '4px 10px', borderRadius: '20px' }}>✓ Certifiant</span>
        )}
      </div>

      <div>
        <h3 style={{ fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif', fontSize: '17px', fontWeight: '600', color: '#0f0f1a', margin: '0 0 6px', lineHeight: '1.3' }}>
          {f.titre}
        </h3>
        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
          {f.organisme} · {f.duree} · {f.format}
        </div>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>{f.description}</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '4px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: estGratuit(f.prix) ? '#16a34a' : '#6b7280' }}>{f.prix}</span>
      </div>

      <a href={f.lien} target="_blank" rel="noopener noreferrer"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', fontSize: '13px', fontWeight: '700', textDecoration: 'none', color: '#fff', background: '#4f46e5', padding: '10px', borderRadius: '10px' }}>
        En savoir plus <ChevronRight size={14} />
      </a>
      <TestCompetence formation={f} />
    </div>
  )
}

export default function Formations() {
  const isMobile = useWidth() < 768
  const [categorie, setCategorie] = useState('')
  const [profil, setProfil] = useState(null)

  useEffect(() => {
    const chargerProfil = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      // Requête directe Supabase plutôt que /api/match : cet endpoint ne
      // renvoie que des offres d'emploi matchées par IA (pas le profil brut),
      // et déclencherait un appel Claude inutile juste pour lire poste_souhaite.
      const { data } = await supabase.from('profiles').select('poste_souhaite').eq('user_id', user.id).maybeSingle()
      if (data) setProfil(data)
    }
    chargerProfil()
  }, [])

  const formationsRecommandees = FORMATIONS_DATA.filter(f =>
    profil?.poste_souhaite &&
    f.tags.some(t => profil.poste_souhaite.toLowerCase().includes(t.toLowerCase()))
  ).slice(0, 3)

  const idsRecommandees = new Set(formationsRecommandees.map(f => f.id))

  const formations = categorie ? FORMATIONS_DATA.filter(f => f.categorie === categorie) : FORMATIONS_DATA

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <SEO
        titre="Formations professionnelles pour booster votre carrière"
        description="Catalogue de formations certifiantes et éligibles CPF, sélectionnées et recommandées selon votre profil et le poste que vous recherchez."
        url="https://did-job.com/formations"
      />
      <Navbar currentPage="formations" />

      {/* HERO */}
      <div style={{ background: '#0a0a0f', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', maxWidth: '100%', background: 'radial-gradient(circle, #4f46e520 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif', fontSize: isMobile ? '32px' : '44px', fontWeight: '700', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Formations pour booster votre carrière
          </h1>
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', margin: 0 }}>
            Sélectionnées par notre IA selon votre profil
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '48px 16px 80px' : '64px 40px 80px' }}>

        {/* SECTION 1 — Recommandées pour vous */}
        {formationsRecommandees.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif', fontSize: '20px', fontWeight: '700', color: '#0f0f1a', margin: '0 0 4px' }}>
              Recommandées pour vous
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px' }}>
              En fonction du poste recherché dans ton profil
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '20px' }}>
              {formationsRecommandees.map(f => <FormationCard key={f.id} f={f} recommandee />)}
            </div>
          </div>
        )}

        {/* SECTION 2 — Catalogue complet */}
        <h2 style={{ fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif', fontSize: '20px', fontWeight: '700', color: '#0f0f1a', margin: '0 0 20px' }}>
          Catalogue complet
        </h2>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <button onClick={() => setCategorie('')}
            style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: !categorie ? '#4f46e5' : '#f3f4f6', color: !categorie ? '#fff' : '#374151' }}>
            Toutes
          </button>
          {CATEGORIES_DATA.map(c => (
            <button key={c} onClick={() => setCategorie(c === categorie ? '' : c)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: categorie === c ? '#4f46e5' : '#f3f4f6', color: categorie === c ? '#fff' : '#374151' }}>
              {c}
            </button>
          ))}
        </div>

        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
          {formations.length} formation{formations.length > 1 ? 's' : ''}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {formations.map(f => <FormationCard key={f.id} f={f} recommandee={idsRecommandees.has(f.id)} />)}
        </div>

        {formations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px' }}>
            Aucune formation dans cette catégorie.
          </div>
        )}
      </div>
    </div>
  )
}
