import fetch from 'node-fetch'
import { ENTREPRISES } from '../api/entreprisesData.js'

const sleep = ms => new Promise(r => setTimeout(r, ms))

// Génère beaucoup plus de variantes de slug
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
    base,
    tirets,
    premierMot,
    sansGroupe,
    `${base}group`,
    `${base}groupe`,
    `${base}fr`,
    `${base}france`,
    `${base}careers`,
    `${base}jobs`,
    `${base}tech`,
    `${base}technology`,
    `${premierMot}group`,
    `${premierMot}fr`,
    nom.toUpperCase().replace(/[^A-Z0-9]/g, ''),
  ])].filter(s => s.length >= 2)
}

// ═══ TESTS DES 13 ATS ═══

async function testGreenhouse(slug) {
  try {
    const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`)
    if (!r.ok) return 0
    const d = await r.json()
    return d.jobs?.length || 0
  } catch { return 0 }
}

async function testLever(slug) {
  try {
    const r = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`)
    if (!r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : 0
  } catch { return 0 }
}

async function testSmartRecruiters(slug) {
  try {
    const r = await fetch(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=5`)
    if (!r.ok) return 0
    const d = await r.json()
    return d.totalFound || d.content?.length || 0
  } catch { return 0 }
}

async function testAshby(slug) {
  try {
    const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}`)
    if (!r.ok) return 0
    const d = await r.json()
    return d.jobs?.length || 0
  } catch { return 0 }
}

async function testWorkable(slug) {
  try {
    const r = await fetch(`https://apply.workable.com/api/v1/widget/accounts/${slug}?details=true`)
    if (!r.ok) return 0
    const d = await r.json()
    return d.jobs?.length || 0
  } catch { return 0 }
}

async function testRecruitee(slug) {
  try {
    const r = await fetch(`https://${slug}.recruitee.com/api/offers/`)
    if (!r.ok) return 0
    const d = await r.json()
    return d.offers?.length || 0
  } catch { return 0 }
}

async function testTeamtailor(slug) {
  try {
    const r = await fetch(`https://${slug}.teamtailor.com/jobs.json`)
    if (!r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : (d.jobs?.length || 0)
  } catch { return 0 }
}

async function testPersonio(slug) {
  try {
    const r = await fetch(`https://${slug}.jobs.personio.de/search.json`)
    if (!r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : 0
  } catch { return 0 }
}

async function testJazzHR(slug) {
  try {
    const r = await fetch(`https://${slug}.applytojob.com/apply/jobs/feed?format=json`)
    if (!r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : 0
  } catch { return 0 }
}

async function testBreezy(slug) {
  try {
    const r = await fetch(`https://${slug}.breezy.hr/json`)
    if (!r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : 0
  } catch { return 0 }
}

async function testRippling(slug) {
  try {
    const r = await fetch(`https://api.rippling.com/platform/api/ats/v1/board/${slug}/jobs`)
    if (!r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : (d.items?.length || 0)
  } catch { return 0 }
}

async function testJobvite(slug) {
  try {
    const r = await fetch(`https://api.jobvite.com/api/v2/jobFeed?companyId=${slug}`)
    if (!r.ok) return 0
    const d = await r.json()
    return d.requisitions?.length || 0
  } catch { return 0 }
}

// Workday : teste les chemins les plus courants
async function testWorkday(slug) {
  const paths = [
    'External', 'external', 'Careers', 'careers',
    'External_Career_Site', 'ExternalCareerSite',
    `${slug}_Careers`, `${slug}Careers`, `${slug}_External`,
    'Global_Careers', 'GlobalCareers', 'jobs', 'Jobs',
    'Recrutement', 'recrutement', 'Candidats',
    'Site_carriere', 'CareerSite', 'Professional_Careers'
  ]
  const subdomains = ['wd3', 'wd1', 'wd5', 'wd103', 'wd12']

  for (const sub of subdomains) {
    for (const path of paths) {
      try {
        const r = await fetch(
          `https://${slug}.${sub}.myworkdayjobs.com/wday/cxs/${slug}/${path}/jobs`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ limit: 5, offset: 0 })
          }
        )
        if (!r.ok) continue
        const d = await r.json()
        const n = d.total || d.jobPostings?.length || 0
        if (n > 0) return { count: n, subdomain: sub, path }
      } catch {}
    }
  }
  return { count: 0 }
}

// ═══ MAIN ═══

async function main() {
  const resultats = []
  const nonTrouves = []

  console.log(`🔍 Test v2 — ${ENTREPRISES.length} entreprises, 13 ATS, 15 variantes de slug\n`)

  for (const e of ENTREPRISES) {
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
      ]

      for (const [ats, testFn] of tests) {
        const n = await testFn(slug)
        if (n > 0) {
          resultats.push(`{ id: ${e.id}, nom: "${e.nom.replace(/"/g, '\\"')}", ats: '${ats}', slug: '${slug}' }, // ${n} offres`)
          console.log(`✅ ${e.nom} → ${ats}/${slug} (${n} offres)`)
          trouve = true
          break
        }
      }

      await sleep(50)
    }

    // Si rien trouvé, essayer Workday avec les 2 premiers slugs
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
