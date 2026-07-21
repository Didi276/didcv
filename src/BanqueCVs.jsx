/*
  ─── SQL à exécuter dans Supabase ────────────────────────────────────────

  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visible_recruteurs BOOLEAN DEFAULT false;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recherche_emploi TEXT DEFAULT '';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disponibilite TEXT DEFAULT '';

  -- Policy additionnelle nécessaire : la table "profiles" n'a normalement qu'une
  -- policy restreignant la lecture au propriétaire (auth.uid() = user_id). Sans
  -- policy supplémentaire, un visiteur anonyme sur /banque-cvs ne pourrait lire
  -- AUCUN profil. On ajoute donc une policy SELECT dédiée, sur le même modèle
  -- que "Public peut voir les CVs actifs" utilisée pour cv_partages : elle ne
  -- rend visibles que les lignes où le candidat a explicitement activé le
  -- toggle "Être visible par les recruteurs".
  CREATE POLICY "Public peut voir les profils visibles recruteurs" ON profiles FOR SELECT USING (visible_recruteurs = true);

  ──────────────────────────────────────────────────────────────────────────
*/

import { useState, useEffect } from 'react'
import Navbar from './Navbar'
import { supabase } from './supabase'

const PAR_PAGE = 12
const DISPO_OPTIONS = ['Immédiatement', 'Dans 1 mois', 'Dans 3 mois']
const CONTRAT_OPTIONS = ['CDI', 'CDD', 'Alternance', 'Stage', 'Freelance']

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

function CandidatCard({ p, lienCv }) {
  const competencesVisibles = (p.competences || []).filter(c => c && c.trim()).slice(0, 5)
  return (
    <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {p.photo ? (
          <img src={p.photo} alt="" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
        ) : (
          <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: '700', color: '#4f46e5', flexShrink: 0 }}>
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
        {p.ville && <span style={{ fontSize: '11px', fontWeight: '500', background: '#f3f4f6', color: '#374151', padding: '3px 9px', borderRadius: '6px' }}>📍 {p.ville}</span>}
        {p.disponibilite && <span style={{ fontSize: '11px', fontWeight: '600', background: '#f0fdf4', color: '#16a34a', padding: '3px 9px', borderRadius: '6px' }}>🕒 {p.disponibilite}</span>}
        {p.recherche_emploi && <span style={{ fontSize: '11px', fontWeight: '600', background: '#eef2ff', color: '#4f46e5', padding: '3px 9px', borderRadius: '6px' }}>{p.recherche_emploi}</span>}
      </div>

      {competencesVisibles.length > 0 && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {competencesVisibles.map((c, i) => (
            <span key={i} style={{ fontSize: '11px', padding: '3px 9px', background: '#f8f9ff', border: '1px solid #ede9fe', borderRadius: '20px', color: '#374151' }}>{c}</span>
          ))}
        </div>
      )}

      {lienCv ? (
        <a href={`/cv/${lienCv}`} target="_blank" rel="noopener noreferrer"
          style={{ marginTop: 'auto', textAlign: 'center', padding: '10px', background: '#4f46e5', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>
          Voir le CV
        </a>
      ) : (
        <div style={{ marginTop: 'auto', textAlign: 'center', padding: '10px', background: '#f3f4f6', color: '#9ca3af', borderRadius: '8px', fontSize: '12px', fontWeight: '600' }}>
          CV non partagé
        </div>
      )}
    </div>
  )
}

export default function BanqueCVs() {
  const w = useWidth()
  const isMobile = w < 768

  const [profils, setProfils] = useState([])
  const [liensCv, setLiensCv] = useState({})
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [filtreMetier, setFiltreMetier] = useState('')
  const [filtreVille, setFiltreVille] = useState('')
  const [filtreDispo, setFiltreDispo] = useState('')
  const [filtreContrat, setFiltreContrat] = useState('')

  useEffect(() => {
    const charger = async () => {
      setLoading(true)

      let requete = supabase.from('profiles').select('*', { count: 'exact' }).eq('visible_recruteurs', true)
      if (filtreMetier.trim()) requete = requete.ilike('titre', `%${filtreMetier.trim()}%`)
      if (filtreVille.trim()) requete = requete.ilike('ville', `%${filtreVille.trim()}%`)
      if (filtreDispo) requete = requete.eq('disponibilite', filtreDispo)
      if (filtreContrat) requete = requete.eq('recherche_emploi', filtreContrat)

      const from = (page - 1) * PAR_PAGE
      const to = from + PAR_PAGE - 1
      const { data, count } = await requete.order('created_at', { ascending: false }).range(from, to)

      setProfils(data || [])
      setTotal(count || 0)

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
  }, [filtreMetier, filtreVille, filtreDispo, filtreContrat, page])

  const changerFiltre = (setter) => (valeur) => { setter(valeur); setPage(1) }

  const totalPages = Math.max(1, Math.ceil(total / PAR_PAGE))

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="banque-cvs" />

      <div style={{ background: '#171412', padding: '48px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '34px', fontWeight: '800', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Trouvez vos prochains talents
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>
            Candidats disponibles et à l'écoute
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '24px 16px 80px' : '32px 24px 80px' }}>

        {/* Filtres */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: '10px', marginBottom: '28px' }}>
          <input value={filtreMetier} onChange={e => changerFiltre(setFiltreMetier)(e.target.value)} placeholder="Métier / secteur"
            style={{ ...SELECT_STYLE, cursor: 'text', gridColumn: isMobile ? 'span 2' : 'auto' }} />
          <input value={filtreVille} onChange={e => changerFiltre(setFiltreVille)(e.target.value)} placeholder="Ville"
            style={{ ...SELECT_STYLE, cursor: 'text', gridColumn: isMobile ? 'span 2' : 'auto' }} />
          <select value={filtreDispo} onChange={e => changerFiltre(setFiltreDispo)(e.target.value)} style={SELECT_STYLE}>
            <option value="">Disponibilité</option>
            {DISPO_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <select value={filtreContrat} onChange={e => changerFiltre(setFiltreContrat)(e.target.value)} style={SELECT_STYLE}>
            <option value="">Type de contrat</option>
            {CONTRAT_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
          {total} candidat{total > 1 ? 's' : ''} disponible{total > 1 ? 's' : ''}
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: '32px', height: '32px', border: '3px solid #ede9fe', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : profils.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px', background: '#fff', borderRadius: '14px', border: '1px solid #e5e7eb' }}>
            Aucun candidat ne correspond à ces critères pour le moment.
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(240px, 1fr))', gap: isMobile ? '12px' : '20px', marginBottom: '32px' }}>
              {profils.map(p => <CandidatCard key={p.id} p={p} lienCv={liensCv[p.user_id]} />)}
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  style={{ padding: '8px 16px', background: page === 1 ? '#f3f4f6' : '#fff', color: page === 1 ? '#c4c4c4' : '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: page === 1 ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                  ← Précédent
                </button>
                <span style={{ fontSize: '13px', color: '#6b7280' }}>Page {page} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  style={{ padding: '8px 16px', background: page === totalPages ? '#f3f4f6' : '#fff', color: page === totalPages ? '#c4c4c4' : '#374151', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: page === totalPages ? 'default' : 'pointer', fontFamily: 'inherit' }}>
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
