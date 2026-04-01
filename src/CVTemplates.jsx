export function TemplateFinance({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'Georgia,serif',color:'#1a1a1a',fontSize:'11px',lineHeight:'1.6',padding:'40px',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{borderBottom:'3px solid #1a1a1a',paddingBottom:'14px',marginBottom:'20px',textAlign:'center'}}>
        <h1 style={{fontSize:'22px',fontWeight:'700',letterSpacing:'3px',textTransform:'uppercase',marginBottom:'4px',fontFamily:'Georgia,serif'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{fontSize:'12px',color:'#555',letterSpacing:'1px',marginBottom:'8px'}}>{cvData.titre}</div>
        <div style={{display:'flex',justifyContent:'center',gap:'20px',flexWrap:'wrap',fontSize:'10px',color:'#666'}}>
          <span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span>
          {cvData.linkedin && <span>🔗 {cvData.linkedin}</span>}
        </div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'16px'}}><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'8px'}}>PROFIL</div><p style={{fontSize:'10px',color:'#333',fontStyle:'italic'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'16px'}}>
        <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'10px'}}>EXPÉRIENCES PROFESSIONNELLES</div>
        {cvData.experiences.map((exp,i)=>(
          <div key={i} style={{marginBottom:'12px'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}>
              <div><div style={{fontWeight:'700',fontSize:'11px'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#555',fontStyle:'italic'}}>{exp.entreprise} — {exp.lieu}</div></div>
              <div style={{fontSize:'10px',color:'#777',whiteSpace:'nowrap'}}>{exp.periode}</div>
            </div>
            <ul style={{paddingLeft:'14px',marginTop:'4px'}}>{exp.missions.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#333',marginBottom:'2px'}}>{m}</li>)}</ul>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'16px'}}>
        <div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'10px'}}>FORMATION</div>
        {cvData.formations.map((f,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
            <div><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#555'}}>{f.etablissement}</div></div>
            <div style={{fontSize:'10px',color:'#777'}}>{f.periode}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'8px'}}>COMPÉTENCES</div><div style={{display:'flex',flexWrap:'wrap',gap:'4px'}}>{cvData.competences.map((c,i)=><span key={i} style={{background:'#f0f0f0',border:'1px solid #ddd',padding:'2px 8px',borderRadius:'2px',fontSize:'9px',color:'#333'}}>{c}</span>)}</div></div>
        <div><div style={{fontSize:'9px',fontWeight:'700',letterSpacing:'2px',textTransform:'uppercase',borderBottom:'1px solid #1a1a1a',paddingBottom:'3px',marginBottom:'8px'}}>LANGUES</div>{cvData.langues.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'10px',borderBottom:'1px solid #eee',padding:'2px 0'}}><span>{l.langue}</span><span style={{color:'#777',fontStyle:'italic'}}>{l.niveau}</span></div>)}</div>
      </div>
    </div>
  )
}

export function TemplateLinkedIn({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Segoe UI",Arial,sans-serif',color:'#191919',fontSize:'11px',lineHeight:'1.6',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{background:'#0a66c2',padding:'28px 32px',marginBottom:'0'}}>
        <div style={{display:'flex',alignItems:'flex-start',gap:'20px'}}>
          <div style={{width:'64px',height:'64px',borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'22px',fontWeight:'700',color:'#fff',flexShrink:'0'}}>{cvData.prenom[0]}{cvData.nom[0]}</div>
          <div style={{flex:1}}>
            <h1 style={{fontSize:'22px',fontWeight:'700',color:'#fff',margin:'0 0 4px'}}>{cvData.prenom} {cvData.nom}</h1>
            <div style={{fontSize:'13px',color:'rgba(255,255,255,0.85)',marginBottom:'8px'}}>{cvData.titre}</div>
            <div style={{display:'flex',gap:'16px',flexWrap:'wrap',fontSize:'10px',color:'rgba(255,255,255,0.75)'}}>
              <span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span>
              {cvData.linkedin && <span>🔗 {cvData.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>
      <div style={{padding:'20px 32px'}}>
        {cvData.accroche && <div style={{marginBottom:'16px',padding:'12px 16px',background:'#f3f6f9',borderRadius:'8px',borderLeft:'4px solid #0a66c2'}}><p style={{fontSize:'10px',color:'#444',margin:0,lineHeight:'1.7'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}><div style={{width:'4px',height:'18px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:'12px',fontWeight:'700',color:'#191919',letterSpacing:'0.5px'}}>EXPÉRIENCES</div></div>
          {cvData.experiences.map((exp,i)=>(
            <div key={i} style={{marginBottom:'12px',paddingLeft:'12px',borderLeft:'2px solid #e0e0e0'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div><div style={{fontWeight:'700',fontSize:'11px',color:'#191919'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#0a66c2',fontWeight:'500'}}>{exp.entreprise} · {exp.lieu}</div></div>
                <div style={{fontSize:'10px',color:'#666',whiteSpace:'nowrap',background:'#f3f6f9',padding:'2px 8px',borderRadius:'10px'}}>{exp.periode}</div>
              </div>
              <ul style={{paddingLeft:'14px',marginTop:'6px'}}>{exp.missions.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#444',marginBottom:'2px'}}>{m}</li>)}</ul>
            </div>
          ))}
        </div>
        <div style={{marginBottom:'16px'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}><div style={{width:'4px',height:'18px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:'12px',fontWeight:'700',color:'#191919',letterSpacing:'0.5px'}}>FORMATION</div></div>
          {cvData.formations.map((f,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'8px',paddingLeft:'12px',borderLeft:'2px solid #e0e0e0'}}>
              <div><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#0a66c2'}}>{f.etablissement}</div></div>
              <div style={{fontSize:'10px',color:'#666'}}>{f.periode}</div>
            </div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}><div style={{width:'4px',height:'18px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:'12px',fontWeight:'700',color:'#191919'}}>COMPÉTENCES</div></div>
            <div style={{display:'flex',flexWrap:'wrap',gap:'5px'}}>{cvData.competences.map((c,i)=><span key={i} style={{background:'#e8f3ff',color:'#0a66c2',padding:'3px 10px',borderRadius:'12px',fontSize:'9px',fontWeight:'500',border:'1px solid #b3d4f5'}}>{c}</span>)}</div>
          </div>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}><div style={{width:'4px',height:'18px',background:'#0a66c2',borderRadius:'2px'}}></div><div style={{fontSize:'12px',fontWeight:'700',color:'#191919'}}>LANGUES</div></div>
            {cvData.langues.map((l,i)=><div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:'10px',padding:'3px 0',borderBottom:'1px solid #f0f0f0'}}><span style={{fontWeight:'500'}}>{l.langue}</span><span style={{color:'#666'}}>{l.niveau}</span></div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TemplateCanva({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Helvetica,sans-serif',fontSize:'11px',lineHeight:'1.6',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',display:'grid',gridTemplateColumns:'260px 1fr'}}>
      <div style={{background:'#2d2d2d',color:'#fff',padding:'32px 22px'}}>
        <div style={{textAlign:'center',marginBottom:'24px',paddingBottom:'20px',borderBottom:'1px solid rgba(255,255,255,0.15)'}}>
          <div style={{width:'70px',height:'70px',borderRadius:'50%',background:'linear-gradient(135deg,#f093fb,#f5576c)',margin:'0 auto 12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'24px',fontWeight:'700',color:'#fff'}}>{cvData.prenom[0]}{cvData.nom[0]}</div>
          <h1 style={{fontSize:'16px',fontWeight:'700',color:'#fff',margin:'0 0 4px',lineHeight:'1.2'}}>{cvData.prenom}<br/>{cvData.nom}</h1>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.7)',lineHeight:'1.4'}}>{cvData.titre}</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'10px'}}>CONTACT</div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.85)',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'#f093fb'}}>✉</span>{cvData.email}</div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.85)',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'#f093fb'}}>☎</span>{cvData.telephone}</div>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.85)',marginBottom:'6px',display:'flex',alignItems:'center',gap:'6px'}}><span style={{color:'#f093fb'}}>📍</span>{cvData.ville}</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'10px'}}>COMPÉTENCES</div>
          {cvData.competences.map((c,i)=>(
            <div key={i} style={{marginBottom:'6px'}}>
              <div style={{fontSize:'9px',color:'rgba(255,255,255,0.85)',marginBottom:'3px'}}>{c}</div>
              <div style={{height:'3px',background:'rgba(255,255,255,0.15)',borderRadius:'2px',overflow:'hidden'}}><div style={{height:'100%',width:`${75+i*3}%`,background:'linear-gradient(90deg,#f093fb,#f5576c)',borderRadius:'2px'}}></div></div>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'2px',color:'#f093fb',textTransform:'uppercase',marginBottom:'10px'}}>LANGUES</div>
          {cvData.langues.map((l,i)=><div key={i} style={{fontSize:'10px',color:'rgba(255,255,255,0.85)',marginBottom:'4px'}}><strong>{l.langue}</strong> — {l.niveau}</div>)}
        </div>
      </div>
      <div style={{padding:'28px 24px',background:'#fff'}}>
        {cvData.accroche && <div style={{marginBottom:'18px',padding:'12px 16px',background:'#fff5fb',borderRadius:'8px',borderLeft:'4px solid #f093fb'}}><p style={{fontSize:'10px',color:'#444',margin:0,lineHeight:'1.7',fontStyle:'italic'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'18px'}}>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#2d2d2d',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'12px',paddingBottom:'4px',borderBottom:'2px solid #f093fb'}}>EXPÉRIENCES</div>
          {cvData.experiences.map((exp,i)=>(
            <div key={i} style={{marginBottom:'13px',position:'relative',paddingLeft:'12px'}}>
              <div style={{position:'absolute',left:0,top:'4px',width:'4px',height:'4px',borderRadius:'50%',background:'#f093fb'}}></div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div><div style={{fontWeight:'700',fontSize:'11px',color:'#2d2d2d'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#f5576c',fontWeight:'500'}}>{exp.entreprise} · {exp.lieu}</div></div>
                <div style={{fontSize:'9px',color:'#999',whiteSpace:'nowrap',marginLeft:'8px'}}>{exp.periode}</div>
              </div>
              <ul style={{paddingLeft:'12px',marginTop:'4px'}}>{exp.missions.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#555',marginBottom:'2px'}}>{m}</li>)}</ul>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:'11px',fontWeight:'700',color:'#2d2d2d',letterSpacing:'1px',textTransform:'uppercase',marginBottom:'12px',paddingBottom:'4px',borderBottom:'2px solid #f093fb'}}>FORMATION</div>
          {cvData.formations.map((f,i)=>(
            <div key={i} style={{marginBottom:'10px',paddingLeft:'12px',position:'relative'}}>
              <div style={{position:'absolute',left:0,top:'4px',width:'4px',height:'4px',borderRadius:'50%',background:'#f093fb'}}></div>
              <div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div>
              <div style={{fontSize:'10px',color:'#888'}}>{f.etablissement} · {f.periode}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TemplateHarvard({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Times New Roman",Times,serif',color:'#111',fontSize:'11px',lineHeight:'1.6',padding:'40px 48px',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{textAlign:'center',marginBottom:'16px',paddingBottom:'12px',borderBottom:'2px solid #111'}}>
        <h1 style={{fontSize:'22px',fontWeight:'700',letterSpacing:'1px',textTransform:'uppercase',margin:'0 0 6px',fontFamily:'"Times New Roman",serif'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{display:'flex',justifyContent:'center',gap:'16px',fontSize:'10px',color:'#333',flexWrap:'wrap'}}>
          <span>{cvData.email}</span><span>|</span><span>{cvData.telephone}</span><span>|</span><span>{cvData.ville}</span>
          {cvData.linkedin && <><span>|</span><span>{cvData.linkedin}</span></>}
        </div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'14px',textAlign:'center'}}><p style={{fontSize:'10px',color:'#444',fontStyle:'italic',margin:0}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'14px'}}>
        <div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'8px'}}>Experience</div>
        {cvData.experiences.map((exp,i)=>(
          <div key={i} style={{marginBottom:'10px'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline'}}>
              <div style={{fontWeight:'700',fontSize:'11px'}}>{exp.entreprise}, {exp.lieu}</div>
              <div style={{fontSize:'10px',color:'#555'}}>{exp.periode}</div>
            </div>
            <div style={{fontStyle:'italic',fontSize:'10px',color:'#333',marginBottom:'4px'}}>{exp.poste}</div>
            <ul style={{paddingLeft:'18px',margin:0}}>{exp.missions.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#222',marginBottom:'2px'}}>{m}</li>)}</ul>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'14px'}}>
        <div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'8px'}}>Education</div>
        {cvData.formations.map((f,i)=>(
          <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'6px'}}>
            <div><div style={{fontWeight:'700',fontSize:'11px'}}>{f.etablissement}</div><div style={{fontSize:'10px',fontStyle:'italic',color:'#333'}}>{f.diplome}{f.mention && ` — ${f.mention}`}</div></div>
            <div style={{fontSize:'10px',color:'#555'}}>{f.periode}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px'}}>
        <div>
          <div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'8px'}}>Skills</div>
          <div style={{fontSize:'10px',color:'#222',lineHeight:'1.8'}}>{cvData.competences.join(' · ')}</div>
        </div>
        <div>
          <div style={{fontSize:'11px',fontWeight:'700',textTransform:'uppercase',letterSpacing:'1px',borderBottom:'1px solid #111',paddingBottom:'2px',marginBottom:'8px'}}>Languages</div>
          {cvData.langues.map((l,i)=><div key={i} style={{fontSize:'10px',color:'#222',marginBottom:'2px'}}>{l.langue} — {l.niveau}</div>)}
        </div>
      </div>
    </div>
  )
}

export function TemplateSiliconValley({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'-apple-system,BlinkMacSystemFont,"SF Pro Text","Helvetica Neue",sans-serif',fontSize:'11px',lineHeight:'1.7',background:'#fff',color:'#1d1d1f',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden',padding:'40px 48px'}}>
      <div style={{marginBottom:'28px'}}>
        <h1 style={{fontSize:'32px',fontWeight:'700',letterSpacing:'-1px',color:'#1d1d1f',margin:'0 0 4px'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{fontSize:'14px',color:'#6e6e73',fontWeight:'400',marginBottom:'12px'}}>{cvData.titre}</div>
        <div style={{display:'flex',gap:'20px',flexWrap:'wrap',fontSize:'11px',color:'#6e6e73'}}>
          <span>{cvData.email}</span><span>{cvData.telephone}</span><span>{cvData.ville}</span>
          {cvData.linkedin && <span>{cvData.linkedin}</span>}
        </div>
        <div style={{width:'48px',height:'2px',background:'#1d1d1f',marginTop:'16px',borderRadius:'1px'}}></div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'22px'}}><p style={{fontSize:'12px',color:'#3d3d3f',lineHeight:'1.8',margin:0,maxWidth:'520px'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'22px'}}>
        <div style={{fontSize:'9px',fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'14px'}}>EXPÉRIENCES</div>
        {cvData.experiences.map((exp,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'110px 1fr',gap:'16px',marginBottom:'14px'}}>
            <div style={{fontSize:'10px',color:'#6e6e73',paddingTop:'1px',lineHeight:'1.4'}}>{exp.periode}</div>
            <div>
              <div style={{fontWeight:'600',fontSize:'12px',color:'#1d1d1f'}}>{exp.poste}</div>
              <div style={{fontSize:'10px',color:'#6e6e73',marginBottom:'5px'}}>{exp.entreprise} · {exp.lieu}</div>
              <ul style={{paddingLeft:'14px',margin:0}}>{exp.missions.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#3d3d3f',marginBottom:'2px'}}>{m}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'22px'}}>
        <div style={{fontSize:'9px',fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'14px'}}>FORMATION</div>
        {cvData.formations.map((f,i)=>(
          <div key={i} style={{display:'grid',gridTemplateColumns:'110px 1fr',gap:'16px',marginBottom:'8px'}}>
            <div style={{fontSize:'10px',color:'#6e6e73'}}>{f.periode}</div>
            <div><div style={{fontWeight:'600',fontSize:'12px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#6e6e73'}}>{f.etablissement}</div></div>
          </div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'24px'}}>
        <div>
          <div style={{fontSize:'9px',fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'10px'}}>COMPÉTENCES</div>
          <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>{cvData.competences.map((c,i)=><span key={i} style={{border:'1px solid #d2d2d7',padding:'3px 10px',fontSize:'9px',color:'#1d1d1f',borderRadius:'100px'}}>{c}</span>)}</div>
        </div>
        <div>
          <div style={{fontSize:'9px',fontWeight:'600',letterSpacing:'2px',textTransform:'uppercase',color:'#6e6e73',marginBottom:'10px'}}>LANGUES</div>
          {cvData.langues.map((l,i)=><div key={i} style={{fontSize:'10px',color:'#3d3d3f',marginBottom:'4px'}}>{l.langue} <span style={{color:'#6e6e73'}}>— {l.niveau}</span></div>)}
        </div>
      </div>
    </div>
  )
}

export function TemplateModerne({ cvData }) {
  return (
    <div id="cv-to-print" style={{display:'grid',gridTemplateColumns:'220px 1fr',fontFamily:'Helvetica,sans-serif',fontSize:'11px',lineHeight:'1.6',background:'#fff',width:'794px',minHeight:'1123px',maxHeight:'1123px',overflow:'hidden'}}>
      <div style={{background:'#0f6e56',color:'#fff',padding:'28px 20px'}}>
        <div style={{marginBottom:'24px',paddingBottom:'16px',borderBottom:'1px solid rgba(255,255,255,0.2)'}}>
          <h1 style={{fontSize:'18px',fontWeight:'700',marginBottom:'4px',color:'#fff',lineHeight:'1.2'}}>{cvData.prenom}<br/>{cvData.nom}</h1>
          <div style={{fontSize:'10px',color:'rgba(255,255,255,0.8)'}}>{cvData.titre}</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'8px'}}>CONTACT</div>
          <div style={{fontSize:'9px',color:'rgba(255,255,255,0.9)',marginBottom:'4px'}}>✉ {cvData.email}</div>
          <div style={{fontSize:'9px',color:'rgba(255,255,255,0.9)',marginBottom:'4px'}}>☎ {cvData.telephone}</div>
          <div style={{fontSize:'9px',color:'rgba(255,255,255,0.9)',marginBottom:'4px'}}>📍 {cvData.ville}</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'8px'}}>COMPÉTENCES</div>
          {cvData.competences.map((c,i)=><div key={i} style={{background:'rgba(255,255,255,0.15)',padding:'4px 8px',borderRadius:'4px',fontSize:'9px',color:'#fff',marginBottom:'4px'}}>{c}</div>)}
        </div>
        <div>
          <div style={{fontSize:'8px',fontWeight:'700',letterSpacing:'1.5px',textTransform:'uppercase',color:'rgba(255,255,255,0.6)',marginBottom:'8px'}}>LANGUES</div>
          {cvData.langues.map((l,i)=><div key={i} style={{fontSize:'9px',color:'rgba(255,255,255,0.9)',marginBottom:'3px'}}>{l.langue} — {l.niveau}</div>)}
        </div>
      </div>
      <div style={{padding:'28px 24px'}}>
        {cvData.accroche && <div style={{marginBottom:'18px',padding:'12px',background:'#f0fdf4',borderLeft:'3px solid #0f6e56',borderRadius:'0 6px 6px 0'}}><p style={{fontSize:'10px',color:'#374151',fontStyle:'italic',margin:0}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'18px'}}>
          <div style={{fontSize:'10px',fontWeight:'700',color:'#0f6e56',letterSpacing:'1.5px',textTransform:'uppercase',borderBottom:'2px solid #0f6e56',paddingBottom:'4px',marginBottom:'10px'}}>EXPÉRIENCES</div>
          {cvData.experiences.map((exp,i)=>(
            <div key={i} style={{marginBottom:'12px'}}>
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div><div style={{fontWeight:'700',fontSize:'11px',color:'#111'}}>{exp.poste}</div><div style={{fontSize:'10px',color:'#0f6e56'}}>{exp.entreprise} — {exp.lieu}</div></div>
                <div style={{fontSize:'9px',color:'#888',whiteSpace:'nowrap',background:'#f0fdf4',padding:'2px 8px',borderRadius:'10px',height:'fit-content'}}>{exp.periode}</div>
              </div>
              <ul style={{paddingLeft:'14px',marginTop:'4px'}}>{exp.missions.map((m,j)=><li key={j} style={{fontSize:'10px',color:'#444',marginBottom:'2px'}}>{m}</li>)}</ul>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:'10px',fontWeight:'700',color:'#0f6e56',letterSpacing:'1.5px',textTransform:'uppercase',borderBottom:'2px solid #0f6e56',paddingBottom:'4px',marginBottom:'10px'}}>FORMATION</div>
          {cvData.formations.map((f,i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
              <div><div style={{fontWeight:'700',fontSize:'11px'}}>{f.diplome}</div><div style={{fontSize:'10px',color:'#555'}}>{f.etablissement}</div></div>
              <div style={{fontSize:'10px',color:'#888'}}>{f.periode}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CVTemplate({ cvData, template }) {
  switch(template) {
    case 'linkedin': return <TemplateLinkedIn cvData={cvData} />
    case 'canva': return <TemplateCanva cvData={cvData} />
    case 'harvard': return <TemplateHarvard cvData={cvData} />
    case 'siliconvalley': return <TemplateSiliconValley cvData={cvData} />
    case 'moderne': return <TemplateModerne cvData={cvData} />
    default: return <TemplateFinance cvData={cvData} />
  }
}
