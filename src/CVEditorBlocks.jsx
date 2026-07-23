import { useState, useRef, useEffect } from 'react'
import { User, FileText, Briefcase, GraduationCap, Zap, Globe, Eye, EyeOff, Trash2, GripVertical, Lightbulb } from 'lucide-react'
import { CVTemplate } from './CVTemplates'
import SuggestionsIA from './SuggestionsIA'

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

const INPUT = {
  width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb',
  borderRadius: '8px', fontSize: '13px', fontFamily: '"Inter",system-ui,sans-serif',
  color: '#111', outline: 'none', boxSizing: 'border-box', background: '#fff',
  transition: 'border-color 0.15s',
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      {label && <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#374151', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</label>}
      {children}
    </div>
  )
}

export default function CVEditorBlocks({ cvData, template, onSave, onClose }) {
  const [data, setData] = useState({ ...cvData })
  const [section, setSection] = useState('infos')
  const [hidden, setHidden] = useState({
    certifications: false,
    centres_interet: false,
    linkedin: false,
  })
  const dragIdx = useRef(null)
  const w = useWidth()
  const isMobile = w < 768
  const previewScale = isMobile ? Math.min(1, (w - 24) / 794) : 1

  const update = (field, val) => setData(d => ({ ...d, [field]: val }))

  // ─── Experiences ─────────────────────────────────────────
  const updateExp = (i, field, val) => setData(d => ({
    ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, [field]: val } : e)
  }))
  const updateMission = (i, j, val) => setData(d => ({
    ...d, experiences: d.experiences.map((e, k) => k === i
      ? { ...e, missions: e.missions.map((m, l) => l === j ? val : m) } : e)
  }))
  const addMission = (i) => setData(d => ({
    ...d, experiences: d.experiences.map((e, k) => k === i
      ? { ...e, missions: [...(e.missions || []), ''] } : e)
  }))
  const addExp = () => setData(d => ({ ...d, experiences: [...d.experiences, { poste: '', entreprise: '', periode: '', lieu: '', missions: [''] }] }))
  const removeExp = (i) => setData(d => ({ ...d, experiences: d.experiences.filter((_, j) => j !== i) }))

  // Drag & drop experiences
  const onDragStart = (i) => { dragIdx.current = i }
  const onDrop = (i) => {
    if (dragIdx.current === null || dragIdx.current === i) return
    const arr = [...data.experiences]
    const dragged = arr.splice(dragIdx.current, 1)[0]
    arr.splice(i, 0, dragged)
    setData(d => ({ ...d, experiences: arr }))
    dragIdx.current = null
  }

  // ─── Formations ──────────────────────────────────────────
  const updateForm = (i, field, val) => setData(d => ({
    ...d, formations: d.formations.map((f, j) => j === i ? { ...f, [field]: val } : f)
  }))
  const addForm = () => setData(d => ({ ...d, formations: [...(d.formations || []), { diplome: '', etablissement: '', periode: '', mention: '', description: '' }] }))
  const removeForm = (i) => setData(d => ({ ...d, formations: d.formations.filter((_, j) => j !== i) }))

  // Drag & drop formations
  const dragFormIdx = useRef(null)
  const onDragStartForm = (i) => { dragFormIdx.current = i }
  const onDropForm = (i) => {
    if (dragFormIdx.current === null || dragFormIdx.current === i) return
    const arr = [...data.formations]
    const dragged = arr.splice(dragFormIdx.current, 1)[0]
    arr.splice(i, 0, dragged)
    setData(d => ({ ...d, formations: arr }))
    dragFormIdx.current = null
  }

  // ─── Competences ─────────────────────────────────────────
  const updateComp = (i, val) => setData(d => ({ ...d, competences: d.competences.map((c, j) => j === i ? val : c) }))
  const addComp = () => setData(d => ({ ...d, competences: [...(d.competences || []), ''] }))
  const removeComp = (i) => setData(d => ({ ...d, competences: d.competences.filter((_, j) => j !== i) }))

  // ─── Langues ─────────────────────────────────────────────
  const updateLang = (i, field, val) => setData(d => ({
    ...d, langues: d.langues.map((l, j) => j === i ? { ...l, [field]: val } : l)
  }))
  const addLang = () => setData(d => ({ ...d, langues: [...(d.langues || []), { langue: '', niveau: '' }] }))
  const removeLang = (i) => setData(d => ({ ...d, langues: d.langues.filter((_, j) => j !== i) }))

  const toggleHidden = (key) => setHidden(h => ({ ...h, [key]: !h[key] }))

  // Applique les sections cachees au moment de sauvegarder
  const handleSave = () => {
    const saved = { ...data }
    if (hidden.certifications) saved.certifications = []
    if (hidden.centres_interet) saved.centres_interet = []
    if (hidden.linkedin) saved.linkedin = ''
    onSave(saved)
  }

  const focus = (e) => { e.target.style.borderColor = '#4f46e5' }
  const blur = (e) => { e.target.style.borderColor = '#e5e7eb' }

  const SECTIONS = [
    { id: 'infos',       label: 'Infos',        icon: User },
    { id: 'accroche',    label: 'Accroche',     icon: FileText },
    { id: 'experiences', label: 'Experiences',  icon: Briefcase },
    { id: 'formations',  label: 'Formations',   icon: GraduationCap },
    { id: 'competences', label: 'Competences',  icon: Zap },
    { id: 'langues',     label: 'Langues',      icon: Globe },
    { id: 'visibilite',  label: 'Visibilite',   icon: Eye },
  ]

  const DRAG_STYLE = { cursor: 'grab', userSelect: 'none' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', fontFamily: '"Inter",system-ui,sans-serif', backdropFilter: 'blur(4px)', overflowY: isMobile ? 'auto' : 'hidden' }}>
      <div style={{ width: '100%', height: isMobile ? 'auto' : '100%', minHeight: '100%', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '380px 1fr', background: '#f8f9ff' }}>

        {/* ─── GAUCHE ─── */}
        <div style={{ background: '#fff', borderRight: isMobile ? 'none' : '1px solid #f0f0f0', borderBottom: isMobile ? '1px solid #f0f0f0' : 'none', display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100vh' }}>

          {/* Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#111' }}>Modifier le CV</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>Apercu en temps reel a droite</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleSave}
                style={{ padding: '8px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Sauvegarder
              </button>
              <button onClick={onClose}
                style={{ width: '34px', height: '34px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
                ✕
              </button>
            </div>
          </div>

          {/* Onglets */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '3px', flexWrap: 'wrap', flexShrink: 0 }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '11px', fontWeight: '600', background: section === s.id ? '#4f46e5' : '#f3f4f6', color: section === s.id ? '#fff' : '#6b7280', transition: 'all 0.1s' }}>
                <s.icon size={12} />{s.label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

            {/* INFOS */}
            {section === 'infos' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                  <Field label="Prenom"><input value={data.prenom || ''} onChange={e => update('prenom', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                  <Field label="Nom"><input value={data.nom || ''} onChange={e => update('nom', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                </div>
                <Field label="Titre"><input value={data.titre || ''} onChange={e => update('titre', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '10px' }}>
                  <Field label="Email"><input value={data.email || ''} onChange={e => update('email', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                  <Field label="Telephone"><input value={data.telephone || ''} onChange={e => update('telephone', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                  <Field label="Ville"><input value={data.ville || ''} onChange={e => update('ville', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                  <Field label="LinkedIn"><input value={data.linkedin || ''} onChange={e => update('linkedin', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                </div>
              </div>
            )}

            {/* ACCROCHE */}
            {section === 'accroche' && (
              <div>
                <Field label="Accroche / Profil">
                  <textarea value={data.accroche || ''} onChange={e => update('accroche', e.target.value)} rows={7}
                    style={{ ...INPUT, resize: 'vertical', lineHeight: '1.6' }} onFocus={focus} onBlur={blur} />
                </Field>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', padding: '10px 12px', background: '#f8f9ff', borderRadius: '8px', border: '1px solid #ede9fe', fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>
                  <Lightbulb size={13} style={{ flexShrink: 0, marginTop: '1px' }} /> 3 a 5 phrases percutantes. Expertise, valeur ajoutee, adequation avec le poste.
                </div>
              </div>
            )}

            {/* EXPERIENCES */}
            {section === 'experiences' && (
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GripVertical size={13} /> Glisse-depose pour reordonner
                </div>
                {data.experiences?.map((exp, i) => (
                  <div key={i}
                    draggable
                    onDragStart={() => onDragStart(i)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDrop(i)}
                    style={{ marginBottom: '12px', padding: '14px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #ede9fe', ...DRAG_STYLE }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GripVertical size={14} color="#c4c4c4" />
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5' }}>
                          {exp.poste || `Experience ${i + 1}`}
                        </div>
                      </div>
                      {data.experiences.length > 1 && (
                        <button onClick={() => removeExp(i)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '2px 6px' }}><Trash2 size={13} /></button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <Field label="Poste"><input value={exp.poste || ''} onChange={e => updateExp(i, 'poste', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Entreprise"><input value={exp.entreprise || ''} onChange={e => updateExp(i, 'entreprise', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Periode"><input value={exp.periode || ''} onChange={e => updateExp(i, 'periode', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Lieu"><input value={exp.lieu || ''} onChange={e => updateExp(i, 'lieu', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                    </div>
                    <Field label="Missions">
                      {exp.missions?.map((m, j) => (
                        <input key={j} value={m} onChange={e => updateMission(i, j, e.target.value)}
                          placeholder={`Mission ${j+1}`} style={{ ...INPUT, marginBottom: '6px', cursor: 'text' }}
                          onFocus={focus} onBlur={blur} />
                      ))}
                      <button onClick={() => addMission(i)} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#9ca3af', padding: '5px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                        + Mission
                      </button>
                      <SuggestionsIA
                        poste={exp.poste}
                        type="missions"
                        onSelect={s => {
                          const missions = [...(exp.missions || []).filter(m => m), s]
                          setData(d => ({ ...d, experiences: d.experiences.map((e, k) => k === i ? { ...e, missions } : e) }))
                        }}
                      />
                    </Field>
                  </div>
                ))}
                <button onClick={addExp} style={{ padding: '10px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '10px', color: '#6b7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}>
                  + Ajouter une experience
                </button>
              </div>
            )}

            {/* FORMATIONS */}
            {section === 'formations' && (
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <GripVertical size={13} /> Glisse-depose pour reordonner
                </div>
                {data.formations?.map((f, i) => (
                  <div key={i}
                    draggable
                    onDragStart={() => onDragStartForm(i)}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => onDropForm(i)}
                    style={{ marginBottom: '12px', padding: '14px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #ede9fe', ...DRAG_STYLE }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <GripVertical size={14} color="#c4c4c4" />
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5' }}>{f.diplome || `Formation ${i + 1}`}</div>
                      </div>
                      {data.formations.length > 1 && (
                        <button onClick={() => removeForm(i)} style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><Trash2 size={13} /></button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '8px' }}>
                      <Field label="Diplome"><input value={f.diplome || ''} onChange={e => updateForm(i, 'diplome', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Etablissement"><input value={f.etablissement || ''} onChange={e => updateForm(i, 'etablissement', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Periode"><input value={f.periode || ''} onChange={e => updateForm(i, 'periode', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Mention"><input value={f.mention || ''} onChange={e => updateForm(i, 'mention', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                    </div>
                    <Field label="Description">
                      <input value={f.description || ''} onChange={e => updateForm(i, 'description', e.target.value)} style={{ ...INPUT, cursor: 'text' }} onFocus={focus} onBlur={blur} />
                    </Field>
                  </div>
                ))}
                <button onClick={addForm} style={{ padding: '10px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '10px', color: '#6b7280', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}>
                  + Ajouter une formation
                </button>
              </div>
            )}

            {/* COMPETENCES */}
            {section === 'competences' && (
              <div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                  Courtes et precises — ex: Excel, Python, Gestion de projet
                </div>
                {data.competences?.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <input value={c} onChange={e => updateComp(i, e.target.value)}
                      placeholder={`Competence ${i+1}`} style={{ ...INPUT, flex: 1 }} onFocus={focus} onBlur={blur} />
                    {data.competences.length > 1 && (
                      <button onClick={() => removeComp(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: 'none', color: '#dc2626', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0 }}><Trash2 size={13} /></button>
                    )}
                  </div>
                ))}
                <button onClick={addComp} style={{ padding: '8px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '8px', color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                  + Ajouter
                </button>
              </div>
            )}

            {/* LANGUES */}
            {section === 'langues' && (
              <div>
                {data.langues?.map((l, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                    <Field label={i === 0 ? 'Langue' : ''}>
                      <input value={l.langue || ''} onChange={e => updateLang(i, 'langue', e.target.value)} placeholder="Francais" style={INPUT} onFocus={focus} onBlur={blur} />
                    </Field>
                    <Field label={i === 0 ? 'Niveau' : ''}>
                      <select value={l.niveau || ''} onChange={e => updateLang(i, 'niveau', e.target.value)} style={{ ...INPUT, cursor: 'pointer' }}>
                        <option value="">Niveau</option>
                        {['Langue maternelle', 'Bilingue (C2)', 'Courant (C1)', 'Avance (B2)', 'Intermediaire (B1)', 'Notions (A2)'].map(n => <option key={n}>{n}</option>)}
                      </select>
                    </Field>
                    {data.langues.length > 1 && (
                      <button onClick={() => removeLang(i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', border: 'none', color: '#dc2626', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', marginBottom: '12px' }}><Trash2 size={13} /></button>
                    )}
                  </div>
                ))}
                <button onClick={addLang} style={{ padding: '8px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '8px', color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                  + Ajouter une langue
                </button>
              </div>
            )}

            {/* VISIBILITE */}
            {section === 'visibilite' && (
              <div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.6' }}>
                  Masque des sections de ton CV. Utile pour adapter ton CV selon les postes.
                </div>

                {[
                  { key: 'certifications', label: 'Certifications', count: data.certifications?.filter(c => c.titre).length || 0 },
                  { key: 'centres_interet', label: "Centres d'interet", count: data.centres_interet?.filter(c => c).length || 0 },
                  { key: 'linkedin', label: 'LinkedIn', count: data.linkedin ? 1 : 0 },
                ].map(({ key, label, count }) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #ede9fe', marginBottom: '10px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: hidden[key] ? '#9ca3af' : '#111', textDecoration: hidden[key] ? 'line-through' : 'none' }}>{label}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
                        {count > 0 ? `${count} element${count > 1 ? 's' : ''}` : 'Vide'}
                      </div>
                    </div>
                    <button onClick={() => toggleHidden(key)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: '600', background: hidden[key] ? '#f3f4f6' : '#4f46e5', color: hidden[key] ? '#6b7280' : '#fff', transition: 'all 0.15s' }}>
                      {hidden[key] ? <><Eye size={12} /> Afficher</> : <><EyeOff size={12} /> Masquer</>}
                    </button>
                  </div>
                ))}

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', marginTop: '20px', padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', fontSize: '12px', color: '#92400e', lineHeight: '1.6' }}>
                  <Lightbulb size={13} style={{ flexShrink: 0, marginTop: '1px' }} /> Les sections masquees ne seront pas incluses dans ton CV telecharge.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── DROITE : Apercu ─── */}
        <div style={{ overflowY: 'auto', background: '#e8e9ef', display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100vh' }}>
          <div style={{ padding: '12px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, position: isMobile ? 'static' : 'sticky', top: 0, zIndex: 10 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>Apercu temps reel</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Template : {template}</div>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: isMobile ? '16px 12px' : '32px 24px', minHeight: 'fit-content' }}>
            <div style={{ width: `${794 * previewScale}px`, height: `${1123 * previewScale}px`, boxShadow: '0 8px 40px rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '794px', height: '1123px', transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
                <CVTemplate
                  cvData={{
                    ...data,
                    certifications: hidden.certifications ? [] : data.certifications,
                    centres_interet: hidden.centres_interet ? [] : data.centres_interet,
                    linkedin: hidden.linkedin ? '' : data.linkedin,
                  }}
                  template={template}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
