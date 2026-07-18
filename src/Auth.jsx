import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const isMobile = w < 768

  const handleSubmit = async () => {
    if (!email || !password) { setError('Remplis tous les champs.'); return }
    if (password.length < 6) { setError('Mot de passe : 6 caracteres minimum.'); return }
    setLoading(true); setError(''); setSuccess('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Email ou mot de passe incorrect.'); setLoading(false); return }
      window.location.href = '/dashboard'
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError('Erreur lors de la creation du compte.'); setLoading(false); return }
      setSuccess('Compte cree ! Verifie ton email pour confirmer.')
      setLoading(false)
    }
  }

  const INPUT = {
    width: '100%', padding: '13px 16px', border: '1.5px solid #e5e7eb',
    borderRadius: '10px', fontSize: '15px', outline: 'none',
    fontFamily: '"Inter",system-ui,sans-serif', color: '#111',
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', fontFamily: '"Inter",system-ui,sans-serif' }}>

      {/* Visuel gauche - caché sur mobile */}
      {!isMobile && (
        <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: '400px', height: '400px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: '-100px', right: '-100px' }} />
          <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: '-80px', left: '-80px' }} />
          <a href="/" style={{ textDecoration: 'none', position: 'absolute', top: '32px', left: '36px' }}>
            <div style={{ fontWeight: '800', fontSize: '22px', color: '#fff' }}>Did<span style={{ color: 'rgba(255,255,255,0.6)' }}>CV</span></div>
          </a>
          <div style={{ textAlign: 'center', zIndex: 1, maxWidth: '400px' }}>
            <div style={{ fontSize: '56px', marginBottom: '24px' }}>⚡</div>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', margin: '0 0 16px', letterSpacing: '-1px', lineHeight: '1.1' }}>
              Ton CV parfait<br />en 30 secondes.
            </h2>
            <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', margin: '0 0 40px', lineHeight: '1.7' }}>
              L'IA genere un CV optimise ATS et une lettre de motivation personnalisee a partir de ton offre d'emploi.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
              {['27 templates professionnels', 'CV + lettre en 30 secondes', 'Score ATS 95% garanti', 'Pour tous les metiers et secteurs'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0 }}>✓</div>
                  <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '40px 24px' : '60px 48px', background: '#fff', minHeight: isMobile ? '100vh' : 'auto' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Logo mobile */}
          {isMobile && (
            <a href="/" style={{ display: 'block', textAlign: 'center', fontWeight: '800', fontSize: '24px', textDecoration: 'none', color: '#111', marginBottom: '32px' }}>
              <span style={{ color: '#4f46e5' }}>Did</span>CV
            </a>
          )}

          <h1 style={{ fontSize: isMobile ? '26px' : '28px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
            {mode === 'login' ? 'Connexion' : 'Creer un compte'}
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 32px' }}>
            {mode === 'login' ? 'Content de te revoir !' : 'Gratuit pour commencer - aucune carte bancaire'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="marie@email.com" style={INPUT}
                onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Mot de passe</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="6 caracteres minimum" style={INPUT}
                onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
            </div>
          </div>

          {error && <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '9px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>{error}</div>}
          {success && <div style={{ padding: '12px 16px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '9px', fontSize: '13px', color: '#16a34a', marginBottom: '16px' }}>{success}</div>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ width: '100%', padding: '14px', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: '20px' }}>
            {loading ? '⏳ Chargement...' : mode === 'login' ? 'Se connecter' : 'Creer mon compte gratuit'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
            <div style={{ fontSize: '12px', color: '#c4c4c4' }}>ou</div>
            <div style={{ flex: 1, height: '1px', background: '#f0f0f0' }} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>{mode === 'login' ? 'Pas encore de compte ? ' : 'Deja un compte ? '}</span>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
              style={{ fontSize: '14px', color: '#4f46e5', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              {mode === 'login' ? 'Creer un compte' : 'Se connecter'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <a href="/" style={{ fontSize: '13px', color: '#c4c4c4', textDecoration: 'none' }}>Retour a l'accueil</a>
          </div>
        </div>
      </div>
    </div>
  )
}
