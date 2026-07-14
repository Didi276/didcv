import Navbar from './Navbar'

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '32px' }}>
    <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 12px', letterSpacing: '-0.2px' }}>{title}</h2>
    <div style={{ fontSize: '15px', color: '#6b7280', lineHeight: '1.8' }}>{children}</div>
  </div>
)

export default function CGU() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ marginBottom: '48px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '12px' }}>LÉGAL</div>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 10px', letterSpacing: '-1px' }}>Conditions générales d'utilisation</h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Dernière mise à jour : juillet 2026</p>
        </div>

        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '40px' }}>
          <Section title="1. Acceptation des conditions">
            En utilisant DidCV, tu acceptes les présentes conditions générales d'utilisation. Si tu n'acceptes pas ces conditions, tu ne dois pas utiliser le service.
          </Section>

          <Section title="2. Description du service">
            DidCV est une plateforme de création de CV assistée par intelligence artificielle. Le service permet de générer des CVs et lettres de motivation personnalisés à partir d'un profil utilisateur et d'une offre d'emploi.
          </Section>

          <Section title="3. Compte utilisateur">
            Tu es responsable de la confidentialité de ton compte et de ton mot de passe. Tu t'engages à ne pas partager ton accès et à nous notifier immédiatement de toute utilisation non autorisée.
          </Section>

          <Section title="4. Plan gratuit et Pro">
            Le plan gratuit permet de générer 1 CV et 1 lettre de motivation. Le plan Pro donne accès à des générations illimitées. Les tarifs en vigueur sont affichés sur la page d'accueil.
          </Section>

          <Section title="5. Propriété intellectuelle">
            Les CVs générés t'appartiennent entièrement. DidCV conserve les droits sur la plateforme, les templates et les algorithmes. Tu ne peux pas reproduire ou revendre les templates DidCV.
          </Section>

          <Section title="6. Responsabilité">
            DidCV met tout en oeuvre pour fournir un service de qualité, mais ne garantit pas que les CVs générés permettront d'obtenir un emploi. L'utilisateur est seul responsable du contenu final de son CV.
          </Section>

          <Section title="7. Résiliation">
            Tu peux supprimer ton compte à tout moment depuis les paramètres. DidCV se réserve le droit de suspendre un compte en cas de violation des présentes CGU.
          </Section>

          <Section title="8. Droit applicable">
            Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux compétents sont ceux du ressort de Paris.
          </Section>

          <Section title="9. Contact">
            Pour toute question concernant ces CGU, contacte-nous via notre <a href="/contact" style={{ color: '#4f46e5' }}>page de contact</a>.
          </Section>
        </div>
      </div>
    </div>
  )
}
