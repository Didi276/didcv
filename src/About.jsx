import { Zap, Bot, FileText, Palette } from 'lucide-react'
import Navbar from './Navbar'
import SEO from './SEO'

export default function About() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <SEO
        titre="À propos"
        description="À propos de DidJob, le générateur de CV IA made in France. Notre mission : aider chacun à décrocher son prochain emploi avec un CV optimisé ATS en 30 secondes."
        url="https://did-job.com/about"
      />
      <Navbar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '96px 24px 100px' }}>
        <div style={{ marginBottom: '64px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '14px' }}>A PROPOS</div>
          <h1 style={{ fontSize: '40px', fontWeight: '700', color: '#0a0a0f', margin: '0 0 18px', letterSpacing: '-1px', lineHeight: '1.1' }}>
            DidJob, le CV intelligent<br />pour tous les profils
          </h1>
          <p style={{ fontSize: '17px', color: '#6b7280', margin: 0, lineHeight: '1.7' }}>
            DidJob est né d'un constat simple : rédiger un bon CV prend trop de temps et les résultats ne passent pas les filtres ATS des recruteurs. On a voulu changer ca.
          </p>
        </div>

        {[
          {
            icon: Zap,
            title: 'Notre mission',
            text: 'Permettre à chaque candidat, quel que soit son secteur ou son niveau d\'expérience, de générer un CV professionnel et optimisé ATS en moins de 30 secondes. Du comptable au plombier, de l\'étudiant au directeur, DidJob s\'adapte à tous les profils.'
          },
          {
            icon: Bot,
            title: 'Comment ca marche',
            text: 'Notre IA analyse l\'offre d\'emploi que tu cibles, extrait les mots-clés importants pour les ATS, et génère un CV sur mesure à partir de ton profil. Elle produit également une lettre de motivation personnalisée. Tout ca en 30 secondes.'
          },
          {
            icon: FileText,
            title: 'Des CVs vraiment compatibles ATS',
            text: 'Contrairement à d\'autres outils qui génèrent des CVs en image, DidJob produit des PDFs avec du texte réel et sélectionnable. Les robots des systèmes de recrutement peuvent lire chaque mot de ton CV et t\'attribuer le bon score.'
          },
          {
            icon: Palette,
            title: '27 templates pour tous les métiers',
            text: 'Finance, tech, santé, BTP, restauration, transport, créatif, étudiant, international... Chaque secteur a son propre template avec un vocabulaire et une mise en page adaptés aux codes du métier.'
          },
        ].map(s => (
          <div key={s.title} style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '32px', marginBottom: '20px' }}>
            <s.icon size={26} color="#4f46e5" strokeWidth={1.75} style={{ marginBottom: '14px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 10px', letterSpacing: '-0.2px' }}>{s.title}</h2>
            <p style={{ fontSize: '15px', color: '#6b7280', margin: 0, lineHeight: '1.7' }}>{s.text}</p>
          </div>
        ))}

        <div style={{ textAlign: 'center', marginTop: '56px' }}>
          <a href="/auth" style={{ display: 'inline-block', padding: '15px 32px', background: '#4f46e5', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
            Créer mon CV gratuitement
          </a>
        </div>
      </div>
    </div>
  )
}
