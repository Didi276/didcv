import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export default function Navbar({ currentPage = '' }) {
  const [user, setUser] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  const isMobile = w < 768

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

  const linkStyle = (page) => ({
    fontSize: '14px', fontWeight: '500',
    color: currentPage === page ? '#4f46e5' : '#444',
    textDecoration: 'none', padding: '6px 14px',
    borderBottom: currentPage === page ? '2px solid #4f46e5' : '2px solid transparent',
    transition: 'color 0.15s', marginBottom: currentPage === page ? '-2px' : '0',
  })

  return (
    <>
      <nav style={{
        background: '#fff', borderBottom: '1px solid #ebebeb',
        padding: `0 ${isMobile ? '16px' : '32px'}`,
        height: '58px', display: 'flex', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <a href="/" style={{ fontWeight: '800', fontSize: '19px', textDecoration: 'none', color: '#1a1a1a', marginRight: isMobile ? 'auto' : '20px', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#4f46e5' }}>Did</span>CV
        </a>

        {/* Desktop links */}
        {!isMobile && links.map(({ page, label, href }) => (
          <a key={page} href={href} style={linkStyle(page)}>{label}</a>
        ))}

        <div style={{ flex: isMobile ? 0 : 1 }} />

        {/* Desktop déconnexion */}
        {!isMobile && user && (
          <button onClick={handleLogout} style={{ fontSize: '13px', color: '#666', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: '6px 8px' }}>
            Déconnexion
          </button>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '12px' }}>
            <div style={{ width: '22px', height: '2px', background: '#374151', borderRadius: '2px', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
            <div style={{ width: '22px', height: '2px', background: '#374151', borderRadius: '2px', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
            <div style={{ width: '22px', height: '2px', background: '#374151', borderRadius: '2px', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
          </button>
        )}
      </nav>

      {/* Menu mobile slide-in */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: '58px', left: 0, right: 0, bottom: 0, zIndex: 99 }}>
          {/* Overlay */}
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          {/* Menu */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#fff', borderBottom: '1px solid #f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '8px 0' }}>
            {links.map(({ page, label, href }) => (
              <a key={page} href={href} onClick={() => setMenuOpen(false)}
                style={{ display: 'block', padding: '14px 24px', fontSize: '15px', fontWeight: currentPage === page ? '700' : '500', color: currentPage === page ? '#4f46e5' : '#374151', textDecoration: 'none', borderLeft: currentPage === page ? '3px solid #4f46e5' : '3px solid transparent', background: currentPage === page ? '#faf9ff' : 'transparent' }}>
                {label}
              </a>
            ))}
            {user && (
              <button onClick={handleLogout}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '14px 24px', fontSize: '15px', color: '#dc2626', background: 'none', border: 'none', borderTop: '1px solid #f0f0f0', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', marginTop: '4px' }}>
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}