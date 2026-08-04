// src/CVTemplatesPro.jsx
// 10 templates de CV premium — dimensions A4 exactes (794x1123px @ 96dpi)

const PAGE = { width: 794, minHeight: 1123 }

// Photo de profil partagée par tous les templates qui en affichent une.
// showPhoto=false retire l'espace entièrement (pas de trou dans le layout) ;
// showPhoto=true sans photo affiche les initiales en placeholder.
// forme : 'rond' | 'carre' | 'carre_arrondi' | 'hexagone'
function PhotoCV({ photo, initiales, size = 90, color, forme = 'rond', showPhoto = true }) {
  if (!showPhoto) return null

  const formes = {
    rond: '50%',
    carre: '8px',
    carre_arrondi: '16px',
    hexagone: '50%',
  }
  const borderRadius = formes[forme] || '50%'

  const style = {
    width: size, height: size, borderRadius,
    objectFit: 'cover', display: 'block',
    flexShrink: 0,
  }

  if (photo) {
    return <img src={photo} alt="photo" style={style} />
  }

  return (
    <div style={{
      ...style,
      background: color + '18',
      border: '2px solid ' + color + '40',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      color: color, fontSize: size * 0.3,
      fontWeight: 700, letterSpacing: '-0.5px',
      fontFamily: 'Inter, sans-serif',
    }}>
      {initiales}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 1 : MÉRIDIEN — Une colonne premium (corporate)
// ═══════════════════════════════════════════════════════════════════
function Meridien({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '16px' }
  const sectionRule = { width: '32px', height: '2px', background: color, marginBottom: '20px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '56px 60px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif',
      overflow: 'hidden', color: '#111827',
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#111827', letterSpacing: '-0.8px', marginBottom: '6px' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && (
            <div style={{ fontSize: '15px', fontWeight: 400, color: '#6b7280', letterSpacing: '0.3px', marginBottom: '18px' }}>
              {cvData.titre}
            </div>
          )}
          <div style={{ height: '1px', background: '#e5e7eb', width: '100%', marginBottom: '14px' }} />
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '11px', fontWeight: 400, color: '#4b5563' }}>
              {contacts.map((c, i) => (
                <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  {i > 0 && <span style={{ color: '#d1d5db' }}>·</span>}
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '24px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {/* ACCROCHE */}
      {cvData.accroche && (
        <div style={{ marginTop: '28px', marginBottom: '32px', fontSize: '11.5px', fontWeight: 400, lineHeight: 1.65, color: '#374151' }}>
          {cvData.accroche}
        </div>
      )}

      {/* EXPÉRIENCES */}
      {experiences.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                <div style={{ fontSize: '10.5px', fontWeight: 400, color: '#9ca3af' }}>{exp.periode}</div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px', marginBottom: '8px' }}>
                {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', fontWeight: 400, lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FORMATIONS */}
      {formations.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '22px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                <div style={{ fontSize: '10.5px', fontWeight: 400, color: '#9ca3af' }}>{f.periode}</div>
              </div>
              <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px', marginBottom: '4px' }}>
                {[f.etablissement, f.mention].filter(Boolean).join(' — ')}
              </div>
              {f.description && (
                <div style={{ fontSize: '11px', color: '#4b5563', lineHeight: 1.6 }}>{f.description}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* COMPÉTENCES */}
      {competences.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#374151' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* LANGUES */}
      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '34px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={sectionRule} />
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
              <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {/* CERTIFICATIONS */}
      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '34px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={sectionRule} />
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
              {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {/* CENTRES D'INTÉRÊT */}
      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 2 : ATELIER — Deux colonnes asymétrique (designer)
// ═══════════════════════════════════════════════════════════════════
function Atelier({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const leftSectionTitle = { fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '10px' }
  const leftSectionRule = { height: '1px', background: '#e5e7eb', width: '100%', marginBottom: '12px' }
  const rightSectionTitle = { fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      {/* COLONNE GAUCHE */}
      <div style={{ width: '264px', flexShrink: 0, background: '#f8f9fa', padding: '36px 28px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', margin: '0 auto 24px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={96} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', textAlign: 'center', lineHeight: 1.25, marginBottom: '5px' }}>
          {cvData.prenom} {cvData.nom}
        </div>
        {cvData.titre && (
          <div style={{ fontSize: '11.5px', fontWeight: 400, color, textAlign: 'center', marginBottom: '28px' }}>
            {cvData.titre}
          </div>
        )}

        {contacts.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={leftSectionTitle}>Contact</div>
            <div style={leftSectionRule} />
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: '10.5px', fontWeight: 400, color: '#374151', lineHeight: 1.6, marginBottom: '4px' }}>{c}</div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={leftSectionTitle}>Compétences</div>
            <div style={leftSectionRule} />
            {competences.map((c, i) => (
              <div key={i} style={{ fontSize: '10.5px', fontWeight: 400, color: '#374151', marginBottom: '6px' }}>
                <span style={{ display: 'inline-block', width: '4px', height: '4px', background: color, marginRight: '8px', verticalAlign: 'middle' }} />
                {c}
              </div>
            ))}
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={leftSectionTitle}>Langues</div>
            <div style={leftSectionRule} />
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '10.5px', fontWeight: 400, color: '#374151', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>{l.langue}</span> — {l.niveau}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={leftSectionTitle}>Intérêts</div>
            <div style={leftSectionRule} />
            <div style={{ fontSize: '10.5px', fontWeight: 400, color: '#374151', lineHeight: 1.6 }}>
              {centresInteret.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* COLONNE DROITE */}
      <div style={{ flex: 1, background: '#ffffff', padding: '40px 36px', boxSizing: 'border-box', minWidth: 0 }}>
        {cvData.accroche && (
          <div style={{ fontSize: '11.5px', fontWeight: 400, lineHeight: 1.7, color: '#4b5563', borderLeft: `3px solid ${color}`, paddingLeft: '16px', marginBottom: '30px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={rightSectionTitle}>Expérience</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 500, color, marginTop: '2px' }}>{exp.entreprise}</div>
                <div style={{ fontSize: '10px', fontWeight: 400, color: '#9ca3af', marginTop: '3px', marginBottom: '8px' }}>
                  {[exp.periode, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '12px', fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color }}>·</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: certifications.length ? '30px' : 0 }}>
            <div style={rightSectionTitle}>Formation</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '20px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 500, color, marginTop: '2px' }}>{f.etablissement}</div>
                <div style={{ fontSize: '10px', fontWeight: 400, color: '#9ca3af', marginTop: '3px' }}>
                  {[f.periode, f.mention].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <div style={rightSectionTitle}>Certifications</div>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 3 : TRIBUNE — Header pleine largeur
// ═══════════════════════════════════════════════════════════════════
function Tribune({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color }
  const sectionRule = { height: '1px', background: '#e5e7eb', width: '100%', marginTop: '8px', marginBottom: '20px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      {/* HEADER */}
      <div style={{
        height: '148px', background: color, padding: '36px 56px', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {showPhoto && (
            <div style={{ width: 'fit-content', marginRight: '24px', flexShrink: 0 }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color="#ffffff" forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
          <div>
            <div style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
              {cvData.prenom} {cvData.nom}
            </div>
            {cvData.titre && (
              <div style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.85)', marginTop: '6px' }}>
                {cvData.titre}
              </div>
            )}
          </div>
        </div>
        {contacts.length > 0 && (
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: '10.5px', fontWeight: 400, color: 'rgba(255,255,255,0.9)', marginBottom: '5px' }}>{c}</div>
            ))}
          </div>
        )}
      </div>

      {/* CORPS */}
      <div style={{ padding: '40px 56px', boxSizing: 'border-box' }}>
        {cvData.accroche && (
          <div style={{ fontSize: '12px', lineHeight: 1.7, color: '#374151', background: '#f9fafb', padding: '20px', borderRadius: '4px', marginBottom: '32px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', fontWeight: 400, color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px', marginBottom: '8px' }}>
                  {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={sectionTitle}>Formations</div>
            <div style={sectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '22px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', fontWeight: 400, color: '#9ca3af' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px' }}>
                  {[f.etablissement, f.mention].filter(Boolean).join(' — ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={sectionRule} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#374151' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: certifications.length || centresInteret.length ? '32px' : 0 }}>
            <div style={sectionTitle}>Langues</div>
            <div style={sectionRule} />
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
                <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={{ marginBottom: centresInteret.length ? '32px' : 0 }}>
            <div style={sectionTitle}>Certifications</div>
            <div style={sectionRule} />
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={sectionRule} />
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 4 : CHRONIQUE — Timeline verticale
// ═══════════════════════════════════════════════════════════════════
function Chronique({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitleClassic = { fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '50px 56px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color: '#6b7280', marginTop: '4px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginTop: '14px', fontSize: '10.5px', color: '#6b7280' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '24px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>
      <div style={{ height: '2px', background: color, width: '60px', marginTop: '20px', marginBottom: '30px' }} />

      {/* EXPÉRIENCES avec timeline */}
      {experiences.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={sectionTitleClassic}>Expériences</div>
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '8px', width: '2px', background: '#e5e7eb' }} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: i < experiences.length - 1 ? '26px' : 0 }}>
                <div style={{
                  position: 'absolute', left: '-32px', top: '5px', width: '16px', height: '16px',
                  borderRadius: '50%', background: '#ffffff', border: `3px solid ${color}`,
                }} />
                {exp.periode && (
                  <div style={{ display: 'inline-block', padding: '3px 10px', background: `${color}15`, borderRadius: '12px', fontSize: '9.5px', fontWeight: 600, color, marginBottom: '8px' }}>
                    {exp.periode}
                  </div>
                )}
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 400, color: '#6b7280', marginTop: '2px', marginBottom: '8px' }}>
                  {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FORMATIONS classique */}
      {formations.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={sectionTitleClassic}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', color: '#6b7280', marginTop: '2px' }}>
                {[f.etablissement, f.mention].filter(Boolean).join(' — ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPÉTENCES classique */}
      {competences.length > 0 && (
        <div style={{ marginBottom: '36px' }}>
          <div style={sectionTitleClassic}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: `${color}15`, borderRadius: '12px', fontSize: '10.5px', fontWeight: 600, color }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '36px' : 0 }}>
          <div style={sectionTitleClassic}>Langues</div>
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
              <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '36px' : 0 }}>
          <div style={sectionTitleClassic}>Certifications</div>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
              {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitleClassic}>Centres d'intérêt</div>
          <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 5 : MANUSCRIT — Serif éditorial
// ═══════════════════════════════════════════════════════════════════
function Manuscrit({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontFamily: '"Playfair Display", serif', fontSize: '16px', fontWeight: 600, color: '#1a1a1a', textAlign: 'left' }
  const sectionRule = { height: '1px', background: '#e0ddd5', width: '100%', marginTop: '6px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fffef9',
      padding: '60px 64px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center' }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', margin: '0 auto 16px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '34px', fontWeight: 500, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          {cvData.prenom} {cvData.nom}
        </div>
        <div style={{ width: '40px', height: '1px', background: '#c9a227', margin: '14px auto' }} />
        {cvData.titre && (
          <div style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '2px', textTransform: 'uppercase', color: '#666' }}>
            {cvData.titre}
          </div>
        )}
        {contacts.length > 0 && (
          <div style={{ fontSize: '10.5px', color: '#666', marginTop: '16px' }}>
            {contacts.join('  ·  ')}
          </div>
        )}
      </div>

      {/* ACCROCHE */}
      {cvData.accroche && (
        <div style={{ textAlign: 'center', maxWidth: '560px', margin: '32px auto', fontSize: '11.5px', lineHeight: 1.75, color: '#444', fontStyle: 'italic' }}>
          {cvData.accroche}
        </div>
      )}

      {/* EXPÉRIENCES */}
      {experiences.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{exp.poste}</div>
              <div style={{ fontSize: '10.5px', color: '#888', fontStyle: 'italic', marginTop: '3px' }}>
                {[exp.entreprise, exp.periode, exp.lieu].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.65, color: '#444', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#c9a227' }}>—</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FORMATIONS */}
      {formations.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '14px', fontWeight: 600, color: '#1a1a1a' }}>{f.diplome}</div>
              <div style={{ fontSize: '10.5px', color: '#888', fontStyle: 'italic', marginTop: '3px' }}>
                {[f.etablissement, f.periode, f.mention].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPÉTENCES */}
      {competences.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', color: '#444', lineHeight: 1.8 }}>{competences.join(', ')}</div>
        </div>
      )}

      {/* LANGUES */}
      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '34px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={sectionRule} />
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#444', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{l.langue}</span> — {l.niveau}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '34px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={sectionRule} />
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#444', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span> — {c.organisme}</span>}
              {c.annee && <span> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', color: '#444' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 6 : GRILLE — Bento moderne
// ═══════════════════════════════════════════════════════════════════
function Grille({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER carte */}
      <div style={{ background: '#111827', borderRadius: '12px', padding: '32px', boxSizing: 'border-box', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color="#ffffff" forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {/* RANGÉE 1 */}
      <div style={{ display: 'flex', gap: '16px' }}>
        {cvData.accroche && (
          <div style={{ flex: 2, background: '#f9fafb', borderRadius: '12px', padding: '24px', boxSizing: 'border-box', fontSize: '11px', lineHeight: 1.65, color: '#374151' }}>
            {cvData.accroche}
          </div>
        )}
        {competences.length > 0 && (
          <div style={{ flex: 1, background: `${color}0d`, borderRadius: '12px', padding: '24px', boxSizing: 'border-box' }}>
            <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', color, marginBottom: '12px' }}>COMPÉTENCES</div>
            {competences.map((c, i) => (
              <div key={i} style={{ fontSize: '10px', color: '#374151', marginBottom: '5px' }}>{c}</div>
            ))}
          </div>
        )}
      </div>

      {/* BLOC EXPÉRIENCES */}
      {experiences.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '12px', padding: '28px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827', marginBottom: '20px' }}>
            Expériences
          </div>
          {experiences.map((exp, i) => (
            <div key={i} style={{
              marginBottom: i < experiences.length - 1 ? '20px' : 0,
              paddingBottom: i < experiences.length - 1 ? '20px' : 0,
              borderBottom: i < experiences.length - 1 ? '1px solid #f9fafb' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>{exp.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 500, color, marginTop: '3px', marginBottom: '6px' }}>
                {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* RANGÉE FINALE */}
      {(formations.length > 0 || langues.length > 0) && (
        <div style={{ display: 'flex', gap: '16px' }}>
          {formations.length > 0 && (
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: '12px', padding: '24px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', color: '#111827', marginBottom: '12px', textTransform: 'uppercase' }}>Formations</div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                    {[f.etablissement, f.periode].filter(Boolean).join(' · ')}
                  </div>
                </div>
              ))}
            </div>
          )}
          {langues.length > 0 && (
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: '12px', padding: '24px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', color: '#111827', marginBottom: '12px', textTransform: 'uppercase' }}>Langues</div>
              {langues.map((l, i) => (
                <div key={i} style={{ fontSize: '10px', color: '#374151', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600 }}>{l.langue}</span> — {l.niveau}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(certifications.length > 0 || centresInteret.length > 0) && (
        <div style={{ display: 'flex', gap: '16px' }}>
          {certifications.length > 0 && (
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: '12px', padding: '24px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', color: '#111827', marginBottom: '12px', textTransform: 'uppercase' }}>Certifications</div>
              {certifications.map((c, i) => (
                <div key={i} style={{ fontSize: '10px', color: '#374151', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600 }}>{c.titre}</span>
                  {c.organisme && <span> — {c.organisme}</span>}
                </div>
              ))}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: '12px', padding: '24px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', color: '#111827', marginBottom: '12px', textTransform: 'uppercase' }}>Intérêts</div>
              <div style={{ fontSize: '10px', color: '#374151', lineHeight: 1.6 }}>{centresInteret.join(', ')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 7 : SILENCE — Minimal extrême
// ═══════════════════════════════════════════════════════════════════
function Silence({ cvData }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '9px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: '#cccccc', marginBottom: '20px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '80px 90px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '36px', fontWeight: 200, color: '#000000', letterSpacing: '-1px' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && (
            <div style={{ fontSize: '13px', fontWeight: 300, color: '#999999', marginTop: '8px', letterSpacing: '1px' }}>
              {cvData.titre}
            </div>
          )}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '10px', fontWeight: 300, color: '#bbbbbb', marginTop: '24px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '24px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color="#000000" forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ marginTop: '48px', fontSize: '11px', fontWeight: 300, lineHeight: 1.8, color: '#555555' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '32px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 400, color: '#000000' }}>{exp.poste}</div>
              <div style={{ fontSize: '10px', fontWeight: 300, color: '#bbbbbb', marginTop: '2px' }}>{exp.periode}</div>
              <div style={{ fontSize: '11px', fontWeight: 300, color: '#666666', marginTop: '2px', marginBottom: '10px' }}>
                {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <div>
                  {exp.missions.map((m, j) => (
                    <div key={j} style={{ fontSize: '10.5px', fontWeight: 300, lineHeight: 1.8, color: '#555555', marginBottom: '6px' }}>
                      {m}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '20px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 400, color: '#000000' }}>{f.diplome}</div>
              <div style={{ fontSize: '10px', fontWeight: 300, color: '#bbbbbb', marginTop: '2px' }}>{f.periode}</div>
              <div style={{ fontSize: '11px', fontWeight: 300, color: '#666666', marginTop: '2px' }}>{f.etablissement}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ fontSize: '10.5px', fontWeight: 300, color: '#666666', lineHeight: 1.9 }}>
            {competences.join(', ')}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div style={sectionTitle}>Langues</div>
          <div style={{ fontSize: '10.5px', fontWeight: 300, color: '#666666', lineHeight: 1.9 }}>
            {langues.map(l => `${l.langue} (${l.niveau})`).join(', ')}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={{ fontSize: '10.5px', fontWeight: 300, color: '#666666', lineHeight: 1.9 }}>
            {certifications.map(c => [c.titre, c.organisme].filter(Boolean).join(' — ')).join(', ')}
          </div>
        </div>
      )}

      {centresInteret.length > 0 && (
        <div style={{ marginTop: '48px' }}>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '10.5px', fontWeight: 300, color: '#666666', lineHeight: 1.9 }}>
            {centresInteret.join(', ')}
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 8 : SIGNAL — Tech avec badges
// ═══════════════════════════════════════════════════════════════════
function Signal({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0f172a', marginBottom: '16px' }
  const sectionSquare = { width: '6px', height: '6px', background: color, marginRight: '8px', flexShrink: 0 }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '44px 52px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '27px', fontWeight: 700, color: '#0f172a' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 500, color, marginTop: '4px' }}>{cvData.titre}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {contacts.length > 0 && (
            <div style={{ textAlign: 'right' }}>
              {contacts.map((c, i) => (
                <div key={i} style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>{c}</div>
              ))}
            </div>
          )}
          {showPhoto && (
            <div style={{ width: 'fit-content', flexShrink: 0 }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
        </div>
      </div>

      {/* STACK TECHNIQUE */}
      {competences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#94a3b8', marginBottom: '10px' }}>
            Stack technique
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '4px 11px', background: `${color}12`, color, borderRadius: '5px', fontSize: '10px', fontWeight: 600, fontFamily: 'monospace' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ACCROCHE */}
      {cvData.accroche && (
        <div style={{ fontSize: '11px', lineHeight: 1.65, color: '#475569', marginBottom: '28px' }}>
          {cvData.accroche}
        </div>
      )}

      {/* EXPÉRIENCES */}
      {experiences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}><span style={sectionSquare} />Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{exp.poste}</div>
                {exp.periode && (
                  <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '9.5px', color: '#64748b' }}>
                    {exp.periode}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11.5px', fontWeight: 400, color: '#64748b', marginTop: '2px', marginBottom: '6px' }}>
                {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#475569', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color }}>›</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FORMATIONS */}
      {formations.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}><span style={sectionSquare} />Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{f.diplome}</div>
                {f.periode && (
                  <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', fontSize: '9.5px', color: '#64748b' }}>
                    {f.periode}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>{f.etablissement}</div>
            </div>
          ))}
        </div>
      )}

      {/* LANGUES */}
      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '28px' : 0 }}>
          <div style={sectionTitle}><span style={sectionSquare} />Langues</div>
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#475569', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{l.langue}</span> — {l.niveau}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '28px' : 0 }}>
          <div style={sectionTitle}><span style={sectionSquare} />Certifications</div>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#475569', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.titre}</span>
              {c.organisme && <span> — {c.organisme}</span>}
              {c.annee && <span> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}><span style={sectionSquare} />Centres d'intérêt</div>
          <div style={{ fontSize: '11px', color: '#475569' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 9 : PRESTIGE — Executive senior
// ═══════════════════════════════════════════════════════════════════
function Prestige({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontFamily: '"Source Serif 4", serif', fontSize: '17px', fontWeight: 700, color: '#111827' }
  const sectionRule = { height: '2px', background: color, width: '44px', marginTop: '8px', marginBottom: '20px' }

  // Met en valeur les chiffres et pourcentages dans une mission
  const highlightNumbers = (text) => {
    const parts = String(text).split(/(\d+[\d.,]*\s?%?)/g)
    return parts.map((part, i) => (
      /\d/.test(part)
        ? <strong key={i} style={{ fontWeight: 600, color: '#111827' }}>{part}</strong>
        : <span key={i}>{part}</span>
    ))
  }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '52px 58px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{ borderBottom: '3px solid #111827', paddingBottom: '22px', marginBottom: '26px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: '32px', fontWeight: 700, color: '#111827' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && (
            <div style={{ fontSize: '14px', fontWeight: 500, letterSpacing: '1px', textTransform: 'uppercase', color, marginTop: '8px' }}>
              {cvData.titre}
            </div>
          )}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '10.5px', color: '#6b7280', marginTop: '14px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '24px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {/* RÉSUMÉ EXÉCUTIF */}
      {cvData.accroche && (
        <div style={{ background: '#f9fafb', borderLeft: `4px solid ${color}`, padding: '22px 26px', marginBottom: '32px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', color, marginBottom: '10px' }}>PROFIL</div>
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#374151' }}>{cvData.accroche}</div>
        </div>
      )}

      {/* EXPÉRIENCES */}
      {experiences.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Expérience</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '24px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px', marginBottom: '10px' }}>
                {[exp.periode, exp.lieu].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.65, color: '#4b5563', marginBottom: '5px' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                      {highlightNumbers(m)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FORMATIONS */}
      {formations.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Formation</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '18px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>
                {[f.periode, f.mention].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* COMPÉTENCES */}
      {competences.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Compétences clés</div>
          <div style={sectionRule} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#374151' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* LANGUES */}
      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '34px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={sectionRule} />
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
              <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '34px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={sectionRule} />
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
              {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 10 : CONTRASTE — Bicolore audacieux
// ═══════════════════════════════════════════════════════════════════
function Contraste({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const bandTitle = { fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '10px' }
  const bandRule = { height: '1px', background: 'rgba(255,255,255,0.15)', marginBottom: '12px' }
  const rightSectionTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827' }
  const rightSectionRule = { height: '3px', background: color, width: '36px', marginTop: '8px', marginBottom: '20px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      {/* BANDE GAUCHE */}
      <div style={{ width: '230px', flexShrink: 0, background: '#111827', padding: '36px 24px', color: '#ffffff', boxSizing: 'border-box' }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', margin: '0 auto 22px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={96} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '19px', fontWeight: 700, color: '#ffffff', textAlign: 'center', lineHeight: 1.3 }}>
          {cvData.prenom} {cvData.nom}
        </div>
        {cvData.titre && (
          <div style={{ fontSize: '11px', fontWeight: 400, color, textAlign: 'center', marginTop: '5px', marginBottom: '30px' }}>
            {cvData.titre}
          </div>
        )}

        {contacts.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={bandTitle}>Contact</div>
            <div style={bandRule} />
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, marginBottom: '4px' }}>{c}</div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={bandTitle}>Compétences</div>
            <div style={bandRule} />
            {competences.map((c, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)', marginBottom: '5px' }}>{c}</div>
                <div style={{ height: '3px', background: 'rgba(255,255,255,0.15)', borderRadius: '2px' }}>
                  <div style={{ height: '3px', background: color, width: '75%', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={bandTitle}>Langues</div>
            <div style={bandRule} />
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px' }}>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{l.langue}</span> — {l.niveau}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={bandTitle}>Intérêts</div>
            <div style={bandRule} />
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6 }}>
              {centresInteret.join(', ')}
            </div>
          </div>
        )}
      </div>

      {/* ZONE DROITE */}
      <div style={{ flex: 1, background: '#ffffff', padding: '44px 40px', boxSizing: 'border-box', minWidth: 0 }}>
        {cvData.accroche && (
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#4b5563', marginBottom: '30px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={rightSectionTitle}>Expériences</div>
            <div style={rightSectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 500, color, marginTop: '3px', marginBottom: '8px' }}>
                  {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={rightSectionTitle}>Formations</div>
            <div style={rightSectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{f.etablissement}</div>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <div style={rightSectionTitle}>Certifications</div>
            <div style={rightSectionRule} />
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 11 : HORIZON — Bandeau latéral fin
// ═══════════════════════════════════════════════════════════════════
function Horizon({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#18181b' }
  const sectionRule = { height: '1px', background: '#e4e4e7', width: '100%', marginTop: '7px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ width: '68px', flexShrink: 0, background: color, boxSizing: 'border-box' }}>
        {initiales && (
          <div style={{
            writingMode: 'vertical-rl', textOrientation: 'mixed',
            fontSize: '22px', fontWeight: 700, color: 'rgba(255,255,255,0.9)',
            letterSpacing: '4px', marginTop: '44px', marginLeft: '22px',
          }}>
            {initiales}
          </div>
        )}
      </div>
      <div style={{ flex: 1, background: '#ffffff', padding: '48px 52px 48px 44px', boxSizing: 'border-box', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <div style={{ fontSize: '30px', fontWeight: 700, color: '#18181b', letterSpacing: '-0.6px' }}>
              {cvData.prenom} {cvData.nom}
            </div>
            {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color, marginTop: '5px' }}>{cvData.titre}</div>}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10.5px', color: '#71717a', marginTop: '16px' }}>
                {contacts.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
          {showPhoto && (
            <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
        </div>

        {cvData.accroche && (
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#3f3f46', marginBottom: '30px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#18181b' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: '#a1a1aa' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 500, color, marginTop: '3px', marginBottom: '8px' }}>
                  {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#52525b', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, top: '6px', width: '3px', height: '3px', background: color }} />
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Formations</div>
            <div style={sectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '22px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#18181b' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#a1a1aa' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 500, color, marginTop: '3px' }}>
                  {[f.etablissement, f.mention].filter(Boolean).join(' — ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={sectionRule} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#3f3f46' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: certifications.length || centresInteret.length ? '30px' : 0 }}>
            <div style={sectionTitle}>Langues</div>
            <div style={sectionRule} />
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, color: '#18181b' }}>{l.langue}</span>
                <span style={{ color: '#71717a' }}> — {l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={{ marginBottom: centresInteret.length ? '30px' : 0 }}>
            <div style={sectionTitle}>Certifications</div>
            <div style={sectionRule} />
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#3f3f46', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#71717a' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#a1a1aa' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={sectionRule} />
            <div style={{ fontSize: '11px', color: '#3f3f46' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 12 : PALIER — Sections en escalier
// ═══════════════════════════════════════════════════════════════════
function Palier({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color, marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '46px 54px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '31px', fontWeight: 700, color: '#0c0a09' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color: '#78716c', marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '10.5px', color: '#78716c', marginTop: '15px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>
      <div style={{ height: '4px', background: color, width: '100%', marginTop: '24px', marginBottom: '30px' }} />

      {cvData.accroche && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Profil</div>
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#44403c' }}>{cvData.accroche}</div>
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ paddingLeft: '20px', borderLeft: `2px solid ${color}20`, marginBottom: '32px' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0c0a09' }}>{exp.poste}</div>
              <div style={{ fontSize: '11px', color: '#78716c', marginTop: '3px', marginBottom: '8px' }}>
                {[exp.entreprise, exp.periode].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#44403c', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color }}>—</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ paddingLeft: '40px', borderLeft: `2px solid ${color}40`, marginBottom: '32px' }}>
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0c0a09' }}>{f.diplome}</div>
              <div style={{ fontSize: '11px', color: '#78716c', marginTop: '3px' }}>
                {[f.etablissement, f.periode].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ paddingLeft: '20px', borderLeft: `2px solid ${color}20`, marginBottom: '32px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: '#fafaf9', border: '1px solid #f5f5f4', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#44403c' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '32px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#0c0a09' }}>{l.langue}</span>
              <span style={{ color: '#78716c' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '32px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#78716c' }}> — {c.organisme}</span>}
              {c.annee && <span style={{ color: '#a8a29e' }}> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '11px', color: '#44403c' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 13 : DOSSIER — Style rapport professionnel
// ═══════════════════════════════════════════════════════════════════
function Dossier({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  let numero = 0
  const SectionBar = ({ label }) => {
    numero += 1
    return (
      <div style={{ background: '#fafafa', padding: '9px 14px', borderLeft: `4px solid ${color}`, marginBottom: '18px', display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color, marginRight: '10px' }}>{String(numero).padStart(2, '0')}</span>
        <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#18181b' }}>{label}</span>
      </div>
    )
  }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '50px 56px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ border: '2px solid #18181b', padding: '26px 30px', marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#18181b' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && (
            <div style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '1.5px', color, marginTop: '6px' }}>
              {cvData.titre}
            </div>
          )}
          <div style={{ height: '1px', background: '#e4e4e7', marginTop: '16px', marginBottom: '14px' }} />
          {contacts.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', fontSize: '10px', color: '#52525b' }}>
              {contacts.map((c, i) => <div key={i}>{c}</div>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '24px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {experiences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <SectionBar label="Expériences" />
          <div style={{ paddingLeft: '14px' }}>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: '#a1a1aa' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#52525b', marginTop: '2px', marginBottom: '6px' }}>
                  {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#52525b', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color }}>▪</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <SectionBar label="Formations" />
          <div style={{ paddingLeft: '14px' }}>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#a1a1aa' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#52525b', marginTop: '2px' }}>{f.etablissement}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <SectionBar label="Compétences" />
          <div style={{ paddingLeft: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: '#fafafa', border: '1px solid #f4f4f5', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#3f3f46' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '28px' : 0 }}>
          <SectionBar label="Langues" />
          <div style={{ paddingLeft: '14px' }}>
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, color: '#18181b' }}>{l.langue}</span>
                <span style={{ color: '#52525b' }}> — {l.niveau}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '28px' : 0 }}>
          <SectionBar label="Certifications" />
          <div style={{ paddingLeft: '14px' }}>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#3f3f46', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#71717a' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#a1a1aa' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <SectionBar label="Centres d'intérêt" />
          <div style={{ paddingLeft: '14px', fontSize: '11px', color: '#3f3f46' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 14 : AURORE — Dégradé subtil en header
// ═══════════════════════════════════════════════════════════════════
function Aurore({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color }
  const sectionRule = { height: '3px', background: color, width: '28px', marginTop: '7px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{
        height: '165px', background: `linear-gradient(135deg, ${color} 0%, ${color}cc 55%, ${color}88 100%)`,
        padding: '40px 52px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '26px',
      }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0 }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color="#ffffff" forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div>
          <div style={{ fontSize: '29px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && (
            <div style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(255,255,255,0.9)', marginTop: '5px' }}>
              {cvData.titre}
            </div>
          )}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: 'rgba(255,255,255,0.8)', marginTop: '12px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '38px 52px', boxSizing: 'border-box' }}>
        {cvData.accroche && (
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#374151', marginBottom: '30px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{exp.entreprise}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', marginBottom: '8px' }}>
                  {[exp.periode, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Formations</div>
            <div style={sectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{f.etablissement}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{f.periode}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={sectionRule} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', background: `${color}12`, borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: certifications.length || centresInteret.length ? '30px' : 0 }}>
            <div style={sectionTitle}>Langues</div>
            <div style={sectionRule} />
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
                <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={{ marginBottom: centresInteret.length ? '30px' : 0 }}>
            <div style={sectionTitle}>Certifications</div>
            <div style={sectionRule} />
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={sectionRule} />
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 15 : REGISTRE — Colonne dates à gauche
// ═══════════════════════════════════════════════════════════════════
function Registre({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color, marginBottom: '20px' }

  const DeuxColonnes = ({ items, renderContenu }) => (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', gap: '24px', marginBottom: i < items.length - 1 ? '24px' : 0 }}>
          <div style={{ width: '96px', flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 500, color: '#171717' }}>{item.periode}</div>
          </div>
          <div style={{ width: '1px', alignSelf: 'stretch', background: '#e5e5e5', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>{renderContenu(item)}</div>
        </div>
      ))}
    </div>
  )

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '48px 54px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '30px', fontWeight: 700, color: '#171717' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color: '#737373', marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '10.5px', color: '#737373', marginTop: '15px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>
      <div style={{ height: '1px', background: '#e5e5e5', marginTop: '24px', marginBottom: '30px' }} />

      {cvData.accroche && (
        <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#404040', marginBottom: '34px' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Expériences</div>
          <DeuxColonnes items={experiences} renderContenu={(exp) => (
            <>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#171717' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', color, marginTop: '3px', marginBottom: '8px' }}>
                {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#525252', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#d4d4d4' }}>—</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )} />
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Formations</div>
          <DeuxColonnes items={formations} renderContenu={(f) => (
            <>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#171717' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{f.etablissement}</div>
            </>
          )} />
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '34px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ fontSize: '10.5px', color: '#525252', lineHeight: 1.9 }}>{competences.join(' · ')}</div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '34px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#171717' }}>{l.langue}</span>
              <span style={{ color: '#737373' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '34px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#404040', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#737373' }}> — {c.organisme}</span>}
              {c.annee && <span style={{ color: '#a3a3a3' }}> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '11px', color: '#404040' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 16 : NOCTURNE — Fond sombre élégant
// ═══════════════════════════════════════════════════════════════════
function Nocturne({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color, marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#0f172a',
      padding: '50px 56px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.6px' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color, marginTop: '6px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10.5px', color: '#94a3b8', marginTop: '16px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>
      <div style={{ height: '2px', background: color, width: '50px', marginTop: '22px', marginBottom: '30px' }} />

      {cvData.accroche && (
        <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#cbd5e1', marginBottom: '30px' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f1f5f9' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 400, color: '#94a3b8', marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px', marginBottom: '8px' }}>
                {[exp.periode, exp.lieu].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#cbd5e1', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color }}>—</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#f1f5f9' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10.5px', fontWeight: 500, color: '#e2e8f0' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '32px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{l.langue}</span>
              <span style={{ color: '#94a3b8' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '32px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#94a3b8' }}> — {c.organisme}</span>}
              {c.annee && <span style={{ color: '#64748b' }}> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 17 : COMPACT — Dense pour profils expérimentés
// ═══════════════════════════════════════════════════════════════════
function Compact({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color }
  const sectionRule = { height: '1px', background: '#e5e7eb', width: '100%', marginTop: '5px', marginBottom: '12px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '34px 40px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `2px solid ${color}`, paddingBottom: '14px', marginBottom: '20px' }}>
        <div>
          <div style={{ fontSize: '25px', fontWeight: 700, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '12.5px', color: '#6b7280', marginTop: '3px' }}>{cvData.titre}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {contacts.length > 0 && (
            <div style={{ textAlign: 'right', fontSize: '9.5px', color: '#6b7280' }}>
              {contacts.map((c, i) => <div key={i}>{c}</div>)}
            </div>
          )}
          {showPhoto && (
            <div style={{ width: 'fit-content', flexShrink: 0 }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
        </div>
      </div>

      {cvData.accroche && (
        <div style={{ fontSize: '10.5px', lineHeight: 1.5, color: '#4b5563', marginBottom: '20px' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                <div style={{ fontSize: '9.5px', color: '#9ca3af' }}>{exp.periode}</div>
              </div>
              <div style={{ fontSize: '10.5px', color, marginTop: '1px', marginBottom: '5px' }}>
                {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10px', lineHeight: 1.45, color: '#4b5563', marginBottom: '2px' }}>
                      <span style={{ marginRight: '6px' }}>·</span>{m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                <div style={{ fontSize: '9.5px', color: '#9ca3af' }}>{f.periode}</div>
              </div>
              <div style={{ fontSize: '10.5px', color, marginTop: '1px' }}>{f.etablissement}</div>
            </div>
          ))}
        </div>
      )}

      {(competences.length > 0 || langues.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: certifications.length || centresInteret.length ? '20px' : 0 }}>
          {competences.length > 0 && (
            <div>
              <div style={sectionTitle}>Compétences</div>
              <div style={sectionRule} />
              <div style={{ fontSize: '10px', color: '#4b5563', lineHeight: 1.8 }}>{competences.join(', ')}</div>
            </div>
          )}
          {langues.length > 0 && (
            <div>
              <div style={sectionTitle}>Langues</div>
              <div style={sectionRule} />
              {langues.map((l, i) => (
                <div key={i} style={{ fontSize: '10px', color: '#4b5563', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600 }}>{l.langue}</span> — {l.niveau}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {(certifications.length > 0 || centresInteret.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {certifications.length > 0 && (
            <div>
              <div style={sectionTitle}>Certifications</div>
              <div style={sectionRule} />
              {certifications.map((c, i) => (
                <div key={i} style={{ fontSize: '10px', color: '#4b5563', marginBottom: '3px' }}>
                  <span style={{ fontWeight: 600 }}>{c.titre}</span>
                  {c.organisme && <span> — {c.organisme}</span>}
                </div>
              ))}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div>
              <div style={sectionTitle}>Intérêts</div>
              <div style={sectionRule} />
              <div style={{ fontSize: '10px', color: '#4b5563', lineHeight: 1.8 }}>{centresInteret.join(', ')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 18 : VITRINE — Portfolio créatif
// ═══════════════════════════════════════════════════════════════════
function Vitrine({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville].filter(Boolean)
  const liens = [cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', color, textAlign: 'center' }
  const sectionRule = { height: '1px', background: '#e4e4e7', width: '60px', margin: '10px auto 22px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '44px 50px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '34px' }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', margin: '0 auto 16px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '34px', fontWeight: 300, color: '#18181b', letterSpacing: '-1px' }}>
          {cvData.prenom} {cvData.nom}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', margin: '14px auto' }}>
          <span style={{ width: '6px', height: '6px', background: color, display: 'inline-block' }} />
          <span style={{ width: '6px', height: '6px', background: color, display: 'inline-block' }} />
          <span style={{ width: '6px', height: '6px', background: color, display: 'inline-block' }} />
        </div>
        {cvData.titre && (
          <div style={{ fontSize: '13px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '3px', color: '#71717a' }}>
            {cvData.titre}
          </div>
        )}
        {contacts.length > 0 && (
          <div style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '14px' }}>
            {contacts.join(' / ')}
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ textAlign: 'center', maxWidth: '520px', margin: '0 auto 34px', fontSize: '12px', lineHeight: 1.75, color: '#3f3f46' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ background: '#fafafa', borderRadius: '6px', padding: '18px 20px', marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{exp.poste}</div>
              <div style={{ fontSize: '10.5px', color: '#71717a', marginTop: '3px', marginBottom: '8px' }}>
                {[exp.entreprise, exp.periode].filter(Boolean).join(' · ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#52525b', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color }}>—</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ background: '#fafafa', borderRadius: '6px', padding: '18px 20px', marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{f.diplome}</div>
              <div style={{ fontSize: '10.5px', color: '#71717a', marginTop: '3px' }}>
                {[f.etablissement, f.periode].filter(Boolean).join(' · ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: '#fafafa', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#3f3f46' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {(certifications.length > 0 || centresInteret.length > 0 || langues.length > 0) && (
        <div style={{ marginBottom: liens.length ? '32px' : 0 }}>
          {langues.length > 0 && (
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#3f3f46', marginBottom: '8px' }}>
              {langues.map(l => `${l.langue} (${l.niveau})`).join(' · ')}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#3f3f46', marginBottom: '8px' }}>
              {certifications.map(c => c.titre).join(' · ')}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ textAlign: 'center', fontSize: '11px', color: '#71717a' }}>
              {centresInteret.join(' · ')}
            </div>
          )}
        </div>
      )}

      {liens.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          {liens.map((l, i) => (
            <span key={i} style={{ padding: '5px 14px', background: `${color}12`, borderRadius: '20px', fontSize: '10px', fontWeight: 600, color }}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 19 : TERRAIN — Secteur technique et BTP
// ═══════════════════════════════════════════════════════════════════
function Terrain({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const SectionBar = ({ label }) => (
    <div style={{ background: '#f4f4f5', padding: '8px 14px', marginBottom: '16px', borderLeft: `4px solid ${color}` }}>
      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#18181b' }}>{label}</span>
    </div>
  )

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ background: '#18181b', padding: '32px 48px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: '24px' }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0 }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && (
            <div style={{ fontSize: '13px', fontWeight: 500, color, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {cvData.titre}
            </div>
          )}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '14px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
      </div>

      {certifications.length > 0 && (
        <div style={{ background: color, padding: '12px 48px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>
            Habilitations et certifications
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {certifications.map((c, i) => (
              <span key={i} style={{ padding: '3px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '3px', fontSize: '10px', fontWeight: 600, color: '#ffffff' }}>
                {c.titre}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ padding: '34px 48px', boxSizing: 'border-box' }}>
        {cvData.accroche && (
          <div style={{ fontSize: '11.5px', lineHeight: 1.65, color: '#3f3f46', marginBottom: '26px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <SectionBar label="Expériences" />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#18181b', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#52525b', marginTop: '3px' }}>{exp.entreprise}</div>
                <div style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '2px', marginBottom: '8px' }}>
                  {[exp.periode, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '16px', fontSize: '10.5px', lineHeight: 1.6, color: '#3f3f46', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color }}>▸</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <SectionBar label="Formations" />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#18181b' }}>{f.diplome}</div>
                <div style={{ fontSize: '11.5px', color: '#52525b', marginTop: '3px' }}>
                  {[f.etablissement, f.periode].filter(Boolean).join(' · ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <SectionBar label="Compétences" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', background: '#f4f4f5', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#3f3f46' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: centresInteret.length ? '26px' : 0 }}>
            <SectionBar label="Langues" />
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#3f3f46', marginBottom: '5px' }}>
                <span style={{ fontWeight: 700 }}>{l.langue}</span> — {l.niveau}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <SectionBar label="Centres d'intérêt" />
            <div style={{ fontSize: '11px', color: '#3f3f46' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 20 : SOIN — Secteur santé et social
// ═══════════════════════════════════════════════════════════════════
function Soin({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const numeroPro = certifications.find(c => /rpps|adeli/i.test(c.titre || ''))
  const autresCertifications = certifications.filter(c => c !== numeroPro)

  const leftSectionTitle = { fontSize: '9.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color, marginBottom: '9px' }
  const leftSectionRule = { height: '1px', background: `${color}25`, marginBottom: '11px' }
  const rightSectionTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#134e4a' }
  const rightSectionRule = { height: '2px', background: color, width: '30px', marginTop: '7px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ width: '250px', flexShrink: 0, background: `${color}08`, padding: '34px 26px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', margin: '0 auto 20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={96} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '19px', fontWeight: 700, color: '#134e4a', textAlign: 'center', lineHeight: 1.3 }}>
          {cvData.prenom} {cvData.nom}
        </div>
        {cvData.titre && (
          <div style={{ fontSize: '11px', fontWeight: 500, color, textAlign: 'center', marginTop: '4px', marginBottom: '26px' }}>
            {cvData.titre}
          </div>
        )}

        {contacts.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={leftSectionTitle}>Contact</div>
            <div style={leftSectionRule} />
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.6 }}>{c}</div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={leftSectionTitle}>Diplômes</div>
            <div style={leftSectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.6, marginBottom: i < formations.length - 1 ? '6px' : 0 }}>
                {f.diplome}{f.periode && ` — ${f.periode}`}
              </div>
            ))}
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={leftSectionTitle}>Langues</div>
            <div style={leftSectionRule} />
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '10.5px', color: '#374151', lineHeight: 1.6, marginBottom: '4px' }}>
                <span style={{ fontWeight: 600 }}>{l.langue}</span> — {l.niveau}
              </div>
            ))}
          </div>
        )}

        {numeroPro && (
          <div style={{ background: '#ffffff', padding: '10px', borderRadius: '4px', border: `1px solid ${color}25` }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#134e4a' }}>
              {numeroPro.titre}{numeroPro.organisme && ` : ${numeroPro.organisme}`}
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, background: '#ffffff', padding: '38px 34px', boxSizing: 'border-box', minWidth: 0 }}>
        {cvData.accroche && (
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#4b5563', marginBottom: '28px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={rightSectionTitle}>Expériences</div>
            <div style={rightSectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#134e4a' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 500, color, marginTop: '3px' }}>{exp.entreprise}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', marginBottom: '8px' }}>
                  {[exp.periode, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={rightSectionTitle}>Compétences</div>
            <div style={rightSectionRule} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#374151' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {autresCertifications.length > 0 && (
          <div style={{ marginBottom: centresInteret.length ? '28px' : 0 }}>
            <div style={rightSectionTitle}>Certifications</div>
            <div style={rightSectionRule} />
            {autresCertifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={rightSectionTitle}>Centres d'intérêt</div>
            <div style={rightSectionRule} />
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 21 : PARALLÈLE — Deux colonnes égales
// ═══════════════════════════════════════════════════════════════════
function Parallele({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color, marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '44px 48px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center' }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', margin: '0 auto 18px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={96} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '30px', fontWeight: 700, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color, marginTop: '5px' }}>{cvData.titre}</div>}
        {contacts.length > 0 && (
          <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '14px' }}>{contacts.join(' · ')}</div>
        )}
      </div>
      <div style={{ height: '1px', background: '#e5e7eb', marginTop: '24px', marginBottom: '28px' }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '36px' }}>
        <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '36px' }}>
          {cvData.accroche && (
            <div style={{ marginBottom: '26px' }}>
              <div style={sectionTitle}>Profil</div>
              <div style={{ fontSize: '11px', lineHeight: 1.6, color: '#374151' }}>{cvData.accroche}</div>
            </div>
          )}
          {experiences.length > 0 && (
            <div>
              <div style={sectionTitle}>Expériences</div>
              {experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{exp.entreprise}</div>
                  <div style={{ fontSize: '9.5px', color: '#9ca3af', marginTop: '2px', marginBottom: '7px' }}>{exp.periode}</div>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {exp.missions.map((m, j) => (
                        <li key={j} style={{ position: 'relative', paddingLeft: '12px', fontSize: '10px', lineHeight: 1.55, color: '#4b5563', marginBottom: '3px' }}>
                          <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {formations.length > 0 && (
            <div style={{ marginBottom: '26px' }}>
              <div style={sectionTitle}>Formations</div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{f.etablissement}</div>
                  <div style={{ fontSize: '9.5px', color: '#9ca3af', marginTop: '2px' }}>{f.periode}</div>
                </div>
              ))}
            </div>
          )}
          {competences.length > 0 && (
            <div style={{ marginBottom: '26px' }}>
              <div style={sectionTitle}>Compétences</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {competences.map((c, i) => (
                  <span key={i} style={{ padding: '4px 10px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10px', fontWeight: 500, color: '#374151' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {langues.length > 0 && (
            <div style={{ marginBottom: certifications.length || centresInteret.length ? '26px' : 0 }}>
              <div style={sectionTitle}>Langues</div>
              {langues.map((l, i) => (
                <div key={i} style={{ fontSize: '10.5px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
                  <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
                </div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ marginBottom: centresInteret.length ? '26px' : 0 }}>
              <div style={sectionTitle}>Certifications</div>
              {certifications.map((c, i) => (
                <div key={i} style={{ fontSize: '10.5px', color: '#374151', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600 }}>{c.titre}</span>
                  {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
                </div>
              ))}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={{ fontSize: '10.5px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 22 : MOSAÏQUE — Blocs de tailles variables
// ═══════════════════════════════════════════════════════════════════
function Mosaique({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '38px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '14px',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ background: '#111827', borderRadius: '10px', padding: '26px 32px', boxSizing: 'border-box', minHeight: '118px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {showPhoto && (
            <div style={{ width: 'fit-content', flexShrink: 0 }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={96} color="#ffffff" forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
          <div>
            <div style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{cvData.titre}</div>}
          </div>
        </div>
        {contacts.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '3px' }}>{c}</div>
            ))}
          </div>
        )}
      </div>

      {(cvData.accroche || langues.length > 0) && (
        <div style={{ display: 'flex', gap: '14px', alignItems: 'stretch' }}>
          {cvData.accroche && (
            <div style={{ flex: 3, background: '#f9fafb', borderRadius: '10px', padding: '22px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '11px', lineHeight: 1.6, color: '#374151' }}>{cvData.accroche}</div>
            </div>
          )}
          {langues.length > 0 && (
            <div style={{ flex: 1, background: color, borderRadius: '10px', padding: '22px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>LANGUES</div>
              {langues.map((l, i) => (
                <div key={i} style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#ffffff' }}>{l.langue}</div>
                  <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.7)' }}>{l.niveau}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ background: '#ffffff', border: '1px solid #f3f4f6', borderRadius: '10px', padding: '26px', boxSizing: 'border-box' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#111827', marginBottom: '18px' }}>
            Expériences
          </div>
          {experiences.map((exp, i) => (
            <div key={i} style={{
              marginBottom: i < experiences.length - 1 ? '18px' : 0,
              paddingBottom: i < experiences.length - 1 ? '18px' : 0,
              borderBottom: i < experiences.length - 1 ? '1px solid #fafafa' : 'none',
            }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#6b7280', marginTop: '3px' }}>
                <span>{exp.entreprise}</span>
                <span>{exp.periode}</span>
              </div>
              {exp.missions?.length > 0 && (
                <div style={{ marginTop: '7px' }}>
                  {exp.missions.map((m, j) => (
                    <div key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563' }}>— {m}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(formations.length > 0 || competences.length > 0) && (
        <div style={{ display: 'flex', gap: '14px' }}>
          {formations.length > 0 && (
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: '10px', padding: '22px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '12px' }}>Formations</div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>{f.etablissement}</div>
                </div>
              ))}
            </div>
          )}
          {competences.length > 0 && (
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: '10px', padding: '22px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '12px' }}>Compétences</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {competences.map((c, i) => (
                  <span key={i} style={{ padding: '4px 10px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '9.5px', color: '#374151' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {(certifications.length > 0 || centresInteret.length > 0) && (
        <div style={{ display: 'flex', gap: '14px' }}>
          {certifications.length > 0 && (
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: '10px', padding: '22px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '12px' }}>Certifications</div>
              {certifications.map((c, i) => (
                <div key={i} style={{ fontSize: '10px', color: '#374151', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600 }}>{c.titre}</span>
                  {c.organisme && <span> — {c.organisme}</span>}
                </div>
              ))}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, background: '#f9fafb', borderRadius: '10px', padding: '22px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '12px' }}>Intérêts</div>
              <div style={{ fontSize: '10px', color: '#374151', lineHeight: 1.6 }}>{centresInteret.join(', ')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 23 : ANGLE — Formes géométriques
// ═══════════════════════════════════════════════════════════════════
function Angle({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const SectionTitle = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
      <span style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `8px solid ${color}`, marginRight: '10px' }} />
      <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#18181b' }}>{children}</span>
    </div>
  )

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      position: 'relative', overflow: 'hidden', fontFamily: '"Inter", sans-serif', boxSizing: 'border-box',
    }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 0, height: 0, borderTop: `130px solid ${color}`, borderLeft: '130px solid transparent', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '160px', height: '160px', borderRadius: '50%', background: `${color}0a`, zIndex: 0 }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '48px 52px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          {showPhoto && (
            <div style={{ width: 'fit-content', flexShrink: 0 }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
          <div>
            <div style={{ fontSize: '31px', fontWeight: 700, color: '#18181b' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 500, color, marginTop: '5px' }}>{cvData.titre}</div>}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10.5px', color: '#71717a', marginTop: '15px' }}>
                {contacts.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
        </div>

        {cvData.accroche && (
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#3f3f46', paddingLeft: '18px', borderLeft: `3px solid ${color}`, marginBottom: '30px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <SectionTitle>Expériences</SectionTitle>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{exp.entreprise}</div>
                <div style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#52525b', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d4d4d8' }}>—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <SectionTitle>Formations</SectionTitle>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{f.diplome}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{f.etablissement}</div>
                <div style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '2px' }}>{f.periode}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <SectionTitle>Compétences</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', background: '#fafafa', border: '1px solid #f4f4f5', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#3f3f46' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: certifications.length || centresInteret.length ? '30px' : 0 }}>
            <SectionTitle>Langues</SectionTitle>
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, color: '#18181b' }}>{l.langue}</span>
                <span style={{ color: '#71717a' }}> — {l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={{ marginBottom: centresInteret.length ? '30px' : 0 }}>
            <SectionTitle>Certifications</SectionTitle>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#3f3f46', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#71717a' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#a1a1aa' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <SectionTitle>Centres d'intérêt</SectionTitle>
            <div style={{ fontSize: '11px', color: '#3f3f46' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 24 : COLONNE — Sidebar très fine
// ═══════════════════════════════════════════════════════════════════
function Colonne({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sideTitle = { fontSize: '8.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#9ca3af', marginBottom: '8px' }
  const mainSectionTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827' }
  const mainSectionRule = { height: '2px', background: color, width: '34px', marginTop: '7px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ width: '180px', flexShrink: 0, background: '#fafafa', padding: '34px 20px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', margin: '0 auto 18px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={96} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', textAlign: 'center', lineHeight: 1.3 }}>
          {cvData.prenom} {cvData.nom}
        </div>
        {cvData.titre && (
          <div style={{ fontSize: '10px', fontWeight: 500, color, textAlign: 'center', marginTop: '4px', marginBottom: '24px' }}>
            {cvData.titre}
          </div>
        )}

        {contacts.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div style={sideTitle}>Contact</div>
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: '9.5px', color: '#4b5563', lineHeight: 1.55 }}>{c}</div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div style={sideTitle}>Compétences</div>
            <div style={{ fontSize: '9.5px', color: '#4b5563', lineHeight: 1.55 }}>{competences.join(', ')}</div>
          </div>
        )}

        {langues.length > 0 && (
          <div>
            <div style={sideTitle}>Langues</div>
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '9.5px', color: '#4b5563', lineHeight: 1.55, marginBottom: '3px' }}>
                {l.langue} — {l.niveau}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, background: '#ffffff', padding: '40px 38px', boxSizing: 'border-box', minWidth: 0 }}>
        {cvData.accroche && (
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#4b5563', marginBottom: '28px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={mainSectionTitle}>Expériences</div>
            <div style={mainSectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px' }}>{exp.entreprise}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', marginBottom: '9px' }}>
                  {[exp.periode, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.65, color: '#4b5563', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={mainSectionTitle}>Formations</div>
            <div style={mainSectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '18px' : 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px' }}>{f.etablissement}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{f.periode}</div>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={{ marginBottom: centresInteret.length ? '28px' : 0 }}>
            <div style={mainSectionTitle}>Certifications</div>
            <div style={mainSectionRule} />
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={mainSectionTitle}>Centres d'intérêt</div>
            <div style={mainSectionRule} />
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 25 : ÉTAPE — Numérotation forte
// ═══════════════════════════════════════════════════════════════════
function Etape({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  let numero = 0
  const Section = ({ label, children }) => {
    numero += 1
    return (
      <div style={{ display: 'flex', gap: '20px', marginBottom: '34px' }}>
        <div style={{ fontSize: '42px', fontWeight: 200, color: `${color}35`, lineHeight: 1, width: '56px', flexShrink: 0 }}>
          {String(numero).padStart(2, '0')}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#0a0a0a', marginBottom: '4px' }}>{label}</div>
          <div style={{ height: '2px', background: color, width: '100%', marginBottom: '16px' }} />
          {children}
        </div>
      </div>
    )
  }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '46px 54px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '36px' }}>
        <div>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#0a0a0a' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color: '#737373', marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '10.5px', color: '#737373', marginTop: '15px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {cvData.accroche && (
        <Section label="Profil">
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#525252' }}>{cvData.accroche}</div>
        </Section>
      )}

      {experiences.length > 0 && (
        <Section label="Expériences">
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0a0a0a' }}>{exp.poste}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#737373', marginTop: '3px', marginBottom: '8px' }}>
                <span>{exp.entreprise}</span>
                <span>{exp.periode}</span>
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#525252', marginBottom: '3px' }}>— {m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {formations.length > 0 && (
        <Section label="Formations">
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0a0a0a' }}>{f.diplome}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#737373', marginTop: '3px' }}>
                <span>{f.etablissement}</span>
                <span>{f.periode}</span>
              </div>
            </div>
          ))}
        </Section>
      )}

      {competences.length > 0 && (
        <Section label="Compétences">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: '#fafafa', border: '1px solid #f5f5f5', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#404040' }}>
                {c}
              </span>
            ))}
          </div>
        </Section>
      )}

      {langues.length > 0 && (
        <Section label="Langues">
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#0a0a0a' }}>{l.langue}</span>
              <span style={{ color: '#737373' }}> — {l.niveau}</span>
            </div>
          ))}
        </Section>
      )}

      {certifications.length > 0 && (
        <Section label="Certifications">
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#525252', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#737373' }}> — {c.organisme}</span>}
            </div>
          ))}
        </Section>
      )}

      {centresInteret.length > 0 && (
        <Section label="Centres d'intérêt">
          <div style={{ fontSize: '11px', color: '#525252' }}>{centresInteret.join(' · ')}</div>
        </Section>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 26 : FOCUS — Accroche mise en avant
// ═══════════════════════════════════════════════════════════════════
function Focus({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color }
  const sectionRule = { height: '1px', background: '#e5e7eb', width: '100%', marginTop: '7px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '46px 52px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '26px' }}>
        <div>
          <div style={{ fontSize: '27px', fontWeight: 600, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 400, color: '#6b7280', marginTop: '4px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#9ca3af', marginTop: '12px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ background: color, padding: '28px 32px', borderRadius: '6px', marginBottom: '32px' }}>
          <div style={{ fontSize: '13px', fontWeight: 400, lineHeight: 1.7, color: '#ffffff' }}>{cvData.accroche}</div>
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#4b5563', marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                      {m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#4b5563', marginTop: '3px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          {competences.map((c, i) => (
            <div key={i} style={{ marginBottom: '9px' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>{c}</div>
              <div style={{ height: '4px', background: '#f3f4f6', borderRadius: '2px' }}>
                <div style={{ height: '4px', background: color, width: '80%', borderRadius: '2px' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '30px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={sectionRule} />
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
              <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '30px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={sectionRule} />
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
              {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 27 : SOBRE — Ultra classique français
// ═══════════════════════════════════════════════════════════════════
function Sobre({ cvData }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontFamily: 'Georgia, serif', fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#000000' }
  const sectionRule = { height: '1px', background: '#666666', width: '100%', marginTop: '5px', marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '55px 62px', boxSizing: 'border-box', fontFamily: 'Georgia, serif', overflow: 'hidden',
    }}>
      <div style={{ textAlign: 'center' }}>
        {showPhoto && (
          <div style={{ width: 'fit-content', margin: '0 auto 14px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color="#000000" forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#000000', letterSpacing: '0.5px' }}>
          {cvData.prenom} {cvData.nom}
        </div>
        {cvData.titre && (
          <div style={{ fontSize: '14px', fontWeight: 400, fontStyle: 'italic', color: '#333333', marginTop: '6px' }}>
            {cvData.titre}
          </div>
        )}
        {contacts.length > 0 && (
          <div style={{ fontSize: '10.5px', color: '#444444', marginTop: '14px' }}>
            {contacts.join(' — ')}
          </div>
        )}
      </div>
      <div style={{ marginTop: '20px', marginBottom: '26px' }}>
        <div style={{ height: '2px', background: '#000000' }} />
        <div style={{ height: '1px', background: '#000000', marginTop: '3px' }} />
      </div>

      {cvData.accroche && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}>Profil</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#222222' }}>{cvData.accroche}</div>
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}>Expérience professionnelle</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000' }}>{exp.poste}</div>
                <div style={{ fontSize: '10.5px', color: '#444444' }}>{exp.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#333333', marginTop: '2px', marginBottom: '7px' }}>
                {[exp.entreprise, exp.lieu].filter(Boolean).join(', ')}
              </div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#222222', marginBottom: '3px' }}>
                      <span style={{ marginRight: '8px' }}>•</span>{m}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}>Formation</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#000000' }}>{f.diplome}</div>
                <div style={{ fontSize: '10.5px', color: '#444444' }}>{f.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#333333', marginTop: '2px' }}>
                {[f.etablissement, f.mention].filter(Boolean).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#222222' }}>{competences.join(', ')}</div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '26px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#222222' }}>
            {langues.map(l => `${l.langue} (${l.niveau})`).join(', ')}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '26px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#222222' }}>
            {certifications.map(c => [c.titre, c.organisme].filter(Boolean).join(' — ')).join(', ')}
          </div>
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#222222' }}>{centresInteret.join(', ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 28 : DUO — Header divisé en deux
// ═══════════════════════════════════════════════════════════════════
function Duo({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const SectionTitle = ({ children }) => (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '17px' }}>
      <span style={{ width: '7px', height: '7px', background: color, marginRight: '9px', flexShrink: 0 }} />
      <span style={{ fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#111827' }}>{children}</span>
    </div>
  )

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', height: '150px' }}>
        <div style={{ width: '42%', background: color, padding: '32px 28px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {showPhoto && (
            <div style={{ width: 'fit-content' }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={78} color="#ffffff" forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
        </div>
        <div style={{ width: '58%', background: '#ffffff', padding: '32px 30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 400, color, marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              {contacts.map((c, i) => (
                <div key={i} style={{ fontSize: '10px', color: '#6b7280', marginBottom: '3px' }}>{c}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '36px 48px', boxSizing: 'border-box' }}>
        {cvData.accroche && (
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#4b5563', marginBottom: '28px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <SectionTitle>Expériences</SectionTitle>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{exp.entreprise}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <SectionTitle>Formations</SectionTitle>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{f.etablissement}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{f.periode}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <SectionTitle>Compétences</SectionTitle>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#374151' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: certifications.length || centresInteret.length ? '28px' : 0 }}>
            <SectionTitle>Langues</SectionTitle>
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
                <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={{ marginBottom: centresInteret.length ? '28px' : 0 }}>
            <SectionTitle>Certifications</SectionTitle>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#9ca3af' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <SectionTitle>Centres d'intérêt</SectionTitle>
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 29 : CHIFFRE — Résultats en évidence
// ═══════════════════════════════════════════════════════════════════
function Chiffre({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  // Met en valeur chiffres, pourcentages et montants dans le texte d'une mission
  const highlightNumbers = (text) => {
    const RE = /\d+[\d\s,.]*\s*(?:%|€|k€|M€|K|M)?/g
    const str = String(text)
    const parts = []
    let lastIndex = 0
    let key = 0
    for (const match of str.matchAll(RE)) {
      if (match.index > lastIndex) parts.push(<span key={key++}>{str.slice(lastIndex, match.index)}</span>)
      parts.push(<strong key={key++} style={{ fontWeight: 700, color }}>{match[0]}</strong>)
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < str.length) parts.push(<span key={key++}>{str.slice(lastIndex)}</span>)
    return parts.length > 0 ? parts : str
  }

  // Extrait jusqu'à 3 statistiques marquantes (pourcentages / montants) des missions
  const STAT_RE = /\d+[\d\s,.]*\s*(?:%|k€|M€|€)/g
  const stats = []
  outer:
  for (const exp of experiences) {
    for (const m of exp.missions || []) {
      for (const match of String(m).matchAll(STAT_RE)) {
        if (stats.length >= 3) break outer
        const label = String(m).slice(0, 42).trim() + (m.length > 42 ? '…' : '')
        stats.push({ chiffre: match[0].trim(), label })
      }
    }
  }

  const sectionTitle = { fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color }
  const sectionRule = { height: '2px', background: color, width: '32px', marginTop: '7px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '44px 52px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '26px' }}>
        <div>
          <div style={{ fontSize: '29px', fontWeight: 700, color: '#0c0a09' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 500, color, marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10.5px', color: '#78716c', marginTop: '14px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {stats.length > 0 && (
        <div style={{ background: `${color}0d`, borderRadius: '8px', padding: '20px 24px', marginBottom: '28px', display: 'flex', justifyContent: 'space-around' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color }}>{s.chiffre}</div>
              <div style={{ fontSize: '9.5px', color: '#78716c', marginTop: '3px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#44403c', marginBottom: '28px' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0c0a09' }}>{exp.poste}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#57534e', marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px', marginBottom: '9px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#44403c', marginBottom: '4px' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#d6d3d1' }}>—</span>
                      {highlightNumbers(m)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0c0a09' }}>{f.diplome}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#57534e', marginTop: '3px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: '#fafaf9', border: '1px solid #f5f5f4', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#44403c' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '28px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={sectionRule} />
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#0c0a09' }}>{l.langue}</span>
              <span style={{ color: '#78716c' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '28px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={sectionRule} />
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#78716c' }}> — {c.organisme}</span>}
              {c.annee && <span style={{ color: '#a8a29e' }}> ({c.annee})</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', color: '#44403c' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 30 : ARCHIVE — Style académique
// ═══════════════════════════════════════════════════════════════════
function Archive({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontFamily: '"Source Serif 4", serif', fontSize: '15px', fontWeight: 600, color: '#1c1917', marginBottom: '14px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '52px 58px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: '28px', fontWeight: 600, color: '#1c1917' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 400, color: '#57534e', marginTop: '5px' }}>{cvData.titre}</div>}
          {experiences[0]?.entreprise && (
            <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#78716c', marginTop: '3px' }}>{experiences[0].entreprise}</div>
          )}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#78716c', marginTop: '14px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>
      <div style={{ height: '1px', background: '#d6d3d1', marginTop: '22px', marginBottom: '26px' }} />

      {formations.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Formation</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1c1917' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#57534e', marginTop: '2px' }}>{f.etablissement}</div>
              {f.periode && <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px' }}>{f.periode}</div>}
              {(f.mention || f.description) && (
                <div style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#44403c', marginTop: '5px' }}>
                  {[f.mention, f.description].filter(Boolean).join(' — ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Expérience</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1c1917' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#57534e', marginTop: '2px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px', marginBottom: '7px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.65, color: '#44403c', marginBottom: '3px' }}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Publications et certifications</div>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#44403c', marginBottom: '7px' }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color, marginRight: '8px' }}>{i + 1}.</span>
              {[c.titre, c.organisme, c.annee].filter(Boolean).join(', ')}
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#44403c' }}>{competences.join(', ')}</div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '28px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#44403c' }}>
            {langues.map(l => `${l.langue} (${l.niveau})`).join(', ')}
          </div>
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#44403c' }}>{centresInteret.join(', ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 31 : RUBAN — Bande verticale de couleur
// ═══════════════════════════════════════════════════════════════════
function Ruban({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color: '#18181b' }
  const sectionRule = { height: '3px', background: color, width: '26px', marginTop: '7px', marginBottom: '17px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      position: 'relative', fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '14px', background: `linear-gradient(180deg, ${color} 0%, ${color}66 100%)` }} />

      <div style={{ paddingLeft: '58px', paddingRight: '50px', paddingTop: '46px', paddingBottom: '46px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <div style={{ fontSize: '30px', fontWeight: 700, color: '#18181b' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color, marginTop: '5px' }}>{cvData.titre}</div>}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10.5px', color: '#71717a', marginTop: '15px' }}>
                {contacts.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
          {showPhoto && (
            <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
        </div>

        {cvData.accroche && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Profil</div>
            <div style={sectionRule} />
            <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#3f3f46' }}>{cvData.accroche}</div>
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#18181b' }}>{exp.poste}</div>
                <div style={{ fontSize: '12px', color, marginTop: '3px' }}>{exp.entreprise}</div>
                <div style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '10.5px', lineHeight: 1.6, color: '#52525b', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d4d4d8' }}>—</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Formations</div>
            <div style={sectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#18181b' }}>{f.diplome}</div>
                <div style={{ fontSize: '12px', color, marginTop: '3px' }}>{f.etablissement}</div>
                <div style={{ fontSize: '10px', color: '#a1a1aa', marginTop: '2px' }}>{f.periode}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={sectionRule} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', background: '#fafafa', border: '1px solid #f4f4f5', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#3f3f46' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: certifications.length || centresInteret.length ? '30px' : 0 }}>
            <div style={sectionTitle}>Langues</div>
            <div style={sectionRule} />
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, color: '#18181b' }}>{l.langue}</span>
                <span style={{ color: '#71717a' }}> — {l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={{ marginBottom: centresInteret.length ? '30px' : 0 }}>
            <div style={sectionTitle}>Certifications</div>
            <div style={sectionRule} />
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#3f3f46', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#71717a' }}> — {c.organisme}</span>}
                {c.annee && <span style={{ color: '#a1a1aa' }}> ({c.annee})</span>}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={sectionRule} />
            <div style={{ fontSize: '11px', color: '#3f3f46' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 32 : PLAN — Grille stricte
// ═══════════════════════════════════════════════════════════════════
function Plan({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color, marginBottom: '14px' }
  const sep = { borderTop: '1px solid #f4f4f5', paddingTop: '20px', marginTop: '20px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '46px 50px', boxSizing: 'border-box', display: 'grid', gap: 0, alignContent: 'start',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ paddingBottom: '22px', borderBottom: '2px solid #18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '29px', fontWeight: 700, color: '#18181b' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13.5px', fontWeight: 400, color: '#52525b', marginTop: '4px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#71717a', marginTop: '12px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 0 }}>
        <div style={{ paddingRight: '32px', paddingTop: '26px', borderRight: '1px solid #e4e4e7', minWidth: 0 }}>
          {cvData.accroche && (
            <div>
              <div style={sectionTitle}>Profil</div>
              <div style={{ fontSize: '11px', lineHeight: 1.65, color: '#3f3f46' }}>{cvData.accroche}</div>
            </div>
          )}
          {experiences.length > 0 && (
            <div style={cvData.accroche ? sep : undefined}>
              <div style={sectionTitle}>Expériences</div>
              {experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{exp.poste}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#71717a', marginTop: '3px' }}>
                    <span>{exp.entreprise}</span>
                    <span>{exp.periode}</span>
                  </div>
                  {exp.missions?.length > 0 && (
                    <div style={{ marginTop: '7px' }}>
                      {exp.missions.map((m, j) => (
                        <div key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#3f3f46' }}>— {m}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {formations.length > 0 && (
            <div style={cvData.accroche || experiences.length ? sep : undefined}>
              <div style={sectionTitle}>Formations</div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{f.diplome}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#71717a', marginTop: '3px' }}>
                    <span>{f.etablissement}</span>
                    <span>{f.periode}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ paddingLeft: '32px', paddingTop: '26px', minWidth: 0 }}>
          {competences.length > 0 && (
            <div>
              <div style={sectionTitle}>Compétences</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {competences.map((c, i) => (
                  <span key={i} style={{ padding: '4px 9px', background: '#fafafa', border: '1px solid #f4f4f5', borderRadius: '3px', fontSize: '9.5px', fontWeight: 500, color: '#3f3f46' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}
          {langues.length > 0 && (
            <div style={competences.length ? sep : undefined}>
              <div style={sectionTitle}>Langues</div>
              {langues.map((l, i) => (
                <div key={i} style={{ fontSize: '10.5px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600, color: '#18181b' }}>{l.langue}</span>
                  <span style={{ color: '#71717a' }}> — {l.niveau}</span>
                </div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={competences.length || langues.length ? sep : undefined}>
              <div style={sectionTitle}>Certifications</div>
              {certifications.map((c, i) => (
                <div key={i} style={{ fontSize: '10.5px', color: '#3f3f46', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600 }}>{c.titre}</span>
                  {c.organisme && <span style={{ color: '#71717a' }}> — {c.organisme}</span>}
                </div>
              ))}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={competences.length || langues.length || certifications.length ? sep : undefined}>
              <div style={sectionTitle}>Intérêts</div>
              <div style={{ fontSize: '10.5px', color: '#3f3f46' }}>{centresInteret.join(', ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 33 : CLARTÉ — Blanc et typographie seule
// ═══════════════════════════════════════════════════════════════════
function Clarte({ cvData }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '10px', fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#a3a3a3', marginBottom: '22px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '64px 70px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '46px' }}>
        <div>
          <div style={{ fontSize: '38px', fontWeight: 300, color: '#000000', letterSpacing: '-1.2px', lineHeight: 1.1 }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && <div style={{ fontSize: '15px', fontWeight: 400, color: '#737373', marginTop: '10px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap', fontSize: '10.5px', fontWeight: 400, color: '#a3a3a3', marginTop: '20px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color="#000000" forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ marginBottom: '42px' }}>
          <div style={sectionTitle}>Profil</div>
          <div style={{ fontSize: '11px', lineHeight: 1.75, color: '#404040' }}>{cvData.accroche}</div>
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '42px' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '28px' : 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#000000' }}>{exp.poste}</div>
              <div style={{ fontSize: '12px', fontWeight: 400, color: '#525252', marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10.5px', fontWeight: 400, color: '#a3a3a3', marginTop: '3px', marginBottom: '11px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && exp.missions.map((m, j) => (
                <div key={j} style={{ fontSize: '11px', fontWeight: 400, lineHeight: 1.75, color: '#404040', marginBottom: '6px' }}>{m}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '42px' }}>
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '20px' : 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#000000' }}>{f.diplome}</div>
              <div style={{ fontSize: '12px', fontWeight: 400, color: '#525252', marginTop: '3px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '10.5px', fontWeight: 400, color: '#a3a3a3', marginTop: '3px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '42px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ fontSize: '11px', fontWeight: 400, color: '#525252', lineHeight: 1.9 }}>{competences.join(' / ')}</div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '42px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={{ fontSize: '11px', fontWeight: 400, color: '#525252', lineHeight: 1.9 }}>
            {langues.map(l => `${l.langue} (${l.niveau})`).join(' / ')}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '42px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={{ fontSize: '11px', fontWeight: 400, color: '#525252', lineHeight: 1.9 }}>
            {certifications.map(c => [c.titre, c.organisme].filter(Boolean).join(', ')).join(' / ')}
          </div>
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '11px', fontWeight: 400, color: '#525252', lineHeight: 1.9 }}>{centresInteret.join(' / ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 34 : SIGNATURE — Nom surdimensionné
// ═══════════════════════════════════════════════════════════════════
function Signature({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const nomComplet = `${cvData.prenom || ''} ${cvData.nom || ''}`.trim()
  const nomFontSize = nomComplet.length > 18 ? '42px' : '52px'
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const sectionTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#0a0a0a', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '42px 50px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: nomFontSize, fontWeight: 800, color: '#0a0a0a', letterSpacing: '-2.5px', lineHeight: 0.95 }}>
            {nomComplet}
          </div>
          {cvData.titre && <div style={{ fontSize: '15px', fontWeight: 500, color, marginTop: '12px', letterSpacing: '0.5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10.5px', color: '#737373', marginTop: '16px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>
      <div style={{ height: '5px', background: color, width: '90px', marginTop: '24px', marginBottom: '32px' }} />

      {cvData.accroche && (
        <div style={{ fontSize: '12px', lineHeight: 1.7, color: '#404040', marginBottom: '32px' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0a0a0a' }}>{exp.poste}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#a3a3a3', marginTop: '2px', marginBottom: '9px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#525252', marginBottom: '3px' }}>— {m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0a0a0a' }}>{f.diplome}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '10px', color: '#a3a3a3', marginTop: '2px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: '#fafafa', border: '1px solid #f5f5f5', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#404040' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '32px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#0a0a0a' }}>{l.langue}</span>
              <span style={{ color: '#737373' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '32px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#525252', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#737373' }}> — {c.organisme}</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '11px', color: '#525252' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 35 : CADRE — Encadrements multiples
// ═══════════════════════════════════════════════════════════════════
function Cadre({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const box = { background: '#fafaf9', border: '1px solid #f5f5f4', borderRadius: '4px', padding: '18px 20px', marginBottom: '16px' }
  const boxTitle = { fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color, marginBottom: '14px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#f5f5f4',
      padding: '30px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{
        background: '#ffffff', padding: '42px 46px', boxSizing: 'border-box',
        border: '1px solid #e7e5e4', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', minHeight: 'calc(1123px - 60px)',
      }}>
        <div style={{ textAlign: 'center', paddingBottom: '22px', borderBottom: '1px solid #e7e5e4', marginBottom: '28px' }}>
          {showPhoto && (
            <div style={{ width: 'fit-content', margin: '0 auto 14px' }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#1c1917' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 400, color, marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ fontSize: '10px', color: '#78716c', marginTop: '13px' }}>{contacts.join(' · ')}</div>
          )}
        </div>

        {cvData.accroche && (
          <div style={box}>
            <div style={boxTitle}>Profil</div>
            <div style={{ fontSize: '11px', lineHeight: 1.65, color: '#44403c' }}>{cvData.accroche}</div>
          </div>
        )}

        {experiences.length > 0 && (
          <div style={box}>
            <div style={boxTitle}>Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{
                marginBottom: i < experiences.length - 1 ? '15px' : 0,
                paddingBottom: i < experiences.length - 1 ? '15px' : 0,
                borderBottom: i < experiences.length - 1 ? '1px solid #f5f5f4' : 'none',
              }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1c1917' }}>{exp.poste}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#78716c', marginTop: '3px' }}>
                  <span>{exp.entreprise}</span>
                  <span>{exp.periode}</span>
                </div>
                {exp.missions?.length > 0 && (
                  <div style={{ marginTop: '7px' }}>
                    {exp.missions.map((m, j) => (
                      <div key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#44403c' }}>— {m}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={box}>
            <div style={boxTitle}>Formations</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1c1917' }}>{f.diplome}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#78716c', marginTop: '3px' }}>
                  <span>{f.etablissement}</span>
                  <span>{f.periode}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={box}>
            <div style={boxTitle}>Compétences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '4px 10px', background: '#ffffff', border: '1px solid #e7e5e4', borderRadius: '3px', fontSize: '10px', color: '#44403c' }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {langues.length > 0 && (
          <div style={box}>
            <div style={boxTitle}>Langues</div>
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '10.5px', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600, color: '#1c1917' }}>{l.langue}</span>
                <span style={{ color: '#78716c' }}> — {l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div style={box}>
            <div style={boxTitle}>Certifications</div>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '10.5px', color: '#44403c', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>
                {c.organisme && <span style={{ color: '#78716c' }}> — {c.organisme}</span>}
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div style={{ ...box, marginBottom: 0 }}>
            <div style={boxTitle}>Centres d'intérêt</div>
            <div style={{ fontSize: '10.5px', color: '#44403c' }}>{centresInteret.join(', ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 36 : FLUX — Sections qui s'enchaînent
// ═══════════════════════════════════════════════════════════════════
function Flux({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const Transition = () => (
    <div style={{ height: '3px', background: `linear-gradient(90deg, ${color} 0%, ${color}00 100%)`, marginTop: '26px', marginBottom: '14px' }} />
  )
  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color, marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '44px 50px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div>
          <div style={{ fontSize: '29px', fontWeight: 700, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color: '#6b7280', marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10.5px', color: '#6b7280', marginTop: '14px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {cvData.accroche && (
        <>
          <Transition />
          <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#4b5563' }}>{cvData.accroche}</div>
        </>
      )}

      {experiences.length > 0 && (
        <>
          <Transition />
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#4b5563', marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>— {m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {formations.length > 0 && (
        <>
          <Transition />
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 500, color: '#4b5563', marginTop: '3px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{f.periode}</div>
            </div>
          ))}
        </>
      )}

      {competences.length > 0 && (
        <>
          <Transition />
          <div style={sectionTitle}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 13px', background: `${color}0f`, borderRadius: '16px', fontSize: '10px', fontWeight: 500, color }}>
                {c}
              </span>
            ))}
          </div>
        </>
      )}

      {langues.length > 0 && (
        <>
          <Transition />
          <div style={sectionTitle}>Langues</div>
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
              <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
            </div>
          ))}
        </>
      )}

      {certifications.length > 0 && (
        <>
          <Transition />
          <div style={sectionTitle}>Certifications</div>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#4b5563', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
            </div>
          ))}
        </>
      )}

      {centresInteret.length > 0 && (
        <>
          <Transition />
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '11px', color: '#4b5563' }}>{centresInteret.join(' · ')}</div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 37 : RÉSERVE — Élégance discrète
// ═══════════════════════════════════════════════════════════════════
function Reserve({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const SectionTitle = ({ children }) => (
    <div style={{ marginBottom: '18px' }}>
      <span style={{ display: 'inline-block', verticalAlign: 'middle', width: '4px', height: '4px', borderRadius: '50%', background: color, marginRight: '10px' }} />
      <span style={{ fontFamily: '"Source Serif 4", serif', fontSize: '15px', fontWeight: 600, color: '#1c1917', verticalAlign: 'middle' }}>{children}</span>
    </div>
  )

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '58px 64px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: '"Source Serif 4", serif', fontSize: '30px', fontWeight: 600, color: '#1c1917', letterSpacing: '-0.3px' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && (
            <div style={{ fontSize: '12px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#78716c', marginTop: '8px' }}>
              {cvData.titre}
            </div>
          )}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '10px', color: '#a8a29e', marginTop: '18px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>
      <div style={{ height: '1px', background: '#e7e5e4', marginTop: '26px', marginBottom: '30px' }} />

      {cvData.accroche && (
        <div style={{ fontSize: '11.5px', lineHeight: 1.75, color: '#44403c', marginBottom: '32px' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <SectionTitle>Expériences</SectionTitle>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 400, color: '#78716c', marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px', marginBottom: '9px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.65, color: '#44403c', marginBottom: '4px' }}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <SectionTitle>Formations</SectionTitle>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '18px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 400, color: '#78716c', marginTop: '3px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <SectionTitle>Compétences</SectionTitle>
          <div style={{ fontSize: '11px', lineHeight: 1.8, color: '#44403c' }}>{competences.join(', ')}</div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '32px' : 0 }}>
          <SectionTitle>Langues</SectionTitle>
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#1c1917' }}>{l.langue}</span>
              <span style={{ color: '#78716c' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '32px' : 0 }}>
          <SectionTitle>Certifications</SectionTitle>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#78716c' }}> — {c.organisme}</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <SectionTitle>Centres d'intérêt</SectionTitle>
          <div style={{ fontSize: '11px', color: '#44403c' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 38 : ESSENTIEL — Une seule page garantie
// ═══════════════════════════════════════════════════════════════════
function Essentiel({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false
  const accrocheTronquee = cvData.accroche && cvData.accroche.length > 200
    ? cvData.accroche.slice(0, 200).trim() + '…'
    : cvData.accroche

  const sectionTitle = { fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color, marginBottom: '8px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '32px 38px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1.5px solid ${color}`, paddingBottom: '10px', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '11.5px', fontWeight: 500, color, marginTop: '3px' }}>{cvData.titre}</div>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {contacts.length > 0 && (
            <div style={{ fontSize: '9px', color: '#6b7280' }}>{contacts.join(' · ')}</div>
          )}
          {showPhoto && (
            <div style={{ width: 'fit-content', flexShrink: 0 }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={44} color={color} forme={cvData.forme} showPhoto={showPhoto} />
            </div>
          )}
        </div>
      </div>

      {accrocheTronquee && (
        <div style={{ fontSize: '9.5px', lineHeight: 1.45, color: '#4b5563', marginBottom: '14px' }}>{accrocheTronquee}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: '9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '10px' }}>
                  <span style={{ fontWeight: 600, color: '#111827' }}>{exp.poste}</span>
                  <span style={{ color: '#6b7280' }}> — {exp.entreprise}</span>
                </div>
                <div style={{ fontSize: '8.5px', color: '#9ca3af' }}>{exp.periode}</div>
              </div>
              {exp.missions?.length > 0 && (
                <div style={{ marginTop: '2px' }}>
                  {exp.missions.slice(0, 3).map((m, j) => (
                    <div key={j} style={{ fontSize: '9.5px', lineHeight: 1.4, color: '#4b5563' }}>
                      <span style={{ marginRight: '5px' }}>·</span>{m}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <div style={{ fontSize: '10px' }}>
                <span style={{ fontWeight: 600, color: '#111827' }}>{f.diplome}</span>
                <span style={{ color: '#6b7280' }}> — {f.etablissement}</span>
              </div>
              <div style={{ fontSize: '8.5px', color: '#9ca3af' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '14px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ fontSize: '9.5px', color: '#4b5563' }}>{competences.join(', ')}</div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '14px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={{ fontSize: '9.5px', color: '#4b5563' }}>
            {langues.map(l => `${l.langue} (${l.niveau})`).join(', ')}
          </div>
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '14px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={{ fontSize: '9.5px', color: '#4b5563' }}>
            {certifications.map(c => [c.titre, c.organisme].filter(Boolean).join(' — ')).join(', ')}
          </div>
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '9.5px', color: '#4b5563' }}>{centresInteret.join(', ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 39 : IMPULSION — Startup moderne
// ═══════════════════════════════════════════════════════════════════
function Impulsion({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const Badge = ({ n }) => (
    <span style={{ padding: '2px 8px', background: '#f4f4f5', borderRadius: '10px', fontSize: '9px', fontWeight: 600, color: '#71717a', marginLeft: '10px' }}>
      {n}
    </span>
  )
  const sectionTitle = { display: 'flex', alignItems: 'center', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#09090b', marginBottom: '14px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '40px 46px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '26px' }}>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme={cvData.forme || 'carre_arrondi'} showPhoto={showPhoto} />
        <div>
          <div style={{ fontSize: '27px', fontWeight: 800, color: '#09090b', letterSpacing: '-0.8px' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 500, color, marginTop: '4px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '9.5px', color: '#71717a', marginTop: '10px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
      </div>

      {cvData.accroche && (
        <div style={{
          background: `linear-gradient(135deg, ${color}0d 0%, ${color}05 100%)`,
          padding: '20px 22px', borderRadius: '12px', marginBottom: '26px',
        }}>
          <div style={{ fontSize: '11px', lineHeight: 1.65, color: '#3f3f46' }}>{cvData.accroche}</div>
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}>Expériences<Badge n={experiences.length} /></div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ background: '#fafafa', borderRadius: '10px', padding: '16px 18px', marginBottom: '10px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#09090b' }}>{exp.poste}</div>
              <div style={{ fontSize: '11px', fontWeight: 500, color, marginTop: '2px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '9.5px', color: '#a1a1aa', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <div>
                  {exp.missions.map((m, j) => (
                    <div key={j} style={{ fontSize: '10px', lineHeight: 1.55, color: '#52525b' }}>— {m}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}>Formations<Badge n={formations.length} /></div>
          {formations.map((f, i) => (
            <div key={i} style={{ background: '#fafafa', borderRadius: '10px', padding: '16px 18px', marginBottom: '10px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#09090b' }}>{f.diplome}</div>
              <div style={{ fontSize: '11px', fontWeight: 500, color, marginTop: '2px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '9.5px', color: '#a1a1aa', marginTop: '2px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}>Compétences<Badge n={competences.length} /></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: color, borderRadius: '6px', fontSize: '10px', fontWeight: 600, color: '#ffffff' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '26px' : 0 }}>
          <div style={sectionTitle}>Langues<Badge n={langues.length} /></div>
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '10.5px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#09090b' }}>{l.langue}</span>
              <span style={{ color: '#71717a' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '26px' : 0 }}>
          <div style={sectionTitle}>Certifications<Badge n={certifications.length} /></div>
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '10.5px', color: '#3f3f46', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#71717a' }}> — {c.organisme}</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Intérêts<Badge n={centresInteret.length} /></div>
          <div style={{ fontSize: '10.5px', color: '#3f3f46' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 40 : TRAJECTOIRE — Frise horizontale
// ═══════════════════════════════════════════════════════════════════
function Trajectoire({ cvData, color }) {
  const experiences = cvData.experiences || []
  const formations = cvData.formations || []
  const competences = cvData.competences || []
  const langues = cvData.langues || []
  const certifications = cvData.certifications || []
  const centresInteret = cvData.centres_interet || []
  const contacts = [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean)
  const initiales = [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  const showPhoto = cvData.showPhoto !== false

  const anneesExtraites = experiences
    .map(exp => {
      const match = String(exp.periode || '').match(/\d{4}/)
      return match ? parseInt(match[0], 10) : null
    })
    .filter(a => a !== null)
  const minAnnee = anneesExtraites.length ? Math.min(...anneesExtraites) : null
  const maxAnnee = anneesExtraites.length ? Math.max(...anneesExtraites) : null
  const showFrise = experiences.length >= 2 && minAnnee !== null && maxAnnee !== null && maxAnnee > minAnnee

  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.8px', color }
  const sectionRule = { height: '2px', background: color, width: '28px', marginTop: '7px', marginBottom: '17px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '44px 48px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13.5px', fontWeight: 400, color: '#6b7280', marginTop: '4px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#6b7280', marginTop: '13px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <div style={{ width: 'fit-content', flexShrink: 0, marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme={cvData.forme} showPhoto={showPhoto} />
          </div>
        )}
      </div>

      {showFrise && (
        <div style={{ position: 'relative', height: '46px', marginBottom: '30px' }}>
          <div style={{ position: 'absolute', top: '22px', left: 0, right: 0, height: '2px', background: '#e5e7eb' }} />
          {experiences.map((exp, i) => {
            const match = String(exp.periode || '').match(/\d{4}/)
            const annee = match ? parseInt(match[0], 10) : null
            if (annee === null) return null
            const pct = maxAnnee > minAnnee ? ((annee - minAnnee) / (maxAnnee - minAnnee)) * 100 : 0
            return (
              <div key={i} style={{ position: 'absolute', left: `${pct}%`, transform: 'translateX(-50%)' }}>
                <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', fontSize: '9px', fontWeight: 600, color: '#6b7280', whiteSpace: 'nowrap' }}>
                  {annee}
                </div>
                <div style={{
                  position: 'absolute', top: '17px', width: '12px', height: '12px', borderRadius: '50%',
                  background: color, border: '3px solid #ffffff', boxSizing: 'border-box',
                }} />
              </div>
            )
          })}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#4b5563', marginBottom: '28px' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', color: '#4b5563', marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>— {m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', color: '#4b5563', marginTop: '3px' }}>{f.etablissement}</div>
              <div style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#374151' }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: certifications.length || centresInteret.length ? '28px' : 0 }}>
          <div style={sectionTitle}>Langues</div>
          <div style={sectionRule} />
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#111827' }}>{l.langue}</span>
              <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: centresInteret.length ? '28px' : 0 }}>
          <div style={sectionTitle}>Certifications</div>
          <div style={sectionRule} />
          {certifications.map((c, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600 }}>{c.titre}</span>
              {c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
            </div>
          ))}
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MÉTADONNÉES
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATES_PRO_META = {
  meridien: {
    nom: 'Méridien',
    style: 'Corporate premium',
    secteurs: ['Finance', 'Conseil', 'Juridique', 'Audit', 'Tous secteurs'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'],
    atsScore: 100,
    couleurDefaut: '#1e3a8a',
    description: 'Sobriété et autorité. Le CV des cabinets de conseil et de la finance.',
    recommande: true,
  },
  atelier: { nom: 'Atelier', style: 'Deux colonnes équilibré',
    secteurs: ['Marketing', 'Communication', 'Design', 'Tous secteurs'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 92, couleurDefaut: '#0f766e',
    description: 'Équilibre parfait entre lisibilité et personnalité.', recommande: true },
  tribune: { nom: 'Tribune', style: 'Header affirmé',
    secteurs: ['Commerce', 'Management', 'RH', 'Tous secteurs'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 95, couleurDefaut: '#7c3aed',
    description: 'Un header qui marque immédiatement. Impact garanti.', recommande: false },
  chronique: { nom: 'Chronique', style: 'Timeline',
    secteurs: ['Tous secteurs', 'Ingénierie', 'Industrie'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 88, couleurDefaut: '#dc2626',
    description: 'Votre parcours raconté visuellement. Idéal pour les carrières linéaires.', recommande: false },
  manuscrit: { nom: 'Manuscrit', style: 'Serif éditorial',
    secteurs: ['Édition', 'Culture', 'Éducation', 'Juridique'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'], atsScore: 94, couleurDefaut: '#c9a227',
    description: 'Élégance typographique. Pour les métiers de la plume et de la culture.', recommande: false },
  grille: { nom: 'Grille', style: 'Bento moderne',
    secteurs: ['Tech', 'Startup', 'Product', 'Data'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 85, couleurDefaut: '#2563eb',
    description: 'Structure modulaire moderne. Pour les profils tech et produit.', recommande: true },
  silence: { nom: 'Silence', style: 'Minimal extrême',
    secteurs: ['Design', 'Architecture', 'Art', 'Tous secteurs'],
    niveaux: ['Senior', 'Cadre'], atsScore: 98, couleurDefaut: '#000000',
    description: "Le vide comme statement. Pour ceux qui n'ont rien à prouver.", recommande: false },
  signal: { nom: 'Signal', style: 'Tech badges',
    secteurs: ['Tech', 'Développement', 'Data', 'DevOps'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 90, couleurDefaut: '#0ea5e9',
    description: 'Votre stack technique en évidence dès le premier regard.', recommande: true },
  prestige: { nom: 'Prestige', style: 'Executive',
    secteurs: ['Direction', 'Management', 'Finance', 'Conseil'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 96, couleurDefaut: '#0f172a',
    description: 'Pour les profils dirigeants. Résultats et leadership en avant.', recommande: true },
  contraste: { nom: 'Contraste', style: 'Bicolore audacieux',
    secteurs: ['Commerce', 'Marketing', 'Communication', 'Créatif'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 82, couleurDefaut: '#f59e0b',
    description: 'Un contraste fort qui capte l\'attention immédiatement.', recommande: false },

  horizon: { nom: 'Horizon', style: 'Bandeau latéral',
    secteurs: ['Tous secteurs', 'Conseil', 'Tech', 'Marketing'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 94, couleurDefaut: '#4338ca',
    description: 'Une touche de couleur discrète qui structure sans distraire.', recommande: true },

  palier: { nom: 'Palier', style: 'Sections en escalier',
    secteurs: ['Tous secteurs', 'Environnement', 'RSE', 'Éducation'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 90, couleurDefaut: '#059669',
    description: 'Une progression visuelle qui guide la lecture naturellement.', recommande: false },

  dossier: { nom: 'Dossier', style: 'Rapport professionnel',
    secteurs: ['Juridique', 'Audit', 'Administration', 'Finance'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'], atsScore: 97, couleurDefaut: '#b91c1c',
    description: 'Rigueur et structure. Pour les métiers où la précision compte.', recommande: true },

  aurore: { nom: 'Aurore', style: 'Dégradé moderne',
    secteurs: ['Marketing', 'Communication', 'Tech', 'Startup'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 86, couleurDefaut: '#8b5cf6',
    description: 'Un header qui capte le regard sans jamais surcharger.', recommande: false },

  registre: { nom: 'Registre', style: 'Chronologie latérale',
    secteurs: ['Tous secteurs', 'Industrie', 'Logistique', 'Ingénierie'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'], atsScore: 93, couleurDefaut: '#ea580c',
    description: 'Vos dates en évidence. Idéal pour les parcours longs et linéaires.', recommande: true },

  nocturne: { nom: 'Nocturne', style: 'Fond sombre',
    secteurs: ['Design', 'Tech', 'Créatif', 'Gaming'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 78, couleurDefaut: '#38bdf8',
    description: 'Audacieux et mémorable. À réserver aux candidatures directes.', recommande: false },

  compact: { nom: 'Compact', style: 'Dense',
    secteurs: ['Tous secteurs', 'Ingénierie', 'Recherche', 'Conseil'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 95, couleurDefaut: '#0891b2',
    description: 'Quinze ans de carrière sur une page. Sans sacrifier la lisibilité.', recommande: true },

  vitrine: { nom: 'Vitrine', style: 'Portfolio créatif',
    secteurs: ['Design', 'Photo', 'Art', 'Communication'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 84, couleurDefaut: '#db2777',
    description: 'Pensé pour les créatifs qui renvoient vers leur portfolio.', recommande: false },

  terrain: { nom: 'Terrain', style: 'Technique robuste',
    secteurs: ['BTP', 'Industrie', 'Maintenance', 'Transport'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 91, couleurDefaut: '#ca8a04',
    description: 'Habilitations et certifications mises en avant dès le premier regard.', recommande: true },

  soin: { nom: 'Soin', style: 'Santé et social',
    secteurs: ['Santé', 'Médical', 'Social', 'Paramédical'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 92, couleurDefaut: '#0d9488',
    description: 'Diplômes et numéros professionnels bien identifiés. Sobre et rassurant.', recommande: true },

  parallele: { nom: 'Parallèle', style: 'Deux colonnes égales',
    secteurs: ['Tous secteurs'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 89, couleurDefaut: '#1d4ed8',
    description: 'Structure symétrique claire, expériences et formation en vis-à-vis.', recommande: false },

  mosaique: { nom: 'Mosaïque', style: 'Blocs de tailles variables',
    secteurs: ['Créatif', 'Marketing', 'Communication'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 83, couleurDefaut: '#7e22ce',
    description: 'Composition en blocs modulaires, look moderne et créatif.', recommande: false },

  angle: { nom: 'Angle', style: 'Formes géométriques',
    secteurs: ['Design', 'Créatif', 'Architecture'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 87, couleurDefaut: '#e11d48',
    description: 'Touches géométriques discrètes pour un profil créatif affirmé.', recommande: false },

  colonne: { nom: 'Colonne', style: 'Sidebar très fine',
    secteurs: ['Tous secteurs'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 93, couleurDefaut: '#475569',
    description: 'Sidebar compacte, contenu principal généreux et lisible.', recommande: true },

  etape: { nom: 'Étape', style: 'Numérotation forte',
    secteurs: ['Gestion de projet', 'Conseil', 'Ingénierie'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 91, couleurDefaut: '#16a34a',
    description: 'Parcours numéroté qui structure le regard section par section.', recommande: false },

  focus: { nom: 'Focus', style: 'Accroche mise en avant',
    secteurs: ['Commercial', 'Marketing', 'Management'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 88, couleurDefaut: '#4f46e5',
    description: 'Profil et compétences mis en avant visuellement dès le premier regard.', recommande: true },

  sobre: { nom: 'Sobre', style: 'Ultra classique français',
    secteurs: ['Tous secteurs', 'Administration', 'Droit', 'Finance'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 100, couleurDefaut: '#000000',
    description: 'Format CV français traditionnel, maximum de compatibilité ATS.', recommande: true },

  duo: { nom: 'Duo', style: 'Header divisé en deux',
    secteurs: ['Tous secteurs'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 90, couleurDefaut: '#0369a1',
    description: 'En-tête bicolore élégant, photo ou initiales mises en valeur.', recommande: false },

  chiffre: { nom: 'Chiffre', style: 'Résultats en évidence',
    secteurs: ['Commercial', 'Vente', 'Business Development'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 92, couleurDefaut: '#0d9488',
    description: 'Chiffres et résultats commerciaux mis en avant automatiquement.', recommande: true },

  archive: { nom: 'Archive', style: 'Style académique',
    secteurs: ['Recherche', 'Universitaire', 'Enseignement'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 96, couleurDefaut: '#78350f',
    description: 'Formation en premier, présentation académique et sobre.', recommande: true },

  ruban: { nom: 'Ruban', style: 'Bande verticale',
    secteurs: ['Tous secteurs', 'Commerce', 'Marketing'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 94, couleurDefaut: '#c2410c',
    description: 'Une bande de couleur verticale qui structure sans encombrer.', recommande: false },

  plan: { nom: 'Plan', style: 'Grille stricte',
    secteurs: ['Architecture', 'Ingénierie', 'Tous secteurs'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 92, couleurDefaut: '#3730a3',
    description: 'Une grille rigoureuse pour les esprits structurés.', recommande: false },

  clarte: { nom: 'Clarté', style: 'Typographie pure',
    secteurs: ['Tous secteurs', 'Design', 'Direction', 'Conseil'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 100, couleurDefaut: '#000000',
    description: 'Uniquement de la typographie. Le contenu parle de lui-même.', recommande: true },

  signature: { nom: 'Signature', style: 'Nom surdimensionné',
    secteurs: ['Créatif', 'Communication', 'Direction', 'Commerce'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'], atsScore: 89, couleurDefaut: '#dc2626',
    description: 'Votre nom en très grand. Pour ceux qui assument leur présence.', recommande: false },

  cadre: { nom: 'Cadre', style: 'Encadrements',
    secteurs: ['Administration', 'Juridique', 'Finance', 'Tous secteurs'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 90, couleurDefaut: '#92400e',
    description: 'Chaque section dans son cadre. Clair et bien délimité.', recommande: false },

  flux: { nom: 'Flux', style: 'Transitions colorées',
    secteurs: ['Tech', 'Marketing', 'Communication', 'Tous secteurs'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 91, couleurDefaut: '#0e7490',
    description: 'Des transitions douces entre les sections pour une lecture fluide.', recommande: false },

  reserve: { nom: 'Réserve', style: 'Élégance discrète',
    secteurs: ['Finance', 'Juridique', 'Luxe', 'Conseil'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 95, couleurDefaut: '#1e40af',
    description: 'Le raffinement sans ostentation. Pour les secteurs exigeants.', recommande: true },

  essentiel: { nom: 'Essentiel', style: 'Une page garantie',
    secteurs: ['Tous secteurs'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 96, couleurDefaut: '#1f2937',
    description: 'Conçu pour tenir sur une page, même avec vingt ans de carrière.', recommande: true },

  impulsion: { nom: 'Impulsion', style: 'Startup moderne',
    secteurs: ['Startup', 'Tech', 'Product', 'Growth'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 85, couleurDefaut: '#6366f1',
    description: 'Le style des startups. Moderne, dynamique, sans être excessif.', recommande: true },

  trajectoire: { nom: 'Trajectoire', style: 'Frise horizontale',
    secteurs: ['Tous secteurs', 'Industrie', 'Ingénierie', 'Management'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 87, couleurDefaut: '#059669',
    description: 'Une frise qui montre votre progression en un coup d\'oeil.', recommande: false },
}

export function getTemplatesPourSecteur(secteur) {
  return Object.entries(TEMPLATES_PRO_META)
    .filter(([, m]) => m.secteurs.includes(secteur) || m.secteurs.includes('Tous secteurs'))
    .map(([id, m]) => ({ id, ...m }))
    .sort((a, b) => b.atsScore - a.atsScore)
}

export function CVTemplatePro({ cvData, template = 'meridien', color }) {
  const couleur = color || TEMPLATES_PRO_META[template]?.couleurDefaut || '#1e3a8a'
  switch (template) {
    case 'meridien': return <Meridien cvData={cvData} color={couleur} />
    case 'atelier': return <Atelier cvData={cvData} color={couleur} />
    case 'tribune': return <Tribune cvData={cvData} color={couleur} />
    case 'chronique': return <Chronique cvData={cvData} color={couleur} />
    case 'manuscrit': return <Manuscrit cvData={cvData} color={couleur} />
    case 'grille': return <Grille cvData={cvData} color={couleur} />
    case 'silence': return <Silence cvData={cvData} color={couleur} />
    case 'signal': return <Signal cvData={cvData} color={couleur} />
    case 'prestige': return <Prestige cvData={cvData} color={couleur} />
    case 'contraste': return <Contraste cvData={cvData} color={couleur} />
    case 'horizon': return <Horizon cvData={cvData} color={couleur} />
    case 'palier': return <Palier cvData={cvData} color={couleur} />
    case 'dossier': return <Dossier cvData={cvData} color={couleur} />
    case 'aurore': return <Aurore cvData={cvData} color={couleur} />
    case 'registre': return <Registre cvData={cvData} color={couleur} />
    case 'nocturne': return <Nocturne cvData={cvData} color={couleur} />
    case 'compact': return <Compact cvData={cvData} color={couleur} />
    case 'vitrine': return <Vitrine cvData={cvData} color={couleur} />
    case 'terrain': return <Terrain cvData={cvData} color={couleur} />
    case 'soin': return <Soin cvData={cvData} color={couleur} />
    case 'parallele': return <Parallele cvData={cvData} color={couleur} />
    case 'mosaique': return <Mosaique cvData={cvData} color={couleur} />
    case 'angle': return <Angle cvData={cvData} color={couleur} />
    case 'colonne': return <Colonne cvData={cvData} color={couleur} />
    case 'etape': return <Etape cvData={cvData} color={couleur} />
    case 'focus': return <Focus cvData={cvData} color={couleur} />
    case 'sobre': return <Sobre cvData={cvData} color={couleur} />
    case 'duo': return <Duo cvData={cvData} color={couleur} />
    case 'chiffre': return <Chiffre cvData={cvData} color={couleur} />
    case 'archive': return <Archive cvData={cvData} color={couleur} />
    case 'ruban': return <Ruban cvData={cvData} color={couleur} />
    case 'plan': return <Plan cvData={cvData} color={couleur} />
    case 'clarte': return <Clarte cvData={cvData} color={couleur} />
    case 'signature': return <Signature cvData={cvData} color={couleur} />
    case 'cadre': return <Cadre cvData={cvData} color={couleur} />
    case 'flux': return <Flux cvData={cvData} color={couleur} />
    case 'reserve': return <Reserve cvData={cvData} color={couleur} />
    case 'essentiel': return <Essentiel cvData={cvData} color={couleur} />
    case 'impulsion': return <Impulsion cvData={cvData} color={couleur} />
    case 'trajectoire': return <Trajectoire cvData={cvData} color={couleur} />
    default: return <Meridien cvData={cvData} color={couleur} />
  }
}

export {
  Meridien, Atelier, Tribune, Chronique, Manuscrit,
  Grille, Silence, Signal, Prestige, Contraste,
  Horizon, Palier, Dossier, Aurore, Registre,
  Nocturne, Compact, Vitrine, Terrain, Soin,
  Parallele, Mosaique, Angle, Colonne, Etape,
  Focus, Sobre, Duo, Chiffre, Archive,
  Ruban, Plan, Clarte, Signature, Cadre,
  Flux, Reserve, Essentiel, Impulsion, Trajectoire,
}
