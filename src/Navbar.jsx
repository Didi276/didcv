import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FileText, Menu, X, Target } from 'lucide-react'
import { supabase } from './supabase'

const NAV_CSS = `
  .nav-link { position: relative; padding-bottom: 4px; }
  .nav-link::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: -2px;
    height: 2px;
    background: #4f46e5;
    border-radius: 2px;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.25s ease;
  }
  .nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }
`

export default function Navbar({ currentPage = '' }) {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [resourcesOpen, setResourcesOpen] = useState(false)
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user))
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) { setIsAdmin(false); return }
      const { data: profil } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      setIsAdmin(profil?.role === 'admin')
    }
    checkAdmin()
  }, [user])

  const adminLinkStyle = {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: '14px',
    textDecoration: 'none',
    padding: '6px 12px',
    background: '#f0f0ff',
    borderRadius: '6px',
  }

  const isMobile = w < 768

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const mainLinks = [
    { page: 'dashboard',    label: 'Dashboard',     to: '/dashboard',    auth: true },
    { page: 'offres',       label: 'Offres',        to: '/offres',       auth: true },
    { page: 'generate',     label: 'Générer CV',    to: '/templates',    auth: true },
    { page: 'entretien',    label: 'Entretien',     to: '/entretien',    auth: true, Icon: Target },
    { page: 'candidatures', label: 'Candidatures',  to: '/candidatures', auth: true },
    { page: 'formations',   label: 'Formations',    to: '/formations',   auth: true },
  ]
  const profileLink = { page: 'profile', label: 'Profil', to: '/profile', auth: true }

  const resourceLinks = [
    { page: 'blog',   label: 'Blog',          to: '/blog',   auth: false },
    { page: 'guides', label: 'Guides métier', to: '/guides', auth: false },
  ]

  const legalLinks = [
    { page: 'privacy',         label: 'Confidentialité',  to: '/privacy',         auth: false },
    { page: 'cgu',              label: 'CGU',              to: '/cgu',             auth: false },
    { page: 'mentions-legales', label: 'Mentions légales', to: '/mentions-legales', auth: false },
  ]

  const links = [...mainLinks, profileLink, ...resourceLinks, ...legalLinks]
  const visibleLinks = user ? links : links.filter(l => !l.auth)
  const visibleMainLinks = user ? mainLinks : mainLinks.filter(l => !l.auth)
  const visibleResourceLinks = user ? resourceLinks : resourceLinks.filter(l => !l.auth)
  const visibleLegalLinks = user ? legalLinks : legalLinks.filter(l => !l.auth)
  const isResourcePage = [...visibleResourceLinks, ...visibleLegalLinks].some(l => l.page === currentPage)
  const showProfile = user || !profileLink.auth

  const linkStyle = (page) => ({
    fontSize: '14px', fontWeight: '500',
    color: currentPage === page ? '#4f46e5' : '#444',
    textDecoration: 'none', padding: '6px 2px',
    transition: 'color 0.15s',
    display: 'inline-flex', alignItems: 'center', gap: '5px',
  })

  return (
    <>
      <style>{NAV_CSS}</style>
      <nav style={{
        background: '#fff', borderBottom: '1px solid #ebebeb',
        padding: `0 ${isMobile ? '16px' : '32px'}`,
        height: '62px', display: 'flex', alignItems: 'center', gap: '26px',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '21px', textDecoration: 'none', color: '#1a1a1a', marginRight: isMobile ? 'auto' : '4px', letterSpacing: '-0.5px' }}>
          <FileText size={22} color="#4f46e5" strokeWidth={2.25} />
          <span><span style={{ color: '#4f46e5' }}>Did</span>Job</span>
        </Link>

        {/* Desktop links */}
        {!isMobile && visibleMainLinks.map(({ page, label, to, Icon }) => (
          <Link key={page} to={to} className={`nav-link${currentPage === page ? ' active' : ''}`} style={linkStyle(page)}>
            {Icon && <Icon size={14} />}{label}
          </Link>
        ))}

        {/* Desktop menu Ressources (survol) */}
        {!isMobile && visibleResourceLinks.length > 0 && (
          <div onMouseEnter={() => setResourcesOpen(true)} onMouseLeave={() => setResourcesOpen(false)} style={{ position: 'relative' }}>
            <span className={`nav-link${isResourcePage ? ' active' : ''}`} style={{ ...linkStyle(isResourcePage ? currentPage : ''), cursor: 'pointer' }}>
              Ressources <span style={{ fontSize: '10px', transform: resourcesOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', display: 'inline-block' }}>▼</span>
            </span>
            {resourcesOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, minWidth: '180px', background: '#fff', border: '1px solid #ebebeb', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', padding: '6px', zIndex: 110 }}>
                {visibleResourceLinks.map(({ page, label, to }) => (
                  <Link key={page} to={to}
                    style={{ display: 'block', padding: '9px 12px', borderRadius: '7px', fontSize: '14px', fontWeight: currentPage === page ? '700' : '500', color: currentPage === page ? '#4f46e5' : '#374151', textDecoration: 'none', background: currentPage === page ? '#f5f5ff' : 'transparent' }}>
                    {label}
                  </Link>
                ))}
                <div style={{ height: '1px', background: '#f0f0f0', margin: '6px 4px' }} />
                {visibleLegalLinks.map(({ page, label, to }) => (
                  <Link key={page} to={to}
                    style={{ display: 'block', padding: '8px 12px', borderRadius: '7px', fontSize: '13px', fontWeight: currentPage === page ? '700' : '500', color: currentPage === page ? '#4f46e5' : '#9ca3af', textDecoration: 'none', background: currentPage === page ? '#f5f5ff' : 'transparent' }}>
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Séparateur avant Profil */}
        {!isMobile && showProfile && (
          <div style={{ width: '1px', height: '20px', background: '#e5e7eb', flexShrink: 0 }} />
        )}

        {!isMobile && showProfile && (
          <Link to={profileLink.to} className={`nav-link${currentPage === profileLink.page ? ' active' : ''}`} style={linkStyle(profileLink.page)}>
            {profileLink.label}
          </Link>
        )}

        {!isMobile && isAdmin && (
          <Link to="/admin/recruteurs" style={adminLinkStyle}>
            ⚙️ Admin
          </Link>
        )}

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
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', marginLeft: '12px' }}>
            {menuOpen ? <X size={22} color="#374151" /> : <Menu size={22} color="#374151" />}
          </button>
        )}
      </nav>

      {/* Menu mobile */}
      {isMobile && menuOpen && (
        <div style={{ position: 'fixed', top: '58px', left: 0, right: 0, bottom: 0, zIndex: 99 }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: '#fff', borderBottom: '1px solid #f0f0f0', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '8px 0' }}>
            {visibleLinks.map(({ page, label, to, Icon }) => (
              <Link key={page} to={to} onClick={() => setMenuOpen(false)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 24px', fontSize: '15px', fontWeight: currentPage === page ? '700' : '500', color: currentPage === page ? '#4f46e5' : '#374151', textDecoration: 'none', borderLeft: currentPage === page ? '3px solid #4f46e5' : '3px solid transparent', background: currentPage === page ? '#faf9ff' : 'transparent' }}>
                {Icon && <Icon size={16} />}{label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin/recruteurs" onClick={() => setMenuOpen(false)}
                style={{ display: 'block', margin: '4px 24px', ...adminLinkStyle, textAlign: 'center' }}>
                ⚙️ Admin
              </Link>
            )}
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
