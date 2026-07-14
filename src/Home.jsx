import { useEffect, useState, useRef } from 'react'
import { supabase } from './supabase'

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
      <style>{ANIM_CSS}</style>

      {/* ─── NAVIGATION ─────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.95)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #f0f0f0' : '1px solid transparent',
        transition: 'all 0.2s',
        padding: '0 48px', height: '64px',
        display: 'flex', alignItems: 'center', gap: '32px'
      }}>
        <a href="/" style={{ fontWeight: '800', fontSize: '20px', textDecoration: 'none', color: '#111', letterSpacing: '-0.5px', marginRight: '16px' }}>
          <span style={{ color: '#4f46e5' }}>Did</span>CV
        </a>
        <div style={{ display: 'flex', gap: '28px', flex: 1 }}>
          {[['#templates', 'Templates'], ['#how', 'Comment ça marche'], ['#pricing', 'Tarifs']].map(([href, label]) => (
            <a key={href} href={href} style={{ fontSize: '14px', color: '#555', textDecoration: 'none', fontWeight: '500' }}
              onMouseEnter={e => e.target.style.color = '#111'}
              onMouseLeave={e => e.target.style.color = '#555'}>
              {label}
            </a>
          ))}
        </div>
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
      </nav>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <div style={{ paddingTop: '64px', background: 'linear-gradient(180deg, #fafaff 0%, #fff 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 48px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>

          {/* Texte gauche */}
          <div style={{ animation: 'fadeUp 0.7s ease both' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ede9fe', color: '#5b21b6', padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', marginBottom: '24px', letterSpacing: '0.3px' }}>
              ✨ Propulsé par l'IA - Gratuit pour commencer
            </div>
            <h1 style={{ fontSize: '52px', fontWeight: '800', lineHeight: '1.1', letterSpacing: '-2px', margin: '0 0 20px', color: '#0f0f1a' }}>
              Crée ton CV<br />
              <span style={{ color: '#4f46e5' }}>parfait</span> en<br />
              30 secondes.
            </h1>
            <p style={{ fontSize: '17px', color: '#6b7280', lineHeight: '1.7', margin: '0 0 36px', maxWidth: '440px' }}>
              Choisis un template, colle ton offre d'emploi - l'IA génère un CV optimisé ATS et une lettre de motivation personnalisée. Télécharge, postule.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
              <a href="/auth" style={{
                fontWeight: '700', textDecoration: 'none', fontSize: '15px',
                background: '#4f46e5', color: '#fff', padding: '14px 28px',
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

            {/* Stats compactes */}
            <div style={{ display: 'flex', gap: '28px', marginTop: '36px', paddingTop: '28px', borderTop: '1px solid #f0f0f0' }}>
              {[['27+', 'Templates'], ['95%', 'Score ATS'], ['<30s', 'Génération'], ['IA', 'Intégrée']].map(([val, label]) => (
                <div key={label}>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#111', letterSpacing: '-0.5px' }}>{val}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Aperçus templates droite */}
          <div style={{ position: 'relative', height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* CV en arrière plan */}
            <MiniCV color="#0a66c2" accent="#e8f3ff" name="LinkedIn" style={{ position: 'absolute', left: '0px', top: '20px', transform: 'rotate(-6deg)', opacity: 0.5, animation: 'float 4s ease-in-out infinite', '--r': '-6deg' }} />
            <MiniCV color="#0f6e56" accent="#f0fdf4" name="Modern" style={{ position: 'absolute', right: '10px', top: '30px', transform: 'rotate(5deg)', opacity: 0.5, animation: 'float 5s ease-in-out infinite 0.5s', '--r': '5deg' }} />
            {/* CV principal au centre */}
            <MiniCV color="#4f46e5" accent="#ede9fe" name="Main" style={{ position: 'relative', zIndex: 10, width: '160px', height: '226px', animation: 'float 3.5s ease-in-out infinite 0.2s', '--r': '0deg' }} />
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

            {/* Badge IA */}
            <div style={{ position: 'absolute', bottom: '30px', left: '20px', background: '#4f46e5', borderRadius: '12px', padding: '10px 14px', boxShadow: '0 4px 20px rgba(79,70,229,0.3)', zIndex: 20 }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>⚡ Généré par IA</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>CV + Lettre en 30 sec</div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── BANDE SOCIAL PROOF ──────────────────────────────── */}
      <div style={{ background: '#f8f9ff', borderTop: '1px solid #ede9fe', borderBottom: '1px solid #ede9fe', padding: '20px 48px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
          {['Finance & Comptabilité', 'Tech & Informatique', 'BTP & Chantier', 'Santé & Médical', 'Commerce & Vente', 'Restauration', 'Étudiant & Junior', 'Transport & Logistique'].map(s => (
            <span key={s} style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap' }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ─── TEMPLATES ───────────────────────────────────────── */}
      <section id="templates" ref={templatesRef} style={{ padding: '96px 48px', maxWidth: '1200px', margin: '0 auto', opacity: templatesInView ? 1 : 0, transform: templatesInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '12px' }}>TEMPLATES</div>
          <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 16px', color: '#0f0f1a' }}>
            27 templates professionnels
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: 0 }}>
            Pour tous les profils - bureau, terrain, santé, création, junior...
          </p>
        </div>

        {/* Grille de mini aperçus */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px', marginBottom: '40px' }}>
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
        </div>

        <div style={{ textAlign: 'center' }}>
          <a href="/auth" style={{ fontSize: '14px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', border: '1px solid #ede9fe', padding: '10px 24px', borderRadius: '8px', background: '#faf9ff' }}>
            Voir tous les templates →
          </a>
        </div>
      </section>

      {/* ─── COMMENT ÇA MARCHE ───────────────────────────────── */}
      <section id="how" ref={howRef} style={{ background: '#f8f9ff', padding: '96px 48px', opacity: howInView ? 1 : 0, transform: howInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '12px' }}>COMMENT ÇA MARCHE</div>
            <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 16px', color: '#0f0f1a' }}>
              3 étapes. Un CV parfait.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
            {[
              { num: '01', icon: '🎨', title: 'Choisis ton template', desc: '27 designs professionnels pour tous les secteurs et profils. Finance, tech, santé, BTP, étudiant...' },
              { num: '02', icon: '⚡', title: "L'IA génère ton CV", desc: "Colle l'offre d'emploi. L'IA analyse les mots-clés, adapte ton profil et génère CV + lettre de motivation en 30 secondes." },
              { num: '03', icon: '📥', title: 'Télécharge et postule', desc: 'CV optimisé ATS en PDF propre, prêt à envoyer. Modifie à tout moment depuis ton dashboard.' },
            ].map(s => (
              <div key={s.num} style={{ background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid #ede9fe' }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: '#a5b4fc', letterSpacing: '2px', marginBottom: '16px' }}>ÉTAPE {s.num}</div>
                <div style={{ fontSize: '32px', marginBottom: '14px' }}>{s.icon}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 10px', color: '#111', letterSpacing: '-0.3px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FONCTIONNALITÉS ─────────────────────────────────── */}
      <section ref={featRef} style={{ padding: '96px 48px', opacity: featInView ? 1 : 0, transform: featInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '12px' }}>FONCTIONNALITÉS</div>
            <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0', color: '#0f0f1a' }}>
              Tout pour décrocher l'entretien.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            {[
              { icon: '🤖', title: 'CV généré par IA', desc: "L'IA analyse l'offre et génère un CV taillé pour passer tous les filtres ATS. Score 95%+." },
              { icon: '✉️', title: 'Lettre de motivation', desc: "Lettre personnalisée générée automatiquement, adaptée au poste et à l'entreprise." },
              { icon: '🎨', title: '27 templates', desc: 'Pour tous les profils : tertiaire, tech, santé, BTP, restauration, étudiant, international...' },
              { icon: '✏️', title: 'Éditeur intégré', desc: 'Modifie chaque section directement en ligne - missions, compétences, mise en forme.' },
              { icon: '🔍', title: 'Recherche d\'offres', desc: 'Parcours des milliers d\'offres en temps réel et génère ton CV pour postuler en 1 clic.' },
              { icon: '📊', title: 'Dashboard personnel', desc: 'Tous tes CV classés par offre. Modifie, télécharge, duplique à tout moment.' },
            ].map(f => (
              <div key={f.title} style={{ padding: '28px', borderRadius: '14px', border: '1px solid #f0f0f0', background: '#fff' }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 8px', color: '#111' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─────────────────────────────────────────── */}
      <section id="pricing" ref={pricingRef} style={{ background: '#f8f9ff', padding: '96px 48px', opacity: pricingInView ? 1 : 0, transform: pricingInView ? 'translateY(0)' : 'translateY(32px)', transition: 'opacity 0.7s ease, transform 0.7s ease' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '12px' }}>TARIFS</div>
            <h2 style={{ fontSize: '40px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0', color: '#0f0f1a' }}>
              Simple et transparent.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Gratuit */}
            <div style={{ background: '#fff', borderRadius: '16px', padding: '36px', border: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '1px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '20px' }}>GRATUIT</div>
              <div style={{ fontSize: '42px', fontWeight: '800', color: '#111', letterSpacing: '-1px', marginBottom: '4px' }}>0 €</div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '28px' }}>Pour commencer</div>
              <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: '24px', marginBottom: '28px' }}>
                {['1 CV optimisé ATS', '1 lettre de motivation', '27 templates', 'Éditeur intégré', 'Export PDF'].map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', fontSize: '14px', color: '#374151' }}>
                    <span style={{ color: '#22c55e', fontWeight: '700' }}>✓</span>{f}
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
                    <span style={{ color: '#a5f3fc', fontWeight: '700' }}>✓</span>{f}
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
      <section style={{ padding: '96px 48px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '44px', fontWeight: '800', letterSpacing: '-1.5px', margin: '0 0 16px', color: '#0f0f1a', lineHeight: '1.1' }}>
            Prêt à décrocher<br />
            <span style={{ color: '#4f46e5' }}>ton prochain entretien ?</span>
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', margin: '0 0 36px', lineHeight: '1.6' }}>
            Crée ton CV optimisé en moins de 30 secondes.<br />Gratuit pour commencer.
          </p>
          <a href="/auth" style={{ fontSize: '16px', fontWeight: '700', textDecoration: 'none', background: '#4f46e5', color: '#fff', padding: '16px 36px', borderRadius: '12px', display: 'inline-block', letterSpacing: '-0.3px' }}>
            Créer mon CV gratuitement →
          </a>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>Aucune carte bancaire requise</p>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid #f0f0f0', padding: '40px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ fontWeight: '800', fontSize: '18px', color: '#111', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#4f46e5' }}>Did</span>CV
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[['Confidentialité', '/privacy'], ['CGU', '/cgu'], ['Contact', '/contact'], ['A propos', '/about'], ['Blog', '/blog'], ['Guides métier', '/guides']].map(([label, href]) => (
            <a key={label} href={href} style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>{label}</a>
          ))}
        </div>
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>© 2026 DidCV. Tous droits réservés.</div>
      </footer>
    </div>
  )
}
