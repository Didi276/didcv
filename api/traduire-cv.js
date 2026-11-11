// Traduit le contenu textuel d'un CV dans une langue européenne majeure, via Qwen
// (API Alibaba Cloud, compatible OpenAI). Nécessite QWEN_API_KEY et QWEN_BASE_URL.
// Entrée  : POST { cv: {...}, langue: 'en'|'es'|'de'|'it'|'pt'|'nl' }
// Sortie  : { cv: {...} }  (même structure, champs textuels traduits)
import { rateLimit } from './_lib/rateLimit.js'

const LANGUES = {
  en: 'anglais',
  es: 'espagnol',
  de: 'allemand',
  it: 'italien',
  pt: 'portugais',
  nl: 'néerlandais',
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' })

  // Chaque appel déclenche un appel IA — limite stricte.
  if (!rateLimit(req, res, { limit: 15, windowMs: 60_000 })) return

  const { cv, langue } = req.body || {}
  if (!cv || typeof cv !== 'object') return res.status(400).json({ error: 'cv requis' })
  const langueNom = LANGUES[langue]
  if (!langueNom) return res.status(400).json({ error: 'langue non supportée' })

  const prompt = `Tu es un traducteur professionnel spécialisé dans les CV. Traduis en ${langueNom.toUpperCase()} le contenu de ce CV fourni en JSON.

RÈGLES STRICTES :
- Renvoie EXACTEMENT la même structure JSON, avec les mêmes clés, dans le même ordre.
- Traduis uniquement le CONTENU textuel : titre, accroche, intitulés de poste (poste), missions, intitulés de diplôme (diplome), compétences (competences), centres d'intérêt (interets), niveaux de langue (niveau), et le nom des langues (langue).
- NE TRADUIS PAS et garde à l'identique : prenom, nom, email, telephone, ville, les noms d'entreprise (entreprise), les noms d'établissement (etablissement), et les dates/périodes (periode).
- Adapte les intitulés de poste et de diplôme aux équivalents usuels du pays de la langue cible, sans inventer de contenu.
- Garde le même niveau de détail, ne résume pas, n'ajoute rien.
- Si un champ est absent, ne l'ajoute pas.

CV à traduire :
${JSON.stringify(cv)}

Renvoie UNIQUEMENT le JSON traduit, sans texte autour, sans balises de code.`

  try {
    const qwenRes = await fetch(`${process.env.QWEN_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.QWEN_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-plus-character',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await qwenRes.json()
    if (!qwenRes.ok) throw new Error(data.error?.message || 'Erreur API Qwen')

    const texte = data.choices?.[0]?.message?.content || ''
    const propre = texte.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const cvTraduit = JSON.parse(propre)

    // Garde-fou : on ré-impose les champs non traduisibles depuis l'original,
    // au cas où le modèle les aurait modifiés.
    cvTraduit.prenom = cv.prenom
    cvTraduit.nom = cv.nom
    cvTraduit.email = cv.email
    cvTraduit.telephone = cv.telephone
    cvTraduit.ville = cv.ville
    if (Array.isArray(cvTraduit.experiences) && Array.isArray(cv.experiences)) {
      cvTraduit.experiences.forEach((exp, i) => {
        if (cv.experiences[i]) {
          exp.entreprise = cv.experiences[i].entreprise
          exp.periode = cv.experiences[i].periode
          if (cv.experiences[i].lieu !== undefined) exp.lieu = cv.experiences[i].lieu
        }
      })
    }
    if (Array.isArray(cvTraduit.formations) && Array.isArray(cv.formations)) {
      cvTraduit.formations.forEach((f, i) => {
        if (cv.formations[i]) {
          f.etablissement = cv.formations[i].etablissement
          f.periode = cv.formations[i].periode
        }
      })
    }

    return res.status(200).json({ cv: cvTraduit })
  } catch (e) {
    console.error('Erreur traduction CV', e)
    return res.status(502).json({ error: 'Traduction indisponible pour le moment' })
  }
}
