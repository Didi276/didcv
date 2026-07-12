import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { CVTemplate } from './CVTemplates'
import CVEditorBlocks from './CVEditorBlocks'
import Navbar from './Navbar'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function Dashboard() {
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [selectedCv, setSelectedCv] = useState(null)
  const [showLettre, setShowLettre] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [cvToEdit, setCvToEdit] = useState(null)
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
      const { data: cvData } = await supabase
        .from('cvs').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setCvs(cvData || [])
      const { data: profileData } = await supabase
        .from('profiles').select('*').eq('user_id', user.id).single()
      setProfile(profileData)
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

  const handleDownloadCV = async (cv, e) => {
    e?.stopPropagation()
    setDownloading(cv.id)
    setSelectedCv(cv)
    setShowLettre(false)
    setTimeout(async () => {
      const element = document.getElementById('cv-to-print')
      if (!element) { setDownloading(null); return }
      const canvas = await html2canvas(element, {
        scale: 4, useCORS: true, backgroundColor: '#ffffff',
        width: 794, height: 1123, logging: false
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4', true)
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST')
      pdf.save(`CV-${cv.cv_data.prenom}-${cv.cv_data.nom}.pdf`)
      setDownloading(null)
    }, 600)
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
    return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const prenom = profile?.prenom || user?.email?.split('@')[0] || ''

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #ede9fe', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#9ca3af', fontSize: '14px' }}>Chargement...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="dashboard" />

      {/* ─── HEADER ─────────────────────────────────────────── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
            <div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>
                Bonjour {prenom} 👋
              </h1>
              <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
                {cvs.length === 0 ? "Crée ton premier CV optimisé par l'IA" : `${cvs.length} CV généré${cvs.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="/offres" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '9px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                🔍 Offres
              </a>
              <a href="/templates" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 20px', borderRadius: '9px', background: '#4f46e5', color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                + Nouveau CV
              </a>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '24px', marginTop: '28px' }}>
            {[
              { label: 'CV générés', value: cvs.length, icon: '📄', color: '#4f46e5' },
              { label: 'Lettres', value: cvs.filter(c => c.lettre_motivation).length, icon: '✉️', color: '#0d9488' },
              { label: 'Profil', value: profile?.prenom ? 'Complété' : 'Incomplet', icon: '👤', color: profile?.prenom ? '#16a34a' : '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #ede9fe', minWidth: '140px' }}>
                <span style={{ fontSize: '20px' }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: s.color, lineHeight: 1, letterSpacing: '-0.5px' }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── BANDEAU PROFIL ──────────────────────────────────── */}
      {!profile?.prenom && (
        <div style={{ maxWidth: '1200px', margin: '20px auto 0', padding: '0 40px' }}>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>💡</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>Complete ton profil pour gagner du temps</div>
                <div style={{ fontSize: '12px', color: '#b45309', marginTop: '1px' }}>Génère des CV sans uploader ton PDF à chaque fois</div>
              </div>
            </div>
            <a href="/profile" style={{ padding: '8px 18px', background: '#f59e0b', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              Compléter mon profil
            </a>
          </div>
        </div>
      )}

      {/* ─── GRILLE CV ───────────────────────────────────────── */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 40px 60px' }}>
        {cvs.length === 0 ? (
          // État vide
          <div style={{ textAlign: 'center', padding: '80px 40px', background: '#fff', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
            <div style={{ fontSize: '56px', marginBottom: '20px' }}>📄</div>
            <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#111', margin: '0 0 10px', letterSpacing: '-0.3px' }}>Aucun CV pour l'instant</h3>
            <p style={{ fontSize: '15px', color: '#9ca3af', margin: '0 0 28px', lineHeight: '1.6' }}>
              Génère ton premier CV optimisé par l'IA en 30 secondes.<br />Choisis un template et colle une offre d'emploi.
            </p>
            <a href="/templates" style={{ display: 'inline-block', padding: '14px 28px', background: '#4f46e5', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '700', letterSpacing: '-0.2px' }}>
              Générer mon premier CV →
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {cvs.map(cv => (
              <div key={cv.id} onClick={() => { setSelectedCv(cv); setShowLettre(false) }}
                style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: selectedCv?.id === cv.id ? '0 0 0 2px #4f46e5' : '0 1px 4px rgba(0,0,0,0.04)' }}
                onMouseEnter={e => { if (selectedCv?.id !== cv.id) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)' } }}
                onMouseLeave={e => { if (selectedCv?.id !== cv.id) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)' } }}
              >
                {/* Aperçu miniature */}
                <div style={{ width: '100%', height: '180px', overflow: 'hidden', position: 'relative', background: '#f8f9ff' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '794px', height: '1123px', transform: 'scale(0.305)', transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                    <CVTemplate cvData={cv.cv_data} template={cv.template} />
                  </div>
                  {/* Overlay hover */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(79,70,229,0)', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,70,229,0.06)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,70,229,0)'}
                  />
                  {/* Template badge */}
                  <div style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.55)', color: '#fff', padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: '600', backdropFilter: 'blur(4px)' }}>
                    {cv.template}
                  </div>
                </div>

                {/* Infos */}
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: '700', fontSize: '14px', color: '#111', marginBottom: '2px' }}>
                    {cv.cv_data.prenom} {cv.cv_data.nom}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '2px' }}>{cv.cv_data.titre}</div>
                  {cv.offre_titre && (
                    <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      🎯 {cv.offre_titre}
                    </div>
                  )}
                  <div style={{ fontSize: '11px', color: '#c4c4c4', marginBottom: '12px' }}>{formatDate(cv.created_at)}</div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={(e) => handleDownloadCV(cv, e)}
                      style={{ flex: 1, padding: '7px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {downloading === cv.id ? '...' : '📥 PDF'}
                    </button>
                    <button onClick={(e) => handleEdit(cv, e)}
                      style={{ flex: 1, padding: '7px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      ✏️ Modifier
                    </button>
                    {cv.lettre_motivation && (
                      <button onClick={(e) => { e.stopPropagation(); setSelectedCv(cv); setShowLettre(true) }}
                        style={{ padding: '7px 9px', background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                        ✉️
                      </button>
                    )}
                    <button onClick={(e) => handleDelete(cv.id, e)}
                      style={{ padding: '7px 9px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Carte "Nouveau CV" */}
            <a href="/templates" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: '14px', border: '2px dashed #e5e7eb', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s', height: '100%', minHeight: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#faf9ff' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>+</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280' }}>Nouveau CV</div>
              </div>
            </a>
          </div>
        )}
      </div>

      {/* ─── MODAL APERÇU ────────────────────────────────────── */}
      {selectedCv && !showEditor && (
        <div onClick={() => setSelectedCv(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: '24px' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '860px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}>

            {/* Header modal */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowLettre(false)}
                  style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: !showLettre ? '#4f46e5' : '#f3f4f6', color: !showLettre ? '#fff' : '#374151' }}>
                  📄 CV
                </button>
                {selectedCv.lettre_motivation && (
                  <button onClick={() => setShowLettre(true)}
                    style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: showLettre ? '#4f46e5' : '#f3f4f6', color: showLettre ? '#fff' : '#374151' }}>
                    ✉️ Lettre
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {!showLettre && (
                  <button onClick={(e) => handleEdit(selectedCv, e)}
                    style={{ padding: '7px 14px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                    ✏️ Modifier
                  </button>
                )}
                <button onClick={() => handleDownloadCV(selectedCv)}
                  style={{ padding: '7px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  📥 Télécharger
                </button>
                <button onClick={() => setSelectedCv(null)}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  ✕
                </button>
              </div>
            </div>

            {/* Contenu modal */}
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', justifyContent: 'center', padding: '24px', background: '#f8f9ff' }}>
              {showLettre ? (
                <div style={{ background: '#fff', borderRadius: '12px', padding: '40px', maxWidth: '680px', width: '100%', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontFamily: 'Georgia,serif', fontSize: '13px', lineHeight: '1.9', color: '#222', whiteSpace: 'pre-wrap' }}>
                    {selectedCv.lettre_motivation}
                  </div>
                </div>
              ) : (
                <div style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                  <CVTemplate cvData={selectedCv.cv_data} template={selectedCv.template} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── ÉDITEUR ─────────────────────────────────────────── */}
      {showEditor && cvToEdit && (
        <CVEditorBlocks
          cvData={cvToEdit.cv_data}
          template={cvToEdit.template}
          onSave={handleSaveEdit}
          onClose={() => { setShowEditor(false); setCvToEdit(null) }}
        />
      )}
    </div>
  )
}

export default Dashboard