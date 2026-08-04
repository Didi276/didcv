import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const stats = {}

  // 1. Offres directes en base
  try {
    const { count } = await supabase
      .from('offres_directes')
      .select('*', { count: 'exact', head: true })
      .eq('actif', true)
    stats.directes = count || 0
  } catch { stats.directes = 0 }

  // 2. Nombre d'entreprises actives
  try {
    const { data } = await supabase
      .from('offres_directes')
      .select('entreprise')
      .eq('actif', true)
    stats.entreprises = new Set((data || []).map(o => o.entreprise)).size
  } catch { stats.entreprises = 0 }

  // 3. France Travail — volume total disponible
  try {
    const tokenRes = await fetch(
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
    )
    const { access_token } = await tokenRes.json()
    const r = await fetch(
      'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?range=0-1',
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    const contentRange = r.headers.get('Content-Range')
    stats.franceTravail = contentRange
      ? parseInt(contentRange.split('/')[1])
      : 0
  } catch { stats.franceTravail = 0 }

  // 4. Adzuna — volume total France
  try {
    const r = await fetch(
      'https://api.adzuna.com/v1/api/jobs/fr/search/1?app_id=c07dfdb2&app_key=7acb6df75a80e2623290c5d84559e278&results_per_page=1'
    )
    const d = await r.json()
    stats.adzuna = d.count || 0
  } catch { stats.adzuna = 0 }

  // 5. Total agrégé
  stats.total = stats.directes + stats.franceTravail + stats.adzuna

  // 6. Dernière mise à jour du scraping
  try {
    const { data } = await supabase
      .from('offres_directes')
      .select('date_scraping')
      .order('date_scraping', { ascending: false })
      .limit(1)
    stats.derniereMaj = data?.[0]?.date_scraping || null
  } catch { stats.derniereMaj = null }

  return res.status(200).json(stats)
}
