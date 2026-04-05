import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { CVTemplate } from './CVTemplates'
import { useNavigate } from 'react-router-dom'
import './App.css'

// ─── Photos libres de droits (Unsplash) ─────────────────────
// Chaque template a une personne différente pour montrer la diversité
const PHOTOS = {
  femme1: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face',
  femme2: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face',
  femme3: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face',
  homme1: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
  homme2: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
  homme3: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
  femme4: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
  homme4: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&h=200&fit=crop&crop=face',
}

// ─── CV de démo — une personne différente par template ───────
const makeCV = (prenom, nom, titre, photoKey, entreprise1, entreprise2) => ({
  prenom,
  nom,
  titre,
  email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@email.com`,
  telephone: '+33 6 12 34 56 78',
  ville: 'Paris',
  linkedin: `linkedin.com/in/${prenom.toLowerCase()}${nom.toLowerCase()}`,
  photo: PHOTOS[photoKey],
  accroche: `Expert${titre.includes('Directrice') || titre.includes('Responsable') ? 'e' : ''} en ${titre.toLowerCase()} avec 8 ans d'expérience dans des environnements internationaux, reconnu${titre.includes('Directrice') ? 'e' : ''} pour ses résultats concrets.`,
  experiences: [
    {
      poste: titre,
      entreprise: entreprise1,
      periode: '2021 – Présent',
      lieu: 'Paris',
      missions: [
        `Pilotage d'une équipe de 12 personnes et budget de 5M€`,
        `Augmentation des performances de 140% en 18 mois`,
        `Déploiement de la stratégie sur 8 marchés européens`
      ]
    },
    {
      poste: 'Chef de Projet Senior',
      entreprise: entreprise2,
      periode: '2018 – 2021',
      lieu: 'Paris',
      missions: [
        `Gestion de projets stratégiques à fort impact`,
        `ROI moyen de 320% sur les initiatives clés`,
        `Management transversal de 20+ parties prenantes`
      ]
    },
    {
      poste: 'Consultant',
      entreprise: 'McKinsey & Company',
      periode: '2016 – 2018',
      lieu: 'Paris',
      missions: [
        'Accompagnement de clients Fortune 500',
        'Livrables stratégiques à haute valeur ajoutée',
        'Formation et mentorat des équipes juniors'
      ]
    }
  ],
  formations: [
    { diplome: 'MBA Finance & Stratégie', etablissement: 'HEC Paris', periode: '2014 – 2016', mention: 'Mention Très Bien' },
    { diplome: 'Master en Économie', etablissement: 'Sciences Po Paris', periode: '2011 – 2014', mention: 'Major de promotion' }
  ],
  competences: ['Leadership', 'Stratégie', 'Data Analysis', 'Management', 'Excel', 'PowerPoint', 'Gestion de projet', 'Anglais C2'],
  langues: [
    { langue: 'Français', niveau: 'Natif' },
    { langue: 'Anglais', niveau: 'C2 — Courant' },
    { langue: 'Espagnol', niveau: 'B2' }
  ],
  atouts: ['Leadership', 'Analytique', 'International', 'Innovant']
})

