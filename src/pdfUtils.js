// pdfUtils.js — Génération PDF texte réel (compatible ATS)
// Remplace html2canvas qui produisait des PDFs image illisibles par les ATS

export function downloadCVasPDF(cvElement, prenom, nom) {
  if (!cvElement) return

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
      width: 794px;
      background: white;
    }
    /* Masquer les boutons et éléments d'interface */
    button, .no-print { display: none !important; }
    /* Éviter les coupures de page dans le CV */
    #cv-to-print {
      page-break-inside: avoid;
      break-inside: avoid;
    }
  </style>
</head>
<body>
${html}
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
