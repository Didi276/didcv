import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { CVTemplate } from './CVTemplates'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import './App.css'

function Dashboard() {
  const [cvs, setCvs] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [selectedCv, setSelectedCv] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase
          .from('cvs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setCvs(data || [])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const handleDelete = async (id) => {
    await supabase.from('cvs').delete().eq('id', id)
    setCvs(cvs.filter(cv => cv.id !== id))
  }

  const handleDownload = async (cv) => {
    setSelectedCv(cv)
    setTimeout(async () => {
      const element = document.getElementById('cv-to-print')
      if (!element) return
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        height: 1123
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
      pdf.save(`CV-DidCV-${cv.cv_data.prenom}-${cv.cv_data.nom}.pdf`)
      setSelectedCv(null)
    }, 500)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="dashboard-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
        <div className="nav-btns">
          <a href="/templates" className="btn-ghost">+ Nouveau CV</a>
          <button className="btn-ghost" onClick={handleLogout}>Se déconnecter</button>
        </div>
      </nav>

      <div className="dashboard-wrap">
        <div className="dashboard-header">
          <h2>Mes CV <em>générés</em></h2>
          {user && <p className="dashboard-email">{user.email}</p>}
        </div>

        {loading ? (
          <div className="dashboard-empty">
            <div className="empty-icon">⏳</div>
            <p>Chargement...</p>
          </div>
        ) : cvs.length === 0 ? (
          <div className="dashboard-empty">
            <div className="empty-icon">📄</div>
            <p>Tu n'as pas encore généré de CV</p>
            <a href="/templates" className="btn-primary-lg" style={{marginTop:'16px'}}>
              Générer mon premier CV →
            </a>
          </div>
        ) : (
          <div className="dashboard-grid">
            {cvs.map((cv) => (
              <div key={cv.id} className="dashboard-card">
                <div className="dashboard-card-preview" onClick={() => setSelectedCv(cv)}>
                  <div className="cv-preview-mini">
                    <div style={{fontSize:'11px', fontWeight:'700', marginBottom:'4px'}}>
                      {cv.cv_data.prenom} {cv.cv_data.nom}
                    </div>
                    <div style={{fontSize:'10px', color:'#666', marginBottom:'8px'}}>
                      {cv.cv_data.titre}
                    </div>
                    <div style={{fontSize:'9px', color:'#888', background:'#f0f0f0', padding:'2px 8px', borderRadius:'10px', display:'inline-block'}}>
                      {cv.template}
                    </div>
                  </div>
                </div>
                <div className="dashboard-card-info">
                  <div className="dashboard-card-date">
                    {formatDate(cv.created_at)}
                  </div>
                  <div className="dashboard-card-actions">
                    <button className="btn-view" onClick={() => setSelectedCv(cv)}>👁 Voir</button>
                    <button className="btn-view" onClick={() => handleDownload(cv)}>📥 PDF</button>
                    <button className="btn-delete" onClick={() => handleDelete(cv.id)}>🗑</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCv && (
        <div className="cv-modal" onClick={() => setSelectedCv(null)}>
          <div className="cv-modal-content" onClick={e => e.stopPropagation()}>
            <div className="cv-modal-header">
              <span>{selectedCv.cv_data.prenom} {selectedCv.cv_data.nom} — {selectedCv.template}</span>
              <button className="cv-modal-close" onClick={() => setSelectedCv(null)}>✕</button>
            </div>
            <div className="cv-modal-body">
              <CVTemplate cvData={selectedCv.cv_data} template={selectedCv.template} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard