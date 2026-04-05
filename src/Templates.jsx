import { useEffect } from 'react'
import { supabase } from './supabase'
import './App.css'
import { useNavigate } from 'react-router-dom'

const templates = [
  {
    id: 'finance',
    nom: 'Finance',
    description: 'Sobre et corporate, idéal pour la finance et le conseil',
    couleur: '#1a1a1a',
    badge: 'Populaire',
    style: 'classique'
  },
  {
    id: 'linkedin',
    nom: 'LinkedIn',
    description: 'Propre et moderne, reconnu par tous les recruteurs',
    couleur: '#0a66c2',
    badge: 'Tendance',
    style: 'header-color'
  },
  {
    id: 'canva',
    nom: 'Canva Pro',
    description: 'Sidebar sombre avec gradient rose, très visuel',
    couleur: '#f093fb',
    couleur2: '#f5576c',
    badge: 'Original',
    style: 'sidebar-dark'
  },
  {
    id: 'harvard',
    nom: 'Harvard',
    description: 'Style classique américain, Times New Roman élégant',
    couleur: '#A51C30',
    badge: 'Prestige',
    style: 'classique'
  },
  {
    id: 'siliconvalley',
    nom: 'Silicon Valley',
    description: 'Minimaliste et tech, inspiré du style Apple',
    couleur: '#1d1d1f',
    badge: 'Tech',
    style: 'minimal'
  },
  {
    id: 'moderne',
    nom: 'Moderne',
    description: 'Sidebar verte, moderne et professionnel',
    couleur: '#0f6e56',
    badge: 'Design',
    style: 'sidebar-color'
  },
  {
    id: 'executive',
    nom: 'Executive',
    description: 'Fond noir et or, luxueux et haut de gamme',
    couleur: '#c9a84c',
    couleurBg: '#0d0d0d',
    badge: 'Luxe',
    style: 'dark'
  },
  {
    id: 'creative',
    nom: 'Creative',
    description: 'Gradient violet, cards flottantes, pour les créatifs',
    couleur: '#667eea',
    couleur2: '#764ba2',
    badge: 'Créatif',
    style: 'sidebar-gradient'
  },
  {
    id: 'minimal',
    nom: 'Minimal',
    description: 'Ultra épuré, tout blanc, typographie aérée',
    couleur: '#111111',
    badge: 'Épuré',
    style: 'minimal'
  },
  {
    id: 'tech',
    nom: 'Tech',
    description: 'Dark sidebar, style développeur avec barres de compétences',
    couleur: '#22d3ee',
    couleurBg: '#0f172a',
    badge: 'Dev',
    style: 'dark'
  },
  {
    id: 'elegant',
    nom: 'Élégant',
    description: 'Sidebar beige crème, serif, idéal pour le consulting',
    couleur: '#c9a87a',
    couleurBg: '#2c2416',
    badge: 'Consulting',
    style: 'sidebar-dark'
  },
  {
    id: 'bold',
    nom: 'Bold',
    description: 'Header rouge impactant, mise en page dynamique',
    couleur: '#c0392b',
    badge: 'Impact',
    style: 'header-color'
  },
  {
    id: 'pastel',
    nom: 'Pastel',
    description: 'Violet doux et arrondi, parfait pour le RH et marketing',
    couleur: '#7c3aed',
    couleur2: '#c084fc',
    badge: 'RH',
    style: 'sidebar-gradient'
  },
  {
    id: 'corporate',
    nom: 'Corporate',
    description: 'Bleu marine et or, style grands groupes internationaux',
    couleur: '#1e3a5f',
    couleur2: '#f59e0b',
    badge: 'Grands groupes',
    style: 'header-color'
  },
  {
    id: 'swiss',
    nom: 'Swiss',
    description: 'Typographie Bauhaus stricte, grille rigoureuse',
    couleur: '#000000',
    badge: 'Bauhaus',
    style: 'minimal'
  },
  {
    id: 'timeline',
    nom: 'Timeline',
    description: 'Frise chronologique bleue, parcours mis en valeur',
    couleur: '#1e40af',
    couleur2: '#3b82f6',
    badge: 'Chronologique',
    style: 'header-color'
  },
]

