// Rappels d'entretien J-3 et J-1, envoyés par un cron GitHub Actions
// (voir .github/workflows/interview-reminder.yml). Nécessite les variables
// d'environnement VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et RESEND_API_KEY.

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import ws from 'ws'

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: ws },
})

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

async function sendReminderEmail(to, prenom, poste, entreprise, dateEntretien, joursAvant) {
  const dateFormatee = new Date(dateEntretien).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  })

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'DidJob <noreply@did-job.com>',
      to,
      subject: `Rappel : Entretien chez ${entreprise} dans ${joursAvant} jour${joursAvant > 1 ? 's' : ''} ⏰`,
      html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #0a0a0f; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
          <h1 style="color: white; font-size: 28px; margin: 0;">Did<span style="color: #6366f1;">Job</span></h1>
          <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0;">Trouve ton prochain poste.</p>
        </div>
        <h2 style="color: #0f0f1a; font-size: 22px;">Bonjour ${prenom} 👋</h2>
        <p style="color: #4b5563; line-height: 1.7;">
          Ton entretien pour le poste de <strong>${poste}</strong> chez <strong>${entreprise}</strong>
          approche : c'est dans ${joursAvant} jour${joursAvant > 1 ? 's' : ''}.
        </p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 24px; margin: 24px 0;">
          <p style="color: #0f0f1a; font-weight: 600; margin: 0 0 12px;">Détails :</p>
          <ul style="color: #4b5563; line-height: 2; margin: 0; padding-left: 20px;">
            <li>Poste : ${poste}</li>
            <li>Entreprise : ${entreprise}</li>
            <li>Date : ${dateFormatee}</li>
          </ul>
        </div>
        <a href="https://did-job.com/preparation-entretien"
           style="display: inline-block; background: #0f0f1a; color: white;
                  padding: 14px 28px; border-radius: 8px; text-decoration: none;
                  font-weight: 600; margin-top: 8px;">
          Préparer mon entretien →
        </a>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 40px;">
          DidJob · did-job.com ·
          <a href="https://did-job.com/privacy" style="color: #9ca3af;">Politique de confidentialité</a>
        </p>
      </div>`,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend ${res.status}: ${body}`)
  }
}

async function main() {
  const aujourd_hui = new Date()
  aujourd_hui.setHours(0, 0, 0, 0)
  const j1 = new Date(aujourd_hui.getTime() + 1 * 86400000)
  const j3 = new Date(aujourd_hui.getTime() + 3 * 86400000)

  const { data: candidatures, error } = await supabase
    .from('candidatures')
    .select('poste, entreprise, date_entretien, profiles!inner(email, prenom)')
    .in('statut', ['entretien'])
    .not('date_entretien', 'is', null)
    .in('date_entretien', [formatDate(j1), formatDate(j3)])

  if (error) {
    console.error('Erreur requête Supabase:', error)
    process.exit(1)
  }

  let envoyes = 0
  for (const c of candidatures || []) {
    const dateEntretien = new Date(c.date_entretien)
    const diff = Math.round((dateEntretien.setHours(0, 0, 0, 0) - aujourd_hui.getTime()) / 86400000)
    const joursAvant = diff === 1 ? 1 : diff === 3 ? 3 : null
    if (!joursAvant || !c.profiles?.email) continue

    try {
      await sendReminderEmail(
        c.profiles.email,
        c.profiles.prenom || 'là',
        c.poste,
        c.entreprise,
        c.date_entretien,
        joursAvant
      )
      console.log(`✅ Rappel J-${joursAvant} envoyé à ${c.profiles.email} (${c.entreprise})`)
      envoyes++
    } catch (e) {
      console.error(`❌ Échec envoi à ${c.profiles.email}:`, e.message)
    }
  }

  console.log(`🎉 ${envoyes} rappels envoyés`)
}

async function sendMatchingEmails() {
  // Récupérer tous les utilisateurs actifs
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, email, prenom, poste_souhaite, competences, ville')
    .not('poste_souhaite', 'is', null)

  if (!profiles?.length) return

  // Récupérer les offres récentes
  const { data: offres } = await supabase
    .from('offres_directes')
    .select('id, titre, entreprise, lieu, description, type_contrat, url_candidature')
    .eq('actif', true)
    .order('date_publication', { ascending: false })
    .limit(100)

  for (const profil of profiles.slice(0, 50)) {
    try {
      // Matching simple par mots-clés sans Claude pour économiser les tokens
      const poste = (profil.poste_souhaite || '').toLowerCase()
      const competences = (profil.competences || '').toLowerCase()
      const ville = (profil.ville || '').toLowerCase()

      const offresMatchees = offres
        .filter(o => {
          const titre = (o.titre || '').toLowerCase()
          const desc = (o.description || '').toLowerCase()
          const lieu = (o.lieu || '').toLowerCase()

          const matchPoste = poste.split(' ').some(m => m.length > 3 && (titre.includes(m) || desc.includes(m)))
          const matchVille = !ville || lieu.includes(ville) || lieu.includes('france') || lieu.includes('remote')

          return matchPoste && matchVille
        })
        .slice(0, 5)

      if (offresMatchees.length === 0) continue

      const offresHtml = offresMatchees.map(o => `
        <tr>
          <td style="padding: 16px; border-bottom: 1px solid #f0f0f0;">
            <div style="font-weight: 600; color: #0f0f1a;">${o.titre}</div>
            <div style="color: #6b7280; font-size: 13px; margin-top: 3px;">${o.entreprise} · ${o.lieu}</div>
            <a href="${o.url_candidature}" style="color: #6366f1; font-size: 13px; text-decoration: none;">
              Voir l'offre →
            </a>
          </td>
        </tr>
      `).join('')

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DidJob <noreply@did-job.com>',
          to: profil.email,
          subject: `${offresMatchees.length} offres pour toi aujourd'hui 🎯`,
          html: `
          <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: #0a0a0f; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
              <h1 style="color: white; font-size: 28px; margin: 0;">Did<span style="color: #6366f1;">Job</span></h1>
            </div>
            <h2 style="color: #0f0f1a;">Bonjour ${profil.prenom || ''} 👋</h2>
            <p style="color: #4b5563; line-height: 1.7;">
              Voici les offres qui correspondent à ton profil <strong>${profil.poste_souhaite}</strong> aujourd'hui :
            </p>
            <table width="100%" style="border-collapse: collapse; background: #f9fafb; border-radius: 8px; overflow: hidden; margin: 24px 0;">
              ${offresHtml}
            </table>
            <a href="https://did-job.com/offres?query=${encodeURIComponent(profil.poste_souhaite || '')}"
               style="display: inline-block; background: #0f0f1a; color: white;
                      padding: 14px 28px; border-radius: 8px; text-decoration: none;
                      font-weight: 600;">
              Voir toutes les offres →
            </a>
            <p style="color: #9ca3af; font-size: 12px; margin-top: 40px;">
              Tu reçois cet email parce que tu as un compte DidJob.
              <a href="https://did-job.com/profile" style="color: #9ca3af;">Modifier mes préférences</a>
            </p>
          </div>`
        })
      })

      console.log(`✅ Email matching envoyé à ${profil.email}`)
      await new Promise(r => setTimeout(r, 200))
    } catch (e) {
      console.error(`Erreur pour ${profil.email}:`, e.message)
    }
  }
}

async function runAll() {
  await main() // rappels entretien
  await sendMatchingEmails() // offres du jour
}

runAll().catch(console.error)
