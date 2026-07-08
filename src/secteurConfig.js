// ============================================================
// secteurConfig.js — Détection secteur + prompts spécialisés
// Couvre tous les profils : bureau, manuel, santé, resto, etc.
// ============================================================

// ─── 1. DÉTECTION DU SECTEUR ────────────────────────────────
export function detecterSecteur(offreEmploi, sourceCV) {
  const texte = (offreEmploi + ' ' + sourceCV).toLowerCase()

  const scores = {
    tech:        0,
    sante:       0,
    btp:         0,
    restauration:0,
    commerce:    0,
    transport:   0,
    creatif:     0,
    securite:    0,
    beaute:      0,
    junior:      0,
    cadre:       0,
    tertiaire:   0,
  }

  // Tech / Informatique
  const motsTech = ['développeur','developer','software','frontend','backend','fullstack','devops','data','python','javascript','react','angular','vue','node','java','php','sql','api','cloud','aws','docker','kubernetes','cybersécurité','it ','informatique','code','programmation','algorithme','machine learning','ia ','intelligence artificielle','scrum','agile']
  motsTech.forEach(m => { if (texte.includes(m)) scores.tech += 2 })

  // Santé / Médico-social
  const motsSante = ['infirmier','aide-soignant','aide soignant','médecin','docteur','pharmacien','kinésithérapeute','ergothérapeute','psychologue','sage-femme','ambulancier','aide à domicile','auxiliaire de vie','ehpad','clinique','hôpital','hopital','soins','patient','médical','paramédical','bloc opératoire','urgences','nursing','soin','soignant']
  motsSante.forEach(m => { if (texte.includes(m)) scores.sante += 2 })

  // BTP / Métiers manuels
  const motsBTP = ['plombier','électricien','electricien','menuisier','maçon','macon','carreleur','peintre en bâtiment','charpentier','couvreur','soudeur','technicien de maintenance','maintenance','monteur','installateur','btp','chantier','travaux','bâtiment','batiment','génie civil','terrassement','gros oeuvre','second oeuvre','cvc','chauffagiste','climaticien','frigoriste','automaticien','mécanicien','mecanique','usinage','tournage','fraisage','tuyauteur','serrurier','ferronnier','étancheur']
  motsBTP.forEach(m => { if (texte.includes(m)) scores.btp += 2 })

  // Restauration / Hôtellerie
  const motsResto = ['cuisinier','chef','sous-chef','commis','plongeur','serveur','barman','bartender','hôte','hotesse','réceptionniste','chef de rang','maître d','sommelier','pâtissier','boulanger','boucher','charcutier','traiteur','restauration','cuisine','restaurant','hôtel','hotel','hébergement','room service','banquet','catering','gastronomie','cafeteria','cantine','collectivité']
  motsResto.forEach(m => { if (texte.includes(m)) scores.restauration += 2 })

  // Commerce / Vente / Retail
  const motsCommerce = ['vendeur','conseiller de vente','commercial','technico-commercial','account manager','business developer','chef de rayon','responsable magasin','caissier','hôte de caisse','grande distribution','retail','boutique','magasin','point de vente','prospection','portefeuille client','chiffre d\'affaires','b2b','b2c','négociation commerciale','account','sales']
  motsCommerce.forEach(m => { if (texte.includes(m)) scores.commerce += 2 })

  // Transport / Logistique
  const motsTransport = ['chauffeur','conducteur','livreur','transporteur','logisticien','gestionnaire de stock','préparateur de commande','magasinier','cariste','agent logistique','supply chain','entrepôt','camion','poids lourd','permis c','permis ce','fimo','caces','picking','réception','expédition','douane','fret','transit','affrètement','coordinateur logistique']
  motsTransport.forEach(m => { if (texte.includes(m)) scores.transport += 2 })

  // Créatif / Design / Communication
  const motsCreatif = ['graphiste','designer','directeur artistique','da ','motion','ux','ui','webdesigner','web designer','photographe','vidéaste','monteur','réalisateur','illustrateur','maquettiste','créatif','communication visuelle','brand','identité visuelle','adobe','photoshop','illustrator','indesign','figma','after effects','premiere','création de contenu','content creator','rédacteur','copywriter','community manager','social media']
  motsCreatif.forEach(m => { if (texte.includes(m)) scores.creatif += 2 })

  // Sécurité
  const motsSec = ['agent de sécurité','agent de surveillance','vigile','gardien','rondier','ssiap','cqp','contrôle d\'accès','télésurveillance','sûreté','prévention','cynophile','sécurité incendie','protection rapprochée']
  motsSec.forEach(m => { if (texte.includes(m)) scores.securite += 2 })

  // Beauté / Bien-être
  const motsBeaute = ['coiffeur','coiffeuse','esthéticienne','esthéticien','prothésiste ongulaire','maquilleur','maquilleuse','spa','institut','nail art','épilation','soins du visage','massage','sophrologue','coach bien-être','yoga','pilates']
  motsBeaute.forEach(m => { if (texte.includes(m)) scores.beaute += 2 })

  // Junior / Étudiant
  const motsJunior = ['stage','alternance','apprentissage','bac+','étudiant','licence','master 1','première expérience','débutant','junior','sans expérience','recherche de stage','contrat d\'apprentissage','contrat de professionnalisation']
  motsJunior.forEach(m => { if (texte.includes(m)) scores.junior += 2 })

  // Cadre dirigeant
  const motsCadre = ['directeur','président','ceo','cfo','daf','dg','drh','dsi','vp ','vice-président','associé','partner','managing','c-level','comex','codir','stratégie','gouvernance','transformation','leadership','management de transition']
  motsCadre.forEach(m => { if (texte.includes(m)) scores.cadre += 2 })

  // Tertiaire (par défaut)
  const motsTertiaire = ['comptable','contrôleur','auditeur','rh','ressources humaines','marketing','chef de projet','assistant','secrétaire','juridique','finance','analyste','chargé de','coordinateur','gestionnaire','responsable','consultant','manager','directeur de']
  motsTertiaire.forEach(m => { if (texte.includes(m)) scores.tertiaire += 1 })

  // Trouver le secteur dominant
  const secteur = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]

  // Si aucun secteur dominant (score faible) → tertiaire par défaut
  if (secteur[1] < 2) return 'tertiaire'
  return secteur[0]
}

