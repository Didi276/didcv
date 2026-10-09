// pdfUtils.js — Génération PDF texte réel (compatible ATS)
// Remplace html2canvas qui produisait des PDFs image illisibles par les ATS

// Référence A4 @ 96 DPI — c'est la même constante (PAGE.minHeight) utilisée par
// tous les templates CV pour leur propre mise en page.
const PAGE_HEIGHT = 1123
const PAGE_WIDTH = 794
const SCALE_FLOOR = 0.7

export function downloadCVasPDF(cvElement, prenom, nom) {
  if (!cvElement) return

  // Mesurer la hauteur réelle du CV rendu sur l'élément LIVE, avant de le
  // cloner en HTML — scrollHeight reflète le contenu réel même si App.css le
  // masque visuellement à l'écran via #cv-to-print { overflow: hidden }.
  const naturalHeight = cvElement.scrollHeight
  const scale = naturalHeight > PAGE_HEIGHT
    ? Math.max(PAGE_HEIGHT / naturalHeight, SCALE_FLOOR)
    : 1
  const hauteurAjustee = Math.ceil(naturalHeight * scale)

  // Récupérer le HTML rendu avec tous les styles inline
  const html = cvElement.outerHTML

  // Ouvrir une fenêtre d'impression
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) {
    alert('Active les popups pour télécharger ton CV.')
    return
  }

  printWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>CV - ${prenom} ${nom}</title>
  <style>
    /* Forcer les couleurs exactes à l'impression */
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    /* Format A4 exact */
    @page {
      size: 210mm 297mm;
      margin: 0;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: ${PAGE_WIDTH}px;
      background: white;
    }
    /* Masquer les boutons et éléments d'interface */
    button, .no-print { display: none !important; }
    /* Ajustement automatique "fit-to-page" : le wrapper réserve l'espace
       réellement occupé par le CV une fois réduit, pour que la pagination de
       l'impression se base sur la taille visuelle réduite, pas la taille
       d'origine. Centré horizontalement pour compenser le rétrécissement
       proportionnel de la largeur. */
    .cv-fit-wrapper {
      width: ${PAGE_WIDTH}px;
      height: ${hauteurAjustee}px;
      overflow: hidden;
      display: flex;
      justify-content: center;
    }
    #cv-to-print {
      --cv-scale: ${scale};
      transform: scale(var(--cv-scale));
      transform-origin: top center;
      /* Évite une coupure de page évitable si le CV reste malgré tout
         légèrement plus haut qu'une page (cas du plancher à 0.7). */
      page-break-inside: avoid;
      break-inside: avoid;
    }
  </style>
</head>
<body>
<div class="cv-fit-wrapper">
${html}
</div>
<script>
  // Attendre que les polices et styles soient chargés
  document.fonts.ready.then(function() {
    setTimeout(function() {
      window.focus()
      window.print()
    }, 300)
  }).catch(function() {
    setTimeout(function() {
      window.print()
    }, 500)
  })
</script>
</body>
</html>`)

  printWindow.document.close()
}

export function downloadLettreasePDF(lettre, prenom, nom) {
  const printWindow = window.open('', '_blank', 'width=900,height=700')
  if (!printWindow) {
    alert('Active les popups pour télécharger ta lettre.')
    return
  }

  // Nettoyer les marqueurs de la lettre
  const texte = lettre
    .replace(/\|\|EXP\|\|/g, '')
    .replace(/\|\|DEST\|\|/g, '')
    .replace(/\|\|DATE\|\|/g, '')
    .replace(/\|\|BODY\|\|/g, '')
    .trim()

  printWindow.document.write(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Lettre - ${prenom} ${nom}</title>
  <style>
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    @page { size: 210mm 297mm; margin: 20mm 25mm; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 12pt;
      line-height: 1.8;
      color: #222;
      margin: 0;
      white-space: pre-wrap;
    }
  </style>
</head>
<body>${texte}</body>
<script>
  document.fonts.ready.then(() => setTimeout(() => { window.focus(); window.print() }, 300))
</script>
</html>`)

  printWindow.document.close()
}
