import { useState } from 'react'
import Navbar from './Navbar'

const CATEGORIES = [
  'Comptabilité', 'Finance', 'Ressources Humaines', 'Marketing', 'Commercial',
  'Informatique', 'Ingénierie', 'Juridique', 'Logistique', 'Santé'
]

export default function Offres() {
  const [query, setQuery]       = useState('')
  const [location, setLocation] = useState('')
  const [offres, setOffres]     = useState([])
  const [loading, setLoading]   = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError]       = useState('')

  const handleSearch = async (q = query, loc = location) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(false)
    setError('')
    setOffres([])
    try {
      const res = await fetch(`/api/offres?query=${encodeURIComponent(q)}&location=${encodeURIComponent(loc || 'France')}`)
      const data = await res.json()
      setOffres(data.offres || [])
      setSearched(true)
      if ((data.offres || []).length === 0 && data.errors?.length > 0) {
        setError('Aucune offre trouvée. Essaie des mots-clés différents.')
      }
    } catch (e) {
      setError('Erreur de connexion. Réessaie.')
      setSearched(true)
    }
    setLoading(false)
  }

  const handleGenererCV = (offre) => {
    const texte = `${offre.titre}\n${offre.entreprise} — ${offre.lieu}\n${offre.type ? `Type : ${offre.type}\n` : ''}\n${offre.description}\n\nSource : ${offre.url}`
    sessionStorage.setItem('offre_prefill', texte)
    window.location.href = '/generate'
  }

  const formatDate = (d) => {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }
    catch { return '' }
  }

  const sourceBadge = (s) => s === 'JSearch'
    ? { background: '#e8f3ff', color: '#1a56db', border: '1px solid #b3d4f5' }
    : { background: '#fff3e0', color: '#e65100', border: '1px solid #ffcc80' }

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff', fontFamily: 'inherit' }}>

      <Navbar currentPage="offres" />

      {/* HERO */}
      <div style={{ background: 'linear-gradient(135deg, #1a56db, #3b82f6)', padding: '48px 32px', textAlign: 'center' }}>
        <h1 style={{ color: '#fff', fontSize: '30px', fontWeight: '800', margin: '0 0 8px' }}>
          Trouve ton prochain emploi
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '15px', margin: '0 0 28px' }}>
          Offres LinkedIn, Indeed, Glassdoor et plus — en temps réel
        </p>
        <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Poste, mots-clés..." value={query}
            onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 2, minWidth: '180px', padding: '13px 16px', border: 'none', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
          <input type="text" placeholder="Ville (ex: Paris)" value={location}
            onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1, minWidth: '130px', padding: '13px 16px', border: 'none', borderRadius: '10px', fontSize: '14px', outline: 'none' }} />
          <button onClick={() => handleSearch()} disabled={loading || !query.trim()}
            style={{ padding: '13px 24px', background: '#fff', color: '#1a56db', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'default' : 'pointer' }}>
            {loading ? '⏳' : '🔍 Chercher'}
          </button>
        </div>
        <div style={{ maxWidth: '680px', margin: '14px auto 0', display: 'flex', gap: '7px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setQuery(cat); handleSearch(cat, location) }}
              style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RÉSULTATS */}
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '28px 20px' }}>

        {!searched && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
            <div style={{ fontSize: '44px', marginBottom: '12px' }}>🔍</div>
            <div style={{ fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>Lance une recherche</div>
            <div style={{ fontSize: '13px' }}>Tape un poste et clique sur Chercher, ou sélectionne une catégorie</div>
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
            <div style={{ fontSize: '28px', marginBottom: '12px' }}>⏳</div>
            <div>Recherche sur LinkedIn, Indeed, Glassdoor...</div>
          </div>
        )}

        {error && (
          <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '14px', marginBottom: '20px' }}>
            ⚠️ {error}
          </div>
        )}

        {searched && !loading && offres.length > 0 && (
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '18px' }}>
            <span style={{ color: '#1a56db', fontWeight: '700' }}>{offres.length} offres</span> trouvées — clique sur une offre pour la voir ou générer ton CV
          </div>
        )}

        {searched && !loading && offres.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#888' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>😕</div>
            <div style={{ fontSize: '17px', fontWeight: '600', color: '#333', marginBottom: '6px' }}>Aucune offre trouvée</div>
            <div style={{ fontSize: '13px' }}>Essaie d'autres mots-clés ou une autre ville</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {offres.map(offre => (
            <div key={offre.id} style={{ background: '#fff', borderRadius: '12px', padding: '18px 22px', border: '1px solid #e5e7ef', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '5px', flexWrap: 'wrap' }}>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{offre.titre}</div>
                    <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '10px', ...sourceBadge(offre.source) }}>{offre.source}</span>
                    {offre.remote && <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }}>Télétravail</span>}
                    {offre.type && <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '10px', background: '#f3f4f6', color: '#555', border: '1px solid #e5e7eb' }}>{offre.type}</span>}
                  </div>
                  <div style={{ fontSize: '13px', color: '#374151', marginBottom: '3px' }}>
                    {offre.entreprise && <span style={{ fontWeight: '600' }}>{offre.entreprise}</span>}
                    {offre.lieu && <span style={{ color: '#6b7280' }}> · 📍 {offre.lieu}</span>}
                    {offre.date && <span style={{ color: '#9ca3af' }}> · {formatDate(offre.date)}</span>}
                  </div>
                  {offre.description && (
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: '8px 0 0', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {offre.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flexShrink: 0 }}>
                  {offre.url && (
                    <a href={offre.url} target="_blank" rel="noopener noreferrer"
                      style={{ padding: '7px 14px', background: '#f8faff', color: '#1a56db', border: '1px solid #c7d9ff', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>
                      Voir →
                    </a>
                  )}
                  <button onClick={() => handleGenererCV(offre)}
                    style={{ padding: '7px 14px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                    ⚡ Générer CV
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}