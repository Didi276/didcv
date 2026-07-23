import { useState, useEffect } from 'react'
import { Zap, Check, Loader2 } from 'lucide-react'
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
        <div style={{ background: '#0a0a0f', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '300px', maxWidth: '100%', background: 'radial-gradient(circle, #4f46e520 0%, transparent 70%)', pointerEvents: 'none' }} />
          <a href="/" style={{ textDecoration: 'none', position: 'absolute', top: '32px', left: '36px', zIndex: 1 }}>
            <div style={{ fontWeight: '700', fontSize: '20px', color: '#fff' }}>DidCV</div>
          </a>
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1, maxWidth: '400px' }}>
            <Zap size={44} color="#fff" strokeWidth={1.5} style={{ marginBottom: '28px' }} />
            <h2 style={{ fontSize: '34px', fontWeight: '700', color: '#fff', margin: '0 0 16px', letterSpacing: '-1px', lineHeight: '1.15' }}>
              Ton CV parfait<br />en 30 secondes.
            </h2>
            <p style={{ fontSize: '15px', color: '#a1a1aa', margin: '0 0 44px', lineHeight: '1.7' }}>
              L'IA genere un CV optimise ATS et une lettre de motivation personnalisee a partir de ton offre d'emploi.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              {['27 templates professionnels', 'CV + lettre en 30 secondes', 'Score ATS 95% garanti', 'Pour tous les metiers et secteurs'].map(t => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(79,70,229,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><Check size={13} /></div>
                  <div style={{ fontSize: '14px', color: '#d4d4d8', fontWeight: '500' }}>{t}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Formulaire */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '48px 24px' : '60px 64px', background: '#fff', minHeight: isMobile ? '100vh' : 'auto' }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>

          {/* Logo mobile */}
          {isMobile && (
            <a href="/" style={{ display: 'block', textAlign: 'center', fontWeight: '700', fontSize: '22px', textDecoration: 'none', color: '#111', marginBottom: '40px' }}>
              DidCV
            </a>
          )}

          <h1 style={{ fontSize: isMobile ? '28px' : '32px', fontWeight: '700', color: '#0a0a0f', margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            {mode === 'login' ? 'Connexion' : 'Creer un compte'}
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 40px' }}>
            {mode === 'login' ? 'Content de te revoir !' : 'Gratuit pour commencer - aucune carte bancaire'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '24px' }}>
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

          {error && <div style={{ padding: '12px 16px', background: '#fef2f2', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '9px', fontSize: '13px', color: '#dc2626', marginBottom: '18px' }}>{error}</div>}
          {success && <div style={{ padding: '12px 16px', background: '#f0fdf4', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '9px', fontSize: '13px', color: '#16a34a', marginBottom: '18px' }}>{success}</div>}

          <button onClick={handleSubmit} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '15px', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', marginBottom: '24px', boxShadow: loading ? 'none' : '0 4px 16px rgba(79,70,229,0.3)' }}>
            {loading && <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} />}
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Creer mon compte gratuit'}
          </button>
          <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>

          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '14px', color: '#9ca3af' }}>{mode === 'login' ? 'Pas encore de compte ? ' : 'Deja un compte ? '}</span>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess('') }}
              style={{ fontSize: '14px', color: '#4f46e5', fontWeight: '700', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
              {mode === 'login' ? 'Creer un compte' : 'Se connecter'}
            </button>
          </div>
          <div style={{ textAlign: 'center', marginTop: '28px' }}>
            <a href="/" style={{ fontSize: '13px', color: '#c4c4c4', textDecoration: 'none' }}>Retour a l'accueil</a>
          </div>
        </div>
      </div>
    </div>
  )
}
