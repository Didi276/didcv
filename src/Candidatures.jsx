/*
  ─── SQL à exécuter dans Supabase ────────────────────────────────────────

  -- Nécessaire pour relier une candidature au CV généré pour ce poste (boutons
  -- "Voir mon CV" et "Préparer l'entretien" ci-dessous, et le bouton
  -- "Ajouter au suivi des candidatures" dans Generate.jsx). Sans cette colonne,
  -- on ne pourrait retrouver le CV correspondant qu'en comparant des titres de
  -- façon approximative, ce qui n'est pas fiable.
  ALTER TABLE candidatures ADD COLUMN IF NOT EXISTS cv_id UUID REFERENCES cvs(id) ON DELETE SET NULL;

  -- Suivi multi-entretiens : plusieurs tours d'entretien par candidature
  -- (RH, technique, manager, cas pratique, final...), chacun avec sa propre
  -- date, son interlocuteur et son résultat.
  CREATE TABLE IF NOT EXISTS entretiens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    candidature_id UUID REFERENCES candidatures(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    tour INTEGER DEFAULT 1,
    type TEXT DEFAULT 'RH',
    date_entretien TIMESTAMPTZ,
    interlocuteur TEXT DEFAULT '',
    lieu TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    resultat TEXT DEFAULT 'en_attente',
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER TABLE entretiens ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users gèrent leurs entretiens" ON entretiens
  FOR ALL USING (auth.uid() = user_id);

  -- Suivi des rappels email J-3 / J-1 envoyés pour chaque entretien, pour ne
  -- jamais envoyer le même rappel deux fois. Voir api/cron-rappels-entretiens.js.
  ALTER TABLE entretiens ADD COLUMN IF NOT EXISTS rappel_j3_envoye BOOLEAN DEFAULT false;
  ALTER TABLE entretiens ADD COLUMN IF NOT EXISTS rappel_j1_envoye BOOLEAN DEFAULT false;

  ──────────────────────────────────────────────────────────────────────────
*/

import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabase'
import Navbar from './Navbar'
import { CVTemplatePro } from './CVTemplatesPro'
import { downloadCVasPDF } from './pdfUtils'
import { MapPin, DollarSign, Zap, ClipboardList, Target, BookOpen, Trash2, Download, Plus, PartyPopper, Calendar, Sparkles } from 'lucide-react'

