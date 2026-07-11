// CVTemplatesExtra.jsx — 12 templates spécialisés

function Avatar({ cvData, size = 70, shape = 'circle' }) {
  const PHOTO_DEMO = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face'
  const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? '12px' : '4px'
  if (cvData.photo === null) return null
  const src = cvData.photo || PHOTO_DEMO
  return <img src={src} alt="Photo" style={{width:size,height:size,borderRadius,objectFit:'cover',display:'block',flexShrink:0}} />
}

function getF(cvData) {
  const nbExp = cvData.experiences?.length || 0
  const total = cvData.experiences?.reduce((a,e)=>a+(e.missions?.length||0),0)||0
  const density = nbExp + total*0.3 + (cvData.formations?.length||0)*0.5
  if (density < 5)  return {base:'11px',small:'10px',xs:'9px',lh:'2.0',mb:'13px'}
  if (density < 9)  return {base:'11px',small:'10px',xs:'9px',lh:'1.85',mb:'11px'}
  if (density < 14) return {base:'11px',small:'10px',xs:'8.5px',lh:'1.7',mb:'9px'}
  if (density < 18) return {base:'10.5px',small:'9.5px',xs:'8px',lh:'1.55',mb:'7px'}
  return {base:'10px',small:'9px',xs:'7.5px',lh:'1.4',mb:'5px'}
}

// ─── ÉTUDIANT ────────────────────────────────────────────────
export function TemplateEtudiant({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',boxSizing:'border-box',display:'flex',flexDirection:'column'}}>
      <div style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed)',padding:'28px 36px',color:'#fff',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
          <Avatar cvData={cvData} size={72} shape="circle" />
          <div style={{flex:1}}>
            <div style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.7)',marginBottom:'4px'}}>{cvData.titre}</div>
            <h1 style={{fontSize:'26px',fontWeight:'800',color:'#fff',margin:'0 0 8px'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{display:'flex',gap:'16px',fontSize:'10px',color:'rgba(255,255,255,0.8)'}}><span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span></div>
          </div>
          <div style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'8px',padding:'8px 14px',textAlign:'center'}}>
            <div style={{fontSize:'18px'}}>🎓</div>
            <div style={{fontSize:'9px',color:'rgba(255,255,255,0.8)',fontWeight:'600'}}>ÉTUDIANT</div>
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 230px',flex:1,overflow:'hidden'}}>
        <div style={{padding:'20px 24px',display:'flex',flexDirection:'column'}}>
          {cvData.accroche && <div style={{marginBottom:f.mb,padding:'12px',background:'#f5f3ff',borderRadius:'8px',borderLeft:'3px solid #7c3aed',flexShrink:0}}><p style={{fontSize:f.small,color:'#4c1d95',margin:0,lineHeight:f.lh,fontStyle:'italic'}}>{cvData.accroche}</p></div>}
          <div style={{marginBottom:f.mb,flexShrink:0}}>
            <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#4f46e5',marginBottom:'8px'}}>FORMATIONS</div>
            {cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb,padding:'10px 12px',background:'#f5f3ff',borderRadius:'8px'}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#7c3aed'}}>{f2.etablissement}</div>{f2.description&&<div style={{fontSize:f.xs,color:'#6b7280',fontStyle:'italic'}}>{f2.description}</div>}</div><div style={{fontSize:'9px',color:'#9ca3af',background:'#ede9fe',padding:'1px 7px',borderRadius:'10px'}}>{f2.periode}</div></div></div>)}
          </div>
          {cvData.experiences?.length > 0 && <div style={{flexShrink:0}}>
            <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#4f46e5',marginBottom:'8px'}}>EXPÉRIENCES & STAGES</div>
            {cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#6b7280'}}>{exp.entreprise} · {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#9ca3af'}}>{exp.periode}</div></div><ul style={{paddingLeft:'14px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#374151',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}
          </div>}
        </div>
        <div style={{background:'#faf5ff',padding:'20px 16px',borderLeft:'1px solid #ede9fe'}}>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'8px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{background:'#ede9fe',color:'#5b21b6',padding:'4px 10px',borderRadius:'6px',fontSize:f.xs,marginBottom:'5px',fontWeight:'500'}}>{c}</div>)}</div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,marginBottom:'4px',display:'flex',justifyContent:'space-between'}}><span>{l.langue}</span><span style={{color:'#7c3aed',fontSize:f.xs}}>{l.niveau}</span></div>)}</div>
          {cvData.certifications?.length>0&&<div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'8px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#374151',marginBottom:'3px'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length>0&&<div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'8px'}}>CENTRES D'INTÉRÊT</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xs,color:'#374151',marginBottom:'3px'}}>• {ci}</div>)}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── ALTERNANCE ──────────────────────────────────────────────
