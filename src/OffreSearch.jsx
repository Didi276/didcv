// src/OffreSearch.jsx
// Recherche d'offres JSearch + Adzuna avec auto-collage dans le champ offre

import { useState, useRef } from 'react'

export default function OffreSearch({ onSelectOffre }) {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('France')
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [expanded, setExpanded] = useState(false)
  const searchRef = useRef(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    setLoading(true)
    setSearched(false)
    setOffres([])
    setSelectedId(null)
    try {
      const res = await fetch(`/api/offres?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`)
      const data = await res.json()
      setOffres(data.offres || [])
      setSearched(true)
      setExpanded(true)
    } catch (e) {
      console.error(e)
      setSearched(true)
    }
    setLoading(false)
  }

  const handleSelect = (offre) => {
    setSelectedId(offre.id)
    // Construire le texte de l'offre à coller dans le champ
    const texte = `${offre.titre}
${offre.entreprise} — ${offre.lieu}
${offre.type ? `Type : ${offre.type}\n` : ''}${offre.remote ? 'Télétravail possible\n' : ''}
${offre.description}

Source : ${offre.url}`
    onSelectOffre(texte)
    setExpanded(false)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
    } catch { return '' }
  }

  const sourceBadge = (source) => ({
    background: source === 'JSearch' ? '#e8f3ff' : '#fff3e0',
    color: source === 'JSearch' ? '#1a56db' : '#e65100',
    border: source === 'JSearch' ? '1px solid #b3d4f5' : '1px solid #ffcc80',
  })

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Barre de recherche */}
      <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
        🔍 Chercher une offre d'emploi
      </div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <input
          ref={searchRef}
          type="text"
          placeholder="Ex: Contrôleur de gestion, Comptable..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 2, padding: '10px 14px', border: '1px solid #e5e7ef',
            borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
            background: '#fff'
          }}
        />
        <input
          type="text"
          placeholder="Lieu (ex: Paris)"
          value={location}
          onChange={e => setLocation(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          style={{
            flex: 1, padding: '10px 14px', border: '1px solid #e5e7ef',
            borderRadius: '10px', fontSize: '13px', fontFamily: 'inherit', outline: 'none',
            background: '#fff'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            padding: '10px 18px', background: loading ? '#94a3b8' : '#1a56db',
            color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px',
            fontWeight: '600', cursor: loading ? 'default' : 'pointer', whiteSpace: 'nowrap'
          }}
        >
          {loading ? '⏳' : '🔍 Chercher'}
        </button>
      </div>

      {/* Résultats */}
      {searched && expanded && (
        <div style={{
          border: '1px solid #e5e7ef', borderRadius: '12px', background: '#fff',
          maxHeight: '380px', overflowY: 'auto', boxShadow: '0 4px 16px rgba(0,0,0,0.08)'
        }}>
          {offres.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '13px' }}>
              Aucune offre trouvée pour cette recherche.
            </div>
          ) : (
            <>
              <div style={{ padding: '10px 14px', borderBottom: '1px solid #f0f0f0', fontSize: '12px', color: '#888', fontWeight: '600' }}>
                {offres.length} offres trouvées — clique sur une pour la sélectionner
              </div>
              {offres.map(offre => (
                <div
                  key={offre.id}
                  onClick={() => handleSelect(offre)}
                  style={{
                    padding: '12px 14px', borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
                    background: selectedId === offre.id ? '#f0f7ff' : '#fff',
                    borderLeft: selectedId === offre.id ? '3px solid #1a56db' : '3px solid transparent',
                    transition: 'background 0.1s'
                  }}
                  onMouseEnter={e => { if (selectedId !== offre.id) e.currentTarget.style.background = '#f8faff' }}
                  onMouseLeave={e => { if (selectedId !== offre.id) e.currentTarget.style.background = '#fff' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: '600', fontSize: '13px', color: '#1f2937', marginBottom: '2px' }}>
                        {offre.titre}
                      </div>
                      <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px' }}>
                        {offre.entreprise && <span style={{ fontWeight: '500' }}>{offre.entreprise}</span>}
                        {offre.lieu && <span style={{ color: '#888' }}> · {offre.lieu}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '10px', ...sourceBadge(offre.source) }}>
                          {offre.source}
                        </span>
                        {offre.remote && <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac' }}>Télétravail</span>}
                        {offre.type && <span style={{ fontSize: '10px', color: '#888' }}>{offre.type}</span>}
                        {offre.date && <span style={{ fontSize: '10px', color: '#aaa' }}>{formatDate(offre.date)}</span>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                      <button
                        onClick={e => { e.stopPropagation(); handleSelect(offre) }}
                        style={{
                          padding: '4px 10px', background: '#1a56db', color: '#fff',
                          border: 'none', borderRadius: '6px', fontSize: '11px',
                          fontWeight: '600', cursor: 'pointer'
                        }}
                      >
                        ✓ Utiliser
                      </button>
                      {offre.url && (
                        <a
                          href={offre.url} target="_blank" rel="noopener noreferrer"
                          onClick={e => e.stopPropagation()}
                          style={{
                            padding: '4px 10px', background: '#f3f4f6', color: '#555',
                            border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '6px', fontSize: '11px',
                            textDecoration: 'none', textAlign: 'center', fontWeight: '500'
                          }}
                        >
                          Voir →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Offre sélectionnée */}
      {selectedId && (
        <div style={{
          marginTop: '8px', padding: '8px 12px', background: '#f0fdf4',
          border: '1px solid #86efac', borderRadius: '8px', fontSize: '12px',
          color: '#16a34a', fontWeight: '500', display: 'flex', justifyContent: 'space-between'
        }}>
          <span>✅ Offre collée dans le champ — tu peux générer ton CV !</span>
          <button
            onClick={() => { setSelectedId(null); setExpanded(true) }}
            style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', fontSize: '12px' }}
          >
            Changer
          </button>
        </div>
      )}
    </div>
  )
}
