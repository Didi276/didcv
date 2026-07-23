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
    const canvas = await html2canvas(element, {
      scale: 4, useCORS: true, backgroundColor: '#ffffff',
      width: 794, height: 1123, logging: false, imageTimeout: 0, allowTaint: true
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4', true)
    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297, '', 'FAST')
    pdf.save(`CV-DidCV-${cv.prenom}-${cv.nom}.pdf`)
  }

  // ✅ Upload photo → conversion base64
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { alert('Merci de choisir une image (JPG, PNG, etc.)'); return }
    if (file.size > 2 * 1024 * 1024) { alert('Image trop lourde (max 2Mo)'); return }
    const reader = new FileReader()
    reader.onload = (event) => {
      setCv({ ...cv, photo: event.target.result })
    }
    reader.readAsDataURL(file)
  }

  const sections = [
    { id: 'infos', label: '👤 Infos' },
    { id: 'photo', label: '📷 Photo' },
    { id: 'experiences', label: '💼 Expériences' },
    { id: 'formations', label: '🎓 Formations' },
    { id: 'competences', label: '⚡ Compétences' },
    { id: 'langues', label: '🌍 Langues' },
  ]

  const inputStyle = {
    width: '100%', padding: '9px 12px', border: '1px solid #e5e7ef',
    borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit',
    outline: 'none', background: '#fff', boxSizing: 'border-box'
  }

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:2000,display:'flex',flexDirection:'column'}}>
      {/* Header */}
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7ef',padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
          <span style={{fontWeight:'700',fontSize:'16px'}}>✏️ Éditeur CV</span>
          <span style={{fontSize:'12px',color:'#6b7280',background:'#f0f2f8',padding:'3px 10px',borderRadius:'100px'}}>{template}</span>
        </div>
        <div style={{display:'flex',gap:'8px'}}>
          <button onClick={handleDownload} style={{padding:'8px 18px',background:'#1a56db',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'500'}}>📥 Télécharger PDF</button>
          <button onClick={() => onSave(cv)} style={{padding:'8px 18px',background:'#16a34a',color:'#fff',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'500'}}>✅ Sauvegarder</button>
          <button onClick={onClose} style={{padding:'8px 18px',background:'#f0f2f8',color:'#374151',border:'none',borderRadius:'8px',cursor:'pointer',fontSize:'13px',fontWeight:'500'}}>✕ Fermer</button>
        </div>
      </div>

      {/* Body */}
      <div style={{display:'grid',gridTemplateColumns:'420px 1fr',flex:1,overflow:'hidden'}}>

        {/* Left — Éditeur */}
        <div style={{background:'#f7f8fc',borderRight:'1px solid #e5e7ef',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {/* Tabs */}
          <div style={{display:'flex',gap:'4px',padding:'12px 16px',borderBottom:'1px solid #e5e7ef',flexWrap:'wrap'}}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                padding:'6px 12px',borderRadius:'8px',border:'none',cursor:'pointer',
                fontSize:'12px',fontWeight:'500',transition:'all 0.15s',
                background: activeSection === s.id ? '#1a56db' : '#fff',
                color: activeSection === s.id ? '#fff' : '#374151'
              }}>{s.label}</button>
            ))}
          </div>

          {/* Fields */}
          <div style={{flex:1,overflowY:'auto',padding:'20px 16px'}}>

            {/* ─── SECTION PHOTO ─── */}
            {activeSection === 'photo' && (
              <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                <div style={{fontSize:'13px',color:'#6b7280',lineHeight:'1.6'}}>
                  La photo est <strong>100% optionnelle</strong>. Une photo de démonstration est affichée par défaut — tu peux la remplacer par la tienne ou choisir de ne pas en mettre du tout.
                </div>

                {/* État actuel de la photo */}
                {cv.photo === null ? (
                  /* null = pas de photo du tout */
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
                    <div style={{width:'100px',height:'100px',borderRadius:'50%',background:'#f0f0f0',border:'2px dashed #ccc',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'32px'}}>
                      🚫
                    </div>
                    <div style={{fontSize:'12px',color:'#6b7280',textAlign:'center'}}>Aucune photo sur le CV</div>
                    <button onClick={() => setCv({...cv, photo: undefined})} style={{padding:'6px 14px',background:'#f0f2f8',color:'#374151',border:'1px solid #e5e7ef',borderRadius:'8px',cursor:'pointer',fontSize:'12px'}}>
                      ↩ Réafficher la photo de démo
                    </button>
                  </div>
                ) : cv.photo ? (
                  /* Vraie photo uploadée */
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}>
                    <img src={cv.photo} alt="Photo CV" loading="lazy" style={{width:'100px',height:'100px',borderRadius:'50%',objectFit:'cover',border:'3px solid #1a56db'}} />
                    <div style={{fontSize:'12px',color:'#16a34a',fontWeight:'500'}}>✓ Ta photo est ajoutée</div>
                    <button onClick={() => setCv({...cv, photo: null})} style={{padding:'8px 16px',background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'8px',cursor:'pointer',fontSize:'13px'}}>
                      🗑 Supprimer — ne pas mettre de photo
                    </button>
                  </div>
                ) : (
                  /* undefined = photo de démo affichée */
                  <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}>
                    <div style={{position:'relative'}}>
                      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face" alt="Photo démo" loading="lazy" style={{width:'100px',height:'100px',borderRadius:'50%',objectFit:'cover',border:'2px dashed #aaa',opacity:0.7}} />
                      <div style={{position:'absolute',bottom:0,right:0,background:'#fbbf24',borderRadius:'50%',width:'24px',height:'24px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px'}}>📷</div>
                    </div>
                    <div style={{fontSize:'11px',color:'#9ca3af',textAlign:'center'}}>Photo de démonstration — remplace-la par la tienne</div>
                    <button onClick={() => setCv({...cv, photo: null})} style={{padding:'8px 16px',background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'8px',cursor:'pointer',fontSize:'12px'}}>
                      🚫 Ne pas mettre de photo sur mon CV
                    </button>
                  </div>
                )}

                {/* Zone d'upload */}
                <label style={{display:'block',cursor:'pointer'}}>
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} style={{display:'none'}} />
                  <div style={{
                    border:'2px dashed #c7d9ff',borderRadius:'12px',padding:'24px',
                    textAlign:'center',background:'#eff4ff',cursor:'pointer',
                    transition:'all 0.15s'
                  }}>
                    <div style={{fontSize:'32px',marginBottom:'8px'}}>📷</div>
                    <div style={{fontSize:'13px',fontWeight:'600',color:'#1a56db',marginBottom:'4px'}}>
                      {cv.photo ? 'Changer ma photo' : 'Uploader ma photo'}
                    </div>
                    <div style={{fontSize:'11px',color:'#6b7280'}}>JPG, PNG · Max 2 Mo</div>
                  </div>
                </label>

                <div style={{padding:'12px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:'8px',fontSize:'12px',color:'#92400e'}}>
                  💡 Conseil : utilise une photo professionnelle sur fond neutre, bien éclairée.
                </div>
              </div>
            )}

            {/* ─── SECTION INFOS ─── */}
            {activeSection === 'infos' && (
              <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
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
                    <label style={{fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'5px'}}>{label}</label>
                    <input value={cv[key] || ''} onChange={e => setCv({...cv, [key]: e.target.value})} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={{fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px',display:'block',marginBottom:'5px'}}>Accroche</label>
                  <textarea value={cv.accroche || ''} onChange={e => setCv({...cv, accroche: e.target.value})} rows={4} style={{...inputStyle, resize:'vertical'}} />
                </div>
              </div>
            )}

            {/* ─── SECTION EXPÉRIENCES ─── */}
            {activeSection === 'experiences' && (
              <div>
                {cv.experiences?.map((exp, i) => (
                  <div key={i} style={{background:'#fff',border:'1px solid #e5e7ef',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                      <span style={{fontSize:'13px',fontWeight:'700',color:'#1a56db'}}>Expérience {i+1}</span>
                      <button onClick={() => setCv({...cv, experiences: cv.experiences.filter((_,j) => j !== i)})} style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'6px',padding:'3px 10px',fontSize:'12px',cursor:'pointer'}}>✕ Supprimer</button>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                      {[{label:'Poste',key:'poste'},{label:'Entreprise',key:'entreprise'},{label:'Période',key:'periode'},{label:'Lieu',key:'lieu'}].map(({label,key})=>(
                        <div key={key}>
                          <label style={{fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase',display:'block',marginBottom:'4px'}}>{label}</label>
                          <input value={exp[key]||''} onChange={e=>{const exps=[...cv.experiences];exps[i]={...exps[i],[key]:e.target.value};setCv({...cv,experiences:exps})}} style={{...inputStyle,fontSize:'13px'}} />
                        </div>
                      ))}
                      <div>
                        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                          <label style={{fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase'}}>Missions</label>
                          <button onClick={()=>{const exps=[...cv.experiences];exps[i].missions=[...(exps[i].missions||[]),''];setCv({...cv,experiences:exps})}} style={{background:'#eff4ff',color:'#1a56db',border:'1px solid #c7d9ff',borderRadius:'6px',padding:'3px 10px',fontSize:'11px',cursor:'pointer'}}>+ Mission</button>
                        </div>
                        {exp.missions?.map((m,j)=>(
                          <div key={j} style={{display:'flex',gap:'6px',marginBottom:'6px'}}>
                            <input value={m||''} onChange={e=>{const exps=[...cv.experiences];exps[i].missions[j]=e.target.value;setCv({...cv,experiences:exps})}} style={{...inputStyle,flex:1,fontSize:'13px'}} placeholder={`Mission ${j+1}`} />
                            <button onClick={()=>{const exps=[...cv.experiences];exps[i].missions=exps[i].missions.filter((_,k)=>k!==j);setCv({...cv,experiences:exps})}} style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'6px',padding:'4px 10px',fontSize:'12px',cursor:'pointer'}}>✕</button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>setCv({...cv,experiences:[...(cv.experiences||[]),{poste:'',entreprise:'',periode:'',lieu:'',missions:['']}]})} style={{width:'100%',padding:'10px',background:'#eff4ff',color:'#1a56db',border:'1px solid #c7d9ff',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>
                  + Ajouter une expérience
                </button>
              </div>
            )}

            {/* ─── SECTION FORMATIONS ─── */}
            {activeSection === 'formations' && (
              <div>
                {cv.formations?.map((f, i) => (
                  <div key={i} style={{background:'#fff',border:'1px solid #e5e7ef',borderRadius:'12px',padding:'16px',marginBottom:'16px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
                      <span style={{fontSize:'13px',fontWeight:'700',color:'#1a56db'}}>Formation {i+1}</span>
                      <button onClick={()=>setCv({...cv,formations:cv.formations.filter((_,j)=>j!==i)})} style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'6px',padding:'3px 10px',fontSize:'12px',cursor:'pointer'}}>✕ Supprimer</button>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
                      {[{label:'Diplôme',key:'diplome'},{label:'Établissement',key:'etablissement'},{label:'Période',key:'periode'},{label:'Mention',key:'mention'}].map(({label,key})=>(
                        <div key={key}>
                          <label style={{fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase',display:'block',marginBottom:'4px'}}>{label}</label>
                          <input value={f[key]||''} onChange={e=>{const fors=[...cv.formations];fors[i]={...fors[i],[key]:e.target.value};setCv({...cv,formations:fors})}} style={{...inputStyle,fontSize:'13px'}} />
                        </div>
                      ))}
                      <div>
                        <label style={{fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase',display:'block',marginBottom:'4px'}}>Description</label>
                        <textarea value={f.description||''} onChange={e=>{const fors=[...cv.formations];fors[i]={...fors[i],description:e.target.value};setCv({...cv,formations:fors})}} rows={3} style={{...inputStyle,resize:'vertical',fontSize:'13px'}} placeholder="Cours, projets, spécialités..." />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>setCv({...cv,formations:[...(cv.formations||[]),{diplome:'',etablissement:'',periode:'',mention:'',description:''}]})} style={{width:'100%',padding:'10px',background:'#eff4ff',color:'#1a56db',border:'1px solid #c7d9ff',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>
                  + Ajouter une formation
                </button>
              </div>
            )}

            {/* ─── SECTION COMPÉTENCES ─── */}
            {activeSection === 'competences' && (
              <div>
                <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                  {cv.competences?.map((c, i) => (
                    <div key={i} style={{display:'flex',gap:'8px',alignItems:'center'}}>
                      <input value={c||''} onChange={e=>{const comps=[...cv.competences];comps[i]=e.target.value;setCv({...cv,competences:comps})}} style={{...inputStyle,flex:1,fontSize:'14px'}} placeholder={`Compétence ${i+1}`} />
                      <button onClick={()=>setCv({...cv,competences:cv.competences.filter((_,j)=>j!==i)})} style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'6px',padding:'6px 10px',fontSize:'12px',cursor:'pointer'}}>✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={()=>setCv({...cv,competences:[...(cv.competences||[]),'']})} style={{width:'100%',padding:'10px',background:'#eff4ff',color:'#1a56db',border:'1px solid #c7d9ff',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer',marginTop:'12px'}}>
                  + Ajouter une compétence
                </button>
              </div>
            )}

            {/* ─── SECTION LANGUES ─── */}
            {activeSection === 'langues' && (
              <div>
                {cv.langues?.map((l, i) => (
                  <div key={i} style={{background:'#fff',border:'1px solid #e5e7ef',borderRadius:'12px',padding:'16px',marginBottom:'12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
                      <span style={{fontSize:'13px',fontWeight:'700',color:'#1a56db'}}>Langue {i+1}</span>
                      <button onClick={()=>setCv({...cv,langues:cv.langues.filter((_,j)=>j!==i)})} style={{background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'6px',padding:'3px 10px',fontSize:'12px',cursor:'pointer'}}>✕</button>
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                      <div>
                        <label style={{fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase',display:'block',marginBottom:'4px'}}>Langue</label>
                        <input value={l.langue||''} onChange={e=>{const langs=[...cv.langues];langs[i]={...langs[i],langue:e.target.value};setCv({...cv,langues:langs})}} style={{...inputStyle,fontSize:'13px'}} />
                      </div>
                      <div>
                        <label style={{fontSize:'11px',fontWeight:'700',color:'#6b7280',textTransform:'uppercase',display:'block',marginBottom:'4px'}}>Niveau</label>
                        <select value={l.niveau||''} onChange={e=>{const langs=[...cv.langues];langs[i]={...langs[i],niveau:e.target.value};setCv({...cv,langues:langs})}} style={{...inputStyle,fontSize:'13px'}}>
                          <option value="">— Sélectionner —</option>
                          <option>Natif</option>
                          <option>C2 — Maîtrise</option>
                          <option>C1 — Autonome avancé</option>
                          <option>B2 — Intermédiaire avancé</option>
                          <option>B1 — Intermédiaire</option>
                          <option>A2 — Élémentaire</option>
                          <option>A1 — Débutant</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={()=>setCv({...cv,langues:[...(cv.langues||[]),{langue:'',niveau:''}]})} style={{width:'100%',padding:'10px',background:'#eff4ff',color:'#1a56db',border:'1px solid #c7d9ff',borderRadius:'8px',fontSize:'13px',fontWeight:'500',cursor:'pointer'}}>
                  + Ajouter une langue
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Right — Aperçu en temps réel */}
        <div style={{background:'#e5e7ef',overflow:'auto',display:'flex',alignItems:'flex-start',justifyContent:'center',padding:'24px'}}>
          <div style={{transform:'scale(0.75)',transformOrigin:'top center',width:'794px',flexShrink:0}}>
            <CVTemplate cvData={cv} template={template} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default CVEditor