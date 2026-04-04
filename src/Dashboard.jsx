import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
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
  const [profile, setProfile] = useState(null)
  const [selectedCv, setSelectedCv] = useState(null)
  const [showLettre, setShowLettre] = useState(false)
  const [editingLettre, setEditingLettre] = useState(false)
  const [lettreEditee, setLettreEditee] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setLettreEditee(editor.getHTML())
    },
  })

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data: cvData } = await supabase
          .from('cvs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setCvs(cvData || [])
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        setProfile(profileData)
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
    if (!confirm('Supprimer ce CV ?')) return
    await supabase.from('cvs').delete().eq('id', id)
    setCvs(cvs.filter(cv => cv.id !== id))
  }

  const handleDownloadCV = async (cv) => {
    setSelectedCv(cv)
    setShowLettre(false)
    setTimeout(async () => {
      const element = document.getElementById('cv-to-print')
      if (!element) return
      const canvas = await html2canvas(element, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', width: 794, height: 1123
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
      pdf.save(`CV-DidCV-${cv.cv_data.prenom}-${cv.cv_data.nom}.pdf`)
      setSelectedCv(null)
    }, 500)
  }

  const handleDownloadLettre = (cv) => {
    if (!cv.lettre_motivation) return
    const pdf = new jsPDF('p', 'mm', 'a4')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(12)
    const lignes = pdf.splitTextToSize(cv.lettre_motivation, 170)
    pdf.text(lignes, 20, 20)
    pdf.save(`Lettre-${cv.cv_data.prenom}-${cv.cv_data.nom}.pdf`)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'long', year: 'numeric'
    })
  }

  const templateColors = {
    finance: '#1a1a1a', linkedin: '#0a66c2', canva: '#f093fb',
    harvard: '#A51C30', siliconvalley: '#1d1d1f', moderne: '#0f6e56'
  }

  if (loading) return (
    <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:'12px'}}>
      <div style={{width:'40px', height:'40px', border:'3px solid #e5e7ef', borderTop:'3px solid #1a56db', borderRadius:'50%', animation:'spin 1s linear infinite'}}></div>
      <p style={{color:'#6b7280', fontSize:'14px'}}>Chargement...</p>
    </div>
  )

  return (
    <div className="dashboard-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
        <div className="nav-btns">
          <a href="/profile" className="btn-ghost">👤 Mon profil</a>
          <a href="/templates" className="btn-blue">+ Nouveau CV</a>
          <button className="btn-ghost" onClick={handleLogout}>Déconnexion</button>
        </div>
      </nav>

      <div className="dashboard-wrap">
        <div className="dashboard-hero">
          <div>
            <h2>Bonjour {profile?.prenom || user?.email?.split('@')[0]} 👋</h2>
            <p style={{color:'var(--muted)', fontSize:'15px', marginTop:'6px'}}>
              {cvs.length === 0 ? 'Génère ton premier CV optimisé par l\'IA !' : `Tu as ${cvs.length} CV généré${cvs.length > 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="dashboard-stats">
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-num">{cvs.length}</div>
              <div className="dashboard-stat-label">CV générés</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-num">{cvs.filter(cv => cv.lettre_motivation).length}</div>
              <div className="dashboard-stat-label">Lettres</div>
            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-num">{profile ? '✓' : '✗'}</div>
              <div className="dashboard-stat-label">Profil</div>
            </div>
          </div>
        </div>

        {!profile?.prenom && (
          <div className="dashboard-banner">
            <div>
              <div style={{fontWeight:'600', marginBottom:'4px'}}>📝 Complète ton profil</div>
              <div style={{fontSize:'13px', color:'var(--muted)'}}>Remplis ton profil pour générer des CV sans uploader ton PDF à chaque fois</div>
            </div>
            <a href="/profile" className="btn-blue" style={{whiteSpace:'nowrap'}}>Compléter →</a>
          </div>
        )}

        {cvs.length === 0 ? (
          <div className="dashboard-empty">
            <div style={{fontSize:'64px', marginBottom:'16px'}}>📄</div>
            <h3 style={{fontSize:'20px', fontWeight:'600', marginBottom:'8px'}}>Aucun CV généré</h3>
            <p style={{color:'var(--muted)', marginBottom:'24px'}}>Génère ton premier CV optimisé par l'IA en 30 secondes</p>
            <a href="/templates" className="btn-primary-lg">Générer mon premier CV →</a>
          </div>
        ) : (
          <>
            <div className="dashboard-section-title">Mes CV générés</div>
            <div className="dashboard-grid">
              {cvs.map((cv) => (
                <div key={cv.id} className="dashboard-card2">
                  <div
                    className="dashboard-card2-top"
                    style={{borderTop: `4px solid ${templateColors[cv.template] || '#1a56db'}`}}
                    onClick={() => { setSelectedCv(cv); setShowLettre(false) }}
                  >
                    <div className="dashboard-card2-avatar" style={{background: templateColors[cv.template] || '#1a56db'}}>
                      {cv.cv_data.prenom?.[0]}{cv.cv_data.nom?.[0]}
                    </div>
                    <div className="dashboard-card2-info">
                      <div className="dashboard-card2-name">{cv.cv_data.prenom} {cv.cv_data.nom}</div>
                      <div className="dashboard-card2-titre">{cv.cv_data.titre}</div>
                      {cv.offre_titre && <div className="dashboard-card2-offre">🎯 {cv.offre_titre}</div>}
                    </div>
                    <div className="dashboard-card2-template" style={{background: templateColors[cv.template] + '15', color: templateColors[cv.template] || '#1a56db'}}>
                      {cv.template}
                    </div>
                  </div>
                  <div className="dashboard-card2-bottom">
                    <div className="dashboard-card2-date">{formatDate(cv.created_at)}</div>
                    <div className="dashboard-card2-actions">
                      <button className="dash-btn dash-btn-primary" onClick={() => handleDownloadCV(cv)}>📥 CV</button>
                      {cv.lettre_motivation && (
                        <button className="dash-btn dash-btn-secondary" onClick={() => { setSelectedCv(cv); setShowLettre(true) }}>✉️ Lettre</button>
                      )}
                      <button className="dash-btn dash-btn-danger" onClick={() => handleDelete(cv.id)}>🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {selectedCv && (
        <div className="cv-modal" onClick={() => setSelectedCv(null)}>
          <div className="cv-modal-content" onClick={e => e.stopPropagation()}>
            <div className="cv-modal-header">
              <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                <button onClick={() => setShowLettre(false)} style={{padding:'6px 14px', borderRadius:'8px', border:'none', cursor:'pointer', background: !showLettre ? '#1a56db' : '#f0f0f0', color: !showLettre ? '#fff' : '#333', fontSize:'13px', fontWeight:'500'}}>
                  📄 CV
                </button>
                {selectedCv.lettre_motivation && (
                  <button onClick={() => setShowLettre(true)} style={{padding:'6px 14px', borderRadius:'8px', border:'none', cursor:'pointer', background: showLettre ? '#1a56db' : '#f0f0f0', color: showLettre ? '#fff' : '#333', fontSize:'13px', fontWeight:'500'}}>
                    ✉️ Lettre
                  </button>
                )}
              </div>
              <div style={{display:'flex', gap:'8px', alignItems:'center'}}>
                {!showLettre && <button className="btn-download" onClick={() => handleDownloadCV(selectedCv)}>📥 Télécharger CV</button>}
                {showLettre && <button className="btn-download" onClick={() => handleDownloadLettre(selectedCv)}>📥 Télécharger Lettre</button>}
                <button className="cv-modal-close" onClick={() => setSelectedCv(null)}>✕</button>
              </div>
            </div>
            <div className="cv-modal-body">
              {showLettre ? (
                <div style={{padding:'40px', maxWidth:'700px', margin:'0 auto', width:'100%'}}>
                  {editingLettre ? (
                    <div>
                      <div style={{border:'1px solid var(--border)', borderRadius:'8px', overflow:'hidden'}}>
                        <div style={{background:'var(--bg2)', padding:'8px 12px', borderBottom:'1px solid var(--border)', display:'flex', gap:'6px', flexWrap:'wrap', alignItems:'center'}}>
                          <button type="button" title="Gras" onClick={() => editor.chain().focus().toggleBold().run()} style={{padding:'4px 10px', borderRadius:'4px', border:'1px solid var(--border)', background: editor?.isActive('bold') ? '#e0e7ff' : '#fff', fontWeight:'700', cursor:'pointer', fontSize:'13px'}}>G</button>
                          <button type="button" title="Italique" onClick={() => editor.chain().focus().toggleItalic().run()} style={{padding:'4px 10px', borderRadius:'4px', border:'1px solid var(--border)', background: editor?.isActive('italic') ? '#e0e7ff' : '#fff', fontStyle:'italic', cursor:'pointer', fontSize:'13px'}}>I</button>
                          <button type="button" title="Souligné" onClick={() => editor.chain().focus().toggleUnderline().run()} style={{padding:'4px 10px', borderRadius:'4px', border:'1px solid var(--border)', background: editor?.isActive('underline') ? '#e0e7ff' : '#fff', textDecoration:'underline', cursor:'pointer', fontSize:'13px'}}>S</button>
                          <div style={{width:'1px', height:'24px', background:'var(--border)', margin:'0 4px'}}></div>
                          <button type="button" title="Aligner gauche" onClick={() => editor.chain().focus().setTextAlign('left').run()} style={{padding:'4px 10px', borderRadius:'4px', border:'1px solid var(--border)', background: editor?.isActive({textAlign:'left'}) ? '#e0e7ff' : '#fff', cursor:'pointer', fontSize:'12px'}}>≡</button>
                          <button type="button" title="Centrer" onClick={() => editor.chain().focus().setTextAlign('center').run()} style={{padding:'4px 10px', borderRadius:'4px', border:'1px solid var(--border)', background: editor?.isActive({textAlign:'center'}) ? '#e0e7ff' : '#fff', cursor:'pointer', fontSize:'12px'}}>≡</button>
                          <button type="button" title="Aligner droite" onClick={() => editor.chain().focus().setTextAlign('right').run()} style={{padding:'4px 10px', borderRadius:'4px', border:'1px solid var(--border)', background: editor?.isActive({textAlign:'right'}) ? '#e0e7ff' : '#fff', cursor:'pointer', fontSize:'12px'}}>≡</button>
                          <div style={{width:'1px', height:'24px', background:'var(--border)', margin:'0 4px'}}></div>
                          <button type="button" title="Titre" onClick={() => editor.chain().focus().toggleHeading({level:2}).run()} style={{padding:'4px 10px', borderRadius:'4px', border:'1px solid var(--border)', background: editor?.isActive('heading') ? '#e0e7ff' : '#fff', cursor:'pointer', fontSize:'13px', fontWeight:'600'}}>H</button>
                          <button type="button" title="Liste" onClick={() => editor.chain().focus().toggleBulletList().run()} style={{padding:'4px 10px', borderRadius:'4px', border:'1px solid var(--border)', background: editor?.isActive('bulletList') ? '#e0e7ff' : '#fff', cursor:'pointer', fontSize:'13px'}}>• Liste</button>
                          <div style={{width:'1px', height:'24px', background:'var(--border)', margin:'0 4px'}}></div>
                          <input type="color" title="Couleur" onChange={e => editor.chain().focus().setColor(e.target.value).run()} style={{width:'32px', height:'28px', padding:'2px', border:'1px solid var(--border)', borderRadius:'4px', cursor:'pointer'}} />
                        </div>
                        <EditorContent
                          editor={editor}
                          style={{minHeight:'350px', padding:'16px', fontFamily:'Georgia,serif', fontSize:'14px', lineHeight:'1.8', color:'#222'}}
                        />
                      </div>
                      <div style={{display:'flex', gap:'8px', marginTop:'12px'}}>
                        <button className="btn-generate" style={{width:'auto', padding:'10px 24px'}} onClick={async () => {
                          await supabase.from('cvs').update({ lettre_motivation: lettreEditee }).eq('id', selectedCv.id)
                          setCvs(cvs.map(cv => cv.id === selectedCv.id ? {...cv, lettre_motivation: lettreEditee} : cv))
                          setSelectedCv({...selectedCv, lettre_motivation: lettreEditee})
                          setEditingLettre(false)
                        }}>✅ Sauvegarder</button>
                        <button className="btn-ghost" onClick={() => setEditingLettre(false)}>Annuler</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{fontFamily:'Georgia,serif', fontSize:'14px', lineHeight:'1.8', color:'#222', whiteSpace:'pre-wrap', marginBottom:'16px'}}>
                        {selectedCv.lettre_motivation}
                      </div>
                      <button className="btn-ghost" onClick={() => {
                        setLettreEditee(selectedCv.lettre_motivation)
                        editor?.commands.setContent(selectedCv.lettre_motivation)
                        setEditingLettre(true)
                      }}>
                        ✏️ Modifier la lettre
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <CVTemplate cvData={selectedCv.cv_data} template={selectedCv.template} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard