// Cron quotidien à 9h (voir vercel.json) qui envoie les rappels J-3 et J-1
// avant chaque entretien planifié. Un navigateur ne peut pas déclencher un
// email à une date future tout seul : cette route tourne côté serveur,
// indépendamment de toute session utilisateur.
//
// SQL à exécuter dans Supabase :
// ALTER TABLE entretiens ADD COLUMN IF NOT EXISTS rappel_j3_envoye BOOLEAN DEFAULT false;
// ALTER TABLE entretiens ADD COLUMN IF NOT EXISTS rappel_j1_envoye BOOLEAN DEFAULT false;
//
// Variables d'environnement nécessaires (en plus de RESEND_API_KEY) :
// - SUPABASE_SERVICE_ROLE_KEY (Supabase > Project Settings > API > service_role secret)
//   pour lire les entretiens de tous les utilisateurs sans session (contourne la RLS).
// - CRON_SECRET (optionnel mais recommandé) pour empêcher un appel public de cette route.

import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { emailPreparationEntretien, emailRappelEntretien } from '../src/emailTemplates.js'

export default async function handler(req, res) {
  if (process.env.CRON_SECRET && req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabaseAdmin = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  const resend = new Resend(process.env.RESEND_API_KEY)

  const maintenant = new Date()
  const dansTroisJours = new Date(maintenant.getTime() + 3 * 86400000)
  const debut = new Date(maintenant.getTime() + 86400000)
  debut.setHours(0, 0, 0, 0)
  const fin = new Date(dansTroisJours)
  fin.setHours(23, 59, 59, 999)

  const { data: entretiensAVenir, error } = await supabaseAdmin
    .from('entretiens')
    .select('id, user_id, type, date_entretien, lieu, rappel_j3_envoye, rappel_j1_envoye, candidatures(titre, entreprise)')
    .gte('date_entretien', debut.toISOString())
    .lte('date_entretien', fin.toISOString())

  if (error) return res.status(500).json({ error: error.message })

  const aTraiter = (entretiensAVenir || [])
    .map(en => ({ ...en, joursRestants: Math.round((new Date(en.date_entretien) - maintenant) / 86400000) }))
    .filter(en => (en.joursRestants === 3 && !en.rappel_j3_envoye) || (en.joursRestants === 1 && !en.rappel_j1_envoye))

  if (!aTraiter.length) return res.status(200).json({ envoyes: 0 })

  const userIds = [...new Set(aTraiter.map(en => en.user_id))]
  const { data: profils } = await supabaseAdmin.from('profiles').select('user_id, prenom, email, rappels_email').in('user_id', userIds)
  const profilParUser = Object.fromEntries((profils || []).map(p => [p.user_id, p]))

  let envoyes = 0
  for (const en of aTraiter) {
    const profil = profilParUser[en.user_id]
    if (!profil?.email || profil.rappels_email === false) continue

    const poste = en.candidatures?.titre || ''
    const entreprise = en.candidatures?.entreprise || ''
    const estJ3 = en.joursRestants === 3

    const html = estJ3
      ? emailPreparationEntretien(profil.prenom || '', poste, entreprise, en.date_entretien, '<p>Prépare ta checklist personnalisée directement sur DidJob.</p>')
      : emailRappelEntretien(profil.prenom || '', poste, entreprise, new Date(en.date_entretien).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), en.lieu || '')

    try {
      await resend.emails.send({
        from: 'DidJob <noreply@didcv.fr>',
        to: profil.email,
        subject: estJ3 ? `Ton entretien approche - ${poste}` : `Ton entretien est demain - ${poste}`,
        html,
      })
      await supabaseAdmin.from('entretiens').update(estJ3 ? { rappel_j3_envoye: true } : { rappel_j1_envoye: true }).eq('id', en.id)
      envoyes++
    } catch (e) {
      console.error('Erreur envoi rappel entretien', en.id, e)
    }
  }

  return res.status(200).json({ envoyes })
}
