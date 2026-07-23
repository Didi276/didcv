import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'

const INPUT = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '9px',
  fontSize: '14px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box',
}

function EnTete() {
  return (
    <div style={{ borderBottom: '1px solid #f0f0f0', background: '#fff', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link to="/" style={{ fontWeight: '800', fontSize: '18px', textDecoration: 'none', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
        <span style={{ color: '#1e3a5f' }}>Did</span>CV <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Recruteurs</span>
      </Link>
      <Link to="/recruteurs/inscription" style={{ fontSize: '13px', color: '#1e3a5f', textDecoration: 'none', fontWeight: '600' }}>
        Pas encore de compte ? Demander l'accès
      </Link>
    </div>
  )
}

export default function RecruteurConnexion() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null) // { type: 'erreur'|'attente'|'refuse', texte }

  const handleConnexion = async () => {
    if (!email.trim() || !password) return
    setLoading(true)
    setMessage(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error || !data?.user) {
      setLoading(false)
      setMessage({ type: 'erreur', texte: 'Email ou mot de passe incorrect.' })
      return
    }

    const { data: recruteur } = await supabase.from('recruteurs').select('*').eq('user_id', data.user.id).maybeSingle()
    setLoading(false)

    if (!recruteur) {
      setMessage({ type: 'erreur', texte: "Ce compte n'est pas un compte recruteur." })
      return
    }
    if (recruteur.statut === 'valide') {
      navigate('/recruteurs/banque')
      return
    }
    if (recruteur.statut === 'refuse') {
      setMessage({ type: 'refuse', texte: "Votre demande n'a pas été acceptée." })
      return
    }
    setMessage({ type: 'attente', texte: 'Votre compte est en cours de validation.' })
  }

  const couleurs = {
    erreur: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
    attente: { bg: '#fffbeb', border: '#fde68a', color: '#92400e' },
    refuse: { bg: '#fef2f2', border: '#fecaca', color: '#dc2626' },
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <EnTete />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '40px 24px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '36px', maxWidth: '400px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontWeight: '800', fontSize: '20px', color: '#111', letterSpacing: '-0.5px', marginBottom: '4px' }}>
              <span style={{ color: '#1e3a5f' }}>Did</span>CV Recruteurs
            </div>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Connexion à ton espace</p>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Email</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" style={INPUT}
              onKeyDown={e => e.key === 'Enter' && handleConnexion()} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Mot de passe</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" style={INPUT}
              onKeyDown={e => e.key === 'Enter' && handleConnexion()} />
          </div>

          {message && (
            <div style={{ background: couleurs[message.type].bg, border: `1px solid ${couleurs[message.type].border}`, borderRadius: '9px', padding: '12px 14px', fontSize: '13px', color: couleurs[message.type].color, marginBottom: '16px', lineHeight: '1.6' }}>
              {message.texte}
              {message.type === 'attente' && <div style={{ marginTop: '4px' }}>Tu recevras un email dès que ton accès sera validé.</div>}
            </div>
          )}

          <button onClick={handleConnexion} disabled={loading || !email.trim() || !password}
            style={{ width: '100%', padding: '13px', background: loading ? '#9ca3af' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </div>
      </div>
    </div>
  )
}
