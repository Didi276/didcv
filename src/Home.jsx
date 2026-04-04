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
          <a href="/auth" className="btn-blue">Commencer gratuitement</a>
        </div>
      </nav>

      <div className="hero-wrap">
        <div className="hero">
          <div>
            <h1>Ton CV <em>taillé</em><br/>pour chaque offre.<br/>En 30 secondes.</h1>
            <p className="hero-sub">Upload ton CV, colle une offre d'emploi — l'IA génère un CV optimisé pour passer les filtres ATS et décrocher l'entretien.</p>
            <div className="hero-actions">
              <a href="/auth" className="btn-primary-lg">Générer mon CV gratuitement →</a>
              <a href="#how" className="btn-outline-lg">Voir comment ça marche</a>
            </div>
            <p className="hero-note">Gratuit — <span>2 CV offerts</span>, sans carte bancaire</p>
          </div>
          <div className="hero-card">
            <div className="card-header">
              <div className="dot dot-r"></div>
              <div className="dot dot-y"></div>
              <div className="dot dot-g"></div>
            </div>
            <div className="card-body">
              <div className="input-row">
                <div className="input-label">Ton CV actuel</div>
                <div className="input-fake uploaded">📄 mon_cv_2025.pdf — chargé ✓</div>
              </div>
              <div className="input-row">
                <div className="input-label">Offre d'emploi</div>
                <div className="textarea-fake">Nous recherchons un(e) développeur(se) React expérimenté(e). Vous maîtrisez TypeScript...</div>
              </div>
              <button className="card-generate">⚡ Générer mon CV optimisé</button>
              <div className="card-score">
                <div className="score-row"><span>Score ATS</span><strong>92% — Excellent ✓</strong></div>
                <div className="score-track"><div className="score-fill"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat"><div className="stat-num">92%</div><div className="stat-label">taux de passage ATS</div></div>
        <div className="stat"><div className="stat-num">30s</div><div className="stat-label">pour générer ton CV</div></div>
        <div className="stat"><div className="stat-num">5+</div><div className="stat-label">templates professionnels</div></div>
        <div className="stat"><div className="stat-num">100%</div><div className="stat-label">modifiable en ligne</div></div>
      </div>

      <section className="section" id="how">
        <div className="section-label">Comment ça marche</div>
        <h2 className="section-title">3 étapes.<br/>Un CV <em>parfait</em>.</h2>
        <div className="steps-grid">
          <div className="step"><div className="step-num">ÉTAPE 01</div><div className="step-icon">📄</div><h3>Uploade ton CV</h3><p>Importe ton CV en PDF ou Word, même s'il est vieux ou mal formaté.</p></div>
          <div className="step"><div className="step-num">ÉTAPE 02</div><div className="step-icon">🎯</div><h3>Colle l'offre d'emploi</h3><p>Copie-colle le texte de l'offre. L'IA analyse les mots-clés et les compétences.</p></div>
          <div className="step"><div className="step-num">ÉTAPE 03</div><div className="step-icon">✅</div><h3>Télécharge et postule</h3><p>Ton CV optimisé est prêt en 30 secondes. Modifie-le, puis télécharge en PDF.</p></div>
        </div>
      </section>

      <div className="features-bg" id="features">
        <div className="features-inner">
          <div className="section-label">Fonctionnalités</div>
          <h2 className="section-title">Tout ce qu'il faut<br/>pour <em>décrocher l'entretien</em>.</h2>
          <div className="feat-grid">
            <div className="feat-card"><div className="feat-icon">🤖</div><h3>Optimisation ATS intelligente</h3><p>L'IA intègre naturellement les bons mots-clés. Ton CV reste authentique et passe les filtres.</p></div>
            <div className="feat-card"><div className="feat-icon">✏️</div><h3>Éditeur en ligne</h3><p>Après génération, chaque section est modifiable directement dans le navigateur.</p></div>
            <div className="feat-card"><div className="feat-icon">🎨</div><h3>Templates professionnels</h3><p>5 designs validés par des recruteurs. Moderne, classique, épuré — à toi de choisir.</p></div>
            <div className="feat-card"><div className="feat-icon">📥</div><h3>Export PDF sans filigrane</h3><p>Télécharge un PDF propre, compatible tous ATS. Prêt à envoyer immédiatement.</p></div>
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
            <div className="price-sub">Pour toujours, sans carte bancaire</div>
            <div className="divider"></div>
            <ul className="feat-list">
              <li><span className="ck">✓</span> 2 CV générés par mois</li>
              <li><span className="ck">✓</span> Tous les templates</li>
              <li><span className="ck">✓</span> Éditeur en ligne</li>
              <li><span className="ck">✓</span> Export PDF</li>
              <li className="dim"><span className="cx">✗</span> CV illimités</li>
              <li className="dim"><span className="cx">✗</span> Historique des CV</li>
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
              <li><span className="ck">✓</span> Tous les templates</li>
              <li><span className="ck">✓</span> Éditeur avancé</li>
              <li><span className="ck">✓</span> Export PDF illimité</li>
              <li><span className="ck">✓</span> Historique de tes CV</li>
              <li><span className="ck">✓</span> Accès prioritaire aux nouveautés</li>
            </ul>
            <a href="#" className="btn-plan btn-plan-pro">Passer au Pro</a>
          </div>
        </div>
      </section>

      <div className="cta-wrap">
        <div className="cta-box">
          <h2>Prêt à dire<br/>"I Did it" ?</h2>
          <p>Rejoins des milliers de candidats qui ont décroché leur entretien grâce à DidCV.</p>
          <a href="/auth" className="btn-white">Générer mon CV gratuitement →</a>
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