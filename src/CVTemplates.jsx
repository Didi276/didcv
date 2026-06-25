// ============================================================
// CVTemplates.jsx — 16 templates
// Option B : taille dynamique selon densité du contenu
// Certifications et Centres d'intérêt conditionnels
// ============================================================

const PHOTO_DEMO = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=face'

// ─── Avatar ─────────────────────────────────────────────────
function Avatar({ cvData, size = 70, shape = 'circle' }) {
  const borderRadius = shape === 'circle' ? '50%' : shape === 'rounded' ? '12px' : '4px'
  if (cvData.photo === null) return null
  const src = cvData.photo || PHOTO_DEMO
  return (
    <img src={src} alt="Photo" style={{
      width: size, height: size, borderRadius,
      objectFit: 'cover', display: 'block', flexShrink: 0,
      border: cvData.photo ? 'none' : '2px dashed rgba(128,128,128,0.25)'
    }} />
  )
}

// ─── Option B : calcul taille de police + lineHeight dynamiques ──
// Police plafonnée à 11px max pour éviter les débordements dans les templates
// On compense le manque de contenu avec lineHeight et padding plus généreux
function getFontConfig(cvData) {
  const nbExp = cvData.experiences?.length || 0
  const hasCert = cvData.certifications?.length > 0
  const hasCI = cvData.centres_interet?.length > 0
  const totalMissions = cvData.experiences?.reduce((acc, e) => acc + (e.missions?.length || 0), 0) || 0

  // Longueur moyenne des missions (proxy de densité textuelle)
  const allMissions = cvData.experiences?.flatMap(e => e.missions || []) || []
  const avgMissionLen = allMissions.length > 0
    ? allMissions.reduce((acc, m) => acc + (m?.length || 0), 0) / allMissions.length
    : 60

  // Score de densité — inclut formations et leurs descriptions
  const nbFormations = cvData.formations?.length || 0
  const hasFormDesc = cvData.formations?.some(f => f.description) || false
  const density = nbExp
    + totalMissions * 0.3
    + totalMissions * (avgMissionLen / 80) * 0.2
    + (hasCert ? 1.5 : 0)
    + (hasCI ? 1 : 0)
    + nbFormations * 0.5
    + (hasFormDesc ? 1 : 0)

  // ⚠️ Police max = 11px pour éviter les débordements dans les templates à largeur fixe (794px)
  // On joue sur lineHeight et padding pour remplir la page quand le contenu est léger
  // density faible = lineH grand = contenu aéré qui remplit la page
  // density élevée = lineH serré + police petite = tout tient sur 1 page
  if (density < 5)  return { base: '11px', small: '10px', xsmall: '9px', lineH: '2.1',  mb: '14px' }
  if (density < 7)  return { base: '11px', small: '10px', xsmall: '9px', lineH: '1.95', mb: '12px' }
  if (density < 9)  return { base: '11px', small: '10px', xsmall: '9px', lineH: '1.8',  mb: '10px' }
  if (density < 11) return { base: '11px', small: '10px', xsmall: '9px', lineH: '1.7',  mb: '9px'  }
  if (density < 14) return { base: '11px', small: '10px', xsmall: '8.5px', lineH: '1.6', mb: '8px' }
  if (density < 17) return { base: '10.5px', small: '9.5px', xsmall: '8px', lineH: '1.5', mb: '6px' }
  if (density < 21) return { base: '10px', small: '9px', xsmall: '7.5px', lineH: '1.45', mb: '5px' }
  return                    { base: '9.5px', small: '8.5px', xsmall: '7px', lineH: '1.4',  mb: '4px' }
}

// ─── Sections conditionnelles réutilisables ──────────────────
function SectionCertifications({ cvData, couleur = '#1a1a1a', style = {} }) {
  if (!cvData.certifications?.length) return null
  return (
    <div style={{marginBottom:'10px', ...style}}>
      <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:`1px solid ${couleur}`,paddingBottom:'3px',marginBottom:'6px',color: couleur}}>CERTIFICATIONS</div>
      {cvData.certifications.map((c, i) => (
        <div key={i} style={{fontSize:'9px',color:'#333',marginBottom:'2px'}}>
          ✦ <strong>{c.titre}</strong>{c.organisme ? ` — ${c.organisme}` : ''}{c.annee ? ` (${c.annee})` : ''}
        </div>
      ))}
    </div>
  )
}

function SectionCentresInteret({ cvData, couleur = '#1a1a1a', style = {} }) {
  if (!cvData.centres_interet?.length) return null
  return (
    <div style={{marginBottom:'10px', ...style}}>
      <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:`1px solid ${couleur}`,paddingBottom:'3px',marginBottom:'6px',color: couleur}}>CENTRES D'INTÉRÊT</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
        {cvData.centres_interet.map((ci, i) => (
          <span key={i} style={{fontSize:'9px',color:'#444',background:'#f5f5f5',padding:'2px 8px',borderRadius:'2px',border:'1px solid #e5e5e5'}}>{ci}</span>
        ))}
      </div>
    </div>
  )
}

// ─── 1. FINANCE ──────────────────────────────────────────────
export function TemplateFinance({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Georgia,serif',color:'#1a1a1a',fontSize:f.base,lineHeight:f.lineH,padding:'36px 40px',background:'#fff',width:'794px',height:'1123px',overflow:'hidden',boxSizing:'border-box'}}>

      {/* ─── EN-TÊTE ─── */}
      <div style={{borderBottom:'3px solid #1a1a1a',paddingBottom:'14px',marginBottom:'14px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'20px'}}>
          {/* Photo plus grande */}
          <Avatar cvData={cvData} size={88} shape="circle" />
          <div style={{flex:1,minWidth:0}}>
            {/* Titre en petit au-dessus */}
            <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2.5px',textTransform:'uppercase',color:'#888',marginBottom:'4px'}}>{cvData.titre}</div>
            {/* Nom en grand — SANS h1 pour éviter les conflits CSS */}
            <div style={{fontSize:'24px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',fontFamily:'Georgia,serif',lineHeight:'1.1',color:'#1a1a1a',marginBottom:'8px'}}>{cvData.prenom} {cvData.nom}</div>
            <div style={{display:'flex',gap:'18px',flexWrap:'wrap',fontSize:'9px',color:'#666'}}>
              <span>✉ {cvData.email}</span>
              <span>☎ {cvData.telephone}</span>
              <span>📍 {cvData.ville}</span>
              {cvData.linkedin && <span>🔗 {cvData.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* ─── PROFIL ─── */}
      {cvData.accroche && (
        <div style={{marginBottom:'12px'}}>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'2px',marginBottom:'7px'}}>PROFIL</div>
          <p style={{fontSize:f.small,color:'#333',fontStyle:'italic',margin:0,lineHeight:'1.7'}}>{cvData.accroche}</p>
        </div>
      )}

      {/* ─── EXPÉRIENCES ─── */}
      <div style={{marginBottom:'12px'}}>
        <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'2px',marginBottom:'8px'}}>EXPÉRIENCES PROFESSIONNELLES</div>
        {cvData.experiences?.map((exp,i)=>(
          <div key={i} style={{marginBottom:f.mb}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:'700',fontSize:f.base,color:'#1a1a1a'}}>{exp.poste}</div>
                <div style={{fontSize:f.small,color:'#555',fontStyle:'italic'}}>{exp.entreprise} — {exp.lieu}</div>
              </div>
              <div style={{fontSize:'9px',color:'#777',whiteSpace:'nowrap',marginLeft:'12px'}}>{exp.periode}</div>
            </div>
            <ul style={{paddingLeft:'16px',marginTop:'4px',marginBottom:0}}>
              {exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#333',marginBottom:'2px',lineHeight:'1.5'}}>{m}</li>)}
            </ul>
          </div>
        ))}
      </div>

      {/* ─── FORMATION ─── */}
      <div style={{marginBottom:'12px'}}>
        <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'2px',marginBottom:'8px'}}>FORMATION</div>
        {cvData.formations?.map((f2,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'7px'}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontWeight:'700',fontSize:f.base,color:'#1a1a1a'}}>{f2.diplome}</div>
              <div style={{fontSize:f.small,color:'#555'}}>{f2.etablissement}{f2.mention ? ` — ${f2.mention}` : ''}</div>
              {f2.description && <div style={{fontSize:f.xsmall,color:'#888',fontStyle:'italic',marginTop:'1px'}}>{f2.description}</div>}
            </div>
            <div style={{fontSize:'9px',color:'#777',whiteSpace:'nowrap',marginLeft:'12px'}}>{f2.periode}</div>
          </div>
        ))}
      </div>

      {/* ─── COMPÉTENCES + LANGUES ─── */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'10px'}}>
        <div>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'2px',marginBottom:'7px'}}>COMPÉTENCES</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>
            {cvData.competences?.map((c,i)=><span key={i} style={{background:'#f0f0f0',border:'1px solid #ddd',padding:'2px 8px',borderRadius:'2px',fontSize:'9px',color:'#333'}}>{c}</span>)}
          </div>
        </div>
        <div>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'2px',marginBottom:'7px'}}>LANGUES</div>
          {cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:f.small,borderBottom:'1px solid #eee',padding:'2px 0'}}><span>{l.langue}</span><span style={{color:'#777',fontStyle:'italic'}}>{l.niveau}</span></div>)}
        </div>
      </div>

      <SectionCertifications cvData={cvData} couleur="#1a1a1a" />
      <SectionCentresInteret cvData={cvData} couleur="#1a1a1a" />
    </div>
  )
}

