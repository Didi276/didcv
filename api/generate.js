// Proxy IA générique — migré de Claude (Anthropic) vers Qwen-Turbo (API
// Alibaba Cloud, compatible OpenAI). Le front (Generate.jsx, LettreMot.jsx,
// Entretien.jsx, PreparationEntretien.jsx, ATSScore.jsx, Formations.jsx,
// Profile.jsx, SuggestionsIA.jsx) envoie et attend toujours le format
// Anthropic ({ system, messages } en entrée, { content: [{ text }] } en
// sortie) — on traduit dans les deux sens ici plutôt que de modifier tous
// ces appelants.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.QWEN_API_KEY
  const baseUrl = process.env.QWEN_BASE_URL

  if (!apiKey || !baseUrl) {
    return res.status(500).json({ error: 'Clé API manquante' })
  }

  const { system, messages = [], max_tokens } = req.body
  const qwenMessages = system
    ? [{ role: 'system', content: system }, ...messages]
    : messages

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        max_tokens,
        messages: qwenMessages,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Erreur API Qwen' })
    }

    const texte = data.choices?.[0]?.message?.content || ''
    res.status(200).json({ content: [{ type: 'text', text: texte }] })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

/* ─── Ancien code (Anthropic Claude Haiku) ──────────────────────────────

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API manquante' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    })

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

──────────────────────────────────────────────────────────────────────── */
