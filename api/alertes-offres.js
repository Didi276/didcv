// Cron quotidien (voir vercel.json) : envoie à chaque utilisateur ayant activé
// ses rappels et renseigné un poste recherché les NOUVELLES offres directes
// correspondant à son profil, scrapées depuis sa dernière alerte.
// Aucun email n'est envoyé s'il n'y a rien de nouveau.
//
// Variables d'environnement : VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
// RESEND_API_KEY, CRON_SECRET (optionnel).
//
// Pré-requis SQL (à exécuter une fois dans Supabase) :
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS derniere_alerte_offres timestamptz;

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailAlertesOffres } from '../src/emailTemplates.js'

export const config = { maxDuration: 60 }

const normalise = (s) => (s || '')
  .normalize('NFD')
  .replace(/[̀-ͯ]/g, '')
  .toLowerCase()

function motsCles(profil) {
  const base = [profil.poste_souhaite, ...(profil.secteurs_souhaites || [])]
    .filter(Boolean)
    .join(' ')
  return [...new Set(normalise(base).split(/[^a-z0-9]+/).filter(m => m.length > 2))].slice(0, 8)
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const resend = new Resend(process.env.RESEND_API_KEY)

  // Candidats aux alertes : profil avec email, poste recherché, rappels non désactivés.
  const { data: profils, error } = await supabase
    .from('profiles')
    .select('user_id, prenom, email, poste_souhaite, secteurs_souhaites, rappels_email, derniere_alerte_offres')
    .not('email', 'is', null)
    .not('poste_souhaite', 'is', null)

  if (error) return res.status(500).json({ error: error.message })
  if (!profils?.length) return res.status(200).json({ envoyes: 0, analyses: 0 })

  const maintenant = new Date().toISOString()
  const il_y_a_24h = new Date(Date.now() - 24 * 3600 * 1000).toISOString()

  let envoyes = 0
  let analyses = 0

  for (const profil of profils) {
    if (profil.rappels_email === false) continue
    if (!profil.email || !profil.poste_souhaite) continue

    const mots = motsCles(profil)
    if (!mots.length) continue
    analyses++

    const depuis = profil.derniere_alerte_offres || il_y_a_24h
    const orC = mots.map(m => `titre.ilike.%${m}%,description.ilike.%${m}%`).join(',')

    const { data: offres } = await supabase
      .from('offres_directes')
      .select('id, titre, entreprise, lieu, type_contrat, url_candidature, date_scraping')
      .eq('actif', true)
      .gt('date_scraping', depuis)
      .or(orC)
      .order('date_scraping', { ascending: false })
      .limit(8)

    if (offres && offres.length) {
      const html = emailAlertesOffres(
        profil.prenom || '',
        offres.map(o => ({ ...o, url: o.url_candidature })),
        profil.poste_souhaite,
      )
      try {
        await resend.emails.send({
          from: 'DidJob <noreply@did-job.com>',
          to: profil.email,
          subject: offres.length > 1 ? `${offres.length} nouvelles offres pour toi` : 'Une nouvelle offre pour toi',
          html,
        })
        envoyes++
        await supabase.from('profiles').update({ derniere_alerte_offres: maintenant }).eq('user_id', profil.user_id)
      } catch (e) {
        console.error('Erreur envoi alerte offres', profil.user_id, e)
      }
    } else {
      // Rien de nouveau : on avance la fenêtre pour ne pas réanalyser les mêmes offres.
      await supabase.from('profiles').update({ derniere_alerte_offres: maintenant }).eq('user_id', profil.user_id)
    }
  }

  return res.status(200).json({ envoyes, analyses })
}
