import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Clock, Share2, Link as LinkIcon, Check } from 'lucide-react'
import Navbar from './Navbar'
import SEO from './SEO'
import { ARTICLES } from './blogData'

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function extraireTableDesMatieres(contenu) {
  return contenu.split('\n')
    .filter(line => line.startsWith('## '))
    .map(line => { const texte = line.slice(3).trim(); return { texte, id: slugify(texte) } })
}

function renderMarkdown(text) {
  return text
    .split('\n')
    .map((line, i) => {
      if (line.startsWith('## ')) {
        const texte = line.slice(3).trim()
        return <h2 key={i} id={slugify(texte)} style={{ fontSize: '22px', fontWeight: '800', color: '#111', margin: '32px 0 12px', letterSpacing: '-0.5px', scrollMarginTop: '90px' }}>{texte}</h2>
      }
      if (line.startsWith('### ')) return <h3 key={i} style={{ fontSize: '17px', fontWeight: '700', color: '#374151', margin: '24px 0 8px' }}>{line.slice(4)}</h3>
      if (line.startsWith('- ')) return <li key={i} style={{ fontSize: '16px', color: '#374151', lineHeight: '1.9', marginBottom: '4px' }}>{line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>
      if (line.trim() === '') return <br key={i} />
      const processed = line.replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong>${m}</strong>`)
      return <p key={i} style={{ fontSize: '16px', color: '#374151', lineHeight: '1.9', margin: '0 0 14px' }} dangerouslySetInnerHTML={{ __html: processed }} />
    })
}

export default function BlogArticle() {
  const { slug } = useParams()
  const article = ARTICLES.find(a => a.slug === slug)
  const [lienCopie, setLienCopie] = useState(false)

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
  const url = `https://didcv.vercel.app/blog/${article.slug}`
  const sommaire = extraireTableDesMatieres(article.contenu)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.titre,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: { '@type': 'Organization', name: 'DidCV' },
    publisher: { '@type': 'Organization', name: 'DidCV' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  }

  const partagerLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer')
  }

  const copierLeLien = () => {
    navigator.clipboard.writeText(url)
    setLienCopie(true)
    setTimeout(() => setLienCopie(false), 2000)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <SEO
        titre={article.titre}
        description={article.description}
        url={url}
        schema={schema}
      />
      <Navbar />

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>
        <Link to="/blog" style={{ fontSize: '13px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', display: 'inline-block', marginBottom: '32px' }}>
          ← Retour au blog
        </Link>

        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px', background: '#ede9fe', color: '#4f46e5' }}>{article.categorie}</span>
          <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {article.duree} de lecture</span>
          <span style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {new Date(article.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 16px', letterSpacing: '-1px', lineHeight: '1.2' }}>{article.titre}</h1>
        <p style={{ fontSize: '17px', color: '#6b7280', margin: '0 0 24px', lineHeight: '1.7' }}>{article.description}</p>

        {/* Boutons de partage */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', paddingBottom: '32px', borderBottom: '1px solid #f0f0f0' }}>
          <button onClick={partagerLinkedIn}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0a66c2', color: '#fff', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
            <Share2 size={14} /> Partager sur LinkedIn
          </button>
          <button onClick={copierLeLien}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: lienCopie ? '#16a34a' : '#f3f4f6', color: lienCopie ? '#fff' : '#374151', border: 'none', borderRadius: '9px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.2s' }}>
            {lienCopie ? <Check size={14} /> : <LinkIcon size={14} />} {lienCopie ? 'Lien copié !' : 'Copier le lien'}
          </button>
        </div>

        {/* Table des matières */}
        {sommaire.length > 1 && (
          <div style={{ background: '#f8f9ff', border: '1px solid #ede9fe', borderRadius: '12px', padding: '20px 24px', marginBottom: '36px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Sommaire</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sommaire.map(item => (
                <a key={item.id} href={`#${item.id}`}
                  style={{ fontSize: '14px', color: '#374151', textDecoration: 'none', fontWeight: '500' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#4f46e5'}
                  onMouseLeave={e => e.currentTarget.style.color = '#374151'}>
                  {item.texte}
                </a>
              ))}
            </div>
          </div>
        )}

        <div style={{ fontSize: '16px', lineHeight: '1.9', color: '#374151' }}>
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
