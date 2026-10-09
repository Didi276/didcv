// pdfUtils.js — Génération PDF texte réel (compatible ATS)
// Remplace html2canvas qui produisait des PDFs image illisibles par les ATS

// Référence A4 @ 96 DPI — c'est la même constante (PAGE.minHeight) utilisée par
// tous les templates CV pour leur propre mise en page.
const PAGE_HEIGHT = 1123
const PAGE_WIDTH = 794
const SCALE_FLOOR = 0.7

export function downloadCVasPDF(cvElement, prenom, nom) {
  if (!cvElement) return

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
      overflow: visible;
    }
    button, .no-print { display: none !important; }
  </style>
</head>
<body>
${html}
<script>
  (function () {
    var PAGE_HEIGHT = ${PAGE_HEIGHT};
    var PAGE_WIDTH = ${PAGE_WIDTH};
    var SCALE_FLOOR = ${SCALE_FLOOR};

    function fitAndPrint() {
      var el = document.getElementById('cv-to-print');
      if (!el) { window.print(); return; }

      // Neutraliser les contraintes inline du template (min/max-height=1123px,
      // overflow:hidden) qui verrouilleraient la boîte à une page.
      el.style.setProperty('min-height', '0', 'important');
      el.style.setProperty('max-height', 'none', 'important');
      el.style.setProperty('height', 'auto', 'important');
      el.style.setProperty('overflow', 'visible', 'important');

      // Deux passes : à chaque passe on mesure la hauteur à la largeur courante,
      // on calcule le zoom nécessaire pour tenir en hauteur, puis on pré-élargit
      // le contenu (PAGE_WIDTH / zoom) pour qu'une fois zoomé il remplisse toute
      // la largeur. Ça converge sur largeur ET hauteur pleines.
      var scale = 1, width = PAGE_WIDTH;
      for (var i = 0; i < 2; i++) {
        el.style.setProperty('zoom', '1', 'important');
        el.style.setProperty('width', width + 'px', 'important');
        var h = el.scrollHeight;
        scale = h > PAGE_HEIGHT ? Math.max(PAGE_HEIGHT / h, SCALE_FLOOR) : 1;
        width = Math.round(PAGE_WIDTH / scale);
      }

      el.style.setProperty('width', width + 'px', 'important');
      el.style.setProperty('zoom', String(scale), 'important');
      console.log('[fit-to-page]', { scale: scale, width: width });

      setTimeout(function () { window.focus(); window.print(); }, 150);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { setTimeout(fitAndPrint, 200); })
        .catch(function () { setTimeout(fitAndPrint, 400); });
    } else {
      setTimeout(fitAndPrint, 400);
    }
  })();
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