const COLONNES = [
  { id: 'a_postuler',  label: 'À postuler',    color: '#6b7280', bg: '#f9fafb', dot: '#9ca3af' },
  { id: 'postule',     label: 'Postulé',        color: '#1d4ed8', bg: '#eff6ff', dot: '#3b82f6' },
  { id: 'entretien',   label: 'Entretien',      color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6' },
  { id: 'offre',       label: 'Offre reçue',    color: '#16a34a', bg: '#f0fdf4', dot: '#22c55e' },
  { id: 'refuse',      label: 'Refusé',         color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
]

const EMPTY = { titre: '', entreprise: '', lieu: '', url_offre: '', salaire: '', notes: '', statut: 'a_postuler' }

const TYPES_ENTRETIEN = ['RH', 'Technique', 'Manager', 'Cas pratique', 'Final']
const RESULTATS = [
  { id: 'a_venir',    label: 'À venir',             color: '#7c3aed', bg: '#f5f3ff' },
  { id: 'positif',    label: 'Positif',             color: '#16a34a', bg: '#f0fdf4' },
  { id: 'negatif',    label: 'Négatif',             color: '#dc2626', bg: '#fef2f2' },
  { id: 'en_attente', label: 'En attente de retour', color: '#ea580c', bg: '#fff7ed' },
]
const EMPTY_ENTRETIEN = { type: 'RH', date_entretien: '', interlocuteur: '', lieu: '', notes: '', resultat: 'a_venir' }

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

export default function Candidatures() {
  const [cards, setCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editCard, setEditCard] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [dragId, setDragId] = useState(null)
  const [dragOver, setDragOver] = useState(null)
  const [activeCol, setActiveCol] = useState(null)
  const [cvApercu, setCvApercu] = useState(null)
  const [felicitationsCard, setFelicitationsCard] = useState(null)
  const [entretiens, setEntretiens] = useState({})
  const [showEntretienForm, setShowEntretienForm] = useState(false)
  const [entretienCard, setEntretienCard] = useState(null)
  const [entretienForm, setEntretienForm] = useState(EMPTY_ENTRETIEN)
  const [savingEntretien, setSavingEntretien] = useState(false)
  const w = useWidth()
  const isMobile = w < 768

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/auth'; return }
      setUser(user)
      const { data } = await supabase.from('candidatures').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      setCards(data || [])

      const { data: entretiensData } = await supabase.from('entretiens').select('*').eq('user_id', user.id).order('tour', { ascending: true })
      const grouped = {}
      ;(entretiensData || []).forEach(en => {
        if (!grouped[en.candidature_id]) grouped[en.candidature_id] = []
        grouped[en.candidature_id].push(en)
      })
      setEntretiens(grouped)

      setLoading(false)
    }
    init()
  }, [])

  const openEntretienForm = (card, e) => {
    e.stopPropagation()
    setEntretienCard(card)
    setEntretienForm(EMPTY_ENTRETIEN)
    setShowEntretienForm(true)
  }

  // Dès qu'un entretien avec une date est enregistré ici, il devient visible
  // à api/interview-reminder.js qui envoie automatiquement les rappels
  // J-3 et J-1 le jour venu (un navigateur ne peut pas planifier un envoi à
  // une date future, ce déclenchement se fait donc côté serveur, pas ici).
  const handleSaveEntretien = async () => {
    if (!entretienCard) return
    setSavingEntretien(true)
    const tour = (entretiens[entretienCard.id]?.length || 0) + 1
    const { data } = await supabase.from('entretiens').insert({
      candidature_id: entretienCard.id,
      user_id: user.id,
      tour,
      type: entretienForm.type,
      date_entretien: entretienForm.date_entretien ? new Date(entretienForm.date_entretien).toISOString() : null,
      interlocuteur: entretienForm.interlocuteur,
      lieu: entretienForm.lieu,
      notes: entretienForm.notes,
      resultat: entretienForm.resultat,
    }).select().single()
    if (data) {
      setEntretiens({ ...entretiens, [entretienCard.id]: [...(entretiens[entretienCard.id] || []), data] })
    }
    setSavingEntretien(false)
    setShowEntretienForm(false)
  }

  const openNew = (statut = 'a_postuler') => {
    setEditCard(null)
    setForm({ ...EMPTY, statut })
    setShowForm(true)
  }

  const openEdit = (card) => {
    setEditCard(card)
    setForm({ titre: card.titre, entreprise: card.entreprise, lieu: card.lieu || '', url_offre: card.url_offre || '', salaire: card.salaire || '', notes: card.notes || '', statut: card.statut })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.titre.trim()) return
    setSaving(true)
    if (editCard) {
      const { data } = await supabase.from('candidatures').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editCard.id).select().single()
      setCards(cards.map(c => c.id === editCard.id ? data : c))
    } else {
      const { data } = await supabase.from('candidatures').insert({ ...form, user_id: user.id }).select().single()
      setCards([data, ...cards])
    }
    setSaving(false)
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette candidature ?')) return
    await supabase.from('candidatures').delete().eq('id', id)
    setCards(cards.filter(c => c.id !== id))
    setShowForm(false)
  }

  const moveCard = async (cardId, newStatut) => {
    const card = cards.find(c => c.id === cardId)
    if (!card || card.statut === newStatut) return
    await supabase.from('candidatures').update({ statut: newStatut }).eq('id', cardId)
    setCards(cards.map(c => c.id === cardId ? { ...c, statut: newStatut } : c))
  }

  const construireTexteOffre = (card) =>
    [card.titre, card.entreprise && `${card.entreprise}${card.lieu ? ' - ' + card.lieu : ''}`, card.salaire, '', card.notes].filter(Boolean).join('\n')

  const genererCV = (card, e) => {
    e.stopPropagation()
    sessionStorage.setItem('offre_prefill', JSON.stringify({
      titre: card.titre || '', entreprise: card.entreprise || '', url: card.url_offre || '',
      texte: construireTexteOffre(card),
    }))
    window.location.href = '/generate?template=auto'
  }

  const voirCV = async (card, e) => {
    e.stopPropagation()
    if (!card.cv_id) { alert("Aucun CV n'est encore associé à cette candidature."); return }
    setCvApercu({ loading: true })
    const { data } = await supabase.from('cvs').select('*').eq('id', card.cv_id).maybeSingle()
    if (data) setCvApercu({ loading: false, cv: data })
    else { setCvApercu(null); alert("Ce CV n'existe plus.") }
  }

  const allerVersEntretien = (card, mode) => (e) => {
    e.stopPropagation()
    sessionStorage.setItem('entretien_candidature_id', card.id)
    sessionStorage.setItem('entretien_poste', card.titre || '')
    sessionStorage.setItem('entretien_entreprise', card.entreprise || '')
    if (card.url_offre) sessionStorage.setItem('entretien_url', card.url_offre)
    sessionStorage.setItem('entretien_mode', mode)
    window.location.href = '/entretien'
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''

  const stats = {
    total: cards.length,
    postule: cards.filter(c => c.statut === 'postule').length,
    entretien: cards.filter(c => c.statut === 'entretien').length,
    offre: cards.filter(c => c.statut === 'offre').length,
  }

  const INPUT = { width: '100%', padding: '9px 12px', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box', background: '#fff' }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div style={{ width: '36px', height: '36px', border: '3px solid #ede9fe', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="candidatures" />

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f0f0f0', padding: isMobile ? '16px' : '24px 40px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: '#111', margin: '0 0 4px', letterSpacing: '-0.5px' }}>Suivi des candidatures</h1>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Gérez toutes vos candidatures en un seul endroit</p>
            </div>
            <button onClick={() => openNew()}
              style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}>
              <Plus size={15} /> Nouvelle candidature
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {[
              { label: 'Total', value: stats.total, color: '#374151', bg: '#f3f4f6' },
              { label: 'Postulées', value: stats.postule, color: '#1d4ed8', bg: '#eff6ff' },
              { label: 'Entretiens', value: stats.entretien, color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'Offres', value: stats.offre, color: '#16a34a', bg: '#f0fdf4' },
            ].map(s => (
              <div key={s.label} style={{ padding: '8px 16px', background: s.bg, borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '18px', fontWeight: '800', color: s.color }}>{s.value}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kanban */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: isMobile ? '16px 8px' : '32px 40px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '16px', minWidth: isMobile ? '900px' : 'auto' }}>
          {COLONNES.map(col => {
            const colCards = cards.filter(c => c.statut === col.id)
            const isDragTarget = dragOver === col.id

            return (
              <div key={col.id}
                style={{ flex: 1, minWidth: '200px', background: isDragTarget ? col.bg : '#f8f9fa', borderRadius: '14px', border: 'none', boxShadow: isDragTarget ? `0 0 0 2px ${col.dot}` : 'none', transition: 'box-shadow 0.15s, background 0.15s', padding: '14px' }}
                onDragOver={e => { e.preventDefault(); setDragOver(col.id) }}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => { e.preventDefault(); if (dragId) moveCard(dragId, col.id); setDragOver(null); setDragId(null) }}>

                {/* En-tête colonne */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: col.dot }} />
                    <span style={{ fontSize: '12px', fontWeight: '700', color: col.color }}>{col.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', background: '#fff', padding: '1px 7px', borderRadius: '10px' }}>{colCards.length}</span>
                </div>

                {/* Cartes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '100px' }}>
                  {colCards.map(card => (
                    <div key={card.id}
                      draggable
                      onDragStart={() => setDragId(card.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => openEdit(card)}
                      style={{ background: '#fff', borderRadius: '10px', padding: '12px', cursor: 'pointer', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: 'none', opacity: dragId === card.id ? 0.5 : 1, transition: 'box-shadow 0.15s', userSelect: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#111', marginBottom: '4px', lineHeight: '1.3' }}>{card.titre}</div>
                      {card.entreprise && <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', fontWeight: '500' }}>🏢 {card.entreprise}</div>}
                      {card.lieu && <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={10} /> {card.lieu}</div>}
                      {card.salaire && <div style={{ fontSize: '11px', color: '#16a34a', marginTop: '4px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><DollarSign size={10} /> {card.salaire}</div>}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        {card.url_offre && (
                          <a href={card.url_offre} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                            style={{ fontSize: '10px', color: '#4f46e5', textDecoration: 'none', fontWeight: '600' }}>
                            Voir l'offre →
                          </a>
                        )}
                        <span style={{ fontSize: '10px', color: '#c4c4c4', marginLeft: 'auto' }}>{formatDate(card.created_at)}</span>
                      </div>

                      {/* Action selon le statut */}
                      {card.statut === 'a_postuler' && (
                        <button onClick={e => genererCV(card, e)}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', marginTop: '8px', padding: '7px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                          <Zap size={11} /> Générer mon CV
                        </button>
                      )}
                      {card.statut === 'postule' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginTop: '8px' }}>
                          <button onClick={e => voirCV(card, e)}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', padding: '7px', background: '#eff6ff', color: '#1d4ed8', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <ClipboardList size={11} /> Voir mon CV
                          </button>
                          <button onClick={allerVersEntretien(card, 'entrainement')} title="Tu n'as pas encore eu de réponse mais tu peux t'entraîner en avance"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', padding: '7px', background: '#f5f3ff', color: '#7c3aed', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                            <Target size={11} /> S'entraîner
                          </button>
                        </div>
                      )}
                      {card.statut === 'entretien' && (() => {
                        const cardEntretiens = entretiens[card.id] || []
                        const nbTours = cardEntretiens.length
                        const dernier = cardEntretiens[nbTours - 1]
                        const dernierResultat = RESULTATS.find(r => r.id === dernier?.resultat) || RESULTATS[0]
                        return (
                          <div style={{ marginTop: '8px' }}>
                            {nbTours > 0 && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                <span style={{ fontSize: '10px', fontWeight: '700', color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: '10px' }}>
                                  Tour {nbTours}/3
                                </span>
                                {dernier && (
                                  <span style={{ fontSize: '10px', fontWeight: '700', color: dernierResultat.color, background: dernierResultat.bg, padding: '2px 8px', borderRadius: '10px' }}>
                                    {dernierResultat.label}
                                  </span>
                                )}
                              </div>
                            )}

                            {nbTours > 0 && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '8px', paddingLeft: '10px', borderLeft: '2px solid #ede9fe' }}>
                                {cardEntretiens.map(en => {
                                  const r = RESULTATS.find(x => x.id === en.resultat) || RESULTATS[0]
                                  return (
                                    <div key={en.id} style={{ position: 'relative' }}>
                                      <div style={{ position: 'absolute', left: '-15px', top: '3px', width: '8px', height: '8px', borderRadius: '50%', background: r.color }} />
                                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#374151' }}>Tour {en.tour} · {en.type}</div>
                                      <div style={{ fontSize: '10px', color: '#9ca3af', marginBottom: '3px' }}>
                                        {en.date_entretien ? new Date(en.date_entretien).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Date non définie'}
                                      </div>
                                      <a
                                        href={`/preparation-entretien?poste=${encodeURIComponent(card.titre || '')}&entreprise=${encodeURIComponent(card.entreprise || '')}&type=${encodeURIComponent(en.type || '')}&date=${encodeURIComponent(en.date_entretien || '')}&url_offre=${encodeURIComponent(card.url_offre || '')}`}
                                        onClick={e => e.stopPropagation()}
                                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#4f46e5', fontWeight: '700', textDecoration: 'none' }}>
                                        <Sparkles size={10} /> Préparer
                                      </a>
                                    </div>
                                  )
                                })}
                              </div>
                            )}

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                              <button onClick={e => openEntretienForm(card, e)}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', padding: '7px', background: '#eef2ff', color: '#4f46e5', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                                <Calendar size={11} /> Ajouter un entretien
                              </button>
                              <button onClick={allerVersEntretien(card, 'preparation')}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', padding: '7px', background: '#f5f3ff', color: '#7c3aed', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                                <Target size={11} /> Préparer l'entretien
                              </button>
                            </div>
                          </div>
                        )
                      })()}
                      {card.statut === 'offre' && (
                        <button onClick={e => { e.stopPropagation(); setFelicitationsCard(card) }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', marginTop: '8px', padding: '7px', background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                          <PartyPopper size={11} /> Félicitations
                        </button>
                      )}
                      {card.statut === 'refuse' && (
                        <a href="/formations" onClick={e => e.stopPropagation()}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', width: '100%', marginTop: '8px', padding: '7px', background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: '7px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', textAlign: 'center', boxSizing: 'border-box' }}>
                          <BookOpen size={11} /> Formations recommandées
                        </a>
                      )}
                    </div>
                  ))}

                  {/* Bouton ajout rapide */}
                  <button onClick={() => openNew(col.id)}
                    style={{ width: '100%', padding: '8px', background: 'transparent', border: '1.5px dashed #d1d5db', borderRadius: '8px', color: '#9ca3af', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500', transition: 'all 0.15s', marginTop: colCards.length > 0 ? '4px' : '0' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = col.dot; e.currentTarget.style.color = col.color }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.color = '#9ca3af' }}>
                    + Ajouter
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Modal formulaire */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '24px', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>
                {editCard ? 'Modifier la candidature' : 'Nouvelle candidature'}
              </h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Poste *</label>
                <input value={form.titre} onChange={e => setForm({...form, titre: e.target.value})} placeholder="Développeur React" style={INPUT} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Entreprise</label>
                  <input value={form.entreprise} onChange={e => setForm({...form, entreprise: e.target.value})} placeholder="Google" style={INPUT} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Ville</label>
                  <input value={form.lieu} onChange={e => setForm({...form, lieu: e.target.value})} placeholder="Paris" style={INPUT} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Salaire</label>
                  <input value={form.salaire} onChange={e => setForm({...form, salaire: e.target.value})} placeholder="45 000€/an" style={INPUT} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Statut</label>
                  <select value={form.statut} onChange={e => setForm({...form, statut: e.target.value})} style={{ ...INPUT, cursor: 'pointer' }}>
                    {COLONNES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Lien vers l'offre</label>
                <input value={form.url_offre} onChange={e => setForm({...form, url_offre: e.target.value})} placeholder="https://..." style={INPUT} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={3} placeholder="Contacts, remarques, prochaines étapes..." style={{ ...INPUT, resize: 'vertical', lineHeight: '1.5' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button onClick={handleSave} disabled={saving || !form.titre.trim()}
                  style={{ flex: 1, padding: '11px', background: saving ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                  {saving ? 'Sauvegarde...' : editCard ? 'Modifier' : 'Ajouter'}
                </button>
                {editCard && (
                  <button onClick={() => handleDelete(editCard.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '11px 16px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              {/* Déplacer vers */}
              {editCard && (
                <div>
                  <div style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginBottom: '6px' }}>Déplacer vers</div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {COLONNES.filter(c => c.id !== form.statut).map(c => (
                      <button key={c.id} onClick={async () => { await moveCard(editCard.id, c.id); setForm({...form, statut: c.id}); setShowForm(false) }}
                        style={{ padding: '5px 12px', background: c.bg, color: c.color, border: 'none', borderRadius: '20px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal ajouter un entretien */}
      {showEntretienForm && entretienCard && (
        <div onClick={() => setShowEntretienForm(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 300, display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', padding: isMobile ? 0 : '24px', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: isMobile ? '16px 16px 0 0' : '16px', width: '100%', maxWidth: '480px', maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: 0 }}>
                Ajouter un entretien - Tour {(entretiens[entretienCard.id]?.length || 0) + 1}
              </h3>
              <button onClick={() => setShowEntretienForm(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>✕</button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Type d'entretien</label>
                <select value={entretienForm.type} onChange={e => setEntretienForm({...entretienForm, type: e.target.value})} style={{ ...INPUT, cursor: 'pointer' }}>
                  {TYPES_ENTRETIEN.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Date et heure</label>
                <input type="datetime-local" value={entretienForm.date_entretien} onChange={e => setEntretienForm({...entretienForm, date_entretien: e.target.value})} style={INPUT} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Interlocuteur</label>
                <input value={entretienForm.interlocuteur} onChange={e => setEntretienForm({...entretienForm, interlocuteur: e.target.value})} placeholder="Marie Dupont, Responsable RH" style={INPUT} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Lieu ou lien visio</label>
                <input value={entretienForm.lieu} onChange={e => setEntretienForm({...entretienForm, lieu: e.target.value})} placeholder="Zoom, bureaux Paris..." style={INPUT} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Notes</label>
                <textarea value={entretienForm.notes} onChange={e => setEntretienForm({...entretienForm, notes: e.target.value})} rows={3} placeholder="Points abordés, ressenti, questions posées..." style={{ ...INPUT, resize: 'vertical', lineHeight: '1.5' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Résultat</label>
                <select value={entretienForm.resultat} onChange={e => setEntretienForm({...entretienForm, resultat: e.target.value})} style={{ ...INPUT, cursor: 'pointer' }}>
                  {RESULTATS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>

              <button onClick={handleSaveEntretien} disabled={savingEntretien}
                style={{ padding: '11px', background: savingEntretien ? '#a5b4fc' : '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: savingEntretien ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                {savingEntretien ? 'Sauvegarde...' : "Ajouter l'entretien"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal apercu CV */}
      {cvApercu && (
        <div onClick={() => setCvApercu(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0' : '24px', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: isMobile ? '0' : '16px', width: '100%', maxWidth: isMobile ? '100%' : '860px', height: isMobile ? '100%' : 'auto', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#111' }}>Mon CV pour ce poste</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {cvApercu.cv && (
                  <button onClick={() => downloadCVasPDF(document.getElementById('cv-to-print'), cvApercu.cv.cv_data.prenom, cvApercu.cv.cv_data.nom)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <Download size={14} />
                  </button>
                )}
                <button onClick={() => setCvApercu(null)} style={{ width: '30px', height: '30px', borderRadius: '8px', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
              </div>
            </div>
            <div style={{ overflow: 'auto', flex: 1, display: 'flex', justifyContent: 'center', padding: '20px 16px', background: '#f8f9ff' }}>
              {cvApercu.loading ? (
                <div style={{ padding: '60px', color: '#9ca3af', fontSize: '13px' }}>Chargement...</div>
              ) : (
                <div style={{ transform: isMobile ? `scale(${Math.min(0.45, (w - 32) / 794)})` : 'scale(1)', transformOrigin: 'top center', boxShadow: '0 4px 24px rgba(0,0,0,0.12)', borderRadius: '4px', overflow: 'hidden' }}>
                  <CVTemplatePro cvData={cvApercu.cv.cv_data} template={cvApercu.cv.template} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal félicitations */}
      {felicitationsCard && (
        <div onClick={() => setFelicitationsCard(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', backdropFilter: 'blur(4px)' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '20px', padding: '36px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
            <PartyPopper size={44} color="#16a34a" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: '0 0 10px' }}>Félicitations !</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', margin: '0 0 24px', lineHeight: '1.7' }}>
              Tu as décroché le poste de <strong>{felicitationsCard.titre}</strong>
              {felicitationsCard.entreprise && <> chez <strong>{felicitationsCard.entreprise}</strong></>} ! Tout le travail mis dans ta candidature a payé.
            </p>
            <button onClick={() => setFelicitationsCard(null)}
              style={{ width: '100%', padding: '12px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
              Merci !
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
