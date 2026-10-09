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

      el.style.setProperty('min-height', '0', 'important');
      el.style.setProperty('max-height', 'none', 'important');
      el.style.setProperty('height', 'auto', 'important');
      el.style.setProperty('overflow', 'visible', 'important');

      var cs = window.getComputedStyle(el);
      var mode = 'other';
      if (cs.display === 'flex' && cs.flexDirection.indexOf('column') === -1) mode = 'twocol';
      else if (cs.display === 'block') mode = 'onecol';

      // Convergence zoom densité + largeur pleine.
      var scale = 1, width = PAGE_WIDTH, naturalH = 0;
      for (var i = 0; i < 3; i++) {
        el.style.setProperty('zoom', '1', 'important');
        el.style.setProperty('width', width + 'px', 'important');
        naturalH = el.scrollHeight;
        scale = Math.min(Math.max(PAGE_HEIGHT / naturalH, SCALE_FLOOR), SCALE_CEILING);
        width = Math.round(PAGE_WIDTH / scale);
      }
      // Mesure finale à la largeur retenue (flux naturel).
      el.style.setProperty('zoom', '1', 'important');
      el.style.setProperty('width', width + 'px', 'important');
      naturalH = el.scrollHeight;
      scale = Math.min(Math.max(PAGE_HEIGHT / naturalH, SCALE_FLOOR), SCALE_CEILING);

      // ── CONTRÔLE INTERNE D'HARMONISATION ──
      var rendered = naturalH * scale;            // hauteur réelle après zoom
      var fillRatio = rendered / PAGE_HEIGHT;
      var verdict = 'OK';
      if (rendered > PAGE_HEIGHT + 3) {
        // Contenu trop dense même au plancher : on force le zoom sous le plancher
        // pour GARANTIR une seule page (jamais de page 2 livrée à l'utilisateur).
        scale = PAGE_HEIGHT / naturalH;
        width = Math.round(PAGE_WIDTH / scale);
        verdict = 'OVERFLOW_CORRIGE';
      } else if (fillRatio < 0.85) {
        verdict = 'SOUS_REMPLI';       // CV très léger : réparti sans trou, mais aéré
      } else if (scale <= SCALE_FLOOR + 0.001) {
        verdict = 'DENSE_POLICE_MIN';  // contenu très dense, police au plus petit
      }

      el.style.setProperty('width', width + 'px', 'important');
      el.style.setProperty('zoom', String(scale), 'important');

      // Remplir la hauteur par répartition de l'espace, sauf si on vient de
      // corriger un débordement (le contenu occupe alors déjà toute la page).
      var targetH = Math.round(PAGE_HEIGHT / scale);
      if (verdict !== 'OVERFLOW_CORRIGE') {
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
      }

      console.log('[controle-harmonisation]', {
        verdict: verdict,
        scale: Math.round(scale * 1000) / 1000,
        fillRatio: Math.round(fillRatio * 100) / 100,
        naturalH: naturalH, mode: mode
      });

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
