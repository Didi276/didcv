import { useParams, Link } from 'react-router-dom'
import Navbar from './Navbar'
import { GUIDES } from './guidesData'

export default function GuideDetail() {
  const { slug } = useParams()
  const guide = GUIDES.find(g => g.slug === slug)

  if (!guide) return (
    <div style={{ minHeight: '100vh', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Guide introuvable</h1>
        <Link to="/guides" style={{ color: '#4f46e5' }}>Retour aux guides</Link>
      </div>
    </div>
  )

  const autres = GUIDES.filter(g => g.slug !== slug && g.secteur === guide.secteur).slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>
        <Link to="/guides" style={{ fontSize: '13px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginBottom: '32px' }}>
          ← Tous les guides métier
        </Link>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '48px' }}>{guide.icon}</span>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '1px' }}>{guide.secteur}</span>
            <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0f1a', margin: '4px 0 0', letterSpacing: '-1px', lineHeight: '1.1' }}>{guide.titre}</h1>
          </div>
        </div>
        <p style={{ fontSize: '17px', color: '#6b7280', margin: '0 0 40px', lineHeight: '1.7', borderBottom: '1px solid #f0f0f0', paddingBottom: '32px' }}>{guide.description}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
          <div style={{ background: '#f8f9ff', borderRadius: '14px', border: '1px solid #ede9fe', padding: '22px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#4f46e5', margin: '0 0 14px' }}>Compétences clés à mentionner</h2>
            {guide.competences.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: i < guide.competences.length - 1 ? '1px solid #ede9fe' : 'none' }}>
                <span style={{ color: '#4f46e5', fontWeight: '700', fontSize: '14px' }}>✓</span>
                <span style={{ fontSize: '13px', color: '#374151' }}>{c}</span>
              </div>
            ))}
          </div>
          <div style={{ background: '#f0fdf4', borderRadius: '14px', border: '1px solid #86efac', padding: '22px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#16a34a', margin: '0 0 14px' }}>Exemples de missions</h2>
            {guide.missions.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: '8px', padding: '5px 0', borderBottom: i < guide.missions.length - 1 ? '1px solid #86efac' : 'none', alignItems: 'flex-start' }}>
                <span style={{ color: '#16a34a', fontWeight: '700', flexShrink: 0 }}>→</span>
                <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>{m}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '14px', padding: '22px', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#92400e', margin: '0 0 10px' }}>💡 Conseils pour ce métier</h2>
          <p style={{ fontSize: '14px', color: '#92400e', margin: 0, lineHeight: '1.7' }}>{guide.conseils}</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '16px', padding: '32px', textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>
            Générez votre CV {guide.titre.replace('CV ', '')} maintenant
          </div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: '0 0 20px' }}>
            Template "{guide.template}" recommandé pour ce métier
          </p>
          <Link to={`/generate?template=${guide.template}`} style={{ display: 'inline-block', padding: '12px 28px', background: '#fff', color: '#4f46e5', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
            Créer mon CV gratuitement →
          </Link>
        </div>

        {autres.length > 0 && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '16px' }}>Autres métiers du même secteur</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {autres.map(g => (
                <Link key={g.slug} to={`/guide/${g.slug}`}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#f8f9ff', border: '1px solid #e5e7eb', borderRadius: '10px', textDecoration: 'none', fontSize: '13px', fontWeight: '600', color: '#374151', transition: 'all 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                  <span>{g.icon}</span> {g.titre}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
