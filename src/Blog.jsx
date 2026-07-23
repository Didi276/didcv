import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Calendar, Clock } from 'lucide-react'
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
const FALLBACK_COLORS = ['#6b7280', '#4b5563']

function coverColors(categorie) {
  return CATEGORY_COLORS[categorie] || FALLBACK_COLORS
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Cover({ article, height = '90px' }) {
  const [c1, c2] = coverColors(article.categorie)
  return (
    <div style={{ height, borderRadius: '10px', background: `linear-gradient(135deg, ${c1}, ${c2})`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15, background: 'radial-gradient(circle at 20% 20%, #fff 0%, transparent 50%)' }} />
      <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff', letterSpacing: '0.5px', textTransform: 'uppercase', opacity: 0.9 }}>{article.categorie}</span>
    </div>
  )
}

export default function Blog() {
  const [categorie, setCategorie] = useState('')
  const isMobile = useWidth() < 768
  const articles = categorie ? ARTICLES.filter(a => a.categorie === categorie) : ARTICLES
  const populaires = ARTICLES.slice(0, 3)

  const schema = {
    '@context': 'https://schema.org',
    '@graph': ARTICLES.map(a => ({
      '@type': 'BlogPosting',
      headline: a.titre,
      description: a.description,
      datePublished: a.date,
      url: `https://didcv.vercel.app/blog/${a.slug}`,
      author: { '@type': 'Organization', name: 'DidCV' },
    })),
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <SEO
        titre="Conseils CV et carrière — Blog DidCV"
        description="Guides pratiques pour rédiger votre CV, préparer vos entretiens et optimiser votre recherche d'emploi en France."
        url="https://didcv.vercel.app/blog"
        schema={schema}
      />
      <Navbar />
      <div style={{ position: 'relative', background: '#0a0a0f', overflow: 'hidden', padding: '48px 24px' }}>
        <div style={{ position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '300px', maxWidth: '100%', background: 'radial-gradient(circle, #4f46e520 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '700', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Conseils carrière
          </h1>
          <p style={{ fontSize: '16px', color: '#a1a1aa', margin: 0 }}>
            Guides pratiques pour booster votre recherche d'emploi
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '64px 24px 40px' : '96px 24px 40px' }}>

        {!categorie && populaires.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#111', margin: '0 0 16px', letterSpacing: '-0.3px' }}>
              Articles les plus populaires
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
              {populaires.map(article => (
                <Link key={article.slug} to={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px', height: '100%', boxSizing: 'border-box', transition: 'transform 0.15s, box-shadow 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 10px 28px rgba(79,70,229,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                    <Cover article={article} height="120px" />
                    <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#111', margin: '0 0 8px', lineHeight: '1.35', letterSpacing: '-0.2px' }}>{article.titre}</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px', lineHeight: '1.6' }}>{article.description}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#9ca3af' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {formatDate(article.date)}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} /> {article.duree}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {articles.map(article => (
            <Link key={article.slug} to={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px', height: '100%', boxSizing: 'border-box', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}>
                <Cover article={article} />
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 10px', lineHeight: '1.4', letterSpacing: '-0.2px' }}>{article.titre}</h2>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 14px', lineHeight: '1.6' }}>{article.description}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11px', color: '#9ca3af' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={11} /> {formatDate(article.date)}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={11} /> {article.duree}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#4f46e5', fontWeight: '600', whiteSpace: 'nowrap' }}>Lire <ChevronRight size={13} /></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <footer style={{ textAlign: 'center', padding: '40px', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#9ca3af' }}>
        <Link to="/" style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>DidCV</Link> — Créez votre CV optimisé ATS gratuitement
      </footer>
    </div>
  )
}
