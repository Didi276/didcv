import { useParams, Link } from 'react-router-dom'
import Navbar from './Navbar'
import { ARTICLES } from './blogData'

function renderMarkdown(text) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize: '22px', fontWeight: '800', color: '#111', margin: '32px 0 12px', letterSpacing: '-0.5px' }}>{line.slice(3)}</h2>
      if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '17px', fontWeight: '700', color: '#374151', margin: '24px 0 8px' }}>{line.slice(4)}</h3>
      if (line.startsWith('- ')) return <li key={i} style={{ fontSize: '15px', color: '#374151', lineHeight: '1.7', marginBottom: '4px' }}>{line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
      if (line.trim() === '') return <br key={i} />
      const processed = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`)
      return <p key={i} style={{ fontSize: '15px', color: '#374151', lineHeight: '1.8', margin: '0 0 12px' }} dangerouslySetInnerHTML={{ __html: processed }} />
    })
}

export default function BlogArticle() {
  const { slug } = useParams()
  const article = ARTICLES.find(a => a.slug === slug)

  if (!article) return (
    <div style={{ minHeight: '100vh', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Article introuvable</h1>
        <Link to="/blog" style={{ color: '#4f46e5' }}>Retour au blog</Link>
      </div>
    </div>
  )

  const autres = ARTICLES.filter(a => a.slug !== slug && a.categorie === article.categorie).slice(0, 3)

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar />

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '48px 24px' }}>
        <Link to="/blog" style={{ fontSize: '13px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginBottom: '32px' }}>
          ← Retour au blog
        </Link>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px', background: '#ede9fe', color: '#4f46e5' }}>{article.categorie}</span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{article.duree} de lecture</span>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>{new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 16px', letterSpacing: '-1px', lineHeight: '1.2' }}>{article.titre}</h1>
        <p style={{ fontSize: '17px', color: '#6b7280', margin: '0 0 40px', lineHeight: '1.7', borderBottom: '1px solid #f0f0f0', paddingBottom: '32px' }}>{article.description}</p>

        <div style={{ fontSize: '15px', lineHeight: '1.8', color: '#374151' }}>
          {renderMarkdown(article.contenu)}
        </div>

        {/* CTA */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '16px', padding: '32px', textAlign: 'center', marginTop: '48px' }}>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Créez votre CV maintenant</div>
          <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.75)', margin: '0 0 20px' }}>CV optimisé ATS généré par l'IA en 30 secondes</p>
          <Link to="/auth" style={{ display: 'inline-block', padding: '12px 28px', background: '#fff', color: '#4f46e5', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
            Commencer gratuitement →
          </Link>
        </div>

        {/* Articles liés */}
        {autres.length > 0 && (
          <div style={{ marginTop: '48px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '16px' }}>Articles similaires</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {autres.map(a => (
                <Link key={a.slug} to={`/blog/${a.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '14px 16px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #e5e7eb', transition: 'all 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#4f46e5'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{a.titre}</div>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '3px' }}>{a.duree} de lecture</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
