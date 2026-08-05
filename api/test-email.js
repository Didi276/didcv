import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'DidJob <noreply@did-job.com>',
      to: 'fernandochokki@gmail.com',
      subject: 'Test DidJob - Email fonctionnel',
      html: '<h1>DidJob fonctionne !</h1><p>Les emails sont configurés sur did-job.com</p>'
    })
    if (error) return res.status(400).json({ error })
    return res.status(200).json({ success: true, id: data.id })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
