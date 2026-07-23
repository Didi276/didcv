import { FileQuestion } from 'lucide-react'
import Navbar from './Navbar'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 58px)', padding: '40px 24px', textAlign: 'center' }}>
        <FileQuestion size={64} color="#c4c4c4" strokeWidth={1.5} style={{ marginBottom: '20px' }} />
        <h1 style={{ fontSize: '34px', fontWeight: '700', color: '#0a0a0f', margin: '0 0 12px', letterSpacing: '-1px' }}>Page introuvable</h1>
        <p style={{ fontSize: '15px', color: '#9ca3af', margin: '0 0 36px', maxWidth: '400px', lineHeight: '1.6' }}>
          Cette page n'existe pas ou a été déplacée. Utilise les liens ci-dessous pour retrouver ton chemin.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" style={{ padding: '12px 26px', background: '#4f46e5', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
            Accueil
          </a>
          <a href="/dashboard" style={{ padding: '12px 26px', background: '#fff', color: '#374151', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
            Dashboard
          </a>
          <a href="/templates" style={{ padding: '12px 26px', background: '#fff', color: '#374151', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
            Générer un CV
          </a>
        </div>
      </div>
    </div>
  )
}
