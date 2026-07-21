import { useEffect, useState } from 'react'
import Navbar from './Navbar'
import { supabase } from './supabase'
import { FORMATIONS, CATEGORIES } from './formationsData'

const CATEGORY_ICONS = {
  'Compétences pro': '💼',
  'IA et Tech': '🤖',
  'Excel et Data': '📊',
  'Communication': '🗣️',
  'Outils gratuits': '🧰',
  'Langues': '🌍',
}

// Mots-clés d'un titre de poste -> tags "metiers" utilisés dans formationsData.js
const METIER_KEYWORDS = [
  [/compt/i, 'comptable'],
  [/assistant/i, 'assistant'],
  [/commercial|vente|business developer/i, 'commercial'],
  [/marketing/i, 'marketing'],
  [/communication/i, 'communication'],
  [/d[ée]veloppeur|informatique|logiciel|ingénieur.*(logiciel|informatique)/i, 'developpeur'],
  [/data|données/i, 'data'],
  [/chef de projet|project manager/i, 'chef de projet'],
  [/manager|responsable|directeur/i, 'manager'],
  [/rh|ressources humaines|recrut/i, 'rh'],
  [/designer|graphiste|ux|ui/i, 'designer'],
  [/cr[ée]atif|cr[ée]ation/i, 'creatif'],
  [/finance/i, 'finance'],
  [/international|export/i, 'international'],
]

function metiersFromTitre(titre) {
  if (!titre) return []
  const found = new Set()
  METIER_KEYWORDS.forEach(([regex, tag]) => { if (regex.test(titre)) found.add(tag) })
  return [...found]
}

function getRecommandations(profilMetiers) {
  if (!profilMetiers.length) return []
  const scored = FORMATIONS.map(f => {
    const score = f.metiers.filter(m => profilMetiers.includes(m)).length
    return { f, score }
  }).filter(x => x.score > 0)
  scored.sort((a, b) => b.score - a.score)
  let result = scored.map(x => x.f)
  if (result.length < 4) {
    const complement = FORMATIONS.filter(f => f.metiers.includes('tous') && !result.includes(f))
    result = [...result, ...complement]
  }
  return result.slice(0, 6)
}

function FormationCard({ f }) {
  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #ececec', padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '30px' }}>{CATEGORY_ICONS[f.categorie] || '🎓'}</div>
        {f.gratuit && (
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#0f6e56', background: '#e6f7f1', padding: '4px 10px', borderRadius: '20px', letterSpacing: '0.3px' }}>
            GRATUIT
          </span>
        )}
      </div>
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>{f.categorie}</div>
        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 8px', lineHeight: '1.3' }}>{f.titre}</h3>
        <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.6' }}>{f.description}</p>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: 'auto', paddingTop: '4px' }}>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#4f46e5', background: '#eef2ff', padding: '4px 10px', borderRadius: '6px' }}>{f.niveau}</span>
        <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px' }}>⏱ {f.duree}</span>
      </div>
      <a href={f.lien} target="_blank" rel="noopener noreferrer"
        style={{ marginTop: '4px', textAlign: 'center', fontSize: '13px', fontWeight: '700', textDecoration: 'none', color: '#fff', background: '#4f46e5', padding: '10px', borderRadius: '8px' }}>
        Accéder →
      </a>
    </div>
  )
}

export default function Formations() {
  const [categorie, setCategorie] = useState('')
  const [gratuitOnly, setGratuitOnly] = useState(false)
  const [recommandees, setRecommandees] = useState([])

  useEffect(() => {
    const chargerProfil = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('titre').eq('user_id', user.id).maybeSingle()
      if (data?.titre) {
        const tags = metiersFromTitre(data.titre)
        setRecommandees(getRecommandations(tags))
      }
    }
    chargerProfil()
  }, [])

  const formations = FORMATIONS.filter(f => {
    if (categorie && f.categorie !== categorie) return false
    if (gratuitOnly && !f.gratuit) return false
    return true
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <Navbar currentPage="formations" />

      <div style={{ background: '#0f6e56', padding: '56px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '38px', fontWeight: '800', color: '#fff', margin: '0 0 12px', letterSpacing: '-1px' }}>
            Centre de formations
          </h1>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.8)', margin: 0 }}>
            Tout ce que l'école ne t'a pas appris
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 24px 80px' }}>

        {recommandees.length > 0 && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#111', margin: '0 0 4px', letterSpacing: '-0.3px' }}>
              Recommandées pour toi
            </h2>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 20px' }}>
              En fonction du profil renseigné dans ton compte
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
              {recommandees.map(f => <FormationCard key={f.id} f={f} />)}
            </div>
          </div>
        )}

        {/* Filtres */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '28px' }}>
          <button onClick={() => setCategorie('')}
            style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: !categorie ? '#4f46e5' : '#f3f4f6', color: !categorie ? '#fff' : '#374151' }}>
            Toutes les catégories
          </button>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategorie(c === categorie ? '' : c)}
              style={{ padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: categorie === c ? '#4f46e5' : '#f3f4f6', color: categorie === c ? '#fff' : '#374151' }}>
              {CATEGORY_ICONS[c]} {c}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button onClick={() => setGratuitOnly(!gratuitOnly)}
            style={{ padding: '6px 14px', borderRadius: '20px', border: gratuitOnly ? 'none' : '1px solid #e5e7eb', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px', fontWeight: '600', background: gratuitOnly ? '#0f6e56' : '#fff', color: gratuitOnly ? '#fff' : '#374151' }}>
            {gratuitOnly ? '✓ Gratuit uniquement' : 'Gratuit uniquement'}
          </button>
        </div>

        <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
          {formations.length} formation{formations.length > 1 ? 's' : ''}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
          {formations.map(f => <FormationCard key={f.id} f={f} />)}
        </div>

        {formations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontSize: '14px' }}>
            Aucune formation ne correspond à ces filtres.
          </div>
        )}
      </div>
    </div>
  )
}