// ─── Mini aperçu visuel pour chaque style ───────────────────
function TemplatePreview({ template }) {
  const c = template.couleur
  const c2 = template.couleur2 || template.couleur
  const bg = template.couleurBg || '#0d0d0d'

  // Style DARK (fond sombre : executive, tech, elegant)
  if (template.style === 'dark') {
    return (
      <div style={{ width: '100%', height: '160px', background: bg, borderRadius: '8px', overflow: 'hidden', padding: '14px 16px', boxSizing: 'border-box' }}>
        <div style={{ borderBottom: `1px solid ${c}`, paddingBottom: '8px', marginBottom: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '2px', color: c, textTransform: 'uppercase' }}>PRÉNOM NOM</div>
          <div style={{ fontSize: '7px', color: '#888', letterSpacing: '1px', marginTop: '2px' }}>Titre du poste</div>
          <div style={{ fontSize: '6px', color: '#666', marginTop: '4px' }}>email · téléphone · ville</div>
        </div>
        <div style={{ fontSize: '7px', fontWeight: '700', letterSpacing: '2px', color: c, marginBottom: '6px', textTransform: 'uppercase' }}>EXPÉRIENCES</div>
        {[1, 2].map(i => (
          <div key={i} style={{ paddingLeft: '8px', borderLeft: `1px solid #333`, marginBottom: '6px' }}>
            <div style={{ fontSize: '7px', fontWeight: '600', color: '#e8e8e8' }}>Poste {i} <span style={{ float: 'right', color: c, fontSize: '6px' }}>202{i}</span></div>
            <div style={{ fontSize: '6px', color: '#666', fontStyle: 'italic' }}>Entreprise · Ville</div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
          {['Compétence 1', 'Compétence 2', 'Compétence 3'].map((t, i) => (
            <span key={i} style={{ border: `1px solid #444`, color: '#bbb', padding: '1px 5px', fontSize: '6px', borderRadius: '2px' }}>{t}</span>
          ))}
        </div>
      </div>
    )
  }

  // Style SIDEBAR-DARK (sidebar sombre + contenu clair)
  if (template.style === 'sidebar-dark') {
    return (
      <div style={{ width: '100%', height: '160px', background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '42% 58%' }}>
        <div style={{ background: bg, padding: '12px 10px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: `${c}44`, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: c }}>JD</div>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '7px', fontWeight: '700', color: '#e8d9b8' }}>Jean Dupont</div>
            <div style={{ fontSize: '6px', color: c, fontStyle: 'italic' }}>Directeur</div>
          </div>
          <div style={{ fontSize: '6px', color: c, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Compétences</div>
          {['Finance', 'Excel', 'SAP'].map((s, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '6px', color: '#ccc', marginBottom: '1px' }}>{s}</div>
              <div style={{ height: '2px', background: '#333', borderRadius: '1px' }}><div style={{ height: '100%', width: `${80 - i * 10}%`, background: c, borderRadius: '1px' }}></div></div>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px' }}>
          <div style={{ fontSize: '7px', fontWeight: '700', color: c, borderBottom: `1px solid ${c}`, paddingBottom: '3px', marginBottom: '6px', textTransform: 'uppercase' }}>Expériences</div>
          {[1, 2].map(i => (
            <div key={i} style={{ marginBottom: '5px' }}>
              <div style={{ fontSize: '7px', fontWeight: '600' }}>Poste {i}</div>
              <div style={{ fontSize: '6px', color: c }}>Entreprise · 202{i}</div>
            </div>
          ))}
          <div style={{ fontSize: '7px', fontWeight: '700', color: c, borderBottom: `1px solid ${c}`, paddingBottom: '3px', marginBottom: '6px', marginTop: '6px', textTransform: 'uppercase' }}>Formation</div>
          <div style={{ fontSize: '7px', fontWeight: '600' }}>Master Finance</div>
          <div style={{ fontSize: '6px', color: '#888' }}>HEC Paris · 2020</div>
        </div>
      </div>
    )
  }

  // Style SIDEBAR-COLOR (sidebar couleur vive)
  if (template.style === 'sidebar-color') {
    return (
      <div style={{ width: '100%', height: '160px', background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '40% 60%' }}>
        <div style={{ background: c, padding: '10px 8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff' }}>JD</div>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '7px', fontWeight: '700', color: '#fff' }}>Jean Dupont</div>
            <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.75)' }}>Directeur</div>
          </div>
          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Contact</div>
          {['email', 'téléphone', 'Paris'].map((s, i) => (
            <div key={i} style={{ fontSize: '6px', color: 'rgba(255,255,255,0.85)', marginBottom: '2px' }}>{s}</div>
          ))}
          <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px', margin: '6px 0 4px' }}>Skills</div>
          {['Finance', 'Excel', 'SAP'].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.15)', padding: '2px 5px', borderRadius: '3px', fontSize: '6px', color: '#fff', marginBottom: '2px' }}>{s}</div>
          ))}
        </div>
        <div style={{ padding: '10px' }}>
          <div style={{ fontSize: '7px', fontWeight: '700', color: c, borderBottom: `2px solid ${c}`, paddingBottom: '3px', marginBottom: '6px' }}>EXPÉRIENCES</div>
          {[1, 2].map(i => (
            <div key={i} style={{ marginBottom: '5px' }}>
              <div style={{ fontSize: '7px', fontWeight: '600' }}>Poste {i} <span style={{ float: 'right', fontSize: '6px', color: '#aaa', background: '#f0fdf4', padding: '1px 4px', borderRadius: '8px' }}>202{i}</span></div>
              <div style={{ fontSize: '6px', color: c }}>Entreprise · Ville</div>
            </div>
          ))}
          <div style={{ fontSize: '7px', fontWeight: '700', color: c, borderBottom: `2px solid ${c}`, paddingBottom: '3px', marginBottom: '5px', marginTop: '6px' }}>FORMATION</div>
          <div style={{ fontSize: '7px', fontWeight: '600' }}>Master Finance</div>
          <div style={{ fontSize: '6px', color: '#888' }}>HEC Paris · 2020</div>
        </div>
      </div>
    )
  }

  // Style SIDEBAR-GRADIENT (gradient violet ou pastel)
  if (template.style === 'sidebar-gradient') {
    return (
      <div style={{ width: '100%', height: '160px', background: '#fafafa', borderRadius: '8px', overflow: 'hidden', display: 'grid', gridTemplateColumns: '40% 60%' }}>
        <div style={{ background: `linear-gradient(160deg, ${c}, ${c2})`, padding: '10px 8px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#fff', border: '2px solid rgba(255,255,255,0.4)' }}>JD</div>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '7px', fontWeight: '700', color: '#fff' }}>Jean Dupont</div>
            <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>Directeur</div>
          </div>
          {['Finance', 'Excel', 'SAP'].map((s, i) => (
            <div key={i} style={{ marginBottom: '4px' }}>
              <div style={{ fontSize: '6px', color: 'rgba(255,255,255,0.85)', marginBottom: '1px' }}>{s}</div>
              <div style={{ height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}><div style={{ height: '100%', width: `${80 - i * 10}%`, background: '#fff', borderRadius: '2px', opacity: 0.85 }}></div></div>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '7px' }}>
            <div style={{ width: '16px', height: '2px', background: `linear-gradient(90deg,${c},${c2})`, borderRadius: '1px' }}></div>
            <div style={{ fontSize: '7px', fontWeight: '700', color: '#333', textTransform: 'uppercase' }}>Expériences</div>
          </div>
          {[1, 2].map(i => (
            <div key={i} style={{ background: '#fff', borderRadius: '5px', padding: '5px 7px', marginBottom: '4px', border: '1px solid #f0f0f0' }}>
              <div style={{ fontSize: '7px', fontWeight: '600' }}>Poste {i} <span style={{ float: 'right', fontSize: '6px', color: c, background: `${c}15`, padding: '1px 4px', borderRadius: '8px' }}>202{i}</span></div>
              <div style={{ fontSize: '6px', color: c }}>Entreprise · Ville</div>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', margin: '6px 0 5px' }}>
            <div style={{ width: '16px', height: '2px', background: `linear-gradient(90deg,${c},${c2})`, borderRadius: '1px' }}></div>
            <div style={{ fontSize: '7px', fontWeight: '700', color: '#333', textTransform: 'uppercase' }}>Formation</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '5px', padding: '5px 7px', border: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: '7px', fontWeight: '600' }}>Master Finance</div>
            <div style={{ fontSize: '6px', color: '#888' }}>HEC Paris · 2020</div>
          </div>
        </div>
      </div>
    )
  }

  // Style HEADER-COLOR (header coloré pleine largeur)
  if (template.style === 'header-color') {
    return (
      <div style={{ width: '100%', height: '160px', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
        <div style={{ background: c, padding: '10px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>JD</div>
            <div>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#fff' }}>Jean Dupont</div>
              <div style={{ fontSize: '6px', color: `${c2 ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.75)'}`, letterSpacing: '0.5px' }}>Directeur Financier</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'right', fontSize: '6px', color: 'rgba(255,255,255,0.7)' }}>email<br />Paris</div>
          </div>
        </div>
        <div style={{ padding: '8px 14px', display: 'grid', gridTemplateColumns: '1fr 80px', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '7px', fontWeight: '700', color: c, borderBottom: `2px solid ${c}`, paddingBottom: '2px', marginBottom: '5px', textTransform: 'uppercase' }}>Expériences</div>
            {[1, 2].map(i => (
              <div key={i} style={{ marginBottom: '5px' }}>
                <div style={{ fontSize: '7px', fontWeight: '600' }}>Poste {i} <span style={{ float: 'right', fontSize: '6px', color: '#999' }}>202{i}</span></div>
                <div style={{ fontSize: '6px', color: c, fontWeight: '500' }}>Entreprise · Ville</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: '7px', fontWeight: '700', color: c, borderBottom: `2px solid ${c}`, paddingBottom: '2px', marginBottom: '5px', textTransform: 'uppercase' }}>Skills</div>
            {['Finance', 'Excel', 'SAP'].map((s, i) => (
              <div key={i} style={{ fontSize: '6px', color: '#444', padding: '2px 0', borderBottom: '1px solid #f5f5f5' }}>{s}</div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Style MINIMAL (épuré, Swiss, Silicon Valley)
  if (template.style === 'minimal') {
    return (
      <div style={{ width: '100%', height: '160px', background: '#fff', borderRadius: '8px', overflow: 'hidden', padding: '14px 16px', boxSizing: 'border-box' }}>
        <div style={{ marginBottom: '10px', borderBottom: template.id === 'swiss' ? '2px solid #000' : '1px solid #f0f0f0', paddingBottom: '8px' }}>
          <div style={{ fontSize: template.id === 'swiss' ? '13px' : '12px', fontWeight: template.id === 'swiss' ? '900' : '300', color: '#111', letterSpacing: template.id === 'swiss' ? '-0.5px' : '0' }}>
            Jean <strong style={{ fontWeight: '700' }}>Dupont</strong>
          </div>
          <div style={{ fontSize: '7px', color: '#aaa', marginTop: '2px' }}>Directeur Financier</div>
          <div style={{ fontSize: '6px', color: '#ccc', marginTop: '4px' }}>email · téléphone · Paris</div>
          {template.id === 'siliconvalley' && <div style={{ width: '20px', height: '1.5px', background: '#1d1d1f', marginTop: '6px' }}></div>}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: template.id === 'swiss' ? '40px 1fr' : '1fr', gap: '6px' }}>
          {template.id === 'swiss' ? (
            <>
              <div style={{ fontSize: '6px', color: '#999', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>EXP.</div>
              <div>
                {[1, 2].map(i => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '30px 1fr', gap: '5px', marginBottom: '4px', paddingBottom: '4px', borderBottom: '1px solid #f0f0f0' }}>
                    <div style={{ fontSize: '6px', color: '#aaa' }}>202{i}</div>
                    <div><div style={{ fontSize: '7px', fontWeight: '700' }}>Poste {i}</div><div style={{ fontSize: '6px', color: '#666' }}>Entreprise</div></div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '6px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: '#ccc', marginBottom: '6px' }}>Expériences</div>
              {[1, 2].map(i => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '35px 1fr', gap: '8px', marginBottom: '5px' }}>
                  <div style={{ fontSize: '6px', color: '#aaa' }}>202{i}</div>
                  <div><div style={{ fontSize: '7px', fontWeight: '600' }}>Poste {i}</div><div style={{ fontSize: '6px', color: '#aaa' }}>Entreprise</div></div>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '6px', borderTop: template.id === 'swiss' ? '1px solid #000' : 'none', paddingTop: template.id === 'swiss' ? '5px' : '0' }}>
          {['Finance', 'Excel', 'SAP'].map((s, i) => (
            <span key={i} style={{ border: `1px solid ${template.id === 'swiss' ? '#000' : '#e0e0e0'}`, padding: '1px 5px', fontSize: '6px', color: template.id === 'swiss' ? '#000' : '#555', borderRadius: template.id === 'swiss' ? '0' : '3px' }}>{s}</span>
          ))}
        </div>
      </div>
    )
  }

  // Style CLASSIQUE (Finance, Harvard) — défaut
  return (
    <div style={{ width: '100%', height: '160px', background: '#fff', borderRadius: '8px', overflow: 'hidden', padding: '12px 14px', boxSizing: 'border-box' }}>
      <div style={{ borderBottom: `2px solid ${c}`, paddingBottom: '8px', marginBottom: '8px', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c, fontFamily: template.id === 'harvard' ? 'Georgia,serif' : 'inherit' }}>JEAN DUPONT</div>
        <div style={{ fontSize: '7px', color: '#777', letterSpacing: '1px', marginTop: '2px' }}>Directeur Financier</div>
        <div style={{ fontSize: '6px', color: '#aaa', marginTop: '4px' }}>email · téléphone · Paris</div>
      </div>
      <div style={{ fontSize: '6px', fontWeight: '700', letterSpacing: '2px', textTransform: 'uppercase', color: c, borderBottom: `1px solid ${c}`, paddingBottom: '2px', marginBottom: '5px' }}>EXPÉRIENCES</div>
      {[1, 2].map(i => (
        <div key={i} style={{ marginBottom: '4px' }}>
          <div style={{ fontSize: '7px', fontWeight: '700' }}>Poste {i} <span style={{ float: 'right', fontSize: '6px', color: '#aaa', fontWeight: '400' }}>202{i}</span></div>
          <div style={{ fontSize: '6px', color: '#666', fontStyle: template.id === 'harvard' ? 'italic' : 'normal' }}>Entreprise · Ville</div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginTop: '6px' }}>
        {['Finance', 'Excel', 'SAP'].map((s, i) => (
          <span key={i} style={{ background: `${c}18`, border: `1px solid ${c}44`, padding: '1px 5px', fontSize: '6px', color: c, borderRadius: '2px' }}>{s}</span>
        ))}
      </div>
    </div>
  )
}

function Templates() {
  const navigate = useNavigate()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) window.location.href = '/auth'
    }
    checkUser()
  }, [])

  const choisirTemplate = (templateId) => {
    navigate(`/generate?template=${templateId}`)
  }

  return (
    <div className="templates-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
        <div className="nav-btns">
          <a href="/dashboard" className="btn-ghost">← Dashboard</a>
        </div>
      </nav>

      <div className="templates-wrap">
        <div className="templates-header">
          <div className="section-label">Templates</div>
          <h2 className="section-title">Choisis ton template<br /><em>de CV</em></h2>
          <p className="templates-sub">
            {templates.length} designs professionnels · Photo optionnelle · Aperçu en temps réel
          </p>
        </div>

        <div className="templates-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => choisirTemplate(template.id)}
            >
              {/* Aperçu visuel réel */}
              <div style={{ padding: '10px 10px 0', background: '#f7f8fc', borderRadius: '10px 10px 0 0' }}>
                <TemplatePreview template={template} />
              </div>

              {/* Infos */}
              <div className="template-info">
                <div className="template-top">
                  <div className="template-nom">{template.nom}</div>
                  <span className="template-badge" style={{ background: template.couleur + '15', color: template.couleur }}>
                    {template.badge}
                  </span>
                </div>
                <div className="template-desc">{template.description}</div>
                <button className="template-btn" style={{ background: template.couleur }}>
                  Choisir ce template →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Templates