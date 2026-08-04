import { useState, useEffect } from 'react'
import { CheckCircle } from 'lucide-react'
import Navbar from './Navbar'
import SEO from './SEO'

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

export default function Contact() {
  const isMobile = useWidth() < 768
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ nom: '', email: '', sujet: '', message: '' })

  const handleSubmit = () => {
    if (!form.nom || !form.email || !form.message) {
      alert('Merci de remplir tous les champs obligatoires.')
      return
    }
    // Ouvre le client mail avec les infos pré-remplies
    const mailto = `mailto:contact@didcv.fr?subject=${encodeURIComponent(`[DidJob] ${form.sujet || 'Contact'}`)}&body=${encodeURIComponent(`Nom: ${form.nom}\nEmail: ${form.email}\n\n${form.message}`)}`
    window.open(mailto)
    setSent(true)
  }

  const INPUT = {
    width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb',
    borderRadius: '9px', fontSize: '14px', fontFamily: '"Inter",system-ui,sans-serif',
    color: '#111', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.15s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <SEO
        titre="Contact"
        description="Contactez l'équipe DidJob pour toute question sur votre CV, votre compte ou nos services. Réponse sous 24h."
        url="https://did-job.com/contact"
      />
      <Navbar />
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '96px 24px 100px' }}>
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '2px', color: '#4f46e5', textTransform: 'uppercase', marginBottom: '14px' }}>CONTACT</div>
          <h1 style={{ fontSize: '34px', fontWeight: '700', color: '#0a0a0f', margin: '0 0 12px', letterSpacing: '-1px' }}>Une question ? On t'écoute.</h1>
          <p style={{ fontSize: '15px', color: '#9ca3af', margin: 0 }}>On répond sous 24h.</p>
        </div>

        {sent ? (
          <div style={{ background: '#f0fdf4', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '14px', padding: '40px', textAlign: 'center' }}>
            <CheckCircle size={44} color="#16a34a" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Message envoyé !</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>On te répond sous 24h.</div>
            <button onClick={() => setSent(false)} style={{ padding: '11px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
              Envoyer un autre message
            </button>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '36px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nom *</label>
                <input value={form.nom} onChange={e => setForm({...form, nom: e.target.value})} placeholder="Marie Dupont" style={INPUT}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Email *</label>
                <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="marie@email.com" type="email" style={INPUT}
                  onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              </div>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Sujet</label>
              <select value={form.sujet} onChange={e => setForm({...form, sujet: e.target.value})} style={{ ...INPUT, cursor: 'pointer' }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'}>
                <option value="">Choisir un sujet</option>
                <option>Question sur mon CV</option>
                <option>Problème technique</option>
                <option>Abonnement Pro</option>
                <option>Partenariat</option>
                <option>Autre</option>
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Message *</label>
              <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows={5} placeholder="Dis-nous comment on peut t'aider..."
                style={{ ...INPUT, resize: 'vertical', lineHeight: '1.6' }}
                onFocus={e => e.target.style.borderColor = '#4f46e5'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
            <button onClick={handleSubmit}
              style={{ width: '100%', padding: '14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(79,70,229,0.3)' }}>
              Envoyer le message
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
