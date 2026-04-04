import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './App.css'

function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    prenom: '', nom: '', email: '', telephone: '', ville: '', linkedin: '', titre: '', accroche: '',
    experiences: [], formations: [], competences: [], langues: [], certifications: []
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
        if (data) setProfile(data)
        else setProfile(p => ({ ...p, email: user.email }))
      }
      setLoading(false)
    }
    fetchProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const { data: existing } = await supabase.from('profiles').select('id').eq('user_id', user.id).single()
    if (existing) {
      await supabase.from('profiles').update({ ...profile, updated_at: new Date() }).eq('user_id', user.id)
    } else {
      await supabase.from('profiles').insert({ ...profile, user_id: user.id })
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addExperience = () => {
    setProfile(p => ({ ...p, experiences: [...p.experiences, { poste: '', entreprise: '', periode: '', lieu: '', missions: ['', '', ''] }] }))
  }

  const updateExperience = (index, field, value) => {
    const exps = [...profile.experiences]
    exps[index] = { ...exps[index], [field]: value }
    setProfile(p => ({ ...p, experiences: exps }))
  }

  const updateMission = (expIndex, missionIndex, value) => {
    const exps = [...profile.experiences]
    exps[expIndex].missions[missionIndex] = value
    setProfile(p => ({ ...p, experiences: exps }))
  }

  const removeExperience = (index) => {
    setProfile(p => ({ ...p, experiences: p.experiences.filter((_, i) => i !== index) }))
  }

  const addFormation = () => {
    setProfile(p => ({ ...p, formations: [...p.formations, { diplome: '', etablissement: '', periode: '', mention: '' }] }))
  }

  const updateFormation = (index, field, value) => {
    const fors = [...profile.formations]
    fors[index] = { ...fors[index], [field]: value }
    setProfile(p => ({ ...p, formations: fors }))
  }

  const removeFormation = (index) => {
    setProfile(p => ({ ...p, formations: p.formations.filter((_, i) => i !== index) }))
  }

  const addCompetence = () => {
    setProfile(p => ({ ...p, competences: [...p.competences, ''] }))
  }

  const updateCompetence = (index, value) => {
    const comps = [...profile.competences]
    comps[index] = value
    setProfile(p => ({ ...p, competences: comps }))
  }

  const removeCompetence = (index) => {
    setProfile(p => ({ ...p, competences: p.competences.filter((_, i) => i !== index) }))
  }

  const addLangue = () => {
    setProfile(p => ({ ...p, langues: [...p.langues, { langue: '', niveau: '' }] }))
  }

  const updateLangue = (index, field, value) => {
    const langs = [...profile.langues]
    langs[index] = { ...langs[index], [field]: value }
    setProfile(p => ({ ...p, langues: langs }))
  }

  const removeLangue = (index) => {
    setProfile(p => ({ ...p, langues: p.langues.filter((_, i) => i !== index) }))
  }

  const addCertification = () => {
    setProfile(p => ({ ...p, certifications: [...p.certifications, { titre: '', organisme: '', annee: '' }] }))
  }

  const updateCertification = (index, field, value) => {
    const certs = [...profile.certifications]
    certs[index] = { ...certs[index], [field]: value }
    setProfile(p => ({ ...p, certifications: certs }))
  }

  const removeCertification = (index) => {
    setProfile(p => ({ ...p, certifications: p.certifications.filter((_, i) => i !== index) }))
  }

  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh'}}>⏳ Chargement...</div>

  return (
    <div className="profile-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
        <div className="nav-btns">
          <a href="/dashboard" className="btn-ghost">Mon dashboard</a>
          <a href="/templates" className="btn-ghost">+ Nouveau CV</a>
        </div>
      </nav>

      <div className="profile-wrap">
        <div className="profile-header">
          <h2>Mon <em>profil</em></h2>
          <p className="profile-sub">Remplis ton profil une fois — génère des CV illimités sans uploader ton CV à chaque fois.</p>
        </div>

        <div className="profile-sections">

          {/* Infos personnelles */}
          <div className="profile-section">
            <h3 className="profile-section-title">👤 Informations personnelles</h3>
            <div className="profile-grid">
              <div className="profile-field">
                <label>Prénom</label>
                <input className="profile-input" value={profile.prenom} onChange={e => setProfile(p => ({...p, prenom: e.target.value}))} placeholder="Jean" />
              </div>
              <div className="profile-field">
                <label>Nom</label>
                <input className="profile-input" value={profile.nom} onChange={e => setProfile(p => ({...p, nom: e.target.value}))} placeholder="Dupont" />
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input className="profile-input" value={profile.email} onChange={e => setProfile(p => ({...p, email: e.target.value}))} placeholder="jean@email.com" />
              </div>
              <div className="profile-field">
                <label>Téléphone</label>
                <input className="profile-input" value={profile.telephone} onChange={e => setProfile(p => ({...p, telephone: e.target.value}))} placeholder="+33 6 00 00 00 00" />
              </div>
              <div className="profile-field">
                <label>Ville</label>
                <input className="profile-input" value={profile.ville} onChange={e => setProfile(p => ({...p, ville: e.target.value}))} placeholder="Paris" />
              </div>
              <div className="profile-field">
                <label>LinkedIn</label>
                <input className="profile-input" value={profile.linkedin} onChange={e => setProfile(p => ({...p, linkedin: e.target.value}))} placeholder="linkedin.com/in/jean" />
              </div>
              <div className="profile-field" style={{gridColumn:'1/-1'}}>
                <label>Titre professionnel</label>
                <input className="profile-input" value={profile.titre} onChange={e => setProfile(p => ({...p, titre: e.target.value}))} placeholder="Développeur Full Stack Senior" />
              </div>
              <div className="profile-field" style={{gridColumn:'1/-1'}}>
                <label>Accroche / Résumé</label>
                <textarea className="profile-input" rows={3} value={profile.accroche} onChange={e => setProfile(p => ({...p, accroche: e.target.value}))} placeholder="Décris-toi en 2-3 phrases..." />
              </div>
            </div>
          </div>

          {/* Expériences */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h3 className="profile-section-title">💼 Expériences professionnelles</h3>
              <button className="btn-add" onClick={addExperience}>+ Ajouter</button>
            </div>
            {profile.experiences.map((exp, i) => (
              <div key={i} className="profile-card">
                <div className="profile-card-header">
                  <span className="profile-card-num">Expérience {i + 1}</span>
                  <button className="btn-remove" onClick={() => removeExperience(i)}>✕</button>
                </div>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Poste</label>
                    <input className="profile-input" value={exp.poste} onChange={e => updateExperience(i, 'poste', e.target.value)} placeholder="Développeur React" />
                  </div>
                  <div className="profile-field">
                    <label>Entreprise</label>
                    <input className="profile-input" value={exp.entreprise} onChange={e => updateExperience(i, 'entreprise', e.target.value)} placeholder="Google" />
                  </div>
                  <div className="profile-field">
                    <label>Période</label>
                    <input className="profile-input" value={exp.periode} onChange={e => updateExperience(i, 'periode', e.target.value)} placeholder="Jan 2022 - Déc 2023" />
                  </div>
                  <div className="profile-field">
                    <label>Lieu</label>
                    <input className="profile-input" value={exp.lieu} onChange={e => updateExperience(i, 'lieu', e.target.value)} placeholder="Paris" />
                  </div>
                </div>
                <div className="profile-field" style={{marginTop:'8px'}}>
                  <label>Missions</label>
                  {exp.missions.map((m, j) => (
                    <input key={j} className="profile-input" style={{marginBottom:'6px'}} value={m} onChange={e => updateMission(i, j, e.target.value)} placeholder={`Mission ${j + 1}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Formations */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h3 className="profile-section-title">🎓 Formations</h3>
              <button className="btn-add" onClick={addFormation}>+ Ajouter</button>
            </div>
            {profile.formations.map((f, i) => (
              <div key={i} className="profile-card">
                <div className="profile-card-header">
                  <span className="profile-card-num">Formation {i + 1}</span>
                  <button className="btn-remove" onClick={() => removeFormation(i)}>✕</button>
                </div>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Diplôme</label>
                    <input className="profile-input" value={f.diplome} onChange={e => updateFormation(i, 'diplome', e.target.value)} placeholder="Master Informatique" />
                  </div>
                  <div className="profile-field">
                    <label>Établissement</label>
                    <input className="profile-input" value={f.etablissement} onChange={e => updateFormation(i, 'etablissement', e.target.value)} placeholder="Université Paris" />
                  </div>
                  <div className="profile-field">
                    <label>Période</label>
                    <input className="profile-input" value={f.periode} onChange={e => updateFormation(i, 'periode', e.target.value)} placeholder="2019 - 2021" />
                  </div>
                  <div className="profile-field">
                    <label>Mention</label>
                    <input className="profile-input" value={f.mention} onChange={e => updateFormation(i, 'mention', e.target.value)} placeholder="Très bien" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compétences */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h3 className="profile-section-title">⚡ Compétences</h3>
              <button className="btn-add" onClick={addCompetence}>+ Ajouter</button>
            </div>
            <div className="profile-competences">
              {profile.competences.map((c, i) => (
                <div key={i} className="profile-competence-item">
                  <input className="profile-input" value={c} onChange={e => updateCompetence(i, e.target.value)} placeholder="React, Python..." />
                  <button className="btn-remove" onClick={() => removeCompetence(i)}>✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Langues */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h3 className="profile-section-title">🌍 Langues</h3>
              <button className="btn-add" onClick={addLangue}>+ Ajouter</button>
            </div>
            {profile.langues.map((l, i) => (
              <div key={i} className="profile-card">
                <div className="profile-card-header">
                  <span className="profile-card-num">Langue {i + 1}</span>
                  <button className="btn-remove" onClick={() => removeLangue(i)}>✕</button>
                </div>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Langue</label>
                    <input className="profile-input" value={l.langue} onChange={e => updateLangue(i, 'langue', e.target.value)} placeholder="Anglais" />
                  </div>
                  <div className="profile-field">
                    <label>Niveau</label>
                    <input className="profile-input" value={l.niveau} onChange={e => updateLangue(i, 'niveau', e.target.value)} placeholder="Courant / B2 / TOEFL 95" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="profile-section">
            <div className="profile-section-header">
              <h3 className="profile-section-title">🏆 Certifications</h3>
              <button className="btn-add" onClick={addCertification}>+ Ajouter</button>
            </div>
            {profile.certifications.map((c, i) => (
              <div key={i} className="profile-card">
                <div className="profile-card-header">
                  <span className="profile-card-num">Certification {i + 1}</span>
                  <button className="btn-remove" onClick={() => removeCertification(i)}>✕</button>
                </div>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Titre</label>
                    <input className="profile-input" value={c.titre} onChange={e => updateCertification(i, 'titre', e.target.value)} placeholder="AWS Solutions Architect" />
                  </div>
                  <div className="profile-field">
                    <label>Organisme</label>
                    <input className="profile-input" value={c.organisme} onChange={e => updateCertification(i, 'organisme', e.target.value)} placeholder="Amazon" />
                  </div>
                  <div className="profile-field">
                    <label>Année</label>
                    <input className="profile-input" value={c.annee} onChange={e => updateCertification(i, 'annee', e.target.value)} placeholder="2023" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>

        <div className="profile-save">
          <button className="btn-generate" onClick={handleSave} disabled={saving}>
            {saving ? '⏳ Sauvegarde...' : saved ? '✅ Sauvegardé !' : '💾 Sauvegarder mon profil'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile