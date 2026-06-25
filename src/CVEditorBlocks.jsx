import { useState } from 'react'
import { CVTemplate } from './CVTemplates'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

// ─── Styles réutilisables ────────────────────────────────────
const inp = {
  padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '7px',
  fontSize: '12px', width: '100%', fontFamily: 'inherit', outline: 'none',
  boxSizing: 'border-box'
}
const btn = (color = '#4f46e5', bg = '#f0f4ff', border = '#c7d2fe') => ({
  padding: '4px 12px', background: bg, border: `1px solid ${border}`,
  borderRadius: '7px', fontSize: '12px', color, cursor: 'pointer', fontFamily: 'inherit'
})

// ─── Composants utilitaires ──────────────────────────────────
function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px', fontWeight: '600' }}>{label}</div>
      <input value={value || ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inp} />
    </div>
  )
}

function Area({ label, value, onChange, rows = 3 }) {
  return (
    <div>
      <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '3px', fontWeight: '600' }}>{label}</div>
      <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={rows}
        style={{ ...inp, resize: 'vertical', lineHeight: '1.5' }} />
    </div>
  )
}

// ─── Éditeur principal ───────────────────────────────────────
export default function CVEditorBlocks({ cvData, template, onSave, onClose }) {
  const [data, setData] = useState(JSON.parse(JSON.stringify(cvData)))
  const [openBlock, setOpenBlock] = useState(null)
  const [blockOrder, setBlockOrder] = useState([
    'header', 'accroche', 'experiences', 'formations', 'competences', 'langues',
    ...(cvData.certifications?.length > 0 ? ['certifications'] : []),
    ...(cvData.centres_interet?.length > 0 ? ['centres_interet'] : []),
  ])

  // ─── Helpers ────────────────────────────────────────────────
  const set = (field, val) => setData(d => ({ ...d, [field]: val }))

  const move = (index, dir) => {
    const arr = [...blockOrder]
    const j = index + dir
    if (j < 0 || j >= arr.length) return
    if (arr[index] === 'header' || arr[j] === 'header') return
    ;[arr[index], arr[j]] = [arr[j], arr[index]]
    setBlockOrder([...arr])
  }

  // Expériences
  const setExp = (i, field, val) => {
    const exps = [...data.experiences]
    exps[i] = { ...exps[i], [field]: val }
    setData(d => ({ ...d, experiences: exps }))
  }
  const setMission = (ei, mi, val) => {
    const exps = [...data.experiences]
    const missions = [...(exps[ei].missions || [])]
    missions[mi] = val
    exps[ei] = { ...exps[ei], missions }
    setData(d => ({ ...d, experiences: exps }))
  }
  const addMission = (ei) => {
    const exps = [...data.experiences]
    exps[ei] = { ...exps[ei], missions: [...(exps[ei].missions || []), ''] }
    setData(d => ({ ...d, experiences: exps }))
  }
  const delMission = (ei, mi) => {
    const exps = [...data.experiences]
    exps[ei] = { ...exps[ei], missions: exps[ei].missions.filter((_, i) => i !== mi) }
    setData(d => ({ ...d, experiences: exps }))
  }
  const addExp = () => setData(d => ({
    ...d, experiences: [...(d.experiences || []),
      { poste: '', entreprise: '', periode: '', lieu: '', missions: [''] }]
  }))
  const delExp = (i) => setData(d => ({ ...d, experiences: d.experiences.filter((_, idx) => idx !== i) }))

  // Formations
  const setForm = (i, field, val) => {
    const arr = [...data.formations]
    arr[i] = { ...arr[i], [field]: val }
    setData(d => ({ ...d, formations: arr }))
  }
  const addForm = () => setData(d => ({
    ...d, formations: [...(d.formations || []),
      { diplome: '', etablissement: '', periode: '', mention: '', description: '' }]
  }))
  const delForm = (i) => setData(d => ({ ...d, formations: d.formations.filter((_, idx) => idx !== i) }))

  // Compétences
  const setComp = (i, val) => {
    const arr = [...data.competences]; arr[i] = val
    setData(d => ({ ...d, competences: arr }))
  }

  // Langues
  const setLang = (i, field, val) => {
    const arr = [...data.langues]; arr[i] = { ...arr[i], [field]: val }
    setData(d => ({ ...d, langues: arr }))
  }

  // Certifications
  const setCert = (i, field, val) => {
    const arr = [...(data.certifications || [])]; arr[i] = { ...arr[i], [field]: val }
    setData(d => ({ ...d, certifications: arr }))
  }

  // Centres d'intérêt
  const setCI = (i, val) => {
    const arr = [...(data.centres_interet || [])]; arr[i] = val
    setData(d => ({ ...d, centres_interet: arr }))
  }

  // ─── Export PDF ──────────────────────────────────────────────
  const handleDownload = async () => {
    const element = document.getElementById('cv-to-print')
    if (!element) return
    const canvas = await html2canvas(element, {
      scale: 4, useCORS: true, backgroundColor: '#ffffff',
      width: 794, height: 1123, logging: false
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4', true)
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST')
    pdf.save(`CV-DidCV-${data.prenom}-${data.nom}.pdf`)
  }

  // ─── Contenu de chaque bloc (formulaires) ────────────────────
  const BLOCKS = {

    header: {
      label: '👤 En-tête',
      form: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Field label="Prénom" value={data.prenom} onChange={v => set('prenom', v)} />
            <Field label="Nom" value={data.nom} onChange={v => set('nom', v)} />
          </div>
          <Field label="Titre du poste" value={data.titre} onChange={v => set('titre', v)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Field label="Email" value={data.email} onChange={v => set('email', v)} />
            <Field label="Téléphone" value={data.telephone} onChange={v => set('telephone', v)} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Field label="Ville" value={data.ville} onChange={v => set('ville', v)} />
            <Field label="LinkedIn" value={data.linkedin} onChange={v => set('linkedin', v)} />
          </div>
        </div>
      )
    },

    accroche: {
      label: '💬 Profil / Accroche',
      form: <Area label="Accroche" value={data.accroche} onChange={v => set('accroche', v)} rows={5} />
    },

    experiences: {
      label: '💼 Expériences',
      form: (
        <div>
          {data.experiences?.map((exp, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', marginBottom: '12px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <strong style={{ fontSize: '13px', color: '#1f2937' }}>Expérience {i + 1}</strong>
                <button onClick={() => delExp(i)} style={btn('#dc2626', '#fef2f2', '#fecaca')}>🗑 Supprimer</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Field label="Poste" value={exp.poste} onChange={v => setExp(i, 'poste', v)} />
                  <Field label="Entreprise" value={exp.entreprise} onChange={v => setExp(i, 'entreprise', v)} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Field label="Période" value={exp.periode} onChange={v => setExp(i, 'periode', v)} placeholder="ex: Jan 2023 – Déc 2024" />
                  <Field label="Lieu" value={exp.lieu} onChange={v => setExp(i, 'lieu', v)} />
                </div>
                <div style={{ fontSize: '11px', fontWeight: '600', color: '#374151', marginTop: '4px' }}>Missions</div>
                {exp.missions?.map((m, j) => (
                  <div key={j} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                    <textarea value={m} onChange={e => setMission(i, j, e.target.value)} rows={2}
                      style={{ ...inp, resize: 'vertical', lineHeight: '1.5', flex: 1 }} />
                    <button onClick={() => delMission(i, j)}
                      style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '18px', flexShrink: 0, paddingTop: '2px' }}>×</button>
                  </div>
                ))}
                <button onClick={() => addMission(i)} style={btn()}>+ Mission</button>
              </div>
            </div>
          ))}
          <button onClick={addExp}
            style={{ width: '100%', padding: '10px', background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: '10px', color: '#16a34a', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            + Ajouter une expérience
          </button>
        </div>
      )
    },

    formations: {
      label: '🎓 Formation',
      form: (
        <div>
          {data.formations?.map((f, i) => (
            <div key={i} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '12px', marginBottom: '12px', background: '#fafafa' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'center' }}>
                <strong style={{ fontSize: '13px', color: '#1f2937' }}>Formation {i + 1}</strong>
                <button onClick={() => delForm(i)} style={btn('#dc2626', '#fef2f2', '#fecaca')}>🗑 Supprimer</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Field label="Diplôme" value={f.diplome} onChange={v => setForm(i, 'diplome', v)} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <Field label="Établissement" value={f.etablissement} onChange={v => setForm(i, 'etablissement', v)} />
                  <Field label="Période" value={f.periode} onChange={v => setForm(i, 'periode', v)} />
                </div>
                <Field label="Mention" value={f.mention} onChange={v => setForm(i, 'mention', v)} />
                <Area label="Description" value={f.description} onChange={v => setForm(i, 'description', v)} rows={2} />
              </div>
            </div>
          ))}
          <button onClick={addForm}
            style={{ width: '100%', padding: '10px', background: '#f0fdf4', border: '1px dashed #86efac', borderRadius: '10px', color: '#16a34a', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
            + Ajouter une formation
          </button>
        </div>
      )
    },

    competences: {
      label: '⚡ Compétences',
      form: (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {data.competences?.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '20px', padding: '3px 10px 3px 12px', gap: '4px' }}>
                <input value={c} onChange={e => setComp(i, e.target.value)}
                  style={{ background: 'none', border: 'none', fontSize: '12px', width: `${Math.max((c || '').length + 1, 5)}ch`, outline: 'none', color: '#1d4ed8' }} />
                <button onClick={() => setData(d => ({ ...d, competences: d.competences.filter((_, idx) => idx !== i) }))}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: 0, fontSize: '15px', lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
          <button onClick={() => setData(d => ({ ...d, competences: [...(d.competences || []), 'Nouvelle compétence'] }))}
            style={btn()}>+ Compétence</button>
        </div>
      )
    },

    langues: {
      label: '🌍 Langues',
      form: (
        <div>
          {data.langues?.map((l, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <input value={l.langue} onChange={e => setLang(i, 'langue', e.target.value)} placeholder="Langue" style={{ ...inp, flex: 1 }} />
              <input value={l.niveau} onChange={e => setLang(i, 'niveau', e.target.value)} placeholder="Niveau" style={{ ...inp, flex: 1 }} />
              <button onClick={() => setData(d => ({ ...d, langues: d.langues.filter((_, idx) => idx !== i) }))}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>
          ))}
          <button onClick={() => setData(d => ({ ...d, langues: [...(d.langues || []), { langue: '', niveau: '' }] }))}
            style={btn()}>+ Langue</button>
        </div>
      )
    },

    certifications: {
      label: '🏆 Certifications',
      form: (
        <div>
          {(data.certifications || []).map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: '6px', marginBottom: '8px', alignItems: 'center' }}>
              <input value={c.titre || ''} onChange={e => setCert(i, 'titre', e.target.value)} placeholder="Titre" style={{ ...inp, flex: 2 }} />
              <input value={c.organisme || ''} onChange={e => setCert(i, 'organisme', e.target.value)} placeholder="Organisme" style={{ ...inp, flex: 1.5 }} />
              <input value={c.annee || ''} onChange={e => setCert(i, 'annee', e.target.value)} placeholder="Année" style={{ ...inp, flex: 0.7 }} />
              <button onClick={() => setData(d => ({ ...d, certifications: d.certifications.filter((_, idx) => idx !== i) }))}
                style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>
          ))}
          <button onClick={() => setData(d => ({ ...d, certifications: [...(d.certifications || []), { titre: '', organisme: '', annee: '' }] }))}
            style={btn()}>+ Certification</button>
        </div>
      )
    },

    centres_interet: {
      label: "🎯 Centres d'intérêt",
      form: (
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
            {(data.centres_interet || []).map((ci, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '20px', padding: '3px 10px 3px 12px', gap: '4px' }}>
                <input value={ci} onChange={e => setCI(i, e.target.value)}
                  style={{ background: 'none', border: 'none', fontSize: '12px', width: `${Math.max((ci || '').length + 1, 5)}ch`, outline: 'none', color: '#15803d' }} />
                <button onClick={() => setData(d => ({ ...d, centres_interet: d.centres_interet.filter((_, idx) => idx !== i) }))}
                  style={{ background: 'none', border: 'none', color: '#86efac', cursor: 'pointer', padding: 0, fontSize: '15px', lineHeight: 1 }}>×</button>
              </div>
            ))}
          </div>
          <button onClick={() => setData(d => ({ ...d, centres_interet: [...(d.centres_interet || []), 'Nouveau'] }))}
            style={btn('#15803d', '#f0fdf4', '#86efac')}>+ Centre d'intérêt</button>
        </div>
      )
    },
  }

  const visibleBlocks = blockOrder.filter(id => BLOCKS[id])

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>

      {/* ─── Barre du haut ─── */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ fontWeight: '700', fontSize: '16px', letterSpacing: '-0.3px' }}>✏️ Éditeur par blocs</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownload}
            style={{ padding: '8px 18px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            📥 PDF
          </button>
          <button onClick={() => onSave(data)}
            style={{ padding: '8px 18px', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
            ✅ Sauvegarder
          </button>
          <button onClick={onClose}
            style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.12)', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
            ✕ Fermer
          </button>
        </div>
      </div>

      {/* ─── Corps ─── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ─── Panneau gauche : liste des blocs ─── */}
        <div style={{ width: '390px', background: '#f8f9fa', overflowY: 'auto', padding: '16px', borderRight: '1px solid #e5e7eb', flexShrink: 0 }}>

          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: 0, marginBottom: '12px' }}>
            Clique sur un bloc pour l'éditer. Utilise ▲▼ pour réordonner.
          </p>

          {visibleBlocks.map((id, index) => {
            const block = BLOCKS[id]
            const isOpen = openBlock === id
            const isFirst = index === 0
            const isLast = index === visibleBlocks.length - 1
            return (
              <div key={id} style={{
                marginBottom: '8px', border: `1px solid ${isOpen ? '#c7d2fe' : '#e5e7eb'}`,
                borderRadius: '10px', overflow: 'hidden', background: '#fff',
                boxShadow: isOpen ? '0 2px 12px rgba(79,70,229,0.1)' : 'none',
                transition: 'box-shadow 0.15s'
              }}>
                {/* En-tête du bloc */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', gap: '8px', cursor: 'pointer', userSelect: 'none' }}
                  onClick={() => setOpenBlock(isOpen ? null : id)}>
                  <div style={{ flex: 1, fontWeight: '600', fontSize: '13px', color: '#1f2937' }}>{block.label}</div>
                  {/* Boutons réordonnancement */}
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <button onClick={e => { e.stopPropagation(); move(index, -1) }}
                      disabled={isFirst || id === 'header'}
                      style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '5px', width: '26px', height: '26px', cursor: (isFirst || id === 'header') ? 'default' : 'pointer', opacity: (isFirst || id === 'header') ? 0.25 : 1, fontSize: '11px' }}>▲</button>
                    <button onClick={e => { e.stopPropagation(); move(index, 1) }}
                      disabled={isLast}
                      style={{ background: 'none', border: '1px solid #e5e7eb', borderRadius: '5px', width: '26px', height: '26px', cursor: isLast ? 'default' : 'pointer', opacity: isLast ? 0.25 : 1, fontSize: '11px' }}>▼</button>
                  </div>
                  <span style={{ fontSize: '11px', color: '#9ca3af' }}>{isOpen ? '▲' : '▼'}</span>
                </div>
                {/* Formulaire d'édition */}
                {isOpen && (
                  <div style={{ padding: '14px', borderTop: '1px solid #f3f4f6' }}>
                    {block.form}
                  </div>
                )}
              </div>
            )
          })}

          {/* ─── Ajouter des blocs optionnels ─── */}
          {(!blockOrder.includes('certifications') || !blockOrder.includes('centres_interet')) && (
            <div style={{ marginTop: '12px', padding: '12px', background: '#f0f4ff', borderRadius: '10px', border: '1px dashed #c7d2fe' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#4f46e5', marginBottom: '8px' }}>+ Ajouter un bloc</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {!blockOrder.includes('certifications') && (
                  <button onClick={() => setBlockOrder(o => [...o, 'certifications'])} style={btn()}>
                    🏆 Certifications
                  </button>
                )}
                {!blockOrder.includes('centres_interet') && (
                  <button onClick={() => setBlockOrder(o => [...o, 'centres_interet'])} style={btn()}>
                    🎯 Centres d'intérêt
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ─── Panneau droit : aperçu CV ─── */}
        <div style={{ flex: 1, overflow: 'auto', background: '#e2e8f0', display: 'flex', justifyContent: 'center', padding: '24px' }}>
          <div style={{ zoom: '0.72', flexShrink: 0 }}>
            <CVTemplate cvData={data} template={template} />
          </div>
        </div>

      </div>
    </div>
  )
}