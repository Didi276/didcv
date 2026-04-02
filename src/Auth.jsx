import { useState } from 'react'
import { supabase } from './supabase'
import './App.css'

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.href = '/templates'
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('✅ Compte créé ! Tu peux maintenant te connecter.')
setIsLogin(true)
      }
    } catch (error) {
      setMessage('❌ ' + error.message)
    }

    setLoading(false)
  }

  return (
    <div className="auth-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
      </nav>

      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
            <p>{isLogin ? 'Bon retour sur DidCV !' : 'Rejoins des milliers de candidats'}</p>
          </div>

          <div className="auth-form">
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
            </div>

            <div className="auth-field">
              <label>Mot de passe</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
            </div>

            {message && (
              <div className="auth-message">{message}</div>
            )}

            <button
              className="btn-generate"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '⏳ Chargement...' : isLogin ? '→ Se connecter' : '→ Créer mon compte'}
            </button>

            <div className="auth-switch">
              {isLogin ? "Tu n'as pas de compte ?" : "Tu as déjà un compte ?"}
              <button
                className="auth-link"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Auth