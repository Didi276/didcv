import { FileQuestion } from 'lucide-react'
import Navbar from './Navbar'

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 58px)', padding: '40px 24px', textAlign: 'center' }}>
        <FileQuestion size={64} color="#c4c4c4" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111', margin: '0 0 10px', letterSpacing: '-1px' }}>Page introuvable</h1>
        <p style={{ fontSize: '15px', color: '#9ca3af', margin: '0 0 32px', maxWidth: '400px', lineHeight: '1.6' }}>
          Cette page n'existe pas ou a été déplacée. Utilise les liens ci-dessous pour retrouver ton chemin.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <a href="/" style={{ padding: '11px 24px', background: '#4f46e5', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
            Accueil
          </a>
          <a href="/dashboard" style={{ padding: '11px 24px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
            Dashboard
          </a>
          <a href="/templates" style={{ padding: '11px 24px', background: '#fff', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
            Générer un CV
          </a>
        </div>
      </div>
    </div>
  )
}
