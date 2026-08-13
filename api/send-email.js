// Nécessite la variable d'environnement RESEND_API_KEY (compte gratuit sur
// resend.com). L'adresse d'expédition noreply@did-job.com doit être vérifiée
// (DNS) dans le compte Resend, sinon l'envoi échoue.
import { Resend } from 'resend'
import { emailBienvenueDidJob } from '../src/emailTemplates.js'

const resend = new Resend(process.env.RESEND_API_KEY)

const HEADER_HTML = `
  <div style="background: #0a0a0f; padding: 32px; border-radius: 12px; text-align: center; margin-bottom: 32px;">
    <h1 style="color: white; font-size: 28px; margin: 0;">Did<span style="color: #6366f1;">Job</span></h1>
  </div>`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { to, subject, html, type, prenom, nom, entreprise, emailRecruteur, poste, message, raison } = req.body
  let mailTo = to
  let mailSubject = subject
  let mailHtml = html

  if (type === 'bienvenue') {
    mailSubject = 'Bienvenue sur DidJob !'
    mailHtml = emailBienvenueDidJob(prenom || 'là')
  } else if (type === 'nouvelle_demande_recruteur') {
    mailTo = 'contact@did-job.com'
    mailSubject = `Nouvelle demande recruteur : ${entreprise || ''}`
    mailHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      ${HEADER_HTML}
      <h2 style="color: #0f0f1a;">Nouvelle demande d'accès recruteur</h2>
      <ul style="color: #4b5563; line-height: 2;">
        <li><strong>${prenom || ''} ${nom || ''}</strong></li>
        <li>Entreprise : ${entreprise || ''}</li>
        <li>Poste : ${poste || ''}</li>
        <li>Email : ${emailRecruteur || ''}</li>
      </ul>
      ${message ? `<p style="color:#374151;background:#f9fafb;padding:14px;border-radius:8px;line-height:1.6;">${message}</p>` : ''}
      <a href="https://did-job.com/admin/recruteurs" style="display:inline-block;background:#0f0f1a;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;">Traiter la demande →</a>
    </div>`
  } else if (type === 'recruteur_valide') {
    mailSubject = 'Ton accès DidJob Recruteurs est validé 🎉'
    mailHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      ${HEADER_HTML}
      <h2 style="color: #0f0f1a;">Bonjour ${prenom || ''} 👋</h2>
      <p style="color: #4b5563; line-height: 1.7;">Bonne nouvelle : ton accès à la banque de talents DidJob a été validé.</p>
      <a href="https://did-job.com/recruteurs/connexion" style="display:inline-block;background:#0f0f1a;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;">Me connecter →</a>
    </div>`
  } else if (type === 'recruteur_refuse') {
    mailSubject = "À propos de ta demande d'accès DidJob Recruteurs"
    mailHtml = `
    <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
      ${HEADER_HTML}
      <h2 style="color: #0f0f1a;">Bonjour ${prenom || ''}</h2>
      <p style="color: #4b5563; line-height: 1.7;">
        Après étude, nous ne sommes pas en mesure de valider ta demande d'accès à la banque de talents DidJob pour le moment.${raison ? ` Motif : ${raison}` : ''}
      </p>
    </div>`
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'DidJob <noreply@did-job.com>',
      to: mailTo,
      subject: mailSubject,
      html: mailHtml,
    })
    if (error) return res.status(400).json({ error })
    return res.status(200).json({ success: true, id: data.id, type })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
