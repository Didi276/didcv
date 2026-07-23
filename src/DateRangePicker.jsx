import { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: CURRENT_YEAR - 1979 }, (_, i) => CURRENT_YEAR - i)

// Parse "Jan 2022 - Déc 2024" ou "Jan 2022 - Aujourd'hui" ou "2020 - 2022"
function parsePeriode(value) {
  if (!value) return { sm: '', sy: '', em: '', ey: '', current: false }
  const parts = value.split(' - ')
  const parseDate = (s) => {
    if (!s) return { m: '', y: '' }
    const words = s.trim().split(' ')
    if (words.length === 2 && isNaN(words[0])) return { m: words[0], y: words[1] }
    if (words.length === 1) return { m: '', y: words[0] }
    return { m: '', y: '' }
  }
  const start = parseDate(parts[0])
  const isCurrent = parts[1]?.trim() === "Aujourd'hui"
  const end = isCurrent ? { m: '', y: '' } : parseDate(parts[1])
  return { sm: start.m, sy: start.y, em: end.m, ey: end.y, current: isCurrent }
}

function buildPeriode(sm, sy, em, ey, current) {
  if (!sy) return ''
  const start = sm ? `${sm} ${sy}` : sy
  if (current) return `${start} - Aujourd'hui`
  if (!ey) return start
  const end = em ? `${em} ${ey}` : ey
  return `${start} - ${end}`
}

const SEL = {
  padding: '8px 10px', border: '1.5px solid #e5e7eb', borderRadius: '8px',
  fontSize: '13px', fontFamily: '"Inter",system-ui,sans-serif', color: '#111',
  outline: 'none', background: '#fff', cursor: 'pointer', transition: 'border-color 0.15s',
}

export default function DateRangePicker({ value, onChange, placeholder = 'Période' }) {
  const parsed = parsePeriode(value)
  const [sm, setSm] = useState(parsed.sm)
  const [sy, setSy] = useState(parsed.sy)
  const [em, setEm] = useState(parsed.em)
  const [ey, setEy] = useState(parsed.ey)
  const [current, setCurrent] = useState(parsed.current)
  const [open, setOpen] = useState(false)

  // Synchroniser si value change de l'extérieur
  useEffect(() => {
    const p = parsePeriode(value)
    setSm(p.sm); setSy(p.sy); setEm(p.em); setEy(p.ey); setCurrent(p.current)
  }, [value])

  const apply = (newSm, newSy, newEm, newEy, newCurrent) => {
    const result = buildPeriode(newSm, newSy, newEm, newEy, newCurrent)
    if (result) onChange(result)
  }

  const displayValue = buildPeriode(sm, sy, em, ey, current)

  return (
    <div style={{ position: 'relative' }}>
      {/* Champ affichage */}
      <div onClick={() => setOpen(!open)}
        style={{ padding: '9px 12px', border: `1.5px solid ${open ? '#4f46e5' : '#e5e7eb'}`, borderRadius: '8px', fontSize: '13px', color: displayValue ? '#111' : '#9ca3af', cursor: 'pointer', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', transition: 'border-color 0.15s' }}>
        <span>{displayValue || placeholder}</span>
        <Calendar size={13} color="#9ca3af" />
      </div>

      {/* Popup */}
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200, background: '#fff', border: '1.5px solid #ede9fe', borderRadius: '12px', padding: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: '320px' }}>
          {/* Début */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Début</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <select value={sm} onChange={e => { setSm(e.target.value); apply(e.target.value, sy, em, ey, current) }}
                style={{ ...SEL, flex: 1 }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}>
                <option value="">Mois</option>
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={sy} onChange={e => { setSy(e.target.value); apply(sm, e.target.value, em, ey, current) }}
                style={{ ...SEL, flex: 1 }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}>
                <option value="">Année</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Fin */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Fin</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {!current && <>
                <select value={em} onChange={e => { setEm(e.target.value); apply(sm, sy, e.target.value, ey, current) }}
                  style={{ ...SEL, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}>
                  <option value="">Mois</option>
                  {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select value={ey} onChange={e => { setEy(e.target.value); apply(sm, sy, em, e.target.value, current) }}
                  style={{ ...SEL, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}>
                  <option value="">Année</option>
                  {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </>}
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px', color: '#374151', fontWeight: current ? '700' : '400' }}>
                <input type="checkbox" checked={current} onChange={e => {
                  setCurrent(e.target.checked)
                  apply(sm, sy, em, ey, e.target.checked)
                }} style={{ accentColor: '#4f46e5', width: '14px', height: '14px' }} />
                Aujourd'hui
              </label>
            </div>
          </div>

          {/* Résultat + bouton fermer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '12px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {displayValue ? <span style={{ color: '#4f46e5', fontWeight: '600' }}>{displayValue}</span> : 'Choisir une période'}
            </div>
            <button onClick={() => setOpen(false)}
              style={{ padding: '6px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
              OK
            </button>
          </div>
        </div>
      )}

      {/* Fermer en cliquant ailleurs */}
      {open && <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}
    </div>
  )
}
