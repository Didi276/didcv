// ============================================================
// CVTemplates.jsx — 16 templates avec photo optionnelle
// ============================================================

// ─── Composant Avatar réutilisable ──────────────────────────
// Affiche la photo si disponible, sinon les initiales
function Avatar({ cvData, size = 70, bg = '#1a56db', textColor = '#fff', shape = 'circle' }) {
  const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? '12px' : '4px'
  if (cvData.photo) {
    return (
      <img
        src={cvData.photo}
        alt="Photo"
        style={{
          width: size, height: size, borderRadius,
          objectFit: 'cover', display: 'block', flexShrink: 0
        }}
      />
    )
  }
  return (
    <div style={{
      width: size, height: size, borderRadius,
      background: bg, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.32,
      fontWeight: '700', color: textColor, flexShrink: 0
    }}>
      {cvData.prenom?.[0]}{cvData.nom?.[0]}
    </div>
  )
}

// ─── 1. FINANCE ──────────────────────────────────────────────
export function TemplateFinance({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'Georgia,serif',color:'#1a1a1a',fontSize:'11px',lineHeight:'1.6',padding:'40px',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{borderBottom:'3px solid #1a1a1a',paddingBottom:'14px',marginBottom:'20px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
          {cvData.photo && (
            <Avatar cvData={cvData} size={72} bg="#1a1a1a" shape="circle" />
          )}
          <div style={{flex:1,textAlign: cvData.photo ? 'left' : 'center'}}>
            <h1 style={{fontSize:'22px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'4px',fontFamily:'Georgia,serif'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{fontSize:'12px',color:'#555',letterSpacing:'1px',marginBottom:'8px'}}>{cvData.titre}</div>
            <div style={{display:'flex',justifyContent: cvData.photo ? 'flex-start' : 'center',gap:'20px',flexWrap:'wrap',fontSize:'10px',color:'#666'}}>
              <span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span>
              {cvData.linkedin && <span>🔗 {cvData.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'16px'}}><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'8px'}}>PROFIL</div><p style={{fontSize:'10px',color:'#333',fontStyle:'italic'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'16px'}}>
        <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'10px'}}>EXPÉRIENCES PROFESSIONNELLES</div>
        {cvData.experiences?.map((exp,i)=>(
          <div key={i} style={{marginBottom:'12px'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div><div style={{fontWeight:'700',fontSize:'11px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#555',fontStyle:'italic'}}>{exp.entreprise} — {exp.lieu}</div></div>
              <div style={{fontSize:'10px',color:'#777',whiteSpace:'nowrap'}}>{exp.periode}</div>
            </div>
            <ul style={{paddingLeft:'14px',marginTop:'4px'}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#333',marginBottom:'2px'}}>{m}</li>)}</ul>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'16px'}}>
        <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'10px'}}>FORMATION</div>
        {cvData.formations?.map((f,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
            <div><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#555'}}>{f.etablissement}</div></div>
            <div style={{fontSize:'10px',color:'#777'}}>{f.periode}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'8px'}}>COMPÉTENCES</div><div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{background:'#f0f0f0',border:'1px solid #ddd',padding:'2px 8px',borderRadius:'2px',fontSize:'9px',color:'#333'}}>{c}</span>)}</div></div>
        <div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'10px',borderBottom:'1px solid #eee',padding:'2px 0'}}><span>{l.langue}</span><span style={{color:'#777',fontStyle:'italic'}}>{l.niveau}</span></div>)}</div>
      </div>
    </div>
  )
}

