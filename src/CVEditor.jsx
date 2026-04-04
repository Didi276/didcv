import { useState } from 'react'
import { CVTemplate } from './CVTemplates'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function CVEditor({ cvData, template, onSave, onClose }) {
  const [cv, setCv] = useState({ ...cvData })
  const [activeSection, setActiveSection] = useState('infos')

  const handleDownload = async () => {
    const element = document.getElementById('cv-to-print')
    if (!element) return
    const canvas = await html2canvas(element, { scale: 4, useCORS: true, backgroundColor: '#ffffff', width: 794, height: 1123, logging: false, imageTimeout: 0, allowTaint: true })
    const imgData = canvas.toDataURL('image/png')
    const { default: jsPDF } = await import('jspdf')
    const pdf = new jsPDF('p', 'mm', 'a4', true)
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST')
    pdf.save(`CV-DidCV-${cv.prenom}-${cv.nom}.pdf`)
  }

  const sections = [
    { id: 'infos', label: '👤 Infos' },
    { id: 'experiences', label: '💼 Expériences' },
    { id: 'formations', label: '🎓 Formations' },
    { id: 'competences', label: '⚡ Compétences' },
    { id: 'langues', label: '🌍 Langues' },
  ]

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:2000, display:'flex', flexDirection:'column'}}>
      {/* Header */}
      <div style={{background:'#fff', borderBottom:'1px solid #e5e7ef', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0}}>
        <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
          <span style={{fontWeight:'700', fontSize:'16px'}}>✏️ Éditeur CV</span>
          <span style={{fontSize:'12px', color:'#6b7280', background:'#f0f2f8', padding:'3px 10px', borderRadius:'100px'}}>{template}</span>
        </div>
        <div style={{display:'flex', gap:'8px'}}>
          <button onClick={handleDownload} style={{padding:'8px 18px', background:'#1a56db', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'500'}}>📥 Télécharger PDF</button>
          <button onClick={() => onSave(cv)} style={{padding:'8px 18px', background:'#16a34a', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'500'}}>✅ Sauvegarder</button>
          <button onClick={onClose} style={{padding:'8px 18px', background:'#f0f2f8', color:'#374151', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:'500'}}>✕ Fermer</button>
        </div>
      </div>

      {/* Body */}
      <div style={{display:'grid', gridTemplateColumns:'420px 1fr', flex:1, overflow:'hidden'}}>

        {/* Left — Éditeur */}
        <div style={{background:'#f7f8fc', borderRight:'1px solid #e5e7ef', display:'flex', flexDirection:'column', overflow:'hidden'}}>
          {/* Tabs sections */}
          <div style={{display:'flex', gap:'4px', padding:'12px 16px', borderBottom:'1px solid #e5e7ef', flexWrap:'wrap'}}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{padding:'6px 12px', borderRadius:'8px', border:'none', cursor:'pointer', fontSize:'12px', fontWeight:'500', background: activeSection === s.id ? '#1a56db' : '#fff', color: activeSection === s.id ? '#fff' : '#374151', transition:'all 0.15s'}}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{flex:1, overflowY:'auto', padding:'20px 16px'}}>

            {activeSection === 'infos' && (
              <div style={{display:'flex', flexDirection:'column', gap:'14px'}}>
                {[
                  {label:'Prénom', key:'prenom'},
                  {label:'Nom', key:'nom'},
                  {label:'Titre professionnel', key:'titre'},
                  {label:'Email', key:'email'},
                  {label:'Téléphone', key:'telephone'},
                  {label:'Ville', key:'ville'},
                  {label:'LinkedIn', key:'linkedin'},
                ].map(({label, key}) => (
                  <div key={key}>
                    <label style={{fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'5px'}}>{label}</label>
                    <input value={cv[key] || ''} onChange={e => setCv({...cv, [key]: e.target.value})} style={{width:'100%', padding:'9px 12px', border:'1px solid #e5e7ef', borderRadius:'8px', fontSize:'14px', fontFamily:'Geist,sans-serif', outline:'none', background:'#fff'}} />
                  </div>
                ))}
                <div>
                  <label style={{fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', letterSpacing:'0.5px', display:'block', marginBottom:'5px'}}>Accroche</label>
                  <textarea value={cv.accroche || ''} onChange={e => setCv({...cv, accroche: e.target.value})} rows={4} style={{width:'100%', padding:'9px 12px', border:'1px solid #e5e7ef', borderRadius:'8px', fontSize:'14px', fontFamily:'Geist,sans-serif', outline:'none', background:'#fff', resize:'vertical'}} />
                </div>
              </div>
            )}

            {activeSection === 'experiences' && (
              <div>
                {cv.experiences?.map((exp, i) => (
                  <div key={i} style={{background:'#fff', border:'1px solid #e5e7ef', borderRadius:'12px', padding:'16px', marginBottom:'16px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                      <span style={{fontSize:'13px', fontWeight:'700', color:'#1a56db'}}>Expérience {i+1}</span>
                      <button onClick={() => setCv({...cv, experiences: cv.experiences.filter((_,j) => j !== i)})} style={{background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'6px', padding:'3px 10px', fontSize:'12px', cursor:'pointer'}}>✕ Supprimer</button>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                      {[
                        {label:'Poste', key:'poste'},
                        {label:'Entreprise', key:'entreprise'},
                        {label:'Période', key:'periode'},
                        {label:'Lieu', key:'lieu'},
                      ].map(({label, key}) => (
                        <div key={key}>
                          <label style={{fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>{label}</label>
                          <input value={exp[key] || ''} onChange={e => {
                            const exps = [...cv.experiences]
                            exps[i] = {...exps[i], [key]: e.target.value}
                            setCv({...cv, experiences: exps})
                          }} style={{width:'100%', padding:'8px 12px', border:'1px solid #e5e7ef', borderRadius:'8px', fontSize:'13px', fontFamily:'Geist,sans-serif', outline:'none'}} />
                        </div>
                      ))}
                      <div>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                          <label style={{fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase'}}>Missions</label>
                          <button onClick={() => {
                            const exps = [...cv.experiences]
                            exps[i].missions = [...(exps[i].missions || []), '']
                            setCv({...cv, experiences: exps})
                          }} style={{background:'#eff4ff', color:'#1a56db', border:'1px solid #c7d9ff', borderRadius:'6px', padding:'3px 10px', fontSize:'11px', cursor:'pointer'}}>+ Mission</button>
                        </div>
                        {exp.missions?.map((m, j) => (
                          <div key={j} style={{display:'flex', gap:'6px', marginBottom:'6px'}}>
                            <input value={m || ''} onChange={e => {
                              const exps = [...cv.experiences]
                              exps[i].missions[j] = e.target.value
                              setCv({...cv, experiences: exps})
                            }} style={{flex:1, padding:'8px 12px', border:'1px solid #e5e7ef', borderRadius:'8px', fontSize:'13px', fontFamily:'Geist,sans-serif', outline:'none'}} placeholder={`Mission ${j+1}`} />
                            <button onClick={() => {
                              const exps = [...cv.experiences]
                              exps[i].missions = exps[i].missions.filter((_,k) => k !== j)
                              setCv({...cv, experiences: exps})
                            }} style={{background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'6px', padding:'4px 10px', fontSize:'12px', cursor:'pointer'}}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setCv({...cv, experiences: [...(cv.experiences||[]), {poste:'', entreprise:'', periode:'', lieu:'', missions:['']}]})} style={{width:'100%', padding:'10px', background:'#eff4ff', color:'#1a56db', border:'1px solid #c7d9ff', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer'}}>
                  + Ajouter une expérience
                </button>
              </div>
            )}

            {activeSection === 'formations' && (
              <div>
                {cv.formations?.map((f, i) => (
                  <div key={i} style={{background:'#fff', border:'1px solid #e5e7ef', borderRadius:'12px', padding:'16px', marginBottom:'16px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px'}}>
                      <span style={{fontSize:'13px', fontWeight:'700', color:'#1a56db'}}>Formation {i+1}</span>
                      <button onClick={() => setCv({...cv, formations: cv.formations.filter((_,j) => j !== i)})} style={{background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'6px', padding:'3px 10px', fontSize:'12px', cursor:'pointer'}}>✕ Supprimer</button>
                    </div>
                    <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
                      {[
                        {label:'Diplôme', key:'diplome'},
                        {label:'Établissement', key:'etablissement'},
                        {label:'Période', key:'periode'},
                        {label:'Mention', key:'mention'},
                      ].map(({label, key}) => (
                        <div key={key}>
                          <label style={{fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>{label}</label>
                          <input value={f[key] || ''} onChange={e => {
                            const fors = [...cv.formations]
                            fors[i] = {...fors[i], [key]: e.target.value}
                            setCv({...cv, formations: fors})
                          }} style={{width:'100%', padding:'8px 12px', border:'1px solid #e5e7ef', borderRadius:'8px', fontSize:'13px', fontFamily:'Geist,sans-serif', outline:'none'}} />
                        </div>
                      ))}
                      <div>
                        <label style={{fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Description</label>
                        <textarea value={f.description || ''} onChange={e => {
                          const fors = [...cv.formations]
                          fors[i] = {...fors[i], description: e.target.value}
                          setCv({...cv, formations: fors})
                        }} rows={3} style={{width:'100%', padding:'8px 12px', border:'1px solid #e5e7ef', borderRadius:'8px', fontSize:'13px', fontFamily:'Geist,sans-serif', outline:'none', resize:'vertical'}} placeholder="Cours, projets, spécialités..." />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setCv({...cv, formations: [...(cv.formations||[]), {diplome:'', etablissement:'', periode:'', mention:'', description:''}]})} style={{width:'100%', padding:'10px', background:'#eff4ff', color:'#1a56db', border:'1px solid #c7d9ff', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer'}}>
                  + Ajouter une formation
                </button>
              </div>
            )}

            {activeSection === 'competences' && (
              <div>
                <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                  {cv.competences?.map((c, i) => (
                    <div key={i} style={{display:'flex', gap:'8px', alignItems:'center'}}>
                      <input value={c || ''} onChange={e => {
                        const comps = [...cv.competences]
                        comps[i] = e.target.value
                        setCv({...cv, competences: comps})
                      }} style={{flex:1, padding:'9px 12px', border:'1px solid #e5e7ef', borderRadius:'8px', fontSize:'14px', fontFamily:'Geist,sans-serif', outline:'none', background:'#fff'}} placeholder={`Compétence ${i+1}`} />
                      <button onClick={() => setCv({...cv, competences: cv.competences.filter((_,j) => j !== i)})} style={{background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'6px', padding:'6px 10px', fontSize:'12px', cursor:'pointer'}}>✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setCv({...cv, competences: [...(cv.competences||[]), '']})} style={{width:'100%', padding:'10px', background:'#eff4ff', color:'#1a56db', border:'1px solid #c7d9ff', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer', marginTop:'12px'}}>
                  + Ajouter une compétence
                </button>
              </div>
            )}

            {activeSection === 'langues' && (
              <div>
                {cv.langues?.map((l, i) => (
                  <div key={i} style={{background:'#fff', border:'1px solid #e5e7ef', borderRadius:'12px', padding:'16px', marginBottom:'12px'}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                      <span style={{fontSize:'13px', fontWeight:'700', color:'#1a56db'}}>Langue {i+1}</span>
                      <button onClick={() => setCv({...cv, langues: cv.langues.filter((_,j) => j !== i)})} style={{background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', borderRadius:'6px', padding:'3px 10px', fontSize:'12px', cursor:'pointer'}}>✕</button>
                    </div>
                    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                      <div>
                        <label style={{fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Langue</label>
                        <input value={l.langue || ''} onChange={e => {
                          const langs = [...cv.langues]
                          langs[i] = {...langs[i], langue: e.target.value}
                          setCv({...cv, langues: langs})
                        }} style={{width:'100%', padding:'8px 12px', border:'1px solid #e5e7ef', borderRadius:'8px', fontSize:'13px', fontFamily:'Geist,sans-serif', outline:'none'}} />
                      </div>
                      <div>
                        <label style={{fontSize:'11px', fontWeight:'700', color:'#6b7280', textTransform:'uppercase', display:'block', marginBottom:'4px'}}>Niveau</label>
                        <input value={l.niveau || ''} onChange={e => {
                          const langs = [...cv.langues]
                          langs[i] = {...langs[i], niveau: e.target.value}
                          setCv({...cv, langues: langs})
                        }} style={{width:'100%', padding:'8px 12px', border:'1px solid #e5e7ef', borderRadius:'8px', fontSize:'13px', fontFamily:'Geist,sans-serif', outline:'none'}} />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setCv({...cv, langues: [...(cv.langues||[]), {langue:'', niveau:''}]})} style={{width:'100%', padding:'10px', background:'#eff4ff', color:'#1a56db', border:'1px solid #c7d9ff', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor:'pointer'}}>
                  + Ajouter une langue
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right — Aperçu CV en temps réel */}
        <div style={{background:'#e5e7ef', overflow:'auto', display:'flex', alignItems:'flex-start', justifyContent:'center', padding:'24px'}}>
          <div style={{transform:'scale(0.75)', transformOrigin:'top center', width:'794px', flexShrink:0}}>
            <CVTemplate cvData={cv} template={template} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default CVEditor