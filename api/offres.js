// api/offres.js — France Travail + Jooble + Arbeitnow + RemoteOK + Adzuna + Direct (offres_directes)

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

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
    salaireMin = '',
    tempsPartiel = '',
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
      `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}&location=France&page=${pageNum}`,
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

  // ─── Direct (offres scrapées des pages carrières, voir api/scrape.js) ──
  const normalize = (str) => str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

  const searchDirectes = async () => {
    const queryNorm = normalize(query)
    const mots = queryNorm.split(' ').filter(m => m.length > 2)
    const orConditions = (mots.length > 0 ? mots : [queryNorm]).map(mot =>
      `titre.ilike.%${mot}%,description.ilike.%${mot}%,entreprise.ilike.%${mot}%`
    ).join(',')

    let q = supabase.from('offres_directes').select('*').or(orConditions).eq('actif', true)
    if (location) q = q.ilike('lieu', `%${location}%`)
    return q.order('date_publication', { ascending: false }).limit(50)
  }

  // ─── Appels parallèles ────────────────────────────────
  const [ftRes, cjRes, aRes, rkRes, azRes, ddRes] = await Promise.allSettled([
    withTimeout(searchFT(), 9000),
    withTimeout(searchJooble(), 6000),
    withTimeout(searchArbeitnow(), 6000),
    withTimeout(searchRemoteOK(), 5000),
    withTimeout(searchAdzuna(), 8000),
    withTimeout(searchDirectes(), 6000),
  ])

  const directRes = ddRes.status === 'fulfilled'
    ? ddRes.value
    : { data: null, error: { message: ddRes.reason?.message || 'timeout' } }

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
    const motsAllemands = ['entwickler', 'ingenieur', 'sachbearbeiter',
      'kaufmann', 'vertrieb', 'buchhaltung', 'projektleiter',
      'mitarbeiter', 'leiter', 'berater', 'stellenangebot']

    aRes.value.data
      .filter(job => {
        const titreMin = (job.title || '').toLowerCase()
        const lieuMin = (job.location || '').toLowerCase()
        const isAllemand = motsAllemands.some(m => titreMin.includes(m))
        const isFrance = lieuMin.includes('france') ||
                         lieuMin.includes('paris') ||
                         lieuMin.includes('remote') ||
                         lieuMin.includes('lyon') ||
                         lieuMin.includes('marseille') ||
                         lieuMin === ''
        return !isAllemand && isFrance
      })
      .forEach(job => {
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

  // ─── Direct ───────────────────────────────────────────
  if (Array.isArray(directRes.data)) {
    directRes.data.forEach(row => {
      offres.push({
        id: `direct-${row.id}`,
        source: 'Direct',
        titre: row.titre,
        entreprise: row.entreprise,
        lieu: row.lieu,
        date: row.date_publication,
        description: row.description,
        url: row.url_candidature,
        type: row.type_contrat,
        salaire: '',
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

  // ─── Filtres avancés post-agrégation ──────────────────
  let filtrees = dedup

  // Salaire minimum (extraire les nombres du champ salaire)
  if (salaireMin) {
    const min = parseInt(salaireMin)
    filtrees = filtrees.filter(o => {
      if (!o.salaire) return true // garder si pas d'info salaire
      const nums = o.salaire.match(/\d+/g)
      if (!nums) return true
      const max = Math.max(...nums.map(Number))
      // Si annuel (> 10000) comparer direct, sinon multiplier par 12
      const annuel = max > 10000 ? max : max * 12
      return annuel >= min
    })
  }

  // Télétravail
  if (teletravail === 'true') {
    filtrees = filtrees.filter(o =>
      o.remote === true ||
      /télétravail|remote|distanciel|hybride/i.test(o.titre + ' ' + o.description + ' ' + o.lieu)
    )
  }

  // Temps partiel
  if (tempsPartiel === 'true') {
    filtrees = filtrees.filter(o =>
      /temps partiel|mi-temps|part.?time|50%|80%/i.test(o.titre + ' ' + o.type + ' ' + o.description)
    )
  }

  // Date de publication (filtrage local en plus du filtre API)
  if (publieeDepuis) {
    const jours = parseInt(publieeDepuis)
    const limite = Date.now() - (jours * 86400000)
    filtrees = filtrees.filter(o => !o.date || new Date(o.date).getTime() >= limite)
  }

  // Type de contrat (normalisation cross-sources)
  if (typeContrat) {
    const mapping = {
      'CDI': /CDI|permanent|indéterminée|full.?time/i,
      'CDD': /CDD|déterminée|temporary|contract/i,
      'E1': /alternance|apprentissage|apprenti|contrat pro/i,
      'MIS': /intérim|interim|mission|temporaire/i,
      'NS': /stage|stagiaire|internship|intern/i,
      'SAI': /saisonnier|seasonal/i,
      'FS': /freelance|indépendant|consultant/i,
    }
    const regex = mapping[typeContrat]
    if (regex) {
      filtrees = filtrees.filter(o => regex.test(o.type + ' ' + o.titre + ' ' + o.description))
    }
  }

  // Expérience
  if (experience) {
    const mapping = {
      '1': /débutant|junior|sans expérience|entry.?level|0.?2 ans|première expérience/i,
      '2': /1.?3 ans|2.?4 ans|intermédiaire|confirmé|mid.?level/i,
      '3': /senior|expert|5 ans|expérimenté|\+.?5|lead|principal/i,
    }
    const regex = mapping[experience]
    if (regex) {
      filtrees = filtrees.filter(o =>
        regex.test(o.experience + ' ' + o.titre + ' ' + o.description)
      )
    }
  }

  // ─── Mélange intelligent des sources (round-robin) ────
  // 1. Grouper par source
  const parSource = {}
  filtrees.forEach(o => {
    if (!parSource[o.source]) parSource[o.source] = []
    parSource[o.source].push(o)
  })

  // 2. Trier chaque groupe par date décroissante
  Object.keys(parSource).forEach(src => {
    parSource[src].sort((a, b) => new Date(b.date) - new Date(a.date))
  })

  // 3. Entrelacer les sources en round-robin
  // Priorité : Direct en premier dans chaque tour, puis France Travail, puis le reste
  const ordre = ['Direct', 'France Travail', 'Jooble', 'Adzuna', 'Arbeitnow', 'RemoteOK']
  const melange = []
  let reste = true
  let i = 0

  while (reste) {
    reste = false
    for (const src of ordre) {
      if (parSource[src] && parSource[src][i]) {
        melange.push(parSource[src][i])
        reste = true
      }
    }
    // Sources non listées dans ordre
    for (const src of Object.keys(parSource)) {
      if (!ordre.includes(src) && parSource[src][i]) {
        melange.push(parSource[src][i])
        reste = true
      }
    }
    i++
  }

  return res.status(200).json({
    offres: melange,
    total: melange.length,
    hasMore: melange.length >= 50
  })
}
