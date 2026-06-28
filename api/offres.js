// api/offres.js — Vercel Function
// Interroge JSearch (LinkedIn/Indeed/Glassdoor) + Adzuna en parallèle

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { query = '', location = 'France', page = 1 } = req.query
  if (!query) return res.status(400).json({ error: 'query requis' })

  const searchQuery = location ? `${query} ${location}` : query

  // Lancer les deux APIs en parallèle
  const [jsearchRes, adzunaRes] = await Promise.allSettled([

    // ─── JSearch (LinkedIn, Indeed, Glassdoor...) ───
    fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&page=${page}&num_pages=1&country=fr&language=fr`, {
      headers: {
        'x-rapidapi-key': 'a1eb109746mshcdf88fee398e505p133d06jsn1a219dd0e6c6',
        'x-rapidapi-host': 'jsearch.p.rapidapi.com'
      }
    }).then(r => r.json()),

    // ─── Adzuna ───
    fetch(`https://api.adzuna.com/v1/api/jobs/fr/search/${page}?app_id=c07dfdb2&app_key=7acb6df75a80e2623290c5d84559e278&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}&results_per_page=10&content-type=application/json`)
      .then(r => r.json())
  ])

  const offres = []

  // ─── Traitement JSearch ───
  if (jsearchRes.status === 'fulfilled' && jsearchRes.value?.data) {
    jsearchRes.value.data.forEach(job => {
      offres.push({
        id: job.job_id,
        source: 'JSearch',
        titre: job.job_title || '',
        entreprise: job.employer_name || '',
        lieu: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_country || '',
        date: job.job_posted_at_datetime_utc || '',
        description: job.job_description || '',
        url: job.job_apply_link || job.job_google_link || '',
        logo: job.employer_logo || null,
        type: job.job_employment_type || '',
        remote: job.job_is_remote || false,
      })
    })
  }

  // ─── Traitement Adzuna ───
  if (adzunaRes.status === 'fulfilled' && adzunaRes.value?.results) {
    adzunaRes.value.results.forEach(job => {
      offres.push({
        id: `adzuna-${job.id}`,
        source: 'Adzuna',
        titre: job.title || '',
        entreprise: job.company?.display_name || '',
        lieu: job.location?.display_name || '',
        date: job.created || '',
        description: job.description || '',
        url: job.redirect_url || '',
        logo: null,
        type: job.contract_type || '',
        remote: false,
      })
    })
  }

  // Trier par date (plus récent en premier)
  offres.sort((a, b) => new Date(b.date) - new Date(a.date))

  return res.status(200).json({ offres, total: offres.length })
}
