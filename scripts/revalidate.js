import fs from 'fs'
import { ENTREPRISES } from '../api/entreprisesData.js'

function timeoutFetch(url, opts = {}, ms = 7000) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { ...opts, signal: ctrl.signal }).finally(() => clearTimeout(t))
}
async function json(url, opts) {
  const r = await timeoutFetch(url, opts)
  if (!r.ok) return null
  return r.json()
}
const PROBES = {
  async greenhouse(slug) { const d = await json(`https://boards-api.greenhouse.io/v1/boards/${slug}/jobs`); return d && Array.isArray(d.jobs) ? d.jobs.length : 0 },
  async lever(slug) { const d = await json(`https://api.lever.co/v0/postings/${slug}?mode=json`); return Array.isArray(d) ? d.length : 0 },
  async smartrecruiters(slug) { const d = await json(`https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`); return d && Array.isArray(d.content) ? (d.totalFound || d.content.length) : 0 },
  async ashby(slug) { const d = await json(`https://api.ashbyhq.com/posting-api/job-board/${slug}`); return d && Array.isArray(d.jobs) ? d.jobs.length : 0 },
  async workable(slug) { const d = await json(`https://apply.workable.com/api/v1/widget/accounts/${slug}?details=true`); return d && Array.isArray(d.jobs) ? d.jobs.length : 0 },
  async recruitee(slug) { const d = await json(`https://${slug}.recruitee.com/api/offers/`); return d && Array.isArray(d.offers) ? d.offers.length : 0 },
  async teamtailor(slug) { const d = await json(`https://${slug}.teamtailor.com/jobs.json`); if (!d) return 0; const items = d.items || d.jobs || (Array.isArray(d) ? d : []); return items.length },
  async personio(slug) { const d = await json(`https://${slug}.jobs.personio.de/search.json`); return Array.isArray(d) ? d.length : 0 },
}
const ATS_SPECIAUX = ['workday', 'talentsoft', 'rippling', 'successfactors', 'custom', 'taleo']
function sansAccents(s) { return (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') }
function candidatsSlug(nom) {
  const net = sansAccents(nom)
  const colle = net.replace(/[^a-z0-9]/g, '')
  const tirets = net.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const premier = net.split(/[^a-z0-9]+/).filter(Boolean)[0] || colle
  return [...new Set([colle, tirets, premier, colle + 'group', colle + 'france', colle + 'careers', premier + 'group'])].filter(Boolean)
}
async function compte(ats, slug) { try { return await PROBES[ats](slug) } catch { return 0 } }
const sleep = ms => new Promise(r => setTimeout(r, ms))
async function main() {
  const ok = [], corriges = [], irrecuperables = [], nonTestes = []
  let i = 0
  for (const e of ENTREPRISES) {
    i++
    if (ATS_SPECIAUX.includes(e.ats) || !PROBES[e.ats]) { nonTestes.push({ nom: e.nom, ats: e.ats }); continue }
    const n = await compte(e.ats, e.slug)
    if (n > 0) { ok.push({ nom: e.nom, ats: e.ats, slug: e.slug, offres: n }); if (i % 25 === 0) console.log(`[${i}/${ENTREPRISES.length}] OK:${ok.length} corriges:${corriges.length}`); continue }
    let trouve = null
    for (const ats of Object.keys(PROBES)) {
      for (const slug of candidatsSlug(e.nom)) { const c = await compte(ats, slug); if (c > 0) { trouve = { ats, slug, offres: c }; break } }
      if (trouve) break
    }
    if (trouve) { corriges.push({ nom: e.nom, ancien: { ats: e.ats, slug: e.slug }, nouveau: trouve }); console.log(`  corrige ${e.nom} : ${e.ats}/${e.slug} -> ${trouve.ats}/${trouve.slug} (${trouve.offres})`) }
    else { irrecuperables.push({ nom: e.nom, ats: e.ats, slug: e.slug }) }
    await sleep(120)
  }
  const rapport = { date: new Date().toISOString(), total: ENTREPRISES.length, ok: ok.length, corriges: corriges.length, irrecuperables: irrecuperables.length, nonTestes: nonTestes.length, corrigesListe: corriges, irrecuperablesListe: irrecuperables, nonTestesListe: nonTestes }
  fs.writeFileSync('revalidation.json', JSON.stringify(rapport, null, 2))
  console.log(`\nTermine. OK:${ok.length} Corriges:${corriges.length} Irrecuperables:${irrecuperables.length} Non testes:${nonTestes.length}`)
}
main().catch(console.error)