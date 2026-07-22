import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from './supabase'

const ADMIN_EMAILS = ['fernandochokki@gmail.com', 'chokkifernando@gmail.com', 'carlinazon@gmail.com']

const STATUTS = [
  { id: 'en_attente', label: 'En attente', color: '#92400e', bg: '#fffbeb' },
  { id: 'valide', label: 'Validé', color: '#16a34a', bg: '#f0fdf4' },
  { id: 'refuse', label: 'Refusé', color: '#dc2626', bg: '#fef2f2' },
]

function statutInfo(id) {
  return STATUTS.find(s => s.id === id) || STATUTS[0]
}

export default function AdminRecruteurs() {
  const [acces, setAcces] = useState('en_cours') // en_cours | ok | refuse
  const [adminEmail, setAdminEmail] = useState('')
  const [demandes, setDemandes] = useState([])
  const [loading, setLoading] = useState(true)
  const [filtreStatut, setFiltreStatut] = useState('')
  const [refusEnCours, setRefusEnCours] = useState(null) // id de la demande en cours de refus
  const [raisonRefus, setRaisonRefus] = useState('')

  useEffect(() => {
    const verifier = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !ADMIN_EMAILS.includes(user.email)) { setAcces('refuse'); return }
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

  const stats = {
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
    window.open(`mailto:${demande.email}?subject=${encodeURIComponent('Ton accès DidCV Recruteurs est validé')}&body=${encodeURIComponent(`Bonjour ${demande.prenom},\n\nBonne nouvelle : ton accès à la banque de talents DidCV a été validé.\n\nTu peux te connecter dès maintenant : ${window.location.origin}/recruteurs/connexion\n\nÀ bientôt,\nL'équipe DidCV`)}`)
  }

  const ouvrirRefus = (id) => { setRefusEnCours(id); setRaisonRefus('') }

  const confirmerRefus = async (demande) => {
    const { error } = await supabase.from('recruteurs')
      .update({ statut: 'refuse', valide_par: adminEmail, valide_le: new Date().toISOString() })
      .eq('id', demande.id)
    if (error) { alert('Erreur lors du refus.'); return }
    setDemandes(demandes.map(d => d.id === demande.id ? { ...d, statut: 'refuse', valide_par: adminEmail } : d))
    const raison = raisonRefus.trim() ? `\n\nMotif : ${raisonRefus.trim()}` : ''
    window.open(`mailto:${demande.email}?subject=${encodeURIComponent('À propos de ta demande d\'accès DidCV Recruteurs')}&body=${encodeURIComponent(`Bonjour ${demande.prenom},\n\nAprès étude, nous ne sommes pas en mesure de valider ta demande d'accès à la banque de talents DidCV pour le moment.${raison}\n\nL'équipe DidCV`)}`)
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
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: '0 0 8px' }}>Accès refusé</h1>
        <p style={{ fontSize: '14px', color: '#9ca3af', margin: '0 0 20px' }}>Cette page est réservée aux administrateurs DidCV.</p>
        <Link to="/" style={{ padding: '10px 20px', background: '#4f46e5', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>Accueil</Link>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Demandes d'accès recruteurs</h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: '0 0 16px' }}>Validation manuelle des comptes recruteurs</p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {STATUTS.map(s => (
              <div key={s.id} style={{ padding: '8px 16px', background: s.bg, borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{stats[s.id]}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
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
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
            Aucune demande dans cette catégorie.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {demandesFiltrees.map(d => {
              const info = statutInfo(d.statut)
              return (
                <div key={d.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '18px 20px' }}>
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
