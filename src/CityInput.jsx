import { useState, useEffect, useRef } from 'react'

// Villes principales pour affichage rapide avant toute frappe
const TOP_CITIES = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Montpellier',
  'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Saint-Étienne',
  'Le Havre', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne',
  'Le Mans', 'Aix-en-Provence', 'Clermont-Ferrand', 'Brest', 'Tours',
  'Limoges', 'Amiens', 'Perpignan', 'Metz', 'Besançon', 'Caen', 'Orléans',
  'Rouen', 'Mulhouse', 'Nancy', 'Avignon', 'Poitiers', 'Versailles', 'Pau',
  'Remote / Télétravail'
]

export default function CityInput({ value, onChange, placeholder = 'Ville' }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounce = useRef(null)
  const inputRef = useRef(null)

  // Synchroniser si value change de l'extérieur
  useEffect(() => { setQuery(value || '') }, [value])

  const search = async (q) => {
    if (!q || q.length < 2) {
      setSuggestions(TOP_CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 8))
      return
    }
    setLoading(true)
    try {
      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&type=municipality&limit=8&autocomplete=1`,
        { signal: AbortSignal.timeout(3000) }
      )
      const data = await res.json()
      const cities = data.features
        .map(f => {
          const name = f.properties.city || f.properties.name
          const postcode = f.properties.postcode
          const dept = postcode ? ` (${postcode.slice(0, 2)})` : ''
          return name + dept
        })
        .filter((v, i, a) => a.indexOf(v) === i) // déduplique
      setSuggestions(cities.length > 0 ? cities : TOP_CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 6))
    } catch {
      // Fallback sur liste statique
      setSuggestions(TOP_CITIES.filter(c => c.toLowerCase().includes(q.toLowerCase())).slice(0, 8))
    }
    setLoading(false)
  }

  const handleChange = (val) => {
    setQuery(val)
    onChange(val)
    setOpen(true)
    clearTimeout(debounce.current)
    debounce.current = setTimeout(() => search(val), 250)
  }

  const handleSelect = (city) => {
    // Enlever le code département si présent
    const clean = city.replace(/ \(\d{2}\)$/, '')
    setQuery(clean)
    onChange(clean)
    setSuggestions([])
    setOpen(false)
  }

  const handleFocus = () => {
    setOpen(true)
    if (!query) setSuggestions(TOP_CITIES.slice(0, 8))
    else search(query)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => handleChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          style={{ width: '100%', padding: '9px 32px 9px 12px', border: `1.5px solid ${open ? '#4f46e5' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '13px', fontFamily: '"Inter",system-ui,sans-serif', color: '#111', outline: 'none', boxSizing: 'border-box', background: '#fff', transition: 'border-color 0.15s' }}
        />
        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px', pointerEvents: 'none', color: '#9ca3af' }}>
          {loading ? '⏳' : '📍'}
        </span>
      </div>

      {/* Dropdown suggestions */}
      {open && suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1.5px solid #ede9fe', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 200, overflow: 'hidden', maxHeight: '220px', overflowY: 'auto' }}>
          {suggestions.map((city, i) => (
            <div key={i} onMouseDown={() => handleSelect(city)}
              style={{ padding: '9px 14px', fontSize: '13px', color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: i < suggestions.length - 1 ? '1px solid #f8f9ff' : 'none', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#faf9ff'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ color: '#4f46e5', fontSize: '12px', flexShrink: 0 }}>📍</span>
              {city}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
