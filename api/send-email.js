// Nécessite la variable d'environnement RESEND_API_KEY (compte gratuit sur
// resend.com). L'adresse d'expédition noreply@didcv.fr doit être vérifiée
// (DNS) dans le compte Resend, sinon l'envoi échoue.
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { to, subject, html, type } = req.body
  try {
    const { data, error } = await resend.emails.send({
      from: 'DidCV <noreply@didcv.fr>',
      to,
      subject,
      html,
    })
    if (error) return res.status(400).json({ error })
    return res.status(200).json({ success: true, id: data.id, type })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
