import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FileText, Search, Mail, Link as LinkIcon, Eye, ClipboardList, Mic, Trash2, Edit2, Download, Plus, Lightbulb } from 'lucide-react'
import { supabase } from './supabase'
import { CVTemplatePro } from './CVTemplatesPro'
import CVEditorBlocks from './CVEditorBlocks'
import Navbar from './Navbar'
import { downloadCVasPDF, downloadLettreasePDF } from './pdfUtils'

// SQL à exécuter dans Supabase :
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rappels_email BOOLEAN DEFAULT true;

const REGEX_ACCENTS = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g')

function slugify(str) {
  return str.toString().toLowerCase()
    .normalize('NFD').replace(REGEX_ACCENTS, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function construireTexteOffre(card) {
  return [card.titre, card.entreprise && `${card.entreprise}${card.lieu ? ' - ' + card.lieu : ''}`, card.salaire, '', card.notes].filter(Boolean).join('\n')
}

function etapesCandidature(card) {
  return [
    { label: 'CV généré', done: !!card.cv_id || card.statut !== 'a_postuler' },
    { label: 'Postulé', done: ['postule', 'entretien', 'offre', 'refuse'].includes(card.statut) },
    { label: 'Entretien', done: ['entretien', 'offre', 'refuse'].includes(card.statut) },
    { label: 'Décision', done: ['offre', 'refuse'].includes(card.statut) },
  ]
}

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
  const [partages, setPartages] = useState({})
  const [partageLoading, setPartageLoading] = useState(null)
  const [partageOuvert, setPartageOuvert] = useState(null)
  const [copie, setCopie] = useState(false)
  const [candidaturesCount, setCandidaturesCount] = useState(0)
  const [candidaturesRecentes, setCandidaturesRecentes] = useState([])
  const [rappelsEmail, setRappelsEmail] = useState(true)
  const [entretiensCompletes] = useState(() => parseInt(localStorage.getItem('didcv-entretiens-completes') || '0', 10))
  const [offresMatch, setOffresMatch] = useState([])
  const [loadingMatch, setLoadingMatch] = useState(true)
  const [userRole, setUserRole] = useState(null)
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
      if (profileData) setRappelsEmail(profileData.rappels_email !== false)
      setUserRole(profileData?.role || 'user')
      const { data: partagesData } = await supabase.from('cv_partages').select('*').eq('user_id', user.id)
      if (partagesData) {
        const map = {}
        partagesData.forEach(p => { map[p.cv_id] = p })
        setPartages(map)
      }
      const { count: nbCandidatures } = await supabase.from('candidatures').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      setCandidaturesCount(nbCandidatures || 0)
      const { data: recentes } = await supabase.from('candidatures').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3)
      setCandidaturesRecentes(recentes || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetch(`/api/match?user_id=${user.id}`)
        .then(r => r.json())
        .then(data => {
          setOffresMatch(data.offres || [])
          setLoadingMatch(false)
        })
        .catch(() => setLoadingMatch(false))
    }
  }, [user])

  const handleToggleRappels = async () => {
    const next = !rappelsEmail
    setRappelsEmail(next)
    await supabase.from('profiles').upsert({ user_id: user.id, rappels_email: next }, { onConflict: 'user_id' })
  }

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

  const handlePartager = async (cv, e) => {
    e.stopPropagation()
    const existant = partages[cv.id]
    if (existant) { setPartageOuvert(existant); return }

    setPartageLoading(cv.id)
    const base = slugify(`${cv.cv_data.prenom}-${cv.cv_data.nom}`) || 'cv'
    let cree = null
    for (let tentative = 0; tentative < 5 && !cree; tentative++) {
      const suffixe = Math.floor(1000 + Math.random() * 9000)
      const slug = `${base}-${suffixe}`
      const { data, error } = await supabase.from('cv_partages')
        .insert({ cv_id: cv.id, user_id: user.id, slug })
        .select()
        .single()
      if (!error) cree = data
    }
    setPartageLoading(null)
    if (cree) {
      setPartages(p => ({ ...p, [cv.id]: cree }))
      setPartageOuvert(cree)
    } else {
      alert('Impossible de créer le lien de partage pour le moment.')
    }
  }

  const copierLien = () => {
    if (!partageOuvert) return
    navigator.clipboard.writeText(`${window.location.origin}/cv/${partageOuvert.slug}`)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  const allerVersCV = (card) => {
    if (card.cv_id) {
      const cv = cvs.find(c => c.id === card.cv_id)
      if (cv) { setSelectedCv(cv); setShowLettre(false); return }
    }
    sessionStorage.setItem('offre_prefill', JSON.stringify({
      titre: card.titre || '', entreprise: card.entreprise || '', url: card.url_offre || '',
      texte: construireTexteOffre(card),
    }))
    window.location.href = '/generate?template=auto'
  }

  const allerVersCandidatures = () => { window.location.href = '/candidatures' }

  const allerVersEntretien = (card) => {
    sessionStorage.setItem('entretien_candidature_id', card.id)
    sessionStorage.setItem('entretien_poste', card.titre || '')
    sessionStorage.setItem('entretien_entreprise', card.entreprise || '')
    if (card.url_offre) sessionStorage.setItem('entretien_url', card.url_offre)
    sessionStorage.setItem('entretien_mode', card.statut === 'entretien' ? 'preparation' : 'entrainement')
    window.location.href = '/entretien'
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
                Bonjour {prenom}
              </h1>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                {cvs.length === 0 ? "Crée ton premier CV optimisé par l'IA" : `${cvs.length} CV généré${cvs.length > 1 ? 's' : ''}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleToggleRappels} title="Recevoir des rappels automatiques avant tes entretiens"
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 14px', borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', background: '#fff', color: rappelsEmail ? '#16a34a' : '#9ca3af', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                <Mail size={13} />
                {!isMobile && 'Rappels email'}
                <span style={{ width: '28px', height: '16px', borderRadius: '10px', background: rappelsEmail ? '#16a34a' : '#e5e7eb', position: 'relative', flexShrink: 0, transition: 'background 0.15s' }}>
                  <span style={{ position: 'absolute', top: '2px', left: rappelsEmail ? '14px' : '2px', width: '12px', height: '12px', borderRadius: '50%', background: '#fff', transition: 'left 0.15s' }} />
                </span>
              </button>
              {!isMobile && <a href="/offres" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', borderRadius: '12px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', background: '#fff', color: '#374151', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}><Search size={15} /> Offres</a>}
              <a href="/templates" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '12px', background: '#4f46e5', color: '#fff', textDecoration: 'none', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
                <Plus size={15} /> {isMobile ? 'CV' : 'Nouveau CV'}
              </a>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : w < 1024 ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: isMobile ? '10px' : '16px', marginTop: '20px' }}>
            {[
              { label: 'CV générés', value: cvs.length, icon: FileText, color: '#4f46e5' },
              { label: 'Lettres', value: cvs.filter(c => c.lettre_motivation).length, icon: Mail, color: '#0d9488' },
              { label: 'CV partagés', value: Object.values(partages).filter(p => p.actif).length, icon: LinkIcon, color: '#7c3aed' },
              { label: 'Vues totales', value: Object.values(partages).reduce((somme, p) => somme + (p.vues || 0), 0), icon: Eye, color: '#0891b2' },
              { label: 'Candidatures', value: candidaturesCount, icon: ClipboardList, color: '#c2410c' },
              { label: 'Entretiens', value: entretiensCompletes, icon: Mic, color: '#16a34a' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: isMobile ? '10px 14px' : '14px 16px', background: '#fff', borderRadius: '10px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <s.icon size={18} color={s.color} strokeWidth={1.75} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mes candidatures en cours */}
      {candidaturesRecentes.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '24px auto 0', padding: `0 ${isMobile ? '16px' : '40px'}` }}>
          <div style={{ background: '#fff', borderRadius: '14px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: isMobile ? '16px' : '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>Mes candidatures en cours</div>
              <a href="/candidatures" style={{ fontSize: '12px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>Voir tout →</a>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {candidaturesRecentes.map(card => {
                const etapes = etapesCandidature(card)
                const actions = [() => allerVersCV(card), allerVersCandidatures, () => allerVersEntretien(card), allerVersCandidatures]
                return (
                  <div key={card.id}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111', marginBottom: '10px' }}>
                      {card.titre}{card.entreprise && <span style={{ color: '#9ca3af', fontWeight: '400' }}> · {card.entreprise}</span>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      {etapes.map((etape, i) => (
                        <div key={etape.label} style={{ display: 'flex', alignItems: 'center', flex: i < etapes.length - 1 ? 1 : 'none' }}>
                          <button onClick={actions[i]}
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}>
                            <div style={{
                              width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                              background: etape.done ? '#4f46e5' : '#f3f4f6', color: etape.done ? '#fff' : '#9ca3af',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700',
                              border: etape.done ? 'none' : '1.5px solid #e5e7eb',
                            }}>
                              {etape.done ? '✓' : i + 1}
                            </div>
                            <div style={{ fontSize: isMobile ? '9px' : '10px', color: etape.done ? '#4f46e5' : '#9ca3af', fontWeight: etape.done ? '700' : '500', whiteSpace: 'nowrap' }}>
                              {etape.label}
                            </div>
                          </button>
                          {i < etapes.length - 1 && (
                            <div style={{ flex: 1, height: '2px', background: etapes[i + 1].done ? '#4f46e5' : '#e5e7eb', margin: '0 4px', marginBottom: '17px' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bandeau profil */}
      {!profile?.prenom && (
        <div style={{ maxWidth: '1200px', margin: '24px auto 0', padding: `0 ${isMobile ? '16px' : '40px'}` }}>
          <div style={{ background: '#fffbeb', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '13px', color: '#92400e', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lightbulb size={16} /> Complete ton profil pour générer des CV plus vite
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
            <FileText size={44} color="#c4c4c4" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 10px' }}>Aucun CV pour l'instant</h3>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 24px' }}>Génère ton premier CV en 30 secondes</p>
            <a href="/templates" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#4f46e5', color: '#fff', borderRadius: '12px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
              <Plus size={16} /> Générer mon premier CV
            </a>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: isMobile ? '12px' : '20px' }}>
            {cvs.map(cv => (
              <div key={cv.id} onClick={() => { setSelectedCv(cv); setShowLettre(false) }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = selectedCv?.id === cv.id ? '0 0 0 2px #4f46e5, 0 8px 20px rgba(0,0,0,0.1)' : '0 8px 20px rgba(0,0,0,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = selectedCv?.id === cv.id ? '0 0 0 2px #4f46e5, 0 2px 12px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.06)' }}
                style={{ background: '#fff', borderRadius: '14px', border: 'none', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: selectedCv?.id === cv.id ? '0 0 0 2px #4f46e5, 0 2px 12px rgba(0,0,0,0.06)' : '0 2px 12px rgba(0,0,0,0.06)' }}>
                {/* Apercu */}
                <div style={{ width: '100%', height: isMobile ? '120px' : '180px', overflow: 'hidden', position: 'relative', background: '#f8f9ff' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '794px', height: '1123px', transform: `scale(${previewScale})`, transformOrigin: 'top left', pointerEvents: 'none', userSelect: 'none' }}>
                    <CVTemplatePro cvData={cv.cv_data} template={cv.template} />
                  </div>
                  <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '1px 6px', borderRadius: '5px', fontSize: '9px', fontWeight: '600' }}>{cv.template}</div>
                  {partages[cv.id]?.actif && (
                    <div style={{ position: 'absolute', top: '6px', left: '6px', background: 'rgba(79,70,229,0.9)', color: '#fff', padding: '1px 7px', borderRadius: '5px', fontSize: '9px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Eye size={10} /> {partages[cv.id].vues} vue{partages[cv.id].vues !== 1 ? 's' : ''}
                    </div>
                  )}
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
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flex: 1, padding: isMobile ? '6px 4px' : '7px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '9px', fontSize: isMobile ? '10px' : '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', minWidth: 0 }}>
                      {downloading === cv.id ? '...' : <><Download size={12} /> PDF</>}
                    </button>
                    <button onClick={(e) => handleEdit(cv, e)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', flex: 1, padding: isMobile ? '6px 4px' : '7px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '9px', fontSize: isMobile ? '10px' : '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', minWidth: 0 }}>
                      <Edit2 size={12} /> {!isMobile && 'Modifier'}
                    </button>
                    <button onClick={(e) => handleDelete(cv.id, e)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '6px 7px' : '7px 9px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '9px', fontSize: isMobile ? '10px' : '11px', cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <button onClick={(e) => handlePartager(cv, e)} disabled={partageLoading === cv.id}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', width: '100%', marginTop: '5px', padding: isMobile ? '6px 4px' : '7px', background: partages[cv.id] ? '#f0fdf4' : '#eef2ff', color: partages[cv.id] ? '#16a34a' : '#4f46e5', border: 'none', borderRadius: '9px', fontSize: isMobile ? '10px' : '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {partageLoading === cv.id ? '...' : <><LinkIcon size={12} /> {partages[cv.id] ? 'Voir le lien' : 'Partager'}</>}
                  </button>
                </div>
              </div>
            ))}

            {/* Carte nouveau */}
            <a href="/templates" style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: '14px', border: '2px dashed #e5e7eb', cursor: 'pointer', height: isMobile ? '200px' : '100%', minHeight: isMobile ? '200px' : '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s, background 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#faf9ff'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus size={20} color="#4f46e5" /></div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Nouveau CV</div>
              </div>
            </a>
          </div>
        )}

        <div style={{ marginTop: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f0f1a', marginBottom: '20px' }}>
            Offres pour toi
          </h2>

          {loadingMatch ? (
            <p style={{ color: '#9ca3af' }}>Analyse en cours...</p>
          ) : offresMatch.length === 0 ? (
            <p style={{ color: '#9ca3af' }}>
              Aucune offre disponible pour le moment.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {offresMatch.map((offre, i) => (
                <div key={i} style={{
                  background: '#ffffff', border: '1px solid #f0f0f0',
                  borderRadius: '10px', padding: '18px 20px',
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', cursor: 'pointer'
                }}
                onClick={() => window.open(offre.url_candidature, '_blank')}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f0f1a' }}>
                      {offre.titre}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '3px' }}>
                      {offre.entreprise} · {offre.lieu}
                    </div>
                    {offre.raison && (
                      <div style={{
                        fontSize: '12px', color: '#6366f1', marginTop: '6px',
                        fontStyle: 'italic'
                      }}>
                        {offre.raison}
                      </div>
                    )}
                  </div>
                  {offre.score != null && (
                    <div style={{
                      background: offre.score >= 80 ? '#dcfce7' : '#f0f9ff',
                      color: offre.score >= 80 ? '#166534' : '#1d4ed8',
                      padding: '4px 10px', borderRadius: '20px',
                      fontSize: '12px', fontWeight: 700, flexShrink: 0,
                      marginLeft: '16px'
                    }}>
                      {offre.score}%
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal apercu */}
      {selectedCv && !showEditor && (
        <div onClick={() => setSelectedCv(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', padding: isMobile ? '0' : '24px' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : '16px', width: '100%', maxWidth: isMobile ? '100%' : '860px', maxHeight: isMobile ? '90vh' : '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header modal */}
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setShowLettre(false)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: !showLettre ? '#4f46e5' : '#f3f4f6', color: !showLettre ? '#fff' : '#374151' }}><FileText size={13} /> CV</button>
                {selectedCv.lettre_motivation && <button onClick={() => setShowLettre(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: showLettre ? '#4f46e5' : '#f3f4f6', color: showLettre ? '#fff' : '#374151' }}><Mail size={13} /> Lettre</button>}
              </div>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                {!showLettre && <button onClick={(e) => handleEdit(selectedCv, e)} style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}><Edit2 size={13} /></button>}
                <button onClick={() => handleDownloadCV(selectedCv)} style={{ display: 'flex', alignItems: 'center', padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}><Download size={13} /></button>
                <button onClick={() => setSelectedCv(null)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
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
                  <CVTemplatePro cvData={selectedCv.cv_data} template={selectedCv.template} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showEditor && cvToEdit && (
        <CVEditorBlocks cvData={cvToEdit.cv_data} template={cvToEdit.template} onSave={handleSaveEdit} onClose={() => { setShowEditor(false); setCvToEdit(null) }} />
      )}

      {/* Modal lien de partage */}
      {partageOuvert && (
        <div onClick={() => setPartageOuvert(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#111', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}><LinkIcon size={17} /> Lien de partage</div>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 16px', lineHeight: '1.6' }}>
              Toute personne avec ce lien peut voir ce CV. Chaque visite est comptabilisée
              {partageOuvert.vues > 0 && <> avec déjà <strong>{partageOuvert.vues} vue{partageOuvert.vues !== 1 ? 's' : ''}</strong> pour l'instant</>}.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input readOnly value={`${window.location.origin}/cv/${partageOuvert.slug}`} onFocus={e => e.target.select()}
                style={{ flex: 1, padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', color: '#374151', fontFamily: 'inherit', minWidth: 0 }} />
              <button onClick={copierLien}
                style={{ padding: '10px 16px', background: copie ? '#16a34a' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, boxShadow: copie ? 'none' : '0 4px 12px rgba(79,70,229,0.3)' }}>
                {copie ? '✓ Copié' : 'Copier'}
              </button>
            </div>
            <button onClick={() => setPartageOuvert(null)}
              style={{ width: '100%', padding: '11px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {(!userRole || userRole === 'user') && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: `0 ${isMobile ? '16px' : '40px'} ${isMobile ? '40px' : '60px'}` }}>
          <div style={{
            background: '#0a0a0f',
            borderRadius: '16px',
            padding: '40px',
            marginTop: '48px',
            textAlign: 'center',
          }}>
            <h2 style={{
              color: '#ffffff',
              fontSize: '24px',
              fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif',
              fontWeight: '700',
              marginBottom: '12px',
            }}>
              Vous recrutez ?
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '15px',
              marginBottom: '24px',
              lineHeight: '1.7',
            }}>
              Accédez à notre base de candidats qualifiés
              et publiez vos offres directement sur DidJob.
              Gratuit pendant la phase de lancement.
            </p>
            <Link to="/recruteur/inscription" style={{
              display: 'inline-block',
              background: '#6366f1',
              color: '#ffffff',
              padding: '14px 28px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '15px',
            }}>
              Demander l'accès recruteur →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
