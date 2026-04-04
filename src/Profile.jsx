import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import './App.css'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importFile, setImportFile] = useState(null)
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

  const handleImportCV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImportFile(file)
    setImporting(true)
    const reader = new FileReader()
    reader.onload = async (event) => {
      const typedArray = new Uint8Array(event.target.result)
      const pdf = await pdfjsLib.getDocument(typedArray).promise
      let texteComplet = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const texte = content.items.map(item => item.str).join(' ')
        texteComplet += texte + '\n'
      }
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 3000,
          messages: [{
            role: 'user',
            content: `Tu es un expert en recrutement. Analyse ce CV et extrait toutes les informations.

Voici le CV :
${texteComplet}

Retourne UNIQUEMENT un objet JSON valide avec cette structure exacte :
{
  "prenom": "...",
  "nom": "...",
  "email": "...",
  "telephone": "...",
  "ville": "...",
  "linkedin": "...",
  "titre": "...",
  "accroche": "...",
  "experiences": [{"poste":"...","entreprise":"...","periode":"...","lieu":"...","missions":["...","...","..."]}],
  "formations": [{"diplome":"...","etablissement":"...","periode":"...","mention":"..."}],
  "competences": ["..."],
  "langues": [{"langue":"...","niveau":"..."}],
  "certifications": []
}`
          }]
        })
      })
      const data = await response.json()
      const texte = data.content[0].text
      const jsonPropre = texte.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const json = JSON.parse(jsonPropre)
      setProfile(p => ({ ...p, ...json }))
      setImporting(false)
    }
    reader.readAsArrayBuffer(file)
  }

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
          <p className="profile-sub">
            Importe ton CV PDF pour pré-remplir ton profil automatiquement. ⚠️ La lecture automatique n'est pas parfaite — les expériences et missions peuvent être mélangées selon la mise en page de ton CV. <strong>Vérifie et corrige chaque section avant de sauvegarder.</strong>
          </p>
        </div>

        <div className="import-cv-box">
          <label className="import-cv-label">
            <input type="file" accept=".pdf" onChange={handleImportCV} style={{display:'none'}} />
            {importing ? (
              <div className="import-cv-loading">⏳ Analyse de ton CV en cours...</div>
            ) : importFile ? (
              <div className="import-cv-done">
  ✅ Profil importé depuis {importFile.name} !<br/>
  <span style={{fontSize:'12px', color:'#555'}}>Certaines informations peuvent manquer — vérifie et complète les sections vides avant de sauvegarder.</span>
</div>
            ) : (
              <div className="import-cv-placeholder">
                <div style={{fontSize:'32px', marginBottom:'8px'}}>📄</div>
                <div style={{fontWeight:'600', marginBottom:'4px'}}>Importer mon CV PDF</div>
                <div style={{fontSize:'13px', color:'var(--muted)'}}>L'IA remplit ton profil automatiquement</div>
              </div>
            )}
          </label>
        </div>

        <div className="profile-sections">
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