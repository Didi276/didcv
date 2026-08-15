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

export default function CGU() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <div style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontFamily: FONT_CORPS, fontSize: '14px', color: '#9ca3af', margin: '0 0 16px' }}>
            Dernière mise à jour : 13 août 2026
          </p>
          <h1 style={{ fontFamily: FONT_TITRE, fontSize: '40px', fontWeight: '700', color: '#0f0f1a', margin: 0, letterSpacing: '-1px' }}>
            Conditions générales d'utilisation
          </h1>

          <div style={{ fontFamily: FONT_CORPS, fontSize: '16px', lineHeight: '1.8', color: '#374151', marginTop: '20px' }}>
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme DidJob. En créant un compte ou en utilisant le service, tu acceptes les termes ci-dessous.
          </div>

          <Section title="1. Objet">
            <p>
              DidJob est une plateforme française d'aide à la recherche d'emploi proposant la création de CV, l'agrégation d'offres d'emploi et des outils de préparation aux entretiens.
            </p>
          </Section>

          <Section title="2. Accès au service">
            <Liste items={[
              'Le service est accessible sur did-job.com',
              "L'inscription est gratuite et nécessite une adresse email valide",
              "L'utilisateur doit avoir au moins 16 ans",
              'Le service est destiné à un usage personnel et non commercial',
            ]} />
          </Section>

          <Section title="3. Compte utilisateur">
            <Liste items={[
              'L\'utilisateur est responsable de la confidentialité de son compte',
              'Il s\'engage à signaler toute utilisation non autorisée de son compte',
              'DidJob se réserve le droit de suspendre un compte en cas d\'abus',
            ]} />
          </Section>

          <Section title="4. Fonctionnalités gratuites">
            <p>DidJob propose gratuitement :</p>
            <Liste items={[
              'La création de CV avec les 78 templates disponibles',
              "L'accès aux offres d'emploi",
              'Le suivi des candidatures',
              "Un simulateur d'entretien",
              'Des recommandations personnalisées',
            ]} />
          </Section>

          <Section title="5. Propriété intellectuelle">
            <Liste items={[
              'Les templates de CV sont la propriété de DidJob',
              "Le contenu des CVs générés appartient à l'utilisateur",
              "L'utilisateur conserve tous ses droits sur ses données",
            ]} />
          </Section>

          <Section title="6. Données personnelles">
            <p>
              Le traitement de tes données personnelles est conforme au RGPD. Pour plus de détails, consulte notre <a href="/privacy" style={LIEN}>Politique de confidentialité</a>.
            </p>
          </Section>

          <Section title="7. Responsabilité">
            <Liste items={[
              "DidJob agrège des offres d'emploi provenant de sources tierces",
              "DidJob ne garantit pas l'exactitude ni l'actualité de ces offres",
              'DidJob n\'est pas responsable des décisions de recrutement prises par des tiers',
              'Les CV générés sont fournis à titre indicatif',
            ]} />
          </Section>

          <Section title="8. Disponibilité du service">
            <p>
              Le service est fourni « tel quel », sans garantie de disponibilité continue. Des opérations de maintenance peuvent survenir, avec préavis si possible.
            </p>
          </Section>

          <Section title="9. Modification des CGU">
            <p>
              En cas de changement important, nous t'en informerons par email au moins 30 jours avant son entrée en vigueur. La poursuite de l'utilisation du service après cette notification vaut acceptation des nouvelles conditions.
            </p>
          </Section>

          <Section title="10. Droit applicable">
            <Liste items={[
              'Les présentes CGU sont soumises au droit français',
              'Les juridictions françaises sont seules compétentes en cas de litige',
              "En cas de litige, une médiation est possible avant toute action en justice",
            ]} />
          </Section>

          <div style={{ marginTop: '64px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <a href="/" style={{ fontFamily: FONT_CORPS, color: '#4f46e5', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>← Retour à l'accueil</a>
          </div>
        </div>
      </div>
    </div>
  )
}
