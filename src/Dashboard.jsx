import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { CVTemplate } from './CVTemplates'
import CVEditorBlocks from './CVEditorBlocks'
import Navbar from './Navbar'
import { downloadCVasPDF, downloadLettreasePDF } from './pdfUtils'

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

export default function Dashboard() {
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [selectedCv, setSelectedCv] = useState(null)
  const [showLettre, setShowLettre] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [cvToEdit, setCvToEdit] = useState(null)
  const [downloading, setDownloading] = useState(null)
  const w = useWidth()
  const isMobile = w < 768

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
      const { data: cvData } = await supabase.from('cvs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setCvs(cvData || [])
      const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
      if (profileData?.prenom) setProfile(profileData)
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Supprimer ce CV ?')) return
    await supabase.from('cvs').delete().eq('id', id)
    setCvs(cvs.filter(cv => cv.id !== id))
    if (selectedCv?.id === id) setSelectedCv(null)
  }

  const handleDownloadCV = (cv, e) => {
    e?.stopPropagation()
    setDownloading(cv.id)
    setSelectedCv(cv)
    setShowLettre(false)
    setTimeout(() => {
      const element = document.getElementById('cv-to-print')
      if (!element) { setDownloading(null); return }
      downloadCVasPDF(element, cv.cv_data.prenom, cv.cv_data.nom)
      setDownloading(null)
    }, 400)
  }

  const handleEdit = (cv, e) => {
    e?.stopPropagation()
    setCvToEdit(cv)
    setShowEditor(true)
    setSelectedCv(null)
  }

  const handleSaveEdit = async (cvDataModifie) => {
    if (!cvToEdit) return
    await supabase.from('cvs').update({ cv_data: cvDataModifie }).eq('id', cvToEdit.id)
    setCvs(cvs.map(cv => cv.id === cvToEdit.id ? { ...cv, cv_data: cvDataModifie } : cv))
    setShowEditor(false)
    setCvToEdit(null)
  }

  const formatDate = (d) => {
    if (!d) return ''
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const prenom = profile?.prenom || user?.email?.split('@')[0] || ''

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #ede9fe', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  // Scale pour apercu mobile
  const previewScale = isMobile ? Math.min(0.28, (w - 32) / 794) : 0.305
  const previewH = Math.round(1123 * previewScale)

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="dashboard" />

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                Bonjour {prenom} 👋
              </h1>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                {cvs.length === 0 ? "Crée ton premier CV optimisé par l'IA" : `${cvs.length} CV généré${cvs.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {!isMobile && <a href="/offres" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '9px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}>🔍 Offres</a>}
              <a href="/templates" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '9px', background: '#4f46e5', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>
                {isMobile ? '+ CV' : '+ Nouveau CV'}
              </a>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: isMobile ? '10px' : '20px', marginTop: '20px', flexWrap: 'wrap' }}>
            {[
              { label: 'CV générés', value: cvs.length, icon: '📄', color: '#4f46e5' },
              { label: 'Lettres', value: cvs.filter(c => c.lettre_motivation).length, icon: '✉️', color: '#0d9488' },
              { label: 'Profil', value: profile?.prenom ? 'OK' : 'Incomplet', icon: '👤', color: profile?.prenom ? '#16a34a' : '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isMobile ? '10px 14px' : '14px 20px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #ede9fe', flex: isMobile ? 1 : 'none' }}>
                <span style={{ fontSize: '18px' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bandeau profil */}
      {!profile?.prenom && (
        <div style={{ maxWidth: '1200px', margin: '16px auto 0', padding: `0 ${isMobile ? '16px' : '40px'}` }}>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '500' }}>
              💡 Complete ton profil pour générer des CV plus vite
            </div>
            <a href="/profile" style={{ padding: '7px 14px', background: '#f59e0b', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
              Compléter
            </a>
          </div>
        </div>
      )}

      {/* Grille */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '20px 16px 80px' : '28px 40px 60px' }}>
        {cvs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: isMobile ? '48px 24px' : '80px 40px', background: '#fff', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 10px' }}>Aucun CV pour l'instant</h3>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 24px' }}>Génère ton premier CV en 30 secondes</p>
            <a href="/templates" style={{ display: 'inline-block', padding: '12px 24px', background: '#4f46e5', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
              Générer mon premier CV →
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: isMobile ? '12px' : '20px' }}>
            {cvs.map(cv => (
              <div key={cv.id} onClick={() => { setSelectedCv(cv); setShowLettre(false) }}
                style={{ background: '#fff', borderRadius: '14px', border: `2px solid ${selectedCv?.id === cv.id ? '#4f46e5' : '#e5e7eb'}`, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                {/* Apercu */}
                <div style={{ width: '100%', height: isMobile ? '120px' : '180px', overflow: 'hidden', position: 'relative', background: '#f8f9ff' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '794px', height: '1123px', transform: `scale(${previewScale})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                    <CVTemplate cvData={cv.cv_data} template={cv.template} />
                  </div>
                  <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '1px 6px', borderRadius: '5px', fontSize: '9px', fontWeight: '600' }}>{cv.template}</div>
                </div>

                {/* Infos */}
                <div style={{ padding: isMobile ? '10px' : '14px 16px' }}>
                  <div style={{ fontWeight: '700', fontSize: isMobile ? '12px' : '14px', color: '#111', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cv.cv_data.prenom} {cv.cv_data.nom}
                  </div>
                  {!isMobile && <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{cv.cv_data.titre}</div>}
                  <div style={{ fontSize: '10px', color: '#c4c4c4', marginBottom: isMobile ? '8px' : '12px' }}>{formatDate(cv.created_at)}</div>

                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button onClick={(e) => handleDownloadCV(cv, e)}
                      style={{ flex: 1, padding: isMobile ? '6px 4px' : '7px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '7px', fontSize: isMobile ? '10px' : '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', minWidth: 0 }}>
                      {downloading === cv.id ? '...' : '📥 PDF'}
                    </button>
                    <button onClick={(e) => handleEdit(cv, e)}
                      style={{ flex: 1, padding: isMobile ? '6px 4px' : '7px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '7px', fontSize: isMobile ? '10px' : '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', minWidth: 0 }}>
                      ✏️ {!isMobile && 'Modifier'}
                    </button>
                    <button onClick={(e) => handleDelete(cv.id, e)}
                      style={{ padding: isMobile ? '6px 7px' : '7px 9px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: isMobile ? '10px' : '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Carte nouveau */}
            <a href="/templates" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: '14px', border: '2px dashed #e5e7eb', cursor: 'pointer', height: isMobile ? '200px' : '100%', minHeight: isMobile ? '200px' : '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#faf9ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>+</div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Nouveau CV</div>
              </div>
            </a>
          </div>
        )}
      </div>

      {/* Modal apercu */}
      {selectedCv && !showEditor && (
        <div onClick={() => setSelectedCv(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: isMobile ? '0' : '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : '16px', width: '100%', maxWidth: isMobile ? '100%' : '860px', maxHeight: isMobile ? '90vh' : '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header modal */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setShowLettre(false)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: !showLettre ? '#4f46e5' : '#f3f4f6', color: !showLettre ? '#fff' : '#374151' }}>📄 CV</button>
                {selectedCv.lettre_motivation && <button onClick={() => setShowLettre(true)} style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: showLettre ? '#4f46e5' : '#f3f4f6', color: showLettre ? '#fff' : '#374151' }}>✉️ Lettre</button>}
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {!showLettre && <button onClick={(e) => handleEdit(selectedCv, e)} style={{ padding: '6px 12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>✏️</button>}
                <button onClick={() => handleDownloadCV(selectedCv)} style={{ padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>📥</button>
                <button onClick={() => setSelectedCv(null)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            </div>
            {/* Contenu */}
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', justifyContent: 'center', padding: '20px 16px', background: '#f8f9ff' }}>
              {showLettre ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '680px', width: '100%' }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: '13px', lineHeight: '1.9', color: '#222', whiteSpace: 'pre-wrap' }}>{selectedCv.lettre_motivation}</div>
                </div>
              ) : (
                <div style={{ transform: isMobile ? `scale(${Math.min(0.45, (w - 32) / 794)})` : 'scale(1)', transformOrigin: 'top center', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', borderRadius: '4px', overflow: 'hidden', height: isMobile ? `${Math.round(1123 * Math.min(0.45, (w - 32) / 794))}px` : 'auto' }}>
                  <CVTemplate cvData={selectedCv.cv_data} template={selectedCv.template} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditor && cvToEdit && (
        <CVEditorBlocks cvData={cvToEdit.cv_data} template={cvToEdit.template} onSave={handleSaveEdit} onClose={() => { setShowEditor(false); setCvToEdit(null) }} />
      )}
    </div>
  )
}