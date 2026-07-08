import Navbar from './Navbar'
import './App.css'

const TEMPLATES = [
  // ── Classiques ──────────────────────────────────────────
  { id: 'finance',       name: 'Finance',        desc: 'Élégant noir et blanc, style cabinet',      color: '#1a1a1a', emoji: '💼', tag: 'Classique'     },
  { id: 'harvard',       name: 'Harvard',         desc: 'Sobre et académique, style ivy league',     color: '#A51C30', emoji: '🎓', tag: 'Classique'     },
  { id: 'classique',     name: 'Classique',       desc: 'CV traditionnel français, sobre et clair',  color: '#374151', emoji: '📄', tag: 'Classique'     },
  { id: 'swiss',         name: 'Swiss',           desc: 'Design helvétique, typographie Helvetica',  color: '#111',    emoji: '🇨🇭', tag: 'Classique'    },
  { id: 'minimal',       name: 'Minimal',         desc: 'Ultra épuré, beaucoup d\'espace blanc',    color: '#9ca3af', emoji: '⬜', tag: 'Classique'     },
  { id: 'executive',     name: 'Executive',       desc: 'Fond sombre doré, pour cadres dirigeants', color: '#c9a84c', emoji: '⭐', tag: 'Premium'       },

  // ── Modernes ────────────────────────────────────────────
  { id: 'linkedin',      name: 'LinkedIn',        desc: 'Bleu LinkedIn, moderne et professionnel',   color: '#0a66c2', emoji: '🔵', tag: 'Moderne'       },
  { id: 'siliconvalley', name: 'Silicon Valley',  desc: 'Style Apple, propre et minimaliste',        color: '#1d1d1f', emoji: '🍎', tag: 'Moderne'       },
  { id: 'moderne',       name: 'Moderne',         desc: 'Vert foncé, bicolore élégant',              color: '#0f6e56', emoji: '🌿', tag: 'Moderne'       },
  { id: 'corporate',     name: 'Corporate',       desc: 'Bleu marine professionnel, badges titre',   color: '#1e3a5f', emoji: '🏢', tag: 'Moderne'       },
  { id: 'timeline',      name: 'Timeline',        desc: 'Frise chronologique, parcours visuel',      color: '#1e40af', emoji: '⏱️', tag: 'Moderne'      },
  { id: 'startup',       name: 'Startup',         desc: 'Fond sombre marine, style tech moderne',    color: '#38bdf8', emoji: '🚀', tag: 'Tech'          },

  // ── Créatifs ────────────────────────────────────────────
  { id: 'canva',         name: 'Canva',           desc: 'Dégradé rose violet, sidebar sombre',       color: '#f093fb', emoji: '🎨', tag: 'Créatif'       },
  { id: 'creative',      name: 'Creative',        desc: 'Dégradé purple, cartes ombrées',            color: '#667eea', emoji: '✨', tag: 'Créatif'       },
  { id: 'portfolio',     name: 'Portfolio',       desc: 'Fond noir, accents dégradés, pour artistes',color: '#f093fb', emoji: '🖼️', tag: 'Créatif'      },
  { id: 'pastel',        name: 'Pastel',          desc: 'Violet pastel, badges arrondis doux',       color: '#7c3aed', emoji: '🌸', tag: 'Créatif'       },

  // ── Spécialisés ─────────────────────────────────────────
  { id: 'etudiant',      name: 'Étudiant',        desc: 'Formations en premier, idéal sans expérience', color: '#4f46e5', emoji: '🎓', tag: 'Junior'     },
  { id: 'alternance',    name: 'Alternance',      desc: 'Orange, parfait pour recherche d\'alternance', color: '#ea580c', emoji: '🔄', tag: 'Junior'     },
  { id: 'sante',         name: 'Santé',           desc: 'Teal médical, certifications en avant',    color: '#0d9488', emoji: '🏥', tag: 'Santé'          },
  { id: 'commercial',    name: 'Commercial',      desc: 'Rouge impact, résultats et chiffres mis en avant', color: '#dc2626', emoji: '📈', tag: 'Vente'  },
  { id: 'international', name: 'International',   desc: 'Bleu marine + or, candidatures à l\'étranger', color: '#1e3a5f', emoji: '🌍', tag: 'International'},

  // ── Autres ──────────────────────────────────────────────
  { id: 'tech',          name: 'Tech',            desc: 'Fond sombre terminal, pour développeurs',   color: '#22d3ee', emoji: '💻', tag: 'Tech'          },
  { id: 'elegant',       name: 'Élégant',         desc: 'Tons chauds dorés, raffiné et distingué',  color: '#c9a87a', emoji: '🥂', tag: 'Premium'       },
  { id: 'bold',          name: 'Bold',            desc: 'Rouge audacieux, typographie puissante',    color: '#c0392b', emoji: '💪', tag: 'Impact'        },
]

