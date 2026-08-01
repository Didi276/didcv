import { useState, useEffect } from 'react'
import { Search, MapPin, DollarSign, Zap, Home, SearchX, ChevronDown, ChevronLeft, Loader2, Briefcase, ExternalLink, Bookmark, X, Calendar, Layers } from 'lucide-react'
import Navbar from './Navbar'
import { supabase } from './supabase'

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
  { label: 'Type de contrat', value: '' },
  { label: 'CDI', value: 'CDI' },
  { label: 'CDD', value: 'CDD' },
  { label: 'Alternance', value: 'E1' },
  { label: 'Intérim', value: 'MIS' },
  { label: 'Stage', value: 'NS' },
  { label: 'Saisonnier', value: 'SAI' },
]

const EXPERIENCE = [
  { label: 'Expérience', value: '' },
  { label: 'Débutant', value: '1' },
  { label: '1 à 3 ans', value: '2' },
  { label: 'Plus de 3 ans', value: '3' },
]

const PUBLICATION = [
  { label: 'Date', value: '' },
  { label: 'Dernières 24h', value: '1' },
  { label: '3 derniers jours', value: '3' },
  { label: 'Dernière semaine', value: '7' },
  { label: 'Dernier mois', value: '31' },
]

const SOURCE_COLORS = {
  'France Travail': { bg: '#e8f5e9', color: '#2e7d32' },
  'Arbeitnow':      { bg: '#e3f2fd', color: '#1565c0' },
  'RemoteOK':       { bg: '#fdf4ff', color: '#6b21a8' },
  'Adzuna':         { bg: '#fce4ec', color: '#880e4f' },
  'Jooble':         { bg: '#fff3e0', color: '#e65100' },
  'Direct':         { bg: '#fdf4ff', color: '#7e22ce' },
}

const LOGO_COLORS = ['#4f46e5', '#0891b2', '#c2410c', '#7c3aed', '#be123c', '#0d9488', '#a16207', '#4338ca']
function logoColor(nom) {
  const s = nom || '?'
  let hash = 0
  for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash)
  return LOGO_COLORS[Math.abs(hash) % LOGO_COLORS.length]
}

