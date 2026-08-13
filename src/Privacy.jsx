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

function SousTitre({ children }) {
  return (
    <h3 style={{ fontFamily: FONT_CORPS, fontSize: '18px', fontWeight: '600', color: '#0f0f1a', margin: '20px 0 8px' }}>
      {children}
    </h3>
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

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <Navbar />
      <div style={{ padding: '80px 0' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 24px' }}>
          <p style={{ fontFamily: FONT_CORPS, fontSize: '14px', color: '#9ca3af', margin: '0 0 16px' }}>
            Dernière mise à jour : 13 août 2026
          </p>
          <h1 style={{ fontFamily: FONT_TITRE, fontSize: '40px', fontWeight: '700', color: '#0f0f1a', margin: 0, letterSpacing: '-1px' }}>
            Politique de confidentialité
          </h1>

          <div style={{ fontFamily: FONT_CORPS, fontSize: '16px', lineHeight: '1.8', color: '#374151', marginTop: '20px' }}>
            DidJob accorde une attention particulière à la protection de tes données personnelles. Cette politique explique quelles données nous collectons, pourquoi, et quels sont tes droits, conformément au Règlement Général sur la Protection des Données (RGPD).
          </div>

          <Section title="1. Identité du responsable du traitement">
            <p>
              Le responsable du traitement des données collectées via la plateforme DidJob (<a href="https://did-job.com" style={LIEN}>did-job.com</a>) est DidJob.
            </p>
            <p>
              Contact : <a href="mailto:contact@did-job.com" style={LIEN}>contact@did-job.com</a>
            </p>
          </Section>

          <Section title="2. Données collectées">
            <p>Nous collectons les catégories de données suivantes :</p>
            <Liste items={[
              'Données de compte : email, prénom, nom',
              'Données de profil : poste souhaité, compétences, ville, expérience, photo de profil',
              'CVs créés et leur contenu',
              'Candidatures et leur suivi',
              'Données de navigation (logs techniques hébergés par Vercel)',
            ]} />
          </Section>

          <Section title="3. Finalités du traitement">
            <p>Tes données sont utilisées pour :</p>
            <Liste items={[
              "La création et la gestion de ton compte utilisateur",
              'La génération de CV personnalisés',
              "La recommandation d'offres d'emploi personnalisées",
              "L'envoi d'emails transactionnels et de rappels",
              "L'amélioration du service",
            ]} />
          </Section>

          <Section title="4. Base légale">
            <Liste items={[
              "L'exécution du contrat (nos Conditions Générales d'Utilisation) pour les fonctionnalités principales du service",
              'Le consentement pour les emails marketing',
              "L'intérêt légitime pour l'amélioration du service",
            ]} />
          </Section>

          <Section title="5. Destinataires des données">
            <p>Certaines de tes données sont partagées avec des prestataires techniques nécessaires au fonctionnement du service :</p>
            <Liste items={[
              'Supabase (hébergement base de données) — USA/UE',
              'Vercel (hébergement application) — USA, avec garanties RGPD',
              'Resend (envoi des emails) — USA, avec garanties RGPD',
              'Anthropic Claude (matching IA) — USA, avec garanties RGPD',
            ]} />
            <p>Ces prestataires sont soumis à des clauses contractuelles types garantissant un niveau de protection équivalent au RGPD.</p>
          </Section>

          <Section title="6. Durée de conservation">
            <Liste items={[
              'Données de compte : durée de la relation avec DidJob + 3 ans',
              "CVs : jusqu'à suppression par l'utilisateur",
              'Logs de navigation : 90 jours',
              "Données de candidatures : jusqu'à suppression par l'utilisateur",
            ]} />
          </Section>

          <Section title="7. Droits des utilisateurs (RGPD Art. 15 à 22)">
            <p>Conformément au RGPD, tu disposes des droits suivants sur tes données :</p>
            <Liste items={[
              "Droit d'accès à tes données",
              'Droit de rectification',
              'Droit à l\'effacement (« droit à l\'oubli »)',
              'Droit à la portabilité',
              "Droit d'opposition",
              'Droit à la limitation du traitement',
            ]} />
            <p>
              Pour exercer ces droits, contacte-nous à l'adresse <a href="mailto:contact@did-job.com" style={LIEN}>contact@did-job.com</a>. Nous nous engageons à te répondre sous 30 jours maximum.
            </p>
          </Section>

          <Section title="8. Cookies">
            <Liste items={[
              'DidJob utilise uniquement des cookies techniques essentiels (session, authentification)',
              'Aucun cookie publicitaire',
              'Aucun tracking tiers',
            ]} />
          </Section>

          <Section title="9. Modifications">
            <p>
              En cas de changement important de cette politique, nous t'en informerons par email. La date de dernière mise à jour est affichée en haut de cette page.
            </p>
          </Section>

          <Section title="10. Autorité de contrôle">
            <p>
              Si tu estimes que tes droits ne sont pas respectés, tu peux introduire une réclamation auprès de la CNIL (Commission Nationale de l'Informatique et des Libertés) :
            </p>
            <p>
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={LIEN}>www.cnil.fr</a>
            </p>
          </Section>

          <SousTitre>Une question ?</SousTitre>
          <div style={{ fontFamily: FONT_CORPS, fontSize: '16px', lineHeight: '1.8', color: '#374151' }}>
            Pour toute question relative à cette politique ou à tes données personnelles, écris-nous à <a href="mailto:contact@did-job.com" style={LIEN}>contact@did-job.com</a>.
          </div>

          <div style={{ marginTop: '64px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
            <a href="/" style={{ fontFamily: FONT_CORPS, color: '#4f46e5', textDecoration: 'none', fontWeight: '600', fontSize: '15px' }}>← Retour à l'accueil</a>
          </div>
        </div>
      </div>
    </div>
  )
}
