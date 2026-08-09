// Matching IA entre le profil d'un candidat et les offres actives, via Claude.
// Nécessite ANTHROPIC_API_KEY (console.anthropic.com).
import { createClient } from '@supabase/supabase-js'
import Anthropic from '@anthropic-ai/sdk'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)
const anthropic = new Anthropic()

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const { user_id } = req.query
  if (!user_id) return res.status(400).json({ error: 'user_id requis' })

  // 1. Récupérer le profil du candidat
  const { data: profil } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user_id)
    .single()

  if (!profil) return res.status(404).json({ error: 'Profil introuvable' })

  // 2. Récupérer les offres récentes
  const { data: offres } = await supabase
    .from('offres_directes')
    .select('id, titre, entreprise, lieu, description, type_contrat, salaire, url_candidature')
    .eq('actif', true)
    .order('date_publication', { ascending: false })
    .limit(200)

  if (!offres?.length) return res.status(200).json({ offres: [] })

  // 3. Demander à Claude de faire le matching
  const profilTexte = `
Candidat: ${profil.prenom || ''} ${profil.nom || ''}
Poste souhaité: ${profil.poste_souhaite || 'Non précisé'}
Localisation: ${profil.ville || 'Non précisée'}
Compétences: ${profil.competences || 'Non précisées'}
Expérience: ${profil.experience || 'Non précisée'}
Type de contrat: ${profil.type_contrat_souhaite || 'Tous'}
Secteur souhaité: ${profil.secteur || 'Tous'}
`.trim()

  const offresTexte = offres.map((o, i) =>
    `[${i}] ${o.titre} | ${o.entreprise} | ${o.lieu} | ${o.type_contrat || ''} | ${(o.description || '').slice(0, 100)}`
  ).join('\n')

  let matches = []
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: `Tu es un expert en recrutement. Analyse ce profil candidat et ces offres d'emploi.

PROFIL CANDIDAT :
${profilTexte}

OFFRES DISPONIBLES (index | titre | entreprise | lieu | type | description) :
${offresTexte}

Sélectionne les 10 meilleures correspondances pour ce candidat.
Retourne UNIQUEMENT ce JSON sans texte autour :
{
  "matches": [
    {
      "index": 0,
      "score": 95,
      "raison": "Correspond parfaitement à votre profil de développeur React"
    }
  ]
}

Trie par score décroissant. Score de 0 à 100.`
      }]
    })

    const text = message.content.find(b => b.type === 'text')?.text || ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const parsed = JSON.parse(clean)
    matches = parsed.matches || []
  } catch {
    matches = []
  }

  // 4. Construire les offres matchées
  const offresMatchees = matches
    .filter(m => m.index >= 0 && m.index < offres.length)
    .map(m => ({
      ...offres[m.index],
      score: m.score,
      raison: m.raison
    }))

  return res.status(200).json({ offres: offresMatchees })
}
