// api/offres.js — France Travail + JSearch + Adzuna + CareerJet + La Bonne Alternance

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
    page = '1'
  } = req.query

  if (!query) return res.status(400).json({ error: 'query requis' })

  const pageNum = parseInt(page) || 1
  const ftStart = (pageNum - 1) * 150
  const ftEnd = ftStart + 149

  const withTimeout = (p, ms) => Promise.race([p, new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms))])

  // ─── Token France Travail ──────────────────────────────
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
    return (await r.json()).access_token
  }

  // ─── France Travail ────────────────────────────────────
  const searchFT = async () => {
    const token = await getFTToken()
    if (!token) throw new Error('Token FT invalide')
    const params = new URLSearchParams()
    params.set('motsCles', query)
    params.set('range', `${ftStart}-${ftEnd}`)
    params.set('sort', '1')
    if (location) params.set('lieuTravail.libelle', location)
    if (typeContrat) params.set('typeContrat', typeContrat)
    if (experience) params.set('experience', experience)
    if (publieeDepuis) params.set('publieeDepuis', publieeDepuis)
    const r = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?${params}`,
      { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } }
    )
    return r.json()
  }

  // ─── Jooble (gratuit, sans inscription, HTTPS) ──────────
  const searchJooble = async () => {
    const r = await fetch(`https://jooble.org/api/${process.env.JOOBLE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        keywords: query,
        location: location || 'France',
        page: pageNum,
        resultonpage: 20
      })
    })
    return r.json()
  }

  // ─── La Bonne Alternance ───────────────────────────────
  const searchAlternance = async () => {
    if (typeContrat && typeContrat !== 'E1') return null // seulement si alternance demandée ou recherche générale
    const r = await fetch(
      `https://labonnealternance.apprentissage.beta.gouv.fr/api/V1/jobs?caller=DidCV&romes=&latitude=${location ? '' : '48.866'}&longitude=${location ? '' : '2.333'}&radius=100&insee=&sources=offres_emploi_partenaires`,
      { headers: { Accept: 'application/json' } }
    )
    return r.json()
  }

  // ─── Arbeitnow (gratuit, sans inscription, offres EU) ───
  const searchArbeitnow = async () => {
    const r = await fetch(
      `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}&page=${pageNum}`,
      { headers: { Accept: 'application/json' } }
    )
    return r.json()
  }

  // ─── RemoteOK (gratuit, sans inscription, offres remote) ─
  const searchRemoteOK = async () => {
    const r = await fetch(
      `https://remoteok.com/api?tag=${encodeURIComponent(query.split(' ')[0])}`,
      { headers: { 'User-Agent': 'DidCV/1.0' } }
    )
    return r.json()
  }

  // ─── Adzuna ───────────────────────────────────────────
  const searchAdzuna = async () => {
    const r = await fetch(
      `https://api.adzuna.com/v1/api/jobs/fr/search/${pageNum}?app_id=c07dfdb2&app_key=7acb6df75a80e2623290c5d84559e278&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location || 'France')}&results_per_page=20`
    )
    return r.json()
  }

  // ─── Appels parallèles ────────────────────────────────
  const [ftRes, cjRes, aRes, rkRes, azRes] = await Promise.allSettled([
    withTimeout(searchFT(), 9000),
    withTimeout(searchJooble(), 6000),
    withTimeout(searchArbeitnow(), 6000),
    withTimeout(searchRemoteOK(), 5000),
    withTimeout(searchAdzuna(), 8000),
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
        remote: false,
      })
    })
  }

  // ─── Jooble ──────────────────────────────────────────
  if (cjRes.status === 'fulfilled' && cjRes.value?.jobs) {
    cjRes.value.jobs.forEach(job => {
      offres.push({
        id: `jooble-${job.id}`,
        source: 'Jooble',
        titre: job.title || '',
        entreprise: job.company || '',
        lieu: job.location || location || 'France',
        date: job.updated || '',
        description: (job.snippet || '').substring(0, 600),
        url: job.link || '',
        type: job.type || '',
        salaire: job.salary || '',
        experience: '',
        remote: false,
      })
    })
  }

  // ─── Arbeitnow ────────────────────────────────────────
  if (aRes.status === 'fulfilled' && aRes.value?.data) {
    aRes.value.data.forEach(job => {
      offres.push({
        id: `arb-${job.slug}`,
        source: 'Arbeitnow',
        titre: job.title || '',
        entreprise: job.company_name || '',
        lieu: job.location || 'Remote',
        date: job.created_at ? new Date(job.created_at * 1000).toISOString() : '',
        description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 600),
        url: job.url || '',
        type: job.job_types?.join(', ') || '',
        salaire: '',
        experience: '',
        remote: job.remote || false,
      })
    })
  }

  // ─── RemoteOK ─────────────────────────────────────────
  if (rkRes.status === 'fulfilled' && Array.isArray(rkRes.value)) {
    rkRes.value.filter(j => j.id).slice(0, 15).forEach(job => {
      offres.push({
        id: `rok-${job.id}`,
        source: 'RemoteOK',
        titre: job.position || '',
        entreprise: job.company || '',
        lieu: 'Remote',
        date: job.date || '',
        description: (job.description || '').replace(/<[^>]*>/g, '').substring(0, 600),
        url: job.url || '',
        type: 'Remote',
        salaire: job.salary_min ? `${job.salary_min}$ - ${job.salary_max}$` : '',
        experience: '',
        remote: true,
      })
    })
  }

  // ─── Adzuna ───────────────────────────────────────────
  if (azRes.status === 'fulfilled' && azRes.value?.results) {
    azRes.value.results.forEach(job => {
      offres.push({
        id: `az-${job.id}`,
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
        remote: false,
      })
    })
  }

  // ─── Déduplication ────────────────────────────────────
  const seen = new Set()
  const dedup = offres.filter(o => {
    const key = `${o.titre.toLowerCase().slice(0, 25)}-${o.entreprise.toLowerCase().slice(0, 15)}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  // France Travail en premier
  dedup.sort((a, b) => {
    if (a.source === 'France Travail' && b.source !== 'France Travail') return -1
    if (b.source === 'France Travail' && a.source !== 'France Travail') return 1
    return new Date(b.date) - new Date(a.date)
  })

  const totalFT = ftRes.status === 'fulfilled' ? (ftRes.value?.Content_Range?.split('/')[1] || 0) : 0

  return res.status(200).json({
    offres: dedup,
    total: dedup.length,
    totalFT: parseInt(totalFT) || 0,
    hasMore: ftEnd < (parseInt(totalFT) || 0),
    sources: {
      ft: ftRes.status === 'fulfilled' ? (ftRes.value?.resultats?.length || 0) : 0,
      jooble: cjRes.status === 'fulfilled' ? (cjRes.value?.jobs?.length || 0) : 0,
      arbeitnow: aRes.status === 'fulfilled' ? (aRes.value?.data?.length || 0) : 0,
      remoteok: rkRes.status === 'fulfilled' ? (Array.isArray(rkRes.value) ? rkRes.value.filter(j => j.id).length : 0) : 0,
      adzuna: azRes.status === 'fulfilled' ? (azRes.value?.results?.length || 0) : 0,
    }
  })
}
