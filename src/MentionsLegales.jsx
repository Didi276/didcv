import Navbar from './Navbar'

const FONT_TITRE = '"Clash Display","Satoshi","Inter",system-ui,sans-serif'
const FONT_CORPS = '"Satoshi","Inter",system-ui,sans-serif'

function Section({ title, children }) {
  return (
    <div style={{ marginTop: '48px' }}>
      <h2 style={{ fontFamily: FONT_TITRE, fontSize: '22px', fontWeight: '700', color: '#0f0f1a', margin: '0 0 16px', letterSpacing: '-0.3px' }}>
        {title}
      </h2>
      <div style={{ fontFamily: FONT_CORPS, fontSize: '16px', lineHeight: '1.8', color: '#374151' }}>
        {children}
      </div>
    </div>
  )
}

function Liste({ items }) {
  return (
    <ul style={{ paddingLeft: '24px', margin: '8px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  )
}

const LIEN = { color: '#4f46e5', textDecoration: 'underline' }

export default function MentionsLegales() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <div style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontFamily: FONT_CORPS, fontSize: '14px', color: '#9ca3af', margin: '0 0 16px' }}>
            Dernière mise à jour : 13 août 2026
          </p>
          <h1 style={{ fontFamily: FONT_TITRE, fontSize: '40px', fontWeight: '700', color: '#0f0f1a', margin: 0, letterSpacing: '-1px' }}>
            Mentions légales
          </h1>

          <Section title="1. Éditeur du site">
            <Liste items={[
              'Nom : DidJob',
              <>Site : <a href="https://did-job.com" style={LIEN}>did-job.com</a></>,
              <>Email : <a href="mailto:contact@did-job.com" style={LIEN}>contact@did-job.com</a></>,
              'Statut : projet en cours de structuration juridique',
            ]} />
          </Section>

          <Section title="2. Hébergement">
            <p>Le site est hébergé par :</p>
            <p>
              Vercel Inc.<br />
              340 Pine Street, Suite 701<br />
              San Francisco, CA 94104, USA<br />
              <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" style={LIEN}>vercel.com</a>
            </p>
          </Section>

          <Section title="3. Base de données">
            <p>Les données sont hébergées par :</p>
            <p>
              Supabase Inc.<br />
              <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={LIEN}>supabase.com</a>
            </p>
          </Section>

          <Section title="4. Propriété intellectuelle">
            <p>
              Le contenu de ce site (textes, graphismes, logo, templates) est protégé par le droit d'auteur. Toute reproduction, même partielle, est interdite sans autorisation préalable.
            </p>
          </Section>

          <Section title="5. Liens hypertextes">
            <p>
              DidJob peut contenir des liens vers des sites tiers (offres d'emploi, ressources). DidJob ne contrôle pas le contenu de ces sites et décline toute responsabilité quant à leur contenu.
            </p>
          </Section>

          <div style={{ marginTop: '64px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <a href="/" style={{ fontFamily: FONT_CORPS, color: '#4f46e5', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>← Retour à l'accueil</a>
          </div>
        </div>
      </div>
    </div>
  )
}
