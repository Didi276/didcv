// api/offres.js — France Travail + JSearch + Adzuna

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const {
    query = '',
    location = '',
    typeContrat = '',
    experience = '',
    publieeDepuis = '',
    teletravail = '',
    page = 1
  } = req.query

  if (!query) return res.status(400).json({ error: 'query requis' })

  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))])

  // ─── Token France Travail OAuth2 ───────────────────────
  const getFTToken = async () => {
    const r = await fetch(
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
    const d = await r.json()
    return d.access_token
  }

  // ─── France Travail search ─────────────────────────────
  const searchFT = async () => {
    const token = await getFTToken()
    if (!token) throw new Error('Token FT invalide')

    const params = new URLSearchParams()
    params.set('motsCles', query)
    params.set('range', '0-149') // 150 offres max
    params.set('sort', '1') // par date

    if (location) params.set('lieuTravail.libelle', location)
    if (typeContrat) params.set('typeContrat', typeContrat)
    if (experience) params.set('experience', experience)
    if (publieeDepuis) params.set('publieeDepuis', publieeDepuis)
    if (teletravail === 'true') params.set('modesTravailLibelle', 'Télétravail complet,Télétravail partiel')

    const r = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    return r.json()
  }

  // ─── Appels parallèles ─────────────────────────────────
  const [ftRes, jsearchRes, adzunaRes] = await Promise.allSettled([

    withTimeout(searchFT(), 9000),

    withTimeout(
      fetch(
        `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query + (location ? ' ' + location : '') + ' France')}&page=${page}&num_pages=1&country=fr`,
        {
          headers: {
            'x-rapidapi-key': 'a1eb109746mshcdf88fee398e505p133d06jsn1a219dd0e6c6',
            'x-rapidapi-host': 'jsearch.p.rapidapi.com'
          }
        }
      ).then(r => r.json()),
      8000
    ),

    withTimeout(
      fetch(
        `https://api.adzuna.com/v1/api/jobs/fr/search/${page}?app_id=c07dfdb2&app_key=7acb6df75a80e2623290c5d84559e278&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location || 'France')}&results_per_page=20`
      ).then(r => r.json()),
      8000
    )
  ])

  const offres = []

  // ─── France Travail ────────────────────────────────────
  if (ftRes.status === 'fulfilled' && ftRes.value?.resultats) {
    ftRes.value.resultats.forEach(job => {
      offres.push({
        id: `ft-${job.id}`,
        source: 'France Travail',
        titre: job.intitule || '',
        entreprise: job.entreprise?.nom || '',
        lieu: job.lieuTravail?.libelle || '',
        date: job.dateCreation || '',
        description: (job.description || '').substring(0, 600),
        url: job.origineOffre?.urlOrigine || `https://candidat.francetravail.fr/offres/recherche/detail/${job.id}`,
        type: job.typeContratLibelle || '',
        salaire: job.salaire?.libelle || '',
        experience: job.experienceLibelle || '',
        formation: job.niveauFormation?.libelle || '',
        remote: (job.lieuTravail?.libelle || '').toLowerCase().includes('télétravail'),
      })
    })
  }

  // ─── JSearch ──────────────────────────────────────────
  if (jsearchRes.status === 'fulfilled' && jsearchRes.value?.data) {
    jsearchRes.value.data.forEach(job => {
      offres.push({
        id: job.job_id,
        source: 'JSearch',
        titre: job.job_title || '',
        entreprise: job.employer_name || '',
        lieu: job.job_city || 'France',
        date: job.job_posted_at_datetime_utc || '',
        description: (job.job_description || '').substring(0, 600),
        url: job.job_apply_link || job.job_google_link || '',
        type: job.job_employment_type || '',
        salaire: job.job_min_salary ? `${job.job_min_salary}€ - ${job.job_max_salary}€` : '',
        experience: '',
        formation: '',
        remote: job.job_is_remote || false,
      })
    })
  }

  // ─── Adzuna ───────────────────────────────────────────
  if (adzunaRes.status === 'fulfilled' && adzunaRes.value?.results) {
    adzunaRes.value.results.forEach(job => {
      offres.push({
        id: `adzuna-${job.id}`,
        source: 'Adzuna',
        titre: job.title || '',
        entreprise: job.company?.display_name || '',
        lieu: job.location?.display_name || '',
        date: job.created || '',
        description: (job.description || '').substring(0, 600),
        url: job.redirect_url || '',
        type: job.contract_type || '',
        salaire: job.salary_min ? `${Math.round(job.salary_min)}€ - ${Math.round(job.salary_max)}€` : '',
        experience: '',
        formation: '',
        remote: false,
      })
    })
  }

  // ─── Déduplication ────────────────────────────────────
  const seen = new Set()
  const dedup = offres.filter(o => {
    const key = `${o.titre.toLowerCase().slice(0, 30)}-${o.entreprise.toLowerCase().slice(0, 20)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // France Travail en premier, puis par date
  dedup.sort((a, b) => {
    if (a.source === 'France Travail' && b.source !== 'France Travail') return -1
    if (b.source === 'France Travail' && a.source !== 'France Travail') return 1
    return new Date(b.date) - new Date(a.date)
  })

  return res.status(200).json({
    offres: dedup,
    total: dedup.length,
    sources: {
      ft: ftRes.status === 'fulfilled' ? (ftRes.value?.resultats?.length || 0) : 0,
      jsearch: jsearchRes.status === 'fulfilled' ? (jsearchRes.value?.data?.length || 0) : 0,
      adzuna: adzunaRes.status === 'fulfilled' ? (adzunaRes.value?.results?.length || 0) : 0,
    }
  })
}
