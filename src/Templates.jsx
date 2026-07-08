import { CVTemplate } from './CVTemplates'
import Navbar from './Navbar'
import './App.css'

// Données factices pour les aperçus
const DUMMY_CV = {
  prenom: 'Marie', nom: 'DUPONT',
  titre: 'Responsable Marketing Digital',
  email: 'marie.dupont@email.com',
  telephone: '+33 6 12 34 56 78',
  ville: 'Paris',
  linkedin: 'linkedin.com/in/marie-dupont',
  accroche: 'Professionnelle du marketing digital avec 5 ans d\'expérience en stratégie de croissance et gestion de campagnes B2B. A généré +45% de trafic organique et piloté un budget de 200k€. Maîtrise des outils analytics et CRM dans des environnements startups et grands groupes.',
  experiences: [
    { poste: 'Responsable Marketing Digital', entreprise: 'TechStartup', periode: '2022 – 2024', lieu: 'Paris, France',
      missions: ['Développé la stratégie SEO/SEA générant +45% de trafic organique sur 12 mois','Géré un budget publicitaire de 200k€ avec un ROI de 320%','Piloté une équipe de 4 personnes et 3 agences prestataires'] },
    { poste: 'Chef de Projet Digital', entreprise: 'Agence WebCo', periode: '2020 – 2022', lieu: 'Lyon, France',
      missions: ['Coordonné 12 projets clients dans les délais avec un taux de satisfaction de 98%','Optimisé les KPIs e-commerce réduisant le taux de rebond de 28%'] },
    { poste: 'Stagiaire Marketing', entreprise: 'Groupe Média', periode: 'Juin 2019 – Déc 2019', lieu: 'Paris, France',
      missions: ['Analysé les performances des campagnes sur 6 marchés européens','Produit 4 rapports mensuels présentés à la direction générale'] },
  ],
  formations: [
    { diplome: 'Master Marketing Digital & Data', etablissement: 'ESCP Business School', periode: '2018 – 2020', mention: 'Très Bien', description: 'Spécialisation en stratégie digitale, analytics et marketing automation.' },
    { diplome: 'Licence Économie & Gestion', etablissement: 'Université Paris-Dauphine', periode: '2015 – 2018', mention: 'Bien', description: 'Parcours économie d\'entreprise avec option communication.' },
  ],
  competences: ['Google Analytics', 'SEO / SEA', 'HubSpot CRM', 'Adobe Creative Suite', 'Salesforce', 'Data Studio', 'Content Strategy', 'Social Media'],
  langues: [{ langue: 'Français', niveau: 'Langue maternelle' }, { langue: 'Anglais', niveau: 'Courant (C1)' }, { langue: 'Espagnol', niveau: 'Intermédiaire (B1)' }],
  certifications: [{ titre: 'Google Analytics Certified', organisme: 'Google', annee: '2023' }, { titre: 'HubSpot Marketing', organisme: 'HubSpot', annee: '2022' }],
  centres_interet: ['Photographie', 'Voyage', 'Design graphique', 'Yoga'],
}