// ─── 2. CONFIGURATION PAR SECTEUR ───────────────────────────
export function getSecteurConfig(secteur, nbExp, profile) {
  const aExperience = nbExp > 0
  const isJunior = !aExperience || nbExp <= 1

  const configs = {

    // ── TECH ──────────────────────────────────────────────────
    tech: {
      label: 'Tech / Informatique',
      missionsPoste: nbExp <= 2 ? 4 : 3,
      missionsStage: 3,
      sections: ['experiences', 'formations', 'competences', 'projets', 'langues'],
      promptSupp: `
SECTEUR TECH — RÈGLES SPÉCIFIQUES :
- Missions : privilégie les technologies utilisées, l'impact technique, les métriques (temps de réponse, couverture de tests, nombre d'utilisateurs)
- Compétences : langages de programmation EXACTS (Python, JavaScript, TypeScript...), frameworks (React, Django, Spring...), outils (Docker, Git, AWS, Figma...) — PAS de compétences génériques
- Si le candidat a des projets personnels/open source, mentionne-les dans les missions
- Accroche : cite les technologies maîtrisées et le type d'architecture (microservices, monolithique, SPA...)
- Verbes : Développé, Architecturé, Optimisé, Déployé, Intégré, Automatisé, Migré, Refactorisé`,
      accrocheFormat: `Développeur [stack] avec X ans d'expérience en [domaine]. [Réalisation technique avec métriques]. Maîtrise de [tech stack] avec une appétence pour [domaine tech ciblé].`,
    },

    // ── SANTÉ ─────────────────────────────────────────────────
    sante: {
      label: 'Santé / Médico-social',
      missionsPoste: 3,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'certifications', 'langues'],
      promptSupp: `
SECTEUR SANTÉ — RÈGLES SPÉCIFIQUES :
- Missions : focus sur les soins prodigués, le nombre de patients, les pathologies traitées, les protocoles suivis
- Compétences : actes techniques précis (prise de sang, perfusion, soins de plaies...), logiciels médicaux (Mediboard, DPI...), spécialités
- NE PAS inventer de données médicales — rester factuel
- Certifications et diplômes sont ESSENTIELS à mettre en avant (DEAS, IFSI, DU...)
- Accroche : mentionner le diplôme officiel, les services/spécialités, les valeurs (bienveillance, rigueur, empathie)
- Verbes : Accompagné, Prodigué, Assuré, Géré, Coordonné, Surveillé, Transmis, Collaboré`,
      accrocheFormat: `[Titre officiel diplômé] avec X ans d'expérience en [service/spécialité]. [Acte ou réalisation concrète]. Reconnu(e) pour [qualité humaine] et [compétence technique].`,
    },

    // ── BTP / MÉTIERS MANUELS ─────────────────────────────────
    btp: {
      label: 'BTP / Métiers manuels',
      missionsPoste: 3,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'habilitations', 'langues'],
      promptSupp: `
SECTEUR BTP / MÉTIERS MANUELS — RÈGLES SPÉCIFIQUES :
- Missions : types de chantiers, surfaces traitées, matériaux utilisés, équipe gérée, délais respectés
- Compétences : habilitations électriques (BR, B2V...), CACES, SST, habilitations travaux en hauteur, permis, certifications professionnelles
- Les chiffres ici = surfaces (m²), durées de chantier, budget, nombre d'ouvriers encadrés
- Accroche : métier exact, années d'expérience terrain, types de chantiers maîtrisés
- PAS de jargon tertiaire — vocabulaire terrain, concret, direct
- Verbes : Réalisé, Posé, Installé, Monté, Soudé, Câblé, Rénové, Construit, Entretenu, Supervisé`,
      accrocheFormat: `[Métier] avec X ans d'expérience sur des chantiers [type]. [Réalisation terrain avec chiffre]. Titulaire de [habilitations/certifications clés].`,
    },

    // ── RESTAURATION ──────────────────────────────────────────
    restauration: {
      label: 'Restauration / Hôtellerie',
      missionsPoste: 3,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'langues'],
      promptSupp: `
SECTEUR RESTAURATION / HÔTELLERIE — RÈGLES SPÉCIFIQUES :
- Missions : couverts/service, type de cuisine, volume de production, équipe gérée, concepts maîtrisés
- Compétences : techniques culinaires précises (brunoise, liaison, sauces...), types de cuisine, matériel, langues pour l'accueil, logiciels (Micros, Fidelio...)
- Les chiffres = nombre de couverts, taille de brigade, CA, taux d'occupation
- HACCP, normes d'hygiène et sécurité alimentaire sont des atouts MAJEURS à mentionner
- Accroche : type d'établissement (gastronomique, brasserie, hôtel 4*...), spécialité culinaire, capacité
- Verbes : Élaboré, Dressé, Supervisé, Géré, Coordonné, Accueilli, Fidélisé, Organisé`,
      accrocheFormat: `[Métier] avec X ans d'expérience en [type d'établissement]. [Réalisation avec volume/chiffre]. Maîtrise de [technique ou spécialité] et des normes HACCP.`,
    },

    // ── COMMERCE ──────────────────────────────────────────────
    commerce: {
      label: 'Commerce / Vente',
      missionsPoste: 3,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'langues'],
      promptSupp: `
SECTEUR COMMERCE / VENTE — RÈGLES SPÉCIFIQUES :
- Missions : OBLIGATOIRE mettre des chiffres de vente (CA généré, objectifs atteints en %, nombre de clients, panier moyen)
- Compétences : CRM utilisés (Salesforce, HubSpot...), techniques de vente (SPIN, MEDDIC...), secteurs/produits vendus
- Les chiffres = CA, taux de conversion, nombre de deals, croissance du portefeuille
- Accroche : secteur de vente, type de clients (B2B/B2C/grands comptes), résultat commercial fort
- Verbes : Développé, Négocié, Prospecté, Fidélisé, Conclu, Atteint, Dépassé, Géré, Animé`,
      accrocheFormat: `[Métier commercial] avec X ans d'expérience en [secteur/type de vente]. [Résultat commercial fort avec % ou €]. Spécialisé en [type de clients ou produit].`,
    },

    // ── TRANSPORT / LOGISTIQUE ────────────────────────────────
    transport: {
      label: 'Transport / Logistique',
      missionsPoste: 3,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'habilitations', 'langues'],
      promptSupp: `
SECTEUR TRANSPORT / LOGISTIQUE — RÈGLES SPÉCIFIQUES :
- Missions : volumes traités (colis, palettes, tonnes), distances, types de marchandises, équipe gérée, ponctualité
- Compétences : PERMIS (B, C, CE, D...), CACES (1, 3, 5...), FIMO/FCO, ADR (matières dangereuses), logiciels WMS, ERP
- Les chiffres = nombre de colis/jour, volume en m³, km parcourus, taux de service
- Habilitations et certifications sont CRUCIALES dans ce secteur
- Accroche : type de transport/logistique, certifications clés, rigueur et fiabilité
- Verbes : Assuré, Géré, Optimisé, Livré, Conduit, Supervisé, Chargé, Organisé, Planifié`,
      accrocheFormat: `[Métier] avec X ans d'expérience en [type de transport/logistique]. [Réalisation avec volume ou chiffre]. Titulaire de [permis/CACES/certifications].`,
    },

    // ── CRÉATIF ───────────────────────────────────────────────
    creatif: {
      label: 'Créatif / Design / Communication',
      missionsPoste: 3,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'projets', 'langues'],
      promptSupp: `
SECTEUR CRÉATIF — RÈGLES SPÉCIFIQUES :
- Missions : types de projets réalisés, clients/marques pour lesquels on a travaillé, supports produits (site web, affiche, vidéo...)
- Compétences : logiciels EXACTS (Adobe CC, Figma, Sketch, Webflow, Final Cut, Canva...), styles maîtrisés, types de médias
- Les chiffres = nombre de projets, audience touchée, taux d'engagement, croissance d'abonnés
- Mentionner le portfolio si disponible dans les coordonnées
- Accroche : style créatif, spécialité, types de clients (startups, grands groupes, agences...)
- Verbes : Conçu, Créé, Réalisé, Designé, Développé, Produit, Animé, Illustré, Dirigé`,
      accrocheFormat: `[Métier créatif] avec X ans d'expérience en [spécialité]. [Réalisation marquante]. Maîtrise de [outils] et sensibilité pour [style/domaine].`,
    },

    // ── SÉCURITÉ ──────────────────────────────────────────────
    securite: {
      label: 'Sécurité / Surveillance',
      missionsPoste: 3,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'habilitations', 'langues'],
      promptSupp: `
SECTEUR SÉCURITÉ — RÈGLES SPÉCIFIQUES :
- Missions : type de site sécurisé, effectif supervisé, incidents gérés, rondes effectuées
- Compétences : carte professionnelle CNAPS (OBLIGATOIRE à mentionner), SSIAP 1/2/3, CQP APS, SST, habilitations
- Les chiffres = superficie du site, nombre de rondes/nuit, incidents résolus
- Accroche : types de sites sécurisés (commerce, industrie, événementiel...), certifications, rigueur
- Verbes : Sécurisé, Surveillé, Contrôlé, Géré, Intervenu, Prévenu, Renseigné, Accompagné`,
      accrocheFormat: `Agent de sécurité avec X ans d'expérience sur des sites [type]. Titulaire de la carte professionnelle CNAPS et [autres certifications]. [Réalisation concrète].`,
    },

    // ── BEAUTÉ ────────────────────────────────────────────────
    beaute: {
      label: 'Beauté / Bien-être',
      missionsPoste: 3,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'langues'],
      promptSupp: `
SECTEUR BEAUTÉ / BIEN-ÊTRE — RÈGLES SPÉCIFIQUES :
- Missions : techniques maîtrisées, clientèle fidélisée, CA généré, nouveaux services développés
- Compétences : techniques précises (coloration, kératine, soins, épilation...), marques/produits utilisés, logiciels de caisse/RDV
- Les chiffres = nombre de clients/semaine, CA, taux de fidélisation, nombre de services maîtrisés
- Diplômes importants : CAP, BP, BTS esthétique/coiffure
- Accroche : spécialité, types de clientèle, résultats commerciaux
- Verbes : Réalisé, Fidélisé, Conseillé, Développé, Maîtrisé, Accueilli, Géré, Formé`,
      accrocheFormat: `[Métier] avec X ans d'expérience en [spécialité]. [Réalisation avec chiffre client ou CA]. Reconnu(e) pour [technique signature] et sens du service client.`,
    },

    // ── JUNIOR / ÉTUDIANT ─────────────────────────────────────
    junior: {
      label: 'Junior / Étudiant',
      missionsPoste: 3,
      missionsStage: 2,
      sections: ['formations', 'experiences', 'projets', 'competences', 'langues', 'associations'],
      promptSupp: `
PROFIL JUNIOR / ÉTUDIANT — RÈGLES SPÉCIFIQUES :
- Si peu ou pas d'expérience professionnelle : METTRE LA FORMATION EN PREMIER, avant les expériences
- Valoriser : projets académiques, projets personnels, associations, bénévolat, jobs étudiants, compétitions
- Les stages et alternances sont des expériences à part entière — traiter comme un vrai poste
- Accroche : formation en cours/récente, compétences acquises, motivation et potentiel
- Compétences : outils appris en formation, langues, soft skills avec exemples concrets
- NE PAS simuler des années d'expérience — valoriser honnêtement le potentiel
- Verbes d'action pour projets : Développé, Réalisé, Conçu, Analysé, Présenté, Collaboré, Organisé
- Si 0 expérience : générer une section "Projets & Réalisations" avec les projets académiques`,
      accrocheFormat: `Étudiant(e) en [formation] à [établissement], spécialisé(e) en [domaine]. [Projet ou réalisation académique notable]. Motivé(e) à [apporter valeur dans le poste ciblé].`,
    },

    // ── CADRE DIRIGEANT ───────────────────────────────────────
    cadre: {
      label: 'Cadre dirigeant / C-Level',
      missionsPoste: 4,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'certifications', 'langues'],
      promptSupp: `
PROFIL CADRE DIRIGEANT — RÈGLES SPÉCIFIQUES :
- Missions : focus sur la STRATÉGIE, les résultats business, la transformation, le management
- Les chiffres = CA géré (M€), équipes managées (nombre), croissance (%), budgets, marchés ouverts
- Compétences : leadership, P&L, M&A, levée de fonds, gouvernance, transformation digitale...
- Accroche : secteurs d'expertise, taille d'organisations dirigées, résultats de transformation
- Vocabulaire C-level : vision stratégique, transformation, pilotage, gouvernance, création de valeur
- Verbes : Piloté, Transformé, Dirigé, Structuré, Développé, Négocié, Levé (fonds), Fusionné`,
      accrocheFormat: `Dirigeant avec X ans d'expérience en [secteur(s)]. [Résultat de transformation ou business fort]. Expert en [domaine de direction], reconnu pour [leadership/spécialité].`,
    },

    // ── TERTIAIRE (défaut) ────────────────────────────────────
    tertiaire: {
      label: 'Tertiaire / Bureau',
      missionsPoste: nbExp <= 2 ? 4 : 3,
      missionsStage: 2,
      sections: ['experiences', 'formations', 'competences', 'langues'],
      promptSupp: `
SECTEUR TERTIAIRE — RÈGLES SPÉCIFIQUES :
- Missions : résultats mesurables, outils utilisés, équipe/budget géré, process améliorés
- Compétences : logiciels métier précis, certifications, langues, méthodes de travail
- Les chiffres = budgets, délais, équipes, KPIs, économies réalisées
- Accroche : expertise fonctionnelle, secteurs d'activité, outils maîtrisés
- Verbes : Piloté, Optimisé, Coordonné, Géré, Structuré, Développé, Analysé, Produit`,
      accrocheFormat: `[Métier] avec X ans d'expérience en [domaine]. [Réalisation avec chiffre]. Maîtrise de [outils/méthodes] dans des environnements [type d'entreprise].`,
    },
  }

  return configs[secteur] || configs.tertiaire
}

