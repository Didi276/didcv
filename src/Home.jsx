import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'
import SEO from './SEO'
import { CVTemplatePro, TEMPLATES_PRO_META } from './CVTemplatesPro'

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

// Hook pour détecter quand un élément entre dans le viewport
function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); obs.disconnect() }
    }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, inView]
}

const PAGE_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .feature-row { border-top: 1px solid #f0f0f0; }
  .feature-row:last-child { border-bottom: 1px solid #f0f0f0; }
  .feature-num { transition: color 0.25s ease; }
  .feature-title { transition: color 0.25s ease; }
  .feature-row:hover .feature-num { color: #4f46e5; }
  .feature-row:hover .feature-title { color: #000; }
`

const DIFFERENCIATEURS = [
  { titre: 'Discussion IA avant génération', desc: "Tu lui dis ce que tu veux mettre en avant. L'IA adapte chaque mot de ton CV." },
  { titre: 'Score ATS intégré', desc: 'Ton CV analysé en temps réel. Tu sais exactement ce qui bloque les recruteurs.' },
  { titre: "Entraînement aux entretiens", desc: 'Un recruteur IA disponible 24h/24. Avec le contexte exact de ton offre.' },
  { titre: "Offres d'emploi intégrées", desc: 'Trouve une offre, génère ton CV, suis ta candidature. Tout au même endroit.' },
]

const ETAPES = [
  { n: '01', titre: "Tu colles l'offre d'emploi", desc: "Le texte complet, copié depuis n'importe quel site d'emploi." },
  { n: '02', titre: 'L\'IA génère ton CV et ta lettre', desc: 'Adaptés aux mots-clés de l\'offre, prêts en 30 secondes.' },
  { n: '03', titre: 'Tu télécharges et tu postules', desc: 'Un PDF propre, optimisé pour passer les filtres ATS.' },
]

// 8 templates Pro variés (recommandés en priorité, styles bien différents)
// pour la vitrine de la home — la galerie complète (40 modèles) est sur /templates
const TEMPLATES_CAROUSEL = ['meridien', 'sobre', 'impulsion', 'colonne', 'archive', 'chiffre', 'essentiel', 'clarte']

const CAROUSEL_DEMO_CV = {
  prenom: 'Camille', nom: 'Moreau', titre: 'Responsable Marketing Digital',
  email: 'camille.moreau@email.com', telephone: '06 12 34 56 78', ville: 'Lyon',
  linkedin: 'linkedin.com/in/camillemoreau', photo: null,
  accroche: "Responsable marketing digital avec 8 ans d'expérience dans la croissance de marques B2C. Spécialisée en acquisition payante et stratégie de contenu.",
  experiences: [
    { poste: 'Responsable Marketing Digital', entreprise: 'Groupe Altitude', lieu: 'Lyon', periode: '2021 - Présent',
      missions: ['Pilotage du budget acquisition de 500K€ avec un ROAS de 4,2', 'Croissance du trafic organique de 180% en 18 mois', 'Management d\'une équipe de 5 personnes'] },
    { poste: 'Chargée de Marketing', entreprise: 'Novaris', lieu: 'Paris', periode: '2018 - 2021',
      missions: ['Lancement de 3 campagnes nationales multi-canal', 'Refonte complète de la stratégie éditoriale'] },
  ],
  formations: [
    { diplome: 'Master Marketing Digital', etablissement: 'EM Lyon', periode: '2016 - 2018', mention: 'Mention Bien' },
    { diplome: 'Licence Économie-Gestion', etablissement: 'Université Lyon 2', periode: '2013 - 2016' },
  ],
  competences: ['Google Ads', 'SEO/SEA', 'Analytics', 'HubSpot', 'Content Strategy', 'A/B Testing'],
  langues: [{ langue: 'Français', niveau: 'Langue maternelle' }, { langue: 'Anglais', niveau: 'Courant (C1)' }],
  certifications: [{ titre: 'Google Analytics 4', organisme: 'Google', annee: '2024' }],
  centres_interet: ['Course à pied', 'Photographie', 'Cuisine'],
}

const FOOTER_LINKS = [
  ['Templates', '#templates'],
  ['Formations', '/formations'],
  ['Entretien', '/entretien'],
  ['Blog', '/blog'],
  ['Guides métier', '/guides'],
  ['Espace Recruteurs', '/recruteurs/inscription'],
  ['À propos', '/about'],
  ['Contact', '/contact'],
  ['Confidentialité', '/privacy'],
  ['CGU', '/cgu'],
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const w = useWidth()
  const isMobile = w < 768
  const [diffRef, diffInView] = useInView()
  const [howRef, howInView] = useInView()
  const [templatesRef, templatesInView] = useInView()
  const [formationsRef, formationsInView] = useInView()
  const [stats, setStats] = useState({})

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) window.location.href = '/dashboard'
    }
    checkUser()

    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const sectionPad = isMobile ? '64px 20px' : '96px 48px'
  const diffPad = isMobile ? '64px 20px' : '120px 48px'
  const navLinks = [['#templates', 'Templates'], ['#how', 'Comment ça marche'], ['/formations', 'Formations']]

  return (
    <div style={{ fontFamily: '"Satoshi","Inter",system-ui,sans-serif', color: '#111', background: '#fff', minHeight: '100vh' }}>
      <SEO
        titre="Créez votre CV optimisé ATS en 30 secondes"
        description="DidJob génère votre CV professionnel et votre lettre de motivation en 30 secondes grâce à l'IA. 40 templates, score ATS, offres d'emploi intégrées. Gratuit."
        url="https://didjob.fr"
      />
      <style>{PAGE_CSS}</style>

      {/* ─── NAVIGATION ─────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #f0f0f0' : '1px solid transparent',
        transition: 'background 0.2s, border-color 0.2s',
        padding: isMobile ? '0 20px' : '0 48px', height: '64px',
        display: 'flex', alignItems: 'center', gap: '32px'
      }}>
        <a href="/" style={{ fontWeight: '700', fontSize: '18px', textDecoration: 'none', color: scrolled ? '#111' : '#fff', letterSpacing: '-0.3px', marginRight: isMobile ? 'auto' : '16px', transition: 'color 0.2s' }}>
          DidJob
        </a>
        {!isMobile && (
          <div style={{ display: 'flex', gap: '28px', flex: 1 }}>
            {navLinks.map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: '14px', color: scrolled ? '#555' : 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = scrolled ? '#111' : '#fff'}
                onMouseLeave={e => e.target.style.color = scrolled ? '#555' : 'rgba(255,255,255,0.75)'}>
                {label}
              </a>
            ))}
          </div>
        )}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a href="/auth" style={{ fontSize: '14px', color: scrolled ? '#555' : 'rgba(255,255,255,0.75)', textDecoration: 'none', fontWeight: '500', padding: '8px 16px', transition: 'color 0.2s' }}>
              Se connecter
            </a>
            <a href="/auth" style={{
              fontSize: '14px', fontWeight: '600', textDecoration: 'none',
              background: '#4f46e5', color: '#fff', padding: '9px 20px',
              borderRadius: '10px', letterSpacing: '-0.2px'
            }}>
              Créer mon CV gratuitement
            </a>
          </div>
        )}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ width: '22px', height: '2px', background: scrolled ? '#111' : '#fff', borderRadius: '2px', transition: 'transform 0.2s, background 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <div style={{ width: '22px', height: '2px', background: scrolled ? '#111' : '#fff', borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s, background 0.2s' }} />
            <div style={{ width: '22px', height: '2px', background: scrolled ? '#111' : '#fff', borderRadius: '2px', transition: 'transform 0.2s, background 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        )}
      </nav>

      {/* Menu mobile */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99, background: '#fff', borderBottom: '1px solid #f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '8px 0' }}>
          {navLinks.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setMenuOpen(false)}
              style={{ display: 'block', padding: '14px 20px', fontSize: '15px', fontWeight: '500', color: '#374151', textDecoration: 'none' }}>
              {label}
            </a>
          ))}
          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #f0f0f0', marginTop: '4px', paddingTop: '16px' }}>
            <a href="/auth" style={{ fontSize: '14px', color: '#555', textDecoration: 'none', fontWeight: '500', textAlign: 'center', padding: '10px' }}>
              Se connecter
            </a>
            <a href="/auth" style={{
              fontSize: '14px', fontWeight: '600', textDecoration: 'none', textAlign: 'center',
              background: '#4f46e5', color: '#fff', padding: '12px',
              borderRadius: '10px', letterSpacing: '-0.2px'
            }}>
              Créer mon CV gratuitement
            </a>
          </div>
        </div>
      )}

      {/* ─── HERO ───────────────────────────────────────────── */}
      <div style={{ position: 'relative', background: '#0a0a0f', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '600px', height: '300px', maxWidth: '100vw',
          background: 'radial-gradient(circle, #4f46e520 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />
        <div style={{
          position: 'relative', zIndex: 1, maxWidth: '780px', margin: '0 auto', textAlign: 'center',
          padding: isMobile ? '96px 20px 72px' : '160px 48px 120px',
          animation: 'fadeUp 0.7s ease both',
        }}>
          <h1 style={{ fontSize: isMobile ? '42px' : '80px', fontWeight: '700', color: '#fff', lineHeight: '1.05', letterSpacing: isMobile ? '-1px' : '-2.5px', margin: '0 0 24px' }}>
            Ton prochain emploi commence par un CV parfait.
          </h1>
          <p style={{ fontSize: '20px', color: '#a1a1aa', margin: '0 0 40px', lineHeight: '1.6', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>
            Colle une offre. L'IA génère ton CV en 30 secondes.
          </p>
          <a href="/auth" style={{
            display: 'inline-block', fontWeight: '700', textDecoration: 'none', fontSize: '16px',
            background: '#4f46e5', color: '#fff', padding: '18px 40px', borderRadius: '14px',
            letterSpacing: '-0.2px',
          }}>
            Créer mon CV gratuitement
          </a>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', marginTop: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>
                {stats.total ? stats.total.toLocaleString('fr-FR') : '—'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                offres disponibles
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>
                {stats.entreprises || '—'}
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                entreprises en direct
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>40</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
                modèles de CV
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transition hero -> section suivante */}
      <div style={{ height: '200px', background: 'linear-gradient(to bottom, #0a0a0f, #ffffff)' }} />

      {/* ─── CE QUI NOUS DIFFÉRENCIE ─────────────────────────── */}
      <section ref={diffRef} style={{ padding: diffPad, opacity: diffInView ? 1 : 0, transform: diffInView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '700', letterSpacing: '-1.5px', margin: '0 0 56px', color: '#0a0a0f', textAlign: 'left' }}>
            Bien plus qu'un générateur de CV.
          </h2>
          <div>
            {DIFFERENCIATEURS.map((d, i) => (
              <div key={d.titre} className="feature-row" style={{
                display: 'flex', flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'flex-start' : 'baseline', gap: isMobile ? '10px' : '40px',
                padding: isMobile ? '28px 0' : '40px 0',
              }}>
                <div className="feature-num" style={{ fontSize: isMobile ? '40px' : '72px', fontWeight: '700', color: '#f0f0f0', width: isMobile ? 'auto' : '110px', flexShrink: 0, lineHeight: 1 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="feature-title" style={{ fontSize: '24px', fontWeight: '700', color: '#18181b', margin: 0, minWidth: isMobile ? 'auto' : '300px', flexShrink: 0 }}>
                  {d.titre}
                </h3>
                <p style={{ fontSize: '16px', color: '#6b7280', margin: 0, lineHeight: '1.7', maxWidth: '440px' }}>
                  {d.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ───────────────────────────────── */}
      <section id="how" ref={howRef} style={{ background: '#0a0a0f', padding: sectionPad, opacity: howInView ? 1 : 0, transform: howInView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '700', letterSpacing: '-1.5px', margin: '0 0 64px', color: '#fff' }}>
            Trois étapes.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '48px' : '48px' }}>
            {ETAPES.map(s => (
              <div key={s.n} style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-36px', left: '50%', transform: 'translateX(-50%)', fontSize: '140px', fontWeight: '700', color: 'rgba(255,255,255,0.05)', lineHeight: 1, zIndex: 0, userSelect: 'none' }}>
                  {s.n}
                </div>
                <div style={{ position: 'relative', zIndex: 1, paddingTop: '56px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 10px', color: '#fff' }}>{s.titre}</h3>
                  <p style={{ fontSize: '15px', color: '#a1a1aa', margin: 0, lineHeight: '1.6' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEMPLATES ───────────────────────────────────────── */}
      <section id="templates" ref={templatesRef} style={{ padding: `${sectionPad.split(' ')[0]} 0`, opacity: templatesInView ? 1 : 0, transform: templatesInView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 20px' : '0 48px' }}>
          <h2 style={{ fontSize: isMobile ? '32px' : '52px', fontWeight: '700', letterSpacing: '-1.5px', margin: '0 0 40px', color: '#0a0a0f', textAlign: 'left' }}>
            40 templates.
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: isMobile ? '0 20px 12px' : '0 48px 12px' }}>
          {TEMPLATES_CAROUSEL.map(id => {
            const meta = TEMPLATES_PRO_META[id]
            return (
              <a key={id} href="/auth" style={{ textDecoration: 'none', flexShrink: 0 }}>
                <div style={{ width: '180px', borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'box-shadow 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}>
                  <div style={{ width: '180px', height: '230px', overflow: 'hidden', position: 'relative', background: '#fafafa' }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '794px', height: '1123px',
                      transform: 'scale(0.2267)', transformOrigin: 'top left',
                      pointerEvents: 'none', userSelect: 'none',
                    }}>
                      <CVTemplatePro cvData={CAROUSEL_DEMO_CV} template={id} color={meta.couleurDefaut} />
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>{meta.nom}</div>
                </div>
              </a>
            )
          })}
          <a href="/templates" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: '180px', height: '270px', borderRadius: '12px', background: '#f8f9ff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 16px', transition: 'box-shadow 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'}>
              <div style={{ fontSize: '20px', fontWeight: '700', color: '#4f46e5' }}>+32</div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#4338ca', marginTop: '6px' }}>Voir tous les templates</div>
            </div>
          </a>
        </div>
      </section>

      {/* ─── FORMATIONS ET ENTRETIEN ─────────────────────────── */}
      <section ref={formationsRef} style={{ opacity: formationsInView ? 1 : 0, transform: formationsInView ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ background: '#4f46e5', padding: sectionPad }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '30px' : '40px', fontWeight: '700', letterSpacing: '-1px', color: '#fff', margin: '0 0 16px' }}>
              Formations.
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: '0 0 28px', lineHeight: '1.7', maxWidth: '520px' }}>
              Excel, IA, communication, data... Des formations gratuites choisies selon ton métier, directement depuis ton profil.
            </p>
            <a href="/formations" style={{ display: 'inline-block', fontSize: '15px', fontWeight: '700', color: '#4f46e5', background: '#fff', padding: '14px 28px', borderRadius: '14px', textDecoration: 'none' }}>
              Explorer les formations
            </a>
          </div>
        </div>
        <div style={{ background: '#0f0f1a', padding: sectionPad }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{ fontSize: isMobile ? '30px' : '40px', fontWeight: '700', letterSpacing: '-1px', color: '#fff', margin: '0 0 16px' }}>
              Entretien IA.
            </h2>
            <p style={{ fontSize: '16px', color: '#a1a1aa', margin: '0 0 28px', lineHeight: '1.7', maxWidth: '520px' }}>
              Un recruteur IA qui connaît le contexte exact de ton offre. Feedback question par question, sans jugement.
            </p>
            <a href="/entretien" style={{ display: 'inline-block', fontSize: '15px', fontWeight: '700', color: '#0f0f1a', background: '#fff', padding: '14px 28px', borderRadius: '14px', textDecoration: 'none' }}>
              S'entraîner maintenant
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ background: '#0a0a0f', padding: isMobile ? '56px 20px 28px' : '80px 48px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontWeight: '700', fontSize: '20px', color: '#fff', letterSpacing: '-0.3px', marginBottom: '10px' }}>
            DidJob
          </div>
          <p style={{ fontSize: '13px', color: '#71717a', margin: '0 0 32px' }}>
            Le compagnon de ta recherche d'emploi.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: isMobile ? '12px 20px' : '28px', marginBottom: '32px' }}>
            {FOOTER_LINKS.map(([label, href]) => (
              <a key={label} href={href} style={{ fontSize: '13px', color: '#a1a1aa', textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px', fontSize: '11px', color: '#52525b' }}>
            © 2026 DidJob. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
