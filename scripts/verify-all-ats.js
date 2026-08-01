import fetch from 'node-fetch'
import { ENTREPRISES } from '../api/entreprisesData.js'

const sleep = ms => new Promise(r => setTimeout(r, ms))

// Génère des variantes de slug à partir du nom
function genererSlugs(nom) {
  const base = nom.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')

  const avecTirets = nom.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const premierMot = nom.split(/[\s&]/)[0].toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')

  return [...new Set([base, avecTirets, premierMot, `${base}group`, `${base}fr`, `${base}france`])]
}

async function testGreenhouse(slug) {
  try {
    const r = await fetch(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`, { timeout: 5000 })
    if (!r.ok) return 0
    const d = await r.json()
    return d.jobs?.length || 0
  } catch { return 0 }
}

async function testLever(slug) {
  try {
    const r = await fetch(`https://api.lever.co/v0/postings/${slug}?mode=json`, { timeout: 5000 })
    if (!r.ok) return 0
    const d = await r.json()
    return Array.isArray(d) ? d.length : 0
  } catch { return 0 }
}

async function testSmartRecruiters(slug) {
  try {
    const r = await fetch(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=5`, { timeout: 5000 })
    if (!r.ok) return 0
    const d = await r.json()
    return d.totalFound || d.content?.length || 0
  } catch { return 0 }
}

async function testAshby(slug) {
  try {
    const r = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}`, { timeout: 5000 })
    if (!r.ok) return 0
    const d = await r.json()
    return d.jobs?.length || 0
  } catch { return 0 }
}

async function testWorkable(slug) {
  try {
    const r = await fetch(`https://apply.workable.com/api/v1/widget/accounts/${slug}?details=true`, { timeout: 5000 })
    if (!r.ok) return 0
    const d = await r.json()
    return d.jobs?.length || 0
  } catch { return 0 }
}

async function main() {
  const resultats = []
  const nonTrouves = []

  console.log(`Test de ${ENTREPRISES.length} entreprises...\n`)

  for (const e of ENTREPRISES) {
    const slugs = e.slug ? [e.slug, ...genererSlugs(e.nom)] : genererSlugs(e.nom)
    let trouve = false

    for (const slug of slugs) {
      if (trouve) break

      const gh = await testGreenhouse(slug)
      if (gh > 0) {
        resultats.push(`{ id: ${e.id}, nom: '${e.nom}', ats: 'greenhouse', slug: '${slug}' }, // ${gh} offres`)
        console.log(`✅ ${e.nom} → greenhouse/${slug} (${gh} offres)`)
        trouve = true
        break
      }

      const lv = await testLever(slug)
      if (lv > 0) {
        resultats.push(`{ id: ${e.id}, nom: '${e.nom}', ats: 'lever', slug: '${slug}' }, // ${lv} offres`)
        console.log(`✅ ${e.nom} → lever/${slug} (${lv} offres)`)
        trouve = true
        break
      }

      const sr = await testSmartRecruiters(slug)
      if (sr > 0) {
        resultats.push(`{ id: ${e.id}, nom: '${e.nom}', ats: 'smartrecruiters', slug: '${slug}' }, // ${sr} offres`)
        console.log(`✅ ${e.nom} → smartrecruiters/${slug} (${sr} offres)`)
        trouve = true
        break
      }

      const ab = await testAshby(slug)
      if (ab > 0) {
        resultats.push(`{ id: ${e.id}, nom: '${e.nom}', ats: 'ashby', slug: '${slug}' }, // ${ab} offres`)
        console.log(`✅ ${e.nom} → ashby/${slug} (${ab} offres)`)
        trouve = true
        break
      }

      const wk = await testWorkable(slug)
      if (wk > 0) {
        resultats.push(`{ id: ${e.id}, nom: '${e.nom}', ats: 'workable', slug: '${slug}' }, // ${wk} offres`)
        console.log(`✅ ${e.nom} → workable/${slug} (${wk} offres)`)
        trouve = true
        break
      }

      await sleep(100)
    }

    if (!trouve) {
      nonTrouves.push(e.nom)
      console.log(`❌ ${e.nom} — aucun ATS trouvé`)
    }
  }

  console.log('\n\n═══ RÉSULTATS À COPIER DANS entreprisesData.js ═══\n')
  resultats.forEach(r => console.log(r))

  console.log(`\n\n═══ ${nonTrouves.length} ENTREPRISES SANS ATS ═══\n`)
  console.log(nonTrouves.join(', '))

  console.log(`\n\n🎉 ${resultats.length}/${ENTREPRISES.length} entreprises avec ATS trouvé`)
}

main().catch(console.error)
