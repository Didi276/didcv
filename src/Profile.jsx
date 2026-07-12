import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Navbar from './Navbar'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const INPUT = {
  width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb',
  borderRadius: '9px', fontSize: '14px', fontFamily: '"Inter",system-ui,sans-serif',
  color: '#111', outline: 'none', boxSizing: 'border-box', background: '#fff',
  transition: 'border-color 0.15s',
}

function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
        {label}
        {hint && <span style={{ fontWeight: '400', color: '#9ca3af', marginLeft: '6px' }}>{hint}</span>}
      </label>
      {children}
    </div>
  )
}

export default function Profile() {
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('import')
  const [importing, setImporting] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const [savedCvs, setSavedCvs] = useState([])
  const [showSavedCvs, setShowSavedCvs] = useState(false)

  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [ville, setVille] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [titre, setTitre] = useState('')
  const [accroche, setAccroche] = useState('')
  const [photo, setPhoto] = useState(null)

  const [experiences, setExperiences] = useState([{ poste: '', entreprise: '', periode: '', lieu: '', missions: ['', '', ''] }])
  const [formations, setFormations] = useState([{ diplome: '', etablissement: '', periode: '', mention: '', description: '' }])
  const [competences, setCompetences] = useState(['', '', '', '', '', ''])
  const [langues, setLangues] = useState([{ langue: '', niveau: '' }])
  const [certifications, setCertifications] = useState([{ titre: '', organisme: '', annee: '' }])
  const [centresInteret, setCentresInteret] = useState(['', '', ''])

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle()
      if (data) {
        setPrenom(data.prenom || '')
        setNom(data.nom || '')
        setTelephone(data.telephone || '')
        setVille(data.ville || '')
        setLinkedin(data.linkedin || '')
        setTitre(data.titre || '')
        setAccroche(data.accroche || '')
        setPhoto(data.photo || null)
        if (data.experiences?.length) setExperiences(data.experiences)
        if (data.formations?.length) setFormations(data.formations)
        if (data.competences?.length) setCompetences(data.competences)
        if (data.langues?.length) setLangues(data.langues)
        if (data.certifications?.length) setCertifications(data.certifications)
        if (data.centres_interet?.length) setCentresInteret(data.centres_interet)
        if (data.prenom) setImportDone(true)
      }

      // Charger les CVs sauvegardés pour import rapide
      const { data: cvsData } = await supabase
        .from('cvs').select('id, cv_data, template, offre_titre, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)
      if (cvsData?.length) setSavedCvs(cvsData)
    }
    init()
  }, [])

  // ─── IMPORT PDF ─────────────────────────────────────────────
  const importFromSavedCV = (cv) => {
    const d = cv.cv_data
    // Infos de base — toujours sans erreur même si absent
    setPrenom(d.prenom || '')
    setNom(d.nom || '')
    setEmail(d.email || '')
    setTelephone(d.telephone || '')
    setVille(d.ville || '')
    setLinkedin(d.linkedin || '')
    setTitre(d.titre || '')
    setAccroche(d.accroche || '')
    // Sections optionnelles — ne plante pas si vides
    if (d.experiences?.length) setExperiences(d.experiences)
    if (d.formations?.length) setFormations(d.formations)
    if (d.competences?.filter(c => c).length) setCompetences(d.competences.filter(c => c))
    if (d.langues?.filter(l => l.langue).length) setLangues(d.langues.filter(l => l.langue))
    if (d.certifications?.filter(c => c.titre).length) setCertifications(d.certifications.filter(c => c.titre))
    // centres_interet est optionnel — pas d'erreur si absent
    if (d.centres_interet?.filter(c => c).length) setCentresInteret(d.centres_interet.filter(c => c))
    setImportDone(true)
    setShowSavedCvs(false)
    setActiveSection('verification')
  }

  const handleImportCV = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)

    try {
      // 1. Extraire le texte du PDF
      const texte = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = async (ev) => {
          try {
            const pdf = await pdfjsLib.getDocument(new Uint8Array(ev.target.result)).promise
            let text = ''
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i)
              const content = await page.getTextContent()
              text += content.items.map(item => item.str).join(' ') + '\n'
            }
            if (!text.trim()) reject(new Error('PDF vide ou non lisible'))
            else resolve(text)
          } catch (err) {
            reject(err)
          }
        }
        reader.onerror = () => reject(new Error('Erreur lecture fichier'))
        reader.readAsArrayBuffer(file)
      })

      // 2. Envoyer à l'IA
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,
          system: 'Tu es un expert en extraction de donnees de CV. Tu retournes UNIQUEMENT un JSON valide, sans texte avant ou apres, sans balises markdown.',
          messages: [{
            role: 'user',
            content: `Extrais toutes les informations de ce CV. Si une information est absente, mets une chaine vide "".

CV:
${texte.substring(0, 8000)}

Retourne UNIQUEMENT ce JSON valide:
{
  "prenom": "",
  "nom": "",
  "email": "",
  "telephone": "",
  "ville": "",
  "linkedin": "",
  "titre": "",
  "accroche": "",
  "experiences": [{"poste":"","entreprise":"","periode":"","lieu":"","missions":["","",""]}],
  "formations": [{"diplome":"","etablissement":"","periode":"","mention":"","description":""}],
  "competences": ["","",""],
  "langues": [{"langue":"","niveau":""}],
  "certifications": [{"titre":"","organisme":"","annee":""}],
  "centres_interet": ["",""]
}`
          }]
        })
      })

      if (!res.ok) throw new Error(`Erreur API: ${res.status}`)

      const data = await res.json()

      if (!data.content || !data.content[0]) throw new Error('Reponse IA invalide')

      const texteJSON = data.content[0].text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      let json
      try {
        json = JSON.parse(texteJSON)
      } catch {
        // Essayer d'extraire le JSON si du texte parasite est présent
        const match = texteJSON.match(/\{[\s\S]*\}/)
        if (match) json = JSON.parse(match[0])
        else throw new Error('JSON invalide dans la reponse IA')
      }

      // 3. Remplir les champs - toujours sans erreur même si section absente
      setPrenom(json.prenom || '')
      setNom(json.nom || '')
      setEmail(json.email || email)
      setTelephone(json.telephone || '')
      setVille(json.ville || '')
      setLinkedin(json.linkedin || '')
      setTitre(json.titre || '')
      setAccroche(json.accroche || '')
      if (json.experiences?.filter(e => e.poste || e.entreprise).length) {
        setExperiences(json.experiences.map(exp => ({
          ...exp,
          missions: exp.missions?.filter(m => m) || ['']
        })))
      }
      if (json.formations?.filter(f => f.diplome || f.etablissement).length) setFormations(json.formations)
      if (json.competences?.filter(c => c).length) setCompetences(json.competences.filter(c => c))
      if (json.langues?.filter(l => l.langue).length) setLangues(json.langues.filter(l => l.langue))
      // Sections optionnelles — ne plante pas si absentes du CV
      if (json.certifications?.filter(c => c.titre).length) setCertifications(json.certifications.filter(c => c.titre))
      if (json.centres_interet?.filter(c => c).length) setCentresInteret(json.centres_interet.filter(c => c))

      setImportDone(true)
      setActiveSection('verification') // Rediriger vers écran de vérification

    } catch (err) {
      console.error('Erreur import CV:', err)
      alert(`Erreur lors de l'import : ${err.message}\n\nAssure-toi que le PDF contient du texte (pas un scan image).`)
    }

    setImporting(false)
  }

  const handlePhoto = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPhoto(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!user) return
    setSaving(true)

    const profileData = {
      user_id: user.id, prenom, nom, email, telephone, ville, linkedin,
      titre, accroche, photo,
      experiences: experiences.filter(e => e.poste || e.entreprise),
      formations: formations.filter(f => f.diplome || f.etablissement),
      competences: competences.filter(c => c.trim()),
      langues: langues.filter(l => l.langue),
      certifications: certifications.filter(c => c.titre),
      centres_interet: centresInteret.filter(c => c.trim()),
    }

    // Vérifier si un profil existe déjà
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    let error
    if (existing) {
      const { error: e } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('user_id', user.id)
      error = e
    } else {
      const { error: e } = await supabase
        .from('profiles')
        .insert(profileData)
      error = e
    }

    if (error) {
      alert('Erreur de sauvegarde : ' + error.message)
      setSaving(false)
      return
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const addExp = () => setExperiences([...experiences, { poste: '', entreprise: '', periode: '', lieu: '', missions: ['', '', ''] }])
  const removeExp = (i) => setExperiences(experiences.filter((_, j) => j !== i))
  const updateExp = (i, field, val) => setExperiences(experiences.map((e, j) => j === i ? { ...e, [field]: val } : e))
  const updateMission = (i, j, val) => setExperiences(experiences.map((e, k) => k === i ? { ...e, missions: e.missions.map((m, l) => l === j ? val : m) } : e))
  const addMission = (i) => setExperiences(experiences.map((e, j) => j === i ? { ...e, missions: [...e.missions, ''] } : e))
  const addForm = () => setFormations([...formations, { diplome: '', etablissement: '', periode: '', mention: '', description: '' }])
  const removeForm = (i) => setFormations(formations.filter((_, j) => j !== i))
  const updateForm = (i, field, val) => setFormations(formations.map((f, j) => j === i ? { ...f, [field]: val } : f))

  const focusStyle = (e) => { e.target.style.borderColor = '#4f46e5' }
  const blurStyle = (e) => { e.target.style.borderColor = '#e5e7eb' }

  const SECTIONS = [
    { id: 'import',       label: '📥 Import PDF' },
    { id: 'verification', label: '✅ Vérification' },
    { id: 'infos',        label: '👤 Infos' },
    { id: 'experiences',  label: '💼 Experiences' },
    { id: 'formations',   label: '🎓 Formations' },
    { id: 'competences',  label: '⚡ Competences' },
    { id: 'plus',         label: '➕ Langues & Plus' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="profile" />

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '36px 24px 100px' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0f0f1a', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Mon profil</h1>
            <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>
              Importe ton CV PDF pour remplir automatiquement, puis ajuste
            </p>
          </div>
          <button onClick={handleSave} disabled={saving}
            style={{ padding: '11px 24px', background: saved ? '#16a34a' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'background 0.3s' }}>
            {saving ? '⏳ Sauvegarde...' : saved ? '✅ Sauvegarde !' : '💾 Sauvegarder'}
          </button>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: '#fff', padding: '5px', borderRadius: '12px', border: '1px solid #e5e7eb', overflowX: 'auto' }}>
          {SECTIONS.map(s => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              style={{ flex: '0 0 auto', padding: '8px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '12px', fontWeight: '600', transition: 'all 0.15s', background: activeSection === s.id ? '#4f46e5' : 'transparent', color: activeSection === s.id ? '#fff' : '#6b7280', position: 'relative' }}>
              {s.label}
              {s.id === 'import' && !importDone && <span style={{ position: 'absolute', top: '4px', right: '4px', width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }} />}
            </button>
          ))}
        </div>

        {/* ─── IMPORT PDF ─── */}
        {activeSection === 'import' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '32px' }}>
            {importing ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ width: '48px', height: '48px', border: '4px solid #ede9fe', borderTop: '4px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 20px' }} />
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Analyse en cours...</div>
                <div style={{ fontSize: '14px', color: '#9ca3af' }}>L'IA extrait tes informations</div>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            ) : importDone ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '14px' }}>✅</div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: '#111', marginBottom: '8px' }}>Profil importé avec succès !</div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>Vérifie et ajuste tes informations dans les onglets.</div>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button onClick={() => setActiveSection('infos')}
                    style={{ padding: '11px 22px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                    Vérifier mes infos
                  </button>
                  <label style={{ padding: '11px 22px', background: '#f3f4f6', color: '#374151', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
                    <input type="file" accept=".pdf" onChange={handleImportCV} style={{ display: 'none' }} />
                    Importer un autre PDF
                  </label>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 6px', textAlign: 'center' }}>Remplis ton profil automatiquement</h3>
                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 28px', textAlign: 'center', lineHeight: '1.6' }}>
                  Choisis une source pour importer tes informations
                </p>

                {/* Option 1 : CV sauvegardé sur DidCV */}
                {savedCvs.length > 0 && (
                  <div style={{ marginBottom: '20px', padding: '20px', background: '#f8f9ff', borderRadius: '12px', border: '1px solid #ede9fe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#4f46e5', marginBottom: '2px' }}>⚡ Depuis un CV DidCV</div>
                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>Recommandé — import instantané sans IA</div>
                      </div>
                    </div>
                    {!showSavedCvs ? (
                      <button onClick={() => setShowSavedCvs(true)}
                        style={{ width: '100%', padding: '11px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                        Choisir parmi mes CV générés ({savedCvs.length})
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {savedCvs.map(cv => (
                          <button key={cv.id} onClick={() => importFromSavedCV(cv)}
                            style={{ padding: '10px 14px', background: '#fff', border: '1.5px solid #ede9fe', borderRadius: '9px', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: '600', color: '#111' }}>{cv.cv_data.prenom} {cv.cv_data.nom}</div>
                              <div style={{ fontSize: '11px', color: '#9ca3af' }}>{cv.cv_data.titre} · {cv.template}</div>
                            </div>
                            <span style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600' }}>Importer →</span>
                          </button>
                        ))}
                        <button onClick={() => setShowSavedCvs(false)}
                          style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline', textAlign: 'center', padding: '4px' }}>
                          Annuler
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Option 2 : PDF externe */}
                <div style={{ padding: '20px', background: '#fafafa', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '4px' }}>📄 Depuis un CV PDF externe</div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '14px', lineHeight: '1.5' }}>
                    Fonctionne avec les CVs Word exportés en PDF, les PDFs textuels.<br />
                    <span style={{ color: '#f59e0b', fontWeight: '600' }}>⚠️ Ne fonctionne pas</span> avec les CVs générés par DidCV (image).
                  </div>
                  <label style={{ display: 'block', padding: '11px', background: '#fff', border: '1.5px dashed #d1d5db', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', textAlign: 'center', color: '#374151' }}>
                    <input type="file" accept=".pdf" onChange={handleImportCV} style={{ display: 'none' }} />
                    📥 Choisir un fichier PDF
                  </label>
                </div>

                <button onClick={() => setActiveSection('infos')}
                  style={{ display: 'block', margin: '16px auto 0', background: 'none', border: 'none', color: '#9ca3af', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit' }}>
                  Remplir manuellement
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── VÉRIFICATION ─── */}
        {activeSection === 'verification' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '48px', marginBottom: '14px' }}>🎉</div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: '0 0 10px' }}>
                Profil importé avec succès !
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>
                L'IA a extrait tes informations. Vérifie que tout est correct avant de sauvegarder.
              </p>
            </div>

            {/* Récap des infos importées */}
            <div style={{ background: '#f8f9ff', borderRadius: '12px', border: '1px solid #ede9fe', padding: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#4f46e5', marginBottom: '14px' }}>
                📋 Informations importées
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                {[
                  ['Prénom', prenom], ['Nom', nom], ['Email', email],
                  ['Téléphone', telephone], ['Ville', ville], ['Titre', titre],
                ].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', gap: '6px' }}>
                    <span style={{ color: '#9ca3af', minWidth: '70px' }}>{label} :</span>
                    <span style={{ color: val ? '#111' : '#f59e0b', fontWeight: val ? '500' : '400' }}>
                      {val || '⚠️ Non trouvé'}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '12px', display: 'flex', gap: '16px', fontSize: '13px' }}>
                <span style={{ color: '#16a34a' }}>✓ {experiences.filter(e => e.poste).length} expérience(s)</span>
                <span style={{ color: '#16a34a' }}>✓ {formations.filter(f => f.diplome).length} formation(s)</span>
                <span style={{ color: '#16a34a' }}>✓ {competences.filter(c => c).length} compétence(s)</span>
                <span style={{ color: '#16a34a' }}>✓ {langues.filter(l => l.langue).length} langue(s)</span>
              </div>
            </div>

            {/* Avertissement */}
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px 16px', marginBottom: '24px', display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '18px', flexShrink: 0 }}>⚠️</span>
              <div style={{ fontSize: '13px', color: '#92400e', lineHeight: '1.6' }}>
                <strong>Vérifie bien tes informations avant de sauvegarder.</strong><br />
                L'IA peut faire des erreurs — contrôle les dates, les intitulés de poste et les missions. Corrige ce qui ne va pas dans les onglets.
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => setActiveSection('infos')}
                style={{ flex: 1, padding: '12px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                👤 Vérifier mes infos
              </button>
              <button onClick={() => setActiveSection('experiences')}
                style={{ flex: 1, padding: '12px 20px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                💼 Vérifier mes expériences
              </button>
            </div>
            <button onClick={handleSave}
              style={{ width: '100%', marginTop: '10px', padding: '12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
              {saving ? '⏳ Sauvegarde...' : saved ? '✅ Sauvegardé !' : '💾 Tout semble bon — Sauvegarder'}
            </button>
          </div>
        )}

        {/* ─── INFOS ─── */}
        {activeSection === 'infos' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 24px' }}>Informations personnelles</h2>

            {/* Photo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f0f0f0' }}>
              {photo
                ? <img src={photo} alt="Photo" style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ede9fe' }} />
                : <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>👤</div>
              }
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111', marginBottom: '8px' }}>Photo de profil</div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <label style={{ padding: '7px 14px', background: '#ede9fe', color: '#4f46e5', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>
                    <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
                    {photo ? 'Changer' : 'Ajouter une photo'}
                  </label>
                  {photo && <button onClick={() => setPhoto(null)} style={{ padding: '7px 14px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <Field label="Prenom"><input value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Marie" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="Nom"><input value={nom} onChange={e => setNom(e.target.value)} placeholder="Dupont" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="Email"><input value={email} onChange={e => setEmail(e.target.value)} style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="Telephone"><input value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="+33 6 12 34 56 78" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="Ville"><input value={ville} onChange={e => setVille(e.target.value)} placeholder="Paris" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              <Field label="LinkedIn" hint="optionnel"><input value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="linkedin.com/in/..." style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
            </div>
            <Field label="Titre professionnel"><input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Responsable Marketing Digital" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
            <Field label="Accroche" hint="3-4 phrases"><textarea value={accroche} onChange={e => setAccroche(e.target.value)} rows={4} style={{ ...INPUT, resize: 'vertical', lineHeight: '1.6' }} onFocus={focusStyle} onBlur={blurStyle} /></Field>
          </div>
        )}

        {/* ─── EXPERIENCES ─── */}
        {activeSection === 'experiences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {experiences.map((exp, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>
                    Experience {i + 1} {exp.poste && <span style={{ color: '#4f46e5' }}>- {exp.poste}</span>}
                  </h3>
                  {experiences.length > 1 && <button onClick={() => removeExp(i)} style={{ padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <Field label="Poste"><input value={exp.poste} onChange={e => updateExp(i, 'poste', e.target.value)} placeholder="Responsable Marketing" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Entreprise"><input value={exp.entreprise} onChange={e => updateExp(i, 'entreprise', e.target.value)} placeholder="TechStartup" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Periode"><input value={exp.periode} onChange={e => updateExp(i, 'periode', e.target.value)} placeholder="2022 - 2024" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Lieu"><input value={exp.lieu} onChange={e => updateExp(i, 'lieu', e.target.value)} placeholder="Paris" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                </div>
                <Field label="Missions">
                  {exp.missions?.map((m, j) => (
                    <input key={j} value={m} onChange={e => updateMission(i, j, e.target.value)} placeholder={`Mission ${j+1}`} style={{ ...INPUT, marginBottom: '8px' }} onFocus={focusStyle} onBlur={blurStyle} />
                  ))}
                  <button onClick={() => addMission(i)} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>+ Ajouter une mission</button>
                </Field>
              </div>
            ))}
            <button onClick={addExp} style={{ padding: '14px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '14px', color: '#6b7280', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}>
              + Ajouter une experience
            </button>
          </div>
        )}

        {/* ─── FORMATIONS ─── */}
        {activeSection === 'formations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {formations.map((f, i) => (
              <div key={i} style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 }}>Formation {i + 1} {f.diplome && <span style={{ color: '#4f46e5' }}>- {f.diplome}</span>}</h3>
                  {formations.length > 1 && <button onClick={() => removeForm(i)} style={{ padding: '5px 12px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Supprimer</button>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <Field label="Diplome"><input value={f.diplome} onChange={e => updateForm(i, 'diplome', e.target.value)} placeholder="Master Marketing Digital" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Etablissement"><input value={f.etablissement} onChange={e => updateForm(i, 'etablissement', e.target.value)} placeholder="ESCP Business School" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Periode"><input value={f.periode} onChange={e => updateForm(i, 'periode', e.target.value)} placeholder="2018 - 2020" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label="Mention" hint="optionnel"><input value={f.mention} onChange={e => updateForm(i, 'mention', e.target.value)} placeholder="Tres Bien" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                </div>
                <Field label="Description"><input value={f.description} onChange={e => updateForm(i, 'description', e.target.value)} placeholder="Specialisation en..." style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
              </div>
            ))}
            <button onClick={addForm} style={{ padding: '14px', background: '#fff', border: '2px dashed #e5e7eb', borderRadius: '14px', color: '#6b7280', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280' }}>
              + Ajouter une formation
            </button>
          </div>
        )}

        {/* ─── COMPETENCES ─── */}
        {activeSection === 'competences' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '28px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Competences</h2>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 24px' }}>Outils, logiciels, methodes - ex: Excel, Salesforce, Gestion de projet</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              {competences.map((c, i) => (
                <input key={i} value={c} onChange={e => setCompetences(competences.map((v, j) => j === i ? e.target.value : v))}
                  placeholder={`Competence ${i+1}`} style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
              ))}
            </div>
            <button onClick={() => setCompetences([...competences, ''])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              + Ajouter
            </button>
          </div>
        )}

        {/* ─── PLUS ─── */}
        {activeSection === 'plus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Langues */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Langues</h2>
              {langues.map((l, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <Field label={i === 0 ? 'Langue' : ''}><input value={l.langue} onChange={e => setLangues(langues.map((v, j) => j === i ? { ...v, langue: e.target.value } : v))} placeholder="Francais" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label={i === 0 ? 'Niveau' : ''}>
                    <select value={l.niveau} onChange={e => setLangues(langues.map((v, j) => j === i ? { ...v, niveau: e.target.value } : v))} style={{ ...INPUT, cursor: 'pointer' }} onFocus={focusStyle} onBlur={blurStyle}>
                      <option value="">Choisir</option>
                      {['Langue maternelle', 'Bilingue (C2)', 'Courant (C1)', 'Avance (B2)', 'Intermediaire (B1)', 'Notions (A2/A1)'].map(n => <option key={n}>{n}</option>)}
                    </select>
                  </Field>
                  {langues.length > 1 && <button onClick={() => setLangues(langues.filter((_, j) => j !== i))} style={{ padding: '10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '18px' }}>🗑</button>}
                </div>
              ))}
              <button onClick={() => setLangues([...langues, { langue: '', niveau: '' }])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter une langue</button>
            </div>

            {/* Certifications */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Certifications</h2>
              {certifications.map((c, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 80px auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <Field label={i === 0 ? 'Titre' : ''}><input value={c.titre} onChange={e => setCertifications(certifications.map((v, j) => j === i ? { ...v, titre: e.target.value } : v))} placeholder="Google Analytics" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label={i === 0 ? 'Organisme' : ''}><input value={c.organisme} onChange={e => setCertifications(certifications.map((v, j) => j === i ? { ...v, organisme: e.target.value } : v))} placeholder="Google" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  <Field label={i === 0 ? 'Annee' : ''}><input value={c.annee} onChange={e => setCertifications(certifications.map((v, j) => j === i ? { ...v, annee: e.target.value } : v))} placeholder="2024" style={INPUT} onFocus={focusStyle} onBlur={blurStyle} /></Field>
                  {certifications.length > 1 && <button onClick={() => setCertifications(certifications.filter((_, j) => j !== i))} style={{ padding: '10px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', marginBottom: '18px' }}>🗑</button>}
                </div>
              ))}
              <button onClick={() => setCertifications([...certifications, { titre: '', organisme: '', annee: '' }])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter</button>
            </div>

            {/* Centres d'interet */}
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 6px' }}>Centres d'interet</h2>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 16px' }}>Optionnel</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                {centresInteret.map((ci, i) => (
                  <input key={i} value={ci} onChange={e => setCentresInteret(centresInteret.map((v, j) => j === i ? e.target.value : v))}
                    placeholder={['Voyage', 'Photographie', 'Sport'][i] || `Interet ${i+1}`} style={INPUT} onFocus={focusStyle} onBlur={blurStyle} />
                ))}
              </div>
              <button onClick={() => setCentresInteret([...centresInteret, ''])} style={{ background: 'none', border: '1px dashed #d1d5db', color: '#6b7280', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>+ Ajouter</button>
            </div>
          </div>
        )}
      </div>

      {/* Bouton save fixe */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
        <button onClick={handleSave} disabled={saving}
          style={{ padding: '13px 28px', background: saved ? '#16a34a' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 20px rgba(79,70,229,0.4)', transition: 'background 0.3s' }}>
          {saving ? '⏳...' : saved ? '✅ Sauvegarde !' : '💾 Sauvegarder'}
        </button>
      </div>
    </div>
  )
}