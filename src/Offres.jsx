import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Navbar from './Navbar'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const INPUT = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
  borderRadius: '9px', fontSize: '14px', fontFamily: '"Inter",system-ui,sans-serif',
  color: '#111', outline: 'none', boxSizing: 'border-box', background: '#fff',
  transition: 'border-color 0.15s',
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
        {label}
        {hint && <span style={{ fontWeight: '400', color: '#9ca3af', marginLeft: '6px' }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function Profile() {
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('import')
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)

  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [ville, setVille] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [titre, setTitre] = useState('')
  const [accroche, setAccroche] = useState('')
  const [photo, setPhoto] = useState(null)

  const [experiences, setExperiences] = useState([{ poste: '', entreprise: '', periode: '', lieu: '', missions: ['', '', ''] }])
  const [formations, setFormations] = useState([{ diplome: '', etablissement: '', periode: '', mention: '', description: '' }])
  const [competences, setCompetences] = useState(['', '', '', '', '', ''])
  const [langues, setLangues] = useState([{ langue: '', niveau: '' }])
  const [certifications, setCertifications] = useState([{ titre: '', organisme: '', annee: '' }])
  const [centresInteret, setCentresInteret] = useState(['', '', ''])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
      if (data) {
        setPrenom(data.prenom || '')
        setNom(data.nom || '')
        setTelephone(data.telephone || '')
        setVille(data.ville || '')
        setLinkedin(data.linkedin || '')
        setTitre(data.titre || '')
        setAccroche(data.accroche || '')
        setPhoto(data.photo || null)
        if (data.experiences?.length) setExperiences(data.experiences)
        if (data.formations?.length) setFormations(data.formations)
        if (data.competences?.length) setCompetences(data.competences)
        if (data.langues?.length) setLangues(data.langues)
        if (data.certifications?.length) setCertifications(data.certifications)
        if (data.centres_interet?.length) setCentresInteret(data.centres_interet)
        if (data.prenom) setImportDone(true)
      }
    }
    init()
  }, [])

  // ─── IMPORT PDF ─────────────────────────────────────────────
  const handleImportCV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)

    try {
      // Extraire le texte du PDF
      const reader = new FileReader()
      const texte = await new Promise((resolve, reject) => {
        reader.onload = async (ev) => {
          const pdf = await pdfjsLib.getDocument(new Uint8Array(ev.target.result)).promise
          let text = ''
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const content = await page.getTextContent()
            text += content.items.map(item => item.str).join(' ') + '\n'
          }
          resolve(text)
        }
        reader.onerror = reject
        reader.readAsArrayBuffer(file)
      })

      // Envoyer a l'IA pour extraction
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          system: 'Tu es un expert en extraction de donnees de CV. Tu retournes UNIQUEMENT un JSON valide, sans texte avant ou apres, sans balises markdown.',
          messages: [{
            role: 'user',
            content: `Extrais toutes les informations de ce CV et retourne-les dans ce JSON exact. Si une information est absente, mets une chaine vide "".

CV A ANALYSER:
${texte}

Retourne UNIQUEMENT ce JSON:
{
  "prenom": "",
  "nom": "",
  "email": "",
  "telephone": "",
  "ville": "",
  "linkedin": "",
  "titre": "titre professionnel actuel ou recherche",
  "accroche": "resume du profil en 3-4 phrases",
  "experiences": [
    {
      "poste": "",
      "entreprise": "",
      "periode": "",
      "lieu": "",
      "missions": ["mission 1", "mission 2", "mission 3"]
    }
  ],
  "formations": [
    {
      "diplome": "",
      "etablissement": "",
      "periode": "",
      "mention": "",
      "description": ""
    }
  ],
  "competences": ["competence1", "competence2", "competence3"],
  "langues": [{"langue": "", "niveau": ""}],
  "certifications": [{"titre": "", "organisme": "", "annee": ""}],
  "centres_interet": ["interet1", "interet2"]
}`
          }]
        })
      })

      const data = await res.json()
      const texteJSON = data.content[0].text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const json = JSON.parse(texteJSON)

      // Remplir les champs
      if (json.prenom) setPrenom(json.prenom)
      if (json.nom) setNom(json.nom)
      if (json.email) setEmail(json.email)
      if (json.telephone) setTelephone(json.telephone)
      if (json.ville) setVille(json.ville)
      if (json.linkedin) setLinkedin(json.linkedin)
      if (json.titre) setTitre(json.titre)
      if (json.accroche) setAccroche(json.accroche)
      if (json.experiences?.length) setExperiences(json.experiences)
      if (json.formations?.length) setFormations(json.formations)
      if (json.competences?.length) setCompetences(json.competences)
      if (json.langues?.length) setLangues(json.langues)
      if (json.certifications?.filter(c => c.titre).length) setCertifications(json.certifications.filter(c => c.titre))
      if (json.centres_interet?.length) setCentresInteret(json.centres_interet)

      setImportDone(true)
      setActiveSection('infos')
    } catch (err) {
      alert('Erreur lors de l\'import. Verifie que le PDF contient du texte.')
      console.error(err)
    }
    setImporting(false)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const profileData = {
      user_id: user.id, prenom, nom, email, telephone, ville, linkedin,
      titre, accroche, photo,
      experiences: experiences.filter(e => e.poste || e.entreprise),
      formations: formations.filter(f => f.diplome || f.etablissement),
      competences: competences.filter(c => c.trim()),
      langues: langues.filter(l => l.langue),
      certifications: certifications.filter(c => c.titre),
      centres_interet: centresInteret.filter(c => c.trim()),
    }

    // Vérifier si un profil existe déjà
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let error
    if (existing) {
      const { error: e } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)
      error = e
    } else {
      const { error: e } = await supabase
        .from('profiles')
        .insert(profileData)
      error = e
    }

    if (error) {
      alert('Erreur de sauvegarde : ' + error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const addExp = () => setExperiences([...experiences, { poste: '', entreprise: '', periode: '', lieu: '', missions: ['', '', ''] }])
  const removeExp = (i) => setExperiences(experiences.filter((_, j) => j !== i))
  const updateExp = (i, field, val) => setExperiences(experiences.map((e, j) => j === i ? { ...e, [field]: val } : e))
  const updateMission = (i, j, val) => setExperiences(experiences.map((e, k) => k === i ? { ...e, missions: e.missions.map((m, l) => l === j ? val : m) } : e))
  const addMission = (i) => setExperiences(experiences.map((e, j) => j === i ? { ...e, missions: [...e.missions, ''] } : e))
  const addForm = () => setFormations([...formations, { diplome: '', etablissement: '', periode: '', mention: '', description: '' }])
  const removeForm = (i) => setFormations(formations.filter((_, j) => j !== i))
  const updateForm = (i, field, val) => setFormations(formations.map((f, j) => j === i ? { ...f, [field]: val } : f))

  const focusStyle = (e) => { e.target.style.borderColor = '#4f46e5' }
  const blurStyle = (e) => { e.target.style.borderColor = '#e5e7eb' }

  const SECTIONS = [
    { id: 'import',      label: '📥 Import PDF' },
    { id: 'infos',       label: '👤 Infos' },
    { id: 'experiences', label: '💼 Experiences' },
    { id: 'formations',  label: '🎓 Formations' },
    { id: 'competences', label: '⚡ Competences' },
    { id: 'plus',        label: '➕ Langues & Plus' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="profile" />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 24px 100px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Mon profil</h1>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
              Importe ton CV PDF pour remplir automatiquement, puis ajuste
            </p>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '11px 24px', background: saved ? '#16a34a' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'background 0.3s' }}>
            {saving ? '⏳ Sauvegarde...' : saved ? '✅ Sauvegarde !' : '💾 Sauvegarder'}
          </button>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#fff', padding: '5px', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ flex: '0 0 auto', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s', background: activeSection === s.id ? '#4f46e5' : 'transparent', color: activeSection === s.id ? '#fff' : '#6b7280', position: 'relative' }}>
              {s.label}
              {s.id === 'import' && !importDone && <span style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />}
            </button>
          ))}
        </div>

        {/* ─── IMPORT PDF ─── */}
        {activeSection === 'import' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '40px', textAlign: 'center' }}>
            {importing ? (
              <div>
                <div style={{ width: '48px', height: '48px', border: '4px solid #ede9fe', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Analyse de ton CV en cours...</div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>L\'IA extrait toutes tes informations</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            ) : importDone ? (
              <div>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Profil importe avec succes !</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>Verifie et ajuste tes informations dans les onglets a cote.</div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={() => setActiveSection('infos')}
                    style={{ padding: '12px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Verifier mes infos
                  </button>
                  <label style={{ padding: '12px 24px', background: '#f3f4f6', color: '#374151', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    <input type="file" accept=".pdf" onChange={handleImportCV} style={{ display: 'none' }} />
                    Reimporter un nouveau CV
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '56px', marginBottom: '16px' }}>📄</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Importe ton CV actuel</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px', lineHeight: '1.6' }}>
                  L'IA analyse ton CV PDF et remplit automatiquement<br />toutes les sections de ton profil.
                </div>
                <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '32px' }}>
                  Tu pourras ensuite verifier et ajuster chaque information.
                </div>
                <label style={{ display: 'inline-block', padding: '14px 32px', background: '#4f46e5', color: '#fff', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>
                  <input type="file" accept=".pdf" onChange={handleImportCV} style={{ display: 'none' }} />
                  📥 Importer mon CV PDF
                </label>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '16px' }}>PDF uniquement - max 10 Mo</div>
                <button onClick={() => setActiveSection('infos')}
                  style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
                  Remplir manuellement
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── INFOS ─── */}
        {activeSection === 'infos' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 24px' }}>Informations personnelles</h2>

            {/* Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
              {photo
                ? <img src={photo} alt="Photo" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ede9fe' }} />
                : <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👤</div>
              }
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>Photo de profil</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{ padding: '7px 14px', background: '#ede9fe', color: '#4f46e5', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                    {photo ? 'Changer' : 'Ajouter une photo'}
                  </label>
                  {photo && <button onClick={() => setPhoto(null)} style={{ padding: '7px 14px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Prenom"><input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Marie" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="Nom"><input value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="Email"><input value={email} onChange={e => setEmail(e.target.value)} style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="Telephone"><input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+33 6 12 34 56 78" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="Ville"><input value={ville} onChange={e => setVille(e.target.value)} placeholder="Paris" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="LinkedIn" hint="optionnel"><input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/..." style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
            </div>
            <Field label="Titre professionnel"><input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Responsable Marketing Digital" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
            <Field label="Accroche" hint="3-4 phrases"><textarea value={accroche} onChange={e => setAccroche(e.target.value)} rows={4} style={{ ...INPUT, resize: 'vertical', lineHeight: '1.6' }} onFocus={focusStyle} onBlur={blurStyle} /></Field>
          </div>
        )}

        {/* ─── EXPERIENCES ─── */}
        {activeSection === 'experiences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {experiences.map((exp, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>
                    Experience {i + 1} {exp.poste && <span style={{ color: '#4f46e5' }}>- {exp.poste}</span>}
                  </h3>
                  {experiences.length > 1 && <button onClick={() => removeExp(i)} style={{ padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <Field label="Poste"><input value={exp.poste} onChange={e => updateExp(i, 'poste', e.target.value)} placeholder="Responsable Marketing" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Entreprise"><input value={exp.entreprise} onChange={e => updateExp(i, 'entreprise', e.target.value)} placeholder="TechStartup" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Periode"><input value={exp.periode} onChange={e => updateExp(i, 'periode', e.target.value)} placeholder="2022 - 2024" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Lieu"><input value={exp.lieu} onChange={e => updateExp(i, 'lieu', e.target.value)} placeholder="Paris" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                </div>
                <Field label="Missions">
                  {exp.missions?.map((m, j) => (
                    <input key={j} value={m} onChange={e => updateMission(i, j, e.target.value)} placeholder={`Mission ${j+1}`} style={{ ...INPUT, marginBottom: '8px' }} onFocus={focusStyle} onBlur={blurStyle} />
                  ))}
                  <button onClick={() => addMission(i)} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>+ Ajouter une mission</button>
                </Field>
              </div>
            ))}
            <button onClick={addExp} style={{ padding: '14px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '14px', color: '#6b7280', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}>
              + Ajouter une experience
            </button>
          </div>
        )}

        {/* ─── FORMATIONS ─── */}
        {activeSection === 'formations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formations.map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>Formation {i + 1} {f.diplome && <span style={{ color: '#4f46e5' }}>- {f.diplome}</span>}</h3>
                  {formations.length > 1 && <button onClick={() => removeForm(i)} style={{ padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Diplome"><input value={f.diplome} onChange={e => updateForm(i, 'diplome', e.target.value)} placeholder="Master Marketing Digital" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Etablissement"><input value={f.etablissement} onChange={e => updateForm(i, 'etablissement', e.target.value)} placeholder="ESCP Business School" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Periode"><input value={f.periode} onChange={e => updateForm(i, 'periode', e.target.value)} placeholder="2018 - 2020" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Mention" hint="optionnel"><input value={f.mention} onChange={e => updateForm(i, 'mention', e.target.value)} placeholder="Tres Bien" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                </div>
                <Field label="Description"><input value={f.description} onChange={e => updateForm(i, 'description', e.target.value)} placeholder="Specialisation en..." style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              </div>
            ))}
            <button onClick={addForm} style={{ padding: '14px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '14px', color: '#6b7280', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}>
              + Ajouter une formation
            </button>
          </div>
        )}

        {/* ─── COMPETENCES ─── */}
        {activeSection === 'competences' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Competences</h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>Outils, logiciels, methodes - ex: Excel, Salesforce, Gestion de projet</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {competences.map((c, i) => (
                <input key={i} value={c} onChange={e => setCompetences(competences.map((v, j) => j === i ? e.target.value : v))}
                  placeholder={`Competence ${i+1}`} style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
              ))}
            </div>
            <button onClick={() => setCompetences([...competences, ''])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              + Ajouter
            </button>
          </div>
        )}

        {/* ─── PLUS ─── */}
        {activeSection === 'plus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Langues */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Langues</h2>
              {langues.map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <Field label={i === 0 ? 'Langue' : ''}><input value={l.langue} onChange={e => setLangues(langues.map((v, j) => j === i ? { ...v, langue: e.target.value } : v))} placeholder="Francais" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label={i === 0 ? 'Niveau' : ''}>
                    <select value={l.niveau} onChange={e => setLangues(langues.map((v, j) => j === i ? { ...v, niveau: e.target.value } : v))} style={{ ...INPUT, cursor: 'pointer' }} onFocus={focusStyle} onBlur={blurStyle}>
                      <option value="">Choisir</option>
                      {['Langue maternelle', 'Bilingue (C2)', 'Courant (C1)', 'Avance (B2)', 'Intermediaire (B1)', 'Notions (A2/A1)'].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </Field>
                  {langues.length > 1 && <button onClick={() => setLangues(langues.filter((_, j) => j !== i))} style={{ padding: '10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '18px' }}>🗑</button>}
                </div>
              ))}
              <button onClick={() => setLangues([...langues, { langue: '', niveau: '' }])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter une langue</button>
            </div>

            {/* Certifications */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Certifications</h2>
              {certifications.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <Field label={i === 0 ? 'Titre' : ''}><input value={c.titre} onChange={e => setCertifications(certifications.map((v, j) => j === i ? { ...v, titre: e.target.value } : v))} placeholder="Google Analytics" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label={i === 0 ? 'Organisme' : ''}><input value={c.organisme} onChange={e => setCertifications(certifications.map((v, j) => j === i ? { ...v, organisme: e.target.value } : v))} placeholder="Google" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label={i === 0 ? 'Annee' : ''}><input value={c.annee} onChange={e => setCertifications(certifications.map((v, j) => j === i ? { ...v, annee: e.target.value } : v))} placeholder="2024" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  {certifications.length > 1 && <button onClick={() => setCertifications(certifications.filter((_, j) => j !== i))} style={{ padding: '10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '18px' }}>🗑</button>}
                </div>
              ))}
              <button onClick={() => setCertifications([...certifications, { titre: '', organisme: '', annee: '' }])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter</button>
            </div>

            {/* Centres d'interet */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Centres d'interet</h2>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 16px' }}>Optionnel</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                {centresInteret.map((ci, i) => (
                  <input key={i} value={ci} onChange={e => setCentresInteret(centresInteret.map((v, j) => j === i ? e.target.value : v))}
                    placeholder={['Voyage', 'Photographie', 'Sport'][i] || `Interet ${i+1}`} style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                ))}
              </div>
              <button onClick={() => setCentresInteret([...centresInteret, ''])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter</button>
            </div>
          </div>
        )}
      </div>

      {/* Bouton save fixe */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '13px 28px', background: saved ? '#16a34a' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(79,70,229,0.4)', transition: 'background 0.3s' }}>
          {saving ? '⏳...' : saved ? '✅ Sauvegarde !' : '💾 Sauvegarder'}
        </button>
      </div>
    </div>
  )
}