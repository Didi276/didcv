// src/CVTemplatesExtra.jsx
// Templates 41 à 50 — vague 5, dimensions A4 exactes (794x1123px @ 96dpi)
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
    default: return <Spectrum cvData={cvData} color={couleur} />
  }
}

export {
  Spectrum, Latitude, Monogramme, Infographie, Chapters,
  Blueprint, Portrait, Reseau, Pastel, Odyssee,
}
