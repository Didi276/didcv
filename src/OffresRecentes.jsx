import { useState, useEffect } from 'react'
import { Layers, MapPin, Building2, Check, X } from 'lucide-react'
import { supabase } from './supabase'

const CLE = 'offres_cliquees'
const MAX = 12

// Appelé depuis Offres.jsx quand l'utilisateur ouvre/consulte une offre.
export function enregistrerOffreCliquee(offre) {
  if (!offre) return
  try {
    const liste = lire()
    const idRef = offre.id || offre.url
    const sansDoublon = liste.filter(o => (o.id || o.url) !== idRef)
    const entree = {
      id: offre.id,
      titre: offre.titre || '',
      entreprise: offre.entreprise || '',
      lieu: offre.lieu || '',
      url: offre.url || '',
      type: offre.type || offre.type_contrat || '',
      salaire: offre.salaire || '',
      vueLe: Date.now(),
    }
    ecrire([entree, ...sansDoublon].slice(0, MAX))
  } catch { /* localStorage indisponible */ }
}

function lire() {
  try { return JSON.parse(localStorage.getItem(CLE) || '[]') } catch { return [] }
}
function ecrire(liste) {
  try {
    localStorage.setItem(CLE, JSON.stringify(liste))
    window.dispatchEvent(new Event('offres-recentes-maj'))
  } catch { /* ignore */ }
}

export default function OffresRecentes() {
  const [liste, setListe] = useState([])
  const [traitees, setTraitees] = useState({}) // id -> 'postule' | 'rejete'
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  useEffect(() => {
    const maj = () => setListe(lire())
    maj()
    window.addEventListener('offres-recentes-maj', maj)
    const rs = () => setW(window.innerWidth)
    window.addEventListener('resize', rs)
    return () => {
      window.removeEventListener('offres-recentes-maj', maj)
      window.removeEventListener('resize', rs)
    }
  }, [])

  const isMobile = w < 768
  const visibles = liste.filter(o => traitees[o.id] !== 'parti')
  if (!visibles.length) return null

  const retirer = (id) => ecrire(lire().filter(o => o.id !== id))

  const aPostuler = async (offre) => {
    if (traitees[offre.id]) return
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
    if (error) return
    setTraitees(t => ({ ...t, [offre.id]: 'postule' }))
    setTimeout(() => { setTraitees(t => ({ ...t, [offre.id]: 'parti' })); retirer(offre.id) }, 900)
  }

  const pasInteresse = (offre) => {
    if (traitees[offre.id]) return
    setTraitees(t => ({ ...t, [offre.id]: 'rejete' }))
    setTimeout(() => { setTraitees(t => ({ ...t, [offre.id]: 'parti' })); retirer(offre.id) }, 600)
  }

  const toutEffacer = () => {
    ecrire([])
    setTraitees({})
  }

  return (
    <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', padding: isMobile ? '16px' : '18px 22px', marginBottom: '22px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '800', color: '#111' }}>
          <Layers size={16} color="#4f46e5" /> À trier
        </div>
        <button onClick={toutEffacer} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}>Tout effacer</button>
      </div>
      <p style={{ fontSize: '12.5px', color: '#6b7280', margin: '0 0 14px' }}>
        Les offres que tu as consultées. Classe-les en « à postuler » ou « pas intéressé ».
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {visibles.map(offre => {
          const etat = traitees[offre.id]
          return (
            <div key={offre.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                background: etat === 'postule' ? '#f0fdf4' : etat === 'rejete' ? '#f9fafb' : '#f8f9ff',
                opacity: etat === 'rejete' ? 0.6 : 1,
                transition: 'background 0.2s, opacity 0.2s',
              }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <a href={offre.url || '#'} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: '13.5px', fontWeight: '700', color: '#111', textDecoration: 'none', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {offre.titre}
                </a>
                <div style={{ fontSize: '11.5px', color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '2px' }}>
                  {offre.entreprise && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><Building2 size={11} />{offre.entreprise}</span>}
                  {offre.lieu && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} />{offre.lieu}</span>}
                </div>
              </div>

              {etat === 'postule'
                ? <span style={{ fontSize: '12px', fontWeight: '700', color: '#16a34a', whiteSpace: 'nowrap' }}>Ajoutée ✓</span>
                : etat === 'rejete'
                  ? <span style={{ fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>Retirée</span>
                  : (
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button onClick={() => aPostuler(offre)} title="À postuler"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '7px 10px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                        <Check size={13} />{!isMobile && ' À postuler'}
                      </button>
                      <button onClick={() => pasInteresse(offre)} title="Pas intéressé"
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '7px 9px', background: '#f3f4f6', color: '#6b7280', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                        <X size={14} />
                      </button>
                    </div>
                  )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
