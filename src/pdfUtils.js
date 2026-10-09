// pdfUtils.js — Génération PDF texte réel (compatible ATS)
// Remplace html2canvas qui produisait des PDFs image illisibles par les ATS

// Référence A4 @ 96 DPI — c'est la même constante (PAGE.minHeight) utilisée par
// tous les templates CV pour leur propre mise en page.
const PAGE_HEIGHT = 1123
const PAGE_WIDTH = 794
const SCALE_FLOOR = 0.7
const SCALE_CEILING = 1.12

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
    var SCALE_CEILING = ${SCALE_CEILING};

    function fitAndPrint() {
      var el = document.getElementById('cv-to-print');
      if (!el) { window.print(); return; }

      // 1) Lever les verrous de hauteur posés en inline par le template
      //    (min/max-height = 1123px, overflow:hidden).
      el.style.setProperty('min-height', '0', 'important');
      el.style.setProperty('max-height', 'none', 'important');
      el.style.setProperty('height', 'auto', 'important');
      el.style.setProperty('overflow', 'visible', 'important');

      // 2) Identifier la famille de template.
      var cs = window.getComputedStyle(el);
      var mode = 'other';
      if (cs.display === 'flex' && cs.flexDirection.indexOf('column') === -1) mode = 'twocol';
      else if (cs.display === 'block') mode = 'onecol';

      // 3) Zoom "densité" + largeur pleine (3 passes de convergence).
      //    On mesure la hauteur réelle en flux naturel, on calcule le zoom
      //    nécessaire pour tenir sur une page, BORNÉ dans une plage lisible
      //    (0.7 à 1.12 : jamais minuscule, jamais démesuré), puis on pré-élargit
      //    le contenu pour qu'une fois zoomé il occupe toute la largeur.
      var scale = 1, width = PAGE_WIDTH;
      for (var i = 0; i < 3; i++) {
        el.style.setProperty('zoom', '1', 'important');
        el.style.setProperty('width', width + 'px', 'important');
        var h = el.scrollHeight;
        scale = Math.min(Math.max(PAGE_HEIGHT / h, SCALE_FLOOR), SCALE_CEILING);
        width = Math.round(PAGE_WIDTH / scale);
      }
      el.style.setProperty('width', width + 'px', 'important');
      el.style.setProperty('zoom', String(scale), 'important');

      // 4) Remplir la hauteur SANS toucher la police : on répartit l'espace
      //    restant entre les sections (comme un graphiste aère un CV léger),
      //    pour qu'il n'y ait jamais ni trou ni bloc tassé. Hauteur cible avant
      //    zoom = PAGE_HEIGHT / scale (= une page pile une fois zoomée).
      var targetH = Math.round(PAGE_HEIGHT / scale);
      if (mode === 'onecol') {
        el.style.setProperty('display', 'flex', 'important');
        el.style.setProperty('flex-direction', 'column', 'important');
        el.style.setProperty('justify-content', 'space-between', 'important');
        el.style.setProperty('height', targetH + 'px', 'important');
      } else if (mode === 'twocol') {
        el.style.setProperty('height', targetH + 'px', 'important');
        el.style.setProperty('align-items', 'stretch', 'important');
        for (var c = 0; c < el.children.length; c++) {
          var col = el.children[c];
          col.style.setProperty('display', 'flex', 'important');
          col.style.setProperty('flex-direction', 'column', 'important');
          col.style.setProperty('justify-content', 'space-between', 'important');
        }
      }
      // mode 'other' (grille/bento…) : on ne restructure pas, le zoom borné
      // suffit et on évite de casser une mise en page exotique.

      console.log('[fit-to-page]', { scale: scale, width: width, targetH: targetH, mode: mode });
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
