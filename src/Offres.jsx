import { useState } from 'react'
import Navbar from './Navbar'

const CATEGORIES = [
  { label: 'Tous les secteurs', value: '' },
  { label: 'Comptabilite & Finance', value: 'comptable finance audit' },
  { label: 'Tech & Informatique', value: 'developpeur informatique data' },
  { label: 'Marketing & Communication', value: 'marketing communication digital' },
  { label: 'Commerce & Vente', value: 'commercial vente business' },
  { label: 'Ressources Humaines', value: 'ressources humaines RH recrutement' },
  { label: 'Sante & Medical', value: 'infirmier aide-soignant sante medical' },
  { label: 'BTP & Chantier', value: 'electricien plombier batiment chantier' },
  { label: 'Restauration', value: 'cuisinier serveur restauration' },
  { label: 'Transport & Logistique', value: 'chauffeur logistique transport' },
  { label: 'Etudiant & Stage', value: 'stage alternance etudiant junior' },
]

const TYPES = ['Tous', 'CDI', 'CDD', 'Stage', 'Alternance', 'Freelance']

export default function Offres() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [categorie, setCategorie] = useState('')
  const [type, setType] = useState('Tous')
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (q = query, loc = location) => {
    const searchQ = q || categorie
    if (!searchQ.trim()) return
    setLoading(true)
    setSearched(false)
    setError('')
    setOffres([])

    try {
      const res = await fetch(`/api/offres?query=${encodeURIComponent(searchQ)}&location=${encodeURIComponent(loc || 'France')}`)
      const data = await res.json()
      let results = data.offres || []
      if (type !== 'Tous') results = results.filter(o => o.type?.toLowerCase().includes(type.toLowerCase()))
      setOffres(results)
      setSearched(true)
      if (results.length === 0 && data.errors?.length) setError('Aucune offre trouvee. Essaie d\'autres mots-cles.')
    } catch {
      setError('Erreur de connexion. Reessaie.')
      setSearched(true)
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
    try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) }
    catch { return '' }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="offres" />

      {/* ─── HERO SEARCH ─── */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '48px 40px 56px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 10px', letterSpacing: '-1px', lineHeight: '1.1' }}>
            Trouve ton prochain emploi
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', margin: '0 0 32px' }}>
            Des milliers d'offres en temps reel - genere ton CV pour postuler en 1 clic
          </p>

          {/* Barre de recherche */}
          <div style={{ background: '#fff', borderRadius: '14px', padding: '8px', display: 'flex', gap: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', marginBottom: '16px' }}>
            <input type="text" placeholder="Poste, metier, mots-cles..." value={query}
              onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 2, padding: '12px 16px', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#111', background: 'transparent', minWidth: 0 }} />
            <div style={{ width: '1px', background: '#f0f0f0', margin: '8px 0' }} />
            <input type="text" placeholder="Ville (ex: Paris, Lyon...)" value={location}
              onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              style={{ flex: 1, padding: '12px 16px', border: 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#111', background: 'transparent', minWidth: 0 }} />
            <button onClick={() => handleSearch()} disabled={loading || (!query && !categorie)}
              style={{ padding: '12px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {loading ? '⏳' : '🔍 Chercher'}
            </button>
          </div>

          {/* Raccourcis categories */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {CATEGORIES.slice(1, 7).map(cat => (
              <button key={cat.value} onClick={() => { setCategorie(cat.value); handleSearch(cat.value, location) }}
                style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)', borderRadius: '20px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', backdropFilter: 'blur(4px)' }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 40px 60px', display: 'grid', gridTemplateColumns: '240px 1fr', gap: '28px', alignItems: 'start' }}>

        {/* ─── SIDEBAR FILTRES ─── */}
        <div style={{ position: 'sticky', top: '82px' }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '20px', marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Secteur</div>
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => { setCategorie(cat.value); if (cat.value) handleSearch(cat.value, location) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: categorie === cat.value ? '700' : '400', background: categorie === cat.value ? '#ede9fe' : 'transparent', color: categorie === cat.value ? '#4f46e5' : '#555', marginBottom: '2px', transition: 'all 0.1s' }}>
                {cat.label}
              </button>
            ))}
          </div>

          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#374151', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Type de contrat</div>
            {TYPES.map(t => (
              <button key={t} onClick={() => setType(t)}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: type === t ? '700' : '400', background: type === t ? '#ede9fe' : 'transparent', color: type === t ? '#4f46e5' : '#555', marginBottom: '2px', transition: 'all 0.1s' }}>
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ─── RESULTATS ─── */}
        <div>
          {/* Etat initial */}
          {!searched && !loading && (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>Lance une recherche</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                Tape un metier ou selectionne un secteur
              </p>
            </div>
          )}

          {/* Chargement */}
          {loading && (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <div style={{ width: '40px', height: '40px', border: '4px solid #ede9fe', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <div style={{ fontSize: '15px', color: '#555' }}>Recherche en cours...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#dc2626', fontSize: '14px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {/* Compteur */}
          {searched && !loading && offres.length > 0 && (
            <div style={{ fontSize: '14px', color: '#555', marginBottom: '16px', fontWeight: '500' }}>
              <span style={{ color: '#4f46e5', fontWeight: '700' }}>{offres.length} offres</span> trouvees
            </div>
          )}

          {/* Aucun resultat */}
          {searched && !loading && offres.length === 0 && !error && (
            <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>😕</div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>Aucune offre trouvee</h3>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Essaie d'autres mots-cles ou une autre ville</p>
            </div>
          )}

          {/* Liste offres */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {offres.map(offre => (
              <div key={offre.id} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'box-shadow 0.15s, transform 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>

                  {/* Infos */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>{offre.titre}</div>
                      {offre.source && (
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: offre.source === 'JSearch' ? '#e8f3ff' : '#fff3e0', color: offre.source === 'JSearch' ? '#1a56db' : '#e65100', border: `1px solid ${offre.source === 'JSearch' ? '#b3d4f5' : '#ffcc80'}` }}>
                          {offre.source}
                        </span>
                      )}
                      {offre.remote && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac', fontWeight: '600' }}>Teletravail</span>}
                      {offre.type && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#f3f4f6', color: '#555', border: '1px solid #e5e7eb' }}>{offre.type}</span>}
                    </div>

                    <div style={{ fontSize: '13px', color: '#374151', marginBottom: '3px' }}>
                      {offre.entreprise && <span style={{ fontWeight: '600' }}>{offre.entreprise}</span>}
                      {offre.lieu && <span style={{ color: '#9ca3af' }}> · 📍 {offre.lieu}</span>}
                      {offre.date && <span style={{ color: '#c4c4c4' }}> · {formatDate(offre.date)}</span>}
                    </div>

                    {offre.description && (
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '8px 0 0', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {offre.description}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                    <button onClick={() => handleGenererCV(offre)}
                      style={{ padding: '9px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                      ⚡ Generer CV
                    </button>
                    {offre.url && (
                      <a href={offre.url} target="_blank" rel="noopener noreferrer"
                        style={{ padding: '9px 18px', background: '#f8f9ff', color: '#4f46e5', border: '1px solid #ede9fe', borderRadius: '9px', fontSize: '13px', fontWeight: '600', textDecoration: 'none', textAlign: 'center', whiteSpace: 'nowrap' }}>
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