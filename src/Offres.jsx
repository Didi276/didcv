import { useState, useEffect } from 'react'
import { Search, MapPin, Zap, SearchX, ChevronDown, ChevronLeft, Briefcase, ExternalLink, Bookmark, X, Calendar, Layers } from 'lucide-react'
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
  { label: 'Tous', value: '' },
  { label: 'CDI', value: 'CDI' },
  { label: 'CDD', value: 'CDD' },
  { label: 'Alternance', value: 'E1' },
  { label: 'Stage', value: 'NS' },
  { label: 'Intérim', value: 'MIS' },
  { label: 'Freelance', value: 'FS' },
  { label: 'Saisonnier', value: 'SAI' },
]

const EXPERIENCE = [
  { label: 'Tous niveaux', value: '' },
  { label: 'Débutant accepté', value: '1' },
  { label: '1 à 3 ans', value: '2' },
  { label: 'Plus de 5 ans', value: '3' },
]

const SALAIRES = [
  { label: 'Indifférent', value: '' },
  { label: '25k€', value: '25000' },
  { label: '30k€', value: '30000' },
  { label: '35k€', value: '35000' },
  { label: '40k€', value: '40000' },
  { label: '50k€', value: '50000' },
  { label: '60k€', value: '60000' },
  { label: '80k€', value: '80000' },
]

const PUBLICATION = [
  { label: 'Toutes dates', value: '' },
  { label: 'Dernières 24h', value: '1' },
  { label: '3 derniers jours', value: '3' },
  { label: 'Dernière semaine', value: '7' },
  { label: 'Dernier mois', value: '31' },
]

const TRIS = [
  { label: 'Pertinence', value: 'pertinence' },
  { label: 'Date (plus récentes)', value: 'date' },
  { label: 'Salaire (plus élevé)', value: 'salaire' },
]

const SUGGESTIONS = ['Développeur', 'Commercial', 'Comptable', 'Alternance', 'Télétravail']

function salaireAnnuel(offre) {
  if (!offre.salaire) return null
  const nums = offre.salaire.match(/\d+/g)
  if (!nums) return null
  const max = Math.max(...nums.map(Number))
  return max > 10000 ? max : max * 12
}

