import { useState } from 'react'
import { CVTemplate } from './CVTemplates'
import Navbar from './Navbar'

const DUMMY_CV = {
  prenom: 'Marie', nom: 'Dupont',
  titre: 'Responsable Marketing Digital',
  email: 'marie.dupont@email.com',
  telephone: '+33 6 12 34 56 78',
  ville: 'Paris',
  linkedin: 'linkedin.com/in/marie-dupont',
  accroche: 'Professionnelle du marketing digital avec 5 ans d\'experience en strategie de croissance. A genere +45% de trafic organique et pilote un budget de 200k. Maitrise des outils analytics et CRM dans des environnements startups et grands groupes.',
  experiences: [
    { poste: 'Responsable Marketing Digital', entreprise: 'TechStartup', periode: '2022 - 2024', lieu: 'Paris',
      missions: ['Developpe la strategie SEO/SEA generant +45% de trafic sur 12 mois', 'Gere un budget publicitaire de 200k avec un ROI de 320%', 'Pilote une equipe de 4 personnes et 3 agences'] },
    { poste: 'Chef de Projet Digital', entreprise: 'Agence WebCo', periode: '2020 - 2022', lieu: 'Lyon',
      missions: ['Coordonne 12 projets clients dans les delais avec 98% de satisfaction', 'Optimise les KPIs e-commerce reduisant le taux de rebond de 28%'] },
    { poste: 'Stagiaire Marketing', entreprise: 'Groupe Media', periode: 'Juin 2019 - Dec 2019', lieu: 'Paris',
      missions: ['Analyse les performances des campagnes sur 6 marches europeens'] },
  ],
  formations: [
    { diplome: 'Master Marketing Digital', etablissement: 'ESCP Business School', periode: '2018 - 2020', mention: 'Tres Bien', description: 'Specialisation en strategie digitale, analytics et marketing automation.' },
    { diplome: 'Licence Economie & Gestion', etablissement: 'Universite Paris-Dauphine', periode: '2015 - 2018', mention: 'Bien', description: 'Parcours economie avec option communication.' },
  ],
  competences: ['Google Analytics', 'SEO / SEA', 'HubSpot CRM', 'Adobe Creative', 'Salesforce', 'Data Studio', 'Content Strategy', 'Social Media'],
  langues: [{ langue: 'Francais', niveau: 'Langue maternelle' }, { langue: 'Anglais', niveau: 'Courant (C1)' }, { langue: 'Espagnol', niveau: 'Intermediaire (B1)' }],
  certifications: [{ titre: 'Google Analytics Certified', organisme: 'Google', annee: '2023' }],
  centres_interet: ['Photographie', 'Voyage', 'Design graphique'],
}

const TEMPLATES = [
  // Classiques
  { id: 'finance',       name: 'Finance',        cat: 'Classique',     desc: 'Elegant noir et blanc'        },
  { id: 'harvard',       name: 'Harvard',         cat: 'Classique',     desc: 'Style academique ivy league'  },
  { id: 'classique',     name: 'Classique',       cat: 'Classique',     desc: 'CV traditionnel francais'     },
  { id: 'swiss',         name: 'Swiss',           cat: 'Classique',     desc: 'Design helvetique epure'      },
  { id: 'minimal',       name: 'Minimal',         cat: 'Classique',     desc: 'Ultra epure, espace blanc'    },
  // Modernes
  { id: 'linkedin',      name: 'LinkedIn',        cat: 'Moderne',       desc: 'Style LinkedIn professionnel' },
  { id: 'siliconvalley', name: 'Silicon Valley',  cat: 'Moderne',       desc: 'Style Apple minimaliste'      },
  { id: 'moderne',       name: 'Moderne',         cat: 'Moderne',       desc: 'Vert fonce, bicolore'         },
  { id: 'corporate',     name: 'Corporate',       cat: 'Moderne',       desc: 'Bleu marine professionnel'    },
  { id: 'timeline',      name: 'Timeline',        cat: 'Moderne',       desc: 'Frise chronologique visuelle' },
  { id: 'executive',     name: 'Executive',       cat: 'Premium',       desc: 'Fond sombre dore, cadres'     },
  { id: 'elegant',       name: 'Elegant',         cat: 'Premium',       desc: 'Tons chauds dores, raffine'   },
  // Creatifs
  { id: 'canva',         name: 'Canva',           cat: 'Creatif',       desc: 'Degrade rose violet, moderne' },
  { id: 'creative',      name: 'Creative',        cat: 'Creatif',       desc: 'Degrade purple, cards'        },
  { id: 'portfolio',     name: 'Portfolio',       cat: 'Creatif',       desc: 'Fond sombre pour artistes'    },
  { id: 'pastel',        name: 'Pastel',          cat: 'Creatif',       desc: 'Violet pastel, badges doux'   },
  { id: 'bold',          name: 'Bold',            cat: 'Creatif',       desc: 'Rouge audacieux, typographie' },
  // Specialises
  { id: 'etudiant',      name: 'Etudiant',        cat: 'Junior',        desc: 'Formations en avant, junior'  },
  { id: 'alternance',    name: 'Alternance',      cat: 'Junior',        desc: 'Recherche d\'alternance'      },
  { id: 'sante',         name: 'Sante',           cat: 'Sante',         desc: 'Certifications en avant'      },
  { id: 'commercial',    name: 'Commercial',      cat: 'Vente',         desc: 'Resultats et chiffres'        },
  { id: 'startup',       name: 'Startup',         cat: 'Tech',          desc: 'Fond sombre, profil tech'     },
  { id: 'btp',           name: 'BTP',             cat: 'BTP',           desc: 'Habilitations en avant'       },
  { id: 'restauration',  name: 'Restauration',    cat: 'Resto',         desc: 'Chaleureux, culinaire'        },
  { id: 'transport',     name: 'Transport',       cat: 'Logistique',    desc: 'Permis et CACES visibles'     },
  { id: 'beaute',        name: 'Beaute',          cat: 'Beaute',        desc: 'Rose degrade, bien-etre'      },
  { id: 'international', name: 'International',   cat: 'International', desc: 'Bleu marine et or, etranger'  },
]

