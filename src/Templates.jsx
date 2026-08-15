import { useState, useEffect, useRef, useMemo } from 'react'
import { CVTemplatePro, TEMPLATES_PRO_META } from './CVTemplatesPro'
import { TEMPLATES_EXTRA_META } from './CVTemplatesExtra'
import Navbar from './Navbar'

const TEMPLATES_META = { ...TEMPLATES_PRO_META, ...TEMPLATES_EXTRA_META }

const CV_DEMO = {
  prenom: 'Camille',
  nom: 'Moreau',
  titre: 'Responsable Marketing Digital',
  email: 'camille.moreau@email.com',
  telephone: '06 12 34 56 78',
  ville: 'Lyon',
  linkedin: 'linkedin.com/in/camillemoreau',
  photo: null,
  accroche: "Responsable marketing digital avec 8 ans d'expérience dans la croissance de marques B2C. Spécialisée en acquisition payante et stratégie de contenu, j'ai piloté des budgets de 500K€ et fait croître des audiences de plus de 200%.",
  experiences: [
    {
      poste: 'Responsable Marketing Digital',
      entreprise: 'Groupe Altitude',
      lieu: 'Lyon',
      periode: '2021 - Présent',
      missions: [
        'Pilotage du budget acquisition de 500K€ avec un ROAS de 4,2',
        'Croissance du trafic organique de 180% en 18 mois',
        'Management d\'une équipe de 5 personnes'
      ]
    },
    {
      poste: 'Chargée de Marketing',
      entreprise: 'Novaris',
      lieu: 'Paris',
      periode: '2018 - 2021',
      missions: [
        'Lancement de 3 campagnes nationales multi-canal',
        'Refonte complète de la stratégie éditoriale'
      ]
    }
  ],
  formations: [
    { diplome: 'Master Marketing Digital', etablissement: 'EM Lyon', periode: '2016 - 2018', mention: 'Mention Bien' },
    { diplome: 'Licence Économie-Gestion', etablissement: 'Université Lyon 2', periode: '2013 - 2016' }
  ],
  competences: ['Google Ads', 'SEO/SEA', 'Analytics', 'HubSpot', 'Content Strategy', 'A/B Testing'],
  langues: [
    { langue: 'Français', niveau: 'Langue maternelle' },
    { langue: 'Anglais', niveau: 'Courant (C1)' },
    { langue: 'Espagnol', niveau: 'Intermédiaire (B1)' }
  ],
  certifications: [
    { titre: 'Google Analytics 4', organisme: 'Google', annee: '2024' },
    { titre: 'HubSpot Inbound Marketing', organisme: 'HubSpot', annee: '2023' }
  ],
  centres_interet: ['Course à pied', 'Photographie', 'Cuisine']
}

const SECTEURS = [
  'Tous les secteurs', 'Finance', 'Tech', 'Santé', 'Commerce', 'Marketing',
  'Juridique', 'BTP', 'Industrie', 'Éducation', 'Design', 'Conseil', 'RH',
  'Logistique', 'Restauration', 'Administration', 'Recherche', 'Startup', 'Direction',
]

const NIVEAUX = ['Tous niveaux', 'Junior', 'Confirmé', 'Senior', 'Cadre', 'Direction']

const SCORES = [
  { label: 'Tous', value: 0 },
  { label: '95 et plus', value: 95 },
  { label: '90 et plus', value: 90 },
  { label: '85 et plus', value: 85 },
]

const selectStyle = {
  padding: '8px 30px 8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb',
  background: '#ffffff', fontSize: '12.5px', fontWeight: 500, color: '#374151',
  fontFamily: 'inherit', cursor: 'pointer', appearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239ca3af' stroke-width='1.5' fill='none' fill-rule='evenodd'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center',
}