// ─── 3. CONSTRUIRE LE PROMPT COMPLET ────────────────────────
export function buildPromptCV(sourceCV, offreEmploi, secteur, config, nbExp, hasCertifications, hasCentresInteret) {
  const aExperience = nbExp > 0
  const { missionsPoste, missionsStage, promptSupp } = config

  const sectionFormation = !aExperience || secteur === 'junior'
    ? `IMPORTANT : Ce candidat a peu ou pas d'expérience professionnelle. 
       Mets les FORMATIONS EN PREMIER dans le JSON (avant les expériences).
       Valorise les projets académiques, stages, associations et compétences acquises en formation.`
    : `Les expériences professionnelles passent avant les formations.`

  return `PROFIL DU CANDIDAT :
${sourceCV}

OFFRE D'EMPLOI CIBLÉE :
${offreEmploi}

SECTEUR DÉTECTÉ : ${config.label}

${promptSupp}

RÈGLES GÉNÉRALES OBLIGATOIRES :

1. CHIFFRES DANS CHAQUE MISSION : Chaque mission DOIT avoir au minimum 1 chiffre ou résultat mesurable.
   Si le candidat n'en donne pas, estime des ordres de grandeur crédibles selon le contexte.

2. DISTINCTION STAGE / POSTE :
   - Poste permanent : ${missionsPoste} missions avec chiffres
   - Stage (< 6 mois) : ${missionsStage} missions maximum

3. COMPÉTENCES ATS : 1 à 3 mots max par compétence. Entre 8 et 12. Mots-clés EXACTS de l'offre.

4. ACCROCHE : 3 à 5 phrases. Honnête, percutant, humain. Ne pas inventer de titre non occupé.
   INTERDIT : "Actuellement...", "Doté de...", "Fort de...", "Je suis..."

5. ${sectionFormation}

6. EXPÉRIENCES : ${nbExp} expériences, ordre chronologique inverse.

7. CERTIFICATIONS : ${hasCertifications ? "Inclus toutes les certifications." : "Tableau vide []."}

8. CENTRES D'INTÉRÊT : ${hasCentresInteret ? "Inclus les centres d'intérêt." : "Tableau vide []."}

9. FORMATIONS : Description obligatoire pour chaque formation (1 phrase sur les matières/compétences).

10. OPTIMISATION ATS : Mots-clés EXACTS de l'offre dans missions et compétences.

Retourne UNIQUEMENT ce JSON valide et complet :

{
  "prenom": "...",
  "nom": "...",
  "titre": "Titre EXACT calqué sur le poste visé",
  "email": "...",
  "telephone": "...",
  "ville": "...",
  "linkedin": "",
  "accroche": "3 à 5 phrases percutantes et honnêtes adaptées au secteur ${config.label}.",
  "experiences": [
    {
      "poste": "...",
      "entreprise": "...",
      "periode": "...",
      "lieu": "...",
      "missions": ["Mission avec CHIFFRE obligatoire", "..."]
    }
  ],
  "formations": [
    {"diplome": "...", "etablissement": "...", "periode": "...", "mention": "...", "description": "..."}
  ],
  "competences": ["Compétence ATS précise", "..."],
  "langues": [{"langue": "...", "niveau": "..."}],
  "certifications": [],
  "centres_interet": [],
  "atouts": ["Atout 1", "Atout 2", "Atout 3"]
}`
}
