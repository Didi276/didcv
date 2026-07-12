import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as pdfjsLib from 'pdfjs-dist'
import { supabase } from './supabase'
import { CVTemplate } from './CVTemplates'
import CVEditorBlocks from './CVEditorBlocks'
import Navbar from './Navbar'
import { detecterSecteur, getSecteurConfig, buildPromptCV } from './secteurConfig'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const ADMIN_EMAILS = ['fernandochokki@gmail.com', 'chokkifernando@gmail.com', 'carlinazon@gmail.com']

const SECTEUR_LABELS = {
  tech: '💻 Tech', sante: '🏥 Sante', btp: '🏗 BTP',
  restauration: '🍽 Restauration', commerce: '🛒 Commerce',
  transport: '🚛 Transport', creatif: '🎨 Creatif',
  securite: '🔒 Securite', beaute: '💅 Beaute',
  junior: '🎓 Junior', cadre: '👔 Cadre', tertiaire: '📊 Tertiaire'
}

function LettreRenderer({ lettre }) {
  if (!lettre.includes('||EXP||')) {
    return <div style={{ fontFamily: 'Georgia,serif', fontSize: '13px', lineHeight: '1.9', color: '#222', whiteSpace: 'pre-wrap', padding: '32px' }}>{lettre}</div>
  }
  const extract = (tag, next) => {
    const start = lettre.indexOf(tag) + tag.length
    const end = next ? lettre.indexOf(next) : lettre.length
    return lettre.slice(start, end).trim()
  }
  const expLines = extract('||EXP||', '||DEST||').split('\n').filter(l => l.trim())
  const destLines = extract('||DEST||', '||DATE||').split('\n').filter(l => l.trim())
  const dateStr = extract('||DATE||', '||BODY||')
  const bodyStr = extract('||BODY||', null)
  return (
    <div style={{ fontFamily: 'Georgia,serif', fontSize: '13px', lineHeight: '1.9', color: '#222', padding: '32px 40px', background: '#fff' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '28px' }}>
        <div>{expLines.map((l, i) => <div key={i} style={{ fontWeight: i === 0 ? '700' : '400', lineHeight: '1.7' }}>{l}</div>)}</div>
        <div>
          {destLines.map((l, i) => <div key={i} style={{ fontWeight: i === 0 ? '700' : '400', lineHeight: '1.7' }}>{l}</div>)}
          {dateStr && <div style={{ marginTop: '12px', color: '#555' }}>{dateStr}</div>}
        </div>
      </div>
      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.9' }}>{bodyStr}</div>
    </div>
  )
}

