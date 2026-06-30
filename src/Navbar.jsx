// src/Navbar.jsx — Navigation globale réutilisable sur toutes les pages
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function Navbar({ currentPage = '' }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const linkStyle = (page) => ({
    fontSize: '14px',
    fontWeight: currentPage === page ? '700' : '500',
    color: currentPage === page ? '#1a56db' : '#555',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '8px',
    background: currentPage === page ? '#eff4ff' : 'transparent',
    border: currentPage === page ? '1px solid #c7d9ff' : '1px solid transparent',
    transition: 'all 0.15s',
  })

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #e5e7ef',
      padding: '0 28px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
    }}>
      {/* Logo */}
      <a href="/dashboard" style={{ fontWeight: '800', fontSize: '20px', textDecoration: 'none', color: '#1a1a1a', marginRight: '12px' }}>
        <span style={{ color: '#1a56db' }}>Did</span>CV
      </a>

      {/* Liens principaux */}
      <a href="/dashboard" style={linkStyle('dashboard')}>🏠 Dashboard</a>
      <a href="/offres" style={linkStyle('offres')}>🔍 Offres</a>
      <a href="/templates" style={linkStyle('generate')}>⚡ Générer CV</a>
      <a href="/profile" style={linkStyle('profile')}>👤 Profil</a>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Déconnexion */}
      {user && (
        <button onClick={handleLogout} style={{
          fontSize: '13px', color: '#555', background: 'none',
          border: '1px solid #e5e7ef', borderRadius: '8px',
          padding: '6px 14px', cursor: 'pointer', fontFamily: 'inherit'
        }}>
          Déconnexion
        </button>
      )}
    </nav>
  )
}
