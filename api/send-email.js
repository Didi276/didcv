// Nécessite la variable d'environnement RESEND_API_KEY (https://resend.com).
// Le domaine d'expédition par défaut (onboarding@resend.dev) est celui de test
// de Resend, sans domaine vérifié. Remplace FROM_EMAIL par une adresse sur un
// domaine vérifié dans ton compte Resend avant la mise en prod.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'DidCV <onboarding@resend.dev>'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API email manquante' })
  }

  const { to, subject, html } = req.body
  if (!to || !subject || !html) {
    return res.status(400).json({ error: 'Paramètres manquants (to, subject, html)' })
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
    })

    const data = await response.json()
    if (!response.ok) return res.status(response.status).json(data)
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