// ─── 2. LINKEDIN ─────────────────────────────────────────────
export function TemplateLinkedIn({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Segoe UI",Arial,sans-serif',color:'#191919',fontSize:'11px',lineHeight:'1.6',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{background:'#0a66c2',padding:'28px 32px'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:'20px'}}>
          <Avatar cvData={cvData} size={68} bg="rgba(255,255,255,0.25)" textColor="#fff" shape="circle" />
          <div style={{flex:1}}>
            <h1 style={{fontSize:'22px',fontWeight:'700',color:'#fff',margin:'0 0 4px'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{fontSize:'13px',color:'rgba(255,255,255,0.85)',marginBottom:'8px'}}>{cvData.titre}</div>
            <div style={{display:'flex',gap:'16px',flexWrap:'wrap',fontSize:'10px',color:'rgba(255,255,255,0.75)'}}>
              <span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{padding:'20px 32px'}}>
        {cvData.accroche && <div style={{marginBottom:'16px',padding:'12px 16px',background:'#f3f6f9',borderRadius:'8px',borderLeft:'4px solid #0a66c2'}}><p style={{fontSize:'10px',color:'#444',margin:0,lineHeight:'1.7'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}><div style={{width:'4px',height:'18px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:'12px',fontWeight:'700',color:'#191919'}}>EXPÉRIENCES</div></div>
          {cvData.experiences?.map((exp,i)=>(
            <div key={i} style={{marginBottom:'12px',paddingLeft:'12px',borderLeft:'2px solid #e0e0e0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div><div style={{fontWeight:'700',fontSize:'11px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#0a66c2',fontWeight:'500'}}>{exp.entreprise} · {exp.lieu}</div></div>
                <div style={{fontSize:'10px',color:'#666',whiteSpace:'nowrap',background:'#f3f6f9',padding:'2px 8px',borderRadius:'10px'}}>{exp.periode}</div>
              </div>
              <ul style={{paddingLeft:'14px',marginTop:'6px'}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#444',marginBottom:'2px'}}>{m}</li>)}</ul>
            </div>
          ))}
        </div>
        <div style={{marginBottom:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}><div style={{width:'4px',height:'18px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:'12px',fontWeight:'700',color:'#191919'}}>FORMATION</div></div>
          {cvData.formations?.map((f,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'8px',paddingLeft:'12px',borderLeft:'2px solid #e0e0e0'}}>
              <div><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#0a66c2'}}>{f.etablissement}</div></div>
              <div style={{fontSize:'10px',color:'#666'}}>{f.periode}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          <div><div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}><div style={{width:'4px',height:'18px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:'12px',fontWeight:'700'}}>COMPÉTENCES</div></div><div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{background:'#e8f3ff',color:'#0a66c2',padding:'3px 10px',borderRadius:'12px',fontSize:'9px',fontWeight:'500',border:'1px solid #b3d4f5'}}>{c}</span>)}</div></div>
          <div><div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}><div style={{width:'4px',height:'18px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:'12px',fontWeight:'700'}}>LANGUES</div></div>{cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'10px',padding:'3px 0',borderBottom:'1px solid #f0f0f0'}}><span style={{fontWeight:'500'}}>{l.langue}</span><span style={{color:'#666'}}>{l.niveau}</span></div>)}</div>
        </div>
      </div>
    </div>
  )
}

// ─── 3. CANVA ────────────────────────────────────────────────
export function TemplateCanva({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Helvetica,sans-serif',fontSize:'11px',lineHeight:'1.6',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'260px 1fr'}}>
      <div style={{background:'#2d2d2d',color:'#fff',padding:'32px 22px'}}>
        <div style={{textAlign:'center',marginBottom:'24px',paddingBottom:'20px',borderBottom:'1px solid rgba(255,255,255,0.15)'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}>
            <Avatar cvData={cvData} size={72} bg="linear-gradient(135deg,#f093fb,#f5576c)" textColor="#fff" shape="circle" />
          </div>
          <h1 style={{fontSize:'16px',fontWeight:'700',color:'#fff',margin:'0 0 4px',lineHeight:'1.2'}}>{cvData.prenom}<br/>{cvData.nom}</h1>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.7)'}}>{cvData.titre}</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'10px'}}>CONTACT</div>
          <div style={{fontSize:'9px',color:'rgba(255,255,255,0.85)',marginBottom:'6px'}}>✉ {cvData.email}</div>
          <div style={{fontSize:'9px',color:'rgba(255,255,255,0.85)',marginBottom:'6px'}}>☎ {cvData.telephone}</div>
          <div style={{fontSize:'9px',color:'rgba(255,255,255,0.85)',marginBottom:'6px'}}>📍 {cvData.ville}</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'10px'}}>COMPÉTENCES</div>
          {cvData.competences?.map((c,i)=>(
            <div key={i} style={{marginBottom:'6px'}}>
              <div style={{fontSize:'9px',color:'rgba(255,255,255,0.85)',marginBottom:'3px'}}>{c}</div>
              <div style={{height:'3px',background:'rgba(255,255,255,0.15)',borderRadius:'2px'}}><div style={{height:'100%',width:`${75+i*3}%`,background:'linear-gradient(90deg,#f093fb,#f5576c)',borderRadius:'2px'}}></div></div>
            </div>
          ))}
        </div>
        <div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'10px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:'9px',color:'rgba(255,255,255,0.85)',marginBottom:'4px'}}><strong>{l.langue}</strong> — {l.niveau}</div>)}</div>
      </div>
      <div style={{padding:'28px 24px'}}>
        {cvData.accroche && <div style={{marginBottom:'18px',padding:'12px 16px',background:'#fff5fb',borderRadius:'8px',borderLeft:'4px solid #f093fb'}}><p style={{fontSize:'10px',color:'#444',margin:0,fontStyle:'italic'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'18px'}}>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#2d2d2d',textTransform:'uppercase',marginBottom:'12px',paddingBottom:'4px',borderBottom:'2px solid #f093fb'}}>EXPÉRIENCES</div>
          {cvData.experiences?.map((exp,i)=>(
            <div key={i} style={{marginBottom:'13px',paddingLeft:'12px',borderLeft:'3px solid #f093fb'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:'11px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#f5576c',fontWeight:'500'}}>{exp.entreprise} · {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#999',whiteSpace:'nowrap'}}>{exp.periode}</div></div>
              <ul style={{paddingLeft:'12px',marginTop:'4px'}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#555',marginBottom:'2px'}}>{m}</li>)}</ul>
            </div>
          ))}
        </div>
        <div><div style={{fontSize:'11px',fontWeight:'700',color:'#2d2d2d',textTransform:'uppercase',marginBottom:'12px',paddingBottom:'4px',borderBottom:'2px solid #f093fb'}}>FORMATION</div>{cvData.formations?.map((f,i)=><div key={i} style={{marginBottom:'10px',paddingLeft:'12px',borderLeft:'3px solid #f093fb'}}><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#888'}}>{f.etablissement} · {f.periode}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 4. HARVARD ──────────────────────────────────────────────
export function TemplateHarvard({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Times New Roman",Times,serif',color:'#111',fontSize:'11px',lineHeight:'1.6',padding:'40px 48px',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{textAlign:'center',marginBottom:'16px',paddingBottom:'12px',borderBottom:'2px solid #111'}}>
        {cvData.photo && <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}><Avatar cvData={cvData} size={60} shape="circle" bg="#111" /></div>}
        <h1 style={{fontSize:'22px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase',margin:'0 0 6px',fontFamily:'"Times New Roman",serif'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{display:'flex',justifyContent:'center',gap:'16px',fontSize:'10px',color:'#333',flexWrap:'wrap'}}><span>{cvData.email}</span><span>|</span><span>{cvData.telephone}</span><span>|</span><span>{cvData.ville}</span></div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'14px',textAlign:'center'}}><p style={{fontSize:'10px',color:'#444',fontStyle:'italic',margin:0}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'14px'}}>
        <div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'8px'}}>Experience</div>
        {cvData.experiences?.map((exp,i)=>(
          <div key={i} style={{marginBottom:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:'11px'}}>{exp.entreprise}, {exp.lieu}</div><div style={{fontSize:'10px',color:'#555'}}>{exp.periode}</div></div>
            <div style={{fontStyle:'italic',fontSize:'10px',color:'#333',marginBottom:'4px'}}>{exp.poste}</div>
            <ul style={{paddingLeft:'18px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#222',marginBottom:'2px'}}>{m}</li>)}</ul>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'14px'}}>
        <div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'8px'}}>Education</div>
        {cvData.formations?.map((f,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}><div><div style={{fontWeight:'700',fontSize:'11px'}}>{f.etablissement}</div><div style={{fontSize:'10px',fontStyle:'italic',color:'#333'}}>{f.diplome}</div></div><div style={{fontSize:'10px',color:'#555'}}>{f.periode}</div></div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div><div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'8px'}}>Skills</div><div style={{fontSize:'10px',color:'#222',lineHeight:'1.8'}}>{cvData.competences?.join(' · ')}</div></div>
        <div><div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'8px'}}>Languages</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:'10px',color:'#222',marginBottom:'2px'}}>{l.langue} — {l.niveau}</div>)}</div>
      </div>
    </div>
  )
}

// ─── 5. SILICON VALLEY ───────────────────────────────────────
export function TemplateSiliconValley({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif',fontSize:'11px',lineHeight:'1.7',background:'#fff',color:'#1d1d1f',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',padding:'40px 48px'}}>
      <div style={{marginBottom:'28px',display:'flex',alignItems:'center',gap:'20px'}}>
        {cvData.photo && <Avatar cvData={cvData} size={72} bg="#1d1d1f" shape="circle" />}
        <div>
          <h1 style={{fontSize:'32px',fontWeight:'700',letterSpacing:'-1px',color:'#1d1d1f',margin:'0 0 4px'}}>{cvData.prenom} {cvData.nom}</h1>
          <div style={{fontSize:'14px',color:'#6e6e73',marginBottom:'8px'}}>{cvData.titre}</div>
          <div style={{display:'flex',gap:'20px',flexWrap:'wrap',fontSize:'11px',color:'#6e6e73'}}><span>{cvData.email}</span><span>{cvData.telephone}</span><span>{cvData.ville}</span></div>
          <div style={{width:'48px',height:'2px',background:'#1d1d1f',marginTop:'12px',borderRadius:'1px'}}></div>
        </div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'22px'}}><p style={{fontSize:'12px',color:'#3d3d3f',lineHeight:'1.8',margin:0,maxWidth:'520px'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'22px'}}>
        <div style={{fontSize:'9px',fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'14px'}}>EXPÉRIENCES</div>
        {cvData.experiences?.map((exp,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'110px 1fr',gap:'16px',marginBottom:'14px'}}>
            <div style={{fontSize:'10px',color:'#6e6e73',paddingTop:'1px'}}>{exp.periode}</div>
            <div><div style={{fontWeight:'600',fontSize:'12px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#6e6e73',marginBottom:'5px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'14px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#3d3d3f',marginBottom:'2px'}}>{m}</li>)}</ul></div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'22px'}}>
        <div style={{fontSize:'9px',fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'14px'}}>FORMATION</div>
        {cvData.formations?.map((f,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'110px 1fr',gap:'16px',marginBottom:'8px'}}><div style={{fontSize:'10px',color:'#6e6e73'}}>{f.periode}</div><div><div style={{fontWeight:'600',fontSize:'12px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#6e6e73'}}>{f.etablissement}</div></div></div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>
        <div><div style={{fontSize:'9px',fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'10px'}}>COMPÉTENCES</div><div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{border:'1px solid #d2d2d7',padding:'3px 10px',fontSize:'9px',color:'#1d1d1f',borderRadius:'100px'}}>{c}</span>)}</div></div>
        <div><div style={{fontSize:'9px',fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'10px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:'10px',color:'#3d3d3f',marginBottom:'4px'}}>{l.langue} <span style={{color:'#6e6e73'}}>— {l.niveau}</span></div>)}</div>
      </div>
    </div>
  )
}

// ─── 6. MODERNE ──────────────────────────────────────────────
export function TemplateModerne({ cvData }) {
  return (
    <div id="cv-to-print" style={{display:'grid',gridTemplateColumns:'220px 1fr',fontFamily:'Helvetica,sans-serif',fontSize:'11px',lineHeight:'1.6',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{background:'#0f6e56',color:'#fff',padding:'28px 20px'}}>
        <div style={{marginBottom:'20px',paddingBottom:'16px',borderBottom:'1px solid rgba(255,255,255,0.2)',display:'flex',flexDirection:'column',alignItems:'center',gap:'10px'}}>
          <Avatar cvData={cvData} size={68} bg="rgba(255,255,255,0.25)" textColor="#fff" shape="circle" />
          <div style={{textAlign:'center'}}>
            <h1 style={{fontSize:'16px',fontWeight:'700',marginBottom:'4px',color:'#fff',lineHeight:'1.2'}}>{cvData.prenom}<br/>{cvData.nom}</h1>
            <div style={{fontSize:'10px',color:'rgba(255,255,255,0.8)'}}>{cvData.titre}</div>
          </div>
        </div>
        <div style={{marginBottom:'20px'}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'8px'}}>CONTACT</div><div style={{fontSize:'9px',color:'rgba(255,255,255,0.9)',marginBottom:'4px'}}>✉ {cvData.email}</div><div style={{fontSize:'9px',color:'rgba(255,255,255,0.9)',marginBottom:'4px'}}>☎ {cvData.telephone}</div><div style={{fontSize:'9px',color:'rgba(255,255,255,0.9)',marginBottom:'4px'}}>📍 {cvData.ville}</div></div>
        <div style={{marginBottom:'20px'}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'8px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{background:'rgba(255,255,255,0.15)',padding:'4px 8px',borderRadius:'4px',fontSize:'9px',color:'#fff',marginBottom:'4px'}}>{c}</div>)}</div>
        <div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:'9px',color:'rgba(255,255,255,0.9)',marginBottom:'3px'}}>{l.langue} — {l.niveau}</div>)}</div>
      </div>
      <div style={{padding:'28px 24px'}}>
        {cvData.accroche && <div style={{marginBottom:'18px',padding:'12px',background:'#f0fdf4',borderLeft:'3px solid #0f6e56',borderRadius:'0 6px 6px 0'}}><p style={{fontSize:'10px',color:'#374151',fontStyle:'italic',margin:0}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'18px'}}><div style={{fontSize:'10px',fontWeight:'700',color:'#0f6e56',letterSpacing:'1.5px',textTransform:'uppercase',borderBottom:'2px solid #0f6e56',paddingBottom:'4px',marginBottom:'10px'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'12px'}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:'11px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#0f6e56'}}>{exp.entreprise} — {exp.lieu}</div></div><div style={{fontSize:'9px',color:'#888',whiteSpace:'nowrap',background:'#f0fdf4',padding:'2px 8px',borderRadius:'10px'}}>{exp.periode}</div></div><ul style={{paddingLeft:'14px',marginTop:'4px'}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#444',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{fontSize:'10px',fontWeight:'700',color:'#0f6e56',letterSpacing:'1.5px',textTransform:'uppercase',borderBottom:'2px solid #0f6e56',paddingBottom:'4px',marginBottom:'10px'}}>FORMATION</div>{cvData.formations?.map((f,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}><div><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#555'}}>{f.etablissement}</div></div><div style={{fontSize:'10px',color:'#888'}}>{f.periode}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 7. EXECUTIVE ────────────────────────────────────────────
export function TemplateExecutive({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'Georgia,serif',fontSize:'11px',lineHeight:'1.7',background:'#0d0d0d',color:'#e8e0cc',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',padding:'48px 52px'}}>
      <div style={{borderBottom:'1px solid #c9a84c',paddingBottom:'20px',marginBottom:'24px',display:'flex',alignItems:'center',gap:'20px'}}>
        {cvData.photo && <Avatar cvData={cvData} size={72} bg="#333" shape="rounded" />}
        <div>
          <h1 style={{fontSize:'26px',fontWeight:'400',letterSpacing:'5px',textTransform:'uppercase',color:'#c9a84c',margin:'0 0 6px',fontFamily:'Georgia,serif'}}>{cvData.prenom} {cvData.nom}</h1>
          <div style={{fontSize:'11px',letterSpacing:'3px',textTransform:'uppercase',color:'#888',marginBottom:'10px'}}>{cvData.titre}</div>
          <div style={{display:'flex',gap:'20px',flexWrap:'wrap',fontSize:'10px',color:'#777'}}><span>{cvData.email}</span><span>·</span><span>{cvData.telephone}</span><span>·</span><span>{cvData.ville}</span></div>
        </div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'24px',padding:'16px 20px',border:'1px solid #333',borderLeft:'3px solid #c9a84c'}}><p style={{fontSize:'11px',color:'#bbb',fontStyle:'italic',margin:0,lineHeight:'1.8'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'22px'}}><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'14px',paddingBottom:'6px',borderBottom:'1px solid #333'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'16px',paddingLeft:'16px',borderLeft:'1px solid #333'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><div style={{fontWeight:'700',fontSize:'12px',color:'#e8e0cc'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#c9a84c'}}>{exp.periode}</div></div><div style={{fontSize:'10px',color:'#888',marginBottom:'6px',fontStyle:'italic'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'14px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#aaa',marginBottom:'3px'}}>{m}</li>)}</ul></div>)}</div>
      <div style={{marginBottom:'22px'}}><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'14px',paddingBottom:'6px',borderBottom:'1px solid #333'}}>FORMATION</div>{cvData.formations?.map((f,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'10px',paddingLeft:'16px',borderLeft:'1px solid #333'}}><div><div style={{fontWeight:'700',fontSize:'11px',color:'#e8e0cc'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#888'}}>{f.etablissement}</div></div><div style={{fontSize:'10px',color:'#c9a84c'}}>{f.periode}</div></div>)}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}><div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'10px',paddingBottom:'6px',borderBottom:'1px solid #333'}}>COMPÉTENCES</div><div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{border:'1px solid #444',color:'#bbb',padding:'3px 10px',fontSize:'9px',borderRadius:'2px'}}>{c}</span>)}</div></div><div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'10px',paddingBottom:'6px',borderBottom:'1px solid #333'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'10px',color:'#aaa',padding:'4px 0',borderBottom:'1px solid #222'}}><span>{l.langue}</span><span style={{color:'#c9a84c'}}>{l.niveau}</span></div>)}</div></div>
    </div>
  )
}

// ─── 8. CREATIVE ─────────────────────────────────────────────
export function TemplateCreative({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:'11px',lineHeight:'1.6',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'240px 1fr'}}>
      <div style={{background:'linear-gradient(160deg,#667eea,#764ba2)',color:'#fff',padding:'32px 20px',display:'flex',flexDirection:'column',gap:'20px'}}>
        <div style={{textAlign:'center',paddingBottom:'20px',borderBottom:'1px solid rgba(255,255,255,0.2)'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'12px'}}>
            <Avatar cvData={cvData} size={74} bg="rgba(255,255,255,0.25)" textColor="#fff" shape="circle" />
          </div>
          <h1 style={{fontSize:'17px',fontWeight:'700',margin:'0 0 4px',lineHeight:'1.2'}}>{cvData.prenom}<br/>{cvData.nom}</h1>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.8)',fontStyle:'italic'}}>{cvData.titre}</div>
        </div>
        <div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'8px'}}>CONTACT</div>{[cvData.email,cvData.telephone,cvData.ville].map((v,i)=><div key={i} style={{fontSize:'9px',marginBottom:'5px',color:'rgba(255,255,255,0.9)'}}>{v}</div>)}</div>
        <div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'10px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{marginBottom:'7px'}}><div style={{fontSize:'9px',marginBottom:'3px'}}>{c}</div><div style={{height:'4px',background:'rgba(255,255,255,0.2)',borderRadius:'2px'}}><div style={{height:'100%',width:`${80-i*5}%`,background:'#fff',borderRadius:'2px',opacity:0.9}}></div></div></div>)}</div>
        <div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:'9px',color:'rgba(255,255,255,0.9)',marginBottom:'4px'}}>{l.langue} <span style={{opacity:0.6}}>· {l.niveau}</span></div>)}</div>
      </div>
      <div style={{padding:'28px 24px',background:'#fafafa'}}>
        {cvData.accroche && <div style={{marginBottom:'18px',padding:'14px',background:'#fff',borderRadius:'10px',boxShadow:'0 2px 8px rgba(102,126,234,0.12)',borderLeft:'4px solid #667eea'}}><p style={{fontSize:'10px',color:'#555',margin:0,lineHeight:'1.7',fontStyle:'italic'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'18px'}}><div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}><div style={{width:'28px',height:'3px',background:'linear-gradient(90deg,#667eea,#764ba2)',borderRadius:'2px'}}></div><div style={{fontSize:'11px',fontWeight:'700',color:'#333',letterSpacing:'1px',textTransform:'uppercase'}}>Expériences</div></div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'14px',background:'#fff',borderRadius:'8px',padding:'12px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><div style={{fontWeight:'700',fontSize:'11px',color:'#333'}}>{exp.poste}</div><div style={{fontSize:'9px',color:'#764ba2',background:'#f3f0ff',padding:'2px 8px',borderRadius:'10px'}}>{exp.periode}</div></div><div style={{fontSize:'10px',color:'#667eea',marginBottom:'6px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'14px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#666',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}><div style={{width:'28px',height:'3px',background:'linear-gradient(90deg,#667eea,#764ba2)',borderRadius:'2px'}}></div><div style={{fontSize:'11px',fontWeight:'700',color:'#333',letterSpacing:'1px',textTransform:'uppercase'}}>Formation</div></div>{cvData.formations?.map((f,i)=><div key={i} style={{marginBottom:'10px',background:'#fff',borderRadius:'8px',padding:'10px 12px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}><div style={{fontWeight:'700',fontSize:'11px',color:'#333'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#888'}}>{f.etablissement} · {f.periode}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 9. MINIMAL ──────────────────────────────────────────────