// ─── Templates avec leur CV de démo dédié ───────────────────
const TEMPLATES = [
  {
    id: 'finance',
    nom: 'Finance',
    badge: '⭐ Populaire',
    couleur: '#1a1a1a',
    cv: makeCV('Thomas', 'Bernard', 'Directeur Financier', 'homme1', 'BNP Paribas', 'Société Générale')
  },
  {
    id: 'linkedin',
    nom: 'LinkedIn',
    badge: '🔥 Tendance',
    couleur: '#0a66c2',
    cv: makeCV('Sophie', 'Martin', 'Directrice Marketing', 'femme1', "L'Oréal Paris", 'LVMH')
  },
  {
    id: 'moderne',
    nom: 'Moderne',
    badge: '✨ Design',
    couleur: '#0f6e56',
    cv: makeCV('Léa', 'Dubois', 'Responsable RH', 'femme2', 'Airbus', 'Total Énergies')
  },
  {
    id: 'executive',
    nom: 'Executive',
    badge: '👑 Luxe',
    couleur: '#c9a84c',
    cv: makeCV('Alexandre', 'Moreau', 'Directeur Général', 'homme2', 'Hermès', 'LVMH')
  },
  {
    id: 'creative',
    nom: 'Creative',
    badge: '🎨 Créatif',
    couleur: '#667eea',
    cv: makeCV('Camille', 'Petit', 'Directrice Artistique', 'femme3', 'Publicis', 'Havas')
  },
  {
    id: 'siliconvalley',
    nom: 'Silicon Valley',
    badge: '💻 Tech',
    couleur: '#1d1d1f',
    cv: makeCV('Lucas', 'Roux', 'Engineering Manager', 'homme3', 'Google', 'Meta')
  },
  {
    id: 'minimal',
    nom: 'Minimal',
    badge: '◻ Épuré',
    couleur: '#444444',
    cv: makeCV('Marie', 'Leroy', 'Architecte Senior', 'femme4', 'Vinci', 'Bouygues')
  },
  {
    id: 'corporate',
    nom: 'Corporate',
    badge: '🏢 Pro',
    couleur: '#1e3a5f',
    cv: makeCV('Pierre', 'Simon', 'Directeur Commercial', 'homme4', 'Schneider Electric', 'Thales')
  },
  {
    id: 'tech',
    nom: 'Tech / Dev',
    badge: '⌨️ Dev',
    couleur: '#22d3ee',
    cv: makeCV('Hugo', 'Laurent', 'Lead Developer', 'homme1', 'Spotify', 'Criteo')
  },
  {
    id: 'elegant',
    nom: 'Élégant',
    badge: '🥂 Consulting',
    couleur: '#c9a87a',
    cv: makeCV('Inès', 'Garcia', 'Senior Consultant', 'femme1', 'Deloitte', 'KPMG')
  },
  {
    id: 'harvard',
    nom: 'Harvard',
    badge: '🎓 Prestige',
    couleur: '#A51C30',
    cv: makeCV('Nicolas', 'Faure', 'Avocat Associé', 'homme2', 'Cabinet Linklaters', 'PwC Legal')
  },
  {
    id: 'bold',
    nom: 'Bold',
    badge: '💥 Impact',
    couleur: '#c0392b',
    cv: makeCV('Yasmine', 'Benali', 'Directrice des Ventes', 'femme2', 'Renault', 'PSA Group')
  },
  {
    id: 'pastel',
    nom: 'Pastel',
    badge: '🌸 RH & Marketing',
    couleur: '#7c3aed',
    cv: makeCV('Chloé', 'Rousseau', 'Responsable Marketing', 'femme3', 'Sephora', 'Lancôme')
  },
  {
    id: 'timeline',
    nom: 'Timeline',
    badge: '📅 Chronologique',
    couleur: '#1e40af',
    cv: makeCV('Mathieu', 'Girard', 'Chef de Projet Digital', 'homme3', 'Capgemini', 'Accenture')
  },
  {
    id: 'swiss',
    nom: 'Swiss',
    badge: '📐 Bauhaus',
    couleur: '#000000',
    cv: makeCV('Antoine', 'Mercier', 'Designer UX Senior', 'homme4', 'Dassault Systèmes', 'Ubisoft')
  },
  {
    id: 'canva',
    nom: 'Canva Pro',
    badge: '🖌 Original',
    couleur: '#f093fb',
    cv: makeCV('Anaïs', 'Dupont', 'Content Creator Manager', 'femme4', 'TF1', 'M6 Groupe')
  },
]

// ─── Aperçu : vrai CV réduit à l'échelle ────────────────────
function TemplateApercu({ cv, templateId }) {
  const SCALE = 0.315
  const CV_W = 794
  const CV_H = 1123

  return (
    <div style={{
      width: CV_W * SCALE,
      height: CV_H * SCALE,
      overflow: 'hidden',
      position: 'relative',
      borderRadius: '4px',
      pointerEvents: 'none',
      userSelect: 'none',
      flexShrink: 0,
    }}>
      <div style={{
        transform: `scale(${SCALE})`,
        transformOrigin: 'top left',
        width: CV_W,
        height: CV_H,
        position: 'absolute',
        top: 0,
        left: 0,
      }}>
        <CVTemplate cvData={cv} template={templateId} />
      </div>
    </div>
  )
}

