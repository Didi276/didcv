import { useEffect, useState, useRef } from 'react'
import { MessageCircle, Gauge, Mic, Briefcase, BookOpen, Target } from 'lucide-react'
import { supabase } from './supabase'
import SEO from './SEO'

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

// Styles d'animation globaux
const ANIM_CSS = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(28px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(var(--r,0deg)); }
    50%       { transform: translateY(-10px) rotate(var(--r,0deg)); }
  }
`

function MiniCV({ color, style }) {
  return (
    <div style={{
      width: '140px', height: '198px', borderRadius: '8px', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', background: '#fff', flexShrink: 0,
      border: '1px solid rgba(0,0,0,0.06)', ...style
    }}>
      <div style={{ background: color, padding: '10px 10px 8px', height: '56px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', marginBottom: '4px' }} />
        <div style={{ width: '70px', height: '4px', background: 'rgba(255,255,255,0.7)', borderRadius: '2px', marginBottom: '2px' }} />
        <div style={{ width: '50px', height: '3px', background: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
      </div>
      <div style={{ padding: '8px 10px' }}>
        {[65, 50, 55, 45, 60, 40, 55, 35, 50, 45, 60, 40].map((wpx, i) => (
          <div key={i} style={{
            width: `${wpx}%`, height: i % 4 === 0 ? '4px' : '2.5px',
            background: i % 4 === 0 ? color : '#e5e7eb',
            borderRadius: '2px', marginBottom: '4px',
            opacity: i % 4 === 0 ? 0.8 : 1
          }} />
        ))}
      </div>
    </div>
  )
}

const DIFFERENCIATEURS = [
  { Icon: MessageCircle, titre: 'Discussion IA avant génération', desc: "Tu lui dis ce que tu veux mettre en avant. L'IA adapte chaque mot de ton CV." },
  { Icon: Gauge, titre: 'Score ATS intégré', desc: 'Ton CV analysé en temps réel. Tu sais exactement ce qui bloque les recruteurs.' },
  { Icon: Mic, titre: "Entraînement aux entretiens", desc: 'Un recruteur IA disponible 24h/24. Avec le contexte exact de ton offre.' },
  { Icon: Briefcase, titre: "Offres d'emploi intégrées", desc: 'Trouve une offre, génère ton CV, suis ta candidature. Tout au même endroit.' },
]

const ETAPES = [
  { n: '1', titre: "Tu colles l'offre d'emploi", desc: "Le texte complet, copié depuis n'importe quel site d'emploi." },
  { n: '2', titre: 'L\'IA génère ton CV et ta lettre', desc: 'Adaptés aux mots-clés de l\'offre, prêts en 30 secondes.' },
  { n: '3', titre: 'Tu télécharges et tu postules', desc: 'Un PDF propre, optimisé pour passer les filtres ATS.' },
]

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const w = useWidth()
  const isMobile = w < 768
  const [diffRef, diffInView] = useInView()
  const [templatesRef, templatesInView] = useInView()
  const [howRef, howInView] = useInView()
  const [plusRef, plusInView] = useInView()
  const [pricingRef, pricingInView] = useInView()

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

  const sectionPad = isMobile ? '64px 20px' : '120px 48px'

  return (
    <div style={{ fontFamily: '"Inter",system-ui,sans-serif', color: '#111', background: '#fff', minHeight: '100vh' }}>
      <SEO
        titre="Créez votre CV optimisé ATS en 30 secondes"
        description="DidCV génère votre CV professionnel et votre lettre de motivation en 30 secondes grâce à l'IA. 27 templates, score ATS, offres d'emploi intégrées. Gratuit."
        url="https://didcv.vercel.app"
      />
      <style>{ANIM_CSS}</style>

      {/* ─── NAVIGATION ─────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #f0f0f0' : '1px solid transparent',
        transition: 'all 0.2s',
        padding: isMobile ? '0 20px' : '0 48px', height: '64px',
        display: 'flex', alignItems: 'center', gap: '32px'
      }}>
        <a href="/" style={{ fontWeight: '800', fontSize: '20px', textDecoration: 'none', color: '#111', letterSpacing: '-0.5px', marginRight: isMobile ? 'auto' : '16px' }}>
          <span style={{ color: '#4f46e5' }}>Did</span>CV
        </a>
        {!isMobile && (
          <div style={{ display: 'flex', gap: '28px', flex: 1 }}>
            {[['#templates', 'Templates'], ['#how', 'Comment ça marche'], ['#pricing', 'Tarifs']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: '14px', color: '#555', textDecoration: 'none', fontWeight: '500' }}
                onMouseEnter={e => e.target.style.color = '#111'}
                onMouseLeave={e => e.target.style.color = '#555'}>
                {label}
              </a>
            ))}
          </div>
        )}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <a href="/auth" style={{ fontSize: '14px', color: '#555', textDecoration: 'none', fontWeight: '500', padding: '8px 16px' }}>
              Se connecter
            </a>
            <a href="/auth" style={{
              fontSize: '14px', fontWeight: '600', textDecoration: 'none',
              background: '#4f46e5', color: '#fff', padding: '9px 20px',
              borderRadius: '8px', letterSpacing: '-0.2px'
            }}>
              Créer mon CV gratuit
            </a>
          </div>
        )}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ width: '22px', height: '2px', background: '#111', borderRadius: '2px', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <div style={{ width: '22px', height: '2px', background: '#111', borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <div style={{ width: '22px', height: '2px', background: '#111', borderRadius: '2px', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        )}
      </nav>

      {/* Menu mobile */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99, background: '#fff', borderBottom: '1px solid #f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '8px 0' }}>
          {[['#templates', 'Templates'], ['#how', 'Comment ça marche'], ['#pricing', 'Tarifs']].map(([href, label]) => (
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
              borderRadius: '8px', letterSpacing: '-0.2px'
            }}>
              Créer mon CV gratuit
            </a>
          </div>
        </div>
      )}

      {/* ─── HERO ───────────────────────────────────────────── */}
      <div style={{ paddingTop: '64px', background: '#f8f9ff' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '48px 20px 48px' : '96px 48px 72px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '64px', alignItems: 'center' }}>

          {/* Texte gauche */}
          <div style={{ animation: 'fadeUp 0.7s ease both' }}>
            <h1 style={{ fontSize: isMobile ? '34px' : '56px', fontWeight: '800', lineHeight: '1.1', letterSpacing: isMobile ? '-1px' : '-2px', margin: '0 0 20px', color: '#0f0f1a' }}>
              Finis de perdre des heures sur ton CV.
            </h1>
            <p style={{ fontSize: isMobile ? '15px' : '18px', color: '#6b7280', lineHeight: '1.7', margin: '0 0 32px', maxWidth: '480px' }}>
              Colle une offre d'emploi. DidCV génère ton CV parfait et ta lettre de motivation en 30 secondes. Optimisé pour passer les filtres ATS des recruteurs.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap' }}>
              <a href="/auth" style={{
                fontWeight: '700', textDecoration: 'none', fontSize: '15px',
                background: '#4f46e5', color: '#fff', padding: '14px 28px',
                borderRadius: '10px', letterSpacing: '-0.2px', display: 'inline-block'
              }}>
                Créer mon CV gratuitement →
              </a>
              <a href="#templates" style={{
                fontWeight: '600', textDecoration: 'none', fontSize: '15px',
                background: 'transparent', color: '#111', padding: '13px 27px',
                borderRadius: '10px', border: '1.5px solid #d1d5db', display: 'inline-block'
              }}>
                Voir les templates
              </a>
            </div>

            {/* Stats réelles */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['27 templates', "5 sources d'offres", 'Score ATS inclus', '100% gratuit'].map(stat => (
                <span key={stat} style={{ fontSize: '12px', fontWeight: '600', color: '#4f46e5', background: '#eef2ff', padding: '6px 14px', borderRadius: '20px' }}>
                  {stat}
                </span>
              ))}
            </div>
          </div>

          {/* Aperçu animé */}
          <div style={{ position: 'relative', height: isMobile ? '300px' : '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: isMobile ? 'scale(0.75)' : 'none' }}>
            <MiniCV color="#0a66c2" style={{ position: 'absolute', left: '0px', top: '20px', transform: 'rotate(-6deg)', opacity: 0.5, animation: 'float 4s ease-in-out infinite', '--r': '-6deg' }} />
            <MiniCV color="#0f6e56" style={{ position: 'absolute', right: '10px', top: '30px', transform: 'rotate(5deg)', opacity: 0.5, animation: 'float 5s ease-in-out infinite 0.5s', '--r': '5deg' }} />
            <MiniCV color="#4f46e5" style={{ position: 'relative', zIndex: 10, width: '160px', height: '226px', animation: 'float 3.5s ease-in-out infinite 0.2s', '--r': '0deg' }} />
            <MiniCV color="#1a1a1a" style={{ position: 'absolute', right: '-10px', bottom: '20px', transform: 'rotate(4deg)', opacity: 0.7, animation: 'float 4.5s ease-in-out infinite 0.8s', '--r': '4deg' }} />
            <MiniCV color="#c9a84c" style={{ position: 'absolute', left: '10px', bottom: '10px', transform: 'rotate(-4deg)', opacity: 0.7, animation: 'float 4s ease-in-out infinite 1s', '--r': '-4deg' }} />

            <div style={{ position: 'absolute', top: '40px', right: '30px', background: '#fff', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 20, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>Score ATS</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>95% - Excellent</div>
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: '30px', left: '20px', background: '#4f46e5', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 20px rgba(79,70,229,0.3)', zIndex: 20 }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>CV + lettre</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Prêts en 30 secondes</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── CE QUI NOUS DIFFÉRENCIE ─────────────────────────── */}
      <section ref={diffRef} style={{ padding: sectionPad, opacity: diffInView ? 1 : 0, transform: diffInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 48px', color: '#0f0f1a', textAlign: 'center' }}>
            Pas juste un générateur de CV.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: isMobile ? '20px' : '24px' }}>
            {DIFFERENCIATEURS.map(d => (
              <div key={d.titre}>
                <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <d.Icon size={24} color="#4f46e5" strokeWidth={1.75} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px', color: '#111', letterSpacing: '-0.2px' }}>{d.titre}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ───────────────────────────────── */}
      <section id="how" ref={howRef} style={{ background: '#f8f9ff', padding: sectionPad, opacity: howInView ? 1 : 0, transform: howInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 56px', color: '#0f0f1a', textAlign: 'center' }}>
            Trois étapes. Trente secondes.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '32px' : '48px' }}>
            {ETAPES.map(s => (
              <div key={s.n}>
                <div style={{ fontSize: isMobile ? '40px' : '56px', fontWeight: '800', color: '#4f46e5', lineHeight: 1, marginBottom: '16px', letterSpacing: '-2px' }}>
                  {s.n}
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: '700', margin: '0 0 8px', color: '#111', letterSpacing: '-0.3px' }}>{s.titre}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TEMPLATES ───────────────────────────────────────── */}
      <section id="templates" ref={templatesRef} style={{ padding: sectionPad, maxWidth: '1200px', margin: '0 auto', opacity: templatesInView ? 1 : 0, transform: templatesInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '56px' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 16px', color: '#0f0f1a' }}>
            27 templates pour tous les métiers.
          </h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#6b7280', margin: 0 }}>
            Finance, tech, santé, BTP, restauration — chaque secteur a son template.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : w < 1024 ? 'repeat(4, 1fr)' : 'repeat(6, 1fr)', gap: isMobile ? '10px' : '16px', marginBottom: isMobile ? '28px' : '40px' }}>
          {[
            { color: '#1a1a1a', name: 'Finance' },
            { color: '#0a66c2', name: 'LinkedIn' },
            { color: '#667eea', name: 'Creative' },
            { color: '#c9a84c', bg: '#0d0d0d', name: 'Executive' },
            { color: '#0f6e56', name: 'Moderne' },
            { color: '#1e40af', name: 'Timeline' },
            { color: '#4f46e5', name: 'Étudiant' },
            { color: '#ea580c', name: 'Alternance' },
            { color: '#0d9488', name: 'Santé' },
            { color: '#374151', name: 'BTP' },
            { color: '#92400e', name: 'Resto' },
            { color: '#1d4ed8', name: 'Transport' },
          ].map((t, i) => (
            <a key={i} href="/auth" style={{ textDecoration: 'none' }}>
              <div style={{
                borderRadius: '10px', overflow: 'hidden', border: '1px solid #e5e7eb',
                cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                background: '#fff'
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={{ height: '100px', background: `linear-gradient(135deg, ${t.color}22, ${t.color}44)`, borderBottom: `3px solid ${t.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '8px', width: '100%' }}>
                    <div style={{ width: '60%', height: '6px', background: t.color, borderRadius: '3px', opacity: 0.8 }} />
                    <div style={{ width: '40%', height: '3px', background: '#e5e7eb', borderRadius: '2px' }} />
                    <div style={{ width: '80%', height: '2px', background: '#e5e7eb', borderRadius: '2px', marginTop: '4px' }} />
                    <div style={{ width: '70%', height: '2px', background: '#e5e7eb', borderRadius: '2px' }} />
                    <div style={{ width: '75%', height: '2px', background: '#e5e7eb', borderRadius: '2px' }} />
                  </div>
                </div>
                <div style={{ padding: '8px 10px', fontSize: '11px', fontWeight: '600', color: '#374151' }}>{t.name}</div>
              </div>
            </a>
          ))}
          <a href="/auth" style={{ textDecoration: 'none' }}>
            <div style={{
              height: '132px', borderRadius: '10px', border: '1px dashed #c7d2fe',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#eef2ff', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#e0e7ff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#c7d2fe'; e.currentTarget.style.background = '#eef2ff' }}
            >
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#4f46e5' }}>+15</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#4338ca', marginTop: '2px' }}>autres modèles</div>
            </div>
          </a>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/auth" style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', border: '1px solid #e0e7ff', padding: '10px 24px', borderRadius: '8px', background: '#eef2ff' }}>
            Voir tous les templates →
          </a>
        </div>
      </section>

      {/* ─── FORMATIONS ET ENTRETIEN ─────────────────────────── */}
      <section ref={plusRef} style={{ background: '#f8f9ff', padding: sectionPad, opacity: plusInView ? 1 : 0, transform: plusInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 48px', color: '#0f0f1a', textAlign: 'center' }}>
            Bien plus qu'un CV.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px' }}>
            <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #e5e7eb', padding: isMobile ? '28px' : '40px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <BookOpen size={24} color="#4f46e5" strokeWidth={1.75} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 10px', color: '#111', letterSpacing: '-0.5px' }}>Centre de formations gratuites</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: '1.7' }}>
                Excel, IA, communication, data... Des formations gratuites choisies selon ton métier, directement depuis ton profil.
              </p>
              <a href="/formations" style={{ display: 'inline-block', fontSize: '14px', fontWeight: '700', color: '#fff', background: '#4f46e5', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none' }}>
                Explorer les formations →
              </a>
            </div>
            <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid #e5e7eb', padding: isMobile ? '28px' : '40px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <Target size={24} color="#4f46e5" strokeWidth={1.75} />
              </div>
              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 10px', color: '#111', letterSpacing: '-0.5px' }}>Simulateur d'entretien</h3>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: '1.7' }}>
                Un recruteur IA qui connaît le contexte exact de ton offre. Feedback question par question, sans jugement.
              </p>
              <a href="/entretien" style={{ display: 'inline-block', fontSize: '14px', fontWeight: '700', color: '#fff', background: '#4f46e5', padding: '12px 22px', borderRadius: '10px', textDecoration: 'none' }}>
                S'entraîner maintenant →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" ref={pricingRef} style={{ padding: sectionPad, opacity: pricingInView ? 1 : 0, transform: pricingInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '28px' : '42px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 56px', color: '#0f0f1a', textAlign: 'center' }}>
            Simple et transparent.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px' }}>
            {/* Gratuit */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '36px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '20px' }}>GRATUIT</div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#111', letterSpacing: '-1px', marginBottom: '4px' }}>0 €</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '28px' }}>Toujours gratuit</div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px', marginBottom: '28px' }}>
                {['1 CV optimisé ATS', '1 lettre de motivation', '27 templates', 'Éditeur intégré', 'Export PDF'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: '#374151' }}>
                    <span style={{ color: '#4f46e5', fontWeight: '700' }}>✓</span>{f}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: '#9ca3af' }}>
                  <span style={{ color: '#e5e7eb', fontWeight: '700' }}>✗</span>CV illimités
                </div>
              </div>
              <a href="/auth" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: '10px', border: '1.5px solid #4f46e5', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                Commencer gratuitement
              </a>
            </div>

            {/* Pro */}
            <div style={{ background: '#4f46e5', borderRadius: '16px', padding: '36px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#fff', color: '#4f46e5', fontSize: '10px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                POPULAIRE
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '20px' }}>PRO</div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#fff', letterSpacing: '-1px', marginBottom: '4px' }}>9 €<span style={{ fontSize: '16px', fontWeight: '500', opacity: 0.7 }}> / mois</span></div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '28px' }}>Sans engagement</div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '24px', marginBottom: '28px' }}>
                {['CV illimités', 'Lettres illimitées', '27 templates', 'Éditeur avancé', 'Export PDF illimité', 'Profil centralisé'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: '#c7d2fe', fontWeight: '700' }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <a href="#" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: '10px', background: '#fff', color: '#4f46e5', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
                Passer au Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────────── */}
      <section style={{ padding: sectionPad, textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '30px' : '44px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 16px', color: '#0f0f1a', lineHeight: '1.15' }}>
            Ton CV n'attend que ça.
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 36px', lineHeight: '1.6' }}>
            Colle une offre, choisis un modèle, télécharge. Gratuit pour commencer.
          </p>
          <a href="/auth" style={{ fontSize: '16px', fontWeight: '700', textDecoration: 'none', background: '#4f46e5', color: '#fff', padding: '16px 36px', borderRadius: '12px', display: 'inline-block', letterSpacing: '-0.3px' }}>
            Créer mon CV gratuitement →
          </a>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: isMobile ? '48px 20px 28px' : '64px 48px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr 1fr 1fr', gap: isMobile ? '32px' : '24px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontWeight: '800', fontSize: '19px', color: '#111', letterSpacing: '-0.5px', marginBottom: '10px' }}>
                <span style={{ color: '#4f46e5' }}>Did</span>CV
              </div>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, lineHeight: '1.6', maxWidth: '220px' }}>
                Le compagnon de ta recherche d'emploi.
              </p>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Produit</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[['Templates', '#templates'], ['Tarifs', '#pricing'], ['Formations', '/formations'], ['Entretien', '/entretien'], ['Espace Recruteurs', '/recruteurs/inscription']].map(([label, href]) => (
                  <a key={label} href={href} style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>{label}</a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Ressources</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[['Blog', '/blog'], ['Guides métier', '/guides'], ['À propos', '/about'], ['Contact', '/contact']].map(([label, href]) => (
                  <a key={label} href={href} style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>{label}</a>
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#111', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>Légal</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[['Confidentialité', '/privacy'], ['CGU', '/cgu']].map(([label, href]) => (
                  <a key={label} href={href} style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'none' }}>{label}</a>
                ))}
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px', fontSize: '13px', color: '#9ca3af' }}>
            © 2026 DidCV. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  )
}
