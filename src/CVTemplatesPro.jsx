// src/CVTemplatesPro.jsx
// 10 templates de CV premium — dimensions A4 exactes (794x1123px @ 96dpi)

const PAGE = { width: 794, minHeight: 1123 }

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

  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '16px' }
  const sectionRule = { width: '32px', height: '2px', background: color, marginBottom: '20px' }

  return (
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '56px 60px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif',
      overflow: 'hidden', color: '#111827',
    }}>
      {/* HEADER */}
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

  const leftSectionTitle = { fontSize: '9.5px', fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '10px' }
  const leftSectionRule = { height: '1px', background: '#e5e7eb', width: '100%', marginBottom: '12px' }
  const rightSectionTitle = { fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '18px' }

  return (
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      {/* COLONNE GAUCHE */}
      <div style={{ width: '264px', flexShrink: 0, background: '#f8f9fa', padding: '36px 28px', boxSizing: 'border-box' }}>
        {cvData.photo && (
          <img src={cvData.photo} alt="" style={{
            width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover',
            border: '4px solid #ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            margin: '0 auto 24px', display: 'block',
          }} />
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

  const sectionTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color }
  const sectionRule = { height: '1px', background: '#e5e7eb', width: '100%', marginTop: '8px', marginBottom: '20px' }

  return (
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      {/* HEADER */}
      <div style={{
        height: '148px', background: color, padding: '36px 56px', boxSizing: 'border-box',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {cvData.photo && (
            <img src={cvData.photo} alt="" style={{
              width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover',
              border: '3px solid rgba(255,255,255,0.3)', marginRight: '24px', flexShrink: 0,
            }} />
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

  const sectionTitleClassic = { fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '16px' }

  return (
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '50px 56px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
      {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color: '#6b7280', marginTop: '4px' }}>{cvData.titre}</div>}
      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginTop: '14px', fontSize: '10.5px', color: '#6b7280' }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      )}
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

  const sectionTitle = { fontFamily: '"Playfair Display", serif', fontSize: '16px', fontWeight: 600, color: '#1a1a1a', textAlign: 'left' }
  const sectionRule = { height: '1px', background: '#e0ddd5', width: '100%', marginTop: '6px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fffef9',
      padding: '60px 64px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{ textAlign: 'center' }}>
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

  return (
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '40px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '16px',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER carte */}
      <div style={{ background: '#111827', borderRadius: '12px', padding: '32px', boxSizing: 'border-box' }}>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '5px' }}>{cvData.titre}</div>}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px', fontSize: '10px', color: 'rgba(255,255,255,0.6)' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
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

  const sectionTitle = { fontSize: '9px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: '#cccccc', marginBottom: '20px' }

  return (
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '80px 90px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
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

  const sectionTitle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0f172a', marginBottom: '16px' }
  const sectionSquare = { width: '6px', height: '6px', background: color, marginRight: '8px', flexShrink: 0 }

  return (
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '44px 52px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ fontSize: '27px', fontWeight: 700, color: '#0f172a' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 500, color, marginTop: '4px' }}>{cvData.titre}</div>}
        </div>
        {contacts.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px' }}>{c}</div>
            ))}
          </div>
        )}
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
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#ffffff',
      padding: '52px 58px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden',
    }}>
      {/* HEADER */}
      <div style={{ borderBottom: '3px solid #111827', paddingBottom: '22px', marginBottom: '26px' }}>
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

  const bandTitle = { fontSize: '9px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '10px' }
  const bandRule = { height: '1px', background: 'rgba(255,255,255,0.15)', marginBottom: '12px' }
  const rightSectionTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#111827' }
  const rightSectionRule = { height: '3px', background: color, width: '36px', marginTop: '8px', marginBottom: '20px' }

  return (
    <div id="cv-to-print" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      {/* BANDE GAUCHE */}
      <div style={{ width: '230px', flexShrink: 0, background: '#111827', padding: '36px 24px', color: '#ffffff', boxSizing: 'border-box' }}>
        {cvData.photo && (
          <img src={cvData.photo} alt="" style={{
            width: '88px', height: '88px', borderRadius: '50%', objectFit: 'cover',
            border: `3px solid ${color}`, margin: '0 auto 22px', display: 'block',
          }} />
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
    default: return <Meridien cvData={cvData} color={couleur} />
  }
}

export {
  Meridien, Atelier, Tribune, Chronique, Manuscrit,
  Grille, Silence, Signal, Prestige, Contraste,
}
