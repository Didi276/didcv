import Navbar from './Navbar'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 12px', letterSpacing: '-0.2px' }}>{title}</h2>
    <div style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.8' }}>{children}</div>
  </div>
)

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '12px' }}>LÉGAL</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 10px', letterSpacing: '-1px' }}>Politique de confidentialité</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Dernière mise à jour : juillet 2026</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '40px' }}>
          <Section title="1. Données collectées">
            DidCV collecte les informations que tu fournis directement : adresse email, informations de profil (nom, expériences, formations, compétences), et les CVs que tu génères. Nous ne collectons aucune donnée sensible au sens du RGPD.
          </Section>

          <Section title="2. Utilisation des données">
            Tes données sont utilisées exclusivement pour fournir le service DidCV : générer tes CVs, sauvegarder ton profil, et améliorer nos algorithmes de génération. Nous ne vendons jamais tes données à des tiers.
          </Section>

          <Section title="3. Intelligence artificielle">
            Lors de la génération de ton CV, les informations de ton profil et l'offre d'emploi sont transmises à l'API d'Anthropic (Claude) pour produire le contenu. Anthropic s'engage à ne pas utiliser ces données pour entraîner ses modèles (voir politique d'Anthropic).
          </Section>

          <Section title="4. Cookies">
            DidCV utilise uniquement des cookies essentiels au fonctionnement du service (authentification, session). Aucun cookie publicitaire ou de tracking n'est utilisé.
          </Section>

          <Section title="5. Durée de conservation">
            Tes données sont conservées tant que ton compte est actif. Tu peux demander la suppression de ton compte et de toutes tes données à tout moment en nous contactant.
          </Section>

          <Section title="6. Tes droits (RGPD)">
            Conformément au RGPD, tu disposes des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition concernant tes données personnelles. Pour exercer ces droits, contacte-nous via la page Contact.
          </Section>

          <Section title="7. Contact">
            Pour toute question relative à tes données personnelles, contacte-nous via notre <a href="/contact" style={{ color: '#4f46e5' }}>page de contact</a>.
          </Section>
        </div>
      </div>
    </div>
  )
}
