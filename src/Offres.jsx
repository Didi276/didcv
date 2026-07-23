import { useState, useEffect } from 'react'
import { Search, Settings, Target, Home, MapPin, DollarSign, Zap, CheckCircle, SearchX, ChevronDown, Loader2 } from 'lucide-react'
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

const CONTRATS = [
  { label: 'Tous', value: '' },
  { label: 'CDI', value: 'CDI' },
  { label: 'CDD', value: 'CDD' },
  { label: 'Alternance', value: 'E1' },
  { label: 'Intérim', value: 'MIS' },
  { label: 'Stage', value: 'NS' },
  { label: 'Saisonnier', value: 'SAI' },
]

const EXPERIENCE = [
  { label: 'Tous niveaux', value: '' },
  { label: 'Débutant', value: '1' },
  { label: '1 à 3 ans', value: '2' },
  { label: 'Plus de 3 ans', value: '3' },
]

const PUBLICATION = [
  { label: 'Toutes dates', value: '' },
  { label: 'Dernières 24h', value: '1' },
  { label: '3 derniers jours', value: '3' },
  { label: 'Dernière semaine', value: '7' },
  { label: 'Dernier mois', value: '31' },
]

const SECTEURS = [
  'Comptabilité & Finance', 'Tech & Informatique', 'Marketing & Communication',
  'Commerce & Vente', 'Ressources Humaines', 'Santé & Médical',
  'BTP & Chantier', 'Restauration & Hôtellerie', 'Transport & Logistique',
  'Juridique', 'Éducation & Formation', 'Industrie & Production',
]

const SOURCE_COLORS = {
  'France Travail': { bg: '#e8f5e9', color: '#2e7d32', dot: '#4caf50' },
  'Arbeitnow':      { bg: '#e3f2fd', color: '#1565c0', dot: '#2196f3' },
  'RemoteOK':       { bg: '#fdf4ff', color: '#6b21a8', dot: '#a855f7' },
  'Adzuna':         { bg: '#fce4ec', color: '#880e4f', dot: '#e91e63' },
  'Jooble':         { bg: '#fff3e0', color: '#e65100', dot: '#ff9800' },
}

