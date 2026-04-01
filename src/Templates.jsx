import { useNavigate } from 'react-router-dom'

const templates = [
  {
    id: 'finance',
    nom: 'Finance',
    description: 'Sobre et corporate, idéal pour la finance et le conseil',
    couleur: '#1a1a1a',
    accent: '#1a1a1a',
    badge: 'Populaire'
  },
  {
    id: 'classique',
    nom: 'Classique',
    description: 'Universel et ATS friendly, convient à tous les secteurs',
    couleur: '#1a56db',
    accent: '#1a56db',
    badge: 'ATS optimal'
  },
  {
    id: 'moderne',
    nom: 'Moderne',
    description: 'Colonne latérale colorée, moderne et professionnel',
    couleur: '#0f6e56',
    accent: '#0f6e56',
    badge: 'Tendance'
  },
  {
    id: 'creatif',
    nom: 'Créatif',
    description: 'Design audacieux pour les métiers créatifs',
    couleur: '#993556',
    accent: '#993556',
    badge: 'Original'
  },
  {
    id: 'tech',
    nom: 'Tech',
    description: 'Épuré et moderne pour les développeurs et ingénieurs',
    couleur: '#534AB7',
    accent: '#534AB7',
    badge: 'IT & Dev'
  },
  {
    id: 'minimaliste',
    nom: 'Minimaliste',
    description: 'Ultra clean, laisse le contenu parler de lui-même',
    couleur: '#888780',
    accent: '#888780',
    badge: 'Élégant'
  }
]

function Templates() {
  const navigate = useNavigate()

  const choisirTemplate = (templateId) => {
    navigate(`/generate?template=${templateId}`)
  }

  return (
    <div className="templates-page">
      <nav>
        <a className="logo" href="/"><span>Did</span>CV</a>
        <div className="nav-btns">
          <a href="/" className="btn-ghost">Retour</a>
        </div>
      </nav>

      <div className="templates-wrap">
        <div className="templates-header">
          <div className="section-label">Templates</div>
          <h2 className="section-title">Choisis ton template<br/><em>de CV</em></h2>
          <p className="templates-sub">Sélectionne le design qui correspond à ton secteur et ta personnalité</p>
        </div>

        <div className="templates-grid">
          {templates.map((template) => (
            <div
              key={template.id}
              className="template-card"
              onClick={() => choisirTemplate(template.id)}
            >
              <div className="template-preview" style={{borderTop: `4px solid ${template.couleur}`}}>
                <div className="preview-header" style={{borderBottom: `2px solid ${template.couleur}`}}>
                  <div className="preview-nom" style={{color: template.couleur}}>Prénom Nom</div>
                  <div className="preview-titre">Titre du poste</div>
                  <div className="preview-contact">
                    <span>email@gmail.com</span>
                    <span>+33 6 00 00 00 00</span>
                    <span>Paris</span>
                  </div>
                </div>
                <div className="preview-body">
                  <div className="preview-section">
                    <div className="preview-section-title" style={{borderBottom: `1px solid ${template.couleur}`, color: template.couleur}}>EXPÉRIENCES</div>
                    <div className="preview-line"></div>
                    <div className="preview-line short"></div>
                    <div className="preview-line"></div>
                    <div className="preview-line short"></div>
                  </div>
                  <div className="preview-section">
                    <div className="preview-section-title" style={{borderBottom: `1px solid ${template.couleur}`, color: template.couleur}}>COMPÉTENCES</div>
                    <div className="preview-tags">
                      <span className="preview-tag" style={{background: template.couleur + '20', color: template.couleur}}>Tag 1</span>
                      <span className="preview-tag" style={{background: template.couleur + '20', color: template.couleur}}>Tag 2</span>
                      <span className="preview-tag" style={{background: template.couleur + '20', color: template.couleur}}>Tag 3</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="template-info">
                <div className="template-top">
                  <div className="template-nom">{template.nom}</div>
                  <span className="template-badge" style={{background: template.couleur + '15', color: template.couleur}}>{template.badge}</span>
                </div>
                <div className="template-desc">{template.description}</div>
                <button className="template-btn" style={{background: template.couleur}}>
                  Choisir ce template →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Templates