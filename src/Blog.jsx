import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import SEO from './SEO'
import { ARTICLES, CATEGORIES } from './blogData'

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

const CATEGORY_COLORS = {
  'CV': ['#4f46e5', '#7c3aed'],
  'ATS': ['#0891b2', '#0e7490'],
  'Lettre': ['#db2777', '#be185d'],
  'Étudiant': ['#16a34a', '#15803d'],
  'Alternance': ['#ea580c', '#c2410c'],
  'Entretien': ['#7c3aed', '#6d28d9'],
  'Reconversion': ['#ca8a04', '#a16207'],
  'Cadre': ['#1e3a8a', '#1e40af'],
  'International': ['#059669', '#047857'],
  "Recherche d'emploi": ['#dc2626', '#b91c1c'],
}
const CATEGORY_EMOJI = {
  'CV': '📄',
  'ATS': '🎯',
  'Lettre': '✉️',
  'Étudiant': '🎓',
  'Alternance': '🤝',
  'Entretien': '💬',
  'Reconversion': '🔄',
  'Cadre': '💼',
  'International': '🌍',
  "Recherche d'emploi": '🔍',
}
const FALLBACK_COLORS = ['#6b7280', '#4b5563']

function coverColors(categorie) {
  return CATEGORY_COLORS[categorie] || FALLBACK_COLORS
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

const CLAMP = (lignes) => ({
  display: '-webkit-box',
  WebkitLineClamp: lignes,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
})

function ArticleCard({ article }) {
  const [c1, c2] = coverColors(article.categorie)
  return (
    <Link to={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
      <div style={{
        borderRadius: '12px', overflow: 'hidden', border: '1px solid #f0f0f0',
        background: '#fff', height: '100%', boxSizing: 'border-box',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
        <div style={{
          height: '200px', background: `linear-gradient(135deg, ${c1}, ${c2})`,
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '48px' }}>{CATEGORY_EMOJI[article.categorie] || '📰'}</span>
          <span style={{
            position: 'absolute', top: '16px', left: '16px',
            padding: '4px 10px', borderRadius: '20px',
            background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '11px', fontWeight: '700',
          }}>
            {article.categorie}
          </span>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '8px' }}>
            {article.duree} de lecture
          </div>
          <h2 style={{
            fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif',
            fontSize: '18px', fontWeight: '600', color: '#0f0f1a',
            lineHeight: '1.4', margin: '0 0 8px', ...CLAMP(2),
          }}>
            {article.titre}
          </h2>
          <p style={{
            fontFamily: '"Satoshi","Inter",system-ui,sans-serif',
            fontSize: '13px', color: '#6b7280', lineHeight: '1.6', margin: '0 0 16px', ...CLAMP(3),
          }}>
            {article.description}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{formatDate(article.date)}</span>
            <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '700' }}>Lire →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function Blog() {
  const [categorie, setCategorie] = useState('')
  const isMobile = useWidth() < 768
  const articles = categorie ? ARTICLES.filter(a => a.categorie === categorie) : ARTICLES

  const schema = {
    '@context': 'https://schema.org',
    '@graph': ARTICLES.map(a => ({
      '@type': 'BlogPosting',
      headline: a.titre,
      description: a.description,
      datePublished: a.date,
      url: `https://did-job.com/blog/${a.slug}`,
      author: { '@type': 'Organization', name: 'DidJob' },
    })),
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <SEO
        titre="Conseils CV et carrière du blog DidJob"
        description="Guides pratiques pour rédiger votre CV, préparer vos entretiens et optimiser votre recherche d'emploi en France."
        url="https://did-job.com/blog"
        schema={schema}
      />
      <Navbar currentPage="blog" />

      {/* HERO */}
      <div style={{ background: '#0a0a0f', padding: '80px 24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', maxWidth: '100%', background: 'radial-gradient(circle, #4f46e520 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{
            fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif',
            fontSize: isMobile ? '32px' : '48px', fontWeight: '700', color: '#ffffff',
            margin: '0 0 16px', letterSpacing: '-1px',
          }}>
            Guides & Conseils carrière
          </h1>
          <p style={{
            fontFamily: '"Satoshi","Inter",system-ui,sans-serif',
            fontSize: '18px', color: 'rgba(255,255,255,0.6)', margin: 0,
          }}>
            Nos meilleurs conseils pour booster votre recherche d'emploi
          </p>
        </div>
      </div>

      {/* FILTRES */}
      <div style={{ background: '#fff', padding: isMobile ? '20px 16px' : '20px 40px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '1200px', margin: '0 auto' }}>
          <button onClick={() => setCategorie('')}
            style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: !categorie ? '#4f46e5' : '#f3f4f6', color: !categorie ? '#fff' : '#374151' }}>
            Tous
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategorie(c === categorie ? '' : c)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: categorie === c ? '#4f46e5' : '#f3f4f6', color: categorie === c ? '#fff' : '#374151' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* GRILLE */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)',
        gap: '24px', padding: isMobile ? '40px 16px' : '40px',
        maxWidth: '1200px', margin: '0 auto',
      }}>
        {articles.map(article => <ArticleCard key={article.slug} article={article} />)}
      </div>

      {articles.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px' }}>
          Aucun article dans cette catégorie.
        </div>
      )}

      <footer style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#9ca3af' }}>
        <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>DidJob</Link>, créez votre CV optimisé ATS gratuitement
      </footer>
    </div>
  )
}
