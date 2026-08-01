import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'
import { ENTREPRISES } from '../api/entreprisesData.js'
import ws from 'ws'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    realtime: {
      transport: ws
    }
  }
)

const sleep = ms => new Promise(r => setTimeout(r, ms))

const hashOffre = (titre, entreprise, lieu) =>
  Buffer.from(`${titre}-${entreprise}-${lieu}`).toString('base64').slice(0, 32)

async function scrapeGreenhouse(slug, nom) {
  try {
    const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`)
    if (!r.ok) return []
    const data = await r.json()
    return (data.jobs || []).map(job => ({
      titre: job.title || '',
      entreprise: nom,
      lieu: job.location?.name || 'France',
      description: (job.content || '').replace(/<[^>]*>/g, '').slice(0, 800),
      url_candidature: job.absolute_url || '',
      date_publication: job.updated_at || new Date().toISOString(),
      type_contrat: '',
      departement: job.departments?.[0]?.name || '',
      ats_source: 'greenhouse',
      hash: hashOffre(job.title, nom, job.location?.name || ''),
      actif: true,
      date_scraping: new Date().toISOString()
    }))
  } catch { return [] }
}

async function scrapeLeverHTML(slug, nom) {
  try {
    const r = await fetch(`https://jobs.lever.co/${slug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml'
      }
    })
    if (!r.ok) return []
    const html = await r.text()

    const offres = []
    // Lever stocke les offres en JSON dans la page
    const jsonMatch = html.match(/window\.lever\.postings\s*=\s*(\[[\s\S]*?\]);/) ||
                      html.match(/"postings"\s*:\s*(\[[\s\S]*?\])(?=\s*[,}])/)

    if (jsonMatch) {
      try {
        const jobs = JSON.parse(jsonMatch[1])
        jobs.forEach(job => {
          offres.push({
            titre: job.text || job.title || '',
            entreprise: nom,
            lieu: job.categories?.location || job.location || 'France',
            description: (job.descriptionPlain || '').slice(0, 800),
            url_candidature: `https://jobs.lever.co/${slug}/${job.id}`,
            date_publication: new Date().toISOString(),
            type_contrat: job.categories?.commitment || '',
            departement: job.categories?.team || '',
            ats_source: 'lever_html',
            hash: Buffer.from(`${job.text}-${nom}`).toString('base64').slice(0, 32),
            actif: true,
            date_scraping: new Date().toISOString()
          })
        })
      } catch {}
    }

    // Fallback regex si JSON non trouvé
    if (offres.length === 0) {
      const titleRegex = /<h5[^>]*data-qa="posting-name"[^>]*>([^<]+)<\/h5>/g
      const linkRegex = /href="(https:\/\/jobs\.lever\.co\/[^"]+)"/g
      const titles = [...html.matchAll(titleRegex)].map(m => m[1])
      const links = [...html.matchAll(linkRegex)].map(m => m[1])
      titles.forEach((titre, i) => {
        offres.push({
          titre: titre.trim(),
          entreprise: nom,
          lieu: 'France',
          description: '',
          url_candidature: links[i] || `https://jobs.lever.co/${slug}`,
          date_publication: new Date().toISOString(),
          type_contrat: '',
          departement: '',
          ats_source: 'lever_html',
          hash: Buffer.from(`${titre}-${nom}-${i}`).toString('base64').slice(0, 32),
          actif: true,
          date_scraping: new Date().toISOString()
        })
      })
    }
    return offres
  } catch (err) {
    return []
  }
}