export default function Offres() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [typeContrat, setTypeContrat] = useState('')
  const [experience, setExperience] = useState('')
  const [publieeDepuis, setPublieeDepuis] = useState('')
  const [teletravail, setTeletravail] = useState(false)
  const [secteur, setSecteur] = useState('')
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sources, setSources] = useState(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const w = useWidth()
  const isMobile = w < 768

  useEffect(() => {
    const prefill = sessionStorage.getItem('offre_prefill_query')
    if (prefill) { setQuery(prefill); sessionStorage.removeItem('offre_prefill_query') }
  }, [])

  const handleSearch = async (overrides = {}, loadMore = false) => {
    const q = overrides.query ?? (secteur || query)
    if (!q.trim()) return
    const page = loadMore ? currentPage + 1 : 1
    if (loadMore) setLoadingMore(true)
    else { setLoading(true); setSearched(false); setOffres([]); setSources(null); setCurrentPage(1) }
    setShowFilters(false)
    try {
      const params = new URLSearchParams({
        query: q,
        location: overrides.location ?? location,
        typeContrat: overrides.typeContrat ?? typeContrat,
        experience: overrides.experience ?? experience,
        publieeDepuis: overrides.publieeDepuis ?? publieeDepuis,
        teletravail: overrides.teletravail ?? teletravail,
        page,
      })
      const r = await fetch(`/api/offres?${params}`)
      const data = await r.json()
      if (loadMore) {
        setOffres(prev => [...prev, ...(data.offres || [])])
        setCurrentPage(page)
      } else {
        setOffres(data.offres || [])
      }
      setSources(data.sources || null)
      setHasMore(data.hasMore || false)
      setSearched(true)
    } catch { setSearched(true) }
    setLoading(false)
    setLoadingMore(false)
  }

  const handleGenererCV = (offre) => {
    const texte = [offre.titre, offre.entreprise && `${offre.entreprise} - ${offre.lieu}`, offre.type, '', offre.description].filter(Boolean).join('\n')
    sessionStorage.setItem('offre_prefill', JSON.stringify({
      titre: offre.titre || '',
      entreprise: offre.entreprise || '',
      url: offre.url || '',
      texte,
    }))
    window.location.href = '/generate?template=auto'
  }

  const formatDate = (d) => {
    if (!d) return ''
    try {
      const diff = Math.floor((Date.now() - new Date(d)) / 86400000)
      if (diff === 0) return "Aujourd'hui"
      if (diff === 1) return 'Hier'
      if (diff < 7) return `Il y a ${diff} jours`
      return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
    } catch { return '' }
  }

  const FilterSection = ({ title, children }) => (
    <div style={{ padding: '16px 0', borderTop: '1px solid #f0f0f0' }}>
      <div style={{ fontSize: '11px', fontWeight: '700', color: '#374151', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>{title}</div>
      {children}
    </div>
  )

  const FilterChip = ({ label, active, onClick }) => (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: active ? '700' : '500',
      background: active ? '#4f46e5' : '#f3f4f6', color: active ? '#fff' : '#374151',
      border: 'none', cursor: 'pointer', fontFamily: 'inherit', margin: '3px 3px 3px 0',
      transition: 'all 0.1s'
    }}>{label}</button>
  )

  const Sidebar = () => (
    <div className="filter-sidebar" style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px' }}>
      <style>{'.filter-sidebar > div:first-child { border-top: none; padding-top: 0; }'}</style>
      <FilterSection title="Secteur">
        {SECTEURS.map(s => (
          <FilterChip key={s} label={s} active={secteur === s}
            onClick={() => { const val = secteur === s ? '' : s; setSecteur(val); handleSearch({ query: val || query }) }} />
        ))}
      </FilterSection>

      <FilterSection title="Type de contrat">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {CONTRATS.map(c => (
            <button key={c.value} onClick={() => { setTypeContrat(c.value); handleSearch({ typeContrat: c.value }) }}
              style={{ padding: '7px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: typeContrat === c.value ? '700' : '400', background: typeContrat === c.value ? '#ede9fe' : 'transparent', color: typeContrat === c.value ? '#4f46e5' : '#555', textAlign: 'left', transition: 'all 0.1s' }}>
              {c.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Expérience">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {EXPERIENCE.map(e => (
            <button key={e.value} onClick={() => { setExperience(e.value); handleSearch({ experience: e.value }) }}
              style={{ padding: '7px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: experience === e.value ? '700' : '400', background: experience === e.value ? '#ede9fe' : 'transparent', color: experience === e.value ? '#4f46e5' : '#555', textAlign: 'left' }}>
              {e.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Date de publication">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {PUBLICATION.map(p => (
            <button key={p.value} onClick={() => { setPublieeDepuis(p.value); handleSearch({ publieeDepuis: p.value }) }}
              style={{ padding: '7px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: publieeDepuis === p.value ? '700' : '400', background: publieeDepuis === p.value ? '#ede9fe' : 'transparent', color: publieeDepuis === p.value ? '#4f46e5' : '#555', textAlign: 'left' }}>
              {p.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Télétravail">
        <button onClick={() => { const v = !teletravail; setTeletravail(v); handleSearch({ teletravail: v }) }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 12px', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', background: teletravail ? '#ede9fe' : 'transparent', color: teletravail ? '#4f46e5' : '#555', fontWeight: teletravail ? '700' : '400', width: '100%', textAlign: 'left' }}>
          {teletravail ? <CheckCircle size={14} /> : <span style={{ width: '14px', height: '14px', border: '1.5px solid #d1d5db', borderRadius: '4px', display: 'inline-block' }} />} Télétravail possible
        </button>
      </FilterSection>

      {(typeContrat || experience || publieeDepuis || teletravail || secteur) && (
        <div style={{ paddingTop: '16px', borderTop: '1px solid #f0f0f0', textAlign: 'center' }}>
          <button onClick={() => { setTypeContrat(''); setExperience(''); setPublieeDepuis(''); setTeletravail(false); setSecteur(''); handleSearch({ typeContrat: '', experience: '', publieeDepuis: '', teletravail: false }) }}
            style={{ background: 'none', color: '#9ca3af', border: 'none', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="offres" />

      {/* Hero recherche */}
      <div style={{ position: 'relative', background: '#0a0a0f', overflow: 'hidden', padding: isMobile ? '28px 16px 36px' : '40px 40px 48px' }}>
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', maxWidth: '100%', background: 'radial-gradient(circle, #4f46e520 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: '#fff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Trouve ton emploi idéal
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 20px' }}>
            France Travail, LinkedIn, Indeed et plus — tout en un
          </p>

          {/* Barre de recherche */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '6px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Poste, métier, compétence..." style={{ flex: 2, padding: '11px 14px', border: isMobile ? '1px solid #f0f0f0' : 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#111', borderRadius: '8px', background: 'transparent' }} />
            {!isMobile && <div style={{ width: '1px', background: '#f0f0f0', margin: '6px 0' }} />}
            <input value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Ville, département..." style={{ flex: 1, padding: '11px 14px', border: isMobile ? '1px solid #f0f0f0' : 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#111', borderRadius: '8px', background: 'transparent' }} />
            <button onClick={() => handleSearch()} disabled={loading || !query.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px 24px', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: loading ? 'none' : '0 4px 12px rgba(79,70,229,0.3)' }}>
              {loading ? '...' : <><Search size={15} /> Rechercher</>}
            </button>
          </div>

          {/* Raccourcis rapides */}
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            {['Comptable', 'Développeur', 'Commercial', 'Infirmier', 'Alternance', 'Télétravail'].map(s => (
              <button key={s} onClick={() => { setQuery(s); handleSearch({ query: s }) }}
                style={{ padding: '4px 12px', background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '64px 16px 16px' : '96px 40px 60px' }}>

        {/* Filtres mobile */}
        {isMobile && (
          <div style={{ marginBottom: '12px' }}>
            <button onClick={() => setShowFilters(!showFilters)}
              style={{ width: '100%', padding: '11px 16px', background: '#fff', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '7px' }}><Settings size={15} /> Filtres {(typeContrat || experience || publieeDepuis || teletravail) && '(actifs)'}</span>
              <span>{showFilters ? '▲' : '▼'}</span>
            </button>
            {showFilters && <div style={{ marginTop: '8px' }}><Sidebar /></div>}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '240px 1fr', gap: '24px', alignItems: 'start' }}>

          {/* Sidebar desktop */}
          {!isMobile && <div style={{ position: 'sticky', top: '78px' }}><Sidebar /></div>}

          {/* Résultats */}
          <div>
            {/* Stats sources */}
            {searched && sources && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>{offres.length} offres</span>
                {Object.entries(sources).map(([src, count]) => {
                  const labels = { ft: 'France Travail', arbeitnow: 'Arbeitnow', remoteok: 'RemoteOK', adzuna: 'Adzuna', jooble: 'Jooble' }
                  const colors = { ft: '#2e7d32', arbeitnow: '#1565c0', remoteok: '#6b21a8', adzuna: '#880e4f', jooble: '#e65100' }
                  const bgs = { ft: '#e8f5e9', arbeitnow: '#e3f2fd', remoteok: '#fdf4ff', adzuna: '#fce4ec', jooble: '#fff3e0' }
                  return count > 0 ? (
                    <span key={src} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: bgs[src], color: colors[src], fontWeight: '600' }}>
                      {labels[src]}: {count}
                    </span>
                  ) : null
                })}
              </div>
            )}

            {/* État vide */}
            {!searched && !loading && (
              <div style={{ textAlign: 'center', padding: '60px 24px', background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <Target size={44} color="#c4c4c4" strokeWidth={1.5} style={{ marginBottom: '14px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 8px' }}>Lance ta recherche</h3>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px' }}>Accès à des milliers d'offres en temps réel</p>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {['CDI Paris', 'Alternance Lyon', 'Développeur Remote', 'Comptable Bordeaux'].map(s => (
                    <button key={s} onClick={() => { const [q, l] = s.split(' '); setQuery(s); handleSearch({ query: s }) }}
                      style={{ padding: '8px 16px', background: '#ede9fe', color: '#4f46e5', border: 'none', borderRadius: '20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid #ede9fe', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
                <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Recherche en cours...</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>France Travail + LinkedIn + Indeed + Glassdoor</div>
              </div>
            )}

            {/* Pas de résultats */}
            {searched && !loading && offres.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px', background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <SearchX size={36} color="#c4c4c4" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Aucune offre trouvée</h3>
                <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Essaie d'autres mots-clés ou retire des filtres</p>
              </div>
            )}

            {/* Liste offres */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {offres.map(offre => {
                const srcStyle = SOURCE_COLORS[offre.source] || { bg: '#f3f4f6', color: '#374151', dot: '#9ca3af' }
                return (
                  <div key={offre.id} style={{ background: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: isMobile ? '14px' : '18px 20px', transition: 'box-shadow 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Badge source + date */}
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: srcStyle.bg, color: srcStyle.color }}>
                            ● {offre.source}
                          </span>
                          {offre.type && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: '#f3f4f6', color: '#6b7280' }}>{offre.type}</span>}
                          {offre.remote && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Home size={10} /> Télétravail</span>}
                          {offre.date && <span style={{ fontSize: '11px', color: '#c4c4c4', marginLeft: 'auto' }}>{formatDate(offre.date)}</span>}
                        </div>

                        <div style={{ fontSize: isMobile ? '14px' : '16px', fontWeight: '700', color: '#111', marginBottom: '4px', lineHeight: '1.3' }}>
                          {offre.titre}
                        </div>

                        <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
                          {offre.entreprise && <span style={{ fontWeight: '600' }}>{offre.entreprise}</span>}
                          {offre.lieu && <span style={{ color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: '3px' }}> · <MapPin size={11} /> {offre.lieu}</span>}
                        </div>

                        {offre.salaire && (
                          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <DollarSign size={12} /> {offre.salaire}
                          </div>
                        )}

                        {!isMobile && offre.description && (
                          <p style={{ fontSize: '12px', color: '#6b7280', margin: '6px 0 0', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {offre.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                        <button onClick={() => handleGenererCV(offre)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: isMobile ? '8px 12px' : '9px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '9px', fontSize: isMobile ? '11px' : '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                          <Zap size={12} /> {isMobile ? 'CV' : 'Générer CV'}
                        </button>
                        {offre.url && (
                          <a href={offre.url} target="_blank" rel="noopener noreferrer"
                            style={{ padding: isMobile ? '6px 10px' : '8px 16px', background: '#f8f9ff', color: '#4f46e5', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '8px', fontSize: isMobile ? '10px' : '12px', fontWeight: '600', textDecoration: 'none', textAlign: 'center', display: 'block' }}>
                            Voir l'offre
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Charger plus */}
            {searched && !loading && offres.length > 0 && (
              <div style={{ textAlign: 'center', marginTop: '24px', paddingBottom: '24px' }}>
                <button onClick={() => handleSearch({}, true)} disabled={loadingMore}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px 32px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', opacity: loadingMore ? 0.7 : 1, boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                  {loadingMore ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ChevronDown size={15} />}
                  {loadingMore ? 'Chargement...' : "Charger plus d'offres"}
                </button>
                <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