const CATS = ['Tous', 'Classique', 'Moderne', 'Premium', 'Creatif', 'Junior', 'Tech', 'Sante', 'Vente', 'BTP', 'Resto', 'Logistique', 'Beaute', 'International']

const CAT_COLORS = {
  'Classique':     '#374151', 'Moderne': '#1d4ed8', 'Premium': '#92400e',
  'Creatif':       '#7e22ce', 'Junior':  '#4338ca', 'Tech':    '#0f766e',
  'Sante':         '#0d9488', 'Vente':   '#b91c1c', 'BTP':     '#374151',
  'Resto':         '#92400e', 'Logistique': '#1d4ed8', 'Beaute': '#be185d',
  'International': '#1e40af',
}

function TemplateCard({ t }) {
  const [hovered, setHovered] = useState(false)

  return (
    <a href={`/generate?template=${t.id}`} style={{ textDecoration: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: '#fff', borderRadius: '12px', overflow: 'hidden',
          border: `2px solid ${hovered ? '#4f46e5' : '#e5e7eb'}`,
          cursor: 'pointer', transition: 'all 0.2s',
          transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
          boxShadow: hovered ? '0 12px 32px rgba(79,70,229,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
        }}
      >
        {/* Apercu miniature reel */}
        <div style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative', background: '#f8f9fa' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '794px', height: '1123px',
            transform: 'scale(0.355)', transformOrigin: 'top left',
            pointerEvents: 'none', userSelect: 'none',
          }}>
            <CVTemplate cvData={DUMMY_CV} template={t.id} />
          </div>

          {/* Badge categorie */}
          <div style={{
            position: 'absolute', top: '10px', right: '10px', zIndex: 5,
            background: '#fff', color: CAT_COLORS[t.cat] || '#374151',
            padding: '2px 9px', borderRadius: '10px', fontSize: '10px', fontWeight: '700',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
          }}>
            {t.cat}
          </div>

          {/* Overlay hover */}
          {hovered && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(79,70,229,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
              <div style={{ background: '#4f46e5', color: '#fff', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 16px rgba(79,70,229,0.4)' }}>
                Utiliser ce template
              </div>
            </div>
          )}
        </div>

        {/* Infos */}
        <div style={{ padding: '12px 14px 14px' }}>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#111', marginBottom: '3px' }}>{t.name}</div>
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>{t.desc}</div>
        </div>
      </div>
    </a>
  )
}

export default function Templates() {
  const [filtre, setFiltre] = useState('Tous')

  const filtered = filtre === 'Tous' ? TEMPLATES : TEMPLATES.filter(t => t.cat === filtre)

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="generate" />

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '32px 48px 0', position: 'sticky', top: '58px', zIndex: 50 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                Choisis ton template
              </h1>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                {filtered.length} template{filtered.length > 1 ? 's' : ''} pour tous les profils et secteurs
              </p>
            </div>
          </div>

          {/* Filtres */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingBottom: '1px' }}>
            {CATS.map(cat => (
              <button key={cat} onClick={() => setFiltre(cat)}
                style={{
                  padding: '7px 16px', borderRadius: '8px 8px 0 0', border: 'none',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  fontFamily: 'inherit', transition: 'all 0.15s',
                  background: filtre === cat ? '#4f46e5' : 'transparent',
                  color: filtre === cat ? '#fff' : '#6b7280',
                  borderBottom: filtre === cat ? '2px solid #4f46e5' : '2px solid transparent',
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grille */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 48px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '20px' }}>
          {filtered.map(t => <TemplateCard key={t.id} t={t} />)}
        </div>
      </div>
    </div>
  )
}