function TemplateCard({ id, meta }) {
  const containerRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '250px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const badgeBg = meta.atsScore >= 95 ? '#dcfce7' : meta.atsScore >= 85 ? '#fef3c7' : '#fee2e2'
  const badgeColor = meta.atsScore >= 95 ? '#166534' : meta.atsScore >= 85 ? '#92400e' : '#991b1b'

  return (
    <a href={`/generate?template=${id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#ffffff', borderRadius: '12px', overflow: 'hidden',
          border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'all 0.15s',
          transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
          boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.08)' : 'none',
        }}
      >
        <div ref={containerRef} style={{ height: '300px', overflow: 'hidden', background: '#fafafa', position: 'relative' }}>
          {visible ? (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '794px', height: '1123px',
              transform: 'scale(0.33)', transformOrigin: 'top left',
              pointerEvents: 'none', userSelect: 'none',
            }}>
              <CVTemplatePro cvData={CV_DEMO} template={id} color={meta.couleurDefaut} />
            </div>
          ) : (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#d4d4d8' }}>{meta.nom}</span>
            </div>
          )}

          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            padding: '3px 9px', borderRadius: '12px', background: badgeBg, color: badgeColor,
            fontSize: '10px', fontWeight: 700,
          }}>
            ATS {meta.atsScore}
          </div>

          {meta.recommande && (
            <div style={{
              position: 'absolute', top: '10px', left: '10px',
              padding: '3px 9px', borderRadius: '12px', background: '#0f0f1a', color: '#ffffff',
              fontSize: '10px', fontWeight: 600,
            }}>
              Recommandé
            </div>
          )}
        </div>

        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f0f1a' }}>{meta.nom}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{meta.style}</div>
          <div style={{ fontSize: '12px', lineHeight: 1.5, color: '#6b7280', marginTop: '8px' }}>{meta.description}</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '10px' }}>
            {meta.secteurs.slice(0, 3).map((s, i) => (
              <span key={i} style={{
                fontSize: '9.5px', padding: '2px 7px', background: '#f8f8f8',
                borderRadius: '4px', color: '#6b7280',
              }}>{s}</span>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid #f8f8f8' }}>
          <div style={{
            width: '100%', padding: '10px', background: '#0f0f1a', color: '#ffffff',
            borderRadius: '8px', fontSize: '13px', fontWeight: 600, textAlign: 'center', boxSizing: 'border-box',
          }}>
            Utiliser ce modèle
          </div>
        </div>
      </div>
    </a>
  )
}

export default function Templates() {
  const [secteur, setSecteur] = useState('Tous les secteurs')
  const [niveau, setNiveau] = useState('Tous niveaux')
  const [style, setStyle] = useState('Tous styles')
  const [scoreMin, setScoreMin] = useState(0)
  const [recommandesOnly, setRecommandesOnly] = useState(false)

  const styles = useMemo(() => {
    const uniques = [...new Set(Object.values(TEMPLATES_META).map(m => m.style))].sort((a, b) => a.localeCompare(b, 'fr'))
    return ['Tous styles', ...uniques]
  }, [])

  const filtresActifs = secteur !== 'Tous les secteurs' || niveau !== 'Tous niveaux'
    || style !== 'Tous styles' || scoreMin !== 0 || recommandesOnly

  const effacerFiltres = () => {
    setSecteur('Tous les secteurs')
    setNiveau('Tous niveaux')
    setStyle('Tous styles')
    setScoreMin(0)
    setRecommandesOnly(false)
  }

  const templatesFiltres = useMemo(() => {
    return Object.entries(TEMPLATES_META)
      .filter(([, m]) => {
        if (secteur !== 'Tous les secteurs' && !m.secteurs.includes(secteur) && !m.secteurs.includes('Tous secteurs')) return false
        if (niveau !== 'Tous niveaux' && !m.niveaux.includes(niveau)) return false
        if (style !== 'Tous styles' && m.style !== style) return false
        if (scoreMin && m.atsScore < scoreMin) return false
        if (recommandesOnly && !m.recommande) return false
        return true
      })
      .map(([id, m]) => ({ id, ...m }))
      .sort((a, b) => {
        if (a.recommande !== b.recommande) return b.recommande ? 1 : -1
        return b.atsScore - a.atsScore
      })
  }, [secteur, niveau, style, scoreMin, recommandesOnly])

  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', fontFamily: '"Satoshi","Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="generate" />

      {/* Hero */}
      <div style={{ background: '#0a0a0f', padding: '64px 24px' }}>
        <h1 style={{
          fontFamily: '"Clash Display","Satoshi",sans-serif', fontSize: '44px', fontWeight: 700,
          color: '#ffffff', textAlign: 'center', margin: 0,
        }}>
          93 modèles de CV professionnels
        </h1>
        <p style={{
          fontFamily: '"Satoshi","Inter",sans-serif', fontSize: '15px', color: 'rgba(255,255,255,0.6)',
          textAlign: 'center', marginTop: '10px', marginBottom: 0,
        }}>
          Tous compatibles ATS. Choisis selon ton secteur.
        </p>
      </div>

      {/* Barre de filtres */}
      <div style={{
        background: '#ffffff', borderBottom: '1px solid #f0f0f0', padding: '16px 40px',
        position: 'sticky', top: '58px', zIndex: 50,
        display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center',
      }}>
        <select value={secteur} onChange={e => setSecteur(e.target.value)} style={selectStyle}>
          {SECTEURS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={niveau} onChange={e => setNiveau(e.target.value)} style={selectStyle}>
          {NIVEAUX.map(n => <option key={n} value={n}>{n}</option>)}
        </select>

        <select value={style} onChange={e => setStyle(e.target.value)} style={selectStyle}>
          {styles.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={scoreMin} onChange={e => setScoreMin(Number(e.target.value))} style={selectStyle}>
          {SCORES.map(s => <option key={s.label} value={s.value}>{s.label}</option>)}
        </select>

        <label style={{
          display: 'flex', alignItems: 'center', gap: '7px', padding: '8px 12px',
          borderRadius: '8px', border: `1px solid ${recommandesOnly ? '#0f0f1a' : '#e5e7eb'}`,
          background: recommandesOnly ? '#0f0f1a' : '#ffffff',
          color: recommandesOnly ? '#ffffff' : '#374151',
          fontSize: '12.5px', fontWeight: 500, cursor: 'pointer', userSelect: 'none',
        }}>
          <input
            type="checkbox" checked={recommandesOnly}
            onChange={e => setRecommandesOnly(e.target.checked)}
            style={{ margin: 0, accentColor: '#0f0f1a' }}
          />
          Recommandés uniquement
        </label>

        {filtresActifs && (
          <button onClick={effacerFiltres} style={{
            padding: '8px 12px', borderRadius: '8px', border: '1px solid transparent',
            background: 'transparent', color: '#6b7280', fontSize: '12.5px', fontWeight: 500,
            fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'underline',
          }}>
            Effacer les filtres
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>
          {templatesFiltres.length} modèle{templatesFiltres.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Grille */}
      <div style={{ padding: '32px 40px' }}>
        {templatesFiltres.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
            {templatesFiltres.map(t => <TemplateCard key={t.id} id={t.id} meta={t} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 20px', color: '#9ca3af', fontSize: '14px' }}>
            Aucun modèle ne correspond à ces filtres.
          </div>
        )}
      </div>
    </div>
  )
}
