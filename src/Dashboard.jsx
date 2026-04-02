import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import { CVTemplate } from './CVTemplates'
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
                    <div style={{fontSize:'10px', fontWeight:'700', marginBottom:'4px'}}>
                      {cv.cv_data.prenom} {cv.cv_data.nom}
                    </div>
                    <div style={{fontSize:'9px', color:'#666', marginBottom:'8px'}}>
                      {cv.cv_data.titre}
                    </div>
                    <div style={{fontSize:'8px', color:'#888'}}>
                      Template : {cv.template}
                    </div>
                  </div>
                </div>
                <div className="dashboard-card-info">
                  <div className="dashboard-card-date">
                    {new Date(cv.created_at).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="dashboard-card-actions">
                    <button
                      className="btn-view"
                      onClick={() => setSelectedCv(cv)}
                    >
                      👁 Voir
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(cv.id)}
                    >
                      🗑 Supprimer
                    </button>
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
              <span>CV du {new Date(selectedCv.created_at).toLocaleDateString('fr-FR')}</span>
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