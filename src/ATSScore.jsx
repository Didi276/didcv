import { useState } from 'react'

export default function ATSScore({ cvData, offreEmploi }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [open, setOpen] = useState(false)

  const analyser = async () => {
    if (!cvData || !offreEmploi) return
    setLoading(true)
    setOpen(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          system: `Tu es un expert ATS (Applicant Tracking System). Tu analyses des CVs et retournes UNIQUEMENT un JSON valide sans texte avant ou apres.`,
          messages: [{
            role: 'user',
            content: `Analyse la compatibilité ATS de ce CV par rapport à cette offre d'emploi.

OFFRE D'EMPLOI:
${offreEmploi.substring(0, 1500)}

CV:
Nom: ${cvData.prenom} ${cvData.nom}
Titre: ${cvData.titre}
Accroche: ${cvData.accroche}
Expériences: ${cvData.experiences?.map(e => `${e.poste} chez ${e.entreprise} - ${e.missions?.join(', ')}`).join(' | ')}
Formations: ${cvData.formations?.map(f => `${f.diplome} ${f.etablissement}`).join(' | ')}
Compétences: ${cvData.competences?.join(', ')}
Langues: ${cvData.langues?.map(l => `${l.langue} (${l.niveau})`).join(', ')}

Retourne UNIQUEMENT ce JSON:
{
  "score_global": 85,
  "scores": {
    "mots_cles": { "score": 80, "label": "Mots-clés" },
    "experience": { "score": 90, "label": "Expérience" },
    "formation": { "score": 75, "label": "Formation" },
    "structure": { "score": 85, "label": "Structure" }
  },
  "mots_cles_trouves": ["mot1", "mot2", "mot3"],
  "mots_cles_manquants": ["mot4", "mot5"],
  "points_forts": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "recommandations": [
    { "priorite": "haute", "action": "Action concrète à faire" },
    { "priorite": "moyenne", "action": "Action concrète à faire" },
    { "priorite": "basse", "action": "Action concrète à faire" }
  ]
}`
          }]
        })
      })

      const data = await res.json()
      const text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const json = JSON.parse(text)
      setResult(json)
    } catch (e) {
      setResult({ error: true })
    }
    setLoading(false)
  }

  const getColor = (score) => {
    if (score >= 80) return '#16a34a'
    if (score >= 60) return '#f59e0b'
    return '#dc2626'
  }

  const getBg = (score) => {
    if (score >= 80) return '#f0fdf4'
    if (score >= 60) return '#fffbeb'
    return '#fef2f2'
  }

  const getPrioriteColor = (p) => {
    if (p === 'haute') return { bg: '#fef2f2', color: '#dc2626', label: 'Urgent' }
    if (p === 'moyenne') return { bg: '#fffbeb', color: '#f59e0b', label: 'Moyen' }
    return { bg: '#f0fdf4', color: '#16a34a', label: 'Bonus' }
  }

  // Jauge circulaire SVG
  const CircleScore = ({ score }) => {
    const r = 44
    const circ = 2 * Math.PI * r
    const offset = circ - (score / 100) * circ
    const color = getColor(score)
    return (
      <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto' }}>
        <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="55" cy="55" r={r} fill="none" stroke="#f0f0f0" strokeWidth="10" />
          <circle cx="55" cy="55" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease', strokeLinecap: 'round' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: '800', color, lineHeight: 1 }}>{score}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>/100</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '12px' }}>
      <button onClick={result ? () => setOpen(!open) : analyser} disabled={loading}
        style={{ width: '100%', padding: '12px', background: result ? getBg(result.score_global) : '#fef3c7', color: result ? getColor(result.score_global) : '#92400e', border: `1.5px solid ${result ? getColor(result.score_global) + '44' : '#fde68a'}`, borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {loading ? (
          <><div style={{ width: '16px', height: '16px', border: '2px solid #f59e0b', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Analyse ATS en cours...</>
        ) : result ? (
          <>{result.error ? '⚠️ Réessayer l\'analyse' : `📊 Score ATS : ${result.score_global}/100 ${open ? '▲' : '▼'}`}</>
        ) : (
          <>📊 Analyser mon score ATS</>
        )}
      </button>

      {open && result && !result.error && (
        <div style={{ marginTop: '10px', background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>

          {/* Score global */}
          <div style={{ background: getBg(result.score_global), padding: '20px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
            <CircleScore score={result.score_global} />
            <div style={{ fontSize: '14px', fontWeight: '700', color: getColor(result.score_global), marginTop: '10px' }}>
              {result.score_global >= 80 ? '🎉 Excellent ! Ton CV passe bien les ATS' : result.score_global >= 60 ? '⚡ Bon niveau, quelques améliorations possibles' : '⚠️ Attention, ton CV risque d\'être filtré'}
            </div>
          </div>

          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Scores détaillés */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Analyse détaillée</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.values(result.scores).map(s => (
                  <div key={s.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '3px' }}>
                      <span style={{ color: '#374151', fontWeight: '500' }}>{s.label}</span>
                      <span style={{ color: getColor(s.score), fontWeight: '700' }}>{s.score}%</span>
                    </div>
                    <div style={{ height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${s.score}%`, height: '100%', background: getColor(s.score), borderRadius: '3px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mots-clés */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mots-clés</div>
              <div style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', marginBottom: '4px' }}>✅ Présents dans ton CV</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {result.mots_cles_trouves?.map(m => (
                    <span key={m} style={{ fontSize: '11px', padding: '2px 8px', background: '#f0fdf4', color: '#16a34a', borderRadius: '10px', fontWeight: '500' }}>{m}</span>
                  ))}
                </div>
              </div>
              {result.mots_cles_manquants?.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600', marginBottom: '4px' }}>❌ Absents — à ajouter</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {result.mots_cles_manquants?.map(m => (
                      <span key={m} style={{ fontSize: '11px', padding: '2px 8px', background: '#fef2f2', color: '#dc2626', borderRadius: '10px', fontWeight: '500' }}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Points forts */}
            {result.points_forts?.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Points forts</div>
                {result.points_forts.map((p, i) => (
                  <div key={i} style={{ fontSize: '12px', color: '#374151', padding: '5px 0', borderBottom: i < result.points_forts.length - 1 ? '1px solid #f8f9ff' : 'none' }}>
                    ✓ {p}
                  </div>
                ))}
              </div>
            )}

            {/* Recommandations */}
            {result.recommandations?.length > 0 && (
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions recommandées</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {result.recommandations.map((r, i) => {
                    const p = getPrioriteColor(r.priorite)
                    return (
                      <div key={i} style={{ padding: '8px 12px', background: p.bg, borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '10px', fontWeight: '700', color: p.color, background: '#fff', padding: '2px 6px', borderRadius: '6px', flexShrink: 0, marginTop: '1px' }}>{p.label}</span>
                        <span style={{ fontSize: '12px', color: '#374151', lineHeight: '1.5' }}>{r.action}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  )
}
