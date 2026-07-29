function emailShell({ titre, sousTitre, corps, ctaUrl, ctaLabel }) {
  return `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica', sans-serif; background: #f8f9ff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; }
    .header { background: #4f46e5; padding: 32px; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .body { padding: 32px; }
    .section { margin-bottom: 24px; }
    .section h3 { color: #4f46e5; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
    .item { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #374151; }
    .cta { display: block; text-align: center; padding: 14px 28px; background: #4f46e5; color: white; border-radius: 10px; text-decoration: none; font-weight: 700; margin: 24px 0; }
    .footer { padding: 24px 32px; background: #f8f9ff; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size:12px;opacity:0.7;margin-bottom:8px">DidCV</div>
      <h1>${titre}</h1>
      ${sousTitre ? `<p style="margin:8px 0 0;opacity:0.85">${sousTitre}</p>` : ''}
    </div>
    <div class="body">
      ${corps}
      ${ctaUrl ? `<a href="${ctaUrl}" class="cta">${ctaLabel}</a>` : ''}
    </div>
    <div class="footer">
      DidCV • Le compagnon de ta recherche d'emploi<br>
      <a href="https://didcv.vercel.app/unsubscribe">Se désabonner</a>
    </div>
  </div>
</body>
</html>`
}

export const emailPreparationEntretien = (prenom, poste, entreprise, date, checklist) => emailShell({
  titre: 'Tu as un entretien dans 3 jours',
  sousTitre: `${poste} chez ${entreprise}`,
  corps: `
    <p>Bonjour ${prenom},</p>
    <p>Ton entretien approche. Voici ta checklist de préparation personnalisée.</p>
    ${checklist}
  `,
  ctaUrl: 'https://didcv.vercel.app/entretien',
  ctaLabel: "Simuler l'entretien maintenant",
})

export const emailRappelEntretien = (prenom, poste, entreprise, heure, lieu) => emailShell({
  titre: 'Ton entretien est demain',
  sousTitre: `${poste} chez ${entreprise}`,
  corps: `
    <p>Bonjour ${prenom},</p>
    <p>Petit rappel : ton entretien a lieu <strong>demain</strong>.</p>
    <div class="section">
      <h3>Détails</h3>
      <div class="item">Heure : ${heure || 'Non précisée'}</div>
      <div class="item">Lieu : ${lieu || 'Non précisé'}</div>
    </div>
    <p>Prends quelques minutes ce soir pour relire ta checklist et préparer ta tenue.</p>
  `,
  ctaUrl: 'https://didcv.vercel.app/candidatures',
  ctaLabel: 'Revoir ma préparation',
})

export const emailSuiviApresEntretien = (prenom, poste, entreprise) => emailShell({
  titre: "Comment s'est passé ton entretien ?",
  sousTitre: `${poste} chez ${entreprise}`,
  corps: `
    <p>Bonjour ${prenom},</p>
    <p>Tu avais un entretien pour ce poste récemment. Prends un moment pour noter ton ressenti pendant que c'est encore frais, ça t'aidera à progresser sur les prochains entretiens.</p>
    <p>Si tu as déjà un retour, pense à mettre à jour le statut de ta candidature.</p>
  `,
  ctaUrl: 'https://didcv.vercel.app/candidatures',
  ctaLabel: 'Mettre à jour ma candidature',
})

export const emailRelanceCandidat = (prenom, nbrCandidatures) => emailShell({
  titre: 'Et si tu relançais tes candidatures ?',
  sousTitre: `${nbrCandidatures} candidature${nbrCandidatures > 1 ? 's' : ''} en cours`,
  corps: `
    <p>Bonjour ${prenom},</p>
    <p>Tu as ${nbrCandidatures} candidature${nbrCandidatures > 1 ? 's' : ''} en attente de réponse. Une relance polie après quelques jours montre ta motivation et peut débloquer une réponse.</p>
    <p>Un message court suffit : rappelle le poste, réaffirme ton intérêt, et demande où en est le process de recrutement.</p>
  `,
  ctaUrl: 'https://didcv.vercel.app/candidatures',
  ctaLabel: 'Voir mes candidatures',
})

export const emailBienvenueDidCV = (prenom) => emailShell({
  titre: 'Bienvenue sur DidCV',
  sousTitre: "Ton compagnon de recherche d'emploi",
  corps: `
    <p>Bonjour ${prenom},</p>
    <p>Ton compte est prêt. Voici comment démarrer :</p>
    <div class="section">
      <div class="item">1. Importe ton CV ou remplis ton profil</div>
      <div class="item">2. Génère un CV adapté à chaque offre</div>
      <div class="item">3. Suis tes candidatures dans le kanban</div>
      <div class="item">4. Entraîne-toi aux entretiens avec l'IA</div>
    </div>
  `,
  ctaUrl: 'https://didcv.vercel.app/profile',
  ctaLabel: 'Compléter mon profil',
})

export const emailResumeHebdomadaire = (prenom, stats, conseil, lienEntretien) => emailShell({
  titre: 'Ton résumé de la semaine',
  sousTitre: 'DidCV',
  corps: `
    <p>Bonjour ${prenom},</p>
    <div class="section">
      <h3>Cette semaine</h3>
      <div class="item">${stats.nbEntretiens} entretien${stats.nbEntretiens > 1 ? 's' : ''} prévu${stats.nbEntretiens > 1 ? 's' : ''}</div>
      ${stats.nbSansReponse > 0 ? `<div class="item">${stats.nbSansReponse} candidature${stats.nbSansReponse > 1 ? 's' : ''} sans réponse depuis 2 semaines, pense à relancer</div>` : ''}
    </div>
    ${stats.parStatutLabels?.length ? `
    <div class="section">
      <h3>Tes candidatures en cours</h3>
      ${stats.parStatutLabels.map(s => `<div class="item">${s.label} : ${s.n}</div>`).join('')}
    </div>` : ''}
    ${conseil ? `
    <div class="section">
      <h3>Conseil de la semaine</h3>
      <div class="item"><a href="${conseil.url}" style="color:#4f46e5;text-decoration:none;font-weight:600">${conseil.titre}</a></div>
    </div>` : ''}
  `,
  ctaUrl: lienEntretien || 'https://didcv.vercel.app/candidatures',
  ctaLabel: lienEntretien ? "Simuler l'entretien maintenant" : 'Voir mes candidatures',
})
