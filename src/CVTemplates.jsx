export function TemplateFinance({ cvData }) {
  return (
    <div className="cv-finance" id="cv-to-print">
      <div className="cv-header-finance">
        <h1>{cvData.prenom} {cvData.nom}</h1>
        <h2>{cvData.titre}</h2>
        <div className="cv-contact">
          <span>📧 {cvData.email}</span>
          <span>📞 {cvData.telephone}</span>
          <span>📍 {cvData.ville}</span>
          {cvData.linkedin && <span>🔗 {cvData.linkedin}</span>}
        </div>
      </div>
      {cvData.accroche && <div className="cv-section"><h3 className="cv-section-title">Profil</h3><p className="cv-accroche">{cvData.accroche}</p></div>}
      <div className="cv-section">
        <h3 className="cv-section-title">Expériences professionnelles</h3>
        {cvData.experiences.map((exp, i) => (
          <div key={i} className="cv-exp">
            <div className="cv-exp-header">
              <div><div className="cv-exp-poste">{exp.poste}</div><div className="cv-exp-entreprise">{exp.entreprise} — {exp.lieu}</div></div>
              <div className="cv-exp-periode">{exp.periode}</div>
            </div>
            <ul className="cv-missions">{exp.missions.map((m, j) => <li key={j}>{m}</li>)}</ul>
          </div>
        ))}
      </div>
      <div className="cv-section">
        <h3 className="cv-section-title">Formation</h3>
        {cvData.formations.map((f, i) => (
          <div key={i} className="cv-exp">
            <div className="cv-exp-header">
              <div><div className="cv-exp-poste">{f.diplome}</div><div className="cv-exp-entreprise">{f.etablissement}</div></div>
              <div className="cv-exp-periode">{f.periode}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="cv-bottom">
        <div className="cv-section"><h3 className="cv-section-title">Compétences</h3><div className="cv-competences">{cvData.competences.map((c, i) => <span key={i} className="cv-tag">{c}</span>)}</div></div>
        <div className="cv-section"><h3 className="cv-section-title">Langues</h3>{cvData.langues.map((l, i) => <div key={i} className="cv-langue"><span>{l.langue}</span><span className="cv-niveau">{l.niveau}</span></div>)}</div>
      </div>
    </div>
  )
}

export function TemplateClassique({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'Arial,sans-serif', color:'#222', fontSize:'12px', lineHeight:'1.6', padding:'32px', background:'#fff', width:'794px', minHeight:'1123px', maxHeight:'1123px', overflow:'hidden'}}>
      <div style={{borderBottom:'3px solid #1a56db', paddingBottom:'14px', marginBottom:'18px'}}>
        <h1 style={{fontSize:'22px', fontWeight:'700', color:'#1a56db', margin:'0 0 4px'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{fontSize:'13px', color:'#555', marginBottom:'8px'}}>{cvData.titre}</div>
        <div style={{display:'flex', gap:'16px', flexWrap:'wrap', fontSize:'11px', color:'#666'}}>
          <span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span>
          {cvData.linkedin && <span>🔗 {cvData.linkedin}</span>}
        </div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'16px'}}><div style={{fontSize:'10px', fontWeight:'700', color:'#1a56db', letterSpacing:'1.5px', textTransform:'uppercase', borderBottom:'1px solid #e5e7ef', paddingBottom:'3px', marginBottom:'8px'}}>PROFIL</div><p style={{fontSize:'11px', color:'#444', fontStyle:'italic'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'16px'}}>
        <div style={{fontSize:'10px', fontWeight:'700', color:'#1a56db', letterSpacing:'1.5px', textTransform:'uppercase', borderBottom:'1px solid #e5e7ef', paddingBottom:'3px', marginBottom:'10px'}}>EXPÉRIENCES</div>
        {cvData.experiences.map((exp, i) => (
          <div key={i} style={{marginBottom:'12px'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div><div style={{fontWeight:'700', fontSize:'12px'}}>{exp.poste}</div><div style={{fontSize:'11px', color:'#666', fontStyle:'italic'}}>{exp.entreprise} — {exp.lieu}</div></div>
              <div style={{fontSize:'11px', color:'#888', whiteSpace:'nowrap'}}>{exp.periode}</div>
            </div>
            <ul style={{paddingLeft:'14px', marginTop:'4px'}}>{exp.missions.map((m, j) => <li key={j} style={{fontSize:'11px', color:'#333', marginBottom:'2px'}}>{m}</li>)}</ul>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'16px'}}>
        <div style={{fontSize:'10px', fontWeight:'700', color:'#1a56db', letterSpacing:'1.5px', textTransform:'uppercase', borderBottom:'1px solid #e5e7ef', paddingBottom:'3px', marginBottom:'10px'}}>FORMATION</div>
        {cvData.formations.map((f, i) => (
          <div key={i} style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
            <div><div style={{fontWeight:'700', fontSize:'12px'}}>{f.diplome}</div><div style={{fontSize:'11px', color:'#666'}}>{f.etablissement}</div></div>
            <div style={{fontSize:'11px', color:'#888'}}>{f.periode}</div>
          </div>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
        <div><div style={{fontSize:'10px', fontWeight:'700', color:'#1a56db', letterSpacing:'1.5px', textTransform:'uppercase', borderBottom:'1px solid #e5e7ef', paddingBottom:'3px', marginBottom:'8px'}}>COMPÉTENCES</div><div style={{display:'flex', flexWrap:'wrap', gap:'5px'}}>{cvData.competences.map((c, i) => <span key={i} style={{background:'#eff4ff', color:'#1a56db', padding:'2px 8px', borderRadius:'3px', fontSize:'10px', fontWeight:'500'}}>{c}</span>)}</div></div>
        <div><div style={{fontSize:'10px', fontWeight:'700', color:'#1a56db', letterSpacing:'1.5px', textTransform:'uppercase', borderBottom:'1px solid #e5e7ef', paddingBottom:'3px', marginBottom:'8px'}}>LANGUES</div>{cvData.langues.map((l, i) => <div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:'11px', borderBottom:'1px solid #f0f0f0', padding:'2px 0'}}><span>{l.langue}</span><span style={{color:'#888', fontStyle:'italic'}}>{l.niveau}</span></div>)}</div>
      </div>
    </div>
  )
}

export function TemplateModerne({ cvData }) {
  return (
    <div id="cv-to-print" style={{display:'grid', gridTemplateColumns:'220px 1fr', fontFamily:'Helvetica,sans-serif', fontSize:'12px', lineHeight:'1.6', background:'#fff', width:'794px', minHeight:'1123px', maxHeight:'1123px', overflow:'hidden'}}>
      <div style={{background:'#0f6e56', color:'#fff', padding:'28px 20px'}}>
        <div style={{marginBottom:'24px', paddingBottom:'16px', borderBottom:'1px solid rgba(255,255,255,0.2)'}}>
          <h1 style={{fontSize:'18px', fontWeight:'700', marginBottom:'4px', color:'#fff'}}>{cvData.prenom}<br/>{cvData.nom}</h1>
          <div style={{fontSize:'11px', color:'rgba(255,255,255,0.8)'}}>{cvData.titre}</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'9px', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', marginBottom:'8px'}}>CONTACT</div>
          <div style={{fontSize:'10px', color:'rgba(255,255,255,0.9)', marginBottom:'4px'}}>✉ {cvData.email}</div>
          <div style={{fontSize:'10px', color:'rgba(255,255,255,0.9)', marginBottom:'4px'}}>☎ {cvData.telephone}</div>
          <div style={{fontSize:'10px', color:'rgba(255,255,255,0.9)', marginBottom:'4px'}}>📍 {cvData.ville}</div>
        </div>
        <div style={{marginBottom:'20px'}}>
          <div style={{fontSize:'9px', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', marginBottom:'8px'}}>COMPÉTENCES</div>
          {cvData.competences.map((c, i) => <div key={i} style={{background:'rgba(255,255,255,0.15)', padding:'4px 8px', borderRadius:'4px', fontSize:'10px', color:'#fff', marginBottom:'4px'}}>{c}</div>)}
        </div>
        <div>
          <div style={{fontSize:'9px', fontWeight:'700', letterSpacing:'1.5px', textTransform:'uppercase', color:'rgba(255,255,255,0.6)', marginBottom:'8px'}}>LANGUES</div>
          {cvData.langues.map((l, i) => <div key={i} style={{fontSize:'10px', color:'rgba(255,255,255,0.9)', marginBottom:'3px'}}>{l.langue} — {l.niveau}</div>)}
        </div>
      </div>
      <div style={{padding:'28px 24px'}}>
        {cvData.accroche && <div style={{marginBottom:'18px', padding:'12px', background:'#f0fdf4', borderLeft:'3px solid #0f6e56', borderRadius:'0 6px 6px 0'}}><p style={{fontSize:'11px', color:'#374151', fontStyle:'italic'}}>{cvData.accroche}</p></div>}
        <div style={{marginBottom:'18px'}}>
          <div style={{fontSize:'10px', fontWeight:'700', color:'#0f6e56', letterSpacing:'1.5px', textTransform:'uppercase', borderBottom:'2px solid #0f6e56', paddingBottom:'4px', marginBottom:'10px'}}>EXPÉRIENCES</div>
          {cvData.experiences.map((exp, i) => (
            <div key={i} style={{marginBottom:'12px'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}>
                <div><div style={{fontWeight:'700', fontSize:'12px', color:'#111'}}>{exp.poste}</div><div style={{fontSize:'11px', color:'#0f6e56'}}>{exp.entreprise} — {exp.lieu}</div></div>
                <div style={{fontSize:'10px', color:'#888', whiteSpace:'nowrap', background:'#f0fdf4', padding:'2px 8px', borderRadius:'10px', height:'fit-content'}}>{exp.periode}</div>
              </div>
              <ul style={{paddingLeft:'14px', marginTop:'4px'}}>{exp.missions.map((m, j) => <li key={j} style={{fontSize:'11px', color:'#444', marginBottom:'2px'}}>{m}</li>)}</ul>
            </div>
          ))}
        </div>
        <div>
          <div style={{fontSize:'10px', fontWeight:'700', color:'#0f6e56', letterSpacing:'1.5px', textTransform:'uppercase', borderBottom:'2px solid #0f6e56', paddingBottom:'4px', marginBottom:'10px'}}>FORMATION</div>
          {cvData.formations.map((f, i) => (
            <div key={i} style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
              <div><div style={{fontWeight:'700', fontSize:'12px'}}>{f.diplome}</div><div style={{fontSize:'11px', color:'#555'}}>{f.etablissement}</div></div>
              <div style={{fontSize:'11px', color:'#888'}}>{f.periode}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function TemplateCreatif({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'Georgia,serif', fontSize:'12px', lineHeight:'1.6', background:'#fff', width:'794px', minHeight:'1123px', maxHeight:'1123px', overflow:'hidden'}}>
      <div style={{background:'#993556', padding:'28px 32px', marginBottom:'0'}}>
        <h1 style={{fontSize:'28px', fontWeight:'700', color:'#fff', letterSpacing:'-0.5px', marginBottom:'4px'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{fontSize:'14px', color:'rgba(255,255,255,0.85)', marginBottom:'12px'}}>{cvData.titre}</div>
        <div style={{display:'flex', gap:'16px', flexWrap:'wrap', fontSize:'11px', color:'rgba(255,255,255,0.75)'}}>
          <span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span>
        </div>
      </div>
      <div style={{padding:'24px 32px'}}>
        {cvData.accroche && <div style={{marginBottom:'18px', borderLeft:'4px solid #993556', paddingLeft:'12px'}}><p style={{fontSize:'12px', color:'#444', fontStyle:'italic'}}>{cvData.accroche}</p></div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 180px', gap:'24px'}}>
          <div>
            <div style={{fontSize:'11px', fontWeight:'700', color:'#993556', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px', borderBottom:'1px solid #993556', paddingBottom:'4px'}}>EXPÉRIENCES</div>
            {cvData.experiences.map((exp, i) => (
              <div key={i} style={{marginBottom:'14px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                  <div><div style={{fontWeight:'700', fontSize:'13px'}}>{exp.poste}</div><div style={{fontSize:'11px', color:'#993556'}}>{exp.entreprise} — {exp.lieu}</div></div>
                  <div style={{fontSize:'10px', color:'#888', whiteSpace:'nowrap'}}>{exp.periode}</div>
                </div>
                <ul style={{paddingLeft:'14px', marginTop:'4px'}}>{exp.missions.map((m, j) => <li key={j} style={{fontSize:'11px', color:'#333', marginBottom:'2px'}}>{m}</li>)}</ul>
              </div>
            ))}
            <div style={{fontSize:'11px', fontWeight:'700', color:'#993556', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px', borderBottom:'1px solid #993556', paddingBottom:'4px', marginTop:'16px'}}>FORMATION</div>
            {cvData.formations.map((f, i) => (
              <div key={i} style={{marginBottom:'8px'}}>
                <div style={{fontWeight:'700', fontSize:'12px'}}>{f.diplome}</div>
                <div style={{fontSize:'11px', color:'#555'}}>{f.etablissement} — {f.periode}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{fontSize:'11px', fontWeight:'700', color:'#993556', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px', borderBottom:'1px solid #993556', paddingBottom:'4px'}}>COMPÉTENCES</div>
            {cvData.competences.map((c, i) => <div key={i} style={{background:'#fbeaf0', color:'#993556', padding:'4px 8px', borderRadius:'4px', fontSize:'10px', marginBottom:'4px', fontWeight:'500'}}>{c}</div>)}
            <div style={{fontSize:'11px', fontWeight:'700', color:'#993556', letterSpacing:'2px', textTransform:'uppercase', marginBottom:'10px', borderBottom:'1px solid #993556', paddingBottom:'4px', marginTop:'16px'}}>LANGUES</div>
            {cvData.langues.map((l, i) => <div key={i} style={{fontSize:'11px', color:'#444', marginBottom:'4px'}}><strong>{l.langue}</strong> — {l.niveau}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TemplateTech({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Courier New",monospace', fontSize:'11px', lineHeight:'1.7', background:'#0d1117', color:'#e6edf3', width:'794px', minHeight:'1123px', maxHeight:'1123px', overflow:'hidden', padding:'32px'}}>
      <div style={{borderBottom:'1px solid #30363d', paddingBottom:'16px', marginBottom:'20px'}}>
        <div style={{color:'#58a6ff', fontSize:'11px', marginBottom:'4px'}}>// {cvData.titre}</div>
        <h1 style={{fontSize:'24px', fontWeight:'700', color:'#e6edf3', margin:'0 0 8px', fontFamily:'"Courier New",monospace'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{display:'flex', gap:'16px', flexWrap:'wrap', fontSize:'10px', color:'#8b949e'}}>
          <span>✉ {cvData.email}</span><span>☎ {cvData.telephone}</span><span>📍 {cvData.ville}</span>
        </div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'18px', background:'#161b22', padding:'10px 14px', borderRadius:'6px', borderLeft:'3px solid #58a6ff'}}><span style={{color:'#8b949e', fontSize:'10px'}}>/** </span><span style={{color:'#a5d6ff', fontSize:'10px'}}>{cvData.accroche}</span><span style={{color:'#8b949e', fontSize:'10px'}}> */</span></div>}
      <div style={{marginBottom:'18px'}}>
        <div style={{color:'#58a6ff', fontSize:'10px', fontWeight:'700', marginBottom:'10px'}}>## EXPÉRIENCES</div>
        {cvData.experiences.map((exp, i) => (
          <div key={i} style={{marginBottom:'12px', paddingLeft:'12px', borderLeft:'2px solid #21262d'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div><span style={{color:'#79c0ff', fontWeight:'700'}}>{exp.poste}</span><span style={{color:'#8b949e'}}> @ {exp.entreprise}</span></div>
              <span style={{color:'#6e7681', fontSize:'10px'}}>{exp.periode}</span>
            </div>
            <ul style={{paddingLeft:'14px', marginTop:'4px', listStyle:'none'}}>{exp.missions.map((m, j) => <li key={j} style={{fontSize:'10px', color:'#c9d1d9', marginBottom:'2px'}}><span style={{color:'#58a6ff'}}>→ </span>{m}</li>)}</ul>
          </div>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
        <div>
          <div style={{color:'#58a6ff', fontSize:'10px', fontWeight:'700', marginBottom:'8px'}}>## COMPÉTENCES</div>
          <div style={{display:'flex', flexWrap:'wrap', gap:'4px'}}>{cvData.competences.map((c, i) => <span key={i} style={{background:'#21262d', border:'1px solid #30363d', color:'#79c0ff', padding:'2px 8px', borderRadius:'4px', fontSize:'9px'}}>{c}</span>)}</div>
        </div>
        <div>
          <div style={{color:'#58a6ff', fontSize:'10px', fontWeight:'700', marginBottom:'8px'}}>## FORMATION</div>
          {cvData.formations.map((f, i) => <div key={i} style={{marginBottom:'6px'}}><div style={{color:'#c9d1d9', fontSize:'10px', fontWeight:'700'}}>{f.diplome}</div><div style={{color:'#8b949e', fontSize:'9px'}}>{f.etablissement} | {f.periode}</div></div>)}
          <div style={{color:'#58a6ff', fontSize:'10px', fontWeight:'700', marginBottom:'8px', marginTop:'12px'}}>## LANGUES</div>
          {cvData.langues.map((l, i) => <div key={i} style={{fontSize:'10px', color:'#c9d1d9', marginBottom:'3px'}}><span style={{color:'#79c0ff'}}>{l.langue}</span> — {l.niveau}</div>)}
        </div>
      </div>
    </div>
  )
}

export function TemplateMinimaliste({ cvData }) {
  return (
    <div id="cv-to-print" style={{fontFamily:'"Helvetica Neue",Helvetica,sans-serif', fontSize:'11px', lineHeight:'1.8', background:'#fff', color:'#111', width:'794px', minHeight:'1123px', maxHeight:'1123px', overflow:'hidden', padding:'48px'}}>
      <div style={{marginBottom:'32px'}}>
        <h1 style={{fontSize:'28px', fontWeight:'300', letterSpacing:'3px', textTransform:'uppercase', color:'#111', marginBottom:'6px'}}>{cvData.prenom} {cvData.nom}</h1>
        <div style={{fontSize:'12px', color:'#888', letterSpacing:'1px', marginBottom:'12px'}}>{cvData.titre}</div>
        <div style={{display:'flex', gap:'20px', fontSize:'10px', color:'#aaa'}}>
          <span>{cvData.email}</span><span>{cvData.telephone}</span><span>{cvData.ville}</span>
        </div>
        <div style={{width:'40px', height:'1px', background:'#111', marginTop:'16px'}}></div>
      </div>
      {cvData.accroche && <div style={{marginBottom:'24px'}}><p style={{fontSize:'11px', color:'#555', lineHeight:'1.8', maxWidth:'500px'}}>{cvData.accroche}</p></div>}
      <div style={{marginBottom:'24px'}}>
        <div style={{fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase', color:'#aaa', marginBottom:'12px'}}>EXPÉRIENCES</div>
        {cvData.experiences.map((exp, i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'100px 1fr', gap:'16px', marginBottom:'14px'}}>
            <div style={{fontSize:'10px', color:'#aaa', paddingTop:'1px'}}>{exp.periode}</div>
            <div>
              <div style={{fontWeight:'600', fontSize:'12px'}}>{exp.poste}</div>
              <div style={{fontSize:'10px', color:'#888', marginBottom:'4px'}}>{exp.entreprise} · {exp.lieu}</div>
              <ul style={{paddingLeft:'12px', margin:'0'}}>{exp.missions.map((m, j) => <li key={j} style={{fontSize:'10px', color:'#555', marginBottom:'2px'}}>{m}</li>)}</ul>
            </div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:'24px'}}>
        <div style={{fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase', color:'#aaa', marginBottom:'12px'}}>FORMATION</div>
        {cvData.formations.map((f, i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'100px 1fr', gap:'16px', marginBottom:'8px'}}>
            <div style={{fontSize:'10px', color:'#aaa'}}>{f.periode}</div>
            <div><div style={{fontWeight:'600', fontSize:'12px'}}>{f.diplome}</div><div style={{fontSize:'10px', color:'#888'}}>{f.etablissement}</div></div>
          </div>
        ))}
      </div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px'}}>
        <div><div style={{fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase', color:'#aaa', marginBottom:'10px'}}>COMPÉTENCES</div><div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>{cvData.competences.map((c, i) => <span key={i} style={{border:'1px solid #ddd', padding:'3px 10px', fontSize:'9px', color:'#555', borderRadius:'2px'}}>{c}</span>)}</div></div>
        <div><div style={{fontSize:'9px', letterSpacing:'3px', textTransform:'uppercase', color:'#aaa', marginBottom:'10px'}}>LANGUES</div>{cvData.langues.map((l, i) => <div key={i} style={{fontSize:'10px', color:'#555', marginBottom:'4px'}}>{l.langue} <span style={{color:'#aaa'}}>— {l.niveau}</span></div>)}</div>
      </div>
    </div>
  )
}

export function CVTemplate({ cvData, template }) {
  switch(template) {
    case 'classique': return <TemplateClassique cvData={cvData} />
    case 'moderne': return <TemplateModerne cvData={cvData} />
    case 'creatif': return <TemplateCreatif cvData={cvData} />
    case 'tech': return <TemplateTech cvData={cvData} />
    case 'minimaliste': return <TemplateMinimaliste cvData={cvData} />
    default: return <TemplateFinance cvData={cvData} />
  }
}