async function scrapeLever(slug, nom) {
  try {
    const r = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`)
    if (!r.ok) return scrapeLeverHTML(slug, nom)
    const data = await r.json()
    if (!Array.isArray(data) || data.length === 0) {
      return scrapeLeverHTML(slug, nom)
    }
    return data.map(job => ({
      titre: job.text || '',
      entreprise: nom,
      lieu: job.categories?.location || 'France',
      description: (job.descriptionPlain || '').slice(0, 800),
      url_candidature: job.hostedUrl || '',
      date_publication: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
      type_contrat: job.categories?.commitment || '',
      departement: job.categories?.team || '',
      ats_source: 'lever',
      hash: hashOffre(job.text, nom, job.categories?.location || ''),
      actif: true,
      date_scraping: new Date().toISOString()
    }))
  } catch {
    return scrapeLeverHTML(slug, nom)
  }
}

async function scrapeSmartRecruiters(slug, nom) {
  try {
    const r = await fetch(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`)
    if (!r.ok) return []
    const data = await r.json()
    return (data.content || []).map(job => ({
      titre: job.name || '',
      entreprise: nom,
      lieu: job.location?.city ? `${job.location.city}, France` : 'France',
      description: '',
      url_candidature: `https://jobs.smartrecruiters.com/${slug}/${job.id}`,
      date_publication: job.releasedDate || new Date().toISOString(),
      type_contrat: job.typeOfEmployment?.label || '',
      departement: job.department?.label || '',
      ats_source: 'smartrecruiters',
      hash: hashOffre(job.name, nom, job.location?.city || ''),
      actif: true,
      date_scraping: new Date().toISOString()
    }))
  } catch { return [] }
}

async function scrapeWorkday(entreprise) {
  const { workday_id, workday_path, workday_subdomain, nom } = entreprise
  if (!workday_id || !workday_path) return []
  const subdomain = workday_subdomain || 'wd3'
  const url = `https://${workday_id}.${subdomain}.myworkdayjobs.com/wday/cxs/${workday_id}/${workday_path}/jobs`
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 50, offset: 0 })
    })
    if (!r.ok) return []
    const data = await r.json()
    return (data.jobPostings || []).map(job => ({
      titre: job.title || '',
      entreprise: nom,
      lieu: job.locationsText || 'France',
      description: '',
      url_candidature: job.externalPath ? `https://${workday_id}.${subdomain}.myworkdayjobs.com${job.externalPath}` : url,
      date_publication: job.postedOn || new Date().toISOString(),
      type_contrat: '',
      departement: '',
      ats_source: 'workday',
      hash: hashOffre(job.title, nom, job.locationsText || ''),
      actif: true,
      date_scraping: new Date().toISOString()
    }))
  } catch { return [] }
}

async function main() {
  console.log(`Démarrage scraping — ${ENTREPRISES.length} entreprises`)
  let totalOffres = 0
  let entreprisesOK = 0
  const entreprisesZero = []

  const corrections = {
    'Qonto': { ats: 'lever', slug: 'qonto' },
    'Swile': { ats: 'lever', slug: 'swile' },
    'Thales DMS': { ats: 'workday', workday_id: 'thales', workday_path: 'Careers' },
    'Accor': { ats: 'greenhouse', slug: 'accor' },
  }

  for (const entreprise of ENTREPRISES) {
    const e = { ...entreprise, ...(corrections[entreprise.nom] || {}) }
    if (e.ats === 'custom' || e.ats === 'taleo') continue

    let offres = []

    try {
      if (e.ats === 'greenhouse' && e.slug) {
        offres = await scrapeGreenhouse(e.slug, e.nom)
      } else if (e.ats === 'lever' && e.slug) {
        offres = await scrapeLever(e.slug, e.nom)
      } else if (e.ats === 'smartrecruiters' && e.slug) {
        offres = await scrapeSmartRecruiters(e.slug, e.nom)
      } else if (e.ats === 'workday') {
        offres = await scrapeWorkday(e)
      }
    } catch (err) {
      console.error(`Erreur ${e.nom}:`, err.message)
    }

    if (offres.length > 0) {
      const uniques = offres.filter((o, i, self) =>
        i === self.findIndex(t => t.hash === o.hash)
      )

      const { error } = await supabase
        .from('offres_directes')
        .upsert(
          uniques.map(o => ({ ...o, entreprise_id: e.id })),
          { onConflict: 'hash', ignoreDuplicates: false }
        )

      if (!error) {
        console.log(`✅ ${e.nom}: ${offres.length} offres`)
        totalOffres += offres.length
        entreprisesOK++
      }
    }

    if (offres.length === 0 && e.ats !== 'custom' && e.ats !== 'taleo') {
      entreprisesZero.push(`${e.nom} (${e.ats}/${e.slug || e.workday_id})`)
    }

    await sleep(500) // 500ms entre chaque entreprise
  }

  console.log(`\n🎉 Terminé: ${entreprisesOK} entreprises, ${totalOffres} offres`)

  console.log('\n❌ Entreprises sans offres :')
  entreprisesZero.forEach(e => console.log(' -', e))
}

main().catch(console.error)
