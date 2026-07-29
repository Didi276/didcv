// Cron hebdomadaire, tous les lundis 8h (voir vercel.json), qui envoie à
// chaque utilisateur actif un résumé de sa semaine : entretiens à venir,
// candidatures à relancer, et un conseil pioché dans le blog.
//
// Variables d'environnement nécessaires : RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY
// (les mêmes que api/interview-reminder.js), plus CRON_SECRET (optionnel).

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailResumeHebdomadaire } from '../src/emailTemplates.js'
import { ARTICLES } from '../src/blogData.js'

const LABELS_STATUT = {
  a_postuler: 'À postuler',
  postule: 'Postulé',
  entretien: 'Entretien',
  offre: 'Offre reçue',
  refuse: 'Refusé',
}

async function fetchUtilisateursActifs(supabaseAdmin) {
  const seuil = new Date(Date.now() - 30 * 86400000)
  const actifs = []
  let page = 1
  const perPage = 200
  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    const users = data?.users || []
    if (!users.length) break
    actifs.push(...users.filter(u => u.last_sign_in_at && new Date(u.last_sign_in_at) >= seuil))
    if (users.length < perPage) break
    page++
  }
  return actifs
}

function choisirConseilDeLaSemaine() {
  if (!ARTICLES?.length) return null
  const semaine = Math.floor(Date.now() / (7 * 86400000))
  const article = ARTICLES[semaine % ARTICLES.length]
  return { titre: article.titre, url: `https://didcv.vercel.app/blog/${article.slug}` }
}

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const resend = new Resend(process.env.RESEND_API_KEY)
  const conseil = choisirConseilDeLaSemaine()

  let utilisateursActifs
  try {
    utilisateursActifs = await fetchUtilisateursActifs(supabaseAdmin)
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }

  if (!utilisateursActifs.length) return res.status(200).json({ envoyes: 0 })

  const maintenant = new Date()
  const dansUneSemaine = new Date(maintenant.getTime() + 7 * 86400000)
  const ilYA14Jours = new Date(maintenant.getTime() - 14 * 86400000)

  let envoyes = 0
  for (const user of utilisateursActifs) {
    const { data: profil } = await supabaseAdmin.from('profiles').select('prenom, email, rappels_email').eq('user_id', user.id).maybeSingle()
    if (!profil?.email || profil.rappels_email === false) continue

    const { data: candidatures } = await supabaseAdmin.from('candidatures').select('id, statut, created_at').eq('user_id', user.id)
    if (!candidatures?.length) continue

    const parStatut = {}
    candidatures.forEach(c => { parStatut[c.statut] = (parStatut[c.statut] || 0) + 1 })
    const nbSansReponse = candidatures.filter(c => c.statut === 'postule' && new Date(c.created_at) <= ilYA14Jours).length

    const { data: entretiensSemaine } = await supabaseAdmin
      .from('entretiens')
      .select('id')
      .eq('user_id', user.id)
      .gte('date_entretien', maintenant.toISOString())
      .lte('date_entretien', dansUneSemaine.toISOString())

    const nbEntretiens = entretiensSemaine?.length || 0
    if (nbEntretiens === 0 && nbSansReponse === 0) continue

    const stats = {
      nbEntretiens,
      nbSansReponse,
      parStatutLabels: Object.entries(parStatut).map(([statut, n]) => ({ label: LABELS_STATUT[statut] || statut, n })),
    }

    const html = emailResumeHebdomadaire(profil.prenom || '', stats, conseil, nbEntretiens > 0 ? 'https://didcv.vercel.app/entretien' : null)

    try {
      await resend.emails.send({
        from: 'DidCV <noreply@didcv.fr>',
        to: profil.email,
        subject: 'Ton résumé de la semaine sur DidCV',
        html,
      })
      envoyes++
    } catch (e) {
      console.error('Erreur envoi résumé hebdomadaire', user.id, e)
    }
  }

  return res.status(200).json({ envoyes })
}
