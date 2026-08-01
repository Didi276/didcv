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

async function scrapeLever(slug, nom) {
  try {
    const r = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`)
    if (!r.ok) return []
    const data = await r.json()
    if (!Array.isArray(data)) return []
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
  } catch { return [] }
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

  for (const entreprise of ENTREPRISES) {
    if (entreprise.ats === 'custom' || entreprise.ats === 'taleo') continue

    let offres = []

    try {
      if (entreprise.ats === 'greenhouse' && entreprise.slug) {
        offres = await scrapeGreenhouse(entreprise.slug, entreprise.nom)
      } else if (entreprise.ats === 'lever' && entreprise.slug) {
        offres = await scrapeLever(entreprise.slug, entreprise.nom)
      } else if (entreprise.ats === 'smartrecruiters' && entreprise.slug) {
        offres = await scrapeSmartRecruiters(entreprise.slug, entreprise.nom)
      } else if (entreprise.ats === 'workday') {
        offres = await scrapeWorkday(entreprise)
      }
    } catch (e) {
      console.error(`Erreur ${entreprise.nom}:`, e.message)
    }

    if (offres.length > 0) {
      const uniques = offres.filter((o, i, self) =>
        i === self.findIndex(t => t.hash === o.hash)
      )

      const { error } = await supabase
        .from('offres_directes')
        .upsert(
          uniques.map(o => ({ ...o, entreprise_id: entreprise.id })),
          { onConflict: 'hash', ignoreDuplicates: false }
        )

      if (!error) {
        console.log(`✅ ${entreprise.nom}: ${offres.length} offres`)
        totalOffres += offres.length
        entreprisesOK++
      }
    }

    if (offres.length === 0 && entreprise.ats !== 'custom' && entreprise.ats !== 'taleo') {
      entreprisesZero.push(`${entreprise.nom} (${entreprise.ats}/${entreprise.slug || entreprise.workday_id})`)
    }

    await sleep(500) // 500ms entre chaque entreprise
  }

  console.log(`\n🎉 Terminé: ${entreprisesOK} entreprises, ${totalOffres} offres`)

  console.log('\n❌ Entreprises sans offres :')
  entreprisesZero.forEach(e => console.log(' -', e))
}

main().catch(console.error)
