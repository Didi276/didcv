/*
  ─── SQL à exécuter dans Supabase ────────────────────────────────────────

  CREATE TABLE cv_partages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cv_id UUID REFERENCES cvs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    slug TEXT UNIQUE NOT NULL,
    vues INTEGER DEFAULT 0,
    derniere_vue TIMESTAMPTZ,
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
  ALTER TABLE cv_partages ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Public peut voir les CVs actifs" ON cv_partages FOR SELECT USING (actif = true);
  CREATE POLICY "Users gèrent leurs partages" ON cv_partages FOR ALL USING (auth.uid() = user_id);

  -- Fonction additionnelle nécessaire : la policy ci-dessus n'autorise l'UPDATE
  -- qu'au propriétaire (auth.uid() = user_id). Un visiteur anonyme qui consulte
  -- /cv/:slug ne peut donc pas lui-même incrémenter "vues" directement. On passe
  -- par une fonction SECURITY DEFINER volontairement très restreinte (elle ne
  -- touche que vues/derniere_vue d'une ligne active, rien d'autre) pour éviter
  -- d'ouvrir une policy UPDATE publique permissive sur toute la table.
  CREATE OR REPLACE FUNCTION increment_vue_cv(p_slug TEXT)
  RETURNS void AS $$
  BEGIN
    UPDATE cv_partages
    SET vues = vues + 1, derniere_vue = NOW()
    WHERE slug = p_slug AND actif = true;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

  ──────────────────────────────────────────────────────────────────────────
*/

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Lock, Download } from 'lucide-react'
import { supabase } from './supabase'
import { CVTemplatePro } from './CVTemplatesPro'
import { downloadCVasPDF } from './pdfUtils'

function useWidth() {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200)
  useEffect(() => {
    const fn = () => setW(window.innerWidth)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])
  return w
}

function EnTete() {
  return (
    <div style={{ borderBottom: '1px solid #f0f0f0', background: '#fff', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Link to="/" style={{ fontWeight: '800', fontSize: '18px', textDecoration: 'none', color: '#1a1a1a', letterSpacing: '-0.5px' }}>
        <span style={{ color: '#4f46e5' }}>Did</span>CV
      </Link>
      <a href="/auth" style={{ padding: '9px 18px', background: '#4f46e5', color: '#fff', borderRadius: '9px', textDecoration: 'none', fontSize: '13px', fontWeight: '700' }}>
        Créer mon CV gratuit
      </a>
    </div>
  )
}

export default function CVPublic() {
  const { slug } = useParams()
  const w = useWidth()
  const isMobile = w < 768

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [cv, setCv] = useState(null)

  useEffect(() => {
    const charger = async () => {
      const { data: partage } = await supabase.from('cv_partages').select('*').eq('slug', slug).eq('actif', true).maybeSingle()
      if (!partage) { setNotFound(true); setLoading(false); return }

      const { data: cvData } = await supabase.from('cvs').select('cv_data, template').eq('id', partage.cv_id).maybeSingle()
      if (!cvData) { setNotFound(true); setLoading(false); return }

      setCv(cvData)
      setLoading(false)

      supabase.rpc('increment_vue_cv', { p_slug: slug })
    }
    charger()
  }, [slug])

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: '16px', background: '#f8f9ff' }}>
        <div style={{ width: '36px', height: '36px', border: '3px solid #ede9fe', borderTop: '3px solid #4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (notFound) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
        <EnTete />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 60px)', padding: '40px 24px', textAlign: 'center' }}>
          <Lock size={64} color="#c4c4c4" strokeWidth={1.5} style={{ marginBottom: '16px' }} />
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#111', margin: '0 0 10px', letterSpacing: '-1px' }}>Ce CV n'est plus disponible</h1>
          <p style={{ fontSize: '15px', color: '#9ca3af', margin: '0 0 32px', maxWidth: '400px', lineHeight: '1.6' }}>
            Ce lien n'existe pas, ou son propriétaire a désactivé le partage.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/" style={{ padding: '11px 24px', background: '#4f46e5', color: '#fff', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700' }}>
              Accueil
            </a>
            <a href="/auth" style={{ padding: '11px 24px', background: '#fff', color: '#374151', border: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
              Créer mon CV gratuit
            </a>
          </div>
        </div>
      </div>
    )
  }

  const scale = isMobile ? Math.min(1, (w - 32) / 794) : 1

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9ff', fontFamily: '"Inter",system-ui,sans-serif' }}>
      <EnTete />

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '20px 16px 60px' : '32px 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <button onClick={() => downloadCVasPDF(document.getElementById('cv-to-print'), cv.cv_data.prenom, cv.cv_data.nom)}
            style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '11px 24px', background: '#171412', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(0,0,0,0.25)' }}>
            <Download size={15} /> Télécharger
          </button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: `${794 * scale}px`, height: `${1123 * scale}px`, boxShadow: '0 8px 40px rgba(0,0,0,0.15)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '794px', height: '1123px', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <CVTemplatePro cvData={cv.cv_data} template={cv.template} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
