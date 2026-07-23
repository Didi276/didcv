/*
  ─── SQL à exécuter dans Supabase ────────────────────────────────────────

  CREATE TABLE recruteurs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    email TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    entreprise TEXT NOT NULL,
    poste TEXT NOT NULL,
    telephone TEXT,
    justification TEXT,
    statut TEXT DEFAULT 'en_attente',
    valide_par TEXT,
    valide_le TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER TABLE recruteurs ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Recruteurs voient leur profil" ON recruteurs FOR SELECT USING (auth.uid() = user_id);
  CREATE POLICY "Admins voient tout" ON recruteurs FOR ALL USING (auth.jwt() ->> 'email' IN ('fernandochokki@gmail.com', 'chokkifernando@gmail.com', 'carlinazon@gmail.com'));

  -- Nécessaire pour que l'inscription elle-même fonctionne : la policy "Admins
  -- voient tout" est FOR ALL, donc seuls les 3 emails admin peuvent insérer une
  -- ligne. Sans policy INSERT dédiée, un recruteur ne pourrait pas créer sa
  -- propre demande. On l'autorise uniquement pour sa propre ligne (son user_id),
  -- avec un statut de départ forcé à 'en_attente' pour qu'il ne puisse pas
  -- s'auto-valider.
  CREATE POLICY "Un recruteur peut creer sa demande" ON recruteurs FOR INSERT WITH CHECK (auth.uid() = user_id AND statut = 'en_attente');

  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS visible_recruteurs BOOLEAN DEFAULT false;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS recherche_contrat TEXT DEFAULT '';
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS disponibilite TEXT DEFAULT '';

  ──────────────────────────────────────────────────────────────────────────
*/

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { supabase } from './supabase'

const DOMAINES_INTERDITS = ['gmail.com', 'hotmail.com', 'hotmail.fr', 'yahoo.com', 'yahoo.fr', 'outlook.com', 'outlook.fr', 'live.com', 'live.fr']

const INPUT = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '9px',
  fontSize: '14px', fontFamily: 'inherit', color: '#111', outline: 'none', boxSizing: 'border-box',
}

function EnTete() {
  return (
    <div style={{ borderBottom: '1px solid #f0f0f0', background: '#fff', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link to="/" style={{ fontWeight: '800', fontSize: '18px', textDecoration: 'none', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
        <span style={{ color: '#1e3a5f' }}>Did</span>CV <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500' }}>Recruteurs</span>
      </Link>
      <Link to="/recruteurs/connexion" style={{ fontSize: '13px', color: '#1e3a5f', textDecoration: 'none', fontWeight: '600' }}>
        Déjà inscrit ? Se connecter
      </Link>
    </div>
  )
}

const EMPTY = { prenom: '', nom: '', email: '', password: '', entreprise: '', poste: '', telephone: '', justification: '' }

export default function RecruteurInscription() {
  const [form, setForm] = useState(EMPTY)
  const [certifie, setCertifie] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erreur, setErreur] = useState('')
  const [envoye, setEnvoye] = useState(false)

  const champ = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const handleSubmit = async () => {
    setErreur('')
    if (!form.prenom.trim() || !form.nom.trim() || !form.email.trim() || !form.password || !form.entreprise.trim() || !form.poste.trim() || !form.justification.trim()) {
      setErreur('Merci de remplir tous les champs obligatoires.')
      return
    }
    const domaine = form.email.split('@')[1]?.toLowerCase()
    if (!domaine || DOMAINES_INTERDITS.includes(domaine)) {
      setErreur("Merci d'utiliser ton adresse email professionnelle (pas gmail, hotmail, yahoo ou outlook).")
      return
    }
    if (form.password.length < 8) {
      setErreur('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    if (!certifie) {
      setErreur('Merci de certifier ton engagement avant de continuer.')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.auth.signUp({ email: form.email.trim(), password: form.password })
    if (error || !data?.user) {
      setLoading(false)
      setErreur(error?.message === 'User already registered' ? 'Un compte existe déjà avec cet email.' : "Impossible de créer le compte. Réessaie.")
      return
    }

    const { error: erreurInsert } = await supabase.from('recruteurs').insert({
      user_id: data.user.id,
      email: form.email.trim(),
      nom: form.nom.trim(),
      prenom: form.prenom.trim(),
      entreprise: form.entreprise.trim(),
      poste: form.poste.trim(),
      telephone: form.telephone.trim(),
      justification: form.justification.trim(),
      statut: 'en_attente',
    })
    setLoading(false)
    if (erreurInsert) { setErreur("Le compte a été créé mais la demande n'a pas pu être enregistrée. Contacte-nous."); return }
    setEnvoye(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f6fa', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <EnTete />

      <div style={{ background: '#1e3a5f', padding: '48px 24px' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#fff', margin: '0 0 10px', letterSpacing: '-1px' }}>
            Espace Recruteurs
          </h1>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.75)', margin: 0 }}>
            Accède à des candidats certifiés et disponibles — sur validation manuelle
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {envoye ? (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '40px 32px', textAlign: 'center' }}>
            <CheckCircle size={44} color="#16a34a" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#111', margin: '0 0 10px' }}>Demande envoyée</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.7', margin: 0 }}>
              Votre demande a été reçue. Notre équipe la valide sous 24-48h. Vous recevrez un email de confirmation.
            </p>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e5e7eb', padding: '32px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Demande d'accès recruteur</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Prénom *</label>
                <input value={form.prenom} onChange={champ('prenom')} style={INPUT} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Nom *</label>
                <input value={form.nom} onChange={champ('nom')} style={INPUT} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Email professionnel *</label>
              <input value={form.email} onChange={champ('email')} type="email" placeholder="prenom.nom@entreprise.com" style={INPUT} />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Mot de passe *</label>
              <input value={form.password} onChange={champ('password')} type="password" placeholder="8 caractères minimum" style={INPUT} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Entreprise *</label>
                <input value={form.entreprise} onChange={champ('entreprise')} style={INPUT} />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Poste occupé *</label>
                <input value={form.poste} onChange={champ('poste')} style={INPUT} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Téléphone</label>
              <input value={form.telephone} onChange={champ('telephone')} style={INPUT} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Pourquoi souhaitez-vous accéder à la banque de CVs ? *</label>
              <textarea value={form.justification} onChange={champ('justification')} rows={4} style={{ ...INPUT, resize: 'vertical', lineHeight: '1.6' }} />
            </div>

            <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '20px', cursor: 'pointer' }}>
              <input type="checkbox" checked={certifie} onChange={e => setCertifie(e.target.checked)} style={{ marginTop: '3px', flexShrink: 0 }} />
              <span style={{ fontSize: '13px', color: '#374151', lineHeight: '1.5' }}>
                Je certifie utiliser ces données uniquement dans le cadre de mes activités de recrutement
              </span>
            </label>

            {erreur && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '9px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>
                {erreur}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '13px', background: loading ? '#9ca3af' : '#1e3a5f', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: loading ? 'default' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? 'Envoi...' : 'Envoyer ma demande'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
