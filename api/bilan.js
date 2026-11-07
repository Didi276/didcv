// api/bilan.js
// Bilan de compétences ancré dans le marché réel.
// 1) récupère de vraies offres France Travail pour le poste visé
// 2) demande à l'IA de comparer le profil de la personne aux compétences
//    réellement demandées, et d'en déduire points forts, écarts et priorités
// 3) renvoie un JSON structuré, que la page associe aux formations.

export const config = { maxDuration: 60 }

async function offresMarche(poste) {
  try {
    const tokenRes = await fetch(
      'https://entreprise.francetravail.fr/connexion/oauth2/access_token?realm=%2Fpartenaire',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: process.env.FT_CLIENT_ID,
          client_secret: process.env.FT_CLIENT_SECRET,
          scope: 'api_offresdemploiv2 o2dsoffre',
        }),
      }
    )
    const { access_token } = await tokenRes.json()
    const url =
      'https://api.francetravail.io/partenaire/offresdemploi/v2/offres/search?motsCles=' +
      encodeURIComponent(poste) + '&range=0-9'
    const r = await fetch(url, { headers: { Authorization: `Bearer ${access_token}` } })
    if (!r.ok) return []
    const d = await r.json()
    return (d.resultats || [])
      .map(o => (o.description || '').slice(0, 450))
      .filter(Boolean)
  } catch {
    return []
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST requis' })

  let body = req.body
  if (typeof body === 'string') { try { body = JSON.parse(body) } catch { body = {} } }
  const { poste, secteur, competences = [], experiences = [] } = body || {}

  if (!poste) return res.status(400).json({ error: 'poste requis' })

  // 1) vraies offres du marché
  const offres = await offresMarche(poste)
  const marcheTxt = offres.length
    ? offres.map((d, i) => `Offre ${i + 1}: ${d}`).join('\n\n')
    : '(aucune offre récupérée, base-toi sur les attentes habituelles du marché français pour ce poste)'

  // profil résumé
  const exp = (experiences || [])
    .map(e => (typeof e === 'string' ? e : `${e.poste || ''} ${e.entreprise || ''}`.trim()))
    .filter(Boolean)
    .slice(0, 8)
  const profilTxt =
    `Poste visé: ${poste}\n` +
    (secteur ? `Secteur: ${secteur}\n` : '') +
    `Compétences déclarées: ${(competences || []).join(', ') || 'non précisées'}\n` +
    `Expériences: ${exp.join(' ; ') || 'non précisées'}`

  const prompt =
    `Tu es un conseiller en évolution professionnelle. À partir du PROFIL d'un candidat et de VRAIES offres d'emploi pour son poste visé, fais un bilan de compétences honnête et actionnable.\n\n` +
    `PROFIL:\n${profilTxt}\n\n` +
    `OFFRES RÉELLES DU MARCHÉ POUR CE POSTE:\n${marcheTxt}\n\n` +
    `Analyse les compétences réellement demandées dans ces offres, compare-les au profil, et renvoie UNIQUEMENT ce JSON:\n` +
    `{"points_forts":["..."],"competences_marche":["..."],"ecarts":[{"competence":"","importance":"haute|moyenne","pourquoi":""}],"priorites":["..."],"recherche":["mot-cle1","mot-cle2","mot-cle3","mot-cle4","mot-cle5","mot-cle6"]}\n` +
    `Règles: 3 à 5 points forts, 5 à 8 competences_marche, 3 à 6 ecarts classés par importance, 3 priorités max, et "recherche" = mots-clés simples (1 à 2 mots) correspondant aux compétences manquantes, utilisables pour chercher des formations. Pas de texte hors JSON.`

  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host
    const r = await fetch(`https://${host}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1600,
        system: 'Tu retournes UNIQUEMENT du JSON valide, sans texte avant ou après, sans markdown.',
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    const data = await r.json()
    const text = (data.content?.[0]?.text || '').replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const bilan = JSON.parse(text)
    bilan._offresAnalysees = offres.length
    return res.status(200).json(bilan)
  } catch (e) {
    return res.status(200).json({ error: 'analyse_impossible' })
  }
}
