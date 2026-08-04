import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, CheckCircle, ClipboardList } from 'lucide-react'
import Navbar from './Navbar'
import SEO from './SEO'
import { GUIDES, SECTEURS } from './guidesData'

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

const SECTEUR_COLORS = {
  'Finance': '#f0fdf4',
  'Tech': '#eff6ff',
  'Commerce': '#fff7ed',
  'Santé': '#fef2f2',
  'Management': '#f5f3ff',
  'RH': '#fdf4ff',
  'Marketing': '#fef9c3',
  'BTP': '#fef3c7',
  'Restauration': '#fff1f2',
  'Transport': '#ecfeff',
  'Beauté': '#fdf2f8',
  'Administratif': '#f3f4f6',
  'Juridique': '#eef2ff',
  'Éducation': '#f0fdfa',
  'Créatif': '#fdf4ff',
  'Industrie': '#f1f5f9',
}
const FALLBACK_BG = '#f8f9ff'

export default function GuidesMetier() {
  const [secteur, setSecteur] = useState('')
  const isMobile = useWidth() < 768
  const guides = secteur ? GUIDES.filter(g => g.secteur === secteur) : GUIDES

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <SEO
        titre="Exemples de CV par métier, guides gratuits DidJob"
        description="Exemples de CV par métier avec 24 guides professionnels gratuits, compétences, missions types et conseils pour réussir votre candidature."
        url="https://did-job.com/guides"
      />
      <Navbar />
      <div style={{ position: 'relative', background: '#0a0a0f', overflow: 'hidden', padding: '48px 24px' }}>
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', maxWidth: '100%', background: 'radial-gradient(circle, #4f46e520 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Exemples de CV par métier
          </h1>
          <p style={{ fontSize: '16px', color: '#a1a1aa', margin: 0 }}>
            Modèles et conseils spécialisés pour chaque secteur
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '64px 24px 40px' : '96px 24px 40px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <button onClick={() => setSecteur('')}
            style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: !secteur ? '#4f46e5' : '#f3f4f6', color: !secteur ? '#fff' : '#374151' }}>
            Tous les métiers
          </button>
          {SECTEURS.map(s => (
            <button key={s} onClick={() => setSecteur(s === secteur ? '' : s)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: secteur === s ? '#4f46e5' : '#f3f4f6', color: secteur === s ? '#fff' : '#374151' }}>
              {s}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {guides.map(guide => {
            const bg = SECTEUR_COLORS[guide.secteur] || FALLBACK_BG
            return (
              <Link key={guide.slug} to={`/guide/${guide.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: bg, borderRadius: '16px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px', transition: 'transform 0.15s, box-shadow 0.15s', display: 'flex', gap: '16px', alignItems: 'flex-start', height: '100%', boxSizing: 'border-box' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                  <div style={{ fontSize: '40px', flexShrink: 0 }}>{guide.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '5px' }}>{guide.secteur}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#111', marginBottom: '8px', lineHeight: '1.3' }}>{guide.titre}</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.55', marginBottom: '12px' }}>{guide.description.substring(0, 90)}...</div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '10px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#374151', background: 'rgba(255,255,255,0.7)', padding: '3px 9px', borderRadius: '20px' }}>
                        <CheckCircle size={11} /> {guide.competences.length} compétences
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', color: '#374151', background: 'rgba(255,255,255,0.7)', padding: '3px 9px', borderRadius: '20px' }}>
                        <ClipboardList size={11} /> {guide.missions.length} missions
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4f46e5', fontWeight: '700' }}>Voir le guide <ChevronRight size={13} /></div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
