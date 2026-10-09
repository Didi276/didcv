// scripts/discover-companies.js
// Moteur de découverte d'entreprises : devine des slugs plausibles pour chaque
// nom de scripts/candidats-fr.js, interroge les ATS à API publique via les
// scrapers déjà existants de scripts/scrape-all.js (aucun nouveau code de
// scraping ici), et ne garde que les combinaisons (ats, slug) qui renvoient
// réellement au moins une offre.
//
// N'écrit JAMAIS dans api/entreprisesData.js : le résultat est déposé dans
// scripts/decouvertes.json pour relecture humaine avant toute fusion.
//
// Lancement local : node scripts/discover-companies.js

import fs from 'fs'
import { CANDIDATS } from './candidats-fr.js'
import { ENTREPRISES } from '../api/entreprisesData.js'
import {
  scrapeGreenhouse,
  scrapeLever,
  scrapeSmartRecruiters,
  scrapeAshby,
  scrapeWorkable,
  scrapeRecruitee,
  scrapePersonio,
  scrapeTeamtailor,
} from './scrape-all.js'

const sleep = ms => new Promise(r => setTimeout(r, ms))

// Seuls les ATS à API publique devinable par slug sont testables ici (pas
// Workday/SuccessFactors/Talentsoft : leurs identifiants ne sont pas des
// variantes simples du nom de l'entreprise).
const SCRAPERS = {
  greenhouse: scrapeGreenhouse,
  lever: scrapeLever,
  smartrecruiters: scrapeSmartRecruiters,
  ashby: scrapeAshby,
  workable: scrapeWorkable,
  recruitee: scrapeRecruitee,
  personio: scrapePersonio,
  teamtailor: scrapeTeamtailor,
}
const ATS_A_TESTER = Object.keys(SCRAPERS)

// ─── Génération des variantes de slug ──────────────────────────────────
function normaliserBase(nom) {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function genererVariantesSlug(nom) {
  const base = normaliserBase(nom)
  const mots = base.split(/\s+/)
    .map(m => m.replace(/[^a-z0-9]/g, ''))
    .filter(Boolean)

  const sansSeparateur = base.replace(/[^a-z0-9]/g, '')
  const avecTirets = mots.join('-')
  const premierMot = mots[0] || sansSeparateur

  // Set pour éviter de tester deux fois la même variante (cas fréquent des
  // noms en un seul mot, où les trois formes sont identiques).
  return [...new Set([sansSeparateur, avecTirets, premierMot].filter(Boolean))]
}

// ─── Entreprises déjà connues (ats::slug) — à ne pas re-proposer ───────
const dejaConnues = new Set(
  ENTREPRISES
    .filter(e => e.slug)
    .map(e => `${e.ats}::${e.slug.toLowerCase()}`)
)

async function main() {
  const noms = [...new Set(CANDIDATS.map(n => n.trim()).filter(Boolean))]
  console.log(`Démarrage découverte — ${noms.length} candidats uniques à tester`)

  const decouvertes = []
  const dejaAjoutees = new Set() // dédoublonnage interne au run
  const parAts = {}
  let testees = 0
  let validees = 0

  for (let i = 0; i < noms.length; i++) {
    const nom = noms[i]
    console.log(`[${i + 1}/${noms.length}] ${nom}`)
    testees++

    try {
      const variantes = genererVariantesSlug(nom)
      let trouve = null

      for (const ats of ATS_A_TESTER) {
        if (trouve) break
        for (const slug of variantes) {
          await sleep(300)
          let offres = []
          try {
            offres = await SCRAPERS[ats](slug, nom)
          } catch {
            offres = []
          }
          if (offres.length > 0) {
            trouve = { ats, slug, nb_offres_detectees: offres.length }
            break
          }
        }
      }

      if (!trouve) continue

      const cle = `${trouve.ats}::${trouve.slug}`
      if (dejaConnues.has(cle) || dejaAjoutees.has(cle)) continue

      dejaAjoutees.add(cle)
      decouvertes.push({
        nom,
        ats: trouve.ats,
        slug: trouve.slug,
        nb_offres_detectees: trouve.nb_offres_detectees,
      })
      parAts[trouve.ats] = (parAts[trouve.ats] || 0) + 1
      validees++
      console.log(`✅ ${nom} -> ${trouve.ats}/${trouve.slug} (${trouve.nb_offres_detectees} offres)`)
    } catch (err) {
      console.error(`❌ Erreur sur ${nom}, on continue :`, err.message)
    }
  }

  decouvertes.sort((a, b) => b.nb_offres_detectees - a.nb_offres_detectees)

  const chemin = new URL('./decouvertes.json', import.meta.url)
  fs.writeFileSync(chemin, JSON.stringify(decouvertes, null, 2))

  console.log(`\n🔍 Découverte terminée`)
  console.log(`Entreprises testées : ${testees}`)
  console.log(`Entreprises validées : ${validees}`)
  console.log('Par ATS :')
  Object.entries(parAts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([ats, n]) => console.log(`  - ${ats}: ${n}`))
  console.log(`\nRésultat écrit dans scripts/decouvertes.json`)
}

main().catch(console.error)
