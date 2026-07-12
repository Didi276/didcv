import { useState } from 'react'
import { CVTemplate } from './CVTemplates'

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

  const update = (field, val) => setData(d => ({ ...d, [field]: val }))

  const updateExp = (i, field, val) => setData(d => ({
    ...d, experiences: d.experiences.map((e, j) => j === i ? { ...e, [field]: val } : e)
  }))
  const updateMission = (i, j, val) => setData(d => ({
    ...d, experiences: d.experiences.map((e, k) => k === i ? { ...e, missions: e.missions.map((m, l) => l === j ? val : m) } : e)
  }))
  const addMission = (i) => setData(d => ({
    ...d, experiences: d.experiences.map((e, k) => k === i ? { ...e, missions: [...(e.missions || []), ''] } : e)
  }))
  const addExp = () => setData(d => ({ ...d, experiences: [...d.experiences, { poste: '', entreprise: '', periode: '', lieu: '', missions: ['', ''] }] }))
  const removeExp = (i) => setData(d => ({ ...d, experiences: d.experiences.filter((_, j) => j !== i) }))

  const updateForm = (i, field, val) => setData(d => ({
    ...d, formations: d.formations.map((f, j) => j === i ? { ...f, [field]: val } : f)
  }))
  const addForm = () => setData(d => ({ ...d, formations: [...(d.formations || []), { diplome: '', etablissement: '', periode: '', mention: '', description: '' }] }))
  const removeForm = (i) => setData(d => ({ ...d, formations: d.formations.filter((_, j) => j !== i) }))

  const updateComp = (i, val) => setData(d => ({ ...d, competences: d.competences.map((c, j) => j === i ? val : c) }))
  const addComp = () => setData(d => ({ ...d, competences: [...(d.competences || []), ''] }))
  const removeComp = (i) => setData(d => ({ ...d, competences: d.competences.filter((_, j) => j !== i) }))

  const updateLang = (i, field, val) => setData(d => ({
    ...d, langues: d.langues.map((l, j) => j === i ? { ...l, [field]: val } : l)
  }))
  const addLang = () => setData(d => ({ ...d, langues: [...(d.langues || []), { langue: '', niveau: '' }] }))
  const removeLang = (i) => setData(d => ({ ...d, langues: d.langues.filter((_, j) => j !== i) }))

  const focus = (e) => { e.target.style.borderColor = '#4f46e5' }
  const blur = (e) => { e.target.style.borderColor = '#e5e7eb' }

  const SECTIONS = [
    { id: 'infos',        label: 'Infos'         },
    { id: 'accroche',     label: 'Accroche'      },
    { id: 'experiences',  label: 'Experiences'   },
    { id: 'formations',   label: 'Formations'    },
    { id: 'competences',  label: 'Competences'   },
    { id: 'langues',      label: 'Langues'       },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, display: 'flex', fontFamily: '"Inter",system-ui,sans-serif', backdropFilter: 'blur(4px)' }}>
      <div style={{ width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '380px 1fr', background: '#f8f9ff' }}>

        {/* ─── PANNEAU GAUCHE : Formulaire ─── */}
        <div style={{ background: '#fff', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column', height: '100vh' }}>

          {/* Header */}
          <div style={{ padding: '18px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#111', letterSpacing: '-0.2px' }}>Modifier le CV</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>Les modifications s'appliquent en temps reel</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => onSave(data)}
                style={{ padding: '8px 18px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Sauvegarder
              </button>
              <button onClick={onClose}
                style={{ width: '34px', height: '34px', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
          </div>

          {/* Navigation sections */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: '4px', flexWrap: 'wrap', flexShrink: 0 }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                style={{ padding: '6px 12px', borderRadius: '7px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: '600', background: section === s.id ? '#4f46e5' : '#f3f4f6', color: section === s.id ? '#fff' : '#6b7280', transition: 'all 0.1s' }}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Contenu scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

            {/* INFOS */}
            {section === 'infos' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Field label="Prenom"><input value={data.prenom || ''} onChange={e => update('prenom', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                  <Field label="Nom"><input value={data.nom || ''} onChange={e => update('nom', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                </div>
                <Field label="Titre"><input value={data.titre || ''} onChange={e => update('titre', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Field label="Email"><input value={data.email || ''} onChange={e => update('email', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                  <Field label="Telephone"><input value={data.telephone || ''} onChange={e => update('telephone', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <Field label="Ville"><input value={data.ville || ''} onChange={e => update('ville', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                  <Field label="LinkedIn"><input value={data.linkedin || ''} onChange={e => update('linkedin', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                </div>
              </div>
            )}

            {/* ACCROCHE */}
            {section === 'accroche' && (
              <div>
                <Field label="Accroche / Profil">
                  <textarea value={data.accroche || ''} onChange={e => update('accroche', e.target.value)} rows={6}
                    style={{ ...INPUT, resize: 'vertical', lineHeight: '1.6' }} onFocus={focus} onBlur={blur} />
                </Field>
                <div style={{ padding: '12px', background: '#f8f9ff', borderRadius: '8px', border: '1px solid #ede9fe', fontSize: '12px', color: '#6b7280', lineHeight: '1.6' }}>
                  💡 3 a 5 phrases. Decris ton expertise, ta valeur ajoutee et ce que tu apportes au poste.
                </div>
              </div>
            )}

            {/* EXPERIENCES */}
            {section === 'experiences' && (
              <div>
                {data.experiences?.map((exp, i) => (
                  <div key={i} style={{ marginBottom: '16px', padding: '14px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #ede9fe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5' }}>
                        {exp.poste || `Experience ${i + 1}`}
                      </div>
                      {data.experiences.length > 1 && (
                        <button onClick={() => removeExp(i)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', cursor: 'pointer', padding: '2px 6px' }}>🗑</button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
                      <Field label="Poste"><input value={exp.poste || ''} onChange={e => updateExp(i, 'poste', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Entreprise"><input value={exp.entreprise || ''} onChange={e => updateExp(i, 'entreprise', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Periode"><input value={exp.periode || ''} onChange={e => updateExp(i, 'periode', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Lieu"><input value={exp.lieu || ''} onChange={e => updateExp(i, 'lieu', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                    </div>
                    <Field label="Missions">
                      {exp.missions?.map((m, j) => (
                        <div key={j} style={{ display: 'flex', gap: '6px', marginBottom: '6px', alignItems: 'center' }}>
                          <input value={m} onChange={e => updateMission(i, j, e.target.value)} placeholder={`Mission ${j+1}`}
                            style={{ ...INPUT, flex: 1 }} onFocus={focus} onBlur={blur} />
                        </div>
                      ))}
                      <button onClick={() => addMission(i)} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#9ca3af', padding: '6px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                        + Mission
                      </button>
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
                {data.formations?.map((f, i) => (
                  <div key={i} style={{ marginBottom: '16px', padding: '14px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #ede9fe' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#4f46e5' }}>{f.diplome || `Formation ${i + 1}`}</div>
                      {data.formations.length > 1 && (
                        <button onClick={() => removeForm(i)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '12px', cursor: 'pointer', padding: '2px 6px' }}>🗑</button>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <Field label="Diplome"><input value={f.diplome || ''} onChange={e => updateForm(i, 'diplome', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Etablissement"><input value={f.etablissement || ''} onChange={e => updateForm(i, 'etablissement', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Periode"><input value={f.periode || ''} onChange={e => updateForm(i, 'periode', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                      <Field label="Mention"><input value={f.mention || ''} onChange={e => updateForm(i, 'mention', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
                    </div>
                    <Field label="Description"><input value={f.description || ''} onChange={e => updateForm(i, 'description', e.target.value)} style={INPUT} onFocus={focus} onBlur={blur} /></Field>
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
                <div style={{ marginBottom: '12px', fontSize: '12px', color: '#9ca3af' }}>
                  Competences courtes et precises — ex: Excel, Salesforce, Python
                </div>
                {data.competences?.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
                    <input value={c} onChange={e => updateComp(i, e.target.value)} placeholder={`Competence ${i+1}`}
                      style={{ ...INPUT, flex: 1 }} onFocus={focus} onBlur={blur} />
                    {data.competences.length > 1 && (
                      <button onClick={() => removeComp(i)} style={{ background: '#fef2f2', border: 'none', color: '#dc2626', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', flexShrink: 0, fontSize: '12px' }}>🗑</button>
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
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
                    <Field label={i === 0 ? 'Langue' : ''}>
                      <input value={l.langue || ''} onChange={e => updateLang(i, 'langue', e.target.value)} placeholder="Francais" style={INPUT} onFocus={focus} onBlur={blur} />
                    </Field>
                    <Field label={i === 0 ? 'Niveau' : ''}>
                      <select value={l.niveau || ''} onChange={e => updateLang(i, 'niveau', e.target.value)} style={{ ...INPUT, cursor: 'pointer' }} onFocus={focus} onBlur={blur}>
                        <option value="">Niveau</option>
                        {['Langue maternelle', 'Bilingue (C2)', 'Courant (C1)', 'Avance (B2)', 'Intermediaire (B1)', 'Notions (A2)'].map(n => <option key={n}>{n}</option>)}
                      </select>
                    </Field>
                    {data.langues.length > 1 && (
                      <button onClick={() => removeLang(i)} style={{ background: '#fef2f2', border: 'none', color: '#dc2626', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', marginBottom: '12px', fontSize: '12px' }}>🗑</button>
                    )}
                  </div>
                ))}
                <button onClick={addLang} style={{ padding: '8px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '8px', color: '#6b7280', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
                  + Ajouter une langue
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ─── PANNEAU DROIT : Apercu ─── */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#e8e9ef' }}>
          {/* Header apercu */}
          <div style={{ padding: '14px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              Apercu en temps reel
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>Template : {template}</div>
          </div>

          {/* CV preview */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 24px' }}>
            <div style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.2)', borderRadius: '4px', overflow: 'hidden' }}>
              <CVTemplate cvData={data} template={template} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}