const TAG_COLORS = {
  'Classique':     { bg: '#f3f4f6', color: '#374151' },
  'Moderne':       { bg: '#eff6ff', color: '#1d4ed8' },
  'Créatif':       { bg: '#fdf4ff', color: '#7e22ce' },
  'Junior':        { bg: '#eff0ff', color: '#4338ca' },
  'Tech':          { bg: '#f0fdfa', color: '#0f766e' },
  'Santé':         { bg: '#f0fdfa', color: '#0d9488' },
  'Vente':         { bg: '#fef2f2', color: '#b91c1c' },
  'Premium':       { bg: '#fffbeb', color: '#92400e' },
  'International': { bg: '#eff6ff', color: '#1e40af' },
  'Impact':        { bg: '#fef2f2', color: '#991b1b' },
}

const FILTRES = ['Tous', 'Classique', 'Moderne', 'Créatif', 'Junior', 'Tech', 'Santé', 'Vente', 'Premium', 'International']

export default function Templates() {
  const [filtre, setFiltre] = window.React ? window.React.useState('Tous') : [null, () => {}]

  // Utilise useState depuis React (importé dans main.jsx)
  const [selectedFiltre, setSelectedFiltre] = (typeof window !== 'undefined' && window.__REACT_USE_STATE)
    ? window.__REACT_USE_STATE('Tous')
    : (() => { let v = 'Tous'; return [v, (nv) => { v = nv }] })()

  return (
    <div style={{ minHeight: '100vh', background: '#f8faff' }}>
      <Navbar currentPage="generate" />

      {/* Hero */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7ef', padding: '36px 60px 28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          Choisis ton template
        </h1>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: '0 0 24px' }}>
          24 templates professionnels pour tous les profils et tous les secteurs
        </p>

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {FILTRES.map(f => (
            <a
              key={f}
              href={`?filtre=${f}`}
              style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '500',
                textDecoration: 'none', cursor: 'pointer',
                background: '#f3f4f6', color: '#374151',
                border: '1px solid #e5e7ef',
              }}
            >
              {f}
            </a>
          ))}
        </div>
      </div>

      {/* Grille */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {TEMPLATES.map(t => {
            const tagStyle = TAG_COLORS[t.tag] || { bg: '#f3f4f6', color: '#374151' }
            return (
              <a
                key={t.id}
                href={`/generate?template=${t.id}`}
                style={{ textDecoration: 'none' }}
              >
                <div style={{
                  background: '#fff', border: '1px solid #e5e7ef', borderRadius: '14px',
                  overflow: 'hidden', transition: 'transform 0.15s, box-shadow 0.15s',
                  cursor: 'pointer',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Bande couleur + aperçu */}
                  <div style={{
                    height: '90px', background: `linear-gradient(135deg, ${t.color}22, ${t.color}44)`,
                    borderBottom: `3px solid ${t.color}`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', position: 'relative'
                  }}>
                    <div style={{ fontSize: '40px' }}>{t.emoji}</div>
                    {/* Tag */}
                    <div style={{
                      position: 'absolute', top: '10px', right: '10px',
                      background: tagStyle.bg, color: tagStyle.color,
                      padding: '2px 8px', borderRadius: '10px', fontSize: '10px', fontWeight: '600'
                    }}>
                      {t.tag}
                    </div>
                  </div>

                  {/* Infos */}
                  <div style={{ padding: '16px 18px 18px' }}>
                    <div style={{ fontWeight: '700', fontSize: '15px', color: '#111', marginBottom: '4px' }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5', marginBottom: '14px' }}>
                      {t.desc}
                    </div>
                    <div style={{
                      display: 'block', width: '100%', padding: '8px',
                      background: t.color, color: '#fff', borderRadius: '8px',
                      fontSize: '13px', fontWeight: '600', textAlign: 'center',
                    }}>
                      Utiliser ce template →
                    </div>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}