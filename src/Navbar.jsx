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

  const links = [
    { page: 'dashboard', label: 'Dashboard', href: '/dashboard' },
    { page: 'offres',    label: 'Offres',     href: '/offres'    },
    { page: 'generate',  label: 'Générer CV', href: '/templates' },
    { page: 'profile',   label: 'Profil',     href: '/profile'   },
  ]

  return (
    <nav style={{
      background: '#fff',
      borderBottom: '1px solid #ebebeb',
      padding: '0 32px',
      height: '58px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <a href="/" style={{
        fontWeight: '800', fontSize: '19px', textDecoration: 'none',
        color: '#1a1a1a', marginRight: '20px', letterSpacing: '-0.5px'
      }}>
        <span style={{ color: '#1a56db' }}>Did</span>CV
      </a>

      {/* Liens */}
      {links.map(({ page, label, href }) => {
        const active = currentPage === page
        return (
          <a key={page} href={href} style={{
            fontSize: '14px',
            fontWeight: '500',
            color: active ? '#1a56db' : '#444',
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: '8px',
            background: 'transparent',
            borderBottom: active ? '2px solid #1a56db' : '2px solid transparent',
            transition: 'color 0.15s',
            marginBottom: active ? '-2px' : '0',
          }}>
            {label}
          </a>
        )
      })}

      <div style={{ flex: 1 }} />

      {/* Déconnexion */}
      {user && (
        <button onClick={handleLogout} style={{
          fontSize: '13px', color: '#666', background: 'none',
          border: 'none', cursor: 'pointer', fontFamily: 'inherit',
          padding: '6px 8px',
        }}>
          Déconnexion
        </button>
      )}
    </nav>
  )
}