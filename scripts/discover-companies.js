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

// Teste un candidat : lance TOUTES les combinaisons (ats, slug) en parallèle
// (chaque appel reste borné à 8s via fetchTimeout dans scrape-all.js), puis
// retient le résultat de l'ATS de plus haute priorité parmi ceux ayant
// renvoyé au moins une offre — indépendamment de l'ordre de résolution.
async function testerCandidat(nom) {
  const variantes = genererVariantesSlug(nom)
  const combos = []
  for (const ats of ATS_A_TESTER) {
    for (const slug of variantes) combos.push({ ats, slug })
  }

  const resultats = await Promise.allSettled(
    combos.map(async ({ ats, slug }) => {
      let offres = []
      try {
        offres = await SCRAPERS[ats](slug, nom)
      } catch {
        offres = []
      }
      return { ats, slug, nb: offres.length }
    })
  )

  for (const ats of ATS_A_TESTER) {
    for (const r of resultats) {
      if (r.status === 'fulfilled' && r.value.ats === ats && r.value.nb > 0) {
        return { ats: r.value.ats, slug: r.value.slug, nb_offres_detectees: r.value.nb }
      }
    }
  }
  return null
}

const CHEMIN_SORTIE = new URL('./decouvertes.json', import.meta.url)

function ecrireResultats(decouvertes) {
  const triees = [...decouvertes].sort((a, b) => b.nb_offres_detectees - a.nb_offres_detectees)
  fs.writeFileSync(CHEMIN_SORTIE, JSON.stringify(triees, null, 2))
}

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
      const trouve = await testerCandidat(nom)
      if (trouve) {
        const cle = `${trouve.ats}::${trouve.slug}`
        if (!dejaConnues.has(cle) && !dejaAjoutees.has(cle)) {
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
        }
      }
    } catch (err) {
      console.error(`❌ Erreur sur ${nom}, on continue :`, err.message)
    }

    // Flush périodique : les résultats partiels survivent à une interruption
    // (timeout CI, annulation manuelle, crash réseau) sur un run de plusieurs
    // heures.
    if ((i + 1) % 25 === 0) {
      ecrireResultats(decouvertes)
      console.log(`💾 Sauvegarde intermédiaire (${i + 1}/${noms.length})`)
    }

    await sleep(50)
  }

  ecrireResultats(decouvertes)

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