export function TemplateMinimal({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:'11px',lineHeight:'1.8',background:'#fff',color:'#222',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',padding:'52px 60px'}}>
      <div style={{marginBottom:'36px',display:'flex',alignItems:'center',gap:'20px'}}>
        {cvData.photo && <Avatar cvData={cvData} size={68} bg="#222" shape="circle" />}
        <div>
          <h1 style={{fontSize:'30px',fontWeight:'300',letterSpacing:'1px',color:'#111',margin:'0 0 6px'}}>{cvData.prenom} <strong style={{fontWeight:'700'}}>{cvData.nom}</strong></h1>
          <div style={{fontSize:'13px',color:'#888',marginBottom:'10px',letterSpacing:'0.5px'}}>{cvData.titre}</div>
          <div style={{display:'flex',gap:'24px',fontSize:'10px',color:'#aaa',flexWrap:'wrap'}}><span>{cvData.email}</span><span>{cvData.telephone}</span><span>{cvData.ville}</span></div>
        </div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'28px',paddingBottom:'28px',borderBottom:'1px solid #f0f0f0'}}><p style={{fontSize:'11px',color:'#555',margin:0,lineHeight:'1.9',maxWidth:'500px'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'28px'}}><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'16px'}}>Expériences</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'20px',marginBottom:'18px',paddingBottom:'18px',borderBottom:'1px solid #f5f5f5'}}><div style={{fontSize:'9px',color:'#aaa',paddingTop:'2px'}}>{exp.periode}</div><div><div style={{fontWeight:'600',fontSize:'12px',marginBottom:'2px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#aaa',marginBottom:'8px'}}>{exp.entreprise}, {exp.lieu}</div><ul style={{paddingLeft:'14px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#555',marginBottom:'3px'}}>{m}</li>)}</ul></div></div>)}</div>
      <div style={{marginBottom:'28px'}}><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'16px'}}>Formation</div>{cvData.formations?.map((f,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'20px',marginBottom:'10px'}}><div style={{fontSize:'9px',color:'#aaa'}}>{f.periode}</div><div><div style={{fontWeight:'600',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#aaa'}}>{f.etablissement}</div></div></div>)}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'28px'}}><div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'12px'}}>Compétences</div><div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{fontSize:'9px',color:'#555',background:'#f8f8f8',padding:'3px 10px',borderRadius:'3px'}}>{c}</span>)}</div></div><div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'12px'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:'10px',color:'#555',marginBottom:'4px'}}>{l.langue} <span style={{color:'#ccc'}}>·</span> {l.niveau}</div>)}</div></div>
    </div>
  )
}

// ─── 10. TECH ────────────────────────────────────────────────
export function TemplateTech({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Courier New",monospace',fontSize:'11px',lineHeight:'1.7',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'230px 1fr'}}>
      <div style={{background:'#0f172a',color:'#94a3b8',padding:'28px 18px'}}>
        <div style={{marginBottom:'20px',paddingBottom:'16px',borderBottom:'1px solid #1e293b',display:'flex',flexDirection:'column',alignItems:'center',gap:'10px'}}>
          <Avatar cvData={cvData} size={68} bg="#1e293b" textColor="#22d3ee" shape="circle" />
          <div style={{textAlign:'center'}}><div style={{fontSize:'10px',color:'#22d3ee',marginBottom:'4px',fontFamily:'monospace'}}>&gt; whoami</div><h1 style={{fontSize:'14px',fontWeight:'700',color:'#f1f5f9',margin:'0 0 4px',fontFamily:'sans-serif'}}>{cvData.prenom} {cvData.nom}</h1><div style={{fontSize:'9px',color:'#22d3ee'}}>{cvData.titre}</div></div>
        </div>
        <div style={{marginBottom:'18px'}}><div style={{fontSize:'8px',color:'#475569',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'10px',fontFamily:'monospace'}}>{'//'} contact</div><div style={{fontSize:'9px',marginBottom:'5px'}}>📧 {cvData.email}</div><div style={{fontSize:'9px',marginBottom:'5px'}}>📱 {cvData.telephone}</div><div style={{fontSize:'9px',marginBottom:'5px'}}>📍 {cvData.ville}</div></div>
        <div style={{marginBottom:'18px'}}><div style={{fontSize:'8px',color:'#475569',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'10px',fontFamily:'monospace'}}>{'//'} skills</div>{cvData.competences?.map((c,i)=><div key={i} style={{marginBottom:'6px'}}><div style={{fontSize:'9px',color:'#94a3b8',marginBottom:'3px'}}>{c}</div><div style={{height:'3px',background:'#1e293b',borderRadius:'2px'}}><div style={{height:'100%',width:`${85-i*5}%`,background:'linear-gradient(90deg,#22d3ee,#818cf8)',borderRadius:'2px'}}></div></div></div>)}</div>
        <div><div style={{fontSize:'8px',color:'#475569',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'10px',fontFamily:'monospace'}}>{'//'} languages</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:'9px',color:'#94a3b8',marginBottom:'4px'}}><span style={{color:'#22d3ee'}}>{l.langue}</span> · {l.niveau}</div>)}</div>
      </div>
      <div style={{padding:'28px 22px',background:'#fff'}}>
        {cvData.accroche && <div style={{marginBottom:'18px',padding:'12px 14px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'6px',fontFamily:'sans-serif'}}><p style={{fontSize:'10px',color:'#166534',margin:0}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'18px'}}><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#0f172a',marginBottom:'12px',display:'flex',alignItems:'center',gap:'8px',fontFamily:'monospace'}}><span style={{color:'#22d3ee'}}>&gt;</span> expériences</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'14px',paddingLeft:'14px',borderLeft:'2px solid #22d3ee'}}><div style={{display:'flex',justifyContent:'space-between',fontFamily:'sans-serif'}}><div style={{fontWeight:'700',fontSize:'11px',color:'#0f172a'}}>{exp.poste}</div><div style={{fontSize:'9px',color:'#64748b',background:'#f1f5f9',padding:'2px 8px',borderRadius:'4px'}}>{exp.periode}</div></div><div style={{fontSize:'10px',color:'#22d3ee',marginBottom:'5px',fontFamily:'monospace'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'14px',margin:0,fontFamily:'sans-serif'}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#475569',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#0f172a',marginBottom:'12px',display:'flex',alignItems:'center',gap:'8px',fontFamily:'monospace'}}><span style={{color:'#22d3ee'}}>&gt;</span> formation</div>{cvData.formations?.map((f,i)=><div key={i} style={{marginBottom:'10px',paddingLeft:'14px',borderLeft:'2px solid #818cf8',fontFamily:'sans-serif'}}><div style={{fontWeight:'700',fontSize:'11px',color:'#0f172a'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#64748b'}}>{f.etablissement} · {f.periode}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 11. ELEGANT ─────────────────────────────────────────────
export function TemplateElegant({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'Georgia,serif',fontSize:'11px',lineHeight:'1.7',background:'#faf7f2',color:'#2c2416',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'230px 1fr'}}>
      <div style={{background:'#2c2416',padding:'36px 20px',color:'#e8d9b8'}}>
        <div style={{marginBottom:'24px',paddingBottom:'20px',borderBottom:'1px solid rgba(232,217,184,0.2)',display:'flex',flexDirection:'column',alignItems:'center',gap:'12px'}}>
          <Avatar cvData={cvData} size={72} bg="#c9a87a" textColor="#2c2416" shape="circle" />
          <div style={{textAlign:'center'}}><h1 style={{fontSize:'16px',fontWeight:'400',color:'#e8d9b8',margin:'0 0 6px',letterSpacing:'1px',lineHeight:'1.3',fontFamily:'Georgia,serif'}}>{cvData.prenom}<br/><strong>{cvData.nom}</strong></h1><div style={{fontSize:'10px',color:'#c9a87a',fontStyle:'italic'}}>{cvData.titre}</div></div>
        </div>
        <div style={{marginBottom:'22px'}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'10px'}}>Coordonnées</div><div style={{fontSize:'9px',color:'#bbb',marginBottom:'6px'}}>{cvData.email}</div><div style={{fontSize:'9px',color:'#bbb',marginBottom:'6px'}}>{cvData.telephone}</div><div style={{fontSize:'9px',color:'#bbb',marginBottom:'6px'}}>{cvData.ville}</div></div>
        <div style={{marginBottom:'22px'}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'12px'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{fontSize:'9px',color:'#ccc',marginBottom:'6px',paddingBottom:'6px',borderBottom:'1px solid #3d3020',display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'#c9a87a',fontSize:'6px'}}>◆</span>{c}</div>)}</div>
        <div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'10px'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:'9px',color:'#bbb',marginBottom:'5px'}}>{l.langue} <span style={{color:'#c9a87a'}}>·</span> {l.niveau}</div>)}</div>
      </div>
      <div style={{padding:'36px 28px'}}>
        {cvData.accroche && <div style={{marginBottom:'22px',padding:'16px',background:'#f0e8d8',borderRadius:'4px'}}><p style={{fontSize:'11px',color:'#5c4a2e',fontStyle:'italic',margin:0,lineHeight:'1.8'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'22px'}}><div style={{fontSize:'10px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'14px',paddingBottom:'6px',borderBottom:'1px solid #e0d5c0'}}>Expériences Professionnelles</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'14px'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:'11px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#c9a87a',fontStyle:'italic'}}>{exp.periode}</div></div><div style={{fontSize:'10px',color:'#7a6248',marginBottom:'6px',fontStyle:'italic'}}>{exp.entreprise} — {exp.lieu}</div><ul style={{paddingLeft:'14px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#444',marginBottom:'3px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{fontSize:'10px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'14px',paddingBottom:'6px',borderBottom:'1px solid #e0d5c0'}}>Formation</div>{cvData.formations?.map((f,i)=><div key={i} style={{marginBottom:'10px'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#c9a87a',fontStyle:'italic'}}>{f.periode}</div></div><div style={{fontSize:'10px',color:'#7a6248',fontStyle:'italic'}}>{f.etablissement}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 12. BOLD ────────────────────────────────────────────────
export function TemplateBold({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'Arial,sans-serif',fontSize:'11px',lineHeight:'1.6',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{background:'#c0392b',padding:'28px 40px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
          {cvData.photo && <Avatar cvData={cvData} size={72} bg="rgba(255,255,255,0.2)" textColor="#fff" shape="circle" />}
          <div>
            <h1 style={{fontSize:'26px',fontWeight:'900',color:'#fff',margin:'0 0 6px',letterSpacing:'-0.5px',textTransform:'uppercase'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{fontSize:'12px',color:'rgba(255,255,255,0.85)',marginBottom:'10px',fontWeight:'300',letterSpacing:'2px',textTransform:'uppercase'}}>{cvData.titre}</div>
            <div style={{display:'flex',gap:'20px',flexWrap:'wrap',fontSize:'10px',color:'rgba(255,255,255,0.75)'}}><span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span></div>
          </div>
        </div>
      </div>
      {cvData.accroche && <div style={{background:'#f9f9f9',padding:'14px 40px',borderBottom:'3px solid #c0392b'}}><p style={{fontSize:'11px',color:'#555',margin:0,fontStyle:'italic'}}>{cvData.accroche}</p></div>}
      <div style={{padding:'24px 40px',display:'grid',gridTemplateColumns:'1fr 280px',gap:'32px'}}>
        <div>
          <div style={{marginBottom:'20px'}}><div style={{fontSize:'12px',fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'12px',paddingBottom:'4px',borderBottom:'3px solid #c0392b'}}>Expériences</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'14px'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:'11px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#888',background:'#f5f5f5',padding:'2px 8px',borderRadius:'3px'}}>{exp.periode}</div></div><div style={{fontSize:'10px',color:'#c0392b',fontWeight:'600',marginBottom:'5px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'14px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#444',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
          <div><div style={{fontSize:'12px',fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'12px',paddingBottom:'4px',borderBottom:'3px solid #c0392b'}}>Formation</div>{cvData.formations?.map((f,i)=><div key={i} style={{marginBottom:'10px'}}><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#666'}}>{f.etablissement} · {f.periode}</div></div>)}</div>
        </div>
        <div>
          <div style={{marginBottom:'20px'}}><div style={{fontSize:'12px',fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'12px',paddingBottom:'4px',borderBottom:'3px solid #c0392b'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{fontSize:'10px',color:'#333',padding:'5px 0',borderBottom:'1px solid #f0f0f0'}}>{c}</div>)}</div>
          <div><div style={{fontSize:'12px',fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'12px',paddingBottom:'4px',borderBottom:'3px solid #c0392b'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'10px',padding:'5px 0',borderBottom:'1px solid #f0f0f0'}}><span>{l.langue}</span><span style={{color:'#888'}}>{l.niveau}</span></div>)}</div>
        </div>
      </div>
    </div>
  )
}

// ─── 13. PASTEL ──────────────────────────────────────────────
export function TemplatePastel({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:'11px',lineHeight:'1.7',background:'#fef9ff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'240px 1fr'}}>
      <div style={{background:'#e8d5f5',padding:'32px 20px'}}>
        <div style={{textAlign:'center',marginBottom:'24px',paddingBottom:'20px',borderBottom:'1px solid #d4b8ec',display:'flex',flexDirection:'column',alignItems:'center',gap:'10px'}}>
          <Avatar cvData={cvData} size={72} bg="linear-gradient(135deg,#c084fc,#e879f9)" textColor="#fff" shape="circle" />
          <div><h1 style={{fontSize:'16px',fontWeight:'700',color:'#5b21b6',margin:'0 0 4px'}}>{cvData.prenom} {cvData.nom}</h1><div style={{fontSize:'10px',color:'#7c3aed',fontStyle:'italic'}}>{cvData.titre}</div></div>
        </div>
        <div style={{marginBottom:'20px'}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'10px'}}>Contact</div><div style={{fontSize:'9px',color:'#5b21b6',marginBottom:'5px'}}>✉ {cvData.email}</div><div style={{fontSize:'9px',color:'#5b21b6',marginBottom:'5px'}}>☎ {cvData.telephone}</div><div style={{fontSize:'9px',color:'#5b21b6',marginBottom:'5px'}}>📍 {cvData.ville}</div></div>
        <div style={{marginBottom:'20px'}}><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'10px'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{background:'rgba(124,58,237,0.1)',border:'1px solid #ddd6fe',color:'#5b21b6',padding:'4px 8px',borderRadius:'20px',fontSize:'9px',marginBottom:'5px',textAlign:'center'}}>{c}</div>)}</div>
        <div><div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'10px'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:'9px',color:'#5b21b6',marginBottom:'4px'}}>{l.langue} · <span style={{color:'#7c3aed'}}>{l.niveau}</span></div>)}</div>
      </div>
      <div style={{padding:'28px 24px'}}>
        {cvData.accroche && <div style={{marginBottom:'18px',padding:'14px',background:'#fdf4ff',borderRadius:'12px',border:'1px solid #e9d5ff'}}><p style={{fontSize:'10px',color:'#6d28d9',fontStyle:'italic',margin:0,lineHeight:'1.8'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'18px'}}><div style={{fontSize:'11px',fontWeight:'700',color:'#7c3aed',marginBottom:'12px',display:'flex',alignItems:'center',gap:'8px'}}><div style={{width:'20px',height:'3px',background:'linear-gradient(90deg,#c084fc,#e879f9)',borderRadius:'2px'}}></div>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'14px',padding:'12px',background:'#fff',borderRadius:'10px',border:'1px solid #f3e8ff'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:'11px',color:'#1f2937'}}>{exp.poste}</div><div style={{fontSize:'9px',color:'#7c3aed',background:'#fdf4ff',padding:'2px 8px',borderRadius:'10px'}}>{exp.periode}</div></div><div style={{fontSize:'10px',color:'#a855f7',marginBottom:'6px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'14px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#4b5563',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{fontSize:'11px',fontWeight:'700',color:'#7c3aed',marginBottom:'12px',display:'flex',alignItems:'center',gap:'8px'}}><div style={{width:'20px',height:'3px',background:'linear-gradient(90deg,#c084fc,#e879f9)',borderRadius:'2px'}}></div>FORMATION</div>{cvData.formations?.map((f,i)=><div key={i} style={{marginBottom:'10px',padding:'10px 12px',background:'#fff',borderRadius:'10px',border:'1px solid #f3e8ff'}}><div style={{fontWeight:'700',fontSize:'11px',color:'#1f2937'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#a855f7'}}>{f.etablissement} · {f.periode}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 14. CORPORATE ───────────────────────────────────────────
export function TemplateCorporate({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'Arial,Helvetica,sans-serif',fontSize:'11px',lineHeight:'1.6',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{background:'#1e3a5f',borderBottom:'4px solid #f59e0b',padding:'24px 36px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'20px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <Avatar cvData={cvData} size={68} bg="rgba(255,255,255,0.15)" textColor="#f59e0b" shape="circle" />
            <div><h1 style={{fontSize:'22px',fontWeight:'700',color:'#fff',margin:'0 0 4px'}}>{cvData.prenom} {cvData.nom}</h1><div style={{fontSize:'12px',color:'#f59e0b',letterSpacing:'1px',textTransform:'uppercase',fontWeight:'300'}}>{cvData.titre}</div></div>
          </div>
          <div style={{textAlign:'right',fontSize:'10px',color:'rgba(255,255,255,0.7)'}}><div style={{marginBottom:'3px'}}>{cvData.email}</div><div style={{marginBottom:'3px'}}>{cvData.telephone}</div><div>{cvData.ville}</div></div>
        </div>
      </div>
      <div style={{padding:'24px 36px'}}>
        {cvData.accroche && <div style={{marginBottom:'20px',padding:'14px 18px',background:'#f0f4f8',borderLeft:'4px solid #1e3a5f'}}><p style={{fontSize:'11px',color:'#334155',margin:0,lineHeight:'1.7'}}>{cvData.accroche}</p></div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 260px',gap:'28px'}}>
          <div>
            <div style={{marginBottom:'20px'}}><div style={{background:'#1e3a5f',color:'#fff',padding:'6px 14px',fontSize:'10px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px',display:'inline-block'}}>Expériences</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'14px',paddingBottom:'14px',borderBottom:'1px solid #e2e8f0'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:'12px',color:'#1e3a5f'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#64748b'}}>{exp.periode}</div></div><div style={{fontSize:'10px',color:'#f59e0b',fontWeight:'600',marginBottom:'6px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'14px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#475569',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
            <div><div style={{background:'#1e3a5f',color:'#fff',padding:'6px 14px',fontSize:'10px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px',display:'inline-block'}}>Formation</div>{cvData.formations?.map((f,i)=><div key={i} style={{marginBottom:'10px',paddingBottom:'10px',borderBottom:'1px solid #e2e8f0'}}><div style={{fontWeight:'700',fontSize:'11px',color:'#1e3a5f'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#64748b'}}>{f.etablissement} · {f.periode}</div></div>)}</div>
          </div>
          <div>
            <div style={{marginBottom:'20px'}}><div style={{background:'#1e3a5f',color:'#fff',padding:'6px 14px',fontSize:'10px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px',display:'inline-block'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}><div style={{width:'6px',height:'6px',background:'#f59e0b',borderRadius:'50%',flexShrink:0}}></div><div style={{fontSize:'10px',color:'#334155'}}>{c}</div></div>)}</div>
            <div><div style={{background:'#1e3a5f',color:'#fff',padding:'6px 14px',fontSize:'10px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'12px',display:'inline-block'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{marginBottom:'8px'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',marginBottom:'3px'}}><span style={{fontWeight:'600',color:'#1e3a5f'}}>{l.langue}</span><span style={{color:'#64748b'}}>{l.niveau}</span></div><div style={{height:'4px',background:'#e2e8f0',borderRadius:'2px'}}><div style={{height:'100%',width:l.niveau?.includes('Natif')||l.niveau?.includes('C')?'100%':l.niveau?.includes('B')?'70%':'45%',background:'#1e3a5f',borderRadius:'2px'}}></div></div></div>)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 15. SWISS ───────────────────────────────────────────────
export function TemplateSwiss({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif',fontSize:'11px',lineHeight:'1.5',background:'#fff',color:'#000',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',padding:'48px 52px'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto',alignItems:'end',marginBottom:'32px',paddingBottom:'8px',borderBottom:'3px solid #000'}}>
        <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
          {cvData.photo && <Avatar cvData={cvData} size={60} bg="#000" shape="square" />}
          <h1 style={{fontSize:'30px',fontWeight:'900',color:'#000',margin:0,letterSpacing:'-1px',lineHeight:'1'}}>{cvData.prenom?.toUpperCase()} {cvData.nom?.toUpperCase()}</h1>
        </div>
        <div style={{textAlign:'right',fontSize:'10px',color:'#555'}}><div>{cvData.email}</div><div>{cvData.telephone}</div><div>{cvData.ville}</div></div>
      </div>
      <div style={{marginBottom:'4px',paddingBottom:'8px',borderBottom:'1px solid #000'}}><div style={{fontSize:'12px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'3px',color:'#555'}}>{cvData.titre}</div></div>
      {cvData.accroche && <div style={{marginBottom:'24px',paddingTop:'12px'}}><p style={{fontSize:'11px',color:'#333',margin:0,lineHeight:'1.7',maxWidth:'480px'}}>{cvData.accroche}</p></div>}
      <div style={{display:'grid',gridTemplateColumns:'120px 1fr',gap:'0',marginBottom:'24px'}}><div style={{paddingTop:'3px'}}><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999'}}>EXPÉRIENCES</div></div><div>{cvData.experiences?.map((exp,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'16px',marginBottom:'16px',paddingBottom:'16px',borderBottom:'1px solid #eee'}}><div style={{fontSize:'9px',color:'#999',paddingTop:'2px'}}>{exp.periode}</div><div><div style={{fontWeight:'700',fontSize:'12px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#555',marginBottom:'6px'}}>{exp.entreprise}, {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#333',marginBottom:'2px'}}>{m}</li>)}</ul></div></div>)}</div></div>
      <div style={{display:'grid',gridTemplateColumns:'120px 1fr',gap:'0',marginBottom:'24px'}}><div style={{paddingTop:'3px'}}><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999'}}>FORMATION</div></div><div>{cvData.formations?.map((f,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'16px',marginBottom:'10px'}}><div style={{fontSize:'9px',color:'#999'}}>{f.periode}</div><div><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#555'}}>{f.etablissement}</div></div></div>)}</div></div>
      <div style={{borderTop:'1px solid #000',paddingTop:'16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}><div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'10px'}}>COMPÉTENCES</div><div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{border:'1px solid #000',padding:'2px 8px',fontSize:'9px',color:'#000'}}>{c}</span>)}</div></div><div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'10px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'10px',borderBottom:'1px solid #eee',padding:'3px 0'}}><span style={{fontWeight:'700'}}>{l.langue}</span><span style={{color:'#555'}}>{l.niveau}</span></div>)}</div></div>
    </div>
  )
}

// ─── 16. TIMELINE ────────────────────────────────────────────
export function TemplateTimeline({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:'11px',lineHeight:'1.6',background:'#f8faff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#1e40af,#3b82f6)',padding:'24px 36px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'16px'}}>
            <Avatar cvData={cvData} size={64} bg="rgba(255,255,255,0.2)" textColor="#fff" shape="circle" />
            <div><h1 style={{fontSize:'22px',fontWeight:'700',color:'#fff',margin:'0 0 4px'}}>{cvData.prenom} {cvData.nom}</h1><div style={{fontSize:'12px',color:'rgba(255,255,255,0.85)',letterSpacing:'1px'}}>{cvData.titre}</div></div>
          </div>
          <div style={{textAlign:'right',fontSize:'10px',color:'rgba(255,255,255,0.8)'}}><div style={{marginBottom:'3px'}}>✉ {cvData.email}</div><div style={{marginBottom:'3px'}}>☎ {cvData.telephone}</div><div>📍 {cvData.ville}</div></div>
        </div>
      </div>
      {cvData.accroche && <div style={{background:'#fff',padding:'14px 36px',borderBottom:'2px solid #e2e8f0'}}><p style={{fontSize:'10px',color:'#475569',margin:0,fontStyle:'italic',lineHeight:'1.7'}}>{cvData.accroche}</p></div>}
      <div style={{padding:'24px 36px',display:'grid',gridTemplateColumns:'1fr 260px',gap:'28px'}}>
        <div>
          <div style={{fontSize:'10px',fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'16px'}}>Parcours professionnel</div>
          {cvData.experiences?.map((exp,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'16px 1fr',gap:'12px',marginBottom:'16px'}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{width:'14px',height:'14px',borderRadius:'50%',background:'#1e40af',border:'3px solid #bfdbfe',flexShrink:0}}></div>{i<(cvData.experiences?.length||0)-1&&<div style={{width:'2px',flex:1,background:'#bfdbfe',marginTop:'4px'}}></div>}</div>
              <div style={{paddingBottom:'8px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><div style={{fontWeight:'700',fontSize:'11px',color:'#1e293b'}}>{exp.poste}</div><div style={{fontSize:'9px',color:'#3b82f6',background:'#eff6ff',padding:'2px 8px',borderRadius:'10px'}}>{exp.periode}</div></div><div style={{fontSize:'10px',color:'#3b82f6',marginBottom:'5px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#475569',marginBottom:'2px'}}>{m}</li>)}</ul></div>
            </div>
          ))}
          <div style={{fontSize:'10px',fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'14px',marginTop:'8px'}}>Formation</div>
          {cvData.formations?.map((f,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'16px 1fr',gap:'12px',marginBottom:'10px'}}><div style={{display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#93c5fd',flexShrink:0}}></div></div><div><div style={{fontWeight:'700',fontSize:'11px',color:'#1e293b'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#64748b'}}>{f.etablissement} · {f.periode}</div></div></div>)}
        </div>
        <div>
          <div style={{background:'#fff',borderRadius:'12px',padding:'16px',marginBottom:'16px',border:'1px solid #e2e8f0'}}><div style={{fontSize:'10px',fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'12px'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{marginBottom:'7px'}}><div style={{fontSize:'9px',marginBottom:'3px',color:'#334155'}}>{c}</div><div style={{height:'5px',background:'#e2e8f0',borderRadius:'3px'}}><div style={{height:'100%',width:`${88-i*6}%`,background:'linear-gradient(90deg,#1e40af,#3b82f6)',borderRadius:'3px'}}></div></div></div>)}</div>
          <div style={{background:'#fff',borderRadius:'12px',padding:'16px',border:'1px solid #e2e8f0'}}><div style={{fontSize:'10px',fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'12px'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{marginBottom:'8px'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:'10px',marginBottom:'3px'}}><span style={{fontWeight:'600',color:'#1e293b'}}>{l.langue}</span><span style={{color:'#64748b',fontSize:'9px'}}>{l.niveau}</span></div><div style={{height:'5px',background:'#e2e8f0',borderRadius:'3px'}}><div style={{height:'100%',width:l.niveau?.includes('Natif')||l.niveau?.includes('C')?'100%':l.niveau?.includes('B')?'70%':'45%',background:'#3b82f6',borderRadius:'3px'}}></div></div></div>)}</div>
        </div>
      </div>
    </div>
  )
}

// ─── ROUTER ──────────────────────────────────────────────────
export function CVTemplate({ cvData, template }) {
  switch(template) {
    case 'linkedin':      return <TemplateLinkedIn cvData={cvData} />
    case 'canva':         return <TemplateCanva cvData={cvData} />
    case 'harvard':       return <TemplateHarvard cvData={cvData} />
    case 'siliconvalley': return <TemplateSiliconValley cvData={cvData} />
    case 'moderne':       return <TemplateModerne cvData={cvData} />
    case 'executive':     return <TemplateExecutive cvData={cvData} />
    case 'creative':      return <TemplateCreative cvData={cvData} />
    case 'minimal':       return <TemplateMinimal cvData={cvData} />
    case 'tech':          return <TemplateTech cvData={cvData} />
    case 'elegant':       return <TemplateElegant cvData={cvData} />
    case 'bold':          return <TemplateBold cvData={cvData} />
    case 'pastel':        return <TemplatePastel cvData={cvData} />
    case 'corporate':     return <TemplateCorporate cvData={cvData} />
    case 'swiss':         return <TemplateSwiss cvData={cvData} />
    case 'timeline':      return <TemplateTimeline cvData={cvData} />
    default:              return <TemplateFinance cvData={cvData} />
  }
}