export default function Generate() {
  const [searchParams] = useSearchParams()
  const templateChoisi = searchParams.get('template') || 'finance'

  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [cvFile, setCvFile] = useState(null)
  const [cvTexte, setCvTexte] = useState('')
  const [photoManuelle, setPhotoManuelle] = useState(null)
  const [offreEmploi, setOffreEmploi] = useState('')
  const [secteurDetecte, setSecteurDetecte] = useState(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [cvData, setCvData] = useState(null)
  const [lettre, setLettre] = useState('')
  const [activeTab, setActiveTab] = useState('cv')
  const [showEditor, setShowEditor] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
        if (data?.prenom) setProfile(data)
      }
      const prefill = sessionStorage.getItem('offre_prefill')
      if (prefill) { setOffreEmploi(prefill); sessionStorage.removeItem('offre_prefill') }
    }
    init()
  }, [])

  useEffect(() => {
    if (offreEmploi.length > 50) setSecteurDetecte(detecterSecteur(offreEmploi, ''))
    else setSecteurDetecte(null)
  }, [offreEmploi])

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setCvFile(file)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const pdf = await pdfjsLib.getDocument(new Uint8Array(ev.target.result)).promise
      let text = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        text += content.items.map(item => item.str).join(' ') + '\n'
      }
      setCvTexte(text)
    }
    reader.readAsArrayBuffer(file)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoManuelle(ev.target.result)
    reader.readAsDataURL(file)
  }

  const buildProfileText = (p) => {
    let t = `Prenom: ${p.prenom}\nNom: ${p.nom}\nEmail: ${p.email}\nTel: ${p.telephone}\nVille: ${p.ville}\nTitre: ${p.titre}\nAccroche: ${p.accroche}\n\n`
    if (p.experiences?.length) {
      t += `EXPERIENCES:\n`
      p.experiences.forEach((exp, i) => {
        t += `[${i+1}] ${exp.poste} - ${exp.entreprise} - ${exp.periode} - ${exp.lieu}\n`
        exp.missions?.filter(m=>m).forEach(m => { t += `  - ${m}\n` })
      })
    }
    if (p.formations?.length) {
      t += `\nFORMATIONS:\n`
      p.formations.forEach(f => { t += `  ${f.diplome} | ${f.etablissement} | ${f.periode}\n` })
    }
    if (p.competences?.filter(c=>c).length) t += `\nCOMPETENCES: ${p.competences.filter(c=>c).join(', ')}\n`
    if (p.langues?.length) { t += `\nLANGUES:\n`; p.langues.forEach(l => { t += `  ${l.langue}: ${l.niveau}\n` }) }
    if (p.certifications?.filter(c=>c.titre).length) { t += `\nCERTIFICATIONS:\n`; p.certifications.filter(c=>c.titre).forEach(c => { t += `  ${c.titre} | ${c.organisme}\n` }) }
    if (p.centres_interet?.filter(c=>c).length) t += `\nINTERETS: ${p.centres_interet.filter(c=>c).join(', ')}\n`
    return t
  }

  const handleGenerate = async () => {
    if (!offreEmploi.trim()) { alert("Colle une offre d'emploi !"); return }
    if (!profile && !cvFile) { alert("Upload ton CV PDF ou remplis ton profil !"); return }
    setLoading(true)
    setCvData(null)
    setLettre('')
    setProgress("Analyse de l'offre...")

    if (user) {
      const { count } = await supabase.from('cvs').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
      if (count >= 1 && !ADMIN_EMAILS.includes(user.email)) {
        alert('CV gratuit deja utilise ! Passe au plan Pro pour des CV illimites.')
        setLoading(false)
        return
      }
    }

    const sourceCV = profile ? buildProfileText(profile) : cvTexte
    const nbExp = profile?.experiences?.length || 0
    const secteur = detecterSecteur(offreEmploi, sourceCV)
    const config = getSecteurConfig(secteur, nbExp, profile)
    const promptCV = buildPromptCV(sourceCV, offreEmploi, secteur, config, nbExp,
      profile?.certifications?.filter(c=>c.titre).length > 0,
      profile?.centres_interet?.filter(c=>c).length > 0)
    const dateJour = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

    const fetchWithRetry = async (url, opts) => {
      for (let i = 0; i <= 1; i++) {
        try {
          const r = await fetch(url, opts)
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r
        } catch (e) {
          if (i === 1) throw e
          await new Promise(r => setTimeout(r, 1500))
        }
      }
    }

    try {
      setProgress("Generation du CV et de la lettre...")

      const [resCV, resLM] = await Promise.all([
        fetchWithRetry('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 6000,
            system: `Tu es un expert RH senior specialise en ${config.label}. Tu retournes UNIQUEMENT un JSON valide, sans texte avant ou apres, sans balises markdown.`,
            messages: [{ role: 'user', content: promptCV }]
          })
        }),
        fetchWithRetry('/api/generate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001', max_tokens: 1500,
            messages: [{ role: 'user', content: `Tu es expert en lettres de motivation pour le secteur ${config.label}.
PROFIL: ${sourceCV}
OFFRE: ${offreEmploi}
DATE: ${dateJour}
Redige une lettre avec ces marqueurs EXACTS:
||EXP||
[Prenom Nom]
[Email]
[Telephone]
[Ville]
||DEST||
[Entreprise]
[Service RH]
||DATE||
[Ville], le ${dateJour}
||BODY||
Objet: Candidature au poste de [intitule du poste]
[Corps de la lettre 300-380 mots, 4 paragraphes, chiffres obligatoires, ton adapte au secteur ${config.label}]
Cordialement,
[Prenom Nom]
Retourne UNIQUEMENT le texte avec les marqueurs.` }]
          })
        })
      ])

      const dataCV = await resCV.json()
      const dataLM = await resLM.json()
      const texteCV = dataCV.content[0].text
      const jsonPropre = texteCV.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

      let json
      try { json = JSON.parse(jsonPropre) }
      catch {
        const match = jsonPropre.match(/\{[\s\S]*\}/)
        if (match) { try { json = JSON.parse(match[0]) } catch { throw new Error("CV incomplet. Reessaie.") } }
        else throw new Error("CV incomplet. Reessaie.")
      }

      if (!json.prenom || !json.experiences) throw new Error('CV invalide. Reessaie.')

      json.photo = profile?.photo ?? photoManuelle ?? undefined
      if (!json.certifications) json.certifications = []
      if (!json.centres_interet) json.centres_interet = []
      json._secteur = secteur

      setCvData(json)
      setLettre(dataLM.content[0].text)
      setActiveTab('cv')

      if (user) {
        await supabase.from('cvs').insert({
          user_id: user.id, template: templateChoisi,
          cv_data: json, lettre_motivation: dataLM.content[0].text,
          offre_titre: offreEmploi.substring(0, 60).trim()
        })
      }
    } catch (err) {
      alert(err.message?.includes('incomplet') || err.message?.includes('invalide') ? err.message : 'Erreur de generation. Reessaie.')
      console.error(err)
    }
    setLoading(false)
    setProgress('')
  }

  const handleDownloadCV = async () => {
    const el = document.getElementById('cv-to-print')
    if (!el) return
    const canvas = await html2canvas(el, { scale: 4, useCORS: true, backgroundColor: '#ffffff', width: 794, height: 1123, logging: false })
    const pdf = new jsPDF('p', 'mm', 'a4', true)
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297, '', 'FAST')
    pdf.save(`CV-${cvData.prenom}-${cvData.nom}.pdf`)
  }

  const handleDownloadLettre = () => {
    const pdf = new jsPDF('p', 'mm', 'a4')
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(11)
    const lines = pdf.splitTextToSize(lettre.replace(/\|\|[A-Z]+\|\|/g, ''), 170)
    let y = 20
    lines.forEach(line => { if (y > 280) { pdf.addPage(); y = 20 } pdf.text(line, 20, y); y += 6 })
    pdf.save(`Lettre-${cvData?.prenom}-${cvData?.nom}.pdf`)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="generate" />

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', height: 'calc(100vh - 58px)' }}>

        {/* ─── PANNEAU GAUCHE ─────────────────────────────── */}
        <div style={{ background: '#fff', borderRight: '1px solid #f0f0f0', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

          {/* Header panneau */}
          <div style={{ padding: '24px 24px 0', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f0f1a', margin: 0, letterSpacing: '-0.3px' }}>
                Generer mon CV
              </h2>
              <a href="/templates" style={{ fontSize: '12px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>
                Changer template
              </a>
            </div>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 20px' }}>Template : <strong style={{ color: '#374151' }}>{templateChoisi}</strong></p>
          </div>

          {/* Profil charge */}
          {profile ? (
            <div style={{ margin: '0 24px 16px', padding: '12px 14px', background: '#f8f9ff', borderRadius: '10px', border: '1px solid #ede9fe', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {profile.photo
                  ? <img src={profile.photo} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                  : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700', flexShrink: 0 }}>{profile.prenom?.[0]}{profile.nom?.[0]}</div>
                }
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>{profile.prenom} {profile.nom}</div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.titre}</div>
                </div>
                <a href="/profile" style={{ fontSize: '11px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600', flexShrink: 0 }}>Modifier</a>
              </div>
              <button onClick={() => setProfile(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '11px', cursor: 'pointer', padding: '6px 0 0', textDecoration: 'underline', fontFamily: 'inherit' }}>
                Utiliser un CV PDF
              </button>
            </div>
          ) : (
            <div style={{ margin: '0 24px 16px', flexShrink: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Ton CV actuel (PDF)</div>
              <label style={{ display: 'block', border: '2px dashed #e5e7eb', borderRadius: '10px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: cvFile ? '#f0fdf4' : '#fafafa', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!cvFile) e.currentTarget.style.borderColor = '#4f46e5' }}
                onMouseLeave={e => { if (!cvFile) e.currentTarget.style.borderColor = '#e5e7eb' }}>
                <input type="file" accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
                {cvFile ? (
                  <div>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>✅</div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#16a34a' }}>{cvFile.name}</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>{cvTexte.length} caracteres extraits</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>📁</div>
                    <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>Clique pour uploader</div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>PDF uniquement</div>
                  </div>
                )}
              </label>

              {/* Photo */}
              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {photoManuelle
                  ? <img src={photoManuelle} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  : <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>👤</div>
                }
                <div>
                  <label style={{ cursor: 'pointer' }}>
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                    <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600', textDecoration: 'underline' }}>
                      {photoManuelle ? 'Changer la photo' : 'Ajouter ma photo'}
                    </span>
                  </label>
                  <div style={{ fontSize: '11px', color: '#9ca3af' }}>JPG, PNG - max 2 Mo</div>
                </div>
                {photoManuelle && <button onClick={() => setPhotoManuelle(null)} style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', cursor: 'pointer', padding: 0 }}>Supprimer</button>}
              </div>
            </div>
          )}

          {/* Offre d'emploi */}
          <div style={{ margin: '0 24px 16px', flexShrink: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              Offre d'emploi
            </div>
            <textarea
              value={offreEmploi}
              onChange={e => setOffreEmploi(e.target.value)}
              placeholder="Colle ici le texte complet de l'offre d'emploi..."
              rows={8}
              style={{ width: '100%', border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '12px 14px', fontSize: '13px', lineHeight: '1.6', color: '#374151', resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.15s' }}
              onFocus={e => e.target.style.borderColor = '#4f46e5'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
            {secteurDetecte && (
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ color: '#9ca3af' }}>Secteur detecte :</span>
                <span style={{ background: '#ede9fe', color: '#5b21b6', padding: '2px 10px', borderRadius: '20px', fontWeight: '600', fontSize: '11px' }}>
                  {SECTEUR_LABELS[secteurDetecte] || secteurDetecte}
                </span>
              </div>
            )}
          </div>

          {/* Bouton generer */}
          <div style={{ padding: '0 24px 24px', flexShrink: 0 }}>
            <button onClick={handleGenerate} disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit', letterSpacing: '-0.2px', transition: 'background 0.15s' }}>
              {loading ? `⏳ ${progress || 'Generation...'}` : '⚡ Generer CV + Lettre'}
            </button>

            {cvData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                <button onClick={() => setShowEditor(true)}
                  style={{ padding: '11px', background: '#fff', color: '#4f46e5', border: '1.5px solid #4f46e5', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  ✏️ Modifier mon CV
                </button>
                <a href="/dashboard" style={{ display: 'block', textAlign: 'center', padding: '11px', background: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac', borderRadius: '10px', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
                  ✅ Aller au dashboard
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ─── PANNEAU DROIT ──────────────────────────────── */}
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', background: '#f0f0f5' }}>

          {cvData ? (
            <>
              {/* Onglets + actions */}
              <div style={{ padding: '16px 24px', background: '#fff', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[['cv', '📄 CV'], ...(lettre ? [['lettre', '✉️ Lettre']] : [])].map(([tab, label]) => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                      style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: activeTab === tab ? '#4f46e5' : '#f3f4f6', color: activeTab === tab ? '#fff' : '#374151' }}>
                      {label}
                    </button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {activeTab === 'cv' && (
                    <button onClick={handleDownloadCV}
                      style={{ padding: '7px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      📥 Telecharger CV
                    </button>
                  )}
                  {activeTab === 'lettre' && (
                    <button onClick={handleDownloadLettre}
                      style={{ padding: '7px 16px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      📥 Telecharger Lettre
                    </button>
                  )}
                </div>
              </div>

              {/* Contenu */}
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '32px 24px' }}>
                {activeTab === 'cv' ? (
                  <div style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.15)', borderRadius: '4px', overflow: 'hidden' }}>
                    <CVTemplate cvData={cvData} template={templateChoisi} />
                  </div>
                ) : (
                  <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '680px', overflow: 'hidden' }}>
                    <LettreRenderer lettre={lettre} />
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Etat vide */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              {loading ? (
                <div>
                  <div style={{ width: '48px', height: '48px', border: '4px solid #ede9fe', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>{progress}</div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>Optimisation ATS en cours...</div>
                  <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
                </div>
              ) : (
                <div>
                  <div style={{ fontSize: '64px', marginBottom: '20px' }}>✨</div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111', margin: '0 0 10px', letterSpacing: '-0.3px' }}>Ton CV apparaitra ici</h3>
                  <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0, lineHeight: '1.6', maxWidth: '300px' }}>
                    Colle une offre d'emploi et clique sur Generer pour voir le resultat en temps reel.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editeur */}
      {showEditor && cvData && (
        <CVEditorBlocks
          cvData={cvData}
          template={templateChoisi}
          onSave={(d) => { setCvData(d); setShowEditor(false) }}
          onClose={() => setShowEditor(false)}
        />
      )}
    </div>
  )
}