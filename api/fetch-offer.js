export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'url requise' })
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await r.text()
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 6000)
    res.json({ contenu: text })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