export default function Offres() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [typeContrat, setTypeContrat] = useState('')
  const [experience, setExperience] = useState('')
  const [publieeDepuis, setPublieeDepuis] = useState('')
  const [teletravail, setTeletravail] = useState(false)
  const [salaireMin, setSalaireMin] = useState('')
  const [tempsPartiel, setTempsPartiel] = useState(false)
  const [triPar, setTriPar] = useState('pertinence')
  const [offres, setOffres] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [dropdownOuvert, setDropdownOuvert] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [modalMobileOuvert, setModalMobileOuvert] = useState(false)
  const [candidaturesAjoutees, setCandidaturesAjoutees] = useState(new Set())
  const [ajoutEnCours, setAjoutEnCours] = useState(false)
  const [user, setUser] = useState(null)
  const [savedIds, setSavedIds] = useState(new Set())
  const w = useWidth()
  const isMobile = w < 900

  useEffect(() => {
    const prefill = sessionStorage.getItem('offre_prefill_query')
    if (prefill) { setQuery(prefill); sessionStorage.removeItem('offre_prefill_query') }
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  // L'offre en favori n'a pas toujours d'id stable (offres externes agrégées) :
  // on se replie sur son URL de candidature, unique par annonce.
  const toggleSave = async (offre) => {
    if (!user) return
    const cle = offre.id || offre.url

    if (savedIds.has(cle)) {
      await supabase
        .from('offres_sauvegardees')
        .delete()
        .eq('user_id', user.id)
        .eq('url_candidature', offre.url)
      setSavedIds(prev => {
        const next = new Set(prev)
        next.delete(cle)
        return next
      })
    } else {
      await supabase.from('offres_sauvegardees').insert({
        user_id: user.id,
        titre: offre.titre,
        entreprise: offre.entreprise,
        lieu: offre.lieu,
        description: offre.description,
        url_candidature: offre.url,
        type_contrat: offre.type,
        salaire: offre.salaire,
        source: offre.source,
      })
      setSavedIds(prev => new Set([...prev, cle]))
    }
  }

  const handleSearch = async (overrides = {}) => {
    const q = overrides.query ?? query
    if (!q.trim()) return
    setLoading(true); setSearched(false); setOffres([]); setSelectedId(null)
    setDropdownOuvert(null)
    try {
      const params = new URLSearchParams({
        query: q,
        location: overrides.location ?? location,
        typeContrat: overrides.typeContrat ?? typeContrat,
        experience: overrides.experience ?? experience,
        publieeDepuis: overrides.publieeDepuis ?? publieeDepuis,
        teletravail: overrides.teletravail ?? teletravail,
        salaireMin: overrides.salaireMin ?? salaireMin,
        tempsPartiel: overrides.tempsPartiel ?? tempsPartiel,
        page: 1,
      })
      const r = await fetch(`/api/offres?${params}`)
      const data = await r.json()
      setOffres(data.offres || [])
      if (data.offres?.length) setSelectedId(data.offres[0].id)
      setSearched(true)
    } catch { setSearched(true) }
    setLoading(false)
  }

  const effacerFiltres = () => {
    setTypeContrat(''); setExperience(''); setPublieeDepuis(''); setTeletravail(false)
    setSalaireMin(''); setTempsPartiel(false)
    handleSearch({ typeContrat: '', experience: '', publieeDepuis: '', teletravail: false, salaireMin: '', tempsPartiel: false })
  }

  // Persiste l'offre en cours de candidature pour le bandeau de rappel dans
  // Generate.jsx — distinct de offre_prefill (one-shot, consommé au chargement) :
  // celle-ci reste active tant que l'utilisateur ne la ferme pas explicitement.
  const stockerOffreActive = (offre) => {
    sessionStorage.setItem('offre_active', JSON.stringify({
      titre: offre.titre,
      entreprise: offre.entreprise,
      lieu: offre.lieu,
      description: offre.description,
      url: offre.url,
      type_contrat: offre.type,
      salaire: offre.salaire,
    }))
  }

  const handleGenererCV = (offre) => {
    stockerOffreActive(offre)
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

  const FilterDropdown = ({ id, label, value, options, onSelect, align = 'left', showChevron = true }) => {
    const ouvert = dropdownOuvert === id
    const actif = !!value
    return (
      <div style={{ position: 'relative' }}>
        <button type="button" onClick={(e) => { e.stopPropagation(); setDropdownOuvert(ouvert ? null : id) }}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', borderRadius: '8px', border: actif ? '1px solid #0f0f1a' : '1px solid #e5e7eb', background: actif ? '#0f0f1a' : 'transparent', color: actif ? '#fff' : '#374151', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
          {(actif && options.find(o => o.value === value)?.label) || label}
          {showChevron && <ChevronDown size={13} style={{ transform: ouvert ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />}
        </button>
        {ouvert && (
          <div style={{ position: 'absolute', top: 'calc(100% + 6px)', [align]: 0, background: '#fff', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', border: '1px solid #f0f0f0', padding: '6px', zIndex: 30, minWidth: '190px' }}>
            {options.map(o => (
              <button key={o.value} type="button"
                onClick={() => { setDropdownOuvert(null); onSelect(o.value) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', border: 'none', borderRadius: '7px', background: value === o.value ? '#f5f5f5' : 'transparent', color: '#111', fontSize: '13px', fontWeight: value === o.value ? '600' : '400', cursor: 'pointer', fontFamily: 'inherit' }}>
                {o.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const filtreActif = typeContrat || experience || publieeDepuis || teletravail || salaireMin || tempsPartiel

  // Tri client (le mélange "pertinence" vient déjà de l'API)
  const offresAffichees = [...offres]
  if (triPar === 'date') {
    offresAffichees.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  } else if (triPar === 'salaire') {
    offresAffichees.sort((a, b) => {
      const sa = salaireAnnuel(a), sb = salaireAnnuel(b)
      if (sa === null && sb === null) return 0
      if (sa === null) return 1
      if (sb === null) return -1
      return sb - sa
    })
  }

  const offreSelectionnee = offres.find(o => o.id === selectedId) || null

  const Detail = ({ offre }) => {
    if (!offre) {
      return (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <Briefcase size={36} color="#d1d5db" strokeWidth={1.5} style={{ marginBottom: '14px' }} />
          <div style={{ fontSize: '14px', color: '#9ca3af' }}>Sélectionne une offre pour voir les détails</div>
        </div>
      )
    }
    const ajoutee = candidaturesAjoutees.has(offre.id)
    return (
      <div>
        <div style={{ padding: isMobile ? '20px' : '32px 36px', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#111', margin: '0 0 8px', lineHeight: '1.25', wordBreak: 'break-word' }}>
            {offre.titre}
          </h2>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
            {offre.entreprise}
            {offre.lieu && <span> · {offre.lieu}</span>}
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {offre.type && <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '8px', background: '#f8f8f8', color: '#6b7280' }}>{offre.type}</span>}
            {offre.remote && <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '8px', background: '#f8f8f8', color: '#6b7280' }}>Télétravail</span>}
            {offre.salaire && <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '8px', background: '#f8f8f8', color: '#6b7280' }}>{offre.salaire}</span>}
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => handleGenererCV(offre)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: isMobile ? '1 1 auto' : '0 0 auto', padding: '11px 20px', background: '#0f0f1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Zap size={14} /> Générer mon CV
            </button>
            {offre.url && (
              <a href={offre.url} target="_blank" rel="noopener noreferrer" onClick={() => stockerOffreActive(offre)}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: isMobile ? '1 1 auto' : '0 0 auto', padding: '11px 20px', background: 'transparent', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none' }}>
                <ExternalLink size={14} /> Postuler
              </a>
            )}
          </div>
        </div>

        <div style={{ padding: isMobile ? '20px' : '32px 36px' }}>
          {offre.description && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Description du poste</div>
              <p style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', whiteSpace: 'pre-wrap', margin: 0 }}>{offre.description}</p>
            </div>
          )}

          <div style={{ marginBottom: '32px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Informations</div>
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
              <div style={{ fontSize: '13px', color: '#374151' }}>
                Source : <strong>{offre.source}</strong>
              </div>
            </div>
          </div>

          <button onClick={() => handleAjouterCandidature(offre)} disabled={ajoutee}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', width: '100%', padding: '13px', background: 'transparent', color: ajoutee ? '#9ca3af' : '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: ajoutee ? 'default' : 'pointer', fontFamily: 'inherit' }}>
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
      <div style={{ background: '#0a0a0f', padding: isMobile ? '48px 16px' : '80px 40px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <h1 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '700', color: '#fff', margin: '0 0 28px', letterSpacing: '-1px', lineHeight: '1.1' }}>
            Trouve ton prochain poste.
          </h1>

          <div style={{ background: '#fff', borderRadius: '12px', padding: '6px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '6px', boxShadow: '0 2px 12px rgba(0,0,0,0.12)' }}>
            <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Poste, métier, compétence..." style={{ flex: 2, padding: '11px 14px', border: isMobile ? '1px solid #f0f0f0' : 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#111', borderRadius: '8px', background: 'transparent' }} />
            {!isMobile && <div style={{ width: '1px', background: '#f0f0f0', margin: '6px 0' }} />}
            <input value={location} onChange={e => setLocation(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Ville, département..." style={{ flex: 1, padding: '11px 14px', border: isMobile ? '1px solid #f0f0f0' : 'none', outline: 'none', fontSize: '14px', fontFamily: 'inherit', color: '#111', borderRadius: '8px', background: 'transparent' }} />
            <button onClick={() => handleSearch()} disabled={loading || !query.trim()}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '11px 24px', background: loading ? '#3a3a3a' : '#0f0f1a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
              {loading ? '...' : <><Search size={15} /> Rechercher</>}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQuery(s); handleSearch({ query: s }) }}
                style={{ padding: '5px 14px', background: 'transparent', color: '#e5e5e5', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '20px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '400' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filtres horizontaux */}
      <div style={{ position: 'sticky', top: '62px', zIndex: 40, background: '#fff', borderBottom: '1px solid #f0f0f0', padding: isMobile ? '10px 16px' : '10px 40px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <FilterDropdown id="contrat" label="Type de contrat" value={typeContrat} options={CONTRATS}
            onSelect={v => { setTypeContrat(v); handleSearch({ typeContrat: v }) }} />
          <FilterDropdown id="experience" label="Expérience" value={experience} options={EXPERIENCE}
            onSelect={v => { setExperience(v); handleSearch({ experience: v }) }} />
          <FilterDropdown id="salaire" label="Salaire min" value={salaireMin} options={SALAIRES}
            onSelect={v => { setSalaireMin(v); handleSearch({ salaireMin: v }) }} />
          <FilterDropdown id="date" label="Date" value={publieeDepuis} options={PUBLICATION}
            onSelect={v => { setPublieeDepuis(v); handleSearch({ publieeDepuis: v }) }} />
          <button type="button" onClick={() => { const v = !teletravail; setTeletravail(v); handleSearch({ teletravail: v }) }}
            style={{ padding: '6px 14px', borderRadius: '8px', border: teletravail ? '1px solid #0f0f1a' : '1px solid #e5e7eb', background: teletravail ? '#0f0f1a' : 'transparent', color: teletravail ? '#fff' : '#374151', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            Télétravail
          </button>
          <button type="button" onClick={() => { const v = !tempsPartiel; setTempsPartiel(v); handleSearch({ tempsPartiel: v }) }}
            style={{ padding: '6px 14px', borderRadius: '8px', border: tempsPartiel ? '1px solid #0f0f1a' : '1px solid #e5e7eb', background: tempsPartiel ? '#0f0f1a' : 'transparent', color: tempsPartiel ? '#fff' : '#374151', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            Temps partiel
          </button>
          {filtreActif && (
            <button type="button" onClick={effacerFiltres}
              style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'none', color: '#9ca3af', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' }}>
              Effacer
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '16px' : '24px 40px 40px' }}>

        {/* Compteur + tri */}
        {searched && offres.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '16px', fontSize: '13px', color: '#6b7280' }}>
            <div>
              <span style={{ fontWeight: '700', color: '#111' }}>{offres.length} offre{offres.length > 1 ? 's' : ''}</span>
              {' '}· Triées par {TRIS.find(t => t.value === triPar)?.label.toLowerCase()}
            </div>
            <FilterDropdown id="tri" label="Trier par : Pertinence" value={triPar === 'pertinence' ? '' : triPar}
              options={TRIS.map(t => ({ label: `Trier par : ${t.label}`, value: t.value === 'pertinence' ? '' : t.value }))}
              onSelect={v => setTriPar(v || 'pertinence')} align="right" />
          </div>
        )}

        {/* État vide avant recherche */}
        {!searched && !loading && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <Search size={36} color="#d1d5db" strokeWidth={1.5} style={{ marginBottom: '14px' }} />
            <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Lance ta recherche</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Accès à des milliers d'offres en temps réel</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #f0f0f0', borderTop: '3px solid #0f0f1a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Recherche en cours...</div>
          </div>
        )}

        {/* Pas de résultats */}
        {searched && !loading && offres.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px' }}>
            <SearchX size={32} color="#d1d5db" strokeWidth={1.5} style={{ marginBottom: '12px' }} />
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Aucune offre trouvée</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Essaie d'autres mots-clés ou retire des filtres</p>
          </div>
        )}

        {/* Layout deux colonnes */}
        {searched && !loading && offres.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 3fr', gap: '0 40px', alignItems: 'start' }}>

            {/* Colonne gauche : liste */}
            <div style={{ maxHeight: isMobile ? 'none' : 'calc(100vh - 150px)', overflowY: isMobile ? 'visible' : 'auto' }}>
              {offresAffichees.map(offre => {
                const estSelectionne = offre.id === selectedId
                return (
                  <div key={offre.id} onClick={() => selectionner(offre)}
                    style={{
                      padding: '20px 4px', boxSizing: 'border-box',
                      borderBottom: '1px solid #f0f0f0', cursor: 'pointer',
                      background: estSelectionne ? '#fafafa' : 'transparent',
                    }}
                    onMouseEnter={e => { if (!estSelectionne) e.currentTarget.style.background = '#fafafa' }}
                    onMouseLeave={e => { if (!estSelectionne) e.currentTarget.style.background = 'transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '15px', fontWeight: '600', color: '#111', lineHeight: '1.3', wordBreak: 'break-word' }}>{offre.titre}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
                        {offre.date && <span style={{ fontSize: '12px', color: '#d1d5db', whiteSpace: 'nowrap' }}>{formatDate(offre.date)}</span>}
                        <button onClick={(e) => { e.stopPropagation(); toggleSave(offre) }}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            fontSize: '18px', color: savedIds.has(offre.id || offre.url)
                              ? '#ef4444' : '#d1d5db',
                            padding: '4px', lineHeight: 1,
                          }}>
                          {savedIds.has(offre.id || offre.url) ? '❤️' : '🤍'}
                        </button>
                      </div>
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', margin: '3px 0 8px' }}>
                      {offre.entreprise}
                      {offre.lieu && <span> · {offre.lieu}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '4px' }}>
                      {offre.type && <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '6px', background: '#f8f8f8', color: '#9ca3af' }}>{offre.type}</span>}
                      {offre.remote && <span style={{ fontSize: '10px', fontWeight: '500', padding: '2px 8px', borderRadius: '6px', background: '#f8f8f8', color: '#9ca3af' }}>Télétravail</span>}
                      {offre.salaire && <span style={{ fontSize: '13px', color: '#111' }}>{offre.salaire}</span>}
                    </div>
                    <span style={{ fontSize: '11px', color: '#c4c4c4' }}>{offre.source}</span>
                  </div>
                )
              })}
            </div>

            {/* Colonne droite : détail (desktop uniquement) */}
            {!isMobile && (
              <div style={{ position: 'sticky', top: '130px', borderLeft: '1px solid #f0f0f0', maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
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
