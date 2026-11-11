import { useState, useEffect } from 'react'
import { Sparkles, MapPin, Building2, Loader2 } from 'lucide-react'
import { supabase } from './supabase'
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

function couleurScore(s) {
  if (s == null) return '#9ca3af'
  if (s >= 85) return '#16a34a'
  if (s >= 70) return '#0891b2'
  if (s >= 50) return '#c2410c'
  return '#9ca3af'
}

// Récupère les offres recommandées via /api/match (matching IA profil + CV).
function useMatches(limite) {
  const [etat, setEtat] = useState({ loading: true, offres: [], erreur: null, profilIncomplet: false })
  useEffect(() => {
    let annule = false
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { if (!annule) setEtat({ loading: false, offres: [], erreur: 'auth', profilIncomplet: false }); return }
      try {
        const res = await fetch(`/api/match?user_id=${user.id}`)
        const data = await res.json()
        if (annule) return
        const offres = data.offres || []
        const profilIncomplet = offres.length > 0 && offres.every(o => o.score == null)
        setEtat({ loading: false, offres: limite ? offres.slice(0, limite) : offres, erreur: null, profilIncomplet })
      } catch {
        if (!annule) setEtat({ loading: false, offres: [], erreur: 'reseau', profilIncomplet: false })
      }
    })()
    return () => { annule = true }
  }, [limite])
  return etat
}

function CarteOffre({ o, compact }) {
  return (
    <a href={o.url_candidature || '#'} target="_blank" rel="noopener noreferrer"
      style={{ display: 'block', textDecoration: 'none', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: compact ? '14px 16px' : '18px 20px', transition: 'box-shadow 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.15)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: compact ? '14px' : '15px', fontWeight: '700', color: '#111', marginBottom: '5px' }}>{o.titre}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {o.entreprise && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Building2 size={12} />{o.entreprise}</span>}
            {o.lieu && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} />{o.lieu}</span>}
            {o.type_contrat && <span>{o.type_contrat}</span>}
          </div>
        </div>
        {o.score != null && (
          <div style={{ flexShrink: 0, textAlign: 'center', minWidth: '44px' }}>
            <div style={{ fontSize: '20px', fontWeight: '800', color: couleurScore(o.score), lineHeight: 1 }}>{o.score}</div>
            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>match</div>
          </div>
        )}
      </div>
      {!compact && o.raison && (
        <div style={{ marginTop: '10px', fontSize: '12.5px', color: '#4f46e5', background: '#f5f5ff', borderRadius: '8px', padding: '8px 12px', lineHeight: 1.5 }}>
          {o.raison}
        </div>
      )}
    </a>
  )
}

function Spinner({ texte }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '28px', color: '#9ca3af', fontSize: '13px' }}>
      <Loader2 size={16} style={{ animation: 'spinpv 0.8s linear infinite' }} />
      <style>{'@keyframes spinpv{to{transform:rotate(360deg)}}'}</style>
      {texte}
    </div>
  )
}

// Aperçu compact pour le tableau de bord (top 3).
export function OffresPourVousApercu() {
  const { loading, offres, erreur } = useMatches(3)
  const w = useWidth()
  const isMobile = w < 768
  if (erreur === 'auth') return null

  return (
    <div style={{ maxWidth: '1200px', margin: '24px auto 0', padding: `0 ${isMobile ? '16px' : '40px'}` }}>
      <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: isMobile ? '16px' : '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#111' }}>
            <Sparkles size={15} color="#4f46e5" /> Offres pour vous
          </div>
          <a href="/offres-pour-vous" style={{ fontSize: '12px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>Voir tout →</a>
        </div>
        {loading
          ? <Spinner texte="On cherche les offres faites pour toi..." />
          : offres.length === 0
            ? <div style={{ fontSize: '13px', color: '#6b7280', padding: '6px 0' }}>Complète ton <a href="/profile" style={{ color: '#4f46e5', fontWeight: '600', textDecoration: 'none' }}>profil</a> pour recevoir des recommandations personnalisées.</div>
            : <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{offres.map(o => <CarteOffre key={o.id} o={o} compact />)}</div>
        }
      </div>
    </div>
  )
}

// Page dédiée complète.
export default function OffresPourVous() {
  const { loading, offres, erreur, profilIncomplet } = useMatches(null)
  const w = useWidth()
  const isMobile = w < 768

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="offres-pour-vous" />
      <div style={{ maxWidth: '920px', margin: '0 auto', padding: isMobile ? '24px 16px 60px' : '36px 40px 60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Sparkles size={24} color="#4f46e5" />
          <h1 style={{ fontSize: isMobile ? '24px' : '28px', fontWeight: '800', color: '#0f0f1a', margin: 0, letterSpacing: '-0.5px' }}>Offres pour vous</h1>
        </div>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 28px' }}>
          Une sélection personnalisée selon ton profil et tes CV, triée par pertinence.
        </p>

        {erreur === 'auth'
          ? <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>
              Connecte-toi pour voir les offres faites pour toi. <a href="/auth" style={{ color: '#4f46e5', fontWeight: '700', textDecoration: 'none' }}>Se connecter</a>
            </div>
          : loading
            ? <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}><Spinner texte="On analyse ton profil et on cherche les meilleures offres..." /></div>
            : offres.length === 0
              ? <div style={{ background: '#fff', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '28px', textAlign: 'center', fontSize: '14px', color: '#374151' }}>
                  Aucune offre à recommander pour l'instant. Complète ton <a href="/profile" style={{ color: '#4f46e5', fontWeight: '700', textDecoration: 'none' }}>profil</a> (poste recherché, secteurs, mobilité) pour affiner les recommandations.
                </div>
              : <>
                  {profilIncomplet && (
                    <div style={{ background: '#fffbeb', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.05)', borderRadius: '12px', padding: '14px 18px', marginBottom: '18px', fontSize: '13px', color: '#92400e' }}>
                      Ton profil est encore léger, voici les offres les plus récentes en attendant. Renseigne ton poste recherché et tes secteurs dans le <a href="/profile" style={{ color: '#b45309', fontWeight: '700' }}>profil</a> pour un vrai matching par score.
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {offres.map(o => <CarteOffre key={o.id} o={o} />)}
                  </div>
                </>
        }
      </div>
    </div>
  )
}
