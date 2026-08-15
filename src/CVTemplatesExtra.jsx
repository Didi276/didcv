// src/CVTemplatesExtra.jsx
// Templates 41 à 93 — vagues 5 à 9, dimensions A4 exactes (794x1123px @ 96dpi)
import { PhotoCV } from './CVTemplatesPro'

const PAGE = { width: 794, minHeight: 1123 }

// Dérive un niveau de remplissage (75-95%) déterministe à partir du nom de la
// compétence, faute de champ "niveau" dans le modèle de données — purement
// décoratif, pas une mesure réelle de maîtrise.
function niveauCompetence(nom) {
  let h = 0
  for (let i = 0; i < nom.length; i++) h = (h * 31 + nom.charCodeAt(i)) % 100
  return 75 + (h % 21)
}

// Dérive un nombre d'étoiles (1-5) à partir du texte de niveau de langue
// réellement saisi par l'utilisateur (ex "Courant (C1)", "Langue maternelle").
function etoilesNiveau(niveau) {
  const n = (niveau || '').toLowerCase()
  if (n.includes('maternelle') || n.includes('c2') || n.includes('bilingue')) return 5
  if (n.includes('courant') || n.includes('c1')) return 4
  if (n.includes('avancé') || n.includes('b2')) return 3
  if (n.includes('intermédiaire') || n.includes('b1')) return 2
  return 1
}

function anneesExperience(experiences) {
  const annees = experiences.flatMap(e => (e.periode || '').match(/\d{4}/g) || []).map(Number)
  if (!annees.length) return null
  const diff = Math.max(...annees) - Math.min(...annees)
  return diff > 0 ? diff : null
}

