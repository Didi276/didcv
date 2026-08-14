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

  // 1. Récupérer le profil complet du candidat
  const { data: profil } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user_id)
    .single()

  if (!profil) return res.status(404).json({ error: 'Profil introuvable' })

  // 2. Récupérer les CVs du candidat pour en extraire les compétences
  // (la table cvs stocke tout dans la colonne JSON cv_data, pas de colonnes
  // top-level titre/competences/experiences/secteur)
  const { data: cvs } = await supabase
    .from('cvs')
    .select('cv_data')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(3)

  const competencesCvs = [...new Set(
    (cvs || []).flatMap(cv => (cv.cv_data?.competences || []).filter(Boolean))
  )]

  // 3. Récupérer les candidatures récentes (pour éviter les doublons)
  const { data: candidatures } = await supabase
    .from('candidatures')
    .select('poste, entreprise, statut')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })
    .limit(10)

  // 4. Récupérer les offres récentes
  const { data: offres } = await supabase
    .from('offres_directes')
    .select('id, titre, entreprise, lieu, description, type_contrat, salaire, url_candidature')
    .eq('actif', true)
    .order('date_publication', { ascending: false })
    .limit(200)

  if (!offres?.length) return res.status(200).json({ offres: [] })

  // 5. Construire un contexte riche pour Claude
  const profilTexte = `
PROJET PROFESSIONNEL :
Candidat : ${profil.prenom || ''} ${profil.nom || ''}
Poste recherché : ${profil.poste_souhaite || 'Non précisé'}
Secteurs souhaités : ${(profil.secteurs_souhaites || []).join(', ') || 'Tous secteurs'}
Type de contrat : ${profil.type_contrat_souhaite || 'Indifférent'}
Salaire minimum : ${profil.salaire_min ? profil.salaire_min + '€/an' : 'Non précisé'}
Ville : ${profil.ville || 'Non précisée'}
Mobilité : ${profil.mobilite || 'Non précisée'}
Télétravail : ${profil.teletravail || 'Indifférent'}
Description projet : ${profil.description_projet || ''}

COMPÉTENCES (depuis CVs) :
${competencesCvs.join(', ') || 'Non renseignées'}

CANDIDATURES RÉCENTES (postes déjà postulés) :
${(candidatures || []).map(c => `${c.poste} chez ${c.entreprise} (${c.statut})`).join('\n') || 'Aucune'}
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
        content: `Tu es un expert en recrutement. Analyse ce profil candidat et trouve les meilleures offres.

${profilTexte}

OFFRES DISPONIBLES (index | titre | entreprise | lieu | type | description) :
${offresTexte}

RÈGLES :
- Évite de proposer des postes similaires à ceux déjà postulés
- Priorise les offres qui correspondent aux secteurs souhaités
- Respecte le type de contrat et le salaire minimum si précisés
- Tiens compte de la mobilité géographique

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

  // 6. Construire les offres matchées
  let offresMatchees = matches
    .filter(m => m.index >= 0 && m.index < offres.length)
    .map(m => ({
      ...offres[m.index],
      score: m.score,
      raison: m.raison
    }))

  // Fallback : profil trop incomplet pour un matching IA pertinent, ou aucune
  // correspondance retournée -> on affiche simplement les offres les plus récentes.
  if (offresMatchees.length === 0) {
    offresMatchees = offres.slice(0, 10).map(o => ({ ...o, score: null, raison: null }))
  }

  return res.status(200).json({ offres: offresMatchees })
}
