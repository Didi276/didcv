import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from './Navbar'
import SEO from './SEO'
import { ARTICLES, CATEGORIES } from './blogData'

export default function Blog() {
  const [categorie, setCategorie] = useState('')
  const articles = categorie ? ARTICLES.filter(a => a.categorie === categorie) : ARTICLES

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <SEO
        titre="Blog conseils carrière"
        description="Blog conseils carrière — CV, entretien, lettre de motivation, recherche d'emploi. Des guides pratiques pour réussir votre candidature."
        url="https://didcv.vercel.app/blog"
      />
      <Navbar />
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', fontWeight: '800', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Conseils carrière
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Guides pratiques pour booster votre recherche d'emploi
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 24px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {articles.map(article => (
            <Link key={article.slug} to={`/blog/${article.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px', height: '100%', boxSizing: 'border-box', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(79,70,229,0.1)'; e.currentTarget.style.borderColor = '#4f46e5' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px', background: '#ede9fe', color: '#4f46e5' }}>{article.categorie}</span>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>{article.duree}</span>
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 10px', lineHeight: '1.4', letterSpacing: '-0.2px' }}>{article.titre}</h2>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px', lineHeight: '1.6' }}>{article.description}</p>
                <div style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>Lire la suite →</div>
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