export default function Offres() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [typeContrat, setTypeContrat] = useState('')
  const [experience, setExperience] = useState('')
  const [publieeDepuis, setPublieeDepuis] = useState('')
  const [teletravail, setTeletravail] = useState(false)
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sources, setSources] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [dropdownOuvert, setDropdownOuvert] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [modalMobileOuvert, setModalMobileOuvert] = useState(false)
  const [candidaturesAjoutees, setCandidaturesAjoutees] = useState(new Set())
  const [ajoutEnCours, setAjoutEnCours] = useState(false)
  const w = useWidth()
  const isMobile = w < 900

  useEffect(() => {
    const prefill = sessionStorage.getItem('offre_prefill_query')
    if (prefill) { setQuery(prefill); sessionStorage.removeItem('offre_prefill_query') }
  }, [])

  const handleSearch = async (overrides = {}, loadMore = false) => {
    const q = overrides.query ?? query
    if (!q.trim()) return
    const page = loadMore ? currentPage + 1 : 1
    if (loadMore) setLoadingMore(true)
    else { setLoading(true); setSearched(false); setOffres([]); setSources(null); setCurrentPage(1); setSelectedId(null) }
    setDropdownOuvert(null)
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
        if (data.offres?.length) setSelectedId(data.offres[0].id)
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

  const handleAjouterCandidature = async (offre) => {
    if (ajoutEnCours || candidaturesAjoutees.has(offre.id)) return
    setAjoutEnCours(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/auth'; return }
    const { error } = await supabase.from('candidatures').insert({
      user_id: user.id,
      titre: offre.titre || '',
      entreprise: offre.entreprise || '',
      lieu: offre.lieu || '',
      url_offre: offre.url || '',
      salaire: offre.salaire || '',
      statut: 'a_postuler',
    })
    if (!error) setCandidaturesAjoutees(prev => new Set(prev).add(offre.id))
    setAjoutEnCours(false)
  }

  const selectionner = (offre) => {
    setSelectedId(offre.id)
    if (isMobile) setModalMobileOuvert(true)
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

  const formatDateComplete = (d) => {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }
    catch { return '' }
  }

  const FilterDropdown = ({ id, label, value, options }) => {
    const ouvert = dropdownOuvert === id
    const actif = !!value
    return (
      <div style={{ position: 'relative' }}>
        <button type="button" onClick={(e) => { e.stopPropagation(); setDropdownOuvert(ouvert ? null : id) }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '9px', border: actif ? '1.5px solid #4f46e5' : '1.5px solid #e5e7eb', background: actif ? '#f8f9ff' : '#fff', color: actif ? '#4f46e5' : '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          {options.find(o => o.value === value)?.label || label}
          <ChevronDown size={13} style={{ transform: ouvert ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
        </button>
        {ouvert && (
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, background: '#fff', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.14)', border: '1px solid #f0f0f0', padding: '6px', zIndex: 30, minWidth: '190px' }}>
            {options.map(o => (
              <button key={o.value} type="button"
                onClick={() => { setDropdownOuvert(null); const setter = { contrat: setTypeContrat, experience: setExperience, date: setPublieeDepuis }[id]; setter(o.value); handleSearch({ [{ contrat: 'typeContrat', experience: 'experience', date: 'publieeDepuis' }[id]]: o.value }) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', borderRadius: '7px', background: value === o.value ? '#ede9fe' : 'transparent', color: value === o.value ? '#4f46e5' : '#374151', fontSize: '13px', fontWeight: value === o.value ? '700' : '500', cursor: 'pointer', fontFamily: 'inherit' }}>
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const offreSelectionnee = offres.find(o => o.id === selectedId) || null

  const Detail = ({ offre }) => {
    if (!offre) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <Briefcase size={40} color="#d1d5db" strokeWidth={1.5} style={{ marginBottom: '14px' }} />
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>Sélectionne une offre pour voir les détails</div>
        </div>
      )
    }
    const ajoutee = candidaturesAjoutees.has(offre.id)
    const srcStyle = SOURCE_COLORS[offre.source] || { bg: '#f3f4f6', color: '#374151' }
    return (
      <div>
        <div style={{ padding: isMobile ? '20px' : '24px 28px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111', margin: '0 0 8px', lineHeight: '1.25', wordBreak: 'break-word' }}>
            {offre.titre}
          </h2>
          <div style={{ fontSize: '14px', color: '#374151', marginBottom: '14px' }}>
            {offre.entreprise && <span style={{ fontWeight: '600' }}>{offre.entreprise}</span>}
            {offre.lieu && <span style={{ color: '#9ca3af', display: 'inline-flex', alignItems: 'center', gap: '3px' }}> · <MapPin size={12} /> {offre.lieu}</span>}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
            {offre.type && <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '10px', background: '#f3f4f6', color: '#6b7280' }}>{offre.type}</span>}
            {offre.remote && <span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Home size={11} /> Télétravail</span>}
            {offre.salaire && <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'inline-flex', alignItems: 'center', gap: '3px' }}><DollarSign size={11} /> {offre.salaire}</span>}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => handleGenererCV(offre)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: isMobile ? '1 1 auto' : '0 0 auto', padding: '11px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
              <Zap size={14} /> Générer mon CV
            </button>
            {offre.url && (
              <a href={offre.url} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: isMobile ? '1 1 auto' : '0 0 auto', padding: '11px 20px', background: '#fff', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}>
                <ExternalLink size={14} /> Postuler
              </a>
            )}
          </div>
        </div>

        <div style={{ padding: isMobile ? '20px' : '24px 28px' }}>
          {offre.description && (
            <div style={{ marginBottom: '28px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: '0 0 10px' }}>Description du poste</h3>
              <p style={{ fontSize: '14px', color: '#374151', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>{offre.description}</p>
            </div>
          )}

          <div style={{ marginBottom: '28px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: '0 0 10px' }}>Informations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {offre.type && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                  <Layers size={14} color="#9ca3af" /> Type de contrat : <strong>{offre.type}</strong>
                </div>
              )}
              {offre.experience && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                  <Briefcase size={14} color="#9ca3af" /> Expérience requise : <strong>{offre.experience}</strong>
                </div>
              )}
              {offre.date && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                  <Calendar size={14} color="#9ca3af" /> Publiée le : <strong>{formatDateComplete(offre.date)}</strong>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: srcStyle.color, flexShrink: 0 }} />
                Source : <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: srcStyle.bg, color: srcStyle.color }}>{offre.source}</span>
              </div>
            </div>
          </div>

          <button onClick={() => handleAjouterCandidature(offre)} disabled={ajoutee}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '13px', background: ajoutee ? '#f5f3ff' : '#fff', color: ajoutee ? '#7c3aed' : '#374151', border: `1.5px solid ${ajoutee ? '#ddd6fe' : '#e5e7eb'}`, borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: ajoutee ? 'default' : 'pointer', fontFamily: 'inherit' }}>
            <Bookmark size={15} /> {ajoutee ? 'Ajoutée à tes candidatures' : 'Ajouter à mes candidatures'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: 'inherit' }} onClick={() => dropdownOuvert && setDropdownOuvert(null)}>
      <Navbar currentPage="offres" />

      {/* Hero recherche */}
      <div style={{ position: 'relative', background: '#0a0a0f', overflow: 'hidden', padding: isMobile ? '28px 16px 32px' : '40px 40px 40px' }}>
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', maxWidth: '100%', background: 'radial-gradient(circle, #4f46e520 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: '700', color: '#fff', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
            Trouve ton emploi idéal
          </h1>
          <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '0 0 20px' }}>
            France Travail, LinkedIn, Indeed et plus, tout en un
          </p>

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
        </div>
      </div>

      {/* Filtres horizontaux */}
      <div style={{ borderBottom: '1px solid #f0f0f0', padding: isMobile ? '12px 16px' : '14px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <FilterDropdown id="contrat" label="Type de contrat" value={typeContrat} options={CONTRATS} />
          <FilterDropdown id="experience" label="Expérience" value={experience} options={EXPERIENCE} />
          <FilterDropdown id="date" label="Date" value={publieeDepuis} options={PUBLICATION} />
          <button type="button" onClick={() => { const v = !teletravail; setTeletravail(v); handleSearch({ teletravail: v }) }}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 14px', borderRadius: '9px', border: teletravail ? '1.5px solid #4f46e5' : '1.5px solid #e5e7eb', background: teletravail ? '#4f46e5' : '#fff', color: teletravail ? '#fff' : '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            <Home size={13} /> Télétravail
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '16px' : '20px 40px' }}>

        {/* Stats sources */}
        {searched && sources && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>{offres.length} offres</span>
            {Object.entries(sources).map(([src, count]) => {
              const labels = { ft: 'France Travail', arbeitnow: 'Arbeitnow', remoteok: 'RemoteOK', adzuna: 'Adzuna', jooble: 'Jooble', directes: 'Direct' }
              const colors = { ft: '#2e7d32', arbeitnow: '#1565c0', remoteok: '#6b21a8', adzuna: '#880e4f', jooble: '#e65100', directes: '#7e22ce' }
              const bgs = { ft: '#e8f5e9', arbeitnow: '#e3f2fd', remoteok: '#fdf4ff', adzuna: '#fce4ec', jooble: '#fff3e0', directes: '#fdf4ff' }
              return count > 0 ? (
                <span key={src} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '12px', background: bgs[src], color: colors[src], fontWeight: '600' }}>
                  {labels[src]}: {count}
                </span>
              ) : null
            })}
          </div>
        )}

        {/* État vide avant recherche */}
        {!searched && !loading && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <Search size={40} color="#d1d5db" strokeWidth={1.5} style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Lance ta recherche</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Accès à des milliers d'offres en temps réel</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #ede9fe', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Recherche en cours...</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>France Travail + LinkedIn + Indeed + Glassdoor</div>
          </div>
        )}

        {/* Pas de résultats */}
        {searched && !loading && offres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <SearchX size={36} color="#d1d5db" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Aucune offre trouvée</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Essaie d'autres mots-clés ou retire des filtres</p>
          </div>
        )}

        {/* Layout deux colonnes */}
        {searched && !loading && offres.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 3fr', gap: '20px', alignItems: 'start' }}>

            {/* Colonne gauche : liste */}
            <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', overflow: 'hidden', maxHeight: isMobile ? 'none' : 'calc(100vh - 220px)', overflowY: isMobile ? 'visible' : 'auto' }}>
              {offres.map(offre => {
                const estSelectionne = offre.id === selectedId
                return (
                  <div key={offre.id} onClick={() => selectionner(offre)}
                    style={{
                      display: 'flex', gap: '12px', padding: '16px', minHeight: '104px', boxSizing: 'border-box',
                      borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                      borderLeft: estSelectionne ? '3px solid #4f46e5' : '3px solid transparent',
                      background: estSelectionne ? '#f8f9ff' : '#fff',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => { if (!estSelectionne) e.currentTarget.style.background = '#fafafa' }}
                    onMouseLeave={e => { if (!estSelectionne) e.currentTarget.style.background = '#fff' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '9px', background: logoColor(offre.entreprise), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', flexShrink: 0 }}>
                      {(offre.entreprise || '?').charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', lineHeight: '1.3', wordBreak: 'break-word' }}>{offre.titre}</div>
                        {offre.date && <div style={{ fontSize: '11px', color: '#c4c4c4', flexShrink: 0, whiteSpace: 'nowrap' }}>{formatDate(offre.date)}</div>}
                      </div>
                      <div style={{ fontSize: '13px', color: '#6b7280', margin: '2px 0 6px' }}>
                        {offre.entreprise}
                        {offre.lieu && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}> · <MapPin size={11} /> {offre.lieu}</span>}
                      </div>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '4px' }}>
                        {offre.type && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: '#f3f4f6', color: '#6b7280' }}>{offre.type}</span>}
                        {offre.remote && <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a' }}>Télétravail</span>}
                        {offre.salaire && <span style={{ fontSize: '11px', fontWeight: '700', color: '#16a34a' }}>{offre.salaire}</span>}
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: '600', color: (SOURCE_COLORS[offre.source] || {}).color || '#9ca3af' }}>{offre.source}</span>
                    </div>
                  </div>
                )
              })}

              {hasMore && (
                <div style={{ textAlign: 'center', padding: '16px' }}>
                  <button onClick={() => handleSearch({}, true)} disabled={loadingMore}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {loadingMore ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ChevronDown size={14} />}
                    {loadingMore ? 'Chargement...' : "Charger plus d'offres"}
                  </button>
                </div>
              )}
            </div>

            {/* Colonne droite : détail (desktop uniquement) */}
            {!isMobile && (
              <div style={{ position: 'sticky', top: '90px', background: '#fff', border: '1px solid #f0f0f0', borderRadius: '14px', overflow: 'hidden', maxHeight: 'calc(100vh - 110px)', overflowY: 'auto' }}>
                <Detail offre={offreSelectionnee} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal plein écran mobile */}
      {isMobile && modalMobileOuvert && offreSelectionnee && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 100, overflowY: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 5 }}>
            <button onClick={() => setModalMobileOuvert(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#374151' }}>
              <ChevronLeft size={20} />
            </button>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>Détail de l'offre</span>
            <button onClick={() => setModalMobileOuvert(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#9ca3af' }}>
              <X size={20} />
            </button>
          </div>
          <Detail offre={offreSelectionnee} />
        </div>
      )}
    </div>
  )
}