export function TemplateAlternance({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#ea580c',padding:'24px 36px',color:'#fff',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <Avatar cvData={cvData} size={64} shape="circle" />
            <div>
              <div style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.75)',marginBottom:'3px'}}>{cvData.titre}</div>
              <h1 style={{fontSize:'24px',fontWeight:'800',color:'#fff',margin:'0 0 6px'}}>{cvData.prenom} {cvData.nom}</h1>
              <div style={{display:'flex',gap:'14px',fontSize:'10px',color:'rgba(255,255,255,0.85)'}}><span>{cvData.email}</span><span>{cvData.telephone}</span><span>📍 {cvData.ville}</span></div>
            </div>
          </div>
          <div style={{background:'rgba(255,255,255,0.15)',border:'2px solid rgba(255,255,255,0.4)',borderRadius:'10px',padding:'10px 16px',textAlign:'center'}}>
            <div style={{fontSize:'11px',fontWeight:'800',color:'#fff',letterSpacing:'1px'}}>RECHERCHE</div>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.85)'}}>ALTERNANCE</div>
          </div>
        </div>
      </div>
      <div style={{padding:'18px 36px',flex:1,display:'grid',gridTemplateColumns:'1fr 220px',gap:'24px',overflow:'hidden'}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          {cvData.accroche&&<div style={{marginBottom:f.mb,padding:'10px 14px',background:'#fff7ed',borderLeft:'3px solid #ea580c',borderRadius:'0 8px 8px 0',flexShrink:0}}><p style={{fontSize:f.small,color:'#7c2d12',margin:0,lineHeight:f.lh}}>{cvData.accroche}</p></div>}
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#ea580c',textTransform:'uppercase',marginBottom:'8px',paddingBottom:'4px',borderBottom:'2px solid #ea580c'}}>FORMATIONS</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#ea580c'}}>{f2.etablissement}</div>{f2.description&&<div style={{fontSize:f.xs,color:'#6b7280',fontStyle:'italic'}}>{f2.description}</div>}</div><div style={{fontSize:'9px',color:'#9ca3af'}}>{f2.periode}</div></div></div>)}</div>
          {cvData.experiences?.length>0&&<div style={{flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#ea580c',textTransform:'uppercase',marginBottom:'8px',paddingBottom:'4px',borderBottom:'2px solid #ea580c'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#6b7280'}}>{exp.entreprise} · {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#9ca3af'}}>{exp.periode}</div></div><ul style={{paddingLeft:'14px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#374151',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>}
        </div>
        <div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#ea580c',textTransform:'uppercase',marginBottom:'8px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'5px'}}><div style={{width:'4px',height:'4px',background:'#ea580c',borderRadius:'50%',flexShrink:0}}></div><div style={{fontSize:f.small,color:'#374151'}}>{c}</div></div>)}</div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#ea580c',textTransform:'uppercase',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,marginBottom:'5px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><span style={{fontWeight:'600'}}>{l.langue}</span><span style={{color:'#6b7280',fontSize:f.xs}}>{l.niveau}</span></div><div style={{height:'3px',background:'#fed7aa',borderRadius:'2px'}}><div style={{height:'100%',width:l.niveau?.includes('Natif')||l.niveau?.includes('C')?'100%':l.niveau?.includes('B')?'70%':'45%',background:'#ea580c',borderRadius:'2px'}}></div></div></div>)}</div>
          {cvData.certifications?.length>0&&<div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#ea580c',textTransform:'uppercase',marginBottom:'8px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#374151',marginBottom:'3px'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length>0&&<div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#ea580c',textTransform:'uppercase',marginBottom:'8px'}}>CENTRES D'INTÉRÊT</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xs,color:'#374151',marginBottom:'3px'}}>• {ci}</div>)}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── PORTFOLIO ───────────────────────────────────────────────
export function TemplatePortfolio({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#0f0f23',color:'#e2e8f0',width:'794px',height:'1123px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'30px 36px',borderBottom:'1px solid rgba(255,255,255,0.08)',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
          <div style={{width:'76px',height:'76px',borderRadius:'50%',background:'linear-gradient(135deg,#f093fb,#667eea)',padding:'2px',flexShrink:0}}><Avatar cvData={cvData} size={72} shape="circle" /></div>
          <div style={{flex:1}}>
            <div style={{fontSize:'9px',letterSpacing:'3px',textTransform:'uppercase',color:'#a78bfa',marginBottom:'4px'}}>{cvData.titre}</div>
            <h1 style={{fontSize:'28px',fontWeight:'900',color:'#fff',margin:'0 0 8px',letterSpacing:'-1px'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{display:'flex',gap:'16px',fontSize:'9px',color:'#94a3b8'}}><span>{cvData.email}</span><span>{cvData.telephone}</span><span>{cvData.ville}</span></div>
          </div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 220px',flex:1,overflow:'hidden'}}>
        <div style={{padding:'20px 24px 20px 36px',display:'flex',flexDirection:'column'}}>
          {cvData.accroche&&<div style={{marginBottom:f.mb,padding:'12px 16px',background:'rgba(102,126,234,0.1)',borderLeft:'3px solid #667eea',borderRadius:'0 8px 8px 0',flexShrink:0}}><p style={{fontSize:f.small,color:'#c7d2fe',margin:0,lineHeight:f.lh}}>{cvData.accroche}</p></div>}
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#f093fb',marginBottom:'10px'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb,paddingLeft:'12px',borderLeft:'2px solid rgba(240,147,251,0.3)'}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base,color:'#f1f5f9'}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#f093fb'}}>{exp.entreprise} · {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#64748b',background:'rgba(255,255,255,0.05)',padding:'1px 7px',borderRadius:'10px'}}>{exp.periode}</div></div><ul style={{paddingLeft:'12px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#94a3b8',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
          <div style={{flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#f093fb',marginBottom:'10px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb,paddingLeft:'12px',borderLeft:'2px solid rgba(240,147,251,0.3)'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#f1f5f9'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#667eea'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
        </div>
        <div style={{padding:'20px',borderLeft:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'10px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{marginBottom:'5px'}}><div style={{fontSize:f.xs,color:'#94a3b8',marginBottom:'2px'}}>{c}</div><div style={{height:'2px',background:'rgba(255,255,255,0.06)',borderRadius:'1px'}}><div style={{height:'100%',width:`${88-i*6}%`,background:'linear-gradient(90deg,#f093fb,#667eea)',borderRadius:'1px'}}></div></div></div>)}</div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,color:'#94a3b8',marginBottom:'4px'}}>{l.langue} <span style={{color:'#667eea'}}>· {l.niveau}</span></div>)}</div>
          {cvData.certifications?.length>0&&<div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'8px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#94a3b8',marginBottom:'3px'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length>0&&<div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'8px'}}>INTÉRÊTS</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xs,color:'#94a3b8',marginBottom:'3px'}}>• {ci}</div>)}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── SANTÉ ───────────────────────────────────────────────────
export function TemplateSante({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Arial,sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#0d9488',padding:'24px 36px',color:'#fff',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'18px'}}>
          <Avatar cvData={cvData} size={66} shape="circle" />
          <div style={{flex:1}}>
            <div style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.75)',marginBottom:'3px'}}>{cvData.titre}</div>
            <h1 style={{fontSize:'23px',fontWeight:'700',color:'#fff',margin:'0 0 7px'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{display:'flex',gap:'16px',fontSize:'9px',color:'rgba(255,255,255,0.85)'}}><span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span></div>
          </div>
          <div style={{background:'rgba(255,255,255,0.15)',border:'1px solid rgba(255,255,255,0.3)',borderRadius:'8px',padding:'8px 14px',textAlign:'center'}}><div style={{fontSize:'18px'}}>🏥</div><div style={{fontSize:'9px',color:'rgba(255,255,255,0.8)',fontWeight:'600'}}>SANTÉ</div></div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 210px',flex:1,overflow:'hidden'}}>
        <div style={{padding:'18px 22px',display:'flex',flexDirection:'column'}}>
          {cvData.accroche&&<div style={{marginBottom:f.mb,padding:'10px 14px',background:'#f0fdfa',borderLeft:'3px solid #0d9488',flexShrink:0}}><p style={{fontSize:f.small,color:'#134e4a',margin:0,lineHeight:f.lh}}>{cvData.accroche}</p></div>}
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#0d9488',textTransform:'uppercase',borderBottom:'2px solid #0d9488',paddingBottom:'3px',marginBottom:'8px'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#0d9488',fontStyle:'italic'}}>{exp.entreprise} — {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#6b7280'}}>{exp.periode}</div></div><ul style={{paddingLeft:'14px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#374151',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
          <div style={{flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#0d9488',textTransform:'uppercase',borderBottom:'2px solid #0d9488',paddingBottom:'3px',marginBottom:'8px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#0d9488'}}>{f2.etablissement}</div>{f2.description&&<div style={{fontSize:f.xs,color:'#6b7280',fontStyle:'italic'}}>{f2.description}</div>}</div><div style={{fontSize:'9px',color:'#6b7280'}}>{f2.periode}</div></div></div>)}</div>
        </div>
        <div style={{background:'#f0fdfa',padding:'18px 16px',borderLeft:'1px solid #ccfbf1'}}>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#0d9488',textTransform:'uppercase',marginBottom:'8px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{background:'#fff',border:'1px solid #99f6e4',color:'#0f766e',padding:'3px 8px',borderRadius:'6px',fontSize:f.xs,marginBottom:'4px',fontWeight:'500'}}>{c}</div>)}</div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#0d9488',textTransform:'uppercase',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,marginBottom:'4px'}}><span style={{fontWeight:'600'}}>{l.langue}</span> <span style={{color:'#0d9488',fontSize:f.xs}}>— {l.niveau}</span></div>)}</div>
          {cvData.certifications?.length>0&&<div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#0d9488',textTransform:'uppercase',marginBottom:'8px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#134e4a',marginBottom:'3px',fontWeight:'500'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length>0&&<div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#0d9488',textTransform:'uppercase',marginBottom:'8px'}}>INTÉRÊTS</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xs,color:'#374151',marginBottom:'3px'}}>• {ci}</div>)}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── COMMERCIAL ──────────────────────────────────────────────
export function TemplateCommercial({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Arial,sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#dc2626',padding:'22px 36px',color:'#fff',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'18px',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <Avatar cvData={cvData} size={64} shape="circle" />
            <div>
              <div style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.75)',marginBottom:'3px'}}>{cvData.titre}</div>
              <h1 style={{fontSize:'24px',fontWeight:'900',color:'#fff',margin:'0 0 7px',textTransform:'uppercase'}}>{cvData.prenom} {cvData.nom}</h1>
              <div style={{display:'flex',gap:'14px',fontSize:'9px',color:'rgba(255,255,255,0.85)'}}><span>{cvData.email}</span><span>{cvData.telephone}</span><span>{cvData.ville}</span></div>
            </div>
          </div>
          <div style={{fontSize:'28px',fontWeight:'900',color:'rgba(255,255,255,0.2)',letterSpacing:'-2px'}}>SALES</div>
        </div>
      </div>
      {cvData.accroche&&<div style={{padding:'12px 36px',background:'#fef2f2',borderBottom:'1px solid #fecaca',flexShrink:0}}><p style={{fontSize:f.small,color:'#7f1d1d',margin:0,lineHeight:f.lh,fontStyle:'italic'}}>{cvData.accroche}</p></div>}
      <div style={{padding:'16px 36px',flex:1,display:'grid',gridTemplateColumns:'1fr 240px',gap:'24px',overflow:'hidden'}}>
        <div style={{display:'flex',flexDirection:'column'}}>
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'900',textTransform:'uppercase',color:'#dc2626',borderBottom:'3px solid #dc2626',paddingBottom:'3px',marginBottom:'8px'}}>EXPÉRIENCES COMMERCIALES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#dc2626',fontWeight:'600'}}>{exp.entreprise} · {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#6b7280',background:'#fef2f2',padding:'1px 7px',borderRadius:'3px'}}>{exp.periode}</div></div><ul style={{paddingLeft:'14px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#374151',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
          <div style={{flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'900',textTransform:'uppercase',color:'#dc2626',borderBottom:'3px solid #dc2626',paddingBottom:'3px',marginBottom:'8px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#6b7280'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
        </div>
        <div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'900',textTransform:'uppercase',color:'#dc2626',borderBottom:'3px solid #dc2626',paddingBottom:'3px',marginBottom:'8px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{fontSize:f.small,color:'#374151',padding:'4px 0',borderBottom:'1px solid #f5f5f5',display:'flex',alignItems:'center',gap:'6px'}}><div style={{width:'4px',height:'4px',background:'#dc2626',borderRadius:'50%',flexShrink:0}}></div>{c}</div>)}</div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'900',textTransform:'uppercase',color:'#dc2626',borderBottom:'3px solid #dc2626',paddingBottom:'3px',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{marginBottom:'6px'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:f.small,marginBottom:'2px'}}><span style={{fontWeight:'600'}}>{l.langue}</span><span style={{color:'#6b7280',fontSize:f.xs}}>{l.niveau}</span></div><div style={{height:'3px',background:'#fee2e2',borderRadius:'2px'}}><div style={{height:'100%',width:l.niveau?.includes('Natif')||l.niveau?.includes('C')?'100%':l.niveau?.includes('B')?'70%':'45%',background:'#dc2626',borderRadius:'2px'}}></div></div></div>)}</div>
          {cvData.certifications?.length>0&&<div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'900',textTransform:'uppercase',color:'#dc2626',borderBottom:'3px solid #dc2626',paddingBottom:'3px',marginBottom:'8px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#374151',marginBottom:'3px'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length>0&&<div><div style={{fontSize:'8px',fontWeight:'900',textTransform:'uppercase',color:'#dc2626',borderBottom:'3px solid #dc2626',paddingBottom:'3px',marginBottom:'8px'}}>INTÉRÊTS</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xs,color:'#374151',marginBottom:'3px'}}>• {ci}</div>)}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── STARTUP ─────────────────────────────────────────────────
export function TemplateStartup({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#0f172a',color:'#e2e8f0',width:'794px',height:'1123px',overflow:'hidden',padding:'36px 40px',boxSizing:'border-box',display:'flex',flexDirection:'column'}}>
      <div style={{marginBottom:'22px',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px',marginBottom:'16px'}}>
          <Avatar cvData={cvData} size={64} shape="rounded" />
          <div style={{flex:1}}>
            <div style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'#38bdf8',marginBottom:'4px'}}>{cvData.titre}</div>
            <h1 style={{fontSize:'28px',fontWeight:'800',color:'#f1f5f9',margin:'0',letterSpacing:'-1px'}}>{cvData.prenom} {cvData.nom}</h1>
          </div>
          <div style={{textAlign:'right',fontSize:'9px',color:'#64748b'}}><div>{cvData.email}</div><div>{cvData.telephone}</div><div>{cvData.ville}</div></div>
        </div>
        <div style={{height:'1px',background:'linear-gradient(90deg,#38bdf8,transparent)'}}></div>
      </div>
      {cvData.accroche&&<div style={{marginBottom:'18px',padding:'12px 16px',background:'rgba(56,189,248,0.07)',border:'1px solid rgba(56,189,248,0.15)',borderRadius:'8px',flexShrink:0}}><p style={{fontSize:f.small,color:'#94a3b8',margin:0,lineHeight:f.lh}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'18px',flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#38bdf8',marginBottom:'12px'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'90px 1fr',gap:'14px',marginBottom:f.mb}}><div style={{fontSize:'9px',color:'#475569',paddingTop:'2px'}}>{exp.periode}</div><div><div style={{fontWeight:'600',fontSize:f.base,color:'#f1f5f9'}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#38bdf8',marginBottom:'4px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#94a3b8',marginBottom:'2px'}}>{m}</li>)}</ul></div></div>)}</div>
      <div style={{marginBottom:'18px',flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#38bdf8',marginBottom:'12px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'90px 1fr',gap:'14px',marginBottom:f.mb}}><div style={{fontSize:'9px',color:'#475569'}}>{f2.periode}</div><div><div style={{fontWeight:'600',fontSize:f.base,color:'#f1f5f9'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#64748b'}}>{f2.etablissement}</div></div></div>)}</div>
      <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',paddingTop:'16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',flexShrink:0}}>
        <div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#38bdf8',marginBottom:'10px'}}>COMPÉTENCES</div><div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{border:'1px solid rgba(56,189,248,0.25)',color:'#94a3b8',padding:'2px 8px',fontSize:f.xs,borderRadius:'4px'}}>{c}</span>)}</div></div>
        <div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#38bdf8',marginBottom:'10px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,color:'#94a3b8',marginBottom:'4px'}}>{l.langue} <span style={{color:'#475569'}}>— {l.niveau}</span></div>)}</div>
      </div>
    </div>
  )
}

// ─── CLASSIQUE ───────────────────────────────────────────────
export function TemplateClassique({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Times New Roman",Georgia,serif',fontSize:f.base,lineHeight:f.lh,background:'#fff',color:'#111',width:'794px',height:'1123px',overflow:'hidden',padding:'44px 50px',boxSizing:'border-box',display:'flex',flexDirection:'column'}}>
      <div style={{textAlign:'center',marginBottom:'16px',paddingBottom:'12px',borderBottom:'2px solid #111',flexShrink:0}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}><Avatar cvData={cvData} size={60} shape="circle" /></div>
        <h1 style={{fontSize:'24px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',margin:'0 0 4px'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{fontSize:f.small,color:'#444',fontStyle:'italic',marginBottom:'6px'}}>{cvData.titre}</div>
        <div style={{display:'flex',justifyContent:'center',gap:'20px',fontSize:f.xs,color:'#555'}}><span>{cvData.email}</span><span>|</span><span>{cvData.telephone}</span><span>|</span><span>{cvData.ville}</span></div>
      </div>
      {cvData.accroche&&<div style={{marginBottom:f.mb,textAlign:'center',flexShrink:0}}><p style={{fontSize:f.small,color:'#333',fontStyle:'italic',margin:0,lineHeight:f.lh}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'2px',borderBottom:'1px solid #111',paddingBottom:'3px',marginBottom:'8px'}}>EXPÉRIENCES PROFESSIONNELLES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><div><span style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</span><span style={{color:'#555',fontStyle:'italic'}}> — {exp.entreprise}, {exp.lieu}</span></div><span style={{fontSize:f.xs,color:'#555'}}>{exp.periode}</span></div><ul style={{paddingLeft:'18px',margin:0,listStyleType:'disc'}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#222',marginBottom:'2px',lineHeight:f.lh}}>{m}</li>)}</ul></div>)}</div>
      <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'2px',borderBottom:'1px solid #111',paddingBottom:'3px',marginBottom:'8px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:f.mb}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,fontStyle:'italic',color:'#444'}}>{f2.etablissement}{f2.mention?` — ${f2.mention}`:''}</div></div><div style={{fontSize:f.xs,color:'#555'}}>{f2.periode}</div></div>)}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',flexShrink:0}}>
        <div><div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'2px',borderBottom:'1px solid #111',paddingBottom:'3px',marginBottom:'8px'}}>COMPÉTENCES</div><div style={{fontSize:f.small,color:'#222',lineHeight:'1.8'}}>{cvData.competences?.join(' · ')}</div></div>
        <div><div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'2px',borderBottom:'1px solid #111',paddingBottom:'3px',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,color:'#222',marginBottom:'3px'}}>{l.langue} — <span style={{fontStyle:'italic'}}>{l.niveau}</span></div>)}</div>
      </div>
    </div>
  )
}

// ─── INTERNATIONAL ───────────────────────────────────────────
export function TemplateInternational({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{display:'grid',gridTemplateColumns:'240px 1fr',flexShrink:0}}>
        <div style={{background:'#1e3a5f',padding:'28px 20px',display:'flex',flexDirection:'column',alignItems:'center',gap:'10px'}}>
          <Avatar cvData={cvData} size={70} shape="circle" />
          <div style={{textAlign:'center'}}><div style={{fontSize:'9px',color:'rgba(255,255,255,0.6)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div><h1 style={{fontSize:'16px',fontWeight:'700',color:'#fff',margin:'0',lineHeight:'1.2'}}>{cvData.prenom}<br/>{cvData.nom}</h1></div>
        </div>
        <div style={{background:'#f59e0b',padding:'20px 24px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
          <div style={{fontSize:'11px',color:'rgba(0,0,0,0.6)',marginBottom:'4px'}}>{cvData.email}</div>
          <div style={{fontSize:'11px',color:'rgba(0,0,0,0.6)',marginBottom:'4px'}}>{cvData.telephone}</div>
          <div style={{fontSize:'11px',color:'rgba(0,0,0,0.6)',marginBottom:'4px'}}>📍 {cvData.ville}</div>
          {cvData.linkedin&&<div style={{fontSize:'11px',color:'rgba(0,0,0,0.7)',fontWeight:'600'}}>{cvData.linkedin}</div>}
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'240px 1fr',flex:1,overflow:'hidden'}}>
        <div style={{background:'#1e3a5f',color:'#e2e8f0',padding:'20px 18px',display:'flex',flexDirection:'column'}}>
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#f59e0b',marginBottom:'8px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#cbd5e1',marginBottom:'4px',display:'flex',alignItems:'center',gap:'5px'}}><div style={{width:'4px',height:'4px',background:'#f59e0b',borderRadius:'50%',flexShrink:0}}></div>{c}</div>)}</div>
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#f59e0b',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{marginBottom:'6px'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:f.xs,marginBottom:'2px'}}><span style={{color:'#e2e8f0',fontWeight:'600'}}>{l.langue}</span><span style={{color:'#94a3b8'}}>{l.niveau}</span></div><div style={{height:'2px',background:'rgba(255,255,255,0.1)',borderRadius:'1px'}}><div style={{height:'100%',width:l.niveau?.includes('Natif')||l.niveau?.includes('C')?'100%':l.niveau?.includes('B')?'70%':'45%',background:'#f59e0b',borderRadius:'1px'}}></div></div></div>)}</div>
          {cvData.certifications?.length>0&&<div style={{flexShrink:0}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#f59e0b',marginBottom:'8px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#cbd5e1',marginBottom:'3px'}}>✦ {c.titre}</div>)}</div>}
        </div>
        <div style={{padding:'20px 22px',display:'flex',flexDirection:'column'}}>
          {cvData.accroche&&<div style={{marginBottom:f.mb,padding:'10px 14px',background:'#fef3c7',borderLeft:'3px solid #f59e0b',flexShrink:0}}><p style={{fontSize:f.small,color:'#78350f',margin:0,lineHeight:f.lh}}>{cvData.accroche}</p></div>}
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#1e3a5f',marginBottom:'8px',paddingBottom:'3px',borderBottom:'2px solid #f59e0b'}}>WORK EXPERIENCE</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base,color:'#1e3a5f'}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#f59e0b',fontWeight:'600'}}>{exp.entreprise} · {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#6b7280'}}>{exp.periode}</div></div><ul style={{paddingLeft:'12px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#374151',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
          <div style={{flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#1e3a5f',marginBottom:'8px',paddingBottom:'3px',borderBottom:'2px solid #f59e0b'}}>EDUCATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base,color:'#1e3a5f'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#6b7280'}}>{f2.etablissement}</div></div><div style={{fontSize:'9px',color:'#6b7280'}}>{f2.periode}</div></div></div>)}</div>
        </div>
      </div>
    </div>
  )
}

// ─── BTP ─────────────────────────────────────────────────────
export function TemplateBTP({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Arial,Helvetica,sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#374151',padding:'22px 36px',color:'#fff',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'18px'}}>
          <Avatar cvData={cvData} size={64} shape="square" />
          <div style={{flex:1}}>
            <div style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'#9ca3af',marginBottom:'3px'}}>{cvData.titre}</div>
            <h1 style={{fontSize:'24px',fontWeight:'900',color:'#fff',margin:'0 0 7px',textTransform:'uppercase',letterSpacing:'1px'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{display:'flex',gap:'14px',fontSize:'9px',color:'#d1d5db'}}><span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span></div>
          </div>
          <div style={{background:'#f59e0b',borderRadius:'8px',padding:'8px 14px',textAlign:'center'}}><div style={{fontSize:'20px'}}>🏗️</div><div style={{fontSize:'9px',color:'#1f2937',fontWeight:'700',letterSpacing:'1px',marginTop:'2px'}}>BTP</div></div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 220px',flex:1,overflow:'hidden'}}>
        <div style={{padding:'18px 22px',display:'flex',flexDirection:'column'}}>
          {cvData.accroche&&<div style={{marginBottom:f.mb,padding:'10px 14px',background:'#f9fafb',borderLeft:'4px solid #374151',flexShrink:0}}><p style={{fontSize:f.small,color:'#374151',margin:0,lineHeight:f.lh}}>{cvData.accroche}</p></div>}
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#374151',textTransform:'uppercase',borderBottom:'3px solid #f59e0b',paddingBottom:'3px',marginBottom:'8px'}}>EXPÉRIENCES TERRAIN</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base,color:'#1f2937'}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#f59e0b',fontWeight:'600'}}>{exp.entreprise} · {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#6b7280',background:'#f3f4f6',padding:'1px 7px',borderRadius:'3px'}}>{exp.periode}</div></div><ul style={{paddingLeft:'14px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#374151',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
          <div style={{flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#374151',textTransform:'uppercase',borderBottom:'3px solid #f59e0b',paddingBottom:'3px',marginBottom:'8px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{fontWeight:'700',fontSize:f.base,color:'#1f2937'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#6b7280'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
        </div>
        <div style={{background:'#f3f4f6',padding:'18px 16px',borderLeft:'1px solid #e5e7eb'}}>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#374151',textTransform:'uppercase',marginBottom:'8px'}}>HABILITATIONS & PERMIS</div>{cvData.competences?.map((c,i)=><div key={i} style={{background:'#fff',border:'1px solid #d1d5db',color:'#374151',padding:'4px 8px',borderRadius:'5px',fontSize:f.xs,marginBottom:'4px',fontWeight:'600',display:'flex',alignItems:'center',gap:'5px'}}><span style={{color:'#f59e0b'}}>✓</span>{c}</div>)}</div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#374151',textTransform:'uppercase',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,color:'#374151',marginBottom:'4px'}}><span style={{fontWeight:'600'}}>{l.langue}</span> — {l.niveau}</div>)}</div>
          {cvData.certifications?.length>0&&<div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#374151',textTransform:'uppercase',marginBottom:'8px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#374151',marginBottom:'3px',fontWeight:'600'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length>0&&<div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#374151',textTransform:'uppercase',marginBottom:'8px'}}>INTÉRÊTS</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xs,color:'#6b7280',marginBottom:'3px'}}>• {ci}</div>)}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── RESTAURATION ────────────────────────────────────────────
export function TemplateRestauration({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Georgia,serif',fontSize:f.base,lineHeight:f.lh,background:'#fffbf5',width:'794px',height:'1123px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#92400e',padding:'24px 36px',color:'#fff',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'18px'}}>
          <Avatar cvData={cvData} size={66} shape="circle" />
          <div style={{flex:1}}>
            <div style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.7)',marginBottom:'3px'}}>{cvData.titre}</div>
            <h1 style={{fontSize:'24px',fontWeight:'700',color:'#fff',margin:'0 0 7px'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{display:'flex',gap:'14px',fontSize:'9px',color:'rgba(255,255,255,0.85)'}}><span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span></div>
          </div>
          <div style={{fontSize:'36px'}}>🍽️</div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 210px',flex:1,overflow:'hidden'}}>
        <div style={{padding:'18px 22px',display:'flex',flexDirection:'column'}}>
          {cvData.accroche&&<div style={{marginBottom:f.mb,padding:'10px 14px',background:'#fef3c7',borderLeft:'3px solid #92400e',flexShrink:0}}><p style={{fontSize:f.small,color:'#78350f',margin:0,lineHeight:f.lh,fontStyle:'italic'}}>{cvData.accroche}</p></div>}
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#92400e',textTransform:'uppercase',borderBottom:'2px solid #92400e',paddingBottom:'3px',marginBottom:'8px'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base,color:'#1f2937'}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#92400e',fontStyle:'italic'}}>{exp.entreprise} — {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#6b7280'}}>{exp.periode}</div></div><ul style={{paddingLeft:'14px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#374151',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
          <div style={{flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#92400e',textTransform:'uppercase',borderBottom:'2px solid #92400e',paddingBottom:'3px',marginBottom:'8px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{fontWeight:'700',fontSize:f.base,color:'#1f2937'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#6b7280',fontStyle:'italic'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
        </div>
        <div style={{background:'#fef3c7',padding:'18px 16px',borderLeft:'1px solid #fde68a'}}>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#92400e',textTransform:'uppercase',marginBottom:'8px'}}>SPÉCIALITÉS</div>{cvData.competences?.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#78350f',marginBottom:'5px',display:'flex',alignItems:'center',gap:'5px'}}><span style={{color:'#d97706'}}>◆</span>{c}</div>)}</div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#92400e',textTransform:'uppercase',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,color:'#78350f',marginBottom:'4px'}}><span style={{fontWeight:'600'}}>{l.langue}</span> — {l.niveau}</div>)}</div>
          {cvData.certifications?.length>0&&<div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#92400e',textTransform:'uppercase',marginBottom:'8px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#78350f',marginBottom:'3px',fontWeight:'600'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length>0&&<div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#92400e',textTransform:'uppercase',marginBottom:'8px'}}>INTÉRÊTS</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xs,color:'#78350f',marginBottom:'3px'}}>• {ci}</div>)}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── TRANSPORT ───────────────────────────────────────────────
export function TemplateTransport({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Arial,sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
      <div style={{background:'#1d4ed8',padding:'22px 36px',color:'#fff',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',gap:'18px',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <Avatar cvData={cvData} size={64} shape="circle" />
            <div>
              <div style={{fontSize:'9px',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.7)',marginBottom:'3px'}}>{cvData.titre}</div>
              <h1 style={{fontSize:'23px',fontWeight:'800',color:'#fff',margin:'0 0 7px'}}>{cvData.prenom} {cvData.nom}</h1>
              <div style={{display:'flex',gap:'14px',fontSize:'9px',color:'rgba(255,255,255,0.85)'}}><span>{cvData.email}</span><span>{cvData.telephone}</span><span>📍 {cvData.ville}</span></div>
            </div>
          </div>
          <div style={{fontSize:'36px'}}>🚛</div>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 220px',flex:1,overflow:'hidden'}}>
        <div style={{padding:'18px 22px',display:'flex',flexDirection:'column'}}>
          {cvData.accroche&&<div style={{marginBottom:f.mb,padding:'10px 14px',background:'#eff6ff',borderLeft:'4px solid #1d4ed8',flexShrink:0}}><p style={{fontSize:f.small,color:'#1e3a5f',margin:0,lineHeight:f.lh}}>{cvData.accroche}</p></div>}
          <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#1d4ed8',textTransform:'uppercase',borderBottom:'2px solid #1d4ed8',paddingBottom:'3px',marginBottom:'8px'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base,color:'#1f2937'}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#1d4ed8',fontWeight:'600'}}>{exp.entreprise} · {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#6b7280'}}>{exp.periode}</div></div><ul style={{paddingLeft:'14px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#374151',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
          <div style={{flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#1d4ed8',textTransform:'uppercase',borderBottom:'2px solid #1d4ed8',paddingBottom:'3px',marginBottom:'8px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#6b7280'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
        </div>
        <div style={{background:'#eff6ff',padding:'18px 16px',borderLeft:'1px solid #bfdbfe'}}>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#1d4ed8',textTransform:'uppercase',marginBottom:'8px'}}>PERMIS & CACES</div>{cvData.competences?.map((c,i)=><div key={i} style={{background:'#fff',border:'1px solid #bfdbfe',color:'#1e3a5f',padding:'4px 8px',borderRadius:'5px',fontSize:f.xs,marginBottom:'4px',fontWeight:'600',display:'flex',alignItems:'center',gap:'5px'}}><span style={{color:'#1d4ed8'}}>✓</span>{c}</div>)}</div>
          <div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#1d4ed8',textTransform:'uppercase',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,color:'#1e3a5f',marginBottom:'4px'}}><span style={{fontWeight:'600'}}>{l.langue}</span> — {l.niveau}</div>)}</div>
          {cvData.certifications?.length>0&&<div style={{marginBottom:f.mb}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#1d4ed8',textTransform:'uppercase',marginBottom:'8px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,color:'#1e3a5f',marginBottom:'3px',fontWeight:'600'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length>0&&<div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#1d4ed8',textTransform:'uppercase',marginBottom:'8px'}}>INTÉRÊTS</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xs,color:'#374151',marginBottom:'3px'}}>• {ci}</div>)}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── BEAUTÉ ──────────────────────────────────────────────────
export function TemplateBeaute({ cvData }) {
  const f = getF(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:f.base,lineHeight:f.lh,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'220px 1fr'}}>
      <div style={{background:'linear-gradient(160deg,#ec4899,#f9a8d4)',padding:'28px 18px',color:'#fff',display:'flex',flexDirection:'column'}}>
        <div style={{textAlign:'center',marginBottom:'18px',paddingBottom:'16px',borderBottom:'1px solid rgba(255,255,255,0.2)',flexShrink:0}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}><Avatar cvData={cvData} size={72} shape="circle" /></div>
          <div style={{fontSize:'7px',color:'rgba(255,255,255,0.7)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div>
          <h1 style={{fontSize:'17px',fontWeight:'700',color:'#fff',margin:'0',lineHeight:'1.2'}}>{cvData.prenom}<br/>{cvData.nom}</h1>
        </div>
        <div style={{marginBottom:'14px',flexShrink:0}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.7)',marginBottom:'7px'}}>CONTACT</div><div style={{fontSize:f.xs,marginBottom:'4px'}}>✉ {cvData.email}</div><div style={{fontSize:f.xs,marginBottom:'4px'}}>☎ {cvData.telephone}</div><div style={{fontSize:f.xs}}>📍 {cvData.ville}</div></div>
        <div style={{marginBottom:'14px',flexShrink:0}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.7)',marginBottom:'8px'}}>TECHNIQUES</div>{cvData.competences?.map((c,i)=><div key={i} style={{background:'rgba(255,255,255,0.15)',padding:'3px 8px',borderRadius:'20px',fontSize:f.xs,marginBottom:'4px',textAlign:'center'}}>{c}</div>)}</div>
        <div style={{marginBottom:'12px',flexShrink:0}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.7)',marginBottom:'7px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.xs,marginBottom:'3px'}}><span style={{fontWeight:'600'}}>{l.langue}</span> — {l.niveau}</div>)}</div>
        {cvData.certifications?.length>0&&<div style={{flexShrink:0}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.7)',marginBottom:'7px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xs,marginBottom:'3px'}}>✦ {c.titre}</div>)}</div>}
      </div>
      <div style={{padding:'24px 22px'}}>
        {cvData.accroche&&<div style={{marginBottom:f.mb,padding:'10px 14px',background:'#fdf2f8',borderLeft:'3px solid #ec4899',borderRadius:'0 8px 8px 0',flexShrink:0}}><p style={{fontSize:f.small,color:'#831843',margin:0,lineHeight:f.lh,fontStyle:'italic'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:f.mb,flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#ec4899',textTransform:'uppercase',borderBottom:'2px solid #f9a8d4',paddingBottom:'3px',marginBottom:'8px'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base,color:'#1f2937'}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#ec4899',fontStyle:'italic'}}>{exp.entreprise} — {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#9ca3af'}}>{exp.periode}</div></div><ul style={{paddingLeft:'14px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#374151',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
        <div style={{flexShrink:0}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#ec4899',textTransform:'uppercase',borderBottom:'2px solid #f9a8d4',paddingBottom:'3px',marginBottom:'8px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{fontWeight:'700',fontSize:f.base,color:'#1f2937'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#9ca3af',fontStyle:'italic'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
      </div>
    </div>
  )
}