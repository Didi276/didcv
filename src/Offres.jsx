import { useState, useEffect } from 'react'
import Navbar from './Navbar'

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

const CATEGORIES = [
  { label: 'Tous les secteurs', value: '' },
  { label: 'Comptabilite & Finance', value: 'comptable finance audit' },
  { label: 'Tech & Informatique', value: 'developpeur informatique data' },
  { label: 'Marketing & Communication', value: 'marketing communication digital' },
  { label: 'Commerce & Vente', value: 'commercial vente business' },
  { label: 'Ressources Humaines', value: 'ressources humaines RH' },
  { label: 'Sante & Medical', value: 'infirmier aide-soignant sante' },
  { label: 'BTP & Chantier', value: 'electricien plombier batiment' },
  { label: 'Restauration', value: 'cuisinier serveur restauration' },
  { label: 'Transport & Logistique', value: 'chauffeur logistique transport' },
  { label: 'Etudiant & Stage', value: 'stage alternance etudiant' },
]

export default function Offres() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [categorie, setCategorie] = useState('')
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const w = useWidth()
  const isMobile = w < 768

  const handleSearch = async (q = query, loc = location) => {
    const searchQ = q || categorie
    if (!searchQ.trim()) return
    setLoading(true); setSearched(false); setError(''); setOffres([])
    setShowFilters(false)
    try {
      const res = await fetch(`/api/offres?query=${encodeURIComponent(searchQ)}&location=${encodeURIComponent(loc || 'France')}`)
      const data = await res.json()
      setOffres(data.offres || [])
      setSearched(true)
      if ((data.offres || []).length === 0 && data.errors?.length) setError('Aucune offre trouvee. Essaie d\'autres mots-cles.')
    } catch {
      setError('Erreur de connexion.'); setSearched(true)
    }
    setLoading(false)
  }

  const handleGenererCV = (offre) => {
    const texte = [offre.titre, `${offre.entreprise} - ${offre.lieu}`, offre.type ? `Type: ${offre.type}` : '', '', offre.description, offre.url ? `Source: ${offre.url}` : ''].filter(Boolean).join('\n')
    sessionStorage.setItem('offre_prefill', texte)
    window.location.href = '/generate'
  }

  const formatDate = (d) => {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) } catch { return '' }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="offres" />

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: isMobile ? '32px 16px 40px' : '48px 40px 56px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', color: '#fff', margin: '0 0 8px', letterSpacing: '-1px', lineHeight: '1.1' }}>
            Trouve ton prochain emploi
          </h1>
          <p style={{ fontSize: isMobile ? '13px' : '15px', color: 'rgba(255,255,255,0.75)', margin: '0 0 24px' }}>
            Des milliers d'offres en temps reel
          </p>

          {/* Barre recherche */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '6px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', marginBottom: '14px' }}>
            <input type="text" placeholder="Poste, metier..." value={query}
              onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 2, padding: '11px 14px', border: isMobile ? '1px solid #f0f0f0' : 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#111', background: 'transparent', borderRadius: '8px', minWidth: 0 }} />
            {!isMobile && <div style={{ width: '1px', background: '#f0f0f0', margin: '6px 0' }} />}
            <input type="text" placeholder="Ville..." value={location}
              onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, padding: '11px 14px', border: isMobile ? '1px solid #f0f0f0' : 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#111', background: 'transparent', borderRadius: '8px', minWidth: 0 }} />
            <button onClick={() => handleSearch()} disabled={loading || (!query && !categorie)}
              style={{ padding: '11px 22px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {loading ? '⏳' : '🔍 Chercher'}
            </button>
          </div>

          {/* Raccourcis */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.slice(1, isMobile ? 5 : 7).map(cat => (
              <button key={cat.value} onClick={() => { setCategorie(cat.value); handleSearch(cat.value, location) }}
                style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', fontSize: '11px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '16px' : '24px 40px 60px', display: isMobile ? 'block' : 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', alignItems: 'start' }}>

        {/* Filtres mobile - bouton toggle */}
        {isMobile && (
          <div style={{ marginBottom: '12px' }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ width: '100%', padding: '11px 16px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              <span>🔧 Filtrer par secteur</span>
              <span>{showFilters ? '▲' : '▼'}</span>
            </button>
            {showFilters && (
              <div style={{ background: '#fff', borderRadius: '10px', border: '1px solid #e5e7eb', padding: '12px', marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.value} onClick={() => { setCategorie(cat.value); if (cat.value) handleSearch(cat.value, location) }}
                    style={{ padding: '8px 10px', border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: categorie === cat.value ? '700' : '400', background: categorie === cat.value ? '#ede9fe' : '#f8f9ff', color: categorie === cat.value ? '#4f46e5' : '#555', textAlign: 'left' }}>
                    {cat.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sidebar desktop */}
        {!isMobile && (
          <div style={{ position: 'sticky', top: '82px' }}>
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '18px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Secteur</div>
              {CATEGORIES.map(cat => (
                <button key={cat.value} onClick={() => { setCategorie(cat.value); if (cat.value) handleSearch(cat.value, location) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: categorie === cat.value ? '700' : '400', background: categorie === cat.value ? '#ede9fe' : 'transparent', color: categorie === cat.value ? '#4f46e5' : '#555', marginBottom: '2px', transition: 'all 0.1s' }}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Résultats */}
        <div>
          {!searched && !loading && (
            <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>🔍</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>Lance une recherche</h3>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Tape un metier ou selectionne un secteur</p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '36px', height: '36px', border: '4px solid #ede9fe', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <div style={{ fontSize: '14px', color: '#555' }}>Recherche en cours...</div>
            </div>
          )}

          {error && <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '13px', marginBottom: '14px' }}>{error}</div>}

          {searched && !loading && offres.length > 0 && (
            <div style={{ fontSize: '13px', color: '#555', marginBottom: '14px', fontWeight: '500' }}>
              <span style={{ color: '#4f46e5', fontWeight: '700' }}>{offres.length} offres</span> trouvees
            </div>
          )}

          {searched && !loading && offres.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>😕</div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Aucune offre trouvee</h3>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Essaie d'autres mots-cles</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {offres.map(offre => (
              <div key={offre.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: isMobile ? '14px' : '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: '700', color: '#111', marginBottom: '4px' }}>{offre.titre}</div>
                    <div style={{ fontSize: '12px', color: '#374151', marginBottom: '2px' }}>
                      {offre.entreprise && <span style={{ fontWeight: '600' }}>{offre.entreprise}</span>}
                      {offre.lieu && <span style={{ color: '#9ca3af' }}> · 📍 {offre.lieu}</span>}
                      {!isMobile && offre.date && <span style={{ color: '#c4c4c4' }}> · {formatDate(offre.date)}</span>}
                    </div>
                    {!isMobile && offre.description && (
                      <p style={{ fontSize: '12px', color: '#6b7280', margin: '6px 0 0', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {offre.description}
                      </p>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => handleGenererCV(offre)}
                      style={{ padding: isMobile ? '8px 12px' : '9px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: isMobile ? '11px' : '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      ⚡ {isMobile ? 'CV' : 'Générer CV'}
                    </button>
                    {!isMobile && offre.url && (
                      <a href={offre.url} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '8px 16px', background: '#f8f9ff', color: '#4f46e5', border: '1px solid #ede9fe', borderRadius: '8px', fontSize: '12px', fontWeight: '600', textDecoration: 'none', textAlign: 'center' }}>
                        Voir l'offre
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}