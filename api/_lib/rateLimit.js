// Rate limiting en mémoire, par instance de fonction serverless. N'offre pas
// de garantie stricte si Vercel répartit les requêtes sur plusieurs instances
// froides, mais suffit à limiter les abus basiques sans dépendance externe
// (Redis/Upstash) sur un projet à faible trafic.
//
// Utilitaire partagé — ce fichier n'exporte pas de handler par défaut et
// n'est donc pas une route API.

const hits = new Map()

function getIp(req) {
  const fwd = req.headers['x-forwarded-for']
  if (fwd) return fwd.split(',')[0].trim()
  return req.socket?.remoteAddress || 'unknown'
}

// Retourne true si la requête est autorisée. Si la limite est dépassée,
// répond directement avec un 429 et retourne false — l'appelant doit alors
// `return` immédiatement sans continuer le traitement.
export function rateLimit(req, res, { limit = 20, windowMs = 60_000, key } = {}) {
  const id = key || getIp(req)
  const now = Date.now()

  // Nettoyage paresseux des entrées expirées pour éviter une fuite mémoire.
  if (hits.size > 5000) {
    for (const [k, v] of hits) {
      if (now - v.start > windowMs) hits.delete(k)
    }
  }

  const entry = hits.get(id)
  if (!entry || now - entry.start > windowMs) {
    hits.set(id, { start: now, count: 1 })
    return true
  }

  entry.count++
  if (entry.count > limit) {
    res.status(429).json({ error: 'Trop de requêtes, réessaie dans quelques instants.' })
    return false
  }
  return true
}
