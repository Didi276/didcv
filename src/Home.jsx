import { useEffect, useState, useRef } from 'react'
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
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(var(--r,0deg)); }
    50%       { transform: translateY(-10px) rotate(var(--r,0deg)); }
  }
  @keyframes countUp {
    from { opacity: 0; transform: scale(0.8); }
    to   { opacity: 1; transform: scale(1); }
  }
  .anim-fade-up { animation: fadeUp 0.6s ease both; }
  .anim-fade-in { animation: fadeIn 0.5s ease both; }
`

// Templates à afficher dans le hero
const PREVIEW_TEMPLATES = [
  { name: 'Finance',    color: '#1a1a1a', accent: '#f0f0f0' },
  { name: 'LinkedIn',   color: '#0a66c2', accent: '#e8f3ff' },
  { name: 'Creative',   color: '#667eea', accent: '#f3f0ff' },
  { name: 'Executive',  color: '#c9a84c', accent: '#1a1a1a' },
  { name: 'Modern',     color: '#0f6e56', accent: '#f0fdf4' },
]

function MiniCV({ color, accent, name, style }) {
  return (
    <div style={{
      width: '140px', height: '198px', borderRadius: '8px', overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', background: '#fff', flexShrink: 0,
      border: '1px solid rgba(0,0,0,0.06)', ...style
    }}>
      {/* Header du mini CV */}
      <div style={{ background: color, padding: '10px 10px 8px', height: '56px' }}>
        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', marginBottom: '4px' }} />
        <div style={{ width: '70px', height: '4px', background: 'rgba(255,255,255,0.7)', borderRadius: '2px', marginBottom: '2px' }} />
        <div style={{ width: '50px', height: '3px', background: 'rgba(255,255,255,0.4)', borderRadius: '2px' }} />
      </div>
      {/* Corps */}
      <div style={{ padding: '8px 10px' }}>
        {[65, 50, 55, 45, 60, 40, 55, 35, 50, 45, 60, 40].map((w, i) => (
          <div key={i} style={{
            width: `${w}%`, height: i % 4 === 0 ? '4px' : '2.5px',
            background: i % 4 === 0 ? color : '#e5e7eb',
            borderRadius: '2px', marginBottom: '4px',
            opacity: i % 4 === 0 ? 0.8 : 1
          }} />
        ))}
      </div>
    </div>
  )
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const w = useWidth()
  const isMobile = w < 768
  const [templatesRef, templatesInView] = useInView()
  const [howRef, howInView] = useInView()
  const [featRef, featInView] = useInView()
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
          <span style={{ color: '#9c7a3f' }}>Did</span>CV
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
              background: '#171412', color: '#fff', padding: '9px 20px',
              borderRadius: '8px', letterSpacing: '-0.2px'
            }}>
              Créer mon CV gratuit
            </a>
          </div>
        )}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <div style={{ width: '22px', height: '2px', background: '#171412', borderRadius: '2px', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <div style={{ width: '22px', height: '2px', background: '#171412', borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <div style={{ width: '22px', height: '2px', background: '#171412', borderRadius: '2px', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
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
              background: '#171412', color: '#fff', padding: '12px',
              borderRadius: '8px', letterSpacing: '-0.2px'
            }}>
              Créer mon CV gratuit
            </a>
          </div>
        </div>
      )}

      {/* ─── HERO ───────────────────────────────────────────── */}
      <div style={{ paddingTop: '64px', background: 'linear-gradient(180deg, #faf7f2 0%, #fff 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '40px 20px 40px' : '80px 48px 60px', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '40px' : '64px', alignItems: 'center' }}>

          {/* Texte gauche */}
          <div style={{ animation: 'fadeUp 0.7s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f3ead9', color: '#7a5c2e', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '24px', letterSpacing: '0.3px' }}>
              Fini les CV qui se ressemblent tous
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '50px', fontWeight: '800', lineHeight: '1.15', letterSpacing: isMobile ? '-1px' : '-2px', margin: '0 0 20px', color: '#0f0f1a' }}>
              Finis de perdre des heures<br />
              sur ton CV. <span style={{ color: '#9c7a3f' }}>DidCV le fait</span><br />
              pour toi.
            </h1>
            <p style={{ fontSize: isMobile ? '15px' : '17px', color: '#6b7280', lineHeight: '1.7', margin: '0 0 36px', maxWidth: '440px' }}>
              Colle l'offre du poste, choisis un modèle parmi 27, et récupère un CV + une lettre de motivation prêts à envoyer. Ce qui prenait une soirée entière sur Word prend maintenant quelques minutes.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
              <a href="/auth" style={{
                fontWeight: '700', textDecoration: 'none', fontSize: '15px',
                background: '#171412', color: '#fff', padding: '14px 28px',
                borderRadius: '10px', letterSpacing: '-0.2px', display: 'inline-block'
              }}>
                Créer mon CV gratuitement →
              </a>
              <a href="#how" style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'none', fontWeight: '500' }}>
                Voir comment ça marche
              </a>
            </div>
            <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>
              Aucune carte bancaire · 100% gratuit pour commencer
            </p>

            {/* Ce que tu obtiens concrètement */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '36px', paddingTop: '28px', borderTop: '1px solid #f0f0f0' }}>
              {['27 modèles de CV', 'Lettre de motivation incluse', 'Export PDF illimité', 'Suivi de tes candidatures'].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#374151', fontWeight: '500' }}>
                  <span style={{ color: '#9c7a3f', fontWeight: '700' }}>✓</span>{item}
                </div>
              ))}
            </div>
          </div>

          {/* Aperçus templates droite */}
          <div style={{ position: 'relative', height: isMobile ? '300px' : '420px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: isMobile ? 'scale(0.75)' : 'none' }}>
            {/* CV en arrière plan */}
            <MiniCV color="#0a66c2" accent="#e8f3ff" name="LinkedIn" style={{ position: 'absolute', left: '0px', top: '20px', transform: 'rotate(-6deg)', opacity: 0.5, animation: 'float 4s ease-in-out infinite', '--r': '-6deg' }} />
            <MiniCV color="#0f6e56" accent="#f0fdf4" name="Modern" style={{ position: 'absolute', right: '10px', top: '30px', transform: 'rotate(5deg)', opacity: 0.5, animation: 'float 5s ease-in-out infinite 0.5s', '--r': '5deg' }} />
            {/* CV principal au centre */}
            <MiniCV color="#171412" accent="#f3ead9" name="Main" style={{ position: 'relative', zIndex: 10, width: '160px', height: '226px', animation: 'float 3.5s ease-in-out infinite 0.2s', '--r': '0deg' }} />
            {/* CV de droite */}
            <MiniCV color="#1a1a1a" accent="#f0f0f0" name="Finance" style={{ position: 'absolute', right: '-10px', bottom: '20px', transform: 'rotate(4deg)', opacity: 0.7, animation: 'float 4.5s ease-in-out infinite 0.8s', '--r': '4deg' }} />
            <MiniCV color="#c9a84c" accent="#0d0d0d" name="Executive" style={{ position: 'absolute', left: '10px', bottom: '10px', transform: 'rotate(-4deg)', opacity: 0.7, animation: 'float 4s ease-in-out infinite 1s', '--r': '-4deg' }} />

            {/* Badge flottant */}
            <div style={{ position: 'absolute', top: '40px', right: '30px', background: '#fff', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', zIndex: 20, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#111' }}>Score ATS</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>95% - Excellent</div>
              </div>
            </div>

            {/* Badge génération */}
            <div style={{ position: 'absolute', bottom: '30px', left: '20px', background: '#171412', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)', zIndex: 20 }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>CV + lettre</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>Prêts en 30 secondes</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── BANDE SOCIAL PROOF ──────────────────────────────── */}
      <div style={{ background: '#faf8f3', borderTop: '1px solid #efe6d2', borderBottom: '1px solid #efe6d2', padding: isMobile ? '16px 20px' : '20px 48px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isMobile ? '20px' : '48px', flexWrap: 'wrap' }}>
          {['Finance & Comptabilité', 'Tech & Informatique', 'BTP & Chantier', 'Santé & Médical', 'Commerce & Vente', 'Restauration', 'Étudiant & Junior', 'Transport & Logistique'].map(s => (
            <span key={s} style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap' }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ─── TEMPLATES ───────────────────────────────────────── */}
      <section id="templates" ref={templatesRef} style={{ padding: isMobile ? '56px 20px' : '96px 48px', maxWidth: '1200px', margin: '0 auto', opacity: templatesInView ? 1 : 0, transform: templatesInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '56px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#9c7a3f', textTransform: 'uppercase', marginBottom: '12px' }}>TEMPLATES</div>
          <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 16px', color: '#0f0f1a' }}>
            27 modèles, pas un de trop
          </h2>
          <p style={{ fontSize: isMobile ? '14px' : '16px', color: '#6b7280', margin: 0 }}>
            Bureau, terrain, santé, création, premier job - un modèle qui te ressemble, pas un gabarit générique.
          </p>
        </div>

        {/* Grille de mini aperçus */}
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
                {/* Aperçu coloré */}
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
              height: '132px', borderRadius: '10px', border: '1px dashed #d8c9a3',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: '#faf7ee', cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#9c7a3f'; e.currentTarget.style.background = '#f5eed9' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#d8c9a3'; e.currentTarget.style.background = '#faf7ee' }}
            >
              <div style={{ fontSize: '18px', fontWeight: '800', color: '#9c7a3f' }}>+15</div>
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#7a5c2e', marginTop: '2px' }}>autres modèles</div>
            </div>
          </a>
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/auth" style={{ fontSize: '14px', color: '#9c7a3f', textDecoration: 'none', fontWeight: '600', border: '1px solid #e8dfc9', padding: '10px 24px', borderRadius: '8px', background: '#faf7ee' }}>
            Voir tous les templates →
          </a>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ───────────────────────────────── */}
      <section id="how" ref={howRef} style={{ background: '#faf8f3', padding: isMobile ? '56px 20px' : '96px 48px', opacity: howInView ? 1 : 0, transform: howInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#9c7a3f', textTransform: 'uppercase', marginBottom: '12px' }}>COMMENT ÇA MARCHE</div>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 16px', color: '#0f0f1a' }}>
              Trois étapes, pas plus.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '16px' : '32px' }}>
            {[
              { num: '01', title: 'Choisis ton template', desc: '27 modèles pensés pour des métiers réels. Finance, tech, santé, BTP, premier emploi...' },
              { num: '02', title: "Colle l'offre d'emploi", desc: "On repère les mots-clés qui comptent, on adapte ton profil au poste, et on rédige une lettre de motivation qui a du sens." },
              { num: '03', title: 'Télécharge et postule', desc: 'Un PDF propre, lisible par les logiciels de recrutement. Tu peux le retoucher à tout moment depuis ton dashboard.' },
            ].map(s => (
              <div key={s.num} style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #efe6d2' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#c9ad74', letterSpacing: '2px', marginBottom: '16px' }}>ÉTAPE {s.num}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px', color: '#111', letterSpacing: '-0.3px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CE QU'ON A QUE LES AUTRES N'ONT PAS ─────────────── */}
      <section ref={featRef} style={{ padding: isMobile ? '56px 20px' : '96px 48px', opacity: featInView ? 1 : 0, transform: featInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#9c7a3f', textTransform: 'uppercase', marginBottom: '12px' }}>CE QUI CHANGE VRAIMENT</div>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0', color: '#0f0f1a' }}>
              Ce qu'on a que les autres n'ont pas.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '14px' : '24px' }}>
            {[
              { title: 'Score ATS', desc: "On te dit si ton CV passe les logiciels de tri des recruteurs, pas juste s'il est joli à l'œil." },
              { title: 'Discussion avec l\'IA', desc: "Coincé sur une accroche ou une mission ? Demande des suggestions à l'IA directement dans l'éditeur." },
              { title: 'Suivi des candidatures', desc: 'Chaque CV envoyé, chaque réponse, au même endroit. Fini les fichiers éparpillés entre le bureau et le téléphone.' },
              { title: 'Formations intégrées', desc: 'Des formations gratuites choisies selon ton métier, avec un test de niveau qui atterrit directement sur ton profil.' },
              { title: 'Offres d\'emploi intégrées', desc: 'Cherche une offre, génère le CV qui va avec, sans changer d\'onglet ni tout recopier à la main.' },
            ].map(f => (
              <div key={f.title} style={{ padding: '28px', borderRadius: '14px', border: '1px solid #f0f0f0', background: '#fff' }}>
                <div style={{ width: '32px', height: '3px', background: '#9c7a3f', borderRadius: '2px', marginBottom: '18px' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px', color: '#111' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" ref={pricingRef} style={{ background: '#faf8f3', padding: isMobile ? '56px 20px' : '96px 48px', opacity: pricingInView ? 1 : 0, transform: pricingInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? '32px' : '56px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#9c7a3f', textTransform: 'uppercase', marginBottom: '12px' }}>TARIFS</div>
            <h2 style={{ fontSize: isMobile ? '28px' : '40px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0', color: '#0f0f1a' }}>
              Simple et transparent.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px' }}>
            {/* Gratuit */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '36px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '20px' }}>GRATUIT</div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#111', letterSpacing: '-1px', marginBottom: '4px' }}>0 €</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '28px' }}>Pour commencer</div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px', marginBottom: '28px' }}>
                {['1 CV optimisé ATS', '1 lettre de motivation', '27 templates', 'Éditeur intégré', 'Export PDF'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: '#374151' }}>
                    <span style={{ color: '#9c7a3f', fontWeight: '700' }}>✓</span>{f}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: '#9ca3af' }}>
                  <span style={{ color: '#e5e7eb', fontWeight: '700' }}>✗</span>CV illimités
                </div>
              </div>
              <a href="/auth" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: '10px', border: '1.5px solid #171412', color: '#171412', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
                Commencer gratuitement
              </a>
            </div>

            {/* Pro */}
            <div style={{ background: '#171412', borderRadius: '16px', padding: '36px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '16px', right: '16px', background: '#9c7a3f', color: '#fff', fontSize: '10px', fontWeight: '800', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                POPULAIRE
              </div>
              <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', marginBottom: '20px' }}>PRO</div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#fff', letterSpacing: '-1px', marginBottom: '4px' }}>9 €<span style={{ fontSize: '16px', fontWeight: '500', opacity: 0.7 }}> / mois</span></div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '28px' }}>Sans engagement</div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '24px', marginBottom: '28px' }}>
                {['CV illimités', 'Lettres illimitées', '27 templates', 'Éditeur avancé', 'Export PDF illimité', 'Profil centralisé'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: 'rgba(255,255,255,0.9)' }}>
                    <span style={{ color: '#d9c08a', fontWeight: '700' }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <a href="#" style={{ display: 'block', textAlign: 'center', padding: '13px', borderRadius: '10px', background: '#fff', color: '#171412', textDecoration: 'none', fontWeight: '700', fontSize: '14px' }}>
                Passer au Pro
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ───────────────────────────────────────── */}
      <section style={{ padding: isMobile ? '56px 20px' : '96px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: isMobile ? '30px' : '44px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 16px', color: '#0f0f1a', lineHeight: '1.15' }}>
            Bon, on s'y met ?<br />
            <span style={{ color: '#9c7a3f' }}>Ton CV n'attend que ça.</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 36px', lineHeight: '1.6' }}>
            Colle une offre, choisis un modèle, télécharge. Gratuit pour commencer.
          </p>
          <a href="/auth" style={{ fontSize: '16px', fontWeight: '700', textDecoration: 'none', background: '#171412', color: '#fff', padding: '16px 36px', borderRadius: '12px', display: 'inline-block', letterSpacing: '-0.3px' }}>
            Créer mon CV gratuitement →
          </a>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: isMobile ? '28px 20px' : '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ fontWeight: '800', fontSize: '18px', color: '#111', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#9c7a3f' }}>Did</span>CV
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[['Confidentialité', '/privacy'], ['CGU', '/cgu'], ['Contact', '/contact'], ['A propos', '/about'], ['Blog', '/blog'], ['Guides métier', '/guides'], ['Formations', '/formations'], ['Espace Recruteurs', '/recruteurs/inscription']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>© 2026 DidCV. Tous droits réservés.</div>
      </footer>
    </div>
  )
}
