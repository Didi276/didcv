import { useState, useRef, useEffect } from 'react'
import { Languages, Loader2 } from 'lucide-react'

const LANGUES = [
  { code: 'fr', label: 'Français', drapeau: '🇫🇷' },
  { code: 'en', label: 'English', drapeau: '🇬🇧' },
  { code: 'es', label: 'Español', drapeau: '🇪🇸' },
  { code: 'de', label: 'Deutsch', drapeau: '🇩🇪' },
  { code: 'it', label: 'Italiano', drapeau: '🇮🇹' },
  { code: 'pt', label: 'Português', drapeau: '🇵🇹' },
  { code: 'nl', label: 'Nederlands', drapeau: '🇳🇱' },
]

// Sélecteur de langue qui traduit le CV affiché (et donc le PDF téléchargé).
// Passe le CV traduit au parent via onTraduit, ou null pour revenir au français.
export default function TraducteurCV({ cv, onTraduit }) {
  const [langue, setLangue] = useState('fr')
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const cache = useRef({})

  // Nouveau CV : on vide le cache et on repasse en français.
  useEffect(() => {
    cache.current = {}
    setLangue('fr')
    setErreur('')
    onTraduit(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cv])

  const choisir = async (code) => {
    setErreur('')
    if (code === 'fr') { setLangue('fr'); onTraduit(null); return }
    setLangue(code)
    if (cache.current[code]) { onTraduit(cache.current[code]); return }
    setLoading(true)
    try {
      const res = await fetch('/api/traduire-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cv, langue: code }),
      })
      const data = await res.json()
      if (!res.ok || !data.cv) throw new Error(data.error || 'Erreur')
      cache.current[code] = data.cv
      onTraduit(data.cv)
    } catch {
      setErreur('Traduction indisponible')
      setLangue('fr')
      onTraduit(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: '#f3f4f6', borderRadius: '8px' }}>
        {loading
          ? <Loader2 size={13} style={{ animation: 'spintr 0.8s linear infinite' }} />
          : <Languages size={13} color="#4f46e5" />}
        <style>{'@keyframes spintr{to{transform:rotate(360deg)}}'}</style>
        <select
          value={langue}
          onChange={e => choisir(e.target.value)}
          disabled={loading}
          title="Traduire le CV"
          style={{ border: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', color: '#374151', cursor: loading ? 'default' : 'pointer', outline: 'none' }}>
          {LANGUES.map(l => <option key={l.code} value={l.code}>{l.drapeau} {l.label}</option>)}
        </select>
      </div>
      {erreur && <span style={{ fontSize: '11px', color: '#dc2626' }}>{erreur}</span>}
    </div>
  )
}