const TEMPLATES = [
  // Classiques
  { id: 'finance',       name: 'Finance',        tag: 'Classique',     tagColor: '#374151', tagBg: '#f3f4f6' },
  { id: 'harvard',       name: 'Harvard',        tag: 'Classique',     tagColor: '#374151', tagBg: '#f3f4f6' },
  { id: 'classique',     name: 'Classique',      tag: 'Classique',     tagColor: '#374151', tagBg: '#f3f4f6' },
  { id: 'swiss',         name: 'Swiss',          tag: 'Classique',     tagColor: '#374151', tagBg: '#f3f4f6' },
  { id: 'minimal',       name: 'Minimal',        tag: 'Classique',     tagColor: '#374151', tagBg: '#f3f4f6' },
  { id: 'executive',     name: 'Executive',      tag: 'Premium',       tagColor: '#92400e', tagBg: '#fffbeb' },
  // Modernes
  { id: 'linkedin',      name: 'LinkedIn',       tag: 'Moderne',       tagColor: '#1d4ed8', tagBg: '#eff6ff' },
  { id: 'siliconvalley', name: 'Silicon Valley', tag: 'Moderne',       tagColor: '#1d4ed8', tagBg: '#eff6ff' },
  { id: 'moderne',       name: 'Moderne',        tag: 'Moderne',       tagColor: '#1d4ed8', tagBg: '#eff6ff' },
  { id: 'corporate',     name: 'Corporate',      tag: 'Moderne',       tagColor: '#1d4ed8', tagBg: '#eff6ff' },
  { id: 'timeline',      name: 'Timeline',       tag: 'Moderne',       tagColor: '#1d4ed8', tagBg: '#eff6ff' },
  { id: 'startup',       name: 'Startup',        tag: 'Tech',          tagColor: '#0f766e', tagBg: '#f0fdfa' },
  // Créatifs
  { id: 'canva',         name: 'Canva',          tag: 'Créatif',       tagColor: '#7e22ce', tagBg: '#fdf4ff' },
  { id: 'creative',      name: 'Creative',       tag: 'Créatif',       tagColor: '#7e22ce', tagBg: '#fdf4ff' },
  { id: 'portfolio',     name: 'Portfolio',      tag: 'Créatif',       tagColor: '#7e22ce', tagBg: '#fdf4ff' },
  { id: 'pastel',        name: 'Pastel',         tag: 'Créatif',       tagColor: '#7e22ce', tagBg: '#fdf4ff' },
  { id: 'elegant',       name: 'Élégant',        tag: 'Premium',       tagColor: '#92400e', tagBg: '#fffbeb' },
  { id: 'bold',          name: 'Bold',           tag: 'Impact',        tagColor: '#991b1b', tagBg: '#fef2f2' },
  // Spécialisés
  { id: 'etudiant',      name: 'Étudiant',       tag: 'Junior',        tagColor: '#4338ca', tagBg: '#eef2ff' },
  { id: 'alternance',    name: 'Alternance',     tag: 'Junior',        tagColor: '#4338ca', tagBg: '#eef2ff' },
  { id: 'sante',         name: 'Santé',          tag: 'Santé',         tagColor: '#0d9488', tagBg: '#f0fdfa' },
  { id: 'commercial',    name: 'Commercial',     tag: 'Vente',         tagColor: '#b91c1c', tagBg: '#fef2f2' },
  { id: 'tech',          name: 'Tech',           tag: 'Tech',          tagColor: '#0f766e', tagBg: '#f0fdfa' },
  { id: 'international', name: 'International',  tag: 'International', tagColor: '#1e40af', tagBg: '#eff6ff' },
]

function TemplateCard({ t }) {
  return (
    <a href={`/generate?template=${t.id}`} style={{ textDecoration: 'none' }}>
      <div style={{
        background: '#fff', border: '1px solid #e5e7ef', borderRadius: '12px',
        overflow: 'hidden', cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' }}
      >
        {/* Aperçu réel du template */}
        <div style={{ width: '100%', height: '200px', overflow: 'hidden', position: 'relative', background: '#f8f9fa' }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '794px', height: '1123px',
            transform: 'scale(0.36)',
            transformOrigin: 'top left',
            pointerEvents: 'none',
            userSelect: 'none',
          }}>
            <CVTemplate cvData={DUMMY_CV} template={t.id} />
          </div>
          {/* Tag */}
          <div style={{
            position: 'absolute', top: '10px', right: '10px',
            background: t.tagBg, color: t.tagColor,
            padding: '2px 9px', borderRadius: '10px',
            fontSize: '10px', fontWeight: '700', zIndex: 10,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {t.tag}
          </div>
        </div>

        {/* Infos */}
        <div style={{ padding: '14px 16px 16px' }}>
          <div style={{ fontWeight: '700', fontSize: '14px', color: '#111', marginBottom: '10px' }}>
            {t.name}
          </div>
          <div style={{
            display: 'block', width: '100%', padding: '8px',
            background: '#1a56db', color: '#fff', borderRadius: '7px',
            fontSize: '12px', fontWeight: '600', textAlign: 'center',
          }}>
            Utiliser →
          </div>
        </div>
      </div>
    </a>
  )
}

export default function Templates() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8faff' }}>
      <Navbar currentPage="generate" />

      {/* Hero */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7ef', padding: '32px 48px 24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
          Choisis ton template
        </h1>
        <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
          {TEMPLATES.length} templates professionnels — tous les profils, tous les secteurs
        </p>
      </div>

      {/* Grille */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 40px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '18px'
        }}>
          {TEMPLATES.map(t => <TemplateCard key={t.id} t={t} />)}
        </div>
      </div>
    </div>
  )
}
