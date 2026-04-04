import './App.css'

function Home() {
  return (
    <>
      <nav>
        <a className="logo" href="#"><span>Did</span>CV</a>
        <div className="nav-links">
          <a href="#how">Comment ça marche</a>
          <a href="#features">Fonctionnalités</a>
          <a href="#pricing">Tarifs</a>
        </div>
        <div className="nav-btns">
          <a href="/auth" className="btn-ghost">Se connecter</a>
          <a href="/auth" className="btn-blue">Essayer gratuitement</a>
        </div>
      </nav>

      <div className="hero-wrap">
        <div className="hero">
          <div>
            <h1>Ton CV <em>taillé</em><br/>pour chaque<br/>offre.</h1>
            <p className="hero-sub">Upload ton CV ou crée ton profil — l'IA génère en quelques secondes un CV optimisé ATS prêt à passer tous les filtres. Une lettre de motivation personnalisée est également générée automatiquement. Modifie, télécharge, postule.</p>
            <div className="hero-actions">
              <a href="/auth" className="btn-primary-lg">Essayer gratuitement →</a>
              <a href="#how" className="btn-outline-lg">Voir comment ça marche</a>
            </div>
            <p className="hero-note">Aucune carte bancaire requise — <span>commence maintenant</span></p>
          </div>
          <div className="hero-card">
            <div className="card-header">
              <div className="dot dot-r"></div>
              <div className="dot dot-y"></div>
              <div className="dot dot-g"></div>
            </div>
            <div className="card-body">
              <div className="input-row">
                <div className="input-label">Ton profil / CV actuel</div>
                <div className="input-fake uploaded">📄 mon_cv_2025.pdf — chargé ✓</div>
              </div>
              <div className="input-row">
                <div className="input-label">Offre d'emploi</div>
                <div className="textarea-fake">Nous recherchons un(e) Contrôleur de Gestion. Vous maîtrisez Excel, SAP et l'analyse financière...</div>
              </div>
              <button className="card-generate">⚡ Générer CV + Lettre de motivation</button>
              <div className="card-score">
                <div className="score-row"><span>Score ATS</span><strong>95% — Excellent ✓</strong></div>
                <div className="score-track"><div className="score-fill"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat"><div className="stat-num">95%</div><div className="stat-label">taux de passage ATS</div></div>
        <div className="stat"><div className="stat-num">&lt;30s</div><div className="stat-label">pour générer CV + lettre de motivation</div></div>
        <div className="stat"><div className="stat-num">6</div><div className="stat-label">templates professionnels</div></div>
        <div className="stat"><div className="stat-num">100%</div><div className="stat-label">modifiable en ligne</div></div>
      </div>

      <section className="section" id="how">
        <div className="section-label">Comment ça marche</div>
        <h2 className="section-title">3 étapes.<br/>Un CV <em>parfait</em>.</h2>
        <div className="steps-grid">
          <div className="step"><div className="step-num">ÉTAPE 01</div><div className="step-icon">👤</div><h3>Crée ton profil</h3><p>Remplis ton profil une fois ou uploade ton CV PDF. L'IA extrait toutes tes informations automatiquement.</p></div>
          <div className="step"><div className="step-num">ÉTAPE 02</div><div className="step-icon">🎯</div><h3>Colle l'offre d'emploi</h3><p>Copie-colle le texte de l'offre. L'IA analyse les mots-clés, les compétences et adapte ton profil pour maximiser ton score ATS.</p></div>
          <div className="step"><div className="step-num">ÉTAPE 03</div><div className="step-icon">✅</div><h3>Télécharge et postule</h3><p>Ton CV optimisé est prêt en moins de 30 secondes. Une lettre de motivation personnalisée est également générée. Modifie et télécharge en PDF.</p></div>
        </div>
      </section>

      <div className="features-bg" id="features">
        <div className="features-inner">
          <div className="section-label">Fonctionnalités</div>
          <h2 className="section-title">Tout ce qu'il faut<br/>pour <em>décrocher l'entretien</em>.</h2>
          <div className="feat-grid">
            <div className="feat-card"><div className="feat-icon">🤖</div><h3>CV + Lettre de motivation en quelques secondes</h3><p>L'IA analyse l'offre d'emploi et génère un CV sur mesure qui passe tous les filtres ATS. Une lettre de motivation personnalisée est également générée automatiquement.</p></div>
            <div className="feat-card"><div className="feat-icon">✏️</div><h3>Éditeur intégré</h3><p>Modifie chaque section de ton CV et ta lettre de motivation directement sur le site — missions, compétences, formations, mise en forme.</p></div>
            <div className="feat-card"><div className="feat-icon">👤</div><h3>Profil centralisé</h3><p>Crée ton profil une fois. Génère autant de CV que tu veux en collant juste l'offre — plus besoin d'uploader ton CV à chaque fois.</p></div>
            <div className="feat-card"><div className="feat-icon">🎨</div><h3>6 templates professionnels</h3><p>Finance, LinkedIn, Harvard, Silicon Valley, Canva, Moderne — des designs validés par des recruteurs pour tous les secteurs.</p></div>
            <div className="feat-card"><div className="feat-icon">📥</div><h3>Export PDF sans filigrane</h3><p>Télécharge ton CV et ta lettre de motivation en PDF propre, compatible tous ATS. Prêt à envoyer immédiatement.</p></div>
            <div className="feat-card"><div className="feat-icon">📊</div><h3>Dashboard personnel</h3><p>Retrouve tous tes CV générés, classés par offre d'emploi. Modifie-les à tout moment depuis ton dashboard.</p></div>
          </div>
        </div>
      </div>

      <section className="pricing-section" id="pricing">
        <div className="section-label" style={{textAlign:'center'}}>Tarifs</div>
        <h2 className="section-title" style={{textAlign:'center', marginBottom:'56px'}}>Simple.<br/><em>Transparent.</em></h2>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-name">GRATUIT</div>
            <div className="price-amount">0 <small>€</small></div>
            <div className="price-sub">Essaie sans engagement</div>
            <div className="divider"></div>
            <ul className="feat-list">
              <li><span className="ck">✓</span> 1 CV optimisé ATS</li>
              <li><span className="ck">✓</span> 1 lettre de motivation</li>
              <li><span className="ck">✓</span> 6 templates professionnels</li>
              <li><span className="ck">✓</span> Éditeur CV et lettre de motivation</li>
              <li><span className="ck">✓</span> Export PDF</li>
              <li className="dim"><span className="cx">✗</span> CV illimités</li>
            </ul>
            <a href="/auth" className="btn-plan btn-plan-free">Commencer gratuitement</a>
          </div>
          <div className="price-card featured">
            <div className="pop-badge">Le plus populaire</div>
            <div className="price-name">PRO</div>
            <div className="price-amount"><sup>€</sup>9 <small>/ mois</small></div>
            <div className="price-sub">Sans engagement — annulable à tout moment</div>
            <div className="divider"></div>
            <ul className="feat-list">
              <li><span className="ck">✓</span> CV illimités</li>
              <li><span className="ck">✓</span> Lettres de motivation illimitées</li>
              <li><span className="ck">✓</span> 6 templates professionnels</li>
              <li><span className="ck">✓</span> Éditeur avancé</li>
              <li><span className="ck">✓</span> Export PDF illimité</li>
              <li><span className="ck">✓</span> Profil centralisé illimité</li>
            </ul>
            <a href="#" className="btn-plan btn-plan-pro">Passer au Pro</a>
          </div>
        </div>
      </section>

      <div className="cta-wrap">
        <div className="cta-box">
          <h2>Prêt à décrocher<br/>ton <em style={{fontStyle:'italic'}}>prochain entretien</em> ?</h2>
          <p>Rejoins des candidats qui ont optimisé leur candidature grâce à DidCV.</p>
          <a href="/auth" className="btn-white">Essayer gratuitement →</a>
        </div>
      </div>

      <footer>
        <div className="footer-logo"><span>Did</span>CV</div>
        <p>© 2026 DidCV. Tous droits réservés.</p>
        <div className="footer-links">
          <a href="#">Confidentialité</a>
          <a href="#">CGU</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </>
  )
}

export default Home