function useCvBase(cvData) {
  return {
    experiences: cvData.experiences || [],
    formations: cvData.formations || [],
    competences: cvData.competences || [],
    langues: cvData.langues || [],
    certifications: cvData.certifications || [],
    centresInteret: cvData.centres_interet || [],
    contacts: [cvData.email, cvData.telephone, cvData.ville, cvData.linkedin].filter(Boolean),
    initiales: [cvData.prenom, cvData.nom].filter(Boolean).map(s => s[0]).join('').toUpperCase(),
    showPhoto: cvData.showPhoto !== false,
  }
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 41 : SPECTRUM — Bande dégradée + badges colorés
// ═══════════════════════════════════════════════════════════════════
function Spectrum({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '10px' }
  const sectionRule = { width: '100%', height: '3px', borderRadius: '2px', background: `linear-gradient(90deg, ${color}, ${color}30)`, marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      position: 'relative', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '8px', height: '100%', background: `linear-gradient(180deg, ${color}, ${color}60)` }} />
      <div style={{ padding: '52px 56px 52px 44px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme={cvData.forme || 'carre_arrondi'} showPhoto={showPhoto} />
          <div>
            <div style={{ fontSize: '30px', fontWeight: 700, color: '#111827', letterSpacing: '-0.6px' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 500, color, marginTop: '4px' }}>{cvData.titre}</div>}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10.5px', color: '#6b7280', marginTop: '8px' }}>
                {contacts.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
        </div>

        {cvData.accroche && (
          <div style={{ borderLeft: `3px solid ${color}`, padding: '10px 16px', margin: '0 0 28px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151', background: `${color}08` }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '2px', marginBottom: '6px' }}>
                  {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>
                        <span style={{ position: 'absolute', left: 0, color }}>›</span>{m}
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
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
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
                <span key={i} style={{ padding: '6px 13px', borderRadius: '20px', background: color, color: '#fff', fontSize: '10.5px', fontWeight: 600, opacity: 0.85 }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Langues</div>
              <div style={sectionRule} />
              {langues.map((l, i) => (
                <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600 }}>{l.langue}</span>
                  <span style={{ color: '#6b7280' }}> — {l.niveau}</span>
                </div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
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
        </div>

        {centresInteret.length > 0 && (
          <div style={{ marginTop: '20px' }}>
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
// TEMPLATE 42 : LATITUDE — Bandeau photo pleine largeur
// ═══════════════════════════════════════════════════════════════════
function Latitude({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '14px' }
  const sectionRule = { width: '32px', height: '2px', background: color, marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden' }}>
        {cvData.photo ? (
          <img src={cvData.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${color}, #111827)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '72px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '-1px' }}>{initiales}</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: '20px', left: '44px' }}>
          <div style={{ fontSize: '30px', fontWeight: 700, color: '#fff', letterSpacing: '-0.6px' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.85)', marginTop: '4px' }}>{cvData.titre}</div>}
        </div>
        {contacts.length > 0 && (
          <div style={{ position: 'absolute', top: '20px', right: '24px', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)' }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: '10px', color: '#fff', textAlign: 'right' }}>{c}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '36px 56px 52px' }}>
        {cvData.accroche && (
          <div style={{ marginBottom: '28px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151' }}>{cvData.accroche}</div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px', marginBottom: '8px' }}>
                  {[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}
                </div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '4px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>{m}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
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
                <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#374151' }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Langues</div>
              <div style={sectionRule} />
              {langues.map((l, i) => (
                <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600 }}>{l.langue}</span><span style={{ color: '#6b7280' }}> — {l.niveau}</span>
                </div>
              ))}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Certifications</div>
              <div style={sectionRule} />
              {certifications.map((c, i) => (
                <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
                  <span style={{ fontWeight: 600 }}>{c.titre}</span>{c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
                </div>
              ))}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={sectionRule} />
              <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 43 : MONOGRAMME — Initiales en filigrane, élégance serif
// ═══════════════════════════════════════════════════════════════════
function Monogramme({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const FONT = '"Playfair Display", Georgia, serif'
  const sectionTitle = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', color: '#111827', marginBottom: '16px', fontFamily: FONT }
  const ornement = { flex: 1, height: '1px', background: `linear-gradient(90deg, ${color}80, transparent)` }
  const ornementInverse = { flex: 1, height: '1px', background: `linear-gradient(270deg, ${color}80, transparent)` }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff', position: 'relative',
      padding: '60px 68px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{
        position: 'absolute', top: '40px', right: '20px', fontSize: '180px', fontWeight: 700,
        color, opacity: 0.08, fontFamily: FONT, lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
      }}>
        {initiales}
      </div>

      <div style={{ position: 'relative', textAlign: 'center', marginBottom: '24px' }}>
        {showPhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '18px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={100} color={color} forme={cvData.forme || 'rond'} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '30px', fontWeight: 700, color: '#111827', letterSpacing: '0.5px', fontFamily: FONT }}>
          {cvData.prenom} {cvData.nom}
        </div>
        {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 500, color, marginTop: '6px', letterSpacing: '1px' }}>{cvData.titre}</div>}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', fontSize: '10.5px', color: '#6b7280', marginTop: '12px' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ position: 'relative', textAlign: 'center', fontStyle: 'italic', fontSize: '12px', lineHeight: 1.7, color: '#4b5563', maxWidth: '520px', margin: '0 auto 32px' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <div style={sectionTitle}><span style={ornement} /><span>Expériences</span><span style={ornementInverse} /></div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0, textAlign: 'center' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', fontFamily: FONT }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', color, margin: '3px 0' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')} — {exp.periode}</div>
              {exp.missions?.length > 0 && (
                <div style={{ maxWidth: '480px', margin: '8px auto 0' }}>
                  {exp.missions.map((m, j) => (
                    <div key={j} style={{ fontSize: '11px', lineHeight: 1.6, color: '#4b5563' }}>{m}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <div style={sectionTitle}><span style={ornement} /><span>Formations</span><span style={ornementInverse} /></div>
          {formations.map((f, i) => (
            <div key={i} style={{ textAlign: 'center', marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', fontFamily: FONT }}>{f.diplome}</div>
              <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{[f.etablissement, f.periode].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '30px', textAlign: 'center' }}>
          <div style={sectionTitle}><span style={ornement} /><span>Compétences</span><span style={ornementInverse} /></div>
          <div style={{ fontSize: '11px', color: '#374151', lineHeight: 2 }}>{competences.join('   ·   ')}</div>
        </div>
      )}

      <div style={{ position: 'relative', display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
        {langues.length > 0 && (
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#374151' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>Certifications</div>
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#374151' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '8px' }}>Centres d'intérêt</div>
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 44 : INFOGRAPHIE — Colonne sombre, stats, barres et étoiles
// ═══════════════════════════════════════════════════════════════════
function Infographie({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const anneesExp = anneesExperience(experiences) || experiences.length
  const leftTitle = { fontSize: '10px', fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color, marginBottom: '14px' }
  const rightTitle = { fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ width: '270px', flexShrink: 0, background: '#0f0f1a', padding: '40px 28px', boxSizing: 'border-box', color: '#fff' }}>
        {showPhoto && (
          <div style={{ marginBottom: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme={cvData.forme || 'rond'} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '20px', fontWeight: 700, marginBottom: '4px' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '12px', color, marginBottom: '20px' }}>{cvData.titre}</div>}

        {contacts.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            {contacts.map((c, i) => (
              <div key={i} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginBottom: '6px', wordBreak: 'break-word' }}>{c}</div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={leftTitle}>Compétences</div>
            {competences.map((c, i) => (
              <div key={i} style={{ marginBottom: '10px' }}>
                <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.85)', marginBottom: '4px' }}>{c}</div>
                <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }}>
                  <div style={{ width: `${niveauCompetence(c)}%`, height: '100%', borderRadius: '2px', background: color }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: certifications.length ? '28px' : 0 }}>
            <div style={leftTitle}>Langues</div>
            {langues.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.85)' }}>{l.langue}</span>
                <span style={{ fontSize: '10px', color, letterSpacing: '1px' }}>
                  {'★'.repeat(etoilesNiveau(l.niveau))}<span style={{ color: 'rgba(255,255,255,0.25)' }}>{'★'.repeat(5 - etoilesNiveau(l.niveau))}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <div style={leftTitle}>Certifications</div>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.8)', marginBottom: '6px' }}>{c.titre}</div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '40px 44px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: "Années d'expérience", val: anneesExp },
            { label: 'Postes occupés', val: experiences.length },
            { label: 'Formations', val: formations.length },
          ].filter(s => s.val > 0).map((s, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '16px 8px', borderRadius: '10px', background: `${color}0f` }}>
              <div style={{ fontSize: '26px', fontWeight: 700, color }}>{s.val}</div>
              <div style={{ fontSize: '9.5px', color: '#6b7280', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {cvData.accroche && (
          <div style={{ marginBottom: '28px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151' }}>{cvData.accroche}</div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={rightTitle}>Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>{m}
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
            <div style={rightTitle}>Formations</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={rightTitle}>Centres d'intérêt</div>
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 45 : CHAPTERS — Serif éditorial, numéros de chapitre géants
// ═══════════════════════════════════════════════════════════════════
function Chapters({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const FONT = '"Source Serif 4", Georgia, serif'

  const sections = []
  if (experiences.length) sections.push({
    titre: 'Expériences', node: (
      <>
        {experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
              <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, color, margin: '3px 0 8px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
            {exp.missions?.length > 0 && exp.missions.map((m, j) => (
              <div key={j} style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#4b5563', marginBottom: '4px' }}>{m}</div>
            ))}
          </div>
        ))}
      </>
    ),
  })
  if (formations.length) sections.push({
    titre: 'Formations', node: (
      <>
        {formations.map((f, i) => (
          <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
              <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
            </div>
            <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
          </div>
        ))}
      </>
    ),
  })
  if (competences.length) sections.push({
    titre: 'Compétences', node: (
      <div style={{ fontSize: '11.5px', lineHeight: 1.9, color: '#374151' }}>{competences.join('  ·  ')}</div>
    ),
  })
  if (langues.length || certifications.length || centresInteret.length) sections.push({
    titre: 'Divers', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {langues.length > 0 && <div style={{ fontSize: '11.5px', color: '#374151' }}><strong>Langues :</strong> {langues.map(l => `${l.langue} (${l.niveau})`).join(', ')}</div>}
        {certifications.length > 0 && <div style={{ fontSize: '11.5px', color: '#374151' }}><strong>Certifications :</strong> {certifications.map(c => c.titre).join(', ')}</div>}
        {centresInteret.length > 0 && <div style={{ fontSize: '11.5px', color: '#374151' }}><strong>Centres d'intérêt :</strong> {centresInteret.join(', ')}</div>}
      </div>
    ),
  })

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      padding: '56px 60px', boxSizing: 'border-box', fontFamily: FONT, overflow: 'hidden', color: '#1f2937',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={96} color={color} forme="carre" showPhoto={showPhoto} />
        <div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#111827', letterSpacing: '-0.5px' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', color, marginTop: '4px' }}>{cvData.titre}</div>}
        </div>
      </div>
      <div style={{ height: '2px', background: '#111827', width: '100%', marginTop: '18px' }} />
      <div style={{ height: '1px', background: '#111827', width: '100%', marginTop: '3px', marginBottom: '16px' }} />

      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '11px', color: '#6b7280', marginBottom: '20px', fontFamily: '"Inter", sans-serif' }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ marginBottom: '30px', fontSize: '12px', fontStyle: 'italic', lineHeight: 1.7, color: '#4b5563' }}>{cvData.accroche}</div>
      )}

      {sections.map((s, i) => (
        <div key={i} style={{ position: 'relative', marginBottom: i < sections.length - 1 ? '32px' : 0, paddingLeft: '54px' }}>
          <div style={{ position: 'absolute', left: 0, top: '-14px', fontSize: '48px', fontWeight: 700, color, opacity: 0.2, lineHeight: 1 }}>
            {String(i + 1).padStart(2, '0')}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '12px' }}>{s.titre}</div>
          {s.node}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 46 : BLUEPRINT — Style plan technique
// ═══════════════════════════════════════════════════════════════════
function Blueprint({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { padding: '6px 12px', background: '#0f0f1a', color: '#fff', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', display: 'inline-block' }
  const habilitations = [...certifications]

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{ background: '#0f0f1a', color: '#fff', padding: '32px 56px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme="carre" showPhoto={showPhoto} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', letterSpacing: '2px', color, marginBottom: '6px', fontFamily: 'monospace' }}>
            RÉF. {initiales || 'CV'}-{(cvData.telephone || '0000').replace(/\D/g, '').slice(-4) || '0000'}
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700 }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>{cvData.titre}</div>}
        </div>
        {contacts.length > 0 && (
          <div style={{ textAlign: 'right' }}>
            {contacts.map((c, i) => <div key={i} style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.6)', marginBottom: '3px' }}>{c}</div>)}
          </div>
        )}
      </div>

      {habilitations.length > 0 && (
        <div style={{ background: `${color}15`, borderBottom: `2px solid ${color}`, padding: '12px 56px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {habilitations.map((c, i) => (
            <span key={i} style={{ fontSize: '10.5px', fontWeight: 700, color, padding: '4px 10px', border: `1px solid ${color}`, borderRadius: '3px' }}>{c.titre}</span>
          ))}
        </div>
      )}

      <div style={{ padding: '36px 56px 52px' }}>
        {cvData.accroche && (
          <div style={{ marginBottom: '28px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151' }}>{cvData.accroche}</div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0, borderLeft: '2px solid #e5e7eb', paddingLeft: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af', fontFamily: 'monospace' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>
                        <span style={{ position: 'absolute', left: 0, color }}>▸</span>{m}
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
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af', fontFamily: 'monospace' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '30px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => (
                <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#374151', fontFamily: 'monospace' }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Langues</div>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}><span style={{ fontWeight: 600 }}>{l.langue}</span><span style={{ color: '#6b7280' }}> — {l.niveau}</span></div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Divers</div>
              <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 47 : PORTRAIT — Panneau photo pleine hauteur
// ═══════════════════════════════════════════════════════════════════
function Portrait({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '14px' }
  const sectionRule = { width: '32px', height: '2px', background: color, marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '220px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        {cvData.photo ? (
          <img src={cvData.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
        ) : (
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${color}, #111827)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '64px', fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{initiales}</span>
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(0deg, rgba(0,0,0,0.75) 0%, transparent 45%)' }} />
        <div style={{ position: 'absolute', bottom: '24px', left: '20px', right: '20px' }}>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.85)', marginTop: '6px' }}>{cvData.titre}</div>}
        </div>
      </div>

      <div style={{ flex: 1, padding: '36px 44px', boxSizing: 'border-box' }}>
        {contacts.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', flexWrap: 'wrap', fontSize: '10.5px', color: '#6b7280', marginBottom: '24px' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}

        {cvData.accroche && (
          <div style={{ marginBottom: '26px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151' }}>{cvData.accroche}</div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>{m}
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
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={sectionRule} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', fontWeight: 500, color: '#374151' }}>{c}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '150px' }}>
              <div style={sectionTitle}>Langues</div>
              <div style={sectionRule} />
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}><span style={{ fontWeight: 600 }}>{l.langue}</span><span style={{ color: '#6b7280' }}> — {l.niveau}</span></div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '150px' }}>
              <div style={sectionTitle}>Certifications</div>
              <div style={sectionRule} />
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '150px' }}>
              <div style={sectionTitle}>Divers</div>
              <div style={sectionRule} />
              <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 48 : RÉSEAU — Style profil LinkedIn
// ═══════════════════════════════════════════════════════════════════
function Reseau({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '14px' }

  const logoInitiales = (nom) => (nom || '').split(' ').filter(Boolean).map(s => s[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#f3f2ef',
      boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{ background: '#fff' }}>
        <div style={{ height: '120px', background: `linear-gradient(120deg, ${color}, #003366)` }} />
        <div style={{ padding: '0 44px 20px', marginTop: '-52px' }}>
          <div style={{ border: '4px solid #fff', borderRadius: '50%', width: 'fit-content', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={100} color={color} forme="rond" showPhoto={showPhoto} />
          </div>
          <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '13px', color: '#374151', marginTop: '4px' }}>{cvData.titre}</div>}
            {contacts.length > 0 && (
              <div style={{ fontSize: '10.5px', color: '#6b7280', marginTop: '6px' }}>{contacts.join(' · ')}</div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <span style={{ padding: '7px 18px', borderRadius: '20px', background: color, color: '#fff', fontSize: '11.5px', fontWeight: 700 }}>Contacter</span>
            <span style={{ padding: '7px 18px', borderRadius: '20px', border: `1.5px solid ${color}`, color, fontSize: '11.5px', fontWeight: 700 }}>Profil ouvert</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 44px 52px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {cvData.accroche && (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '18px 20px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px' }}>
            <div style={sectionTitle}>Expérience</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < experiences.length - 1 ? '16px' : 0, paddingBottom: i < experiences.length - 1 ? '16px' : 0, borderBottom: i < experiences.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                  {logoInitiales(exp.entreprise) || '·'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '11.5px', color: '#374151' }}>{exp.entreprise}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af', marginTop: '2px' }}>{exp.periode}{exp.lieu ? ` · ${exp.lieu}` : ''}</div>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0 }}>
                      {exp.missions.map((m, j) => (
                        <li key={j} style={{ fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '2px' }}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px' }}>
            <div style={sectionTitle}>Formation</div>
            {formations.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${color}18`, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, flexShrink: 0 }}>
                  {logoInitiales(f.etablissement) || '·'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '11.5px', color: '#374151' }}>{f.etablissement}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => <span key={i} style={{ padding: '6px 14px', borderRadius: '20px', background: '#eef3f8', color: '#0a66c2', fontSize: '11px', fontWeight: 600 }}>{c}</span>)}
            </div>
          </div>
        )}

        {(langues.length > 0 || certifications.length > 0 || centresInteret.length > 0) && (
          <div style={{ background: '#fff', borderRadius: '10px', padding: '20px', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            {langues.length > 0 && (
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={sectionTitle}>Langues</div>
                {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '4px' }}>{l.langue} — {l.niveau}</div>)}
              </div>
            )}
            {certifications.length > 0 && (
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={sectionTitle}>Certifications</div>
                {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '4px' }}>{c.titre}</div>)}
              </div>
            )}
            {centresInteret.length > 0 && (
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={sectionTitle}>Centres d'intérêt</div>
                <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 49 : PASTEL — Colonne pastel douce
// ═══════════════════════════════════════════════════════════════════
function Pastel({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const leftTitle = { fontSize: '10px', fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color, marginBottom: '12px' }
  const rightTitle = { fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#111827', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '260px', flexShrink: 0, background: '#fdf4ff', padding: '40px 26px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <div style={{ marginBottom: '20px', filter: `drop-shadow(0 6px 16px ${color}40)` }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={100} color={color} forme={cvData.forme || 'rond'} showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '19px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '11.5px', color, marginBottom: '18px' }}>{cvData.titre}</div>}

        {contacts.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            {contacts.map((c, i) => <div key={i} style={{ fontSize: '10px', color: '#6b7280', marginBottom: '5px', wordBreak: 'break-word' }}>{c}</div>)}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={leftTitle}>Compétences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {competences.map((c, i) => <span key={i} style={{ padding: '5px 11px', borderRadius: '20px', background: '#fff', color, fontSize: '10px', fontWeight: 600, border: `1px solid ${color}30` }}>{c}</span>)}
            </div>
          </div>
        )}

        {centresInteret.length > 0 && (
          <div style={{ marginBottom: langues.length ? '26px' : 0 }}>
            <div style={leftTitle}>Personnalité</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {centresInteret.map((c, i) => <span key={i} style={{ padding: '5px 11px', borderRadius: '20px', background: `${color}20`, color: '#4b3b5c', fontSize: '10px', fontWeight: 600 }}>{c}</span>)}
            </div>
          </div>
        )}

        {langues.length > 0 && (
          <div>
            <div style={leftTitle}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '10.5px', color: '#4b5563', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '40px 44px', boxSizing: 'border-box' }}>
        {cvData.accroche && (
          <div style={{ background: `${color}10`, border: `1px solid ${color}30`, borderRadius: '12px', padding: '18px 20px', marginBottom: '28px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={rightTitle}>Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>{m}
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
            <div style={rightTitle}>Formations</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <div style={rightTitle}>Certifications</div>
            {certifications.map((c, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{c.titre}</span>{c.organisme && <span style={{ color: '#6b7280' }}> — {c.organisme}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 50 : ODYSSÉE — Timeline verticale dégradée
// ═══════════════════════════════════════════════════════════════════
function Odyssee({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      padding: '52px 56px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px' }}>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={92} color={color} forme={cvData.forme || 'carre_arrondi'} showPhoto={showPhoto} />
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827', letterSpacing: '-0.5px' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13.5px', color, marginTop: '4px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10.5px', color: '#6b7280', marginTop: '6px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
      </div>

      {competences.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
          {competences.map((c, i) => (
            <span key={i} style={{ padding: '6px 14px', borderRadius: '6px', background: '#0f0f1a', color: '#fff', fontSize: '10.5px', fontWeight: 600 }}>{c}</span>
          ))}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ marginBottom: '30px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={{ position: 'relative', paddingLeft: '24px' }}>
            <div style={{ position: 'absolute', left: '5px', top: '6px', bottom: '6px', width: '2px', background: `linear-gradient(180deg, ${color}, ${color}10)` }} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ position: 'relative', marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
                <div style={{ position: 'absolute', left: '-24px', top: '3px', width: '12px', height: '12px', borderRadius: '50%', background: color, border: '2px solid #fff', boxShadow: `0 0 0 2px ${color}` }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 500, color, margin: '3px 0 6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>
                        <span style={{ position: 'absolute', left: 0, color: '#d1d5db' }}>—</span>{m}
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
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827' }}>{f.diplome}</div>
                <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}><span style={{ fontWeight: 600 }}>{l.langue}</span><span style={{ color: '#6b7280' }}> — {l.niveau}</span></div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Certifications</div>
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 51 : NÉON — Tech sombre premium
// ═══════════════════════════════════════════════════════════════════
function Neon({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color }
  const sectionRule = { width: '100%', height: '1px', background: `${color}40`, marginTop: '6px', marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#0a0a0f',
      padding: '48px 52px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#fff',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px' }}>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme="rond" showPhoto={showPhoto} />
        <div>
          <div style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', color, marginTop: '4px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '8px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
      </div>
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '24px' }} />

      {cvData.accroche && (
        <div style={{ marginBottom: '26px', fontSize: '10.5px', lineHeight: 1.65, color: 'rgba(255,255,255,0.75)' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '16px', fontSize: '10.5px', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', marginBottom: '3px' }}>
                      <span style={{ position: 'absolute', left: 0, color }}>›</span>{m}
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
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{f.diplome}</div>
              <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{[f.etablissement, f.periode].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ padding: '4px 12px', borderRadius: '4px', border: `1px solid ${color}50`, color, background: `${color}08`, fontSize: '10.5px' }}>{c}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Langues</div>
            <div style={sectionRule} />
            {langues.map((l, i) => <div key={i} style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Certifications</div>
            <div style={sectionRule} />
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={sectionRule} />
            <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.7)' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 52 : ORIGAMI — Géométrique japonais minimaliste
// ═══════════════════════════════════════════════════════════════════
function Origami({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#18181b', marginBottom: '14px' }
  const puce = { display: 'inline-block', width: '8px', height: '8px', background: color, transform: 'rotate(45deg)', marginRight: '10px', verticalAlign: 'middle' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff', position: 'relative',
      padding: '50px 56px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#18181b',
    }}>
      <svg width="60" height="60" viewBox="0 0 60 60" style={{ position: 'absolute', top: '30px', right: '30px' }}>
        <polygon points="0,60 30,0 60,60" fill={color} opacity="0.15" />
        <polygon points="10,60 30,10 50,60" fill={color} opacity="0.3" />
      </svg>

      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={84} color={color} forme="carre_arrondi" showPhoto={showPhoto} />
        <div>
          <div style={{ fontSize: '27px', fontWeight: 700, color: '#18181b' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 400, color: '#71717a', marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: '#a1a1aa', marginTop: '13px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
      </div>

      {cvData.accroche && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '18px 20px', marginBottom: '28px', fontSize: '11.5px', lineHeight: 1.7, color: '#78350f' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}><span style={puce} />Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#18181b' }}>{exp.poste}</div>
                <div style={{ fontSize: '10.5px', color: '#a1a1aa' }}>{exp.periode}</div>
              </div>
              <div style={{ fontSize: '12px', color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '11px', lineHeight: 1.6, color: '#52525b', marginBottom: '3px' }}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}><span style={puce} />Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{f.diplome}</div>
                <div style={{ fontSize: '10.5px', color: '#a1a1aa' }}>{f.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}><span style={puce} />Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => <span key={i} style={{ padding: '5px 12px', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: '3px', fontSize: '10.5px', color: '#3f3f46' }}>{c}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}><span style={puce} />Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}><span style={{ fontWeight: 600 }}>{l.langue}</span><span style={{ color: '#a1a1aa' }}> — {l.niveau}</span></div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}><span style={puce} />Certifications</div>
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#52525b', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}><span style={puce} />Centres d'intérêt</div>
            <div style={{ fontSize: '11px', color: '#52525b' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 53 : CINÉMA — Pellicule cinématographique
// ═══════════════════════════════════════════════════════════════════
function Cinema({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '12px' }
  const perforations = Array.from({ length: 24 })

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#0c0c0c',
      boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#fff',
    }}>
      <div style={{ height: '24px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px', background: '#0c0c0c' }}>
        {perforations.map((_, i) => <div key={i} style={{ width: '12px', height: '16px', background: '#ffffff', flexShrink: 0 }} />)}
      </div>

      <div style={{ padding: '32px 48px 0' }}>
        <div style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '-1px', textAlign: 'center' }}>
          {cvData.prenom} {cvData.nom}
        </div>
        {cvData.titre && (
          <div style={{ fontSize: '13px', fontWeight: 400, color, textAlign: 'center', letterSpacing: '3px', textTransform: 'uppercase', marginTop: '6px' }}>{cvData.titre}</div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme="rond" showPhoto={showPhoto} />
        </div>
        {contacts.length > 0 && (
          <div style={{ textAlign: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.5)', marginTop: '12px' }}>{contacts.join(' | ')}</div>
        )}
        <div style={{ height: '2px', background: 'rgba(255,255,255,0.1)', marginTop: '20px', marginBottom: '28px' }} />
      </div>

      <div style={{ padding: '0 48px 48px', background: '#0c0c0c' }}>
        {cvData.accroche && (
          <div style={{ marginBottom: '26px', fontSize: '10.5px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)' }}>{cvData.accroche}</div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={sectionTitle}>Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '16px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', marginBottom: '3px' }}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={sectionTitle}>Formations</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#ffffff' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => <span key={i} style={{ padding: '5px 12px', border: `1px solid ${color}`, color, borderRadius: '3px', fontSize: '10px' }}>{c}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Langues</div>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Certifications</div>
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.8)', marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.8)' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 54 : ARCHIPEL — Îles de contenu, design modulaire
// ═══════════════════════════════════════════════════════════════════
function Archipel({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const ileTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#0c4a6e', marginBottom: '14px' }
  const ileCard = { background: '#ffffff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#f0f9ff',
      padding: '32px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#0c4a6e',
    }}>
      <div style={{ ...ileCard, display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme="rond" showPhoto={showPhoto} />
        <div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#0c4a6e' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', color, marginTop: '4px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#0e7490', marginTop: '10px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
        {cvData.accroche && (
          <div style={ileCard}>
            <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#0c4a6e' }}>{cvData.accroche}</div>
          </div>
        )}
        {competences.length > 0 && (
          <div style={{ background: color, borderRadius: '12px', padding: '24px' }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'rgba(255,255,255,0.7)', marginBottom: '12px' }}>Compétences</div>
            {competences.map((c, i) => <div key={i} style={{ fontSize: '10.5px', fontWeight: 500, color: '#ffffff', marginBottom: '6px' }}>{c}</div>)}
          </div>
        )}
      </div>

      {experiences.length > 0 && (
        <div style={{ ...ileCard, marginBottom: '16px' }}>
          <div style={ileTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0, paddingBottom: i < experiences.length - 1 ? '18px' : 0, borderBottom: i < experiences.length - 1 ? '1px solid #e0f2fe' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0c4a6e' }}>{exp.poste}</div>
                <div style={{ fontSize: '10.5px', color: '#7dd3fc' }}>{exp.periode}</div>
              </div>
              <div style={{ fontSize: '12px', color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '11px', lineHeight: 1.6, color: '#0e7490', marginBottom: '3px' }}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {formations.length > 0 && (
          <div style={ileCard}>
            <div style={ileTitle}>Formations</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#0c4a6e' }}>{f.diplome}</div>
                <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{[f.etablissement, f.periode].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}
        {(langues.length > 0 || certifications.length > 0 || centresInteret.length > 0) && (
          <div style={ileCard}>
            {langues.length > 0 && (
              <div style={{ marginBottom: (certifications.length || centresInteret.length) ? '16px' : 0 }}>
                <div style={ileTitle}>Langues</div>
                {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#0e7490', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
              </div>
            )}
            {certifications.length > 0 && (
              <div style={{ marginBottom: centresInteret.length ? '16px' : 0 }}>
                <div style={ileTitle}>Certifications</div>
                {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#0e7490', marginBottom: '5px' }}>{c.titre}</div>)}
              </div>
            )}
            {centresInteret.length > 0 && (
              <div>
                <div style={ileTitle}>Centres d'intérêt</div>
                <div style={{ fontSize: '11px', color: '#0e7490' }}>{centresInteret.join(' · ')}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 55 : GRAVURE — Carte de visite premium
// ═══════════════════════════════════════════════════════════════════
function Gravure({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const FONT = '"Playfair Display", Georgia, serif'
  const sansFont = '"Inter", sans-serif'

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fffef7', border: '1px solid #e7e5e4',
      padding: '56px 64px', boxSizing: 'border-box', fontFamily: FONT, overflow: 'hidden', color: '#1c1917',
    }}>
      <div style={{ height: '3px', background: color, width: '100%' }} />
      <div style={{ padding: '28px 0 0', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.5px' }}>{cvData.prenom} {cvData.nom}</div>
      </div>
      <div style={{ height: '1px', background: color, width: '100%', marginTop: '20px' }} />
      {cvData.titre && (
        <div style={{ fontSize: '14px', fontWeight: 400, fontStyle: 'italic', color: '#78716c', textAlign: 'center', padding: '10px 0' }}>{cvData.titre}</div>
      )}
      <div style={{ height: '3px', background: color, width: '100%', marginBottom: '28px' }} />

      {showPhoto && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme="rond" showPhoto={showPhoto} />
        </div>
      )}

      {contacts.length > 0 && (
        <div style={{ textAlign: 'center', fontFamily: sansFont, fontSize: '10px', color: '#78716c', marginBottom: '30px' }}>
          {contacts.join('  ✦  ')}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ textAlign: 'center', fontStyle: 'italic', fontSize: '12px', lineHeight: 1.7, color: '#44403c', maxWidth: '520px', margin: '0 auto 30px' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', textAlign: 'center' }}>❦&nbsp;&nbsp;Expériences&nbsp;&nbsp;❦</div>
          <div style={{ height: '1px', background: '#d6d3d1', width: '100%', marginTop: '8px', marginBottom: '20px' }} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ textAlign: 'center', marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#1c1917' }}>{exp.poste}</div>
              <div style={{ fontFamily: sansFont, fontSize: '11px', fontStyle: 'italic', color: '#78716c', marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ fontFamily: sansFont, fontSize: '10px', color: '#a8a29e', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <div style={{ maxWidth: '480px', margin: '0 auto' }}>
                  {exp.missions.map((m, j) => (
                    <div key={j} style={{ fontFamily: sansFont, fontSize: '10.5px', lineHeight: 1.7, color: '#44403c' }}>{m}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917', textAlign: 'center' }}>❦&nbsp;&nbsp;Formations&nbsp;&nbsp;❦</div>
          <div style={{ height: '1px', background: '#d6d3d1', width: '100%', marginTop: '8px', marginBottom: '20px' }} />
          {formations.map((f, i) => (
            <div key={i} style={{ textAlign: 'center', marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{f.diplome}</div>
              <div style={{ fontFamily: sansFont, fontSize: '11px', color: '#78716c', marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '30px', textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1c1917' }}>❦&nbsp;&nbsp;Compétences&nbsp;&nbsp;❦</div>
          <div style={{ height: '1px', background: '#d6d3d1', width: '100%', marginTop: '8px', marginBottom: '20px' }} />
          <div style={{ fontFamily: sansFont, fontSize: '11px', color: '#44403c', lineHeight: 2 }}>{competences.join('   ·   ')}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
        {langues.length > 0 && (
          <div>
            <div style={{ fontFamily: sansFont, fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '8px' }}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontFamily: sansFont, fontSize: '11px', color: '#44403c' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div>
            <div style={{ fontFamily: sansFont, fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '8px' }}>Certifications</div>
            {certifications.map((c, i) => <div key={i} style={{ fontFamily: sansFont, fontSize: '11px', color: '#44403c' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div>
            <div style={{ fontFamily: sansFont, fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#a8a29e', marginBottom: '8px' }}>Centres d'intérêt</div>
            <div style={{ fontFamily: sansFont, fontSize: '11px', color: '#44403c' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 56 : MÉTRO — Plan de métro parisien
// ═══════════════════════════════════════════════════════════════════
function Metro({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const lignes = ['#dc2626', '#2563eb', '#16a34a', '#f97316']
  let ligneIndex = 0
  const badge = (label) => {
    const c = lignes[ligneIndex % lignes.length]
    ligneIndex++
    return <div style={{ display: 'inline-block', padding: '4px 14px', borderRadius: '2px', background: c, color: '#fff', fontSize: '10px', fontWeight: 700, marginBottom: '14px' }}>{label}</div>
  }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff', position: 'relative',
      padding: '40px 48px 40px 60px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#1c1917',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '12px', height: '100%', background: color }} />
      <div style={{ position: 'absolute', top: '40px', left: '-2px', width: '32px', height: '32px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 700, border: '3px solid #fff' }}>1</div>

      <div style={{ overflow: 'hidden' }}>
        <div style={{ float: 'right', marginLeft: '20px' }}>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme="rond" showPhoto={showPhoto} />
        </div>
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#1c1917' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 400, color: '#6b7280', marginTop: '4px' }}>{cvData.titre}</div>}
      </div>

      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#6b7280', marginTop: '12px', marginBottom: '24px', clear: 'both' }}>
          {contacts.map((c, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {i > 0 && <span style={{ color, fontSize: '8px' }}>●</span>}{c}
            </span>
          ))}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#374151', marginBottom: '24px', clear: 'both' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {badge('Expériences')}
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1c1917' }}>{exp.poste}</div>
                <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
              </div>
              <div style={{ fontSize: '12px', color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {badge('Formations')}
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{f.diplome}</div>
                <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          {badge('Compétences')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', color: '#374151' }}>{c}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            {badge('Langues')}
            <div>{langues.map((l, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}</div>
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            {badge('Certifications')}
            <div>{certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{c.titre}</div>)}</div>
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            {badge("Centres d'intérêt")}
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 57 : CONSTELLATION — Points connectés
// ═══════════════════════════════════════════════════════════════════
function Constellation({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#1e1b4b', marginBottom: '16px' }
  const puce = { display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: color }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff', position: 'relative',
      padding: '46px 52px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#1e1b4b',
    }}>
      <svg width="220" height="180" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06 }}>
        <circle cx="40" cy="30" r="3" fill={color} /><circle cx="110" cy="60" r="3" fill={color} /><circle cx="180" cy="20" r="3" fill={color} />
        <circle cx="150" cy="110" r="3" fill={color} /><circle cx="60" cy="130" r="3" fill={color} /><circle cx="200" cy="140" r="3" fill={color} />
        <line x1="40" y1="30" x2="110" y2="60" stroke={color} strokeWidth="1" /><line x1="110" y1="60" x2="180" y2="20" stroke={color} strokeWidth="1" />
        <line x1="110" y1="60" x2="150" y2="110" stroke={color} strokeWidth="1" /><line x1="150" y1="110" x2="60" y2="130" stroke={color} strokeWidth="1" />
        <line x1="150" y1="110" x2="200" y2="140" stroke={color} strokeWidth="1" />
      </svg>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={92} color={color} forme="rond" showPhoto={showPhoto} />
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1e1b4b', letterSpacing: '-0.4px' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '14px', color, marginTop: '5px' }}>{cvData.titre}</div>}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#6b7280', marginTop: '13px' }}>
                {contacts.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
        </div>

        {cvData.accroche && (
          <div style={{ marginBottom: '28px', fontSize: '11.5px', lineHeight: 1.7, color: '#374151' }}>
            <span style={{ color, marginRight: '6px' }}>✦</span>{cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}><span style={puce} />Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ position: 'relative', borderLeft: `1px solid ${color}30`, paddingLeft: '14px', marginLeft: '6px', marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
                <span style={{ position: 'absolute', left: '-5px', top: '4px', width: '10px', height: '10px', borderRadius: '50%', background: color }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e1b4b' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}><span style={puce} />Formations</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e1b4b' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}><span style={puce} />Compétences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {competences.map((c, i) => <span key={i} style={{ padding: '5px 13px', borderRadius: '20px', border: `1px solid ${color}`, color, background: 'transparent', fontSize: '10px' }}>{c}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}><span style={puce} />Langues</div>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '5px', color: '#374151' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}><span style={puce} />Certifications</div>
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}><span style={puce} />Centres d'intérêt</div>
              <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 58 : TATAMI — Minimalisme japonais
// ═══════════════════════════════════════════════════════════════════
function Tatami({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '9px', fontWeight: 500, letterSpacing: '3px', textTransform: 'uppercase', color: '#a1a1aa' }
  const sectionRule = { height: '1px', background: '#e4e4e7', width: '100%', marginTop: '6px', marginBottom: '20px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fafafa',
      padding: '70px 80px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', fontWeight: 300, overflow: 'hidden', color: '#3f3f46',
    }}>
      <div style={{ overflow: 'hidden' }}>
        {showPhoto && (
          <div style={{ float: 'right', marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={78} color={color} forme="carre" showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '28px', fontWeight: 300, color: '#18181b', letterSpacing: '-0.5px' }}>{cvData.prenom} {cvData.nom}</div>
        <div style={{ height: '1px', background: '#18181b', width: '40px', margin: '10px 0' }} />
        {cvData.titre && <div style={{ fontSize: '12px', fontWeight: 300, textTransform: 'uppercase', letterSpacing: '4px', color: '#71717a' }}>{cvData.titre}</div>}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', fontSize: '9.5px', fontWeight: 300, color: '#a1a1aa', marginTop: '16px' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ fontSize: '12px', fontWeight: 300, lineHeight: 1.9, color: '#3f3f46', marginTop: '36px', marginBottom: '36px', clear: 'both' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '40px', clear: 'both' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '32px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 400, color: '#18181b' }}>{exp.poste}</div>
              <div style={{ fontSize: '11px', fontWeight: 300, color: '#71717a', marginTop: '4px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ fontSize: '10px', fontWeight: 300, color: '#a1a1aa', marginTop: '3px', marginBottom: '10px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && exp.missions.map((m, j) => (
                <div key={j} style={{ fontSize: '10.5px', fontWeight: 300, lineHeight: 1.8, color: '#52525b' }}>{m}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '24px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 400, color: '#18181b' }}>{f.diplome}</div>
              <div style={{ fontSize: '11px', fontWeight: 300, color: '#71717a', marginTop: '4px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              <div style={{ fontSize: '10px', fontWeight: 300, color: '#a1a1aa', marginTop: '3px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', fontWeight: 300, color: '#52525b', lineHeight: 2 }}>{competences.join('   ·   ')}</div>
        </div>
      )}

      {(langues.length > 0 || certifications.length > 0 || centresInteret.length > 0) && (
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Langues</div>
              <div style={sectionRule} />
              {langues.map((l, i) => <div key={i} style={{ fontSize: '10.5px', fontWeight: 300, color: '#52525b', marginBottom: '6px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Certifications</div>
              <div style={sectionRule} />
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '10.5px', fontWeight: 300, color: '#52525b', marginBottom: '6px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={sectionRule} />
              <div style={{ fontSize: '10.5px', fontWeight: 300, color: '#52525b' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 59 : CARROUSEL — Moderne dynamique
// ═══════════════════════════════════════════════════════════════════
function Carrousel({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const tabTitle = { display: 'inline-block', padding: '8px 18px', background: '#0c0c0c', color: '#fff', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', borderRadius: '4px 4px 0 0' }
  const tabBody = { borderTop: '2px solid #0c0c0c', paddingTop: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{ height: '160px', background: '#0c0c0c' }}>
        <div style={{ height: '6px', background: color }} />
        <div style={{ padding: '0 52px', display: 'flex', alignItems: 'center', height: '154px', gap: '24px' }}>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme="rond" showPhoto={showPhoto} />
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '14px', color, marginTop: '5px' }}>{cvData.titre}</div>}
          </div>
          {contacts.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginLeft: 'auto' }}>
              {contacts.map((c, i) => <div key={i}>{c}</div>)}
            </div>
          )}
        </div>
      </div>
      <div style={{ height: '4px', background: `linear-gradient(90deg, ${color} 0%, ${color}44 50%, transparent 100%)` }} />

      <div style={{ padding: '36px 52px' }}>
        {cvData.accroche && (
          <div style={{ marginBottom: '26px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151' }}>{cvData.accroche}</div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={tabTitle}>Expériences</div>
            <div style={tabBody}>
              {experiences.map((exp, i) => (
                <div key={i} style={{ background: '#fafafa', borderRadius: '0 8px 8px 8px', padding: '16px 18px', marginBottom: i < experiences.length - 1 ? '12px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                    <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{exp.periode}</div>
                  </div>
                  <div style={{ fontSize: '11.5px', color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {exp.missions.map((m, j) => (
                        <li key={j} style={{ fontSize: '11px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>{m}</li>
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
            <div style={tabTitle}>Formations</div>
            <div style={tabBody}>
              {formations.map((f, i) => (
                <div key={i} style={{ background: '#fafafa', borderRadius: '0 8px 8px 8px', padding: '16px 18px', marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                    <div style={{ fontSize: '10.5px', color: '#9ca3af' }}>{f.periode}</div>
                  </div>
                  <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={tabTitle}>Compétences</div>
            <div style={tabBody}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {competences.map((c, i) => <span key={i} style={{ padding: '6px 14px', borderRadius: '20px', background: color, color: '#fff', fontSize: '10.5px', fontWeight: 600 }}>{c}</span>)}
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={tabTitle}>Langues</div>
              <div style={tabBody}>{langues.map((l, i) => <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}</div>
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={tabTitle}>Certifications</div>
              <div style={tabBody}>{certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{c.titre}</div>)}</div>
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={tabTitle}>Centres d'intérêt</div>
              <div style={tabBody}><div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 60 : FORÊT — Nature et impact durable
// ═══════════════════════════════════════════════════════════════════
function Foret({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#14532d', marginBottom: '16px' }
  const valeurs = ['🌱 RSE', '♻️ Impact', '🤝 Collectif']

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#f0fdf4', position: 'relative',
      padding: '46px 52px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#14532d',
    }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '80px', opacity: 0.08 }}>🍃</div>
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', fontSize: '80px', opacity: 0.08 }}>🍃</div>

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '16px' }}>
        <div style={{ borderRadius: '50%', boxShadow: '0 4px 12px rgba(21,128,61,0.2)', border: '4px solid #ffffff', width: 'fit-content' }}>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={90} color={color} forme="rond" showPhoto={showPhoto} />
        </div>
        <div>
          <div style={{ fontSize: '26px', fontWeight: 700, color: '#14532d', letterSpacing: '-0.3px' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 500, color, marginTop: '5px' }}>{cvData.titre}</div>}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {valeurs.map((v, i) => (
              <span key={i} style={{ background: '#dcfce7', color: '#15803d', borderRadius: '12px', padding: '3px 10px', fontSize: '9.5px' }}>{v}</span>
            ))}
          </div>
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#166534', marginTop: '12px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
      </div>

      {cvData.accroche && (
        <div style={{ position: 'relative', background: '#dcfce7', borderRadius: '10px', padding: '18px 20px', borderLeft: `4px solid ${color}`, fontSize: '11.5px', lineHeight: 1.7, color: '#14532d', marginBottom: '28px' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '28px' }}>
          <div style={sectionTitle}>🌿 Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px 18px', marginBottom: i < experiences.length - 1 ? '12px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#14532d' }}>{exp.poste}</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>{exp.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', color, marginTop: '3px', marginBottom: '8px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#166534', marginBottom: '3px' }}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '28px' }}>
          <div style={sectionTitle}>🌿 Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '16px 18px', marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#14532d' }}>{f.diplome}</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>{f.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ position: 'relative', marginBottom: '28px' }}>
          <div style={sectionTitle}>🌿 Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => <span key={i} style={{ padding: '5px 12px', background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '20px', fontSize: '10.5px', color: '#166534' }}>{c}</span>)}
          </div>
        </div>
      )}

      <div style={{ position: 'relative', display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>🌿 Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#166534', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>🌿 Certifications</div>
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#166534', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>🌿 Centres d'intérêt</div>
            <div style={{ fontSize: '11px', color: '#166534' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Comme PhotoCV mais avec un borderRadius/bordure personnalisés — nécessaire
// pour les formes organiques (Aquarelle, Storyboard) que PhotoCV ne supporte pas.
function PhotoOrganic({ photo, initiales, size, color, radius, border }) {
  const style = { width: size, height: size, borderRadius: radius, objectFit: 'cover', display: 'block', flexShrink: 0, border }
  if (photo) return <img src={photo} alt="photo" style={style} />
  return (
    <div style={{
      ...style, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color, fontSize: size * 0.3, fontWeight: 700, fontFamily: '"Inter", sans-serif',
    }}>
      {initiales}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 61 : AQUARELLE — Douceur artistique, taches de couleur
// ═══════════════════════════════════════════════════════════════════
function Aquarelle({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color, marginBottom: '8px' }
  const sectionRule = { height: '2px', background: color, opacity: 0.4, marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff', position: 'relative',
      padding: '48px 54px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#1c1917',
    }}>
      <svg width="200" height="150" style={{ position: 'absolute', top: '-30px', right: '-30px', opacity: 0.08 }}>
        <ellipse cx="100" cy="75" rx="100" ry="75" fill={color} />
      </svg>
      <svg width="150" height="120" style={{ position: 'absolute', bottom: '-20px', left: '-20px', opacity: 0.08 }}>
        <ellipse cx="75" cy="60" rx="75" ry="60" fill={`${color}cc`} />
      </svg>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '28px' }}>
          {showPhoto && (
            <PhotoOrganic photo={cvData.photo} initiales={initiales} size={88} color={color} radius="60% 40% 70% 30% / 50% 60% 40% 50%" border={`3px solid ${color}30`} />
          )}
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#1c1917' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color, marginTop: '5px' }}>{cvData.titre}</div>}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#78716c', marginTop: '12px' }}>
                {contacts.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
        </div>

        {cvData.accroche && (
          <div style={{ borderLeft: `3px solid ${color}`, paddingLeft: '16px', fontStyle: 'italic', fontSize: '12px', lineHeight: 1.75, color: '#44403c', marginBottom: '28px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1c1917' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: '#a8a29e' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', color, marginTop: '3px', marginBottom: '8px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
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

        {formations.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}>Formations</div>
            <div style={sectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#a8a29e' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
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
                <span key={i} style={{ borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%', background: `${color}15`, color, padding: '5px 13px', fontSize: '10px' }}>{c}</span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Langues</div>
              <div style={sectionRule} />
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Certifications</div>
              <div style={sectionRule} />
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={sectionRule} />
              <div style={{ fontSize: '11px', color: '#44403c' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 62 : QUANTUM — Futuriste, deep tech
// ═══════════════════════════════════════════════════════════════════
function Quantum({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#0f172a', marginBottom: '16px' }
  const puce = { display: 'inline-block', width: '7px', height: '7px', background: color, transform: 'rotate(45deg)' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      padding: '44px 50px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#0f172a',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'inline-block', padding: '3px 10px', background: `${color}12`, borderRadius: '4px', fontSize: '9px', fontWeight: 600, color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>
            Profil professionnel
          </div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.8px' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 500, color: '#64748b', marginTop: '6px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: '#94a3b8', marginTop: '14px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {showPhoto && (
          <PhotoCV photo={cvData.photo} initiales={initiales} size={84} color={color} forme="carre_arrondi" showPhoto={showPhoto} />
        )}
      </div>

      <div style={{ height: '1px', background: `linear-gradient(90deg, ${color}, ${color}00)`, marginTop: '24px', marginBottom: '24px' }} />

      {cvData.accroche && (
        <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#334155', marginBottom: '28px' }}>{cvData.accroche}</div>
      )}

      {competences.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '28px' }}>
          {competences.map((c, i) => (
            <span key={i} style={{ padding: '4px 12px', background: '#f1f5f9', borderRadius: '6px', fontSize: '10px', fontWeight: 600, color: '#475569', fontFamily: 'monospace, sans-serif' }}>{c}</span>
          ))}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}><span style={puce} />Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{exp.poste}</div>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 600, color: '#64748b' }}>{exp.periode}</span>
              </div>
              <div style={{ fontSize: '11.5px', color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#475569', marginBottom: '3px' }}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '26px' }}>
          <div style={sectionTitle}><span style={puce} />Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>{f.diplome}</div>
                <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 600, color: '#64748b' }}>{f.periode}</span>
              </div>
              <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}><span style={puce} />Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#475569', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}><span style={puce} />Certifications</div>
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#475569', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}><span style={puce} />Centres d'intérêt</div>
            <div style={{ fontSize: '11px', color: '#475569' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 63 : STORYBOARD — Narration visuelle
// ═══════════════════════════════════════════════════════════════════
function Storyboard({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)

  const sections = []
  if (experiences.length) sections.push({
    titre: 'Expériences', node: (
      <>
        {experiences.map((exp, i) => (
          <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1c1917' }}>{exp.poste}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e' }}>{exp.periode}</div>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, color, margin: '3px 0 8px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
            {exp.missions?.length > 0 && exp.missions.map((m, j) => (
              <div key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#44403c', marginBottom: '3px' }}>{m}</div>
            ))}
          </div>
        ))}
      </>
    ),
  })
  if (formations.length) sections.push({
    titre: 'Formations', node: (
      <>
        {formations.map((f, i) => (
          <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{f.diplome}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e' }}>{f.periode}</div>
            </div>
            <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
          </div>
        ))}
      </>
    ),
  })
  if (competences.length) sections.push({
    titre: 'Compétences', node: <div style={{ fontSize: '11px', lineHeight: 1.9, color: '#44403c' }}>{competences.join('  ·  ')}</div>,
  })
  if (langues.length || certifications.length || centresInteret.length) sections.push({
    titre: 'Divers', node: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {langues.length > 0 && <div style={{ fontSize: '11px', color: '#44403c' }}><strong>Langues :</strong> {langues.map(l => `${l.langue} (${l.niveau})`).join(', ')}</div>}
        {certifications.length > 0 && <div style={{ fontSize: '11px', color: '#44403c' }}><strong>Certifications :</strong> {certifications.map(c => c.titre).join(', ')}</div>}
        {centresInteret.length > 0 && <div style={{ fontSize: '11px', color: '#44403c' }}><strong>Centres d'intérêt :</strong> {centresInteret.join(', ')}</div>}
      </div>
    ),
  })

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff', position: 'relative',
      padding: '40px 46px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#1c1917',
    }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '100px', fontWeight: 900, color: `${color}06`, lineHeight: 1 }}>01</div>

      <div style={{ position: 'relative', marginBottom: '28px' }}>
        {showPhoto && (
          <div style={{ marginBottom: '16px' }}>
            <PhotoOrganic photo={cvData.photo} initiales={initiales} size={92} color={color} radius="50% 50% 50% 50% / 40% 40% 60% 60%" border={`3px solid ${color}25`} />
          </div>
        )}
        <div style={{ fontSize: '27px', fontWeight: 700, color: '#1c1917' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '14px', color, marginTop: '4px' }}>{cvData.titre}</div>}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: '#78716c', marginTop: '12px' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ position: 'relative', background: `${color}08`, borderRadius: '8px', padding: '20px', marginBottom: '28px' }}>
          <div style={{ position: 'absolute', top: '-8px', left: '12px', fontSize: '64px', color: `${color}20`, lineHeight: 1 }}>"</div>
          <div style={{ position: 'relative', fontSize: '12px', lineHeight: 1.75, color: '#44403c', fontStyle: 'italic' }}>{cvData.accroche}</div>
        </div>
      )}

      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: i < sections.length - 1 ? '30px' : 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color, marginRight: '10px' }}>{String(i + 2).padStart(2, '0')} —</span>
            <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#1c1917' }}>{s.titre}</span>
          </div>
          <div style={{ height: '1px', background: '#e7e5e4', marginTop: '8px', marginBottom: '18px' }} />
          {s.node}
        </div>
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 64 : INSTITUTION — Grandes institutions, académique
// ═══════════════════════════════════════════════════════════════════
function Institution({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color, textDecoration: 'underline', textDecorationColor: `${color}40`, textUnderlineOffset: '4px', marginBottom: '18px' }
  const logoInitiale = (experiences[0]?.entreprise || cvData.prenom || 'D').trim()[0]?.toUpperCase() || 'D'

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      padding: '52px 60px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#1e3a8a',
    }}>
      <div style={{ overflow: 'hidden' }}>
        <div style={{
          width: '56px', height: '56px', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '22px', fontWeight: 700, color, float: 'left', marginRight: '20px',
        }}>
          {logoInitiale}
        </div>
        {showPhoto && (
          <div style={{ float: 'right', marginLeft: '20px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={72} color={color} forme="carre" showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '26px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginTop: '6px' }}>{cvData.titre}</div>}
      </div>

      <div style={{ clear: 'both', marginTop: '20px' }}>
        <div style={{ height: '3px', background: color }} />
        <div style={{ height: '1px', background: color, marginTop: '3px' }} />
      </div>

      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '10.5px', color: '#374151', marginTop: '24px', marginBottom: '28px' }}>
          {contacts.map((c, i) => (
            <span key={i}>{i > 0 && <span style={{ marginRight: '20px', color: '#d1d5db' }}>|</span>}{c}</span>
          ))}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#374151', marginBottom: '28px' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: '0.3px' }}>{exp.poste}</div>
              <div style={{ fontSize: '12px', color: '#374151', marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ fontSize: '10px', color: '#6b7280', fontStyle: 'italic', marginTop: '2px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: '8px 0 0', padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '11px', lineHeight: 1.65, color: '#374151', marginBottom: '3px' }}>{m}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Formations et diplômes</div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {formations.map((f, i) => (
              <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color }}>{i + 1}.</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#1e3a8a' }}>{f.diplome}</div>
                  <div style={{ fontSize: '11px', color: '#374151', marginTop: '2px' }}>{[f.etablissement, f.periode].filter(Boolean).join(' — ')}</div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {certifications.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Certifications</div>
          <ol style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {certifications.map((c, i) => (
              <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < certifications.length - 1 ? '8px' : 0 }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color }}>{i + 1}.</span>
                <div style={{ fontSize: '11.5px', color: '#374151' }}>{c.titre}{c.organisme ? ` — ${c.organisme}` : ''}</div>
              </li>
            ))}
          </ol>
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ fontSize: '11.5px', color: '#374151', lineHeight: 1.9 }}>{competences.join('  ·  ')}</div>
        </div>
      )}

      {(langues.length > 0 || centresInteret.length > 0) && (
        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Langues</div>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 65 : MANIFESTE — Déclaration personnelle, leadership
// ═══════════════════════════════════════════════════════════════════
function Manifeste({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '10px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#0f0f1a',
      padding: '52px 58px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#fff',
    }}>
      {showPhoto && (
        <div style={{ marginBottom: '20px' }}>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={96} color="#ffffff" forme="rond" showPhoto={showPhoto} />
        </div>
      )}

      <div style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '8px' }}>
        {cvData.prenom} {cvData.nom}
      </div>
      <div style={{ height: '4px', background: '#ffffff', width: '48px', marginBottom: '12px' }} />
      {cvData.titre && (
        <div style={{ fontSize: '15px', fontWeight: 400, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '20px' }}>{cvData.titre}</div>
      )}
      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '32px' }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
            Ce que je crois. Ce que je construis. Ce que j'apporte.
          </div>
          <div style={{ fontSize: '15px', fontWeight: 400, lineHeight: 1.8, color: 'rgba(255,255,255,0.85)', textAlign: 'center', maxWidth: '560px', margin: '0 auto' }}>
            {cvData.accroche}
          </div>
        </div>
      )}

      <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '32px' }} />

      {experiences.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${color}`, paddingLeft: '14px', marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff' }}>{exp.poste}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.35)', marginTop: '3px', marginBottom: '10px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', marginBottom: '3px' }}>
                      <span style={{ position: 'absolute', left: 0, color: 'rgba(255,255,255,0.3)' }}>—</span>{m}
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
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#ffffff' }}>{f.diplome}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', marginTop: '3px' }}>{[f.etablissement, f.periode].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {competences.map((c, i) => (
              <span key={i} style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '5px 13px', borderRadius: '4px', fontSize: '10px' }}>{c}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Certifications</div>
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 66 : PIXEL — Gaming, culture geek
// ═══════════════════════════════════════════════════════════════════
function Pixel({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const anneesExp = anneesExperience(experiences) || experiences.length
  const xpPercent = Math.min(90, 60 + anneesExp * 3)
  const pixels = [
    { top: '16px', left: '16px' }, { top: '16px', left: '30px' }, { top: '30px', left: '16px' },
    { bottom: '16px', right: '16px' }, { bottom: '16px', right: '30px' }, { bottom: '30px', right: '16px' },
  ]

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fafaf9', position: 'relative',
      padding: '40px 46px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#18181b',
    }}>
      {pixels.map((p, i) => <div key={i} style={{ position: 'absolute', width: '8px', height: '8px', background: color, opacity: 0.15, ...p }} />)}

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {showPhoto && (
          <div style={{ float: 'right' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme="carre" showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '3px', color, marginBottom: '6px' }}>Player</div>
        <div style={{ fontSize: '30px', fontWeight: 800, color: '#18181b', letterSpacing: '-0.5px' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && (
          <div style={{ display: 'inline-block', background: color, padding: '3px 12px', borderRadius: '3px', fontSize: '11px', fontWeight: 600, color: '#ffffff', textTransform: 'uppercase', marginTop: '8px' }}>{cvData.titre}</div>
        )}
      </div>

      <div style={{ clear: 'both', marginTop: '20px', marginBottom: '24px' }}>
        <div style={{ fontSize: '9px', color: '#71717a', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>Niveau d'expérience</div>
        <div style={{ height: '8px', background: '#e4e4e7', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ width: `${xpPercent}%`, height: '100%', background: color }} />
        </div>
      </div>

      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '9.5px', color: '#71717a', marginBottom: '24px' }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#52525b', marginBottom: '24px' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'inline-block', background: '#18181b', color: '#ffffff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '4px 4px 0 0' }}>Expériences</div>
          <div style={{ borderTop: '2px solid #18181b', paddingTop: '14px' }}>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '16px' : 0 }}>
                <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '1px', color: '#a1a1aa' }}>📍 Mission</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{exp.poste}</div>
                <div style={{ fontSize: '10.5px', color: '#71717a' }}>{[exp.entreprise, exp.periode].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ fontSize: '10px', lineHeight: 1.55, color: '#52525b', marginBottom: '2px' }}>
                        <span style={{ color, marginRight: '6px' }}>▶</span>{m}
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
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'inline-block', background: '#18181b', color: '#ffffff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '4px 4px 0 0' }}>Formations</div>
          <div style={{ borderTop: '2px solid #18181b', paddingTop: '14px' }}>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#18181b' }}>{f.diplome}</div>
                <div style={{ fontSize: '10.5px', color: '#71717a' }}>{[f.etablissement, f.periode].filter(Boolean).join(' · ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'inline-block', background: '#18181b', color: '#ffffff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '4px 4px 0 0' }}>Compétences</div>
          <div style={{ borderTop: '2px solid #18181b', paddingTop: '14px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => <span key={i} style={{ padding: '4px 10px', background: `${color}15`, color, borderRadius: '3px', fontSize: '10px', fontWeight: 600 }}>{c}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ display: 'inline-block', background: '#18181b', color: '#ffffff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '4px 4px 0 0' }}>Langues</div>
            <div style={{ borderTop: '2px solid #18181b', paddingTop: '14px' }}>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '10.5px', color: '#52525b', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ display: 'inline-block', background: '#18181b', color: '#ffffff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '4px 4px 0 0' }}>Certifications</div>
            <div style={{ borderTop: '2px solid #18181b', paddingTop: '14px' }}>
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '10.5px', color: '#52525b', marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ display: 'inline-block', background: '#18181b', color: '#ffffff', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', padding: '4px 12px', borderRadius: '4px 4px 0 0' }}>Divers</div>
            <div style={{ borderTop: '2px solid #18181b', paddingTop: '14px', fontSize: '10.5px', color: '#52525b' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 67 : PANORAMA — Vision large, grand format
// ═══════════════════════════════════════════════════════════════════
function Panorama({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color }
  const sectionRule = { width: '28px', height: '2px', background: color, marginTop: '6px', marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{ height: '180px', position: 'relative', overflow: 'hidden' }}>
        {cvData.photo && showPhoto ? (
          <img src={cvData.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, #0f172a 0%, ${color} 100%)` }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)' }} />
        <div style={{ position: 'absolute', left: '40px', bottom: '24px' }}>
          <div style={{ fontSize: '32px', fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', marginTop: '6px' }}>{cvData.titre}</div>}
        </div>
      </div>

      {contacts.length > 0 && (
        <div style={{ background: color, padding: '12px 40px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          {contacts.map((c, i) => <span key={i} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.9)' }}>{c}</span>)}
        </div>
      )}

      <div style={{ padding: '36px 40px', display: 'flex', gap: '36px' }}>
        <div style={{ flex: 2 }}>
          {cvData.accroche && (
            <div style={{ marginBottom: '26px', fontSize: '11.5px', lineHeight: 1.65, color: '#374151' }}>{cvData.accroche}</div>
          )}
          {experiences.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={sectionTitle}>Expériences</div>
              <div style={sectionRule} />
              {experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{exp.periode}</div>
                  </div>
                  <div style={{ fontSize: '11.5px', color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {exp.missions.map((m, j) => (
                        <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>{m}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {formations.length > 0 && (
            <div>
              <div style={sectionTitle}>Formations</div>
              <div style={sectionRule} />
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                    <div style={{ fontSize: '10px', color: '#9ca3af' }}>{f.periode}</div>
                  </div>
                  <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {competences.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={sectionTitle}>Compétences</div>
              <div style={sectionRule} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {competences.map((c, i) => <span key={i} style={{ padding: '5px 11px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10px', color: '#374151' }}>{c}</span>)}
              </div>
            </div>
          )}
          {langues.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={sectionTitle}>Langues</div>
              <div style={sectionRule} />
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ marginBottom: '28px' }}>
              <div style={sectionTitle}>Certifications</div>
              <div style={sectionRule} />
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{c.titre}</div>)}
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
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 68 : KODAK — Vintage photographique
// ═══════════════════════════════════════════════════════════════════
function Kodak({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const FONT = 'Georgia, "Playfair Display", serif'

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fffef0', border: '8px solid #f5f0e0',
      padding: '48px 54px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#1c1917',
    }}>
      <div style={{ overflow: 'hidden' }}>
        {showPhoto && (
          <div style={{ float: 'right', marginLeft: '24px', background: '#fff', padding: '12px 12px 40px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', transform: 'rotate(-2deg)', display: 'inline-block' }}>
            {cvData.photo ? (
              <img src={cvData.photo} alt="" style={{ width: '120px', height: '120px', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '120px', height: '120px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '36px', fontWeight: 700, fontFamily: '"Inter", sans-serif' }}>
                {initiales}
              </div>
            )}
            <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#78716c', textAlign: 'center', marginTop: '8px' }}>{cvData.prenom}</div>
          </div>
        )}
        <div style={{ fontFamily: FONT, fontSize: '30px', fontWeight: 700, color: '#1c1917' }}>{cvData.prenom} {cvData.nom}</div>
        <div style={{ height: '1px', background: '#d6d3d1', marginTop: '10px', marginBottom: '8px' }} />
        {cvData.titre && <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#78716c' }}>{cvData.titre}</div>}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#a8a29e', marginTop: '12px' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ fontFamily: FONT, fontSize: '13px', fontStyle: 'italic', lineHeight: 1.8, color: '#44403c', background: '#f5f0e0', borderRadius: '4px', padding: '16px 20px', marginTop: '28px', marginBottom: '28px', clear: 'both' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '28px', clear: 'both' }}>
          <div style={{ fontFamily: FONT, fontSize: '16px', fontWeight: 700, color: '#1c1917', borderBottom: '2px solid #1c1917', paddingBottom: '4px', marginBottom: '16px' }}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ fontFamily: FONT, fontSize: '14px', fontWeight: 700, color: '#1c1917' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#78716c', marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
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

      {formations.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily: FONT, fontSize: '16px', fontWeight: 700, color: '#1c1917', borderBottom: '2px solid #1c1917', paddingBottom: '4px', marginBottom: '16px' }}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontFamily: FONT, fontSize: '13px', fontWeight: 700, color: '#1c1917' }}>{f.diplome}</div>
              <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#78716c', marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontFamily: FONT, fontSize: '16px', fontWeight: 700, color: '#1c1917', borderBottom: '2px solid #1c1917', paddingBottom: '4px', marginBottom: '16px' }}>Compétences</div>
          <div style={{ fontSize: '11px', color: '#44403c', lineHeight: 1.9 }}>{competences.join('  ·  ')}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={{ fontFamily: FONT, fontSize: '16px', fontWeight: 700, color: '#1c1917', borderBottom: '2px solid #1c1917', paddingBottom: '4px', marginBottom: '16px' }}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={{ fontFamily: FONT, fontSize: '16px', fontWeight: 700, color: '#1c1917', borderBottom: '2px solid #1c1917', paddingBottom: '4px', marginBottom: '16px' }}>Certifications</div>
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={{ fontFamily: FONT, fontSize: '16px', fontWeight: 700, color: '#1c1917', borderBottom: '2px solid #1c1917', paddingBottom: '4px', marginBottom: '16px' }}>Centres d'intérêt</div>
            <div style={{ fontSize: '11px', color: '#44403c' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 69 : MATRICE — Grille de données, rigueur analytique
// ═══════════════════════════════════════════════════════════════════
function Matrice({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: '4px', marginBottom: '14px', display: 'inline-block' }
  const anneesExp = anneesExperience(experiences)

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#f8fafc',
      padding: '36px 44px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#0f172a',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '20px', alignItems: 'center' }}>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme="carre_arrondi" showPhoto={showPhoto} />
        <div>
          <div style={{ fontSize: '27px', fontWeight: 700, color: '#0f172a' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', color: '#64748b', marginTop: '5px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '10px', color: '#94a3b8', marginTop: '10px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
        {anneesExp && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8' }}>Expérience</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{anneesExp} ans</div>
          </div>
        )}
      </div>

      <div style={{ height: '1px', background: '#e2e8f0', marginTop: '20px', marginBottom: '24px' }} />

      {cvData.accroche && (
        <div style={{ fontSize: '11.5px', lineHeight: 1.7, color: '#334155', marginBottom: '24px' }}>{cvData.accroche}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          {experiences.length > 0 && (
            <div>
              <div style={sectionTitle}>Expériences</div>
              {experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '16px' : 0 }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>{exp.poste}</div>
                  <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                  <span style={{ display: 'inline-block', background: '#f0fdf4', color, padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', fontWeight: 600, marginTop: '4px' }}>{exp.periode}</span>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0 }}>
                      {exp.missions.map((m, j) => (
                        <li key={j} style={{ fontSize: '10px', lineHeight: 1.55, color: '#475569', marginBottom: '2px' }}>{m}</li>
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
            <div style={{ marginBottom: '20px' }}>
              <div style={sectionTitle}>Formations</div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>{[f.etablissement, f.periode].filter(Boolean).join(' — ')}</div>
                </div>
              ))}
            </div>
          )}
          {competences.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sectionTitle}>Compétences</div>
              {competences.map((c, i) => (
                <div key={i} style={{ fontSize: '10.5px', color: '#334155', marginBottom: '4px' }}>
                  <span style={{ color, marginRight: '6px' }}>●</span>{c}
                </div>
              ))}
            </div>
          )}
          {langues.length > 0 && (
            <div style={{ marginBottom: certifications.length || centresInteret.length ? '20px' : 0 }}>
              <div style={sectionTitle}>Langues</div>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '10.5px', color: '#334155', marginBottom: '4px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ marginBottom: centresInteret.length ? '20px' : 0 }}>
              <div style={sectionTitle}>Certifications</div>
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '10.5px', color: '#334155', marginBottom: '4px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={{ fontSize: '10.5px', color: '#334155' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 70 : SOLSTICE — Chaleur méditerranéenne
// ═══════════════════════════════════════════════════════════════════
function Solstice({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#92400e', marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fffbeb', position: 'relative',
      padding: '46px 52px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#78350f',
    }}>
      <svg width="260" height="260" style={{ position: 'absolute', top: '-60px', right: '-60px' }}>
        <circle cx="130" cy="130" r="100" fill={color} opacity="0.08" />
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="126" y="10" width="4" height="60" fill={color} opacity="0.06" transform={`rotate(${i * 45} 130 130)`} />
        ))}
      </svg>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{ borderRadius: '50%', border: '4px solid #ffffff', boxShadow: `0 4px 16px ${color}30`, width: 'fit-content' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={92} color={color} forme="rond" showPhoto={showPhoto} />
          </div>
          <div>
            <div style={{ fontSize: '28px', fontWeight: 700, color: '#78350f' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '14px', color, marginTop: '5px' }}>{cvData.titre}</div>}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#92400e', marginTop: '12px' }}>
                {contacts.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
        </div>

        {cvData.accroche && (
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px 24px', border: '1px solid #fde68a', boxShadow: `0 2px 8px ${color}10`, fontSize: '12px', lineHeight: 1.75, color: '#78350f', marginBottom: '28px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}>☀ Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '10px', padding: '18px 20px', border: '1px solid #fde68a', marginBottom: i < experiences.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#78350f' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: '#b45309' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '12px', color, marginTop: '3px', marginBottom: '8px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#92400e', marginBottom: '3px' }}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}>☀ Formations</div>
            {formations.map((f, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '10px', padding: '18px 20px', border: '1px solid #fde68a', marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#78350f' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#b45309' }}>{f.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '28px' }}>
            <div style={sectionTitle}>☀ Compétences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => <span key={i} style={{ padding: '5px 12px', background: '#ffffff', border: '1px solid #fde68a', borderRadius: '20px', fontSize: '10.5px', color: '#92400e' }}>{c}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>☀ Langues</div>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#92400e', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>☀ Certifications</div>
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#92400e', marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>☀ Centres d'intérêt</div>
              <div style={{ fontSize: '11px', color: '#92400e' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 71 : NORDIC — Scandinave minimaliste, fonctionnel épuré
// ═══════════════════════════════════════════════════════════════════
function Nordic({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', color, marginBottom: '14px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      padding: '56px 64px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', fontWeight: 300, overflow: 'hidden', color: '#0f172a',
    }}>
      <div style={{ overflow: 'hidden' }}>
        {showPhoto && (
          <div style={{ float: 'right', marginLeft: '28px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme="carre" showPhoto={showPhoto} />
          </div>
        )}
        <div style={{ fontSize: '28px', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.3px' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 300, color: '#64748b', marginTop: '6px' }}>{cvData.titre}</div>}
        <div style={{ height: '1px', background: '#e2e8f0', marginTop: '16px', marginBottom: '14px' }} />
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '22px', flexWrap: 'wrap', fontSize: '10px', fontWeight: 300, color: '#94a3b8' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ fontSize: '12px', fontWeight: 300, lineHeight: 1.8, color: '#475569', marginTop: '24px', marginBottom: '32px', clear: 'both' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '32px', clear: 'both' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', marginBottom: i < experiences.length - 1 ? '24px' : 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 300, color: '#94a3b8', textAlign: 'right', paddingTop: '2px' }}>{exp.periode}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 300, color: '#64748b', marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    {exp.missions.map((m, j) => (
                      <div key={j} style={{ fontSize: '10.5px', fontWeight: 300, lineHeight: 1.7, color: '#475569' }}>{m}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '16px', marginBottom: i < formations.length - 1 ? '16px' : 0 }}>
              <div style={{ fontSize: '10px', fontWeight: 300, color: '#94a3b8', textAlign: 'right', paddingTop: '2px' }}>{f.periode}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{f.diplome}</div>
                <div style={{ fontSize: '11.5px', fontWeight: 300, color: '#64748b', marginTop: '3px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ fontSize: '11px', fontWeight: 300, color: '#64748b' }}>{competences.join(' · ')}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', fontWeight: 300, color: '#475569', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Certifications</div>
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', fontWeight: 300, color: '#475569', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={{ fontSize: '11px', fontWeight: 300, color: '#475569' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 72 : MÉMOIRE — Carte mémorielle, souvenir, ancrage
// ═══════════════════════════════════════════════════════════════════
function Memoire({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '14px', fontWeight: 600, color }
  const sectionRule = { borderTop: '1px dashed #d6d3d1', marginTop: '6px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fefce8', border: '1px solid #fef08a',
      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.03)', padding: '50px 56px', boxSizing: 'border-box',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#1c1917',
    }}>
      <div style={{ overflow: 'hidden' }}>
        {showPhoto && (
          <div style={{ float: 'right', marginLeft: '20px', background: '#fff', padding: '10px 10px 36px 10px', boxShadow: '0 3px 12px rgba(0,0,0,0.1)', transform: 'rotate(1.5deg)', display: 'inline-block' }}>
            {cvData.photo ? (
              <img src={cvData.photo} alt="" style={{ width: '100px', height: '100px', objectFit: 'cover', display: 'block' }} />
            ) : (
              <div style={{ width: '100px', height: '100px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, fontSize: '30px', fontWeight: 700 }}>{initiales}</div>
            )}
            <div style={{ fontSize: '9px', fontStyle: 'italic', color: '#78716c', textAlign: 'center', marginTop: '6px' }}>{cvData.prenom}</div>
          </div>
        )}
        <div style={{ fontSize: '26px', fontWeight: 700, fontStyle: 'italic', color: '#1c1917' }}>{cvData.prenom} {cvData.nom}</div>
        <div style={{ height: '2px', background: '#1c1917', width: '50px', marginTop: '10px', marginBottom: '8px' }} />
        {cvData.titre && <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: '#78716c' }}>{cvData.titre}</div>}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#a8a29e', marginTop: '12px' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ background: '#ffffff', borderRadius: '4px', padding: '18px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', fontSize: '12px', lineHeight: 1.8, color: '#44403c', fontStyle: 'italic', marginTop: '28px', marginBottom: '28px', clear: 'both' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '30px', clear: 'both' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#78716c', marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
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

      {formations.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Formations</div>
          <div style={sectionRule} />
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', fontStyle: 'italic', color: '#78716c', marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', color: '#44403c', lineHeight: 1.9 }}>{competences.join('  ·  ')}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Langues</div>
            <div style={sectionRule} />
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Certifications</div>
            <div style={sectionRule} />
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={sectionRule} />
            <div style={{ fontSize: '11px', color: '#44403c' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 73 : TERRITOIRE — Géographie humaine, ancrage territorial
// ═══════════════════════════════════════════════════════════════════
function Territoire({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#064e3b', marginBottom: '16px' }
  const sectionRule = { height: '2px', background: color, marginTop: '6px', marginBottom: '16px', width: '100%' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#f0fdf4', position: 'relative',
      padding: '44px 50px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#064e3b',
    }}>
      <svg width="200" height="200" style={{ position: 'absolute', top: 0, right: 0, opacity: 0.06 }}>
        <path d="M0,150 Q60,100 100,140 T200,90" stroke="#065f46" strokeWidth="4" fill="none" />
        <path d="M20,40 Q80,80 150,30" stroke="#065f46" strokeWidth="3" fill="none" />
      </svg>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{ borderRadius: '50%', border: '4px solid #ffffff', boxShadow: '0 4px 12px rgba(6,95,70,0.2)', width: 'fit-content' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme="rond" showPhoto={showPhoto} />
          </div>
          <div>
            <div style={{ fontSize: '27px', fontWeight: 700, color: '#064e3b' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 500, color, marginTop: '5px' }}>{cvData.titre}</div>}
            {cvData.ville && (
              <div style={{ display: 'inline-block', background: '#064e3b', color: '#ffffff', padding: '4px 12px', borderRadius: '12px', fontSize: '10px', marginTop: '10px' }}>📍 {cvData.ville}</div>
            )}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#065f46', marginTop: '10px' }}>
                {contacts.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
        </div>

        {cvData.accroche && (
          <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: '16px', fontSize: '12px', lineHeight: 1.75, color: '#064e3b', marginBottom: '28px' }}>
            {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '8px', padding: '16px 18px', borderLeft: `3px solid ${color}`, marginBottom: i < experiences.length - 1 ? '12px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#064e3b' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#065f46', marginBottom: '3px' }}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={sectionTitle}>Formations</div>
            <div style={sectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#064e3b' }}>{f.diplome}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={sectionRule} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => <span key={i} style={{ padding: '5px 12px', background: '#ffffff', borderRadius: '4px', fontSize: '10.5px', color: '#065f46' }}>{c}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Langues</div>
              <div style={sectionRule} />
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#065f46', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Certifications</div>
              <div style={sectionRule} />
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#065f46', marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={sectionRule} />
              <div style={{ fontSize: '11px', color: '#065f46' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 74 : FACETTE — Multi-facettes, personnalité riche
// ═══════════════════════════════════════════════════════════════════
function Facette({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#111827', textAlign: 'center', marginBottom: '16px' }
  const competencesPrincipales = competences.slice(0, 5)
  const competencesRestantes = competences.slice(5)

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      padding: '40px 46px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: '20px' }}>
        <div style={{ fontSize: '10px', color: '#6b7280' }}>
          {contacts.map((c, i) => <div key={i} style={{ marginBottom: '5px' }}>{c}</div>)}
          {competencesPrincipales.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              {competencesPrincipales.map((c, i) => <div key={i} style={{ marginBottom: '5px' }}>{c}</div>)}
            </div>
          )}
        </div>
        <div>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={100} color={color} forme="rond" showPhoto={showPhoto} />
        </div>
        <div style={{ fontSize: '10px', color: '#6b7280', textAlign: 'right' }}>
          {langues.map((l, i) => <div key={i} style={{ marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          {certifications.length > 0 && (
            <div style={{ marginTop: '10px' }}>
              {certifications.map((c, i) => <div key={i} style={{ marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          )}
        </div>
      </div>

      <div style={{ fontSize: '26px', fontWeight: 700, color: '#111827', textAlign: 'center', marginTop: '14px' }}>{cvData.prenom} {cvData.nom}</div>
      {cvData.titre && <div style={{ fontSize: '13px', color, textAlign: 'center', marginTop: '4px' }}>{cvData.titre}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px', marginBottom: '24px' }}>
        <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
        <div style={{ width: '8px', height: '8px', background: color, transform: 'rotate(45deg)' }} />
        <div style={{ flex: 1, height: '1px', background: '#f3f4f6' }} />
      </div>

      {cvData.accroche && (
        <div style={{ fontSize: '12px', lineHeight: 1.75, color: '#4b5563', textAlign: 'center', maxWidth: '540px', margin: '0 auto 28px' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={experiences.length > 3 ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' } : undefined}>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: experiences.length > 3 ? 0 : (i < experiences.length - 1 ? '16px' : 0) }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>{exp.periode}</div>
                </div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#4b5563', marginBottom: '3px' }}>{m}</li>
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
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>{f.diplome}</div>
                <div style={{ fontSize: '10px', color: '#9ca3af' }}>{f.periode}</div>
              </div>
              <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competencesRestantes.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {competencesRestantes.map((c, i) => <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', color: '#374151' }}>{c}</span>)}
          </div>
        </div>
      )}

      {centresInteret.length > 0 && (
        <div>
          <div style={sectionTitle}>Centres d'intérêt</div>
          <div style={{ fontSize: '11px', color: '#374151', textAlign: 'center' }}>{centresInteret.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 75 : PHARE — Guidage, orientation, navigation professionnelle
// ═══════════════════════════════════════════════════════════════════
function Phare({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { display: 'flex', alignItems: 'center', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color, marginBottom: '15px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#f0f9ff', position: 'relative',
      padding: '44px 50px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#164e63',
    }}>
      <svg width="80" height="120" style={{ position: 'absolute', top: '20px', right: '20px', opacity: 0.07 }}>
        <rect x="30" y="20" width="20" height="80" fill={color} />
        <polygon points="10,20 70,20 50,0 30,0" fill={color} />
        <circle cx="40" cy="10" r="15" fill={color} />
      </svg>

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '26px' }}>
          <div style={{ borderRadius: '50%', border: '4px solid #ffffff', boxShadow: '0 3px 10px rgba(14,116,144,0.2)', width: 'fit-content' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={86} color={color} forme="rond" showPhoto={showPhoto} />
          </div>
          <div>
            <div style={{ fontSize: '27px', fontWeight: 700, color: '#164e63' }}>{cvData.prenom} {cvData.nom}</div>
            {cvData.titre && <div style={{ fontSize: '14px', color, marginTop: '5px' }}>{cvData.titre}</div>}
            {contacts.length > 0 && (
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#0e7490', marginTop: '12px' }}>
                {contacts.map((c, i) => <span key={i}>{c}</span>)}
              </div>
            )}
          </div>
        </div>

        {cvData.accroche && (
          <div style={{ background: '#ffffff', borderRadius: '10px', padding: '18px 22px', borderTop: `4px solid ${color}`, fontSize: '12px', lineHeight: 1.7, color: '#164e63', marginBottom: '26px' }}>
            🧭 {cvData.accroche}
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={sectionTitle}><span style={{ color, marginRight: '8px' }}>▶</span>Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '8px', padding: '16px 18px', marginBottom: i < experiences.length - 1 ? '10px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#164e63' }}>{exp.poste}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#0e7490', marginBottom: '3px' }}>{m}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={sectionTitle}><span style={{ color, marginRight: '8px' }}>▶</span>Formations</div>
            {formations.map((f, i) => (
              <div key={i} style={{ background: '#ffffff', borderRadius: '8px', padding: '16px 18px', marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#164e63' }}>{f.diplome}</div>
                <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={sectionTitle}><span style={{ color, marginRight: '8px' }}>▶</span>Compétences</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => <span key={i} style={{ padding: '5px 12px', background: '#ffffff', borderRadius: '4px', fontSize: '10.5px', color: '#0e7490' }}>{c}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}><span style={{ color, marginRight: '8px' }}>▶</span>Langues</div>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#0e7490', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}><span style={{ color, marginRight: '8px' }}>▶</span>Certifications</div>
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#0e7490', marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}><span style={{ color, marginRight: '8px' }}>▶</span>Centres d'intérêt</div>
              <div style={{ fontSize: '11px', color: '#0e7490' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 76 : MINÉRAL — Terre, authenticité, matières naturelles
// ═══════════════════════════════════════════════════════════════════
function Mineral({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '12px', fontWeight: 700, letterSpacing: '1.8px', textTransform: 'uppercase', color: '#57534e' }
  const sectionRule = { height: '1px', background: '#e7e5e4', marginTop: '7px', marginBottom: '18px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fafaf9',
      padding: '50px 56px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#1c1917',
    }}>
      <div style={{ overflow: 'hidden' }}>
        {showPhoto && (
          <div style={{ float: 'right', marginLeft: '24px' }}>
            <div style={{ borderRadius: '4px', border: '3px solid #e7e5e4', boxShadow: '2px 4px 8px rgba(0,0,0,0.08)', width: 'fit-content' }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={90} color={color} forme="carre" showPhoto={showPhoto} />
            </div>
          </div>
        )}
        <div style={{ fontSize: '28px', fontWeight: 700, color: '#1c1917', letterSpacing: '-0.3px' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '14px', fontWeight: 400, color: '#78716c', marginTop: '6px' }}>{cvData.titre}</div>}
        <div style={{ height: '3px', background: color, width: '44px', marginTop: '12px', marginBottom: '10px' }} />
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10.5px', color: '#a8a29e', marginBottom: '28px' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ background: '#f5f5f4', borderRadius: '6px', padding: '18px 22px', borderLeft: `4px solid ${color}`, fontSize: '12px', lineHeight: 1.75, color: '#44403c', marginBottom: '30px', clear: 'both' }}>
          {cvData.accroche}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '30px', clear: 'both' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '22px' : 0 }}>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#1c1917' }}>{exp.poste}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ fontSize: '10px', color: '#a8a29e', marginTop: '2px', marginBottom: '9px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ position: 'relative', paddingLeft: '14px', fontSize: '11px', lineHeight: 1.65, color: '#44403c', marginBottom: '3px' }}>
                      <span style={{ position: 'absolute', left: 0, color: '#d6d3d1' }}>·</span>{m}
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
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1c1917' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '30px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ fontSize: '11px', color: '#57534e', lineHeight: 1.9 }}>{competences.join('  ·  ')}</div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Langues</div>
            <div style={sectionRule} />
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Certifications</div>
            <div style={sectionRule} />
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#44403c', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={sectionRule} />
            <div style={{ fontSize: '11px', color: '#44403c' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 77 : VOLTAGE — Énergie électrique, dynamisme commercial
// ═══════════════════════════════════════════════════════════════════
function Voltage({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color }
  const sectionRule = { height: '1px', background: `${color}40`, marginTop: '6px', marginBottom: '16px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#0f0f1a',
      boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#fff',
    }}>
      <div style={{ background: color, padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#0f0f1a', textTransform: 'uppercase', letterSpacing: '-0.5px' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{cvData.titre}</div>}
        </div>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color="#0f0f1a" forme="rond" showPhoto={showPhoto} />
      </div>
      <div style={{ background: '#0f0f1a', height: '4px' }} />

      <div style={{ padding: '36px 48px' }}>
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}

        {cvData.accroche && (
          <div style={{ fontSize: '12px', lineHeight: 1.7, color: 'rgba(255,255,255,0.8)', marginBottom: '28px' }}>{cvData.accroche}</div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={sectionTitle}>Expériences</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '16px' : 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>{exp.poste}</div>
                <div style={{ fontSize: '12px', color, marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', marginBottom: '3px' }}>
                        <span style={{ marginRight: '6px' }}>⚡</span>{m}
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
            <div style={sectionTitle}>Formations</div>
            <div style={sectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{f.diplome}</div>
                <div style={{ fontSize: '11px', color, marginTop: '2px' }}>{[f.etablissement, f.periode].filter(Boolean).join(' — ')}</div>
              </div>
            ))}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '26px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={sectionRule} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {competences.map((c, i) => <span key={i} style={{ background: color, color: '#0f0f1a', padding: '4px 12px', borderRadius: '4px', fontSize: '10px', fontWeight: 700 }}>{c}</span>)}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
          {langues.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Langues</div>
              <div style={sectionRule} />
              {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Certifications</div>
              <div style={sectionRule} />
              {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', marginBottom: '5px' }}>{c.titre}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div style={{ flex: 1, minWidth: '160px' }}>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={sectionRule} />
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{centresInteret.join(' · ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Détecte une langue courante à partir de son nom pour afficher un drapeau —
// approximatif par design, se replie sur un globe si non reconnue.
function drapeauLangue(langue) {
  const l = (langue || '').toLowerCase()
  if (l.includes('français') || l.includes('france')) return '🇫🇷'
  if (l.includes('anglais') || l.includes('english')) return '🇬🇧'
  if (l.includes('allemand') || l.includes('german')) return '🇩🇪'
  if (l.includes('espagnol') || l.includes('spanish')) return '🇪🇸'
  if (l.includes('italien') || l.includes('italian')) return '🇮🇹'
  if (l.includes('portugais') || l.includes('portuguese')) return '🇵🇹'
  if (l.includes('chinois') || l.includes('mandarin')) return '🇨🇳'
  if (l.includes('japonais')) return '🇯🇵'
  if (l.includes('arabe')) return '🇸🇦'
  if (l.includes('russe')) return '🇷🇺'
  return '🌐'
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 78 : ATLAS — International, multiculturel, mobilité
// ═══════════════════════════════════════════════════════════════════
function Atlas({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#0f172a' }
  const sectionRule = { width: '28px', height: '2px', background: color, marginTop: '7px', marginBottom: '16px' }
  const badgesMobilite = []
  if (langues.length > 0) badgesMobilite.push('🌍 Mobilité internationale')
  if (langues.length >= 3) badgesMobilite.push('🗣️ Trilingue+')
  else if (langues.length === 2) badgesMobilite.push('🗣️ Bilingue')

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      padding: '46px 52px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#0f172a',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' }}>
        <PhotoCV photo={cvData.photo} initiales={initiales} size={88} color={color} forme="rond" showPhoto={showPhoto} />
        <div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '14px', color, marginTop: '5px' }}>{cvData.titre}</div>}
        </div>
      </div>

      {badgesMobilite.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
          {badgesMobilite.map((b, i) => (
            <span key={i} style={{ background: `${color}10`, color, padding: '3px 10px', borderRadius: '12px', fontSize: '9.5px', fontWeight: 500 }}>{b}</span>
          ))}
        </div>
      )}

      {contacts.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '10px', color: '#64748b', marginTop: '12px', marginBottom: '28px' }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ borderLeft: `4px solid ${color}`, paddingLeft: '16px', fontSize: '12px', lineHeight: 1.75, color: '#334155', marginBottom: '28px' }}>
          {cvData.accroche}
        </div>
      )}

      {langues.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Langues</div>
          <div style={sectionRule} />
          {langues.map((l, i) => (
            <div key={i} style={{ fontSize: '11px', marginBottom: '5px' }}>
              <span style={{ marginRight: '8px' }}>{drapeauLangue(l.langue)}</span>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{l.langue}</span>
              <span style={{ color: '#64748b' }}> — {l.niveau}</span>
            </div>
          ))}
        </div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Expériences</div>
          <div style={sectionRule} />
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '18px' : 0 }}>
              {exp.lieu && (
                <span style={{ display: 'inline-block', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '9.5px', marginBottom: '4px' }}>🌍 {exp.lieu}</span>
              )}
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{exp.poste}</div>
              <div style={{ fontSize: '11.5px', color, marginTop: '3px' }}>{exp.entreprise}</div>
              <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px', marginBottom: '8px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '10.5px', lineHeight: 1.6, color: '#334155', marginBottom: '3px' }}>{m}</li>
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
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={sectionRule} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {competences.map((c, i) => <span key={i} style={{ padding: '5px 12px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '3px', fontSize: '10.5px', color: '#334155' }}>{c}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Certifications</div>
            <div style={sectionRule} />
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#334155', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>Centres d'intérêt</div>
            <div style={sectionRule} />
            <div style={{ fontSize: '11px', color: '#334155' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 79 : ÉPURE — Typographie pure absolue, sans photo
// ═══════════════════════════════════════════════════════════════════
function Epure({ cvData }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts } = useCvBase(cvData)
  const sectionTitle = { fontSize: '10px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '22px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      padding: '72px 80px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#111827',
    }}>
      <div style={{ marginBottom: '52px' }}>
        <div style={{ fontSize: '40px', fontWeight: 700, color: '#111827', letterSpacing: '-1.5px' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '16px', fontWeight: 300, color: '#6b7280', marginTop: '10px' }}>{cvData.titre}</div>}
        {contacts.length > 0 && (
          <div style={{ display: 'flex', gap: '26px', flexWrap: 'wrap', fontSize: '11px', fontWeight: 300, color: '#9ca3af', marginTop: '20px' }}>
            {contacts.map((c, i) => <span key={i}>{c}</span>)}
          </div>
        )}
      </div>

      {cvData.accroche && (
        <div style={{ fontSize: '11px', fontWeight: 300, lineHeight: 1.9, color: '#374151', marginBottom: '48px' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={sectionTitle}>Expériences</div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '36px' : 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#111827' }}>{exp.poste}</div>
              <div style={{ fontSize: '12px', fontWeight: 300, color: '#6b7280', marginTop: '4px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ fontSize: '11px', fontWeight: 300, color: '#9ca3af', marginTop: '4px', marginBottom: '12px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && exp.missions.map((m, j) => (
                <div key={j} style={{ fontSize: '11px', fontWeight: 300, lineHeight: 1.9, color: '#374151', marginBottom: '8px' }}>{m}</div>
              ))}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={sectionTitle}>Formations</div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '24px' : 0 }}>
              <div style={{ fontSize: '15px', fontWeight: 500, color: '#111827' }}>{f.diplome}</div>
              <div style={{ fontSize: '12px', fontWeight: 300, color: '#6b7280', marginTop: '4px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
              <div style={{ fontSize: '11px', fontWeight: 300, color: '#9ca3af', marginTop: '4px' }}>{f.periode}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '48px' }}>
          <div style={sectionTitle}>Compétences</div>
          <div style={{ fontSize: '11px', fontWeight: 300, color: '#6b7280', lineHeight: 2 }}>{competences.join('  /  ')}</div>
        </div>
      )}

      {(langues.length > 0 || certifications.length > 0 || centresInteret.length > 0) && (
        <div>
          <div style={sectionTitle}>Divers</div>
          {langues.length > 0 && <div style={{ fontSize: '11px', fontWeight: 300, color: '#374151', marginBottom: '8px' }}>{langues.map(l => `${l.langue} (${l.niveau})`).join('  /  ')}</div>}
          {certifications.length > 0 && <div style={{ fontSize: '11px', fontWeight: 300, color: '#374151', marginBottom: '8px' }}>{certifications.map(c => c.titre).join('  /  ')}</div>}
          {centresInteret.length > 0 && <div style={{ fontSize: '11px', fontWeight: 300, color: '#374151' }}>{centresInteret.join('  /  ')}</div>}
        </div>
      )}
    </div>
  )
}

// Isole les chiffres à valeur "achievement" (%, €, années, effectifs) dans une
// mission pour les mettre en évidence — ex: "Croissance de 40% en 2 ans".
const CHIFFRE_PATTERN = '\\d+[\\d\\s,.]*(?:%|€|k€|K€|M€|ans?|personnes?|équipes?)'

function extraireAchievements(experiences) {
  const regex = new RegExp(CHIFFRE_PATTERN, 'gi')
  const achievements = []
  for (const exp of experiences) {
    for (const m of exp.missions || []) {
      const matches = m.match(regex) || []
      for (const match of matches) {
        if (achievements.length >= 4) break
        const val = match.trim()
        let label = 'Résultat'
        if (val.includes('%')) label = 'Croissance'
        else if (val.includes('€')) label = "Chiffre d'affaires"
        else if (/ans?$/i.test(val)) label = 'Expérience'
        else if (/personnes?|équipes?/i.test(val)) label = 'Équipe'
        achievements.push({ chiffre: val, label })
      }
      if (achievements.length >= 4) break
    }
    if (achievements.length >= 4) break
  }
  return achievements
}

function renderMissionAvecChiffres(texte, color) {
  const parts = texte.split(new RegExp(`(${CHIFFRE_PATTERN})`, 'gi'))
  return parts.map((part, i) => (
    i % 2 === 1 ? <strong key={i} style={{ color, fontWeight: 700 }}>{part}</strong> : part
  ))
}

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE 80 : VICTOIRE — Achievement, résultats, succès mesurable
// ═══════════════════════════════════════════════════════════════════
function Victoire({ cvData, color }) {
  const { experiences, formations, competences, langues, certifications, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }
  const achievements = extraireAchievements(experiences)

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      padding: '44px 50px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', overflow: 'hidden', color: '#0f0f1a',
    }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div style={{ borderRadius: '50%', border: '4px solid #ffffff', boxShadow: `0 0 0 3px ${color}, 0 8px 24px rgba(124,58,237,0.2)`, width: 'fit-content' }}>
          <PhotoCV photo={cvData.photo} initiales={initiales} size={96} color={color} forme="rond" showPhoto={showPhoto} />
        </div>
        <div>
          <div style={{ fontSize: '30px', fontWeight: 800, color: '#0f0f1a', letterSpacing: '-0.7px' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '15px', fontWeight: 500, color, marginTop: '6px' }}>{cvData.titre}</div>}
          {contacts.length > 0 && (
            <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', fontSize: '10.5px', color: '#6b7280', marginTop: '14px' }}>
              {contacts.map((c, i) => <span key={i}>{c}</span>)}
            </div>
          )}
        </div>
      </div>

      {achievements.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '30px' }}>
          {achievements.map((a, i) => (
            <div key={i} style={{ flex: 1, background: `${color}08`, borderRadius: '10px', padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color }}>{a.chiffre}</div>
              <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{a.label}</div>
            </div>
          ))}
        </div>
      )}

      {cvData.accroche && (
        <div style={{ fontSize: '12px', lineHeight: 1.75, color: '#374151', marginBottom: '28px' }}>{cvData.accroche}</div>
      )}

      {experiences.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={sectionTitle}>
            <span style={{ width: '8px', height: '8px', background: color, transform: 'rotate(45deg)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0f0f1a' }}>Expériences</span>
            <span style={{ flex: 1, height: '1px', background: `${color}20` }} />
          </div>
          {experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '24px' : 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f0f1a' }}>{exp.poste}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color, marginTop: '3px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')}</div>
              <div style={{ display: 'inline-block', background: `${color}10`, padding: '3px 10px', borderRadius: '12px', fontSize: '10px', fontWeight: 600, color, marginTop: '3px', marginBottom: '10px' }}>{exp.periode}</div>
              {exp.missions?.length > 0 && (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {exp.missions.map((m, j) => (
                    <li key={j} style={{ fontSize: '11px', lineHeight: 1.65, color: '#374151', marginBottom: '4px' }}>{renderMissionAvecChiffres(m, color)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      {formations.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={sectionTitle}>
            <span style={{ width: '8px', height: '8px', background: color, transform: 'rotate(45deg)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0f0f1a' }}>Formations</span>
            <span style={{ flex: 1, height: '1px', background: `${color}20` }} />
          </div>
          {formations.map((f, i) => (
            <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f0f1a' }}>{f.diplome}</div>
              <div style={{ fontSize: '11.5px', color, marginTop: '2px' }}>{[f.etablissement, f.mention].filter(Boolean).join(' — ')}</div>
            </div>
          ))}
        </div>
      )}

      {competences.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <div style={sectionTitle}>
            <span style={{ width: '8px', height: '8px', background: color, transform: 'rotate(45deg)' }} />
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0f0f1a' }}>Compétences</span>
            <span style={{ flex: 1, height: '1px', background: `${color}20` }} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
            {competences.map((c, i) => <span key={i} style={{ padding: '6px 14px', background: color, borderRadius: '20px', fontSize: '10.5px', fontWeight: 600, color: '#ffffff' }}>{c}</span>)}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        {langues.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>
              <span style={{ width: '8px', height: '8px', background: color, transform: 'rotate(45deg)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0f0f1a' }}>Langues</span>
            </div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{l.langue} — {l.niveau}</div>)}
          </div>
        )}
        {certifications.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>
              <span style={{ width: '8px', height: '8px', background: color, transform: 'rotate(45deg)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0f0f1a' }}>Certifications</span>
            </div>
            {certifications.map((c, i) => <div key={i} style={{ fontSize: '11px', color: '#374151', marginBottom: '5px' }}>{c.titre}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={sectionTitle}>
              <span style={{ width: '8px', height: '8px', background: color, transform: 'rotate(45deg)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#0f0f1a' }}>Centres d'intérêt</span>
            </div>
            <div style={{ fontSize: '11px', color: '#374151' }}>{centresInteret.join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  )
}

// Contacts avec icônes textuelles simples, un champ par ligne — pour les
// templates "Word" qui associent une icône différente à chaque type de contact
// (la liste `contacts` aplatie de useCvBase ne porte pas cette info de type).
function contactsAvecIcones(cvData, icons) {
  const items = []
  if (cvData.telephone) items.push({ icon: icons.telephone, val: cvData.telephone })
  if (cvData.email) items.push({ icon: icons.email, val: cvData.email })
  if (cvData.ville) items.push({ icon: icons.ville, val: cvData.ville })
  if (cvData.linkedin) items.push({ icon: icons.linkedin, val: cvData.linkedin })
  return items
}

// Barre de compétence à remplissage déterministe (niveauCompetence).
function BarreCompetence({ nom, color, fond = '#e5e7eb', height = '4px', radius = '2px', textStyle }) {
  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={textStyle}>{nom}</div>
      <div style={{ height, background: fond, borderRadius: radius, marginTop: '3px' }}>
        <div style={{ width: `${niveauCompetence(nom)}%`, height: '100%', background: color, borderRadius: radius }} />
      </div>
    </div>
  )
}

// Photo rectangulaire non carrée — PhotoCV ne supporte que largeur = hauteur,
// nécessaire pour les gabarits "Word" avec bloc photo plein cadre.
function PhotoRectangle({ photo, initiales, width, height, bg, textColor, fontSize, style }) {
  if (photo) {
    return <img src={photo} alt="photo" style={{ width, height, objectFit: 'cover', display: 'block', flexShrink: 0, ...style }} />
  }
  return (
    <div style={{
      width, height, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: textColor, fontSize, fontWeight: 700, flexShrink: 0, ...style,
    }}>
      {initiales}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_BLEU_CLASSIQUE — Deux colonnes marine classique
// ═══════════════════════════════════════════════════════════════════
function BleuClassique({ cvData, color }) {
  const { experiences, formations, competences, langues, centresInteret, initiales, showPhoto } = useCvBase(cvData)
  const contactsIco = contactsAvecIcones(cvData, { telephone: '✆', email: '✉', ville: '⚲', linkedin: 'in' })
  const sectionTitle = { fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color, marginBottom: '8px' }
  const sideTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff', marginBottom: '14px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '260px', flexShrink: 0, background: '#1e2d4a' }}>
        {showPhoto && (
          <PhotoRectangle photo={cvData.photo} initiales={initiales} width="260px" height="280px" bg="#2a3f6b" textColor="rgba(255,255,255,0.15)" fontSize="64px" />
        )}
        {cvData.titre && (
          <div style={{ fontSize: '14px', fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', padding: '22px 24px 0', marginBottom: '10px' }}>{cvData.titre}</div>
        )}
        <div style={{ width: '50px', height: '1px', background: 'rgba(255,255,255,0.4)', marginLeft: '24px', marginBottom: '24px' }} />

        {contactsIco.length > 0 && (
          <div style={{ padding: '0 24px', marginBottom: '22px' }}>
            <div style={sideTitle}>Contact</div>
            {contactsIco.map((c, i) => <div key={i} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px' }}>{c.icon} {c.val}</div>)}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ padding: '0 24px', marginBottom: '22px' }}>
            <div style={sideTitle}>Compétences</div>
            {competences.map((c, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.75)', marginBottom: '6px' }}>
                <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.4)' }}>●</span>{c}
              </div>
            ))}
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ padding: '0 24px', marginBottom: '22px' }}>
            <div style={sideTitle}>Langues</div>
            {langues.map((l, i) => (
              <div key={i} style={{ fontSize: '10px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>{l.langue}</span>
                <span style={{ color: 'rgba(255,255,255,0.5)' }}> {l.niveau}</span>
              </div>
            ))}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div style={{ padding: '0 24px', marginBottom: '22px' }}>
            <div style={sideTitle}>Intérêts</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>{centresInteret.join(', ')}</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '40px 36px 40px 40px', background: '#ffffff', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '42px', color, letterSpacing: '-1px' }}>
          <span style={{ fontWeight: 300 }}>{cvData.prenom} </span>
          <span style={{ fontWeight: 700 }}>{cvData.nom}</span>
        </div>
        {cvData.titre && <div style={{ fontSize: '13px', fontStyle: 'italic', color: '#6b7280', marginTop: '5px', marginBottom: '20px' }}>{cvData.titre}</div>}

        {cvData.accroche && (
          <div style={{ marginBottom: '20px' }}>
            <div style={sectionTitle}>Profil professionnel</div>
            <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#333' }}>{cvData.accroche}</div>
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={sectionTitle}>Formation</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color }}>{f.diplome}</span>
                  <span style={{ fontSize: '10px', color: '#888' }}>{f.periode}</span>
                </div>
                <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#555' }}>{f.etablissement}</div>
              </div>
            ))}
          </div>
        )}

        {experiences.length > 0 && (
          <div>
            <div style={sectionTitle}>Expériences professionnelles</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color }}>{exp.poste}</span>
                  <span style={{ fontSize: '10px', color: '#1e5b8a', fontStyle: 'italic' }}>{exp.periode}</span>
                </div>
                <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#555', marginBottom: '4px' }}>{exp.entreprise}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => (
                      <li key={j} style={{ fontSize: '10px', color: '#333', lineHeight: 1.65 }}>• {m}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_STAGE_VERT — Vert sauge étudiant
// ═══════════════════════════════════════════════════════════════════
function StageVert({ cvData, color }) {
  const { experiences, formations, competences, langues, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sideTitle = { fontSize: '10px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#4a6741', marginBottom: '12px' }
  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color, borderBottom: '2px solid #c5d4c2', paddingBottom: '6px', marginBottom: '10px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '240px', flexShrink: 0, background: '#ffffff', borderRight: '1px solid #e8ede8', padding: '36px 24px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={120} color="#8aaa84" forme="rond" showPhoto={showPhoto} />
          </div>
        )}

        {contacts.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div style={sideTitle}>Contact</div>
            {contacts.map((c, i) => <div key={i} style={{ fontSize: '9.5px', color: '#555', marginBottom: '5px' }}>{c}</div>)}
          </div>
        )}

        {competences.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div style={sideTitle}>Compétences</div>
            {competences.map((c, i) => (
              <BarreCompetence key={i} nom={c} color="#6d9b65" fond="#e8ede8" textStyle={{ fontSize: '9.5px', color: '#333' }} />
            ))}
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ marginBottom: '22px' }}>
            <div style={sideTitle}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '9.5px', color: '#333', marginBottom: '4px' }}>{l.langue} · {l.niveau}</div>)}
          </div>
        )}

        {centresInteret.length > 0 && (
          <div>
            <div style={sideTitle}>Loisirs</div>
            <div style={{ fontSize: '9.5px', color: '#555' }}>{centresInteret.join(', ')}</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, background: '#f4f7f2' }}>
        <div style={{ background: '#e8ede8', padding: '36px 40px 28px' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '48px', fontWeight: 700, color: '#2c3e2c', letterSpacing: '4px', textTransform: 'uppercase', textAlign: 'center' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && (
            <div style={{ background: color, color: '#ffffff', textAlign: 'center', padding: '10px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', marginTop: '16px' }}>
              {cvData.titre}
            </div>
          )}
        </div>

        <div style={{ padding: '28px 40px' }}>
          {cvData.accroche && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sectionTitle}>Profil</div>
              <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#333' }}>{cvData.accroche}</div>
            </div>
          )}

          {experiences.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sectionTitle}>Expériences</div>
              {experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#2c3e2c' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color, marginTop: '2px' }}>{exp.entreprise}</div>
                  <div style={{ fontSize: '9.5px', fontStyle: 'italic', color: '#777', marginBottom: '6px' }}>{exp.periode}</div>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {exp.missions.map((m, j) => (
                        <li key={j} style={{ fontSize: '10px', color: '#444', lineHeight: 1.6 }}>
                          <span style={{ color: '#6d9b65' }}>• </span>{m}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {formations.length > 0 && (
            <div>
              <div style={sectionTitle}>Formation</div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#2c3e2c' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color, marginTop: '2px' }}>{f.etablissement}</div>
                  <div style={{ fontSize: '9.5px', fontStyle: 'italic', color: '#777' }}>{f.periode}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_EXPRESS_ROSE — Rose poudré express
// ═══════════════════════════════════════════════════════════════════
function ExpressRose({ cvData, color }) {
  const { experiences, formations, competences, langues, initiales, showPhoto } = useCvBase(cvData)
  const contactsIco = contactsAvecIcones(cvData, { telephone: '✆', email: '✉', ville: '⚲', linkedin: 'in' })
  const sideTitle = { fontSize: '10.5px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#7d6060', marginBottom: '12px' }
  const bandeauTitle = { fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2.5px', color: '#7d6060' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '248px', flexShrink: 0, background: '#f2c4c4' }}>
        {showPhoto && (
          <div style={{ display: 'flex', height: '280px' }}>
            <div style={{ width: '6px', background: color, flexShrink: 0 }} />
            <div style={{ flex: 1, background: '#c8a0a0', overflow: 'hidden' }}>
              <PhotoRectangle photo={cvData.photo} initiales={initiales} width="100%" height="280px" bg="#c8a0a0" textColor="rgba(255,255,255,0.5)" fontSize="56px" />
            </div>
          </div>
        )}
        <div style={{ padding: '22px 22px 0' }}>
          {cvData.titre && <div style={{ fontSize: '14px', fontStyle: 'italic', color: '#5a3a3a', marginBottom: '10px' }}>{cvData.titre}</div>}
          <div style={{ width: '50px', height: '1px', background: '#a08080', marginBottom: '24px' }} />

          {contactsIco.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sideTitle}>Contact</div>
              {contactsIco.map((c, i) => <div key={i} style={{ fontSize: '10px', color: '#4a2a2a', lineHeight: 1.7 }}>{c.icon} {c.val}</div>)}
            </div>
          )}

          {cvData.accroche && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sideTitle}>Profil</div>
              <div style={{ fontSize: '10px', color: '#4a2a2a', lineHeight: 1.7 }}>{cvData.accroche}</div>
            </div>
          )}

          {competences.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sideTitle}>Compétences</div>
              {competences.map((c, i) => <div key={i} style={{ fontSize: '10px', color: '#4a2a2a', marginBottom: '4px' }}>• {c}</div>)}
            </div>
          )}

          {langues.length > 0 && (
            <div>
              <div style={sideTitle}>Langues</div>
              {langues.map((l, i) => (
                <BarreCompetence key={i} nom={`${l.langue} · ${l.niveau}`} color="#7d6060" fond="#e8d0d0" height="5px" radius="0" textStyle={{ fontSize: '10px', color: '#4a2a2a' }} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, background: '#ffffff' }}>
        <div style={{ background: color, padding: '28px 36px 24px', minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '48px', fontWeight: 700, color: '#f2c4c4', letterSpacing: '-0.5px', lineHeight: 1.05 }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && <div style={{ fontSize: '11px', color: 'rgba(242,196,196,0.8)', letterSpacing: '2.5px', textTransform: 'uppercase', marginTop: '10px' }}>{cvData.titre}</div>}
          <div style={{ height: '1px', background: 'rgba(242,196,196,0.3)', marginTop: '16px' }} />
        </div>

        <div style={{ padding: '24px 36px' }}>
          {formations.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ background: '#f2c4c4', padding: '7px 14px', marginBottom: '14px' }}>
                <span style={bandeauTitle}>Formation</span>
              </div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#2a1a1a' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '2px' }}>{f.periode}</div>
                  <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#666' }}>{f.etablissement}</div>
                </div>
              ))}
            </div>
          )}

          {experiences.length > 0 && (
            <div>
              <div style={{ background: '#f2c4c4', padding: '7px 14px', marginBottom: '14px' }}>
                <span style={bandeauTitle}>Expériences</span>
              </div>
              {experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#2a1a1a' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu].filter(Boolean).join(' · ')} {exp.periode}</div>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '10px', color: '#444' }}>• {m}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_ANGLAIS — Minimaliste noir/blanc international
// ═══════════════════════════════════════════════════════════════════
function AnglaisMinimaliste({ cvData, color }) {
  const { experiences, formations, competences, langues, centresInteret, initiales, showPhoto } = useCvBase(cvData)
  const contactsIco = contactsAvecIcones(cvData, { telephone: '📞', email: '✉', ville: '📍', linkedin: 'in' })
  const sideSectionTitle = { fontSize: '14px', fontWeight: 600, color: '#111', letterSpacing: '0.5px', marginBottom: '8px' }
  const sideRule = { height: '1px', background: '#ccc', marginBottom: '10px' }
  const sectionTitle = { fontSize: '16px', fontWeight: 400, color: '#111', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '8px' }
  const sectionRule = { height: '1px', background: '#ddd', marginBottom: '12px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '240px', flexShrink: 0, background: '#f8f8f8' }}>
        {showPhoto && (
          <PhotoRectangle photo={cvData.photo} initiales={initiales} width="240px" height="220px" bg="#dddddd" textColor="#999999" fontSize="56px" />
        )}
        <div style={{ padding: '20px 20px 0' }}>
          {contactsIco.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              {contactsIco.map((c, i) => <div key={i} style={{ fontSize: '10px', color: '#333', lineHeight: 1.9 }}>{c.icon} {c.val}</div>)}
            </div>
          )}

          {cvData.accroche && (
            <div style={{ marginBottom: '18px' }}>
              <div style={sideSectionTitle}>Objective</div>
              <div style={sideRule} />
              <div style={{ fontSize: '9.5px', color: '#444', lineHeight: 1.7 }}>{cvData.accroche}</div>
            </div>
          )}

          {competences.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={sideSectionTitle}>Skills</div>
              <div style={sideRule} />
              {competences.map((c, i) => <div key={i} style={{ fontSize: '9.5px', color: '#444', marginBottom: '3px' }}>• {c}</div>)}
            </div>
          )}

          {langues.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={sideSectionTitle}>Languages</div>
              <div style={sideRule} />
              {langues.map((l, i) => <div key={i} style={{ fontSize: '9.5px', color: '#444', marginBottom: '3px' }}>{l.langue} · {l.niveau}</div>)}
            </div>
          )}

          {centresInteret.length > 0 && (
            <div>
              <div style={sideSectionTitle}>Hobbies</div>
              <div style={sideRule} />
              <div style={{ fontSize: '9.5px', color: '#444', lineHeight: 1.7 }}>{centresInteret.join(', ')}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, background: '#ffffff', padding: '36px 36px', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', fontWeight: 700, color: '#111', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
          {cvData.prenom} {cvData.nom}
        </div>
        {cvData.titre && <div style={{ fontSize: '13px', fontWeight: 600, color: '#444', marginTop: '4px', letterSpacing: '0.5px' }}>{cvData.titre}</div>}
        <div style={{ height: '1px', background: '#ddd', marginTop: '12px', marginBottom: '20px' }} />

        {experiences.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={sectionTitle}>Work Experience</div>
            <div style={sectionRule} />
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '16px' : 0 }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{exp.poste}</span>
                  {exp.entreprise && <span style={{ fontSize: '10px', color: '#666' }}> · {exp.entreprise}</span>}
                </div>
                <div style={{ fontSize: '10px', color, marginBottom: '4px' }}>{exp.periode}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '9.5px', color: '#444', lineHeight: 1.6 }}>• {m}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div>
            <div style={sectionTitle}>Education</div>
            <div style={sectionRule} />
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '14px' : 0 }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{f.diplome}</span>
                  {f.etablissement && <span style={{ fontSize: '10px', color: '#666' }}> · {f.etablissement}</span>}
                </div>
                <div style={{ fontSize: '10px', color }}>{f.periode}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_AVEC_PHOTO_TEAL — Photo ronde bandeau teal
// ═══════════════════════════════════════════════════════════════════
function PhotoTeal({ cvData, color }) {
  const { experiences, formations, competences, initiales, showPhoto } = useCvBase(cvData)
  const contactsIco = contactsAvecIcones(cvData, { telephone: '📞', email: '✉', ville: '📍', linkedin: 'in' })
  const sideTitle = { fontSize: '12px', fontWeight: 700, color, marginBottom: '6px' }
  const sideRule = { height: '1px', background: '#c5e0e0', marginBottom: '10px' }
  const sectionTitle = { fontSize: '13px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '10px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', height: '200px' }}>
        <div style={{ width: '200px', flexShrink: 0, background: '#e8f4f4', position: 'relative' }}>
          {showPhoto && (
            <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
              <PhotoCV photo={cvData.photo} initiales={initiales} size={160} color={color} forme="rond" showPhoto={showPhoto} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: '20px 28px', boxSizing: 'border-box' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', fontWeight: 300, color: '#111' }}>{cvData.prenom}</div>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', fontWeight: 700, color: '#111', lineHeight: 1 }}>{cvData.nom}</div>
        </div>
      </div>

      {cvData.titre && (
        <div style={{ background: color, padding: '10px 28px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#ffffff' }}>{cvData.titre}</span>
        </div>
      )}

      <div style={{ display: 'flex' }}>
        <div style={{ width: '220px', flexShrink: 0, background: '#f0f8f8', padding: '20px', boxSizing: 'border-box' }}>
          {contactsIco.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sideTitle}>Contact</div>
              <div style={sideRule} />
              {contactsIco.map((c, i) => <div key={i} style={{ fontSize: '10px', color: '#333', marginBottom: '5px' }}>{c.icon} {c.val}</div>)}
            </div>
          )}
          {cvData.accroche && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sideTitle}>Mon profil</div>
              <div style={sideRule} />
              <div style={{ fontSize: '10px', color: '#333', lineHeight: 1.7 }}>{cvData.accroche}</div>
            </div>
          )}
          {competences.length > 0 && (
            <div>
              <div style={sideTitle}>Logiciels</div>
              <div style={sideRule} />
              {competences.map((c, i) => <div key={i} style={{ fontSize: '10px', color: '#333', marginBottom: '3px' }}>• {c}</div>)}
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '20px 28px', boxSizing: 'border-box' }}>
          {experiences.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sectionTitle}>Expériences</div>
              {experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111', textTransform: 'uppercase' }}>{exp.entreprise}</div>
                  <div style={{ fontSize: '10px', color, marginTop: '2px' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>{[exp.lieu, exp.periode].filter(Boolean).join(' · ')}</div>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '10px', color: '#333', lineHeight: 1.65 }}>• {m}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {formations.length > 0 && (
            <div>
              <div style={sectionTitle}>Formation</div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111', textTransform: 'uppercase' }}>{f.etablissement}</div>
                  <div style={{ fontSize: '10px', color, marginTop: '2px' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>{f.periode}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_CANDIDATURE_SPONTANEE — Panneau coloré latéral
// ═══════════════════════════════════════════════════════════════════
function CandidatureSpontanee({ cvData, color }) {
  const { experiences, formations, competences, langues, initiales, showPhoto } = useCvBase(cvData)
  const contactsIco = contactsAvecIcones(cvData, { telephone: '✆', email: '✉', ville: '📍', linkedin: 'in' })
  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color: '#111' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ flex: 1, padding: '40px 36px', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '52px', color: '#111', lineHeight: 1.05, letterSpacing: '-1px' }}>
          <div style={{ fontWeight: 300 }}>{cvData.prenom}</div>
          <div style={{ fontWeight: 700 }}>{cvData.nom}</div>
        </div>
        {cvData.titre && (
          <div style={{ fontSize: '11px', fontWeight: 400, letterSpacing: '3px', textTransform: 'uppercase', color: '#555', marginTop: '6px', marginBottom: '24px' }}>{cvData.titre}</div>
        )}
        <div style={{ height: '1px', background: '#e5e5e5', marginBottom: '20px' }} />

        {cvData.accroche && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ ...sectionTitle, marginBottom: '8px' }}>Profil</div>
            <div style={{ fontSize: '10.5px', lineHeight: 1.7, color: '#444' }}>{cvData.accroche}</div>
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ ...sectionTitle, marginBottom: '12px' }}>Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color }}>{exp.poste}</div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>{[exp.entreprise, exp.lieu, exp.periode].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '10px', color: '#444', lineHeight: 1.65 }}>• {m}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div>
            <div style={{ ...sectionTitle, marginBottom: '12px' }}>Formation</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color }}>{f.diplome}</div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '4px' }}>{[f.etablissement, f.periode].filter(Boolean).join(' · ')}</div>
                {f.mention && <div style={{ fontSize: '10px', color: '#555', lineHeight: 1.6 }}>{f.mention}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width: '240px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        {showPhoto && (
          <PhotoRectangle photo={cvData.photo} initiales={initiales} width="240px" height="320px" bg="#c8b88a" textColor="rgba(255,255,255,0.7)" fontSize="60px" style={{ objectPosition: 'center' }} />
        )}
        <div style={{ flex: 1, background: color, padding: '20px 16px', boxSizing: 'border-box' }}>
          {contactsIco.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              {contactsIco.map((c, i) => <div key={i} style={{ fontSize: '10px', color: 'rgba(0,0,0,0.8)', lineHeight: 1.9 }}>{c.icon} {c.val}</div>)}
            </div>
          )}

          {competences.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#000', marginBottom: '8px' }}>Compétences</div>
              {competences.map((c, i) => (
                <BarreCompetence key={i} nom={c} color="#000000" fond="rgba(0,0,0,0.15)" textStyle={{ fontSize: '10px', color: '#000' }} />
              ))}
            </div>
          )}

          {langues.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#000', marginBottom: '8px' }}>Langues</div>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '10px', color: 'rgba(0,0,0,0.8)', lineHeight: 1.8 }}>• {l.langue} · {l.niveau}</div>)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_2_COLONNES_VERT — Vert forêt deux colonnes
// ═══════════════════════════════════════════════════════════════════
function ColonnesVert({ cvData, color }) {
  const { experiences, formations, competences, langues, centresInteret, initiales, showPhoto } = useCvBase(cvData)
  const contactsIco = contactsAvecIcones(cvData, { telephone: '📞', email: '✉', ville: '📍', linkedin: 'in' })
  const sideTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff', marginBottom: '8px' }
  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color, marginBottom: '10px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '240px', flexShrink: 0, background: '#2d5a4a', padding: '28px 20px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={110} color="#4a7a6a" forme="rond" showPhoto={showPhoto} />
          </div>
        )}
        {cvData.titre && <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: '6px' }}>{cvData.titre}</div>}
        <div style={{ width: '30px', height: '1px', background: 'rgba(255,255,255,0.3)', margin: '0 auto 20px' }} />

        {contactsIco.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={sideTitle}>Contact</div>
            {contactsIco.map((c, i) => <div key={i} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>{c.icon} {c.val}</div>)}
          </div>
        )}
        {cvData.accroche && (
          <div style={{ marginBottom: '20px' }}>
            <div style={sideTitle}>Profil</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>{cvData.accroche}</div>
          </div>
        )}
        {langues.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={sideTitle}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>{l.langue} · {l.niveau}</div>)}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div>
            <div style={sideTitle}>Centres d'intérêt</div>
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.75 }}>{centresInteret.join(', ')}</div>
          </div>
        )}
      </div>

      <div style={{ flex: 1, background: '#ffffff', padding: '28px 32px', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', color: '#111', lineHeight: 1.1 }}>
          <span style={{ fontWeight: 300 }}>{cvData.prenom} </span>
          <span style={{ fontWeight: 700 }}>{cvData.nom}</span>
        </div>
        <div style={{ height: '2px', background: color, width: '50px', marginTop: '10px', marginBottom: '20px' }} />

        {competences.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={sectionTitle}>Compétences</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {competences.map((c, i) => (
                <BarreCompetence key={i} nom={c} color="#2d5a4a" fond="#e0ece8" height="3px" textStyle={{ fontSize: '9.5px', color: '#333' }} />
              ))}
            </div>
          </div>
        )}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={sectionTitle}>Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
                <div style={{ fontSize: '9.5px', color: '#888' }}>{exp.periode}</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color: '#2d5a4a', marginTop: '2px' }}>{exp.entreprise}</div>
                  {exp.missions?.length > 0 && (
                    <div style={{ fontSize: '10px', color: '#555', lineHeight: 1.6, marginTop: '4px' }}>
                      {exp.missions.map((m, j) => <div key={j}>• {m}</div>)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div>
            <div style={sectionTitle}>Formation</div>
            {formations.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                <div style={{ fontSize: '9.5px', color: '#888' }}>{f.periode}</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color: '#2d5a4a', marginTop: '2px' }}>{f.etablissement}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_INTERIM — Bleu nuit professionnel
// ═══════════════════════════════════════════════════════════════════
function InterimBleu({ cvData, color }) {
  const { experiences, formations, competences, langues, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color, marginBottom: '10px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ background: '#1a2580', padding: '20px 32px', display: 'flex', gap: '20px', alignItems: 'center', boxSizing: 'border-box' }}>
        {showPhoto && (
          <PhotoRectangle photo={cvData.photo} initiales={initiales} width="160px" height="160px" bg="#2a3590" textColor="rgba(255,255,255,0.3)" fontSize="48px" style={{ border: '2px solid rgba(255,255,255,0.2)' }} />
        )}
        <div style={{ flex: 1 }}>
          {contacts.length > 0 && (
            <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.7)', textAlign: 'right', marginBottom: '8px' }}>{contacts.join(' · ')}</div>
          )}
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '28px', fontWeight: 700, color: '#ffffff' }}>{cvData.prenom} {cvData.nom}</div>
          {cvData.titre && <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '3px', color: 'rgba(255,255,255,0.8)', marginTop: '4px' }}>{cvData.titre}</div>}
          {cvData.accroche && <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginTop: '8px' }}>{cvData.accroche}</div>}
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: 2, padding: '20px 24px', borderRight: '1px solid #eee', boxSizing: 'border-box' }}>
          {experiences.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sectionTitle}>Expériences</div>
              {experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10.5px', color, marginTop: '2px' }}>{exp.entreprise}</div>
                  <div style={{ fontSize: '9.5px', color: '#888', marginBottom: '6px' }}>{[exp.lieu, exp.periode].filter(Boolean).join(' · ')}</div>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '10px', color: '#444', lineHeight: 1.6 }}>• {m}</li>)}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
          {formations.length > 0 && (
            <div>
              <div style={sectionTitle}>Formation</div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10.5px', color, marginTop: '2px' }}>{f.etablissement}</div>
                  <div style={{ fontSize: '9.5px', color: '#888' }}>{f.periode}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, padding: '20px 20px', boxSizing: 'border-box' }}>
          {competences.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sectionTitle}>Compétences</div>
              {competences.map((c, i) => (
                <BarreCompetence key={i} nom={c} color={color} fond="#e8ecf8" textStyle={{ fontSize: '10px', color: '#333' }} />
              ))}
            </div>
          )}
          {langues.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sectionTitle}>Langues</div>
              {langues.map((l, i) => (
                <BarreCompetence key={i} nom={`${l.langue} · ${l.niveau}`} color={color} fond="#e8ecf8" textStyle={{ fontSize: '10px', color: '#333' }} />
              ))}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div>
              <div style={sectionTitle}>Centres d'intérêt</div>
              <div style={{ fontSize: '10px', color: '#444', lineHeight: 1.75 }}>{centresInteret.join(', ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_JOB_ETUDIANT — Bleu clair étudiant
// ═══════════════════════════════════════════════════════════════════
function JobEtudiant({ cvData, color }) {
  const { experiences, formations, competences, langues, centresInteret, initiales, showPhoto } = useCvBase(cvData)
  const contactsIco = contactsAvecIcones(cvData, { telephone: '📞', email: '✉', ville: '📍', linkedin: 'in' })
  const sideTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color, marginBottom: '10px' }
  const sectionTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color, marginBottom: '8px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '220px', flexShrink: 0, background: '#e8eff8', padding: '24px 18px', boxSizing: 'border-box' }}>
        {contactsIco.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            {contactsIco.map((c, i) => <div key={i} style={{ fontSize: '9.5px', color: '#444', lineHeight: 1.9 }}>{c.icon} {c.val}</div>)}
          </div>
        )}
        {competences.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={sideTitle}>Compétences</div>
            {competences.map((c, i) => (
              <BarreCompetence key={i} nom={c} color={color} fond="#c8d8ec" textStyle={{ fontSize: '9.5px', color: '#333' }} />
            ))}
          </div>
        )}
        {langues.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={sideTitle}>Langues</div>
            {langues.map((l, i) => (
              <div key={i} style={{ marginBottom: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#111' }}>{l.langue}</div>
                <div style={{ fontSize: '9.5px', color: '#666', marginTop: '1px' }}>{l.niveau}</div>
              </div>
            ))}
          </div>
        )}
        {centresInteret.length > 0 && (
          <div>
            <div style={sideTitle}>Intérêts</div>
            {centresInteret.map((c, i) => <div key={i} style={{ fontSize: '9.5px', color: '#444' }}>• {c}</div>)}
          </div>
        )}
      </div>

      <div style={{ flex: 1, padding: '24px 28px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '36px', color: '#111', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 300 }}>{cvData.prenom} </span>
            <span style={{ fontWeight: 700 }}>{cvData.nom}</span>
          </div>
          {showPhoto && <PhotoCV photo={cvData.photo} initiales={initiales} size={80} color={color} forme="rond" showPhoto={showPhoto} />}
        </div>
        {cvData.titre && <div style={{ fontSize: '10px', fontWeight: 400, textTransform: 'uppercase', letterSpacing: '3px', color, marginBottom: '16px' }}>{cvData.titre}</div>}
        <div style={{ height: '1px', background: '#dde8f4', marginBottom: '16px' }} />

        {cvData.accroche && (
          <div style={{ marginBottom: '16px' }}>
            <div style={sectionTitle}>Profil</div>
            <div style={{ fontSize: '10px', lineHeight: 1.7, color: '#444' }}>{cvData.accroche}</div>
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div style={sectionTitle}>Formation</div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color }}>{f.diplome}</div>
                <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{f.etablissement}</div>
                <div style={{ fontSize: '10px', color: '#888' }}>{f.periode}</div>
                {f.mention && <div style={{ fontSize: '10px', color: '#555', lineHeight: 1.6, marginTop: '4px' }}>{f.mention}</div>}
              </div>
            ))}
          </div>
        )}

        {experiences.length > 0 && (
          <div>
            <div style={sectionTitle}>Expériences</div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '12px' : 0 }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color }}>{[exp.poste, exp.lieu].filter(Boolean).join(' · ')}</div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>{exp.periode}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '10px', color: '#444', lineHeight: 1.65 }}>• {m}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_2_PAGES_TIMELINE — Vert et beige timeline
// ═══════════════════════════════════════════════════════════════════
function TimelineDeuxPages({ cvData, color }) {
  const { experiences, formations, competences, langues, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sideTitle = { fontSize: '13px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '240px', flexShrink: 0, background: '#3d5a3a', paddingBottom: '36px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '28px', marginBottom: '16px' }}>
            <PhotoCV photo={cvData.photo} initiales={initiales} size={130} color="#5a7a57" forme="rond" showPhoto={showPhoto} />
          </div>
        )}
        {contacts.length > 0 && (
          <div style={{ padding: '0 20px', marginBottom: '18px' }}>
            <div style={sideTitle}>Contact</div>
            {contacts.map((c, i) => <div key={i} style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{c}</div>)}
          </div>
        )}
        {cvData.accroche && (
          <div style={{ padding: '0 20px', marginBottom: '18px' }}>
            <div style={sideTitle}>Profil</div>
            <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{cvData.accroche}</div>
          </div>
        )}
        {competences.length > 0 && (
          <div style={{ padding: '0 20px', marginBottom: '18px' }}>
            <div style={sideTitle}>Compétences</div>
            {competences.map((c, i) => (
              <BarreCompetence key={i} nom={c} color="#c8a96e" fond="rgba(255,255,255,0.2)" textStyle={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.8)' }} />
            ))}
          </div>
        )}
        {langues.length > 0 && (
          <div style={{ padding: '0 20px' }}>
            <div style={sideTitle}>Langues</div>
            {langues.map((l, i) => <div key={i} style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7 }}>{l.langue} · {l.niveau}</div>)}
          </div>
        )}
      </div>

      <div style={{ flex: 1, background: '#ffffff' }}>
        <div style={{ background: color, padding: '24px 32px' }}>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
            {cvData.prenom} {cvData.nom}
          </div>
          {cvData.titre && <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2.5px', color: 'rgba(255,255,255,0.9)', marginTop: '6px' }}>{cvData.titre}</div>}
        </div>

        <div style={{ padding: '24px 32px' }}>
          {experiences.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#3d5a3a', letterSpacing: '1px', marginBottom: '16px' }}>Expériences professionnelles</div>
              <div style={{ position: 'relative', paddingLeft: '24px' }}>
                <div style={{ position: 'absolute', left: '6px', top: 0, bottom: 0, width: '2px', background: '#e8ede8' }} />
                {experiences.map((exp, i) => (
                  <div key={i} style={{ position: 'relative', marginBottom: i < experiences.length - 1 ? '20px' : 0 }}>
                    <div style={{ position: 'absolute', left: '-20px', top: '6px', width: '14px', height: '14px', borderRadius: '50%', background: color, border: '3px solid #ffffff' }} />
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#111', marginBottom: '2px' }}>{exp.poste}</div>
                    <div style={{ fontSize: '10px', color, marginBottom: '3px' }}>{exp.periode}</div>
                    <div style={{ fontSize: '10px', fontStyle: 'italic', color: '#555', marginBottom: '6px' }}>{exp.entreprise}</div>
                    {exp.missions?.length > 0 && (
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '10px', color: '#444', lineHeight: 1.6 }}>• {m}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {formations.length > 0 && (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: '#3d5a3a', letterSpacing: '1px', marginBottom: '16px' }}>Formation</div>
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '12px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color, marginTop: '2px' }}>{f.etablissement}</div>
                  <div style={{ fontSize: '10px', color: '#888' }}>{f.periode}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_BANQUE — Bleu gris bancaire
// ═══════════════════════════════════════════════════════════════════
function BanqueFinance({ cvData, color }) {
  const { experiences, formations, competences, langues, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sideTitle = { fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color, marginBottom: '8px' }
  const sideRule = { height: '1px', background: '#c8cdd8', marginBottom: '10px' }
  const bandeauTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#ffffff' }

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '240px', flexShrink: 0, background: '#f0f2f6', paddingBottom: '36px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <PhotoCV photo={cvData.photo} initiales={initiales} size={240} color="#8a9ab5" forme="carre" showPhoto={showPhoto} />
        )}
        <div style={{ padding: '20px 20px 0' }}>
          {contacts.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sideTitle}>Contact</div>
              <div style={sideRule} />
              {contacts.map((c, i) => <div key={i} style={{ fontSize: '10px', color: '#333', marginBottom: '4px' }}>{c}</div>)}
            </div>
          )}
          {cvData.accroche && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sideTitle}>Profil</div>
              <div style={sideRule} />
              <div style={{ fontSize: '10px', color: '#333', lineHeight: 1.7 }}>{cvData.accroche}</div>
            </div>
          )}
          {competences.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <div style={sideTitle}>Compétences</div>
              <div style={sideRule} />
              {competences.map((c, i) => <div key={i} style={{ fontSize: '10px', color: '#333', marginBottom: '3px' }}>• {c}</div>)}
            </div>
          )}
          {langues.length > 0 && (
            <div>
              <div style={sideTitle}>Langues</div>
              <div style={sideRule} />
              {langues.map((l, i) => <div key={i} style={{ fontSize: '10px', color: '#333', marginBottom: '3px' }}>• {l.langue} · {l.niveau}</div>)}
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, background: '#ffffff', padding: '28px 32px', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '38px', fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '11px', color: '#555', marginBottom: '16px' }}>{cvData.titre}</div>}

        {experiences.length > 0 && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{ background: color, padding: '7px 14px', marginBottom: '14px' }}>
              <span style={bandeauTitle}>Expériences</span>
            </div>
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '14px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{exp.poste}</span>
                  <span style={{ fontSize: '10px', color: '#888' }}>{exp.periode}</span>
                </div>
                <div style={{ fontSize: '10.5px', fontStyle: 'italic', color: '#555', marginBottom: '6px' }}>{exp.entreprise}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '10px', color: '#333', lineHeight: 1.65 }}>• {m}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {formations.length > 0 && (
          <div>
            <div style={{ background: color, padding: '7px 14px', marginBottom: '14px' }}>
              <span style={bandeauTitle}>Formation</span>
            </div>
            {formations.map((f, i) => (
              <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{f.diplome}</span>
                  <span style={{ fontSize: '10px', color: '#888' }}>{f.periode}</span>
                </div>
                <div style={{ fontSize: '10.5px', fontStyle: 'italic', color: '#555' }}>{f.etablissement}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_AIDE_SOIGNANT — Teal médical centré
// ═══════════════════════════════════════════════════════════════════
function AideSoignant({ cvData, color }) {
  const { experiences, formations, competences, langues, centresInteret, contacts, initiales, showPhoto } = useCvBase(cvData)
  const sideTitle = { fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#ffffff', marginBottom: '8px' }
  const centeredTitle = (label) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#333', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</div>
      <div style={{ flex: 1, height: '1px', background: '#ddd' }} />
    </div>
  )

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, display: 'flex',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box', background: '#fff',
    }}>
      <div style={{ width: '220px', flexShrink: 0, background: '#1f7f7f', paddingBottom: '32px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <PhotoCV photo={cvData.photo} initiales={initiales} size={220} color="#3a9a9a" forme="carre" showPhoto={showPhoto} />
        )}
        <div style={{ padding: '16px 16px 0' }}>
          {contacts.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={sideTitle}>Contact</div>
              {contacts.map((c, i) => <div key={i} style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{c}</div>)}
            </div>
          )}
          {competences.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={sideTitle}>Compétences</div>
              {competences.map((c, i) => <div key={i} style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>• {c}</div>)}
            </div>
          )}
          {langues.length > 0 && (
            <div style={{ marginBottom: '18px' }}>
              <div style={sideTitle}>Langues</div>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{l.langue} · {l.niveau}</div>)}
            </div>
          )}
          {centresInteret.length > 0 && (
            <div>
              <div style={sideTitle}>Qualités</div>
              <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.85)', lineHeight: 1.7 }}>{centresInteret.join(', ')}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, background: '#ffffff', padding: '24px 28px', boxSizing: 'border-box' }}>
        <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '32px', fontWeight: 700, color: '#111', letterSpacing: '1px' }}>{cvData.prenom} {cvData.nom}</div>
        {cvData.titre && <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2.5px', color: '#555', marginBottom: '16px' }}>{cvData.titre}</div>}

        {cvData.accroche && (
          <div style={{ marginBottom: '16px' }}>
            {centeredTitle('Profil')}
            <div style={{ fontSize: '10.5px', lineHeight: 1.75, color: '#333' }}>{cvData.accroche}</div>
          </div>
        )}

        {formations.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            {centeredTitle('Formation')}
            {formations.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                <div style={{ fontSize: '10px', color: '#888' }}>{f.periode}</div>
                <div>
                  <div style={{ fontSize: '10.5px', fontWeight: 600, color: '#111' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', fontStyle: 'italic', color }}>{f.etablissement}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {experiences.length > 0 && (
          <div>
            {centeredTitle('Expériences')}
            {experiences.map((exp, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '12px', marginBottom: i < experiences.length - 1 ? '12px' : 0 }}>
                <div style={{ fontSize: '10px', color: '#888' }}>{exp.periode}</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111', textTransform: 'uppercase' }}>{exp.poste}</div>
                  <div style={{ fontSize: '10px', color, marginBottom: '4px' }}>{exp.entreprise}</div>
                  {exp.missions?.length > 0 && (
                    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                      {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '10px', color: '#444', lineHeight: 1.65 }}>• {m}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// CV_BEAU_CV — Vert sauge grille
// ═══════════════════════════════════════════════════════════════════
function BeauCvSauge({ cvData, color }) {
  const { experiences, formations, competences, langues, contacts, initiales, showPhoto } = useCvBase(cvData)
  const barTitle = (label) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
      <div style={{ width: '48px', height: '3px', background: color }} />
      <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px', color }}>{label}</div>
    </div>
  )

  return (
    <div id="cv-to-print" className="cv-template" style={{
      width: `${PAGE.width}px`, minHeight: `${PAGE.minHeight}px`, background: '#fff',
      fontFamily: '"Inter", sans-serif', overflow: 'hidden', boxSizing: 'border-box',
    }}>
      <div style={{ background: '#2d6b5a', padding: '24px 36px', display: 'flex', alignItems: 'center', gap: '24px', boxSizing: 'border-box' }}>
        {showPhoto && (
          <PhotoCV photo={cvData.photo} initiales={initiales} size={120} color="#4a8a78" forme="rond" showPhoto={showPhoto} />
        )}
        <div>
          <div style={{ fontFamily: '"Playfair Display", serif', fontSize: '42px', color: '#ffffff', letterSpacing: '-0.3px' }}>
            <span style={{ fontWeight: 300 }}>{cvData.prenom} </span>
            <span style={{ fontWeight: 700 }}>{cvData.nom}</span>
          </div>
          {cvData.titre && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
              <div style={{ width: '40px', height: '2px', background: 'rgba(255,255,255,0.5)' }} />
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.85)' }}>{cvData.titre}</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '28px 36px', boxSizing: 'border-box' }}>
        <div style={{ paddingRight: '18px' }}>
          {cvData.accroche && (
            <div style={{ marginBottom: '24px' }}>
              {barTitle('Profil')}
              <div style={{ fontSize: '10px', lineHeight: 1.7, color: '#333' }}>{cvData.accroche}</div>
            </div>
          )}
          {contacts.length > 0 && (
            <div>
              {barTitle('Contact')}
              <div style={{ fontSize: '10px', color: '#444', lineHeight: 1.9 }}>
                {contacts.map((c, i) => <div key={i}>{c}</div>)}
              </div>
            </div>
          )}
        </div>

        <div style={{ paddingLeft: '18px' }}>
          {formations.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              {barTitle('Études')}
              {formations.map((f, i) => (
                <div key={i} style={{ marginBottom: i < formations.length - 1 ? '10px' : 0 }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#111' }}>{f.diplome}</div>
                  <div style={{ fontSize: '10px', color, marginTop: '2px' }}>{f.etablissement}</div>
                  <div style={{ fontSize: '9.5px', color: '#888' }}>{f.periode}</div>
                </div>
              ))}
            </div>
          )}
          {competences.length > 0 && (
            <div>
              {barTitle('Compétences')}
              {competences.map((c, i) => <div key={i} style={{ fontSize: '10px', color: '#333', lineHeight: 1.75 }}>• {c}</div>)}
            </div>
          )}
        </div>

        {experiences.length > 0 && (
          <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
            {barTitle('Expériences professionnelles')}
            {experiences.map((exp, i) => (
              <div key={i} style={{ marginBottom: i < experiences.length - 1 ? '16px' : 0 }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#111', textTransform: 'uppercase' }}>{exp.poste}</div>
                <div style={{ fontSize: '10.5px', color, marginTop: '2px' }}>{exp.entreprise}</div>
                <div style={{ fontSize: '10px', color: '#888', marginBottom: '6px' }}>{[exp.lieu, exp.periode].filter(Boolean).join(' · ')}</div>
                {exp.missions?.length > 0 && (
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {exp.missions.map((m, j) => <li key={j} style={{ fontSize: '10px', color: '#444', lineHeight: 1.65 }}>• {m}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {langues.length > 0 && (
          <div style={{ gridColumn: '1 / -1', marginTop: '16px' }}>
            {barTitle('Langues')}
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              {langues.map((l, i) => <div key={i} style={{ fontSize: '10px', color: '#333' }}>{l.langue} · {l.niveau}</div>)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════
// MÉTADONNÉES
// ═══════════════════════════════════════════════════════════════════
export const TEMPLATES_EXTRA_META = {
  spectrum: { nom: 'Spectrum', style: 'Bande dégradée colorée',
    secteurs: ['Tech', 'Marketing', 'Créatif', 'Tous secteurs'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 88, couleurDefaut: '#06b6d4',
    description: 'Une bande dégradée et des badges colorés pour un profil dynamique.', recommande: true },

  latitude: { nom: 'Latitude', style: 'Bandeau photo pleine largeur',
    secteurs: ['Créatif', 'Communication', 'Marketing', 'Tous secteurs'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 82, couleurDefaut: '#7c3aed',
    description: "Ta photo en grand format dès l'ouverture. Impact visuel immédiat.", recommande: false },

  monogramme: { nom: 'Monogramme', style: 'Élégance serif filigranée',
    secteurs: ['Direction', 'Conseil', 'Juridique', 'Luxe'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 93, couleurDefaut: '#b45309',
    description: 'Tes initiales en filigrane et une typographie serif raffinée.', recommande: true },

  infographie: { nom: 'Infographie', style: 'Stats et barres visuelles',
    secteurs: ['Data', 'Tech', 'Product', 'Marketing'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 84, couleurDefaut: '#0ea5e9',
    description: 'Ton parcours en chiffres, avec barres de compétences et étoiles de langues.', recommande: true },

  chapters: { nom: 'Chapters', style: 'Serif éditorial numéroté',
    secteurs: ['Édition', 'Culture', 'Communication', 'Tous secteurs'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'], atsScore: 91, couleurDefaut: '#dc2626',
    description: 'Chaque section comme un chapitre. Une lecture narrative et soignée.', recommande: false },

  blueprint: { nom: 'Blueprint', style: 'Plan technique',
    secteurs: ['Ingénierie', 'BTP', 'Industrie', 'Technique'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 90, couleurDefaut: '#2563eb',
    description: 'Habilitations et certifications mises en avant, style plan technique.', recommande: true },

  portrait: { nom: 'Portrait', style: 'Panneau photo pleine hauteur',
    secteurs: ['Créatif', 'Communication', 'Commerce', 'Tous secteurs'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 83, couleurDefaut: '#be185d',
    description: 'Un grand panneau photo qui pose immédiatement ta présence.', recommande: false },

  reseau: { nom: 'Réseau', style: 'Style profil professionnel',
    secteurs: ['Commerce', 'RH', 'Management', 'Tous secteurs'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 87, couleurDefaut: '#0a66c2',
    description: 'Le format profil réseau professionnel que tout recruteur reconnaît.', recommande: true },

  pastel: { nom: 'Pastel', style: 'Douceur pastel',
    secteurs: ['Éducation', 'Social', 'Créatif', 'Tous secteurs'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 85, couleurDefaut: '#9333ea',
    description: 'Une palette douce et des tags de personnalité pour un profil chaleureux.', recommande: false },

  odyssee: { nom: 'Odyssée', style: 'Timeline dégradée',
    secteurs: ['Tous secteurs', 'Management', 'Ingénierie'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 89, couleurDefaut: '#059669',
    description: 'Ton parcours sur une timeline verticale dégradée, chip noires pour l\'expertise.', recommande: true },

  neon: { nom: 'Néon', style: 'Tech sombre',
    secteurs: ['Gaming', 'Tech', 'Startup', 'Design'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 75, couleurDefaut: '#10b981',
    description: 'Design sombre premium. Pour les profils tech qui osent.', recommande: false },

  origami: { nom: 'Origami', style: 'Géométrique japonais',
    secteurs: ['Design', 'Architecture', 'Créatif', 'Tech'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 92, couleurDefaut: '#f59e0b',
    description: 'Formes géométriques discrètes pour un profil créatif sobre.', recommande: false },

  cinema: { nom: 'Cinéma', style: 'Pellicule',
    secteurs: ['Médias', 'Communication', 'Créatif', 'Événementiel'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 70, couleurDefaut: '#ef4444',
    description: "Style pellicule cinéma. Pour les métiers de l'image et de la culture.", recommande: false },

  archipel: { nom: 'Archipel', style: 'Modulaire îles',
    secteurs: ['Tous secteurs', 'Startup', 'Tech', 'Conseil'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 86, couleurDefaut: '#0891b2',
    description: 'Contenu organisé en îles distinctes. Lecture rapide et agréable.', recommande: true },

  gravure: { nom: 'Gravure', style: 'Carte premium',
    secteurs: ['Juridique', 'Finance', 'Luxe', 'Conseil'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 94, couleurDefaut: '#1c1917',
    description: 'Élégance haut de gamme inspirée des cartes de visite de prestige.', recommande: true },

  metro: { nom: 'Métro', style: 'Lignes colorées',
    secteurs: ['Tous secteurs', 'Communication', 'Transport'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 88, couleurDefaut: '#dc2626',
    description: 'Inspiré du plan de métro parisien. Sections colorées distinctes.', recommande: false },

  constellation: { nom: 'Constellation', style: 'Points connectés',
    secteurs: ['Tech', 'Data', 'Conseil', 'Innovation'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 90, couleurDefaut: '#4f46e5',
    description: 'Réseau de points évoquant les connexions professionnelles.', recommande: true },

  tatami: { nom: 'Tatami', style: 'Minimalisme japonais',
    secteurs: ['Tous secteurs', 'Design', 'Luxe', 'Direction'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 97, couleurDefaut: '#059669',
    description: "L'espace vide comme élément de design. Pureté absolue.", recommande: true },

  carrousel: { nom: 'Carrousel', style: 'Moderne dynamique',
    secteurs: ['Commerce', 'Marketing', 'Communication'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 85, couleurDefaut: '#e11d48',
    description: 'Énergie et mouvement. Pour les profils dynamiques et commerciaux.', recommande: false },

  foret: { nom: 'Forêt', style: 'Nature et impact',
    secteurs: ['Environnement', 'RSE', 'Social', 'ESS', 'Agriculture'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 87, couleurDefaut: '#15803d',
    description: 'Palette naturelle pour les professionnels de l\'impact et du durable.', recommande: true },

  aquarelle: { nom: 'Aquarelle', style: 'Artistique organique',
    secteurs: ['Design', 'Art', 'Communication', 'Créatif'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 89, couleurDefaut: '#8b5cf6',
    description: 'Formes organiques et touches aquarelle pour un profil créatif doux.', recommande: false },

  quantum: { nom: 'Quantum', style: 'Futuriste tech',
    secteurs: ['Tech', 'Data', 'IA', 'Recherche', 'Deep Tech'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 91, couleurDefaut: '#6366f1',
    description: 'Design épuré ultra-moderne pour les profils tech de pointe.', recommande: true },

  storyboard: { nom: 'Storyboard', style: 'Narration numérotée',
    secteurs: ['Marketing', 'Communication', 'Médias', 'Créatif'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 88, couleurDefaut: '#f97316',
    description: 'Votre parcours raconté comme une histoire. Sections numérotées.', recommande: false },

  institution: { nom: 'Institution', style: 'Institutionnel',
    secteurs: ['Fonction publique', 'Éducation', 'Recherche', 'Santé'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'], atsScore: 98, couleurDefaut: '#1e3a8a',
    description: 'Rigueur et crédibilité pour les candidatures institutionnelles.', recommande: true },

  manifeste: { nom: 'Manifeste', style: 'Déclaration sombre',
    secteurs: ['Direction', 'Entrepreneuriat', 'Créatif', 'Leadership'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 72, couleurDefaut: '#0f0f1a',
    description: 'Un CV qui est une prise de position. Pour les leaders assumés.', recommande: false },

  pixel: { nom: 'Pixel', style: 'Gaming geek',
    secteurs: ['Gaming', 'Tech', 'Dev', 'Animation'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 83, couleurDefaut: '#8b5cf6',
    description: "Références gaming et culture geek. Pour l'industrie du jeu vidéo.", recommande: false },

  panorama: { nom: 'Panorama', style: 'Photo pleine largeur',
    secteurs: ['Direction', 'Commerce', 'Management', 'Conseil'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'], atsScore: 85, couleurDefaut: '#0369a1',
    description: 'Vision large avec photo panoramique. Format grand manager.', recommande: true },

  kodak: { nom: 'Kodak', style: 'Vintage photographique',
    secteurs: ['Photo', 'Art', 'Médias', 'Communication', 'Culture'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 91, couleurDefaut: '#ea580c',
    description: 'Nostalgie créative avec effet polaroïd. Pour les artistes et créatifs.', recommande: false },

  matrice: { nom: 'Matrice', style: 'Grille analytique',
    secteurs: ['Finance', 'Conseil', 'Data', 'Ingénierie'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'], atsScore: 94, couleurDefaut: '#16a34a',
    description: 'Grille rigoureuse pour les profils analytiques et chiffrés.', recommande: true },

  solstice: { nom: 'Solstice', style: 'Chaleur méditerranéenne',
    secteurs: ['Tourisme', 'Hôtellerie', 'Commerce', 'Événementiel'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 88, couleurDefaut: '#d97706',
    description: 'Énergie et chaleur méditerranéenne. Pour les métiers du contact.', recommande: false },

  nordic: { nom: 'Nordic', style: 'Scandinave épuré',
    secteurs: ['Tech', 'Design', 'Tous secteurs', 'Innovation'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 96, couleurDefaut: '#0369a1',
    description: "Fonctionnalité scandinave. Chaque élément a une raison d'être.", recommande: true },

  memoire: { nom: 'Mémoire', style: 'Vintage souvenir',
    secteurs: ['Éducation', 'Culture', 'Art', 'Communication'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 90, couleurDefaut: '#7c3aed',
    description: 'Effet papier vieilli et photo polaroïd. Chaleureux et mémorable.', recommande: false },

  territoire: { nom: 'Territoire', style: 'Ancrage local',
    secteurs: ['Agriculture', 'Environnement', 'RSE', 'BTP', 'Énergie'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 88, couleurDefaut: '#065f46',
    description: 'Ancrage territorial et valeurs locales mis en avant.', recommande: false },

  facette: { nom: 'Facette', style: 'Multi-facettes',
    secteurs: ['Marketing', 'Communication', 'RH', 'Créatif'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 85, couleurDefaut: '#db2777',
    description: 'Header en trois colonnes pour montrer toutes vos facettes.', recommande: false },

  phare: { nom: 'Phare', style: 'Navigation guidée',
    secteurs: ['Transport', 'Logistique', 'Marine', 'Aviation', 'Tous'],
    niveaux: ['Confirmé', 'Senior'], atsScore: 89, couleurDefaut: '#0e7490',
    description: 'Structure de navigation claire pour guider la lecture du recruteur.', recommande: true },

  mineral: { nom: 'Minéral', style: 'Terre authentique',
    secteurs: ['BTP', 'Industrie', 'Agriculture', 'Artisanat', 'Tous'],
    niveaux: ['Junior', 'Confirmé', 'Senior'], atsScore: 95, couleurDefaut: '#57534e',
    description: 'Palette terre et matières naturelles. Authenticité et solidité.', recommande: true },

  voltage: { nom: 'Voltage', style: 'Énergie sombre',
    secteurs: ['Commerce', 'Vente', 'Startup', 'Énergie'],
    niveaux: ['Junior', 'Confirmé'], atsScore: 74, couleurDefaut: '#eab308',
    description: 'Header jaune électrique sur fond sombre. Énergie et audace.', recommande: false },

  atlas: { nom: 'Atlas', style: 'International',
    secteurs: ['International', 'Commerce', 'Conseil', 'Tech', 'Finance'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'], atsScore: 92, couleurDefaut: '#0f766e',
    description: 'Mobilité internationale et multilinguisme mis en avant.', recommande: true },

  epure: { nom: 'Épure', style: 'Typographie pure absolue',
    secteurs: ['Tous secteurs', 'Direction', 'Senior', 'Cadre'],
    niveaux: ['Senior', 'Cadre', 'Direction'], atsScore: 100, couleurDefaut: '#111827',
    description: 'Zero décoration. Typographie seule. Le meilleur score ATS possible.', recommande: true },

  victoire: { nom: 'Victoire', style: 'Achievement premium',
    secteurs: ['Tous secteurs', 'Commerce', 'Management', 'Direction'],
    niveaux: ['Confirmé', 'Senior', 'Cadre', 'Direction'], atsScore: 90, couleurDefaut: '#7c3aed',
    description: 'Le template ultime. Achievements, chiffres en avant, design premium.', recommande: true },

  bleuClassique: { nom: 'Classique Bleu', style: 'Deux colonnes marine', atsScore: 90,
    secteurs: ['Tous secteurs', 'Finance', 'Conseil', 'Marketing'],
    niveaux: ['Junior', 'Confirmé', 'Senior', 'Cadre'],
    couleurDefaut: '#1e2d4a', recommande: true,
    description: 'Le classique deux colonnes marine. Photo carrée, structure éprouvée.' },

  stageVert: { nom: 'Stage Vert', style: 'Vert sauge étudiant', atsScore: 88,
    secteurs: ['Tous secteurs', 'Marketing', 'Communication', 'Commerce'],
    niveaux: ['Junior', 'Étudiant'],
    couleurDefaut: '#4a6741', recommande: true,
    description: 'Design vert sauge frais. Idéal pour les stages et alternances.' },

  expressRose: { nom: 'Express Rose', style: 'Rose poudré express', atsScore: 87,
    secteurs: ['Mode', 'Design', 'Communication', 'Marketing'],
    niveaux: ['Junior', 'Confirmé'],
    couleurDefaut: '#7d6060', recommande: false,
    description: 'Rose poudré et taupe chaud. Élégant pour les métiers créatifs.' },

  anglaisMinimaliste: { nom: 'Anglais Minimaliste', style: 'Noir blanc international', atsScore: 95,
    secteurs: ['International', 'Tous secteurs', 'Finance', 'RH'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'],
    couleurDefaut: '#111111', recommande: true,
    description: 'Design minimaliste noir et blanc. Parfait pour les candidatures internationales.' },

  photoTeal: { nom: 'Photo Teal', style: 'Photo ronde bandeau teal', atsScore: 86,
    secteurs: ['Tous secteurs', 'Commerce', 'RH', 'Marketing'],
    niveaux: ['Junior', 'Confirmé'],
    couleurDefaut: '#167a7a', recommande: false,
    description: 'Photo ronde mise en valeur avec bandeau teal. Structure claire et moderne.' },

  candidatureSpontanee: { nom: 'Candidature Spontanée', style: 'Panneau coloré latéral', atsScore: 84,
    secteurs: ['Marketing', 'Communication', 'Commerce', 'Créatif'],
    niveaux: ['Junior', 'Confirmé'],
    couleurDefaut: '#e8c800', recommande: false,
    description: 'Grand nom impactant à gauche, photo et panneau coloré à droite.' },

  colonnesVert: { nom: '2 Colonnes Vert', style: 'Vert forêt deux colonnes', atsScore: 89,
    secteurs: ['Tous secteurs', 'Commerce', 'Tourisme', 'Nature'],
    niveaux: ['Junior', 'Confirmé', 'Senior'],
    couleurDefaut: '#2d5a4a', recommande: true,
    description: 'Vert forêt profond avec dates en marge gauche. Structure claire et naturelle.' },

  interimBleu: { nom: 'Intérim Bleu', style: 'Bleu nuit professionnel', atsScore: 88,
    secteurs: ['Industrie', 'Logistique', 'Administration', 'Tous secteurs'],
    niveaux: ['Junior', 'Confirmé'],
    couleurDefaut: '#1a2580', recommande: false,
    description: 'Bleu nuit structuré. Header fort avec photo pour les profils polyvalents.' },

  jobEtudiant: { nom: 'Job Étudiant', style: 'Bleu clair étudiant', atsScore: 87,
    secteurs: ['Tous secteurs', 'Service', 'Commerce', 'Restauration'],
    niveaux: ['Junior', 'Étudiant'],
    couleurDefaut: '#4a6fa5', recommande: false,
    description: 'Bleu clair dynamique. Grand nom et photo pour les jobs étudiants.' },

  timelineDeuxPages: { nom: '2 Pages Timeline', style: 'Vert et beige timeline', atsScore: 86,
    secteurs: ['Industrie', 'Ingénierie', 'Tous secteurs', 'BTP'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'],
    couleurDefaut: '#c8a96e', recommande: true,
    description: 'Timeline verticale sur fond vert. Pour valoriser un long parcours.' },

  banqueFinance: { nom: 'Banque Finance', style: 'Bleu gris bancaire', atsScore: 93,
    secteurs: ['Finance', 'Banque', 'Assurance', 'Audit'],
    niveaux: ['Confirmé', 'Senior', 'Cadre'],
    couleurDefaut: '#3d4f6d', recommande: true,
    description: 'Sérieux et structuré. Bandeaux colorés pour chaque section. Parfait pour la finance.' },

  aideSoignant: { nom: 'Aide-Soignant', style: 'Teal médical centré', atsScore: 92,
    secteurs: ['Santé', 'Médical', 'Social', 'Paramédical'],
    niveaux: ['Junior', 'Confirmé', 'Senior'],
    couleurDefaut: '#1f7f7f', recommande: true,
    description: 'Teal médical avec titres centrés encadrés. Structure claire pour le secteur santé.' },

  beauCvSauge: { nom: 'Beau CV Sauge', style: 'Vert sauge grille', atsScore: 88,
    secteurs: ['Ingénierie', 'Tous secteurs', 'Conseil', 'Tech'],
    niveaux: ['Confirmé', 'Senior'],
    couleurDefaut: '#2d6b5a', recommande: true,
    description: 'Vert sauge élégant avec grille deux colonnes. Barres horizontales distinctives.' },
}

export function CVTemplateExtra({ cvData, template = 'spectrum', color }) {
  const couleur = color || TEMPLATES_EXTRA_META[template]?.couleurDefaut || '#06b6d4'
  switch (template) {
    case 'spectrum': return <Spectrum cvData={cvData} color={couleur} />
    case 'latitude': return <Latitude cvData={cvData} color={couleur} />
    case 'monogramme': return <Monogramme cvData={cvData} color={couleur} />
    case 'infographie': return <Infographie cvData={cvData} color={couleur} />
    case 'chapters': return <Chapters cvData={cvData} color={couleur} />
    case 'blueprint': return <Blueprint cvData={cvData} color={couleur} />
    case 'portrait': return <Portrait cvData={cvData} color={couleur} />
    case 'reseau': return <Reseau cvData={cvData} color={couleur} />
    case 'pastel': return <Pastel cvData={cvData} color={couleur} />
    case 'odyssee': return <Odyssee cvData={cvData} color={couleur} />
    case 'neon': return <Neon cvData={cvData} color={couleur} />
    case 'origami': return <Origami cvData={cvData} color={couleur} />
    case 'cinema': return <Cinema cvData={cvData} color={couleur} />
    case 'archipel': return <Archipel cvData={cvData} color={couleur} />
    case 'gravure': return <Gravure cvData={cvData} color={couleur} />
    case 'metro': return <Metro cvData={cvData} color={couleur} />
    case 'constellation': return <Constellation cvData={cvData} color={couleur} />
    case 'tatami': return <Tatami cvData={cvData} color={couleur} />
    case 'carrousel': return <Carrousel cvData={cvData} color={couleur} />
    case 'foret': return <Foret cvData={cvData} color={couleur} />
    case 'aquarelle': return <Aquarelle cvData={cvData} color={couleur} />
    case 'quantum': return <Quantum cvData={cvData} color={couleur} />
    case 'storyboard': return <Storyboard cvData={cvData} color={couleur} />
    case 'institution': return <Institution cvData={cvData} color={couleur} />
    case 'manifeste': return <Manifeste cvData={cvData} color={couleur} />
    case 'pixel': return <Pixel cvData={cvData} color={couleur} />
    case 'panorama': return <Panorama cvData={cvData} color={couleur} />
    case 'kodak': return <Kodak cvData={cvData} color={couleur} />
    case 'matrice': return <Matrice cvData={cvData} color={couleur} />
    case 'solstice': return <Solstice cvData={cvData} color={couleur} />
    case 'nordic': return <Nordic cvData={cvData} color={couleur} />
    case 'memoire': return <Memoire cvData={cvData} color={couleur} />
    case 'territoire': return <Territoire cvData={cvData} color={couleur} />
    case 'facette': return <Facette cvData={cvData} color={couleur} />
    case 'phare': return <Phare cvData={cvData} color={couleur} />
    case 'mineral': return <Mineral cvData={cvData} color={couleur} />
    case 'voltage': return <Voltage cvData={cvData} color={couleur} />
    case 'atlas': return <Atlas cvData={cvData} color={couleur} />
    case 'epure': return <Epure cvData={cvData} />
    case 'victoire': return <Victoire cvData={cvData} color={couleur} />
    case 'bleuClassique': return <BleuClassique cvData={cvData} color={couleur} />
    case 'stageVert': return <StageVert cvData={cvData} color={couleur} />
    case 'expressRose': return <ExpressRose cvData={cvData} color={couleur} />
    case 'anglaisMinimaliste': return <AnglaisMinimaliste cvData={cvData} color={couleur} />
    case 'photoTeal': return <PhotoTeal cvData={cvData} color={couleur} />
    case 'candidatureSpontanee': return <CandidatureSpontanee cvData={cvData} color={couleur} />
    case 'colonnesVert': return <ColonnesVert cvData={cvData} color={couleur} />
    case 'interimBleu': return <InterimBleu cvData={cvData} color={couleur} />
    case 'jobEtudiant': return <JobEtudiant cvData={cvData} color={couleur} />
    case 'timelineDeuxPages': return <TimelineDeuxPages cvData={cvData} color={couleur} />
    case 'banqueFinance': return <BanqueFinance cvData={cvData} color={couleur} />
    case 'aideSoignant': return <AideSoignant cvData={cvData} color={couleur} />
    case 'beauCvSauge': return <BeauCvSauge cvData={cvData} color={couleur} />
    default: return <Spectrum cvData={cvData} color={couleur} />
  }
}

export {
  Spectrum, Latitude, Monogramme, Infographie, Chapters,
  Blueprint, Portrait, Reseau, Pastel, Odyssee,
  Neon, Origami, Cinema, Archipel, Gravure,
  Metro, Constellation, Tatami, Carrousel, Foret,
  Aquarelle, Quantum, Storyboard, Institution, Manifeste,
  Pixel, Panorama, Kodak, Matrice, Solstice,
  Nordic, Memoire, Territoire, Facette, Phare,
  Mineral, Voltage, Atlas, Epure, Victoire,
  BleuClassique, StageVert, ExpressRose, AnglaisMinimaliste, PhotoTeal,
  CandidatureSpontanee, ColonnesVert, InterimBleu, JobEtudiant, TimelineDeuxPages,
  BanqueFinance, AideSoignant, BeauCvSauge,
}
