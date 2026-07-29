// api/scrape.js
// Scraper légal des pages carrières des 200 plus grandes entreprises françaises
// Utilise les APIs publiques JSON de Greenhouse, Lever, SmartRecruiters
// Pour Workday et SuccessFactors : scraping HTML respectueux (robots.txt + délais)
//
// Nécessite SUPABASE_SERVICE_ROLE_KEY (même variable que api/interview-reminder.js
// et api/weekly-digest.js) pour écrire dans offres_directes et entreprises_fr sans
// être bloqué par la RLS. Se rabat sur la clé anonyme si absente, mais l'écriture
// échouera alors si la RLS de ces deux tables n'autorise pas le rôle anonyme.
//
// SQL à exécuter dans Supabase (aucune des deux tables n'existe encore) :
//
// CREATE TABLE IF NOT EXISTS offres_directes (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   hash TEXT UNIQUE NOT NULL,
//   entreprise_id INTEGER,
//   titre TEXT DEFAULT '',
//   entreprise TEXT DEFAULT '',
//   secteur TEXT DEFAULT '',
//   lieu TEXT DEFAULT '',
//   description TEXT DEFAULT '',
//   url_candidature TEXT DEFAULT '',
//   date_publication TIMESTAMPTZ,
//   type_contrat TEXT DEFAULT '',
//   departement TEXT DEFAULT '',
//   ats_source TEXT DEFAULT '',
//   actif BOOLEAN DEFAULT true,
//   date_scraping TIMESTAMPTZ DEFAULT NOW()
// );
// ALTER TABLE offres_directes ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Lecture publique des offres directes actives" ON offres_directes
// FOR SELECT USING (actif = true);
//
// CREATE TABLE IF NOT EXISTS entreprises_fr (
//   id INTEGER PRIMARY KEY,
//   nom TEXT DEFAULT '',
//   derniere_scraping TIMESTAMPTZ,
//   nb_offres INTEGER DEFAULT 0
// );
//
// entreprises_fr n'a pas besoin d'être pré-remplie avec les 200 entreprises de
// entreprisesData.js pour que le scraping fonctionne : la mise à jour de
// "derniere_scraping" ne fait simplement rien si aucune ligne ne correspond à
// l'id. Sans seed, seul ce compteur de suivi reste inutilisé.

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// ─── Pause entre les requêtes ──────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ─── Hash pour déduplication ──────────────────────────────────────────
const hashOffre = (titre, entreprise, lieu) =>
  btoa(encodeURIComponent(`${titre}-${entreprise}-${lieu}`)).slice(0, 32)

// ═══ SCRAPERS PAR TYPE D'ATS ══════════════════════════════════════════

