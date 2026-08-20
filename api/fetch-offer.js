// Le dernier segment du chemin est l'identifiant d'offre France Travail (ex:
// "049RSNK", 7 caractères) — un regex scannant toute l'URL matcherait à tort
// des mots du chemin comme "candidat" ou "recherche" (eux aussi 8-9 caractères
// alphanumériques) avant d'atteindre le véritable identifiant en fin d'URL.
function extraireIdFranceTravail(url) {
  try {
    const { pathname } = new URL(url)
    const segments = pathname.split('/').filter(Boolean)
    const dernier = segments[segments.length - 1]
    return dernier && /^[a-z0-9]{5,15}$/i.test(dernier) ? dernier : null
  } catch {
    return null
  }
}

async function recupererOffreFranceTravail(url) {
  const id = extraireIdFranceTravail(url)
  if (!id) return null
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
    if (!access_token) return null

    const offreRes = await fetch(
      `https://api.francetravail.io/partenaire/offresdemploi/v2/offres/${id}`,
      { headers: { Authorization: `Bearer ${access_token}` } }
    )
    if (!offreRes.ok) return null
    const offre = await offreRes.json()
    if (!offre.intitule) return null

    return {
      contenu: [
        `Titre : ${offre.intitule}`,
        `Entreprise : ${offre.entreprise?.nom || ''}`,
        `Lieu : ${offre.lieuTravail?.libelle || ''}`,
        `Contrat : ${offre.typeContratLibelle || ''}`,
        `Description : ${offre.description || ''}`,
        `Compétences : ${offre.competences?.map(c => c.libelle).join(', ') || ''}`,
      ].join('\n'),
      titre: offre.intitule,
      entreprise: offre.entreprise?.nom,
      source: 'france_travail',
    }
  } catch {
    return null
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const { url } = req.query
  if (!url) return res.status(400).json({ error: 'url requise' })

  if (url.includes('francetravail.fr') || url.includes('pole-emploi.fr')) {
    const offre = await recupererOffreFranceTravail(url)
    if (offre) return res.json(offre)
  }

  // Pour les autres URLs : extraction HTML améliorée
  try {
    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'fr-FR,fr;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    })
    const html = await r.text()

    // Extraire le titre depuis les balises meta ou h1
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i)
    const ogTitleMatch = html.match(/property="og:title"[^>]*content="([^"]+)"/i)
    const ogDescMatch = html.match(/property="og:description"[^>]*content="([^"]+)"/i)

    // Cibler les zones de contenu pertinentes
    const contentSelectors = [
      /<main[^>]*>([\s\S]*?)<\/main>/i,
      /<article[^>]*>([\s\S]*?)<\/article>/i,
      /<div[^>]*class="[^"]*(?:job|offer|offre|poste|description|mission|content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
    ]

    let contenu = ''
    for (const selector of contentSelectors) {
      const match = html.match(selector)
      if (match) {
        contenu = match[1]
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .substring(0, 4000)
        if (contenu.length > 200) break
      }
    }

    // Fallback sur le body complet
    if (!contenu) {
      contenu = html
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 4000)
    }

    const titre = ogTitleMatch?.[1] || h1Match?.[1] || titleMatch?.[1] || ''

    return res.json({
      contenu: ogDescMatch?.[1]
        ? `${titre}\n${ogDescMatch[1]}\n${contenu}`
        : `${titre}\n${contenu}`,
      titre: titre.replace(/\s*[-|–]\s*.*/, '').trim(),
      source: 'html',
    })
  } catch {
    return res.status(500).json({
      error: 'Impossible de lire cette page',
      suggestion: "Copiez-collez directement le texte de l'offre",
    })
  }
}