// ─── Page principale ─────────────────────────────────────────
function Templates() {
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState(null)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) window.location.href = '/auth'
    }
    checkUser()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f0f2f5',
      fontFamily: 'system-ui, sans-serif',
    }}>

      {/* Nav */}
      <nav style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '0 32px',
        height: '58px',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <a href="/" style={{textDecoration:'none', fontWeight:'700', fontSize:'20px'}}>
          <span style={{color:'#1a56db'}}>Did</span><span style={{color:'#111'}}>CV</span>
        </a>
        <div style={{marginLeft:'auto', display:'flex', gap:'16px', alignItems:'center'}}>
          <a href="/dashboard" style={{fontSize:'14px', color:'#6b7280', textDecoration:'none', fontWeight:'500'}}>
            ← Dashboard
          </a>
        </div>
      </nav>

      {/* Header */}
      <div style={{
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '36px 32px 28px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: '#eff4ff',
          color: '#1a56db',
          fontSize: '12px',
          fontWeight: '700',
          padding: '5px 14px',
          borderRadius: '100px',
          marginBottom: '14px',
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
        }}>
          ✦ {TEMPLATES.length} templates professionnels
        </div>
        <h1 style={{
          fontSize: '30px',
          fontWeight: '800',
          color: '#111',
          margin: '0 0 10px',
          letterSpacing: '-0.5px',
        }}>
          Choisis ton modèle de CV
        </h1>
        <p style={{
          fontSize: '15px',
          color: '#6b7280',
          margin: '0 auto',
          maxWidth: '480px',
          lineHeight: '1.6',
        }}>
          Sélectionne un design. L'IA optimise ton contenu pour l'offre d'emploi.
        </p>
      </div>

      {/* Grille des templates */}
      <div style={{
        maxWidth: '1380px',
        margin: '0 auto',
        padding: '36px 24px 60px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '20px',
      }}>
        {TEMPLATES.map((t) => {
          const isHovered = hoveredId === t.id
          return (
            <div
              key={t.id}
              onClick={() => navigate(`/generate?template=${t.id}`)}
              onMouseEnter={() => setHoveredId(t.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                background: '#fff',
                borderRadius: '12px',
                overflow: 'hidden',
                cursor: 'pointer',
                border: isHovered ? `2px solid ${t.couleur}` : '2px solid transparent',
                boxShadow: isHovered
                  ? `0 16px 48px ${t.couleur}30, 0 4px 16px rgba(0,0,0,0.1)`
                  : '0 2px 10px rgba(0,0,0,0.07)',
                transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
                transform: isHovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Zone aperçu du CV complet */}
              <div style={{
                background: '#e8eaed',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '12px 12px 0',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '220px',
              }}>
                {/* Fondu bas */}
                <div style={{
                  position: 'absolute',
                  bottom: 0, left: 0, right: 0,
                  height: '60px',
                  background: 'linear-gradient(to top, #e8eaed 10%, transparent)',
                  zIndex: 3,
                  pointerEvents: 'none',
                }} />

                {/* Overlay hover */}
                {isHovered && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: `${t.couleur}15`,
                    zIndex: 2,
                    transition: 'all 0.2s',
                  }} />
                )}

                <TemplateApercu cv={t.cv} templateId={t.id} />
              </div>

              {/* Infos bas de carte */}
              <div style={{padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{fontSize:'15px', fontWeight:'700', color:'#111'}}>{t.nom}</div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    color: t.couleur,
                    background: `${t.couleur}15`,
                    padding: '3px 9px',
                    borderRadius: '100px',
                    whiteSpace: 'nowrap',
                  }}>{t.badge}</span>
                </div>

                <button style={{
                  width: '100%',
                  padding: '10px',
                  background: isHovered ? t.couleur : '#f3f4f6',
                  color: isHovered ? '#fff' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                  {isHovered ? 'Utiliser ce template →' : 'Voir ce template'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Templates