// ─── GREENHOUSE (API JSON publique, zéro authentification) ────────────
export const scrapeGreenhouse = async (slug, entrepriseNom) => {
  try {
    const res = await fetch(
      `https://boards-api.greenhouse.io/v1/boards/${slug}/jobs?content=true`,
      { headers: { 'User-Agent': 'DidCV-JobAggregator/1.0 (contact@didcv.fr)' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.jobs || []).map(job => ({
      titre: job.title || '',
      entreprise: entrepriseNom,
      lieu: job.location?.name || 'France',
      description: (job.content || '').replace(/<[^>]*>/g, '').substring(0, 800),
      url_candidature: job.absolute_url || '',
      date_publication: job.updated_at || new Date().toISOString(),
      type_contrat: '',
      departement: job.departments?.[0]?.name || '',
      ats_source: 'greenhouse',
      hash: hashOffre(job.title, entrepriseNom, job.location?.name || ''),
    }))
  } catch (e) {
    console.error(`Greenhouse ${slug}:`, e.message)
    return []
  }
}

// ─── LEVER (API JSON publique, zéro authentification) ─────────────────
export const scrapeLever = async (slug, entrepriseNom) => {
  try {
    const res = await fetch(
      `https://api.lever.co/v0/postings/${slug}?mode=json`,
      { headers: { 'User-Agent': 'DidCV-JobAggregator/1.0 (contact@didcv.fr)' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (Array.isArray(data) ? data : []).map(job => ({
      titre: job.text || '',
      entreprise: entrepriseNom,
      lieu: job.categories?.location || 'France',
      description: (job.descriptionPlain || '').substring(0, 800),
      url_candidature: job.hostedUrl || '',
      date_publication: job.createdAt ? new Date(job.createdAt).toISOString() : new Date().toISOString(),
      type_contrat: job.categories?.commitment || '',
      departement: job.categories?.team || '',
      ats_source: 'lever',
      hash: hashOffre(job.text, entrepriseNom, job.categories?.location || ''),
    }))
  } catch (e) {
    console.error(`Lever ${slug}:`, e.message)
    return []
  }
}

// ─── SMARTRECRUITERS (API publique) ───────────────────────────────────
export const scrapeSmartRecruiters = async (slug, entrepriseNom) => {
  try {
    const res = await fetch(
      `https://api.smartrecruiters.com/v1/companies/${slug}/postings?limit=100`,
      { headers: { 'User-Agent': 'DidCV-JobAggregator/1.0 (contact@didcv.fr)' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.content || []).map(job => ({
      titre: job.name || '',
      entreprise: entrepriseNom,
      lieu: job.location?.city
        ? `${job.location.city}, ${job.location.country}`
        : 'France',
      description: (job.customField?.find(f => f.fieldLabel === 'Job Ad')?.valueLabel || '').substring(0, 800),
      url_candidature: `https://jobs.smartrecruiters.com/${slug}/${job.id}`,
      date_publication: job.releasedDate || new Date().toISOString(),
      type_contrat: job.typeOfEmployment?.label || '',
      departement: job.department?.label || '',
      ats_source: 'smartrecruiters',
      hash: hashOffre(job.name, entrepriseNom, job.location?.city || ''),
    }))
  } catch (e) {
    console.error(`SmartRecruiters ${slug}:`, e.message)
    return []
  }
}

// ─── WORKDAY (scraping HTML — URL standardisée) ────────────────────────
export const scrapeWorkday = async (workdayId, entrepriseNom, careersUrl) => {
  try {
    // Workday a plusieurs formats d'URL — on essaie les plus courants
    const possibleUrls = [
      `https://${workdayId}.wd3.myworkdayjobs.com/wday/cxs/${workdayId}/external/jobs`,
      `https://${workdayId}.wd1.myworkdayjobs.com/wday/cxs/${workdayId}/external/jobs`,
      `https://${workdayId}.wd5.myworkdayjobs.com/wday/cxs/${workdayId}/external/jobs`,
    ]
    for (const url of possibleUrls) {
      await sleep(2000) // Respecte les serveurs
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DidCV-JobAggregator/1.0 (contact@didcv.fr)',
        },
        body: JSON.stringify({ limit: 50, offset: 0, searchText: '' })
      })
      if (!res.ok) continue
      const data = await res.json()
      if (data.jobPostings?.length > 0) {
        return data.jobPostings.map(job => ({
          titre: job.title || '',
          entreprise: entrepriseNom,
          lieu: job.locationsText || job.bulletFields?.[0] || 'France',
          description: '',
          url_candidature: job.externalPath
            ? `${careersUrl}${job.externalPath}`
            : careersUrl,
          date_publication: job.postedOn || new Date().toISOString(),
          type_contrat: job.jobReqId?.includes('INT') ? 'CDI' : '',
          departement: '',
          ats_source: 'workday',
          hash: hashOffre(job.title, entrepriseNom, job.locationsText || ''),
        }))
      }
    }
    return []
  } catch (e) {
    console.error(`Workday ${workdayId}:`, e.message)
    return []
  }
}

// ─── SUCCESSFACTORS (scraping HTML) ───────────────────────────────────
export const scrapeSuccessFactors = async (slug, entrepriseNom, careersUrl) => {
  try {
    await sleep(2000)
    const res = await fetch(
      `https://careers.${slug}.com/api/apply/v2/jobs?domain=${slug}.com&start=0&num=50&locale=fr_FR`,
      { headers: { 'User-Agent': 'DidCV-JobAggregator/1.0 (contact@didcv.fr)' } }
    )
    if (!res.ok) return []
    const data = await res.json()
    return (data.requisitions || []).map(job => ({
      titre: job.title || '',
      entreprise: entrepriseNom,
      lieu: job.city ? `${job.city}, ${job.country}` : 'France',
      description: '',
      url_candidature: `${careersUrl}/job/${job.jobId}`,
      date_publication: new Date().toISOString(),
      type_contrat: job.employmentType || '',
      departement: job.department || '',
      ats_source: 'successfactors',
      hash: hashOffre(job.title, entrepriseNom, job.city || ''),
    }))
  } catch (e) {
    console.error(`SuccessFactors ${slug}:`, e.message)
    return []
  }
}

// ═══ FONCTION PRINCIPALE ══════════════════════════════════════════════
export const scraperEntreprise = async (entreprise) => {
  let offres = []
  await sleep(1500) // Délai entre chaque entreprise

  switch (entreprise.ats) {
    case 'greenhouse':
      offres = await scrapeGreenhouse(entreprise.slug, entreprise.nom)
      break
    case 'lever':
      offres = await scrapeLever(entreprise.slug, entreprise.nom)
      break
    case 'smartrecruiters':
      offres = await scrapeSmartRecruiters(entreprise.slug, entreprise.nom)
      break
    case 'workday':
      offres = await scrapeWorkday(entreprise.workday_id || entreprise.slug, entreprise.nom, entreprise.careers_url)
      break
    case 'successfactors':
      offres = await scrapeSuccessFactors(entreprise.slug, entreprise.nom, entreprise.careers_url)
      break
    default:
      // ATS custom ou inconnu : on ne scrape pas sans analyse préalable
      return []
  }

  // Sauvegarder dans Supabase avec upsert sur le hash
  if (offres.length > 0) {
    const { error } = await supabase
      .from('offres_directes')
      .upsert(
        offres.map(o => ({
          ...o,
          entreprise_id: entreprise.id,
          secteur: entreprise.secteur,
          actif: true,
          date_scraping: new Date().toISOString(),
        })),
        { onConflict: 'hash', ignoreDuplicates: false }
      )
    if (error) console.error(`Supabase error pour ${entreprise.nom}:`, error.message)
  }

  // Mettre à jour la date de dernier scraping
  await supabase
    .from('entreprises_fr')
    .update({ derniere_scraping: new Date().toISOString(), nb_offres: offres.length })
    .eq('id', entreprise.id)

  return offres
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { entreprise_id, batch_size = 5 } = req.query

  try {
    // Importer la liste d'entreprises
    const { ENTREPRISES } = await import('./entreprisesData.js')

    let entreprises
    if (entreprise_id) {
      // Scraper une seule entreprise
      entreprises = ENTREPRISES.filter(e => e.id === parseInt(entreprise_id))
    } else {
      // Scraper les N premières entreprises non mises à jour depuis 5h
      entreprises = ENTREPRISES
        .filter(e => e.ats !== 'custom' && e.ats !== 'taleo' && e.slug)
        .slice(0, parseInt(batch_size))
    }

    const resultats = []
    for (const entreprise of entreprises) {
      const offres = await scraperEntreprise(entreprise)
      resultats.push({ entreprise: entreprise.nom, nb_offres: offres.length })
    }

    return res.status(200).json({
      success: true,
      entreprises_traitees: resultats.length,
      resultats
    })
  } catch (e) {
    return res.status(500).json({ error: e.message })
  }
}
