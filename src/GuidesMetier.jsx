import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import SEO from './SEO'
import { GUIDES, SECTEURS } from './guidesData'

export default function GuidesMetier() {
  const [secteur, setSecteur] = useState('')
  const guides = secteur ? GUIDES.filter(g => g.secteur === secteur) : GUIDES

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <SEO
        titre="Exemples de CV par métier"
        description="Exemples de CV par métier — 24 guides professionnels gratuits avec compétences, missions types et conseils pour réussir votre candidature."
        url="https://didcv.vercel.app/guides"
      />
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg, #0f6e56, #059669)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Exemples de CV par métier
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Modèles et conseils spécialisés pour chaque secteur
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {guides.map(guide => (
            <Link key={guide.slug} to={`/guide/${guide.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '20px', transition: 'all 0.15s', display: 'flex', gap: '14px', alignItems: 'flex-start' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.1)'; e.currentTarget.style.borderColor = '#4f46e5' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb' }}>
                <div style={{ fontSize: '32px', flexShrink: 0 }}>{guide.icon}</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{guide.secteur}</div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#111', marginBottom: '6px', lineHeight: '1.3' }}>{guide.titre}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>{guide.description.substring(0, 80)}...</div>
                  <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600', marginTop: '8px' }}>Voir le guide →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
