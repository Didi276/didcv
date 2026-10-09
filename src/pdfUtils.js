// pdfUtils.js — Génération PDF texte réel (compatible ATS)
// Remplace html2canvas qui produisait des PDFs image illisibles par les ATS

// Référence A4 @ 96 DPI — c'est la même constante (PAGE.minHeight) utilisée par
// tous les templates CV pour leur propre mise en page.
const PAGE_HEIGHT = 1123
const PAGE_WIDTH = 794
const SCALE_FLOOR = 0.7

export function downloadCVasPDF(cvElement, prenom, nom) {
  if (!cvElement) return

  // Mesurer la VRAIE hauteur du contenu : les templates verrouillent #cv-to-print
  // à min-height=max-height=1123px avec overflow:hidden. On neutralise ces
  // contraintes sur l'élément live le temps de la mesure, puis on restaure.
  const styleOriginal = cvElement.getAttribute('style') || ''
  cvElement.style.setProperty('height', 'auto', 'important')
  cvElement.style.setProperty('min-height', '0', 'important')
  cvElement.style.setProperty('max-height', 'none', 'important')
  cvElement.style.setProperty('overflow', 'visible', 'important')
  const naturalHeight = cvElement.scrollHeight
  cvElement.setAttribute('style', styleOriginal)

  const scale = naturalHeight > PAGE_HEIGHT
    ? Math.max(PAGE_HEIGHT / naturalHeight, SCALE_FLOOR)
    : 1

  console.log('[fit-to-page]', { naturalHeight, PAGE_HEIGHT, scale })

  const html = cvElement.outerHTML

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
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
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
    button, .no-print { display: none !important; }
    /* 1) Neutraliser les contraintes inline du template (min/max-height=1123px,
          overflow:hidden) qui, sinon, re-verrouillent la boîte à une page dans
          la fenêtre d'impression. Un !important en feuille de style bat un
          style inline SANS !important (ce qui est le cas des templates). */
    /* 2) zoom (contrairement à transform:scale) réduit la mise en page ET la
          pagination d'impression ensemble : le CV tient réellement sur une
          page au lieu de déborder visuellement en page 2. */
    #cv-to-print {
      zoom: ${scale};
      min-height: 0 !important;
      max-height: none !important;
      height: auto !important;
      overflow: visible !important;
    }
  </style>
</head>
<body>
${html}
<script>
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
