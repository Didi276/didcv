import { useState } from 'react'
import { Lightbulb } from 'lucide-react'

export default function SuggestionsIA({ poste, secteur, type = 'missions', onSelect }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const getSuggestions = async () => {
    if (!poste?.trim()) return
    setLoading(true)
    setOpen(true)

    const prompts = {
      missions: `Tu es expert RH. Pour le poste "${poste}"${secteur ? ` dans le secteur ${secteur}` : ''}, génère 10 missions/responsabilités percutantes pour un CV français. Chaque mission commence par un verbe d'action fort, est concrète et quantifiable quand possible. Retourne UNIQUEMENT un JSON: {"suggestions": ["mission 1", "mission 2", ...]}`,
      competences: `Tu es expert RH. Pour le poste "${poste}"${secteur ? ` dans le secteur ${secteur}` : ''}, génère 12 compétences clés recherchées par les recruteurs français. Mix de compétences techniques et soft skills. Retourne UNIQUEMENT un JSON: {"suggestions": ["compétence 1", "compétence 2", ...]}`,
      accroche: `Tu es expert RH. Pour le poste "${poste}"${secteur ? ` dans le secteur ${secteur}` : ''}, génère 5 phrases d'accroche professionnelles différentes pour un CV français (3-4 phrases chacune). Retourne UNIQUEMENT un JSON: {"suggestions": ["accroche 1", "accroche 2", ...]}`
    }

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1000,
          system: 'Tu retournes UNIQUEMENT du JSON valide, sans texte avant ou après, sans markdown.',
          messages: [{ role: 'user', content: prompts[type] }]
        })
      })
      const data = await res.json()
      const text = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const json = JSON.parse(text)
      setSuggestions(json.suggestions || [])
    } catch {
      setSuggestions([])
    }
    setLoading(false)
  }

  const LABELS = {
    missions: 'missions',
    competences: 'compétences',
    accroche: 'accroches'
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <button onClick={open && suggestions.length > 0 ? () => setOpen(!open) : getSuggestions}
        disabled={loading || !poste?.trim()}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: open && suggestions.length > 0 ? '#ede9fe' : '#f8f9ff', color: '#4f46e5', border: '1.5px solid #ede9fe', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: poste?.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: poste?.trim() ? 1 : 0.5, transition: 'all 0.15s' }}>
        {loading
          ? <><div style={{ width: '12px', height: '12px', border: '2px solid #c4b5fd', borderTop: '2px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>Génération...</>
          : <>{open && suggestions.length > 0 ? (open ? '▲' : '▼') : <Lightbulb size={13} />} {open && suggestions.length > 0 ? `${suggestions.length} suggestions ${open ? '▲' : '▼'}` : `Suggestions IA (${LABELS[type]})`}</>
        }
      </button>

      {open && suggestions.length > 0 && (
        <div style={{ marginTop: '8px', padding: '12px', background: '#faf9ff', border: '1.5px solid #ede9fe', borderRadius: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#7c3aed', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Cliquez pour ajouter
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {suggestions.map((s, i) => (
              <div key={i} onClick={() => { onSelect(s); }}
                style={{ padding: '7px 10px', background: '#fff', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '7px', fontSize: '12px', color: '#374151', cursor: 'pointer', lineHeight: '1.5', transition: 'box-shadow 0.15s, background 0.15s', display: 'flex', alignItems: 'flex-start', gap: '8px' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(79,70,229,0.15)'; e.currentTarget.style.background = '#faf9ff' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.background = '#fff' }}>
                <span style={{ color: '#4f46e5', fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>+</span>
                {s}
              </div>
            ))}
          </div>
          <button onClick={() => { setSuggestions([]); setOpen(false) }}
            style={{ marginTop: '8px', background: 'none', border: 'none', color: '#9ca3af', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>
            Fermer
          </button>
        </div>
      )}
    </div>
  )
}