// ─── 2. LINKEDIN ─────────────────────────────────────────────
export function TemplateLinkedIn({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Segoe UI",Arial,sans-serif',color:'#191919',fontSize:f.base,lineHeight:f.lineH,background:'#fff',width:'794px',height:'1123px',overflow:'hidden'}}>
      <div style={{background:'#0a66c2',padding:'22px 28px'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:'16px'}}>
          <Avatar cvData={cvData} size={62} shape="circle" />
          <div style={{flex:1}}>
            <div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.75)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div>
            <h1 style={{fontSize:'22px',fontWeight:'700',color:'#fff',margin:'0 0 6px',lineHeight:'1.1'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{display:'flex',gap:'14px',flexWrap:'wrap',fontSize:f.xsmall,color:'rgba(255,255,255,0.75)'}}><span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span></div>
          </div>
        </div>
      </div>
      <div style={{padding:'16px 28px'}}>
        {cvData.accroche && <div style={{marginBottom:'12px',padding:'10px 14px',background:'#f3f6f9',borderRadius:'6px',borderLeft:'4px solid #0a66c2'}}><p style={{fontSize:f.small,color:'#444',margin:0,lineHeight:'1.6'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}><div style={{width:'4px',height:'16px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:f.base,fontWeight:'700',color:'#191919'}}>EXPÉRIENCES</div></div>
          {cvData.experiences?.map((exp,i)=>(
            <div key={i} style={{marginBottom:f.mb,paddingLeft:'10px',borderLeft:'2px solid #e0e0e0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#0a66c2',fontWeight:'500'}}>{exp.entreprise} · {exp.lieu}</div></div>
                <div style={{fontSize:f.xsmall,color:'#666',whiteSpace:'nowrap',background:'#f3f6f9',padding:'1px 7px',borderRadius:'10px'}}>{exp.periode}</div>
              </div>
              <ul style={{paddingLeft:'12px',marginTop:'4px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#444',marginBottom:'1px'}}>{m}</li>)}</ul>
            </div>
          ))}
        </div>
        <div style={{marginBottom:'12px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}><div style={{width:'4px',height:'16px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:f.base,fontWeight:'700'}}>FORMATION</div></div>
          {cvData.formations?.map((f2,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'6px',paddingLeft:'10px',borderLeft:'2px solid #e0e0e0'}}>
              <div><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#0a66c2'}}>{f2.etablissement}</div></div>
              <div style={{fontSize:f.xsmall,color:'#666'}}>{f2.periode}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'10px'}}>
          <div><div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}><div style={{width:'4px',height:'16px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:f.base,fontWeight:'700'}}>COMPÉTENCES</div></div><div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{background:'#e8f3ff',color:'#0a66c2',padding:'2px 8px',borderRadius:'10px',fontSize:f.xsmall,fontWeight:'500',border:'1px solid #b3d4f5'}}>{c}</span>)}</div></div>
          <div><div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}><div style={{width:'4px',height:'16px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:f.base,fontWeight:'700'}}>LANGUES</div></div>{cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:f.small,padding:'2px 0',borderBottom:'1px solid #f0f0f0'}}><span style={{fontWeight:'500'}}>{l.langue}</span><span style={{color:'#666'}}>{l.niveau}</span></div>)}</div>
        </div>
        {cvData.certifications?.length > 0 && (
          <div style={{marginBottom:f.mb}}>
            <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}><div style={{width:'4px',height:'16px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:f.base,fontWeight:'700'}}>CERTIFICATIONS</div></div>
            <div style={{paddingLeft:'10px'}}>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.small,color:'#333',marginBottom:'2px'}}>✦ <strong>{c.titre}</strong>{c.organisme ? ` — ${c.organisme}` : ''}{c.annee ? ` (${c.annee})` : ''}</div>)}</div>
          </div>
        )}
        {cvData.centres_interet?.length > 0 && (
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'6px',marginBottom:'6px'}}><div style={{width:'4px',height:'16px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:f.base,fontWeight:'700'}}>CENTRES D'INTÉRÊT</div></div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'4px',paddingLeft:'10px'}}>{cvData.centres_interet.map((ci,i)=><span key={i} style={{background:'#e8f3ff',color:'#0a66c2',padding:'2px 8px',borderRadius:'10px',fontSize:f.xsmall,border:'1px solid #b3d4f5'}}>{ci}</span>)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── 3. CANVA ────────────────────────────────────────────────
export function TemplateCanva({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Helvetica,sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'250px 1fr'}}>
      <div style={{background:'#2d2d2d',color:'#fff',padding:'28px 20px'}}>
        <div style={{textAlign:'center',marginBottom:'20px',paddingBottom:'16px',borderBottom:'1px solid rgba(255,255,255,0.15)'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}><Avatar cvData={cvData} size={68} shape="circle" /></div>
          <div style={{fontSize:'7px',color:'rgba(255,255,255,0.5)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div><h1 style={{fontSize:'17px',fontWeight:'700',color:'#fff',margin:'0',lineHeight:'1.15'}}>{cvData.prenom}<br/>{cvData.nom}</h1>
        </div>
        <div style={{marginBottom:'16px'}}>
          <div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'8px'}}>CONTACT</div>
          <div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.85)',marginBottom:'4px'}}>✉ {cvData.email}</div>
          <div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.85)',marginBottom:'4px'}}>☎ {cvData.telephone}</div>
          <div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.85)',marginBottom:'4px'}}>📍 {cvData.ville}</div>
        </div>
        <div style={{marginBottom:'16px'}}>
          <div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'8px'}}>COMPÉTENCES</div>
          {cvData.competences?.map((c,i)=><div key={i} style={{marginBottom:'5px'}}><div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.85)',marginBottom:'2px'}}>{c}</div><div style={{height:'2px',background:'rgba(255,255,255,0.15)',borderRadius:'1px'}}><div style={{height:'100%',width:`${75+i*2}%`,background:'linear-gradient(90deg,#f093fb,#f5576c)',borderRadius:'1px'}}></div></div></div>)}
        </div>
        <div style={{marginBottom:'12px'}}>
          <div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'8px'}}>LANGUES</div>
          {cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.85)',marginBottom:'3px'}}><strong>{l.langue}</strong> — {l.niveau}</div>)}
        </div>
        {cvData.certifications?.length > 0 && (
          <div style={{marginBottom:'12px'}}>
            <div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'8px'}}>CERTIFICATIONS</div>
            {cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.85)',marginBottom:'3px'}}>✦ {c.titre}{c.annee ? ` (${c.annee})` : ''}</div>)}
          </div>
        )}
        {cvData.centres_interet?.length > 0 && (
          <div>
            <div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'8px'}}>CENTRES D'INTÉRÊT</div>
            {cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.85)',marginBottom:'3px'}}>• {ci}</div>)}
          </div>
        )}
      </div>
      <div style={{padding:'24px 20px'}}>
        {cvData.accroche && <div style={{marginBottom:'14px',padding:'10px 14px',background:'#fff5fb',borderRadius:'6px',borderLeft:'4px solid #f093fb'}}><p style={{fontSize:f.small,color:'#444',margin:0,fontStyle:'italic'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'14px'}}>
          <div style={{fontSize:f.small,fontWeight:'700',color:'#2d2d2d',textTransform:'uppercase',marginBottom:'10px',paddingBottom:'3px',borderBottom:'2px solid #f093fb'}}>EXPÉRIENCES</div>
          {cvData.experiences?.map((exp,i)=>(
            <div key={i} style={{marginBottom:f.mb,paddingLeft:'10px',borderLeft:'3px solid #f093fb'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#f5576c',fontWeight:'500'}}>{exp.entreprise} · {exp.lieu}</div></div><div style={{fontSize:f.xsmall,color:'#999',whiteSpace:'nowrap'}}>{exp.periode}</div></div>
              <ul style={{paddingLeft:'10px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#555',marginBottom:'1px'}}>{m}</li>)}</ul>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:f.small,fontWeight:'700',color:'#2d2d2d',textTransform:'uppercase',marginBottom:'10px',paddingBottom:'3px',borderBottom:'2px solid #f093fb'}}>FORMATION</div>
          {cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:'7px',paddingLeft:'10px',borderLeft:'3px solid #f093fb'}}><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#888'}}>{f2.etablissement} · {f2.periode}</div></div>)}
        </div>
      </div>
    </div>
  )
}

