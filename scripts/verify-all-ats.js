import fetch from 'node-fetch'
import { ENTREPRISES } from '../api/entreprisesData.js'

const START = parseInt(process.env.START || '0')
const END = parseInt(process.env.END || '999')

const fetchTimeout = async (url, options = {}, ms = 3000) => {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), ms)
  try {
    const r = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(t)
    return r
  } catch {
    clearTimeout(t)
    return null
  }
}

// Génère des variantes de slug à partir du nom
function genererSlugs(nom) {
  const clean = s => s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')

  const cleanTirets = s => s.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const base = clean(nom)
  const tirets = cleanTirets(nom)
  const premierMot = clean(nom.split(/[\s&\/]/)[0])
  const sansGroupe = clean(nom.replace(/\s*(groupe|group|france|sa|sas|holding)\s*/gi, ''))

  return [...new Set([
    base, tirets, premierMot, sansGroupe,
    `${base}group`, `${base}fr`, `${base}careers`, `${premierMot}group`,
  ])].filter(s => s.length >= 2)
}

// ═══ TESTS DES 13 ATS ═══

async function testGreenhouse(slug) {
  try {
    const r = await fetchTimeout(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return d.jobs?.length || 0
  } catch { return 0 }
}

async function testLever(slug) {
  try {
    const r = await fetchTimeout(`https://api.lever.co/v0/postings/${slug}?mode=json`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : 0
  } catch { return 0 }
}

async function testSmartRecruiters(slug) {
  try {
    const r = await fetchTimeout(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=5`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return d.totalFound || d.content?.length || 0
  } catch { return 0 }
}

async function testAshby(slug) {
  try {
    const r = await fetchTimeout(`https://api.ashbyhq.com/posting-api/job-board/${slug}`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return d.jobs?.length || 0
  } catch { return 0 }
}

async function testWorkable(slug) {
  try {
    const r = await fetchTimeout(`https://apply.workable.com/api/v1/widget/accounts/${slug}?details=true`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return d.jobs?.length || 0
  } catch { return 0 }
}

async function testRecruitee(slug) {
  try {
    const r = await fetchTimeout(`https://${slug}.recruitee.com/api/offers/`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return d.offers?.length || 0
  } catch { return 0 }
}

async function testTeamtailor(slug) {
  try {
    const r = await fetchTimeout(`https://${slug}.teamtailor.com/jobs.json`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : (d.jobs?.length || 0)
  } catch { return 0 }
}

async function testPersonio(slug) {
  try {
    const r = await fetchTimeout(`https://${slug}.jobs.personio.de/search.json`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : 0
  } catch { return 0 }
}

async function testJazzHR(slug) {
  try {
    const r = await fetchTimeout(`https://${slug}.applytojob.com/apply/jobs/feed?format=json`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : 0
  } catch { return 0 }
}

async function testBreezy(slug) {
  try {
    const r = await fetchTimeout(`https://${slug}.breezy.hr/json`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : 0
  } catch { return 0 }
}

async function testRippling(slug) {
  try {
    const r = await fetchTimeout(`https://api.rippling.com/platform/api/ats/v1/board/${slug}/jobs`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : (d.items?.length || 0)
  } catch { return 0 }
}

async function testJobvite(slug) {
  try {
    const r = await fetchTimeout(`https://api.jobvite.com/api/v2/jobFeed?companyId=${slug}`)
    if (!r || !r.ok) return 0
    const d = await r.json()
    return d.requisitions?.length || 0
  } catch { return 0 }
}

async function testTalentsoft(slug) {
  const urls = [
    `https://${slug}-career.talent-soft.com/offre-de-emploi/tous-les-flux-rss.aspx`,
    `https://${slug}.talent-soft.com/offre-de-emploi/tous-les-flux-rss.aspx`,
    `https://recrute.${slug}.com/offre-de-emploi/tous-les-flux-rss.aspx`,
    `https://recrute.${slug}.fr/offre-de-emploi/tous-les-flux-rss.aspx`,
    `https://recrute.${slug}.org/offre-de-emploi/tous-les-flux-rss.aspx`,
    `https://carriere.${slug}.com/offre-de-emploi/tous-les-flux-rss.aspx`,
    `https://carrieres.${slug}.com/offre-de-emploi/tous-les-flux-rss.aspx`,
    `https://emploi.${slug}.com/offre-de-emploi/tous-les-flux-rss.aspx`,
    `https://jobs.${slug}.com/offre-de-emploi/tous-les-flux-rss.aspx`,
    `https://${slug}-career.talent-soft.com/offre-de-emploi/liste-offres.aspx`,
  ]

  for (const url of urls) {
    const r = await fetchTimeout(url)
    if (!r || !r.ok) continue
    const contenu = await r.text()

    // Compter les flux RSS disponibles ou les offres
    const fluxMatches = contenu.match(/flux-rss[^"]*\.aspx/g)
    const offreMatches = contenu.match(/offre-de-emploi\/emploi-[^"]+/g)

    const n = (offreMatches?.length || 0) || (fluxMatches?.length || 0)
    if (n > 0) return { count: n, url }
  }
  return { count: 0 }
}

// Workday : teste les chemins les plus courants, par batch de 15 en parallèle
async function testWorkday(slug) {
  const paths = [
    'External', 'external', 'Careers', 'careers',
    'External_Career_Site', 'ExternalCareerSite',
    `${slug}_Careers`, `${slug}Careers`, `${slug}_External`,
    'Global_Careers', 'GlobalCareers', 'jobs', 'Jobs',
    'Recrutement', 'recrutement', 'Candidats',
    'Site_carriere', 'CareerSite', 'Professional_Careers',
    `${slug}careers`, 'Experienced', 'Search', 'CareerPortal'
  ]
  const subdomains = ['wd3', 'wd1', 'wd5', 'wd103', 'wd12']

  const combos = []
  for (const sub of subdomains) {
    for (const path of paths) combos.push({ sub, path })
  }

  for (let i = 0; i < combos.length; i += 15) {
    const batch = combos.slice(i, i + 15)
    const results = await Promise.all(
      batch.map(async ({ sub, path }) => {
        const r = await fetchTimeout(
          `https://${slug}.${sub}.myworkdayjobs.com/wday/cxs/${slug}/${path}/jobs`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 5, offset: 0 })
          }
        )
        if (!r || !r.ok) return null
        try {
          const d = await r.json()
          const n = d.total || d.jobPostings?.length || 0
          return n > 0 ? { count: n, subdomain: sub, path } : null
        } catch { return null }
      })
    )
    const found = results.find(r => r !== null)
    if (found) return found
  }
  return { count: 0 }
}

// ═══ MAIN ═══

async function main() {
  const resultats = []
  const nonTrouves = []

  console.log(`🔍 Test v3 — ${ENTREPRISES.length} entreprises, 13 ATS en parallèle, 8 variantes de slug\n`)

  const tranche = ENTREPRISES.slice(START, END)
  console.log(`Traitement entreprises ${START} à ${END} (${tranche.length} entreprises)`)
  for (const e of tranche) {
    const slugs = e.slug ? [e.slug, ...genererSlugs(e.nom)] : genererSlugs(e.nom)
    let trouve = false

    for (const slug of slugs) {
      if (trouve) break

      const tests = [
        ['greenhouse', testGreenhouse],
        ['lever', testLever],
        ['smartrecruiters', testSmartRecruiters],
        ['ashby', testAshby],
        ['workable', testWorkable],
        ['recruitee', testRecruitee],
        ['teamtailor', testTeamtailor],
        ['personio', testPersonio],
        ['jazzhr', testJazzHR],
        ['breezy', testBreezy],
        ['rippling', testRippling],
        ['jobvite', testJobvite],
        ['talentsoft', async (slug) => (await testTalentsoft(slug)).count],
      ]

      const resultatsTests = await Promise.all(
        tests.map(async ([ats, fn]) => ({ ats, count: await fn(slug) }))
      )

      const gagnant = resultatsTests.find(r => r.count > 0)
      if (gagnant) {
        resultats.push(`{ id: ${e.id}, nom: "${e.nom.replace(/"/g, '\\"')}", ats: '${gagnant.ats}', slug: '${slug}' }, // ${gagnant.count} offres`)
        console.log(`✅ ${e.nom} → ${gagnant.ats}/${slug} (${gagnant.count} offres)`)
        trouve = true
        break
      }
    }

    // Si rien trouvé, essayer Workday avec les 3 premiers slugs
    if (!trouve) {
      for (const slug of slugs.slice(0, 3)) {
        const wd = await testWorkday(slug)
        if (wd.count > 0) {
          resultats.push(`{ id: ${e.id}, nom: "${e.nom.replace(/"/g, '\\"')}", ats: 'workday', workday_id: '${slug}', workday_path: '${wd.path}', workday_subdomain: '${wd.subdomain}' }, // ${wd.count} offres`)
          console.log(`✅ ${e.nom} → workday/${slug}/${wd.path} (${wd.count} offres)`)
          trouve = true
          break
        }
      }
    }

    if (!trouve) {
      nonTrouves.push(e.nom)
      console.log(`❌ ${e.nom}`)
    }
  }

  console.log('\n\n═══ RÉSULTATS À COPIER DANS entreprisesData.js ═══\n')
  resultats.forEach(r => console.log(r))

  console.log(`\n\n═══ ${nonTrouves.length} ENTREPRISES SANS ATS ═══\n`)
  console.log(nonTrouves.join(', '))

  console.log(`\n\n🎉 ${resultats.length}/${ENTREPRISES.length} entreprises avec ATS trouvé`)
}

main().catch(console.error)
