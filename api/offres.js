// api/offres.js — Vercel Function
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { query = '', location = 'France', page = 1 } = req.query
  if (!query) return res.status(400).json({ error: 'query requis' })

  const searchQuery = location && location !== 'France'
    ? `${query} ${location}` : `${query} France`

  // Timeout 8s pour éviter le timeout Vercel (10s max)
  const withTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ])

  const [jsearchRes, adzunaRes] = await Promise.allSettled([

    // ─── JSearch ───────────────────────────────────────────
    withTimeout(
      fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=${page}&num_pages=1&country=fr&language=fr&date_posted=all`, {
        headers: {
          'x-rapidapi-key': 'a1eb109746mshcdf88fee398e505p133d06jsn1a219dd0e6c6',
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
      }).then(r => r.json()),
      8000
    ),

    // ─── Adzuna ────────────────────────────────────────────
    withTimeout(
      fetch(`https://api.adzuna.com/v1/api/jobs/fr/search/${page}?app_id=c07dfdb2&app_key=7acb6df75a80e2623290c5d84559e278&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}&results_per_page=20&content-type=application/json`)
        .then(r => r.json()),
      8000
    )
  ])

  const offres = []
  const erreurs = []

  // ─── JSearch ───────────────────────────────────────────
  if (jsearchRes.status === 'fulfilled' && jsearchRes.value?.data) {
    jsearchRes.value.data.forEach(job => {
      offres.push({
        id: job.job_id,
        source: 'JSearch',
        titre: job.job_title || '',
        entreprise: job.employer_name || '',
        lieu: job.job_city
          ? `${job.job_city}${job.job_state ? ', ' + job.job_state : ''}`
          : job.job_country || 'France',
        date: job.job_posted_at_datetime_utc || '',
        description: job.job_description?.substring(0, 600) || '',
        url: job.job_apply_link || job.job_google_link || '',
        logo: job.employer_logo || null,
        type: job.job_employment_type || '',
        remote: job.job_is_remote || false,
      })
    })
  } else {
    erreurs.push(`JSearch: ${jsearchRes.reason?.message || 'erreur'}`)
  }

  // ─── Adzuna ────────────────────────────────────────────
  if (adzunaRes.status === 'fulfilled' && adzunaRes.value?.results) {
    adzunaRes.value.results.forEach(job => {
      offres.push({
        id: `adzuna-${job.id}`,
        source: 'Adzuna',
        titre: job.title || '',
        entreprise: job.company?.display_name || '',
        lieu: job.location?.display_name || '',
        date: job.created || '',
        description: job.description?.substring(0, 600) || '',
        url: job.redirect_url || '',
        logo: null,
        type: job.contract_type || '',
        remote: false,
      })
    })
  } else {
    erreurs.push(`Adzuna: ${adzunaRes.reason?.message || 'erreur'}`)
  }

  // Dédupliquer par titre+entreprise
  const seen = new Set()
  const deduplicated = offres.filter(o => {
    const key = `${o.titre.toLowerCase()}-${o.entreprise.toLowerCase()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Trier par date (plus récent en premier)
  deduplicated.sort((a, b) => new Date(b.date) - new Date(a.date))

  return res.status(200).json({
    offres: deduplicated,
    total: deduplicated.length,
    errors: erreurs
  })
}
