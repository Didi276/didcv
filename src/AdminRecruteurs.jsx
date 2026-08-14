import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { supabase } from './supabase'

// SQL à exécuter dans Supabase :
// ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';
// UPDATE profiles SET role = 'admin' WHERE user_id = '...';

const STATUTS = [
  { id: 'en_attente', label: 'En attente', color: '#92400e', bg: '#fffbeb' },
  { id: 'valide', label: 'Validé', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'refuse', label: 'Refusé', color: '#dc2626', bg: '#fef2f2' },
]

function statutInfo(id) {
  return STATUTS.find(s => s.id === id) || STATUTS[0]
}

const fmt = n => n?.toLocaleString('fr-FR') || '...'

export default function AdminRecruteurs() {
  const [acces, setAcces] = useState('en_cours') // en_cours | ok | refuse
  const [adminEmail, setAdminEmail] = useState('')
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('')
  const [refusEnCours, setRefusEnCours] = useState(null) // id de la demande en cours de refus
  const [raisonRefus, setRaisonRefus] = useState('')
  const [stats, setStats] = useState({})
  const [derniersUtilisateurs, setDerniersUtilisateurs] = useState([])

  useEffect(() => {
    const verifier = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setAcces('refuse'); return }
      const { data: profil } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single()
      if (profil?.role !== 'admin') { setAcces('refuse'); return }
      setAdminEmail(user.email)
      setAcces('ok')
    }
    verifier()
  }, [])

  useEffect(() => {
    if (acces !== 'ok') return
    const charger = async () => {
      setLoading(true)
      const { data } = await supabase.from('recruteurs').select('*').order('created_at', { ascending: false })
      setDemandes(data || [])
      setLoading(false)
    }
    charger()
  }, [acces])

  useEffect(() => {
    if (acces !== 'ok') return
    const loadStats = async () => {
      const [
        users, cvs, offresDirectes, candidatures,
        recruteurs, offresRecruteurs,
        offresActives, entreprisesRes,
        candidatsVisibles, entretiensPlanifies,
        rappelsEnvoyesRes, recruteursEnAttenteRes,
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('cvs').select('*', { count: 'exact', head: true }),
        supabase.from('offres_directes').select('*', { count: 'exact', head: true }),
        supabase.from('candidatures').select('*', { count: 'exact', head: true }),
        supabase.from('recruteurs').select('*', { count: 'exact', head: true }),
        supabase.from('offres_directes').select('*', { count: 'exact', head: true }).eq('ats_source', 'recruteur_didjob'),
        supabase.from('offres_directes').select('*', { count: 'exact', head: true }).eq('actif', true),
        supabase.from('offres_directes').select('entreprise').then(r => ({
          count: new Set((r.data || []).map(o => o.entreprise)).size,
        })),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('visible_recruteurs', true),
        supabase.from('candidatures').select('*', { count: 'exact', head: true }).eq('statut', 'entretien'),
        supabase.from('candidatures').select('*', { count: 'exact', head: true }).eq('rappel_j1_envoye', true),
        supabase.from('recruteurs').select('*', { count: 'exact', head: true }).eq('statut', 'en_attente'),
      ])

      setStats({
        users: users.count || 0,
        cvs: cvs.count || 0,
        offresDirectes: offresDirectes.count || 0,
        candidatures: candidatures.count || 0,
        recruteurs: recruteurs.count || 0,
        offresRecruteurs: offresRecruteurs.count || 0,
        offresActives: offresActives.count || 0,
        entreprises: entreprisesRes.count || 0,
        candidatsVisibles: candidatsVisibles.count || 0,
        entretiensPlanifies: entretiensPlanifies.count || 0,
        rappelsEnvoyes: rappelsEnvoyesRes.count || 0,
        recruteursEnAttente: recruteursEnAttenteRes.count || 0,
      })
    }
    loadStats()

    const loadStatsSources = async () => {
      const ftStats = await fetch('/api/stats').then(r => r.json()).catch(() => null)
      setStats(prev => ({
        ...prev,
        totalOffres: ftStats?.total || 0,
        offresFT: ftStats?.franceTravail || 0,
        offresAdzuna: ftStats?.adzuna || 0,
        offresDirectesSources: ftStats?.directes || 0,
        entreprisesDirectes: ftStats?.entreprises || 0,
      }))
    }
    loadStatsSources()

    const loadDerniereActivite = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('prenom, nom, created_at, role')
        .order('created_at', { ascending: false })
        .limit(5)
      setDerniersUtilisateurs(data || [])
    }
    loadDerniereActivite()
  }, [acces])

  const statsDemandes = {
    en_attente: demandes.filter(d => d.statut === 'en_attente').length,
    valide: demandes.filter(d => d.statut === 'valide').length,
    refuse: demandes.filter(d => d.statut === 'refuse').length,
  }

  const demandesFiltrees = filtreStatut ? demandes.filter(d => d.statut === filtreStatut) : demandes

  const valider = async (demande) => {
    const { error } = await supabase.from('recruteurs')
      .update({ statut: 'valide', valide_par: adminEmail, valide_le: new Date().toISOString() })
      .eq('id', demande.id)
    if (error) { alert('Erreur lors de la validation.'); return }
    setDemandes(demandes.map(d => d.id === demande.id ? { ...d, statut: 'valide', valide_par: adminEmail } : d))

    if (demande.user_id) {
      await supabase.from('profiles').upsert({ user_id: demande.user_id, role: 'recruteur' }, { onConflict: 'user_id' })
    }

    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'recruteur_valide', to: demande.email, prenom: demande.prenom }),
    }).catch(err => console.error('Erreur envoi email de validation recruteur:', err))
  }

  const ouvrirRefus = (id) => { setRefusEnCours(id); setRaisonRefus('') }

  const confirmerRefus = async (demande) => {
    const { error } = await supabase.from('recruteurs')
      .update({ statut: 'refuse', valide_par: adminEmail, valide_le: new Date().toISOString() })
      .eq('id', demande.id)
    if (error) { alert('Erreur lors du refus.'); return }
    setDemandes(demandes.map(d => d.id === demande.id ? { ...d, statut: 'refuse', valide_par: adminEmail } : d))

    if (demande.user_id) {
      await supabase.from('profiles').upsert({ user_id: demande.user_id, role: 'recruteur_refused' }, { onConflict: 'user_id' })
    }

    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'recruteur_refuse', to: demande.email, prenom: demande.prenom, raison: raisonRefus.trim() }),
    }).catch(err => console.error('Erreur envoi email de refus recruteur:', err))

    setRefusEnCours(null)
    setRaisonRefus('')
  }

  if (acces === 'en_cours') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ width: '32px', height: '32px', border: '3px solid #ede9fe', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (acces === 'refuse') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: '"Inter",system-ui,sans-serif', textAlign: 'center', padding: '24px' }}>
        <Lock size={40} color="#c4c4c4" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: '0 0 8px' }}>Accès refusé</h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 20px' }}>Cette page est réservée aux administrateurs DidJob.</p>
        <Link to="/" style={{ padding: '10px 20px', background: '#4f46e5', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>Accueil</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', fontFamily: '"Satoshi","Inter",system-ui,sans-serif' }}>
      <div style={{
        background: '#0a0a0f',
        padding: '24px 40px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>
        <Link to="/dashboard" style={{
          color: 'rgba(255,255,255,0.6)',
          textDecoration: 'none',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}>
          ← Retour au dashboard
        </Link>
        <h1 style={{
          color: '#ffffff',
          fontSize: '22px',
          fontWeight: '700',
          fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif',
          margin: 0,
        }}>
          Administration DidJob
        </h1>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        padding: '32px 40px',
        background: '#f9fafb',
        borderBottom: '1px solid #f0f0f0',
      }}>
        {[
          // Rangée 1 — Utilisateurs
          { key: 'users', label: 'Utilisateurs inscrits', value: stats.users, icon: '👥' },
          { key: 'cvs', label: 'CVs créés', value: stats.cvs, icon: '📄' },
          { key: 'candidatsVisibles', label: 'Candidats visibles recruteurs', value: stats.candidatsVisibles, icon: '👁' },
          { key: 'recruteurs', label: 'Recruteurs inscrits', value: stats.recruteurs, icon: '🏢' },
          // Rangée 2 — Offres
          { key: 'offresDirectes', label: 'Offres directes en base', value: stats.offresDirectes, icon: '💼' },
          { key: 'offresActives', label: 'Offres actives', value: stats.offresActives, icon: '✅' },
          { key: 'entreprises', label: 'Entreprises scrapées', value: stats.entreprises, icon: '🏭' },
          { key: 'offresRecruteurs', label: 'Offres publiées par recruteurs', value: stats.offresRecruteurs, icon: '📝' },
          // Rangée 3 — Activité
          { key: 'candidatures', label: 'Candidatures totales', value: stats.candidatures, icon: '📬' },
          { key: 'entretiensPlanifies', label: 'Entretiens planifiés', value: stats.entretiensPlanifies, icon: '🎯' },
          { key: 'rappelsEnvoyes', label: 'Rappels envoyés', value: stats.rappelsEnvoyes, icon: '📧' },
          { key: 'recruteursEnAttente', label: 'Recruteurs en attente', value: stats.recruteursEnAttente, icon: '⏳' },
          // Rangée 4 — Sources d'offres
          { key: 'totalOffres', label: 'Total toutes sources', value: stats.totalOffres, icon: '🌐' },
          { key: 'offresDirectesSources', label: 'Offres directes entreprises', value: stats.offresDirectesSources, icon: '🏢' },
          { key: 'offresFT', label: 'France Travail', value: stats.offresFT, icon: '🇫🇷' },
          { key: 'offresAdzuna', label: 'Adzuna', value: stats.offresAdzuna, icon: '💰' },
        ].map(s => {
          const alerte = s.key === 'recruteursEnAttente' && stats.recruteursEnAttente > 0
          return (
            <div key={s.key} style={{
              background: alerte ? '#fef3c7' : '#ffffff',
              borderRadius: '10px',
              padding: '20px',
              border: alerte ? '1px solid #f59e0b' : '1px solid #f0f0f0',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontSize: '32px', fontWeight: '700', color: '#0f0f1a', fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif' }}>
                {fmt(s.value)}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                {s.label}
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ padding: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f0f1a', fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif', margin: '0 0 16px' }}>
          Dernière activité
        </h2>
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', padding: '8px 20px', marginBottom: '40px' }}>
          {derniersUtilisateurs.length === 0 ? (
            <div style={{ padding: '16px 0', fontSize: '13px', color: '#9ca3af' }}>Aucun utilisateur pour l'instant.</div>
          ) : (
            derniersUtilisateurs.map((u, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 0',
                borderTop: i > 0 ? '1px solid #f0f0f0' : 'none',
                fontSize: '13px',
              }}>
                <span style={{ color: '#0f0f1a', fontWeight: '600' }}>
                  {u.prenom || 'Sans prénom'} {u.nom || ''}
                  <span style={{ color: '#9ca3af', fontWeight: '400' }}> — {u.role || 'user'}</span>
                </span>
                <span style={{ color: '#9ca3af' }}>
                  {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))
          )}
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f0f1a', fontFamily: '"Clash Display","Satoshi","Inter",system-ui,sans-serif', margin: '0 0 4px' }}>
          Demandes d'accès recruteurs
        </h2>
        <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 16px' }}>Validation manuelle des comptes recruteurs</p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {STATUTS.map(s => (
            <div key={s.id} style={{ padding: '8px 16px', background: s.bg, borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{statsDemandes[s.id]}</span>
              <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <button onClick={() => setFiltreStatut('')}
            style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: !filtreStatut ? '#4f46e5' : '#f3f4f6', color: !filtreStatut ? '#fff' : '#374151' }}>
            Toutes
          </button>
          {STATUTS.map(s => (
            <button key={s.id} onClick={() => setFiltreStatut(s.id === filtreStatut ? '' : s.id)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: filtreStatut === s.id ? '#4f46e5' : '#f3f4f6', color: filtreStatut === s.id ? '#fff' : '#374151' }}>
              {s.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af', fontSize: '13px' }}>Chargement...</div>
        ) : demandesFiltrees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px', background: '#fff', borderRadius: '14px', border: '1px solid #f0f0f0' }}>
            Aucune demande dans cette catégorie.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {demandesFiltrees.map(d => {
              const info = statutInfo(d.statut)
              return (
                <div key={d.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #f0f0f0', padding: '18px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '220px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#111' }}>{d.prenom} {d.nom}</div>
                        <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: info.bg, color: info.color }}>{info.label}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#374151', marginBottom: '2px' }}>{d.poste} chez <strong>{d.entreprise}</strong></div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{d.email}{d.telephone && ` · ${d.telephone}`}</div>
                      {d.justification && (
                        <div style={{ fontSize: '13px', color: '#374151', marginTop: '8px', padding: '10px 12px', background: '#f8f9ff', borderRadius: '8px', lineHeight: '1.6' }}>
                          {d.justification}
                        </div>
                      )}
                      <div style={{ fontSize: '11px', color: '#c4c4c4', marginTop: '8px' }}>
                        Demande envoyée le {new Date(d.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>

                    {d.statut === 'en_attente' && (
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => valider(d)}
                          style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                          Valider
                        </button>
                        <button onClick={() => ouvrirRefus(d.id)}
                          style={{ padding: '8px 16px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                          Refuser
                        </button>
                      </div>
                    )}
                  </div>

                  {refusEnCours === d.id && (
                    <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #f0f0f0' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Raison du refus (optionnel)</label>
                      <textarea value={raisonRefus} onChange={e => setRaisonRefus(e.target.value)} rows={2}
                        style={{ width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box', resize: 'vertical', marginBottom: '10px' }} />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => confirmerRefus(d)}
                          style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                          Confirmer le refus
                        </button>
                        <button onClick={() => setRefusEnCours(null)}
                          style={{ padding: '8px 16px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
