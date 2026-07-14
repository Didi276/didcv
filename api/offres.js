// api/offres.js — JSearch + Adzuna + France Travail

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { query = '', location = 'France', page = 1 } = req.query
  if (!query) return res.status(400).json({ error: 'query requis' })

  const withTimeout = (promise, ms) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), ms))
    ])

  // ─── Token France Travail (OAuth2) ──────────────────────
  const getFTToken = async () => {
    const r = await fetch('https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: process.env.FT_CLIENT_ID,
        client_secret: process.env.FT_CLIENT_SECRET,
        scope: 'api_offresdemploiv2 o2dsoffre'
      })
    })
    const data = await r.json()
    return data.access_token
  }

  const searchQuery = `${query} ${location !== 'France' ? location : ''}`.trim()

  const [jsearchRes, adzunaRes, ftRes] = await Promise.allSettled([

    // ─── JSearch ────────────────────────────────────────────
    withTimeout(
      fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery + ' France')}&page=${page}&num_pages=1&country=fr&language=fr`, {
        headers: {
          'x-rapidapi-key': 'a1eb109746mshcdf88fee398e505p133d06jsn1a219dd0e6c6',
          'x-rapidapi-host': 'jsearch.p.rapidapi.com'
        }
      }).then(r => r.json()),
      8000
    ),

    // ─── Adzuna ─────────────────────────────────────────────
    withTimeout(
      fetch(`https://api.adzuna.com/v1/api/jobs/fr/search/${page}?app_id=c07dfdb2&app_key=7acb6df75a80e2623290c5d84559e278&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}&results_per_page=20`)
        .then(r => r.json()),
      8000
    ),

    // ─── France Travail ─────────────────────────────────────
    withTimeout(
      getFTToken().then(token => {
        if (!token) throw new Error('Token FT invalide')
        const params = new URLSearchParams({
          motsCles: query,
          lieuTravail: location !== 'France' ? location : '',
          range: '0-49',
          sort: '1'
        })
        return fetch(`https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        }).then(r => r.json())
      }),
      9000
    )
  ])

  const offres = []

  // ─── JSearch ────────────────────────────────────────────
  if (jsearchRes.status === 'fulfilled' && jsearchRes.value?.data) {
    jsearchRes.value.data.forEach(job => {
      offres.push({
        id: job.job_id,
        source: 'JSearch',
        titre: job.job_title || '',
        entreprise: job.employer_name || '',
        lieu: job.job_city ? `${job.job_city}` : 'France',
        date: job.job_posted_at_datetime_utc || '',
        description: (job.job_description || '').substring(0, 500),
        url: job.job_apply_link || job.job_google_link || '',
        type: job.job_employment_type || '',
        remote: job.job_is_remote || false,
      })
    })
  }

  // ─── Adzuna ─────────────────────────────────────────────
  if (adzunaRes.status === 'fulfilled' && adzunaRes.value?.results) {
    adzunaRes.value.results.forEach(job => {
      offres.push({
        id: `adzuna-${job.id}`,
        source: 'Adzuna',
        titre: job.title || '',
        entreprise: job.company?.display_name || '',
        lieu: job.location?.display_name || '',
        date: job.created || '',
        description: (job.description || '').substring(0, 500),
        url: job.redirect_url || '',
        type: job.contract_type || '',
        remote: false,
      })
    })
  }

  // ─── France Travail ─────────────────────────────────────
  if (ftRes.status === 'fulfilled' && ftRes.value?.resultats) {
    ftRes.value.resultats.forEach(job => {
      offres.push({
        id: `ft-${job.id}`,
        source: 'France Travail',
        titre: job.intitule || '',
        entreprise: job.entreprise?.nom || '',
        lieu: job.lieuTravail?.libelle || '',
        date: job.dateCreation || '',
        description: (job.description || '').substring(0, 500),
        url: job.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${job.id}`,
        type: job.typeContratLibelle || '',
        remote: job.experienceLibelle === 'Télétravail' || false,
        salaire: job.salaire?.libelle || '',
      })
    })
  }

  // Dédupliquer par titre+entreprise
  const seen = new Set()
  const dedup = offres.filter(o => {
    const key = `${o.titre.toLowerCase().trim()}-${o.entreprise.toLowerCase().trim()}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // Trier France Travail en premier, puis par date
  dedup.sort((a, b) => {
    if (a.source === 'France Travail' && b.source !== 'France Travail') return -1
    if (b.source === 'France Travail' && a.source !== 'France Travail') return 1
    return new Date(b.date) - new Date(a.date)
  })

  return res.status(200).json({ offres: dedup, total: dedup.length })
}