// ─── 4. HARVARD ──────────────────────────────────────────────
export function TemplateHarvard({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Times New Roman",Times,serif',color:'#111',fontSize:f.base,lineHeight:f.lineH,padding:'36px 44px',background:'#fff',width:'794px',height:'1123px',overflow:'hidden'}}>
      <div style={{textAlign:'center',marginBottom:'14px',paddingBottom:'10px',borderBottom:'2px solid #111'}}>
        <div style={{display:'flex',justifyContent:'center',marginBottom:'8px'}}><Avatar cvData={cvData} size={56} shape="circle" /></div>
        <div style={{fontSize:f.xsmall,fontWeight:'400',letterSpacing:'2px',textTransform:'uppercase',color:'#555',marginBottom:'3px',fontFamily:'"Times New Roman",serif'}}>{cvData.titre}</div>
        <h1 style={{fontSize:'22px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase',margin:'0 0 5px',fontFamily:'"Times New Roman",serif'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{display:'flex',justifyContent:'center',gap:'14px',fontSize:f.xsmall,color:'#333',flexWrap:'wrap'}}><span>{cvData.email}</span><span>|</span><span>{cvData.telephone}</span><span>|</span><span>{cvData.ville}</span></div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'12px',textAlign:'center'}}><p style={{fontSize:f.small,color:'#444',fontStyle:'italic',margin:0}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'12px'}}>
        <div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'7px'}}>Experience</div>
        {cvData.experiences?.map((exp,i)=>(
          <div key={i} style={{marginBottom:'8px'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:f.base}}>{exp.entreprise}, {exp.lieu}</div><div style={{fontSize:f.xsmall,color:'#555'}}>{exp.periode}</div></div>
            <div style={{fontStyle:'italic',fontSize:f.small,color:'#333',marginBottom:'3px'}}>{exp.poste}</div>
            <ul style={{paddingLeft:'16px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#222',marginBottom:'1px'}}>{m}</li>)}</ul>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'12px'}}>
        <div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'7px'}}>Education</div>
        {cvData.formations?.map((f2,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{f2.etablissement}</div><div style={{fontSize:f.small,fontStyle:'italic',color:'#333'}}>{f2.diplome}</div></div><div style={{fontSize:f.xsmall,color:'#555'}}>{f2.periode}</div></div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'10px'}}>
        <div><div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'7px'}}>Skills</div><div style={{fontSize:f.small,color:'#222',lineHeight:'1.7'}}>{cvData.competences?.join(' · ')}</div></div>
        <div><div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'7px'}}>Languages</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,color:'#222',marginBottom:'2px'}}>{l.langue} — {l.niveau}</div>)}</div>
      </div>
      {cvData.certifications?.length > 0 && (
        <div style={{marginBottom:'8px'}}>
          <div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'6px'}}>Certifications</div>
          <div style={{fontSize:f.small,color:'#222'}}>{cvData.certifications.map((c,i)=><span key={i}>{c.titre}{c.organisme ? ` (${c.organisme})` : ''}{i < cvData.certifications.length-1 ? ' · ' : ''}</span>)}</div>
        </div>
      )}
      {cvData.centres_interet?.length > 0 && (
        <div>
          <div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'6px'}}>Centres d'intérêt</div>
          <div style={{fontSize:f.small,color:'#222'}}>{cvData.centres_interet.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ─── 5. SILICON VALLEY ───────────────────────────────────────
export function TemplateSiliconValley({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Helvetica Neue",sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#fff',color:'#1d1d1f',width:'794px',height:'1123px',overflow:'hidden',padding:'36px 44px'}}>
      <div style={{marginBottom:'22px',display:'flex',alignItems:'center',gap:'18px'}}>
        <Avatar cvData={cvData} size={68} shape="circle" />
        <div>
          <div style={{fontSize:f.xsmall,color:'#6e6e73',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'2px'}}>{cvData.titre}</div>
          <h1 style={{fontSize:'30px',fontWeight:'700',letterSpacing:'-1px',color:'#1d1d1f',margin:'0 0 6px',lineHeight:'1.1'}}>{cvData.prenom} {cvData.nom}</h1>
          <div style={{display:'flex',gap:'18px',flexWrap:'wrap',fontSize:f.xsmall,color:'#6e6e73'}}><span>{cvData.email}</span><span>{cvData.telephone}</span><span>{cvData.ville}</span></div>
          <div style={{width:'40px',height:'2px',background:'#1d1d1f',marginTop:'10px',borderRadius:'1px'}}></div>
        </div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'18px'}}><p style={{fontSize:f.base,color:'#3d3d3f',lineHeight:'1.7',margin:0,maxWidth:'520px'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'18px'}}>
        <div style={{fontSize:f.xsmall,fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'12px'}}>EXPÉRIENCES</div>
        {cvData.experiences?.map((exp,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'14px',marginBottom:'12px'}}>
            <div style={{fontSize:f.xsmall,color:'#6e6e73',paddingTop:'1px'}}>{exp.periode}</div>
            <div><div style={{fontWeight:'600',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#6e6e73',marginBottom:'4px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#3d3d3f',marginBottom:'1px'}}>{m}</li>)}</ul></div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'18px'}}>
        <div style={{fontSize:f.xsmall,fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'12px'}}>FORMATION</div>
        {cvData.formations?.map((f2,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'100px 1fr',gap:'14px',marginBottom:'7px'}}><div style={{fontSize:f.xsmall,color:'#6e6e73'}}>{f2.periode}</div><div><div style={{fontWeight:'600',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#6e6e73'}}>{f2.etablissement}</div></div></div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'10px'}}>
        <div><div style={{fontSize:f.xsmall,fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'8px'}}>COMPÉTENCES</div><div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{border:'1px solid #d2d2d7',padding:'2px 9px',fontSize:f.xsmall,color:'#1d1d1f',borderRadius:'100px'}}>{c}</span>)}</div></div>
        <div><div style={{fontSize:f.xsmall,fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,color:'#3d3d3f',marginBottom:'3px'}}>{l.langue} <span style={{color:'#6e6e73'}}>— {l.niveau}</span></div>)}</div>
      </div>
      {cvData.certifications?.length > 0 && <div style={{marginBottom:'8px'}}><div style={{fontSize:f.xsmall,fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'6px'}}>CERTIFICATIONS</div><div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{cvData.certifications.map((c,i)=><span key={i} style={{border:'1px solid #d2d2d7',padding:'2px 9px',fontSize:f.xsmall,color:'#1d1d1f',borderRadius:'100px'}}>✦ {c.titre}</span>)}</div></div>}
      {cvData.centres_interet?.length > 0 && <div><div style={{fontSize:f.xsmall,fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'6px'}}>CENTRES D'INTÉRÊT</div><div style={{fontSize:f.small,color:'#3d3d3f'}}>{cvData.centres_interet.join(' · ')}</div></div>}
    </div>
  )
}

// ─── 6. MODERNE ──────────────────────────────────────────────
export function TemplateModerne({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{display:'grid',gridTemplateColumns:'210px 1fr',fontFamily:'Helvetica,sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#fff',width:'794px',height:'1123px',overflow:'hidden'}}>
      <div style={{background:'#0f6e56',color:'#fff',padding:'24px 18px'}}>
        <div style={{marginBottom:'18px',paddingBottom:'14px',borderBottom:'1px solid rgba(255,255,255,0.2)',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
          <Avatar cvData={cvData} size={64} shape="circle" />
          <div style={{textAlign:'center'}}><div style={{fontSize:'7px',color:'rgba(255,255,255,0.6)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div><h1 style={{fontSize:'18px',fontWeight:'700',marginBottom:'0',color:'#fff',lineHeight:'1.15'}}>{cvData.prenom}<br/>{cvData.nom}</h1></div>
        </div>
        <div style={{marginBottom:'16px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'6px'}}>CONTACT</div><div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.9)',marginBottom:'3px'}}>✉ {cvData.email}</div><div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.9)',marginBottom:'3px'}}>☎ {cvData.telephone}</div><div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.9)',marginBottom:'3px'}}>📍 {cvData.ville}</div></div>
        <div style={{marginBottom:'16px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'6px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{background:'rgba(255,255,255,0.15)',padding:'3px 7px',borderRadius:'3px',fontSize:f.xsmall,color:'#fff',marginBottom:'3px'}}>{c}</div>)}</div>
        <div style={{marginBottom:'12px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'6px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.9)',marginBottom:'2px'}}>{l.langue} — {l.niveau}</div>)}</div>
        {cvData.certifications?.length > 0 && <div style={{marginBottom:'12px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'6px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.9)',marginBottom:'2px'}}>✦ {c.titre}</div>)}</div>}
        {cvData.centres_interet?.length > 0 && <div><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'6px'}}>CENTRES D'INTÉRÊT</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.9)',marginBottom:'2px'}}>• {ci}</div>)}</div>}
      </div>
      <div style={{padding:'24px 20px'}}>
        {cvData.accroche && <div style={{marginBottom:'14px',padding:'10px',background:'#f0fdf4',borderLeft:'3px solid #0f6e56',borderRadius:'0 5px 5px 0'}}><p style={{fontSize:f.small,color:'#374151',fontStyle:'italic',margin:0}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'14px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',color:'#0f6e56',letterSpacing:'1.5px',textTransform:'uppercase',borderBottom:'2px solid #0f6e56',paddingBottom:'3px',marginBottom:'8px'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#0f6e56'}}>{exp.entreprise} — {exp.lieu}</div></div><div style={{fontSize:f.xsmall,color:'#888',whiteSpace:'nowrap',background:'#f0fdf4',padding:'1px 7px',borderRadius:'10px'}}>{exp.periode}</div></div><ul style={{paddingLeft:'12px',marginTop:'3px',marginBottom:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#444',marginBottom:'1px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{fontSize:f.xsmall,fontWeight:'700',color:'#0f6e56',letterSpacing:'1.5px',textTransform:'uppercase',borderBottom:'2px solid #0f6e56',paddingBottom:'3px',marginBottom:'8px'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}><div><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#555'}}>{f2.etablissement}</div></div><div style={{fontSize:f.xsmall,color:'#888'}}>{f2.periode}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 7. EXECUTIVE ────────────────────────────────────────────
export function TemplateExecutive({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Georgia,serif',fontSize:f.base,lineHeight:f.lineH,background:'#0d0d0d',color:'#e8e0cc',width:'794px',height:'1123px',overflow:'hidden',padding:'44px 48px'}}>
      <div style={{borderBottom:'1px solid #c9a84c',paddingBottom:'18px',marginBottom:'20px',display:'flex',alignItems:'center',gap:'18px'}}>
        <Avatar cvData={cvData} size={68} shape="rounded" />
        <div><div style={{fontSize:f.xsmall,letterSpacing:'3px',textTransform:'uppercase',color:'#888',marginBottom:'4px'}}>{cvData.titre}</div><h1 style={{fontSize:'26px',fontWeight:'400',letterSpacing:'4px',textTransform:'uppercase',color:'#c9a84c',margin:'0 0 8px',fontFamily:'Georgia,serif'}}>{cvData.prenom} {cvData.nom}</h1><div style={{display:'flex',gap:'18px',flexWrap:'wrap',fontSize:f.xsmall,color:'#777'}}><span>{cvData.email}</span><span>·</span><span>{cvData.telephone}</span><span>·</span><span>{cvData.ville}</span></div></div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'20px',padding:'14px 18px',border:'1px solid #333',borderLeft:'3px solid #c9a84c'}}><p style={{fontSize:f.small,color:'#bbb',fontStyle:'italic',margin:0,lineHeight:'1.7'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'18px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'12px',paddingBottom:'5px',borderBottom:'1px solid #333'}}>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb,paddingLeft:'14px',borderLeft:'1px solid #333'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#e8e0cc'}}>{exp.poste}</div><div style={{fontSize:f.xsmall,color:'#c9a84c'}}>{exp.periode}</div></div><div style={{fontSize:f.small,color:'#888',marginBottom:'5px',fontStyle:'italic'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#aaa',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
      <div style={{marginBottom:'18px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'12px',paddingBottom:'5px',borderBottom:'1px solid #333'}}>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'8px',paddingLeft:'14px',borderLeft:'1px solid #333'}}><div><div style={{fontWeight:'700',fontSize:f.base,color:'#e8e0cc'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#888'}}>{f2.etablissement}</div></div><div style={{fontSize:f.xsmall,color:'#c9a84c'}}>{f2.periode}</div></div>)}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'12px'}}><div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'8px',paddingBottom:'5px',borderBottom:'1px solid #333'}}>COMPÉTENCES</div><div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{border:'1px solid #444',color:'#bbb',padding:'2px 8px',fontSize:f.xsmall,borderRadius:'2px'}}>{c}</span>)}</div></div><div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'8px',paddingBottom:'5px',borderBottom:'1px solid #333'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:f.small,color:'#aaa',padding:'3px 0',borderBottom:'1px solid #222'}}><span>{l.langue}</span><span style={{color:'#c9a84c'}}>{l.niveau}</span></div>)}</div></div>
      {cvData.certifications?.length > 0 && <div style={{marginBottom:'10px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'6px',paddingBottom:'5px',borderBottom:'1px solid #333'}}>CERTIFICATIONS</div><div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{cvData.certifications.map((c,i)=><span key={i} style={{border:'1px solid #444',color:'#c9a84c',padding:'2px 8px',fontSize:f.xsmall,borderRadius:'2px'}}>✦ {c.titre}</span>)}</div></div>}
      {cvData.centres_interet?.length > 0 && <div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#c9a84c',marginBottom:'6px',paddingBottom:'5px',borderBottom:'1px solid #333'}}>CENTRES D'INTÉRÊT</div><div style={{fontSize:f.small,color:'#888'}}>{cvData.centres_interet.join(' · ')}</div></div>}
    </div>
  )
}

// ─── 8. CREATIVE ─────────────────────────────────────────────
export function TemplateCreative({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'230px 1fr'}}>
      <div style={{background:'linear-gradient(160deg,#667eea,#764ba2)',color:'#fff',padding:'28px 18px',display:'flex',flexDirection:'column',gap:'16px'}}>
        <div style={{textAlign:'center',paddingBottom:'16px',borderBottom:'1px solid rgba(255,255,255,0.2)'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'10px'}}><Avatar cvData={cvData} size={70} shape="circle" /></div>
          <div style={{fontSize:'7px',color:'rgba(255,255,255,0.6)',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div><h1 style={{fontSize:'18px',fontWeight:'700',margin:'0',lineHeight:'1.15'}}>{cvData.prenom}<br/>{cvData.nom}</h1>
        </div>
        <div><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'6px'}}>CONTACT</div>{[cvData.email,cvData.telephone,cvData.ville].map((v,i)=><div key={i} style={{fontSize:f.xsmall,marginBottom:'3px',color:'rgba(255,255,255,0.9)'}}>{v}</div>)}</div>
        <div><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'8px'}}>COMPÉTENCES</div>{cvData.competences?.map((c,i)=><div key={i} style={{marginBottom:'5px'}}><div style={{fontSize:f.xsmall,marginBottom:'2px'}}>{c}</div><div style={{height:'3px',background:'rgba(255,255,255,0.2)',borderRadius:'2px'}}><div style={{height:'100%',width:`${80-i*5}%`,background:'#fff',borderRadius:'2px',opacity:0.9}}></div></div></div>)}</div>
        <div><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'6px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.9)',marginBottom:'3px'}}>{l.langue} <span style={{opacity:0.6}}>· {l.niveau}</span></div>)}</div>
        {cvData.certifications?.length > 0 && <div><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'6px'}}>CERTIFICATIONS</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.9)',marginBottom:'2px'}}>✦ {c.titre}</div>)}</div>}
        {cvData.centres_interet?.length > 0 && <div><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'6px'}}>CENTRES D'INTÉRÊT</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.9)',marginBottom:'2px'}}>• {ci}</div>)}</div>}
      </div>
      <div style={{padding:'24px 20px',background:'#fafafa'}}>
        {cvData.accroche && <div style={{marginBottom:'14px',padding:'12px',background:'#fff',borderRadius:'8px',boxShadow:'0 2px 8px rgba(102,126,234,0.12)',borderLeft:'4px solid #667eea'}}><p style={{fontSize:f.small,color:'#555',margin:0,lineHeight:'1.6',fontStyle:'italic'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'14px'}}><div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'10px'}}><div style={{width:'24px',height:'3px',background:'linear-gradient(90deg,#667eea,#764ba2)',borderRadius:'2px'}}></div><div style={{fontSize:f.small,fontWeight:'700',color:'#333',letterSpacing:'1px',textTransform:'uppercase'}}>Expériences</div></div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb,background:'#fff',borderRadius:'7px',padding:'10px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#333'}}>{exp.poste}</div><div style={{fontSize:f.xsmall,color:'#764ba2',background:'#f3f0ff',padding:'1px 7px',borderRadius:'10px'}}>{exp.periode}</div></div><div style={{fontSize:f.small,color:'#667eea',marginBottom:'5px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#666',marginBottom:'1px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'10px'}}><div style={{width:'24px',height:'3px',background:'linear-gradient(90deg,#667eea,#764ba2)',borderRadius:'2px'}}></div><div style={{fontSize:f.small,fontWeight:'700',color:'#333',letterSpacing:'1px',textTransform:'uppercase'}}>Formation</div></div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:'8px',background:'#fff',borderRadius:'7px',padding:'8px 10px',boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#333'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#888'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 9. MINIMAL ──────────────────────────────────────────────
export function TemplateMinimal({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#fff',color:'#222',width:'794px',height:'1123px',overflow:'hidden',padding:'48px 56px'}}>
      <div style={{marginBottom:'30px',display:'flex',alignItems:'center',gap:'18px'}}>
        <Avatar cvData={cvData} size={64} shape="circle" />
        <div><h1 style={{fontSize:'28px',fontWeight:'300',letterSpacing:'1px',color:'#111',margin:'0 0 5px'}}>{cvData.prenom} <strong style={{fontWeight:'700'}}>{cvData.nom}</strong></h1><div style={{fontSize:'12px',color:'#888',marginBottom:'8px',letterSpacing:'0.5px'}}>{cvData.titre}</div><div style={{display:'flex',gap:'20px',fontSize:f.xsmall,color:'#aaa',flexWrap:'wrap'}}><span>{cvData.email}</span><span>{cvData.telephone}</span><span>{cvData.ville}</span></div></div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'24px',paddingBottom:'24px',borderBottom:'1px solid #f0f0f0'}}><p style={{fontSize:f.small,color:'#555',margin:0,lineHeight:'1.8',maxWidth:'500px'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'22px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'14px'}}>Expériences</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'90px 1fr',gap:'18px',marginBottom:f.mb,paddingBottom:'16px',borderBottom:'1px solid #f5f5f5'}}><div style={{fontSize:f.xsmall,color:'#aaa',paddingTop:'2px'}}>{exp.periode}</div><div><div style={{fontWeight:'600',fontSize:f.base,marginBottom:'2px'}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#aaa',marginBottom:'6px'}}>{exp.entreprise}, {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#555',marginBottom:'2px'}}>{m}</li>)}</ul></div></div>)}</div>
      <div style={{marginBottom:'22px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'14px'}}>Formation</div>{cvData.formations?.map((f2,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'90px 1fr',gap:'18px',marginBottom:'8px'}}><div style={{fontSize:f.xsmall,color:'#aaa'}}>{f2.periode}</div><div><div style={{fontWeight:'600',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#aaa'}}>{f2.etablissement}</div></div></div>)}</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px',marginBottom:'14px'}}><div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'10px'}}>Compétences</div><div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{fontSize:f.xsmall,color:'#555',background:'#f8f8f8',padding:'2px 9px',borderRadius:'3px'}}>{c}</span>)}</div></div><div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'10px'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.small,color:'#555',marginBottom:'3px'}}>{l.langue} <span style={{color:'#ccc'}}>·</span> {l.niveau}</div>)}</div></div>
      {cvData.certifications?.length > 0 && <div style={{marginBottom:'12px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'8px'}}>Certifications</div><div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{cvData.certifications.map((c,i)=><span key={i} style={{fontSize:f.xsmall,color:'#555',background:'#f8f8f8',padding:'2px 9px',borderRadius:'3px'}}>✦ {c.titre}</span>)}</div></div>}
      {cvData.centres_interet?.length > 0 && <div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',color:'#ccc',marginBottom:'8px'}}>Centres d'intérêt</div><div style={{fontSize:f.small,color:'#555'}}>{cvData.centres_interet.join(' · ')}</div></div>}
    </div>
  )
}

// ─── 10. TECH ────────────────────────────────────────────────
export function TemplateTech({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Courier New",monospace',fontSize:f.base,lineHeight:f.lineH,background:'#fff',width:'794px',height:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'220px 1fr'}}>
      <div style={{background:'#0f172a',color:'#94a3b8',padding:'24px 16px'}}>
        <div style={{marginBottom:'18px',paddingBottom:'14px',borderBottom:'1px solid #1e293b',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
          <Avatar cvData={cvData} size={64} shape="circle" />
          <div style={{textAlign:'center'}}><div style={{fontSize:f.xsmall,color:'#22d3ee',marginBottom:'3px',fontFamily:'monospace'}}>&gt; whoami</div><div style={{fontSize:'7px',color:'#22d3ee',letterSpacing:'1px',marginBottom:'2px'}}>{cvData.titre}</div><h1 style={{fontSize:'15px',fontWeight:'700',color:'#f1f5f9',margin:'0',fontFamily:'sans-serif'}}>{cvData.prenom} {cvData.nom}</h1></div>
        </div>
        <div style={{marginBottom:'14px'}}><div style={{fontSize:'7px',color:'#475569',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'8px',fontFamily:'monospace'}}>{'//'} contact</div><div style={{fontSize:f.xsmall,marginBottom:'3px'}}>📧 {cvData.email}</div><div style={{fontSize:f.xsmall,marginBottom:'3px'}}>📱 {cvData.telephone}</div><div style={{fontSize:f.xsmall,marginBottom:'3px'}}>📍 {cvData.ville}</div></div>
        <div style={{marginBottom:'14px'}}><div style={{fontSize:'7px',color:'#475569',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'8px',fontFamily:'monospace'}}>{'//'} skills</div>{cvData.competences?.map((c,i)=><div key={i} style={{marginBottom:'5px'}}><div style={{fontSize:f.xsmall,color:'#94a3b8',marginBottom:'2px'}}>{c}</div><div style={{height:'2px',background:'#1e293b',borderRadius:'1px'}}><div style={{height:'100%',width:`${85-i*5}%`,background:'linear-gradient(90deg,#22d3ee,#818cf8)',borderRadius:'1px'}}></div></div></div>)}</div>
        <div style={{marginBottom:'12px'}}><div style={{fontSize:'7px',color:'#475569',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'8px',fontFamily:'monospace'}}>{'//'} languages</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.xsmall,color:'#94a3b8',marginBottom:'3px'}}><span style={{color:'#22d3ee'}}>{l.langue}</span> · {l.niveau}</div>)}</div>
        {cvData.certifications?.length > 0 && <div style={{marginBottom:'12px'}}><div style={{fontSize:'7px',color:'#475569',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'8px',fontFamily:'monospace'}}>{'//'} certif.</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xsmall,color:'#94a3b8',marginBottom:'2px'}}>✦ {c.titre}</div>)}</div>}
        {cvData.centres_interet?.length > 0 && <div><div style={{fontSize:'7px',color:'#475569',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'8px',fontFamily:'monospace'}}>{'//'} interests</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xsmall,color:'#94a3b8',marginBottom:'2px'}}>• {ci}</div>)}</div>}
      </div>
      <div style={{padding:'24px 20px',background:'#fff'}}>
        {cvData.accroche && <div style={{marginBottom:'14px',padding:'10px 12px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'5px',fontFamily:'sans-serif'}}><p style={{fontSize:f.small,color:'#166534',margin:0}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'14px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#0f172a',marginBottom:'10px',display:'flex',alignItems:'center',gap:'7px',fontFamily:'monospace'}}><span style={{color:'#22d3ee'}}>&gt;</span> expériences</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'11px',paddingLeft:'12px',borderLeft:'2px solid #22d3ee'}}><div style={{display:'flex',justifyContent:'space-between',fontFamily:'sans-serif'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#0f172a'}}>{exp.poste}</div><div style={{fontSize:f.xsmall,color:'#64748b',background:'#f1f5f9',padding:'1px 7px',borderRadius:'4px'}}>{exp.periode}</div></div><div style={{fontSize:f.small,color:'#22d3ee',marginBottom:'4px',fontFamily:'monospace'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0,fontFamily:'sans-serif'}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#475569',marginBottom:'1px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#0f172a',marginBottom:'10px',display:'flex',alignItems:'center',gap:'7px',fontFamily:'monospace'}}><span style={{color:'#22d3ee'}}>&gt;</span> formation</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:'8px',paddingLeft:'12px',borderLeft:'2px solid #818cf8',fontFamily:'sans-serif'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#0f172a'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#64748b'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 11. ELEGANT ─────────────────────────────────────────────
export function TemplateElegant({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Georgia,serif',fontSize:f.base,lineHeight:f.lineH,background:'#faf7f2',color:'#2c2416',width:'794px',height:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'220px 1fr'}}>
      <div style={{background:'#2c2416',padding:'32px 18px',color:'#e8d9b8'}}>
        <div style={{marginBottom:'20px',paddingBottom:'18px',borderBottom:'1px solid rgba(232,217,184,0.2)',display:'flex',flexDirection:'column',alignItems:'center',gap:'10px'}}>
          <Avatar cvData={cvData} size={68} shape="circle" />
          <div style={{textAlign:'center'}}><div style={{fontSize:'7px',color:'#c9a87a',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div><h1 style={{fontSize:'17px',fontWeight:'400',color:'#e8d9b8',margin:'0',letterSpacing:'1px',lineHeight:'1.2',fontFamily:'Georgia,serif'}}>{cvData.prenom}<br/><strong>{cvData.nom}</strong></h1></div>
        </div>
        <div style={{marginBottom:'18px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'8px'}}>Coordonnées</div><div style={{fontSize:f.xsmall,color:'#bbb',marginBottom:'4px'}}>{cvData.email}</div><div style={{fontSize:f.xsmall,color:'#bbb',marginBottom:'4px'}}>{cvData.telephone}</div><div style={{fontSize:f.xsmall,color:'#bbb',marginBottom:'4px'}}>{cvData.ville}</div></div>
        <div style={{marginBottom:'18px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'10px'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{fontSize:f.xsmall,color:'#ccc',marginBottom:'5px',paddingBottom:'5px',borderBottom:'1px solid #3d3020',display:'flex',alignItems:'center',gap:'5px'}}><span style={{color:'#c9a87a',fontSize:'6px'}}>◆</span>{c}</div>)}</div>
        <div style={{marginBottom:'14px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'8px'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.xsmall,color:'#bbb',marginBottom:'4px'}}>{l.langue} <span style={{color:'#c9a87a'}}>·</span> {l.niveau}</div>)}</div>
        {cvData.certifications?.length > 0 && <div style={{marginBottom:'14px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'8px'}}>Certifications</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xsmall,color:'#ccc',marginBottom:'3px'}}>✦ {c.titre}</div>)}</div>}
        {cvData.centres_interet?.length > 0 && <div><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'8px'}}>Centres d'intérêt</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xsmall,color:'#bbb',marginBottom:'3px'}}>• {ci}</div>)}</div>}
      </div>
      <div style={{padding:'32px 24px'}}>
        {cvData.accroche && <div style={{marginBottom:'18px',padding:'14px',background:'#f0e8d8',borderRadius:'4px'}}><p style={{fontSize:f.small,color:'#5c4a2e',fontStyle:'italic',margin:0,lineHeight:'1.7'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'18px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'12px',paddingBottom:'5px',borderBottom:'1px solid #e0d5c0'}}>Expériences Professionnelles</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.xsmall,color:'#c9a87a',fontStyle:'italic'}}>{exp.periode}</div></div><div style={{fontSize:f.small,color:'#7a6248',marginBottom:'5px',fontStyle:'italic'}}>{exp.entreprise} — {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#444',marginBottom:'2px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#c9a87a',marginBottom:'12px',paddingBottom:'5px',borderBottom:'1px solid #e0d5c0'}}>Formation</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:'8px'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.xsmall,color:'#c9a87a',fontStyle:'italic'}}>{f2.periode}</div></div><div style={{fontSize:f.small,color:'#7a6248',fontStyle:'italic'}}>{f2.etablissement}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 12. BOLD ────────────────────────────────────────────────
export function TemplateBold({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Arial,sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#fff',width:'794px',height:'1123px',overflow:'hidden'}}>
      <div style={{background:'#c0392b',padding:'24px 36px'}}>
        <div style={{display:'flex',alignItems:'center',gap:'18px'}}>
          <Avatar cvData={cvData} size={68} shape="circle" />
          <div><div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.7)',fontWeight:'300',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div><h1 style={{fontSize:'26px',fontWeight:'900',color:'#fff',margin:'0 0 8px',letterSpacing:'-0.5px',textTransform:'uppercase'}}>{cvData.prenom} {cvData.nom}</h1><div style={{display:'flex',gap:'18px',flexWrap:'wrap',fontSize:f.xsmall,color:'rgba(255,255,255,0.75)'}}><span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span></div></div>
        </div>
      </div>
      {cvData.accroche && <div style={{background:'#f9f9f9',padding:'12px 36px',borderBottom:'3px solid #c0392b'}}><p style={{fontSize:f.small,color:'#555',margin:0,fontStyle:'italic'}}>{cvData.accroche}</p></div>}
      <div style={{padding:'20px 36px',display:'grid',gridTemplateColumns:'1fr 260px',gap:'28px'}}>
        <div>
          <div style={{marginBottom:'16px'}}><div style={{fontSize:f.small,fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'10px',paddingBottom:'3px',borderBottom:'3px solid #c0392b'}}>Expériences</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:'11px'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.xsmall,color:'#888',background:'#f5f5f5',padding:'1px 7px',borderRadius:'3px'}}>{exp.periode}</div></div><div style={{fontSize:f.small,color:'#c0392b',fontWeight:'600',marginBottom:'4px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#444',marginBottom:'1px'}}>{m}</li>)}</ul></div>)}</div>
          <div><div style={{fontSize:f.small,fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'10px',paddingBottom:'3px',borderBottom:'3px solid #c0392b'}}>Formation</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:'8px'}}><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#666'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
        </div>
        <div>
          <div style={{marginBottom:'16px'}}><div style={{fontSize:f.small,fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'10px',paddingBottom:'3px',borderBottom:'3px solid #c0392b'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{fontSize:f.small,color:'#333',padding:'4px 0',borderBottom:'1px solid #f0f0f0'}}>{c}</div>)}</div>
          <div style={{marginBottom:'14px'}}><div style={{fontSize:f.small,fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'10px',paddingBottom:'3px',borderBottom:'3px solid #c0392b'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:f.small,padding:'4px 0',borderBottom:'1px solid #f0f0f0'}}><span>{l.langue}</span><span style={{color:'#888'}}>{l.niveau}</span></div>)}</div>
          {cvData.certifications?.length > 0 && <div style={{marginBottom:'12px'}}><div style={{fontSize:f.small,fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'8px',paddingBottom:'3px',borderBottom:'3px solid #c0392b'}}>Certifications</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.small,color:'#333',padding:'3px 0',borderBottom:'1px solid #f0f0f0'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length > 0 && <div><div style={{fontSize:f.small,fontWeight:'900',textTransform:'uppercase',color:'#c0392b',marginBottom:'8px',paddingBottom:'3px',borderBottom:'3px solid #c0392b'}}>Centres d'intérêt</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.small,color:'#555',padding:'3px 0'}}>• {ci}</div>)}</div>}
        </div>
      </div>
    </div>
  )
}

// ─── 13. PASTEL ──────────────────────────────────────────────
export function TemplatePastel({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#fef9ff',width:'794px',height:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'230px 1fr'}}>
      <div style={{background:'#e8d5f5',padding:'28px 18px'}}>
        <div style={{textAlign:'center',marginBottom:'20px',paddingBottom:'16px',borderBottom:'1px solid #d4b8ec',display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>
          <Avatar cvData={cvData} size={68} shape="circle" />
          <div><div style={{fontSize:'7px',color:'#7c3aed',letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div><h1 style={{fontSize:'17px',fontWeight:'700',color:'#5b21b6',margin:'0'}}>{cvData.prenom} {cvData.nom}</h1></div>
        </div>
        <div style={{marginBottom:'16px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'8px'}}>Contact</div><div style={{fontSize:f.xsmall,color:'#5b21b6',marginBottom:'4px'}}>✉ {cvData.email}</div><div style={{fontSize:f.xsmall,color:'#5b21b6',marginBottom:'4px'}}>☎ {cvData.telephone}</div><div style={{fontSize:f.xsmall,color:'#5b21b6',marginBottom:'4px'}}>📍 {cvData.ville}</div></div>
        <div style={{marginBottom:'16px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'8px'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{background:'rgba(124,58,237,0.1)',border:'1px solid #ddd6fe',color:'#5b21b6',padding:'3px 7px',borderRadius:'16px',fontSize:f.xsmall,marginBottom:'4px',textAlign:'center'}}>{c}</div>)}</div>
        <div style={{marginBottom:'14px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'8px'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{fontSize:f.xsmall,color:'#5b21b6',marginBottom:'3px'}}>{l.langue} · <span style={{color:'#7c3aed'}}>{l.niveau}</span></div>)}</div>
        {cvData.certifications?.length > 0 && <div style={{marginBottom:'12px'}}><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'8px'}}>Certifications</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.xsmall,color:'#5b21b6',marginBottom:'3px'}}>✦ {c.titre}</div>)}</div>}
        {cvData.centres_interet?.length > 0 && <div><div style={{fontSize:'7px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#7c3aed',marginBottom:'8px'}}>Centres d'intérêt</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.xsmall,color:'#5b21b6',marginBottom:'3px'}}>• {ci}</div>)}</div>}
      </div>
      <div style={{padding:'24px 20px'}}>
        {cvData.accroche && <div style={{marginBottom:'14px',padding:'12px',background:'#fdf4ff',borderRadius:'10px',border:'1px solid #e9d5ff'}}><p style={{fontSize:f.small,color:'#6d28d9',fontStyle:'italic',margin:0,lineHeight:'1.7'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'14px'}}><div style={{fontSize:f.small,fontWeight:'700',color:'#7c3aed',marginBottom:'10px',display:'flex',alignItems:'center',gap:'7px'}}><div style={{width:'18px',height:'3px',background:'linear-gradient(90deg,#c084fc,#e879f9)',borderRadius:'2px'}}></div>EXPÉRIENCES</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb,padding:'10px',background:'#fff',borderRadius:'8px',border:'1px solid #f3e8ff'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#1f2937'}}>{exp.poste}</div><div style={{fontSize:f.xsmall,color:'#7c3aed',background:'#fdf4ff',padding:'1px 7px',borderRadius:'10px'}}>{exp.periode}</div></div><div style={{fontSize:f.small,color:'#a855f7',marginBottom:'5px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#4b5563',marginBottom:'1px'}}>{m}</li>)}</ul></div>)}</div>
        <div><div style={{fontSize:f.small,fontWeight:'700',color:'#7c3aed',marginBottom:'10px',display:'flex',alignItems:'center',gap:'7px'}}><div style={{width:'18px',height:'3px',background:'linear-gradient(90deg,#c084fc,#e879f9)',borderRadius:'2px'}}></div>FORMATION</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:'8px',padding:'8px 10px',background:'#fff',borderRadius:'8px',border:'1px solid #f3e8ff'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#1f2937'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#a855f7'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
      </div>
    </div>
  )
}

// ─── 14. CORPORATE ───────────────────────────────────────────
export function TemplateCorporate({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'Arial,Helvetica,sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#fff',width:'794px',height:'1123px',overflow:'hidden'}}>
      <div style={{background:'#1e3a5f',borderBottom:'4px solid #f59e0b',padding:'20px 32px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'18px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
            <Avatar cvData={cvData} size={62} shape="circle" />
            <div><div style={{fontSize:f.xsmall,color:'#f59e0b',letterSpacing:'1px',textTransform:'uppercase',fontWeight:'300',marginBottom:'3px'}}>{cvData.titre}</div><h1 style={{fontSize:'22px',fontWeight:'700',color:'#fff',margin:'0'}}>{cvData.prenom} {cvData.nom}</h1></div>
          </div>
          <div style={{textAlign:'right',fontSize:f.xsmall,color:'rgba(255,255,255,0.7)'}}><div style={{marginBottom:'2px'}}>{cvData.email}</div><div style={{marginBottom:'2px'}}>{cvData.telephone}</div><div>{cvData.ville}</div></div>
        </div>
      </div>
      <div style={{padding:'20px 32px'}}>
        {cvData.accroche && <div style={{marginBottom:'16px',padding:'12px 16px',background:'#f0f4f8',borderLeft:'4px solid #1e3a5f'}}><p style={{fontSize:f.small,color:'#334155',margin:0,lineHeight:'1.6'}}>{cvData.accroche}</p></div>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 240px',gap:'24px'}}>
          <div>
            <div style={{marginBottom:'16px'}}><div style={{background:'#1e3a5f',color:'#fff',padding:'5px 12px',fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'10px',display:'inline-block'}}>Expériences</div>{cvData.experiences?.map((exp,i)=><div key={i} style={{marginBottom:f.mb,paddingBottom:f.mb,borderBottom:'1px solid #e2e8f0'}}><div style={{display:'flex',justifyContent:'space-between'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#1e3a5f'}}>{exp.poste}</div><div style={{fontSize:f.xsmall,color:'#64748b'}}>{exp.periode}</div></div><div style={{fontSize:f.small,color:'#f59e0b',fontWeight:'600',marginBottom:'5px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'12px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#475569',marginBottom:'1px'}}>{m}</li>)}</ul></div>)}</div>
            <div><div style={{background:'#1e3a5f',color:'#fff',padding:'5px 12px',fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'10px',display:'inline-block'}}>Formation</div>{cvData.formations?.map((f2,i)=><div key={i} style={{marginBottom:'8px',paddingBottom:'8px',borderBottom:'1px solid #e2e8f0'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#1e3a5f'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#64748b'}}>{f2.etablissement} · {f2.periode}</div></div>)}</div>
          </div>
          <div>
            <div style={{marginBottom:'16px'}}><div style={{background:'#1e3a5f',color:'#fff',padding:'5px 12px',fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'10px',display:'inline-block'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'5px'}}><div style={{width:'5px',height:'5px',background:'#f59e0b',borderRadius:'50%',flexShrink:0}}></div><div style={{fontSize:f.small,color:'#334155'}}>{c}</div></div>)}</div>
            <div style={{marginBottom:'14px'}}><div style={{background:'#1e3a5f',color:'#fff',padding:'5px 12px',fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'10px',display:'inline-block'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{marginBottom:'7px'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:f.small,marginBottom:'2px'}}><span style={{fontWeight:'600',color:'#1e3a5f'}}>{l.langue}</span><span style={{color:'#64748b'}}>{l.niveau}</span></div><div style={{height:'3px',background:'#e2e8f0',borderRadius:'2px'}}><div style={{height:'100%',width:l.niveau?.includes('Natif')||l.niveau?.includes('C')?'100%':l.niveau?.includes('B')?'70%':'45%',background:'#1e3a5f',borderRadius:'2px'}}></div></div></div>)}</div>
            {cvData.certifications?.length > 0 && <div style={{marginBottom:'12px'}}><div style={{background:'#1e3a5f',color:'#fff',padding:'5px 12px',fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px',display:'inline-block'}}>Certifications</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.small,color:'#334155',marginBottom:'4px'}}>✦ {c.titre}</div>)}</div>}
            {cvData.centres_interet?.length > 0 && <div><div style={{background:'#1e3a5f',color:'#fff',padding:'5px 12px',fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',marginBottom:'8px',display:'inline-block'}}>Centres d'intérêt</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.small,color:'#475569',marginBottom:'3px'}}>• {ci}</div>)}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── 15. SWISS ───────────────────────────────────────────────
export function TemplateSwiss({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Helvetica,Arial,sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#fff',color:'#000',width:'794px',height:'1123px',overflow:'hidden',padding:'44px 48px'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr auto',alignItems:'end',marginBottom:'28px',paddingBottom:'7px',borderBottom:'3px solid #000'}}>
        <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
          <Avatar cvData={cvData} size={56} shape="square" />
          <h1 style={{fontSize:'28px',fontWeight:'900',color:'#000',margin:0,letterSpacing:'-1px',lineHeight:'1'}}>{cvData.prenom?.toUpperCase()} {cvData.nom?.toUpperCase()}</h1>
        </div>
        <div style={{textAlign:'right',fontSize:f.xsmall,color:'#555'}}><div>{cvData.email}</div><div>{cvData.telephone}</div><div>{cvData.ville}</div></div>
      </div>
      <div style={{marginBottom:'4px',paddingBottom:'7px',borderBottom:'1px solid #000'}}><div style={{fontSize:f.small,fontWeight:'700',textTransform:'uppercase',letterSpacing:'3px',color:'#555'}}>{cvData.titre}</div></div>
      {cvData.accroche && <div style={{marginBottom:'20px',paddingTop:'10px'}}><p style={{fontSize:f.small,color:'#333',margin:0,lineHeight:'1.6',maxWidth:'480px'}}>{cvData.accroche}</p></div>}
      <div style={{display:'grid',gridTemplateColumns:'110px 1fr',gap:'0',marginBottom:'20px'}}><div style={{paddingTop:'3px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999'}}>EXPÉRIENCES</div></div><div>{cvData.experiences?.map((exp,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'90px 1fr',gap:'14px',marginBottom:'13px',paddingBottom:'13px',borderBottom:'1px solid #eee'}}><div style={{fontSize:f.xsmall,color:'#999',paddingTop:'2px'}}>{exp.periode}</div><div><div style={{fontWeight:'700',fontSize:f.base}}>{exp.poste}</div><div style={{fontSize:f.small,color:'#555',marginBottom:'5px'}}>{exp.entreprise}, {exp.lieu}</div><ul style={{paddingLeft:'10px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#333',marginBottom:'1px'}}>{m}</li>)}</ul></div></div>)}</div></div>
      <div style={{display:'grid',gridTemplateColumns:'110px 1fr',gap:'0',marginBottom:'20px'}}><div style={{paddingTop:'3px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999'}}>FORMATION</div></div><div>{cvData.formations?.map((f2,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'90px 1fr',gap:'14px',marginBottom:'8px'}}><div style={{fontSize:f.xsmall,color:'#999'}}>{f2.periode}</div><div><div style={{fontWeight:'700',fontSize:f.base}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#555'}}>{f2.etablissement}</div></div></div>)}</div></div>
      <div style={{borderTop:'1px solid #000',paddingTop:'14px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'20px',marginBottom:'10px'}}><div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'8px'}}>COMPÉTENCES</div><div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>{cvData.competences?.map((c,i)=><span key={i} style={{border:'1px solid #000',padding:'1px 7px',fontSize:f.xsmall,color:'#000'}}>{c}</span>)}</div></div><div><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'8px'}}>LANGUES</div>{cvData.langues?.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:f.small,borderBottom:'1px solid #eee',padding:'2px 0'}}><span style={{fontWeight:'700'}}>{l.langue}</span><span style={{color:'#555'}}>{l.niveau}</span></div>)}</div></div>
      {cvData.certifications?.length > 0 && <div style={{borderTop:'1px solid #eee',paddingTop:'10px',marginBottom:'8px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'6px'}}>CERTIFICATIONS</div><div style={{display:'flex',flexWrap:'wrap',gap:'3px'}}>{cvData.certifications.map((c,i)=><span key={i} style={{border:'1px solid #000',padding:'1px 7px',fontSize:f.xsmall,color:'#000'}}>✦ {c.titre}</span>)}</div></div>}
      {cvData.centres_interet?.length > 0 && <div style={{borderTop:'1px solid #eee',paddingTop:'10px'}}><div style={{fontSize:f.xsmall,fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',color:'#999',marginBottom:'6px'}}>CENTRES D'INTÉRÊT</div><div style={{fontSize:f.small,color:'#333'}}>{cvData.centres_interet.join(' · ')}</div></div>}
    </div>
  )
}

// ─── 16. TIMELINE ────────────────────────────────────────────
export function TemplateTimeline({ cvData }) {
  const f = getFontConfig(cvData)
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Arial,sans-serif',fontSize:f.base,lineHeight:f.lineH,background:'#f8faff',width:'794px',height:'1123px',overflow:'hidden'}}>
      <div style={{background:'linear-gradient(135deg,#1e40af,#3b82f6)',padding:'20px 32px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:'14px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'14px'}}>
            <Avatar cvData={cvData} size={60} shape="circle" />
            <div><div style={{fontSize:f.xsmall,color:'rgba(255,255,255,0.75)',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'3px'}}>{cvData.titre}</div><h1 style={{fontSize:'22px',fontWeight:'700',color:'#fff',margin:'0'}}>{cvData.prenom} {cvData.nom}</h1></div>
          </div>
          <div style={{textAlign:'right',fontSize:f.xsmall,color:'rgba(255,255,255,0.8)'}}><div style={{marginBottom:'2px'}}>✉ {cvData.email}</div><div style={{marginBottom:'2px'}}>☎ {cvData.telephone}</div><div>📍 {cvData.ville}</div></div>
        </div>
      </div>
      {cvData.accroche && <div style={{background:'#fff',padding:'12px 32px',borderBottom:'2px solid #e2e8f0'}}><p style={{fontSize:f.small,color:'#475569',margin:0,fontStyle:'italic',lineHeight:'1.6'}}>{cvData.accroche}</p></div>}
      <div style={{padding:'20px 32px',display:'grid',gridTemplateColumns:'1fr 240px',gap:'24px'}}>
        <div>
          <div style={{fontSize:f.xsmall,fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'14px'}}>Parcours professionnel</div>
          {cvData.experiences?.map((exp,i)=>(
            <div key={i} style={{display:'grid',gridTemplateColumns:'14px 1fr',gap:'10px',marginBottom:f.mb}}>
              <div style={{display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{width:'12px',height:'12px',borderRadius:'50%',background:'#1e40af',border:'3px solid #bfdbfe',flexShrink:0}}></div>{i<(cvData.experiences?.length||0)-1&&<div style={{width:'2px',flex:1,background:'#bfdbfe',marginTop:'3px'}}></div>}</div>
              <div style={{paddingBottom:'6px'}}><div style={{display:'flex',justifyContent:'space-between',marginBottom:'2px'}}><div style={{fontWeight:'700',fontSize:f.base,color:'#1e293b'}}>{exp.poste}</div><div style={{fontSize:f.xsmall,color:'#3b82f6',background:'#eff6ff',padding:'1px 7px',borderRadius:'10px'}}>{exp.periode}</div></div><div style={{fontSize:f.small,color:'#3b82f6',marginBottom:'4px'}}>{exp.entreprise} · {exp.lieu}</div><ul style={{paddingLeft:'10px',margin:0}}>{exp.missions?.map((m,j)=><li key={j} style={{fontSize:f.small,color:'#475569',marginBottom:'1px'}}>{m}</li>)}</ul></div>
            </div>
          ))}
          <div style={{fontSize:f.xsmall,fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'2px',marginBottom:'12px',marginTop:'6px'}}>Formation</div>
          {cvData.formations?.map((f2,i)=><div key={i} style={{display:'grid',gridTemplateColumns:'14px 1fr',gap:'10px',marginBottom:'8px'}}><div style={{display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{width:'10px',height:'10px',borderRadius:'50%',background:'#93c5fd',flexShrink:0}}></div></div><div><div style={{fontWeight:'700',fontSize:f.base,color:'#1e293b'}}>{f2.diplome}</div><div style={{fontSize:f.small,color:'#64748b'}}>{f2.etablissement} · {f2.periode}</div></div></div>)}
        </div>
        <div>
          <div style={{background:'#fff',borderRadius:'10px',padding:'14px',marginBottom:'14px',border:'1px solid #e2e8f0'}}><div style={{fontSize:f.xsmall,fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px'}}>Compétences</div>{cvData.competences?.map((c,i)=><div key={i} style={{marginBottom:'6px'}}><div style={{fontSize:f.xsmall,marginBottom:'2px',color:'#334155'}}>{c}</div><div style={{height:'4px',background:'#e2e8f0',borderRadius:'3px'}}><div style={{height:'100%',width:`${88-i*6}%`,background:'linear-gradient(90deg,#1e40af,#3b82f6)',borderRadius:'3px'}}></div></div></div>)}</div>
          <div style={{background:'#fff',borderRadius:'10px',padding:'14px',marginBottom:'14px',border:'1px solid #e2e8f0'}}><div style={{fontSize:f.xsmall,fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'10px'}}>Langues</div>{cvData.langues?.map((l,i)=><div key={i} style={{marginBottom:'7px'}}><div style={{display:'flex',justifyContent:'space-between',fontSize:f.small,marginBottom:'2px'}}><span style={{fontWeight:'600',color:'#1e293b'}}>{l.langue}</span><span style={{color:'#64748b',fontSize:f.xsmall}}>{l.niveau}</span></div><div style={{height:'4px',background:'#e2e8f0',borderRadius:'3px'}}><div style={{height:'100%',width:l.niveau?.includes('Natif')||l.niveau?.includes('C')?'100%':l.niveau?.includes('B')?'70%':'45%',background:'#3b82f6',borderRadius:'3px'}}></div></div></div>)}</div>
          {cvData.certifications?.length > 0 && <div style={{background:'#fff',borderRadius:'10px',padding:'14px',marginBottom:'14px',border:'1px solid #e2e8f0'}}><div style={{fontSize:f.xsmall,fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Certifications</div>{cvData.certifications.map((c,i)=><div key={i} style={{fontSize:f.small,color:'#334155',marginBottom:'4px'}}>✦ {c.titre}</div>)}</div>}
          {cvData.centres_interet?.length > 0 && <div style={{background:'#fff',borderRadius:'10px',padding:'14px',border:'1px solid #e2e8f0'}}><div style={{fontSize:f.xsmall,fontWeight:'700',color:'#1e40af',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'8px'}}>Centres d'intérêt</div>{cvData.centres_interet.map((ci,i)=><div key={i} style={{fontSize:f.small,color:'#475569',marginBottom:'3px'}}>• {ci}</div>)}</div>}
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