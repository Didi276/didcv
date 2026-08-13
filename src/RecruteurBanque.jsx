/*
  ─── SQL à exécuter dans Supabase (en plus de celui de RecruteurInscription.jsx) ─
  ALTER TABLE offres_directes ADD COLUMN IF NOT EXISTS recruteur_user_id UUID REFERENCES auth.users(id);
  ──────────────────────────────────────────────────────────────────────────────
*/

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapPin, Clock, Mail, Search, Briefcase, UserCircle } from 'lucide-react'
import { supabase } from './supabase'

const DISPO_OPTIONS = ['Immédiatement', 'Dans 1 mois', 'Dans 3 mois']
const CONTRAT_OPTIONS = ['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance']

const STATUT_LABELS = {
  en_attente: { label: 'En attente', color: '#92400e', bg: '#fffbeb' },
  valide: { label: 'Validé', color: '#16a34a', bg: '#f0fdf4' },
  refuse: { label: 'Refusé', color: '#dc2626', bg: '#fef2f2' },
}

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

const SELECT_STYLE = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '9px',
  fontSize: '13px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box',
  background: '#fff', cursor: 'pointer',
}

const INPUT = {
  width: '100%', padding: '10px 12px', border: '1.5px solid #e5e7eb', borderRadius: '9px',
  fontSize: '13px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box',
}

function masquerEmail(email) {
  if (!email || !email.includes('@')) return ''
  const [nom, domaine] = email.split('@')
  return `${nom[0]}${'*'.repeat(Math.max(3, nom.length - 1))}@${domaine}`
}

