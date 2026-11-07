import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// Cache en mémoire (instance chaude Vercel) : on ne recalcule pas à chaque visite.
let CACHE = { at: 0, data: null }
const TTL = 1000 * 60 * 30 // 30 minutes

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)),
  ])
}

async function computeStats() {
  // 1. Offres directes actives (count exact, rapide)
  const pDirectes = (async () => {
    try {
      const { count } = await supabase
        .from('offres_directes')
        .select('*', { count: 'exact', head: true })
        .eq('actif', true)
      return count || 0
    } catch { return 0 }
  })()

  // 2. Entreprises distinctes RÉELLES — on pagine toute la table,
  //    pas seulement les 1000 premières lignes (cause du faux "67").
  const pEntreprises = (async () => {
    try {
      const noms = new Set()
      const PAGE = 1000
      let from = 0
      while (true) {
        const { data, error } = await supabase
          .from('offres_directes')
          .select('entreprise')
          .eq('actif', true)
          .not('entreprise', 'is', null)
          .range(from, from + PAGE - 1)
        if (error || !data || data.length === 0) break
        for (const o of data) {
          const n = o.entreprise?.trim().toLowerCase()
          if (n) noms.add(n)
        }
        if (data.length < PAGE) break
        from += PAGE
        if (from > 200000) break // garde-fou
      }
      return noms.size
    } catch { return 0 }
  })()

  // 3. Dernière mise à jour du scraping
  const pMaj = (async () => {
    try {
      const { data } = await supabase
        .from('offres_directes')
        .select('date_scraping')
        .order('date_scraping', { ascending: false })
        .limit(1)
      return data?.[0]?.date_scraping || null
    } catch { return null }
  })()

  // 4. France Travail — volume total disponible (timeout 3,5 s)
  const pFT = (async () => {
    try {
      const tokenRes = await withTimeout(fetch(
        'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: process.env.FT_CLIENT_ID,
            client_secret: process.env.FT_CLIENT_SECRET,
            scope: 'api_offresdemploiv2 o2dsoffre'
          })
        }
      ), 3500)
      const { access_token } = await tokenRes.json()
      const r = await withTimeout(fetch(
        'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?range=0-1',
        { headers: { Authorization: `Bearer ${access_token}` } }
      ), 3500)
      const contentRange = r.headers.get('Content-Range')
      return contentRange ? parseInt(contentRange.split('/')[1]) : 0
    } catch { return 0 }
  })()

  // 5. Adzuna — volume total France (timeout 3,5 s)
  const pAdzuna = (async () => {
    try {
      const appId = process.env.ADZUNA_APP_ID || 'c07dfdb2'
      const appKey = process.env.ADZUNA_APP_KEY || '7acb6df75a80e2623290c5d84559e278'
      const r = await withTimeout(fetch(
        `https://api.adzuna.com/v1/api/jobs/fr/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=1`
      ), 3500)
      const d = await r.json()
      return d.count || 0
    } catch { return 0 }
  })()

  const [directes, entreprises, derniereMaj, franceTravail, adzuna] =
    await Promise.all([pDirectes, pEntreprises, pMaj, pFT, pAdzuna])

  return {
    directes,
    entreprises,
    franceTravail,
    adzuna,
    total: directes + franceTravail + adzuna,
    derniereMaj,
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Sert le cache s'il est encore frais
  if (CACHE.data && Date.now() - CACHE.at < TTL) {
    res.setHeader('X-Cache', 'HIT')
    return res.status(200).json(CACHE.data)
  }

  try {
    const stats = await computeStats()
    CACHE = { at: Date.now(), data: stats }
    res.setHeader('X-Cache', 'MISS')
    return res.status(200).json(stats)
  } catch (e) {
    // En cas d'échec, on sert le dernier cache connu si disponible
    if (CACHE.data) return res.status(200).json(CACHE.data)
    return res.status(200).json({
      directes: 0, entreprises: 0, franceTravail: 0, adzuna: 0, total: 0, derniereMaj: null
    })
  }
}