function CandidatCard({ p, lienCv }) {
  const [contactOuvert, setContactOuvert] = useState(false)
  const competencesVisibles = (p.competences || []).filter(c => c && c.trim()).slice(0, 5)
  const typesContrat = (p.recherche_contrat || '').split(',').map(s => s.trim()).filter(Boolean)

  return (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {p.photo ? (
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
            <img src={p.photo} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(5px)', transform: 'scale(1.15)' }} />
          </div>
        ) : (
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#1e3a5f', flexShrink: 0 }}>
            {p.prenom?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#111', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.prenom} {p.nom ? `${p.nom[0].toUpperCase()}.` : ''}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {p.titre || 'Poste non renseigné'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {p.ville && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '500', background: '#f1f5f9', color: '#374151', padding: '3px 9px', borderRadius: '6px' }}><MapPin size={10} /> {p.ville}</span>}
        {p.disponibilite && <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: '600', background: '#f0fdf4', color: '#16a34a', padding: '3px 9px', borderRadius: '6px' }}><Clock size={10} /> {p.disponibilite}</span>}
        {typesContrat.map(t => (
          <span key={t} style={{ fontSize: '11px', fontWeight: '600', background: '#eff6ff', color: '#1e3a5f', padding: '3px 9px', borderRadius: '6px' }}>{t}</span>
        ))}
      </div>

      {competencesVisibles.length > 0 && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {competencesVisibles.map((c, i) => (
            <span key={i} style={{ fontSize: '11px', padding: '3px 9px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '20px', color: '#374151' }}>{c}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: 'auto' }}>
        {lienCv ? (
          <a href={`/cv/${lienCv}`} target="_blank" rel="noopener noreferrer"
            style={{ textAlign: 'center', padding: '9px', background: '#1e3a5f', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '12px', fontWeight: '700' }}>
            Voir le CV
          </a>
        ) : (
          <div style={{ textAlign: 'center', padding: '9px', background: '#f1f5f9', color: '#9ca3af', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>
            CV non partagé
          </div>
        )}

        {contactOuvert ? (
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ flex: 1, fontSize: '11px', color: '#6b7280', background: '#f8fafc', padding: '9px 10px', borderRadius: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {masquerEmail(p.email)}
            </div>
            <a href={`mailto:${p.email}`} style={{ display: 'flex', alignItems: 'center', padding: '9px 12px', background: '#eff6ff', color: '#1e3a5f', borderRadius: '8px', textDecoration: 'none', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
              <Mail size={13} />
            </a>
          </div>
        ) : (
          <button onClick={() => setContactOuvert(true)}
            style={{ padding: '9px', background: '#fff', color: '#1e3a5f', border: '1.5px solid #dbe4f0', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
            Contacter
          </button>
        )}
      </div>
    </div>
  )
}

const OFFRE_VIDE = { titre: '', lieu: '', type_contrat: 'CDI', salaire: '', description: '', url_candidature: '' }

export default function RecruteurBanque() {
  const navigate = useNavigate()
  const w = useWidth()
  const isMobile = w < 768

  const [verification, setVerification] = useState('en_cours') // en_cours | ok
  const [recruteur, setRecruteur] = useState(null)
  const [tab, setTab] = useState('recherche') // recherche | publier | compte

  // Onglet Rechercher des candidats
  const [profils, setProfils] = useState([])
  const [liensCv, setLiensCv] = useState({})
  const [loading, setLoading] = useState(true)
  const [filtreMetier, setFiltreMetier] = useState('')
  const [filtreVille, setFiltreVille] = useState('')
  const [filtreDispo, setFiltreDispo] = useState('')
  const [filtreContrat, setFiltreContrat] = useState('')

  // Onglet Publier une offre
  const [offreForm, setOffreForm] = useState(OFFRE_VIDE)
  const [publishing, setPublishing] = useState(false)
  const [offrePubliee, setOffrePubliee] = useState(false)
  const [mesOffres, setMesOffres] = useState([])
  const [nbOffres, setNbOffres] = useState(0)

  useEffect(() => {
    const verifierAcces = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/recruteurs/connexion'); return }
      const { data } = await supabase.from('recruteurs').select('*').eq('user_id', user.id).maybeSingle()
      if (!data || data.statut !== 'valide') { navigate('/recruteurs/connexion'); return }
      setRecruteur(data)
      setVerification('ok')
    }
    verifierAcces()
  }, [navigate])

  useEffect(() => {
    if (verification !== 'ok') return
    const charger = async () => {
      setLoading(true)
      let requete = supabase.from('profiles').select('*').eq('visible_recruteurs', true)
      if (filtreMetier.trim()) requete = requete.ilike('titre', `%${filtreMetier.trim()}%`)
      if (filtreVille.trim()) requete = requete.ilike('ville', `%${filtreVille.trim()}%`)
      if (filtreDispo) requete = requete.eq('disponibilite', filtreDispo)
      if (filtreContrat) requete = requete.ilike('recherche_contrat', `%${filtreContrat}%`)

      const { data } = await requete.order('created_at', { ascending: false }).limit(60)
      setProfils(data || [])

      const ids = (data || []).map(p => p.user_id).filter(Boolean)
      if (ids.length) {
        const { data: partagesData } = await supabase
          .from('cv_partages').select('user_id, slug, created_at')
          .eq('actif', true).in('user_id', ids)
          .order('created_at', { ascending: false })
        const map = {}
        partagesData?.forEach(p => { if (!map[p.user_id]) map[p.user_id] = p.slug })
        setLiensCv(map)
      } else {
        setLiensCv({})
      }
      setLoading(false)
    }
    charger()
  }, [verification, filtreMetier, filtreVille, filtreDispo, filtreContrat])

  const chargerMesOffres = async () => {
    if (!recruteur) return
    const { data, count } = await supabase
      .from('offres_directes')
      .select('*', { count: 'exact' })
      .eq('recruteur_user_id', recruteur.user_id)
      .order('date_publication', { ascending: false })
    setMesOffres(data || [])
    setNbOffres(count || 0)
  }

  useEffect(() => {
    if (verification !== 'ok' || !recruteur) return
    chargerMesOffres()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verification, recruteur])

  const champOffre = (key) => (e) => setOffreForm({ ...offreForm, [key]: e.target.value })

  const publierOffre = async () => {
    if (!offreForm.titre.trim()) { alert('Le titre du poste est obligatoire.'); return }
    setPublishing(true)
    const { error } = await supabase.from('offres_directes').insert({
      titre: offreForm.titre.trim(),
      entreprise: recruteur.entreprise,
      lieu: offreForm.lieu.trim(),
      type_contrat: offreForm.type_contrat,
      salaire: offreForm.salaire.trim(),
      description: offreForm.description.trim(),
      url_candidature: offreForm.url_candidature.trim(),
      ats_source: 'recruteur_didjob',
      actif: true,
      date_publication: new Date().toISOString(),
      date_scraping: new Date().toISOString(),
      hash: btoa(`${offreForm.titre}-${recruteur.entreprise}-${Date.now()}`).slice(0, 32),
      recruteur_user_id: recruteur.user_id,
    })
    setPublishing(false)
    if (error) { alert("Erreur lors de la publication de l'offre."); return }
    setOffreForm(OFFRE_VIDE)
    setOffrePubliee(true)
    setTimeout(() => setOffrePubliee(false), 2500)
    chargerMesOffres()
  }

  const handleDeconnexion = async () => {
    await supabase.auth.signOut()
    navigate('/recruteurs/connexion')
  }

  if (verification !== 'ok') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f4f6fa' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #dbe4f0', borderTop: '3px solid #1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  const statutInfo = STATUT_LABELS[recruteur?.statut] || STATUT_LABELS.en_attente
  const TABS = [
    { id: 'recherche', label: 'Rechercher des candidats', Icon: Search },
    { id: 'publier', label: 'Mes offres publiées', Icon: Briefcase },
    { id: 'compte', label: 'Mon compte recruteur', Icon: UserCircle },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <div style={{ borderBottom: '1px solid #e2e8f0', background: '#fff', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/espace-recruteur" style={{ fontWeight: '800', fontSize: '18px', textDecoration: 'none', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
          <span style={{ color: '#1e3a5f' }}>Did</span>Job <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Recruteurs</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {recruteur && <span style={{ fontSize: '13px', color: '#6b7280' }}>{recruteur.prenom} · {recruteur.entreprise}</span>}
          <button onClick={handleDeconnexion} style={{ fontSize: '13px', color: '#374151', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Déconnexion
          </button>
        </div>
      </div>

      <div style={{ background: '#1e3a5f', padding: '44px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', margin: '0 0 10px', letterSpacing: '-1px' }}>
            Espace Recruteur DidJob
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Trouve des candidats certifiés et publie tes offres
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '24px 16px 80px' : '32px 24px 80px' }}>

        {/* Onglets */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', background: '#fff', padding: '5px', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ flex: isMobile ? '0 0 auto' : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', background: tab === t.id ? '#1e3a5f' : 'transparent', color: tab === t.id ? '#fff' : '#6b7280' }}>
              <t.Icon size={14} />{t.label}
            </button>
          ))}
        </div>

        {/* ─── Onglet 1 : Rechercher des candidats ─── */}
        {tab === 'recherche' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }}>
              <input value={filtreMetier} onChange={e => setFiltreMetier(e.target.value)} placeholder="Poste / Compétence"
                style={{ ...SELECT_STYLE, cursor: 'text', gridColumn: isMobile ? 'span 2' : 'auto' }} />
              <input value={filtreVille} onChange={e => setFiltreVille(e.target.value)} placeholder="Ville"
                style={{ ...SELECT_STYLE, cursor: 'text', gridColumn: isMobile ? 'span 2' : 'auto' }} />
              <select value={filtreDispo} onChange={e => setFiltreDispo(e.target.value)} style={SELECT_STYLE}>
                <option value="">Disponibilité</option>
                {DISPO_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={filtreContrat} onChange={e => setFiltreContrat(e.target.value)} style={SELECT_STYLE}>
                <option value="">Type de contrat</option>
                {CONTRAT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
              {profils.length} candidat{profils.length > 1 ? 's' : ''} disponible{profils.length > 1 ? 's' : ''}
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #dbe4f0', borderTop: '3px solid #1e3a5f', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              </div>
            ) : profils.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                Aucun candidat ne correspond à ces critères pour le moment.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: isMobile ? '12px' : '20px' }}>
                {profils.map(p => <CandidatCard key={p.id} p={p} lienCv={liensCv[p.user_id]} />)}
              </div>
            )}
          </>
        )}

        {/* ─── Onglet 2 : Publier une offre / mes offres ─── */}
        {tab === 'publier' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px', alignItems: 'start' }}>
            <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 18px' }}>Publier une offre</h2>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Titre du poste *</label>
                <input value={offreForm.titre} onChange={champOffre('titre')} style={INPUT} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Entreprise</label>
                <div style={{ ...INPUT, background: '#f8fafc', color: '#6b7280' }}>{recruteur?.entreprise}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Lieu</label>
                  <input value={offreForm.lieu} onChange={champOffre('lieu')} placeholder="Paris" style={INPUT} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Type de contrat</label>
                  <select value={offreForm.type_contrat} onChange={champOffre('type_contrat')} style={{ ...SELECT_STYLE, fontSize: '13px' }}>
                    {CONTRAT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Salaire</label>
                <input value={offreForm.salaire} onChange={champOffre('salaire')} placeholder="optionnel" style={INPUT} />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Description</label>
                <textarea value={offreForm.description} onChange={champOffre('description')} rows={5} style={{ ...INPUT, resize: 'vertical', lineHeight: '1.6' }} />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>URL de candidature</label>
                <input value={offreForm.url_candidature} onChange={champOffre('url_candidature')} placeholder="https://..." style={INPUT} />
              </div>

              <button onClick={publierOffre} disabled={publishing}
                style={{ width: '100%', padding: '12px', background: offrePubliee ? '#16a34a' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: publishing ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                {publishing ? 'Publication...' : offrePubliee ? 'Offre publiée !' : 'Publier'}
              </button>
            </div>

            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 18px' }}>Mes offres publiées ({nbOffres})</h2>
              {mesOffres.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: '13px', background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  Tu n'as encore publié aucune offre.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {mesOffres.map(o => (
                    <div key={o.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111' }}>{o.titre}</div>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: o.actif ? '#f0fdf4' : '#f3f4f6', color: o.actif ? '#16a34a' : '#9ca3af', flexShrink: 0 }}>
                          {o.actif ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{o.lieu} · {o.type_contrat}</div>
                      <div style={{ fontSize: '11px', color: '#c4c4c4', marginTop: '6px' }}>
                        Publiée le {new Date(o.date_publication).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Onglet 3 : Mon compte recruteur ─── */}
        {tab === 'compte' && (
          <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '28px', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Mon compte recruteur</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '3px' }}>Entreprise</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{recruteur?.entreprise}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '3px' }}>Email</div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#111' }}>{recruteur?.email}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '3px' }}>Statut du compte</div>
                <span style={{ display: 'inline-block', fontSize: '12px', fontWeight: '700', padding: '3px 10px', borderRadius: '10px', background: statutInfo.bg, color: statutInfo.color }}>
                  {statutInfo.label}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '3px' }}>Offres publiées</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#1e3a5f' }}>{nbOffres}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
