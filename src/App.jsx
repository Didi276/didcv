import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Generate from './Generate'
import Templates from './Templates'
import Auth from './Auth'
import Dashboard from './Dashboard'
import Profile from './Profile'
import Formations from './Formations'
import Entretien from './Entretien'
import PreparationEntretien from './PreparationEntretien'
import CVPublic from './CVPublic'
import Offres from './Offres'
import RecruteurInscription from './RecruteurInscription'
import RecruteurConnexion from './RecruteurConnexion'
import RecruteurBanque from './RecruteurBanque'
import AdminRecruteurs from './AdminRecruteurs'
import About from './About'
import Contact from './Contact'
import Privacy from './Privacy'
import CGU from './CGU'
import NotFound from './NotFound'

import Candidatures from './Candidatures'
import Blog from './Blog'
import BlogArticle from './BlogArticle'
import GuidesMetier from './GuidesMetier'
import GuideDetail from './GuideDetail'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/auth"           element={<Auth />} />
        <Route path="/templates"      element={<Templates />} />
        <Route path="/generate"       element={<Generate />} />
        <Route path="/dashboard"      element={<Dashboard />} />
        <Route path="/profile"        element={<Profile />} />
        <Route path="/offres"         element={<Offres />} />
        <Route path="/candidatures"   element={<Candidatures />} />
        <Route path="/formations"     element={<Formations />} />
        <Route path="/entretien"      element={<Entretien />} />
        <Route path="/preparation-entretien" element={<PreparationEntretien />} />
        <Route path="/cv/:slug"       element={<CVPublic />} />
        <Route path="/recruteurs/inscription" element={<RecruteurInscription />} />
        <Route path="/recruteurs/connexion"   element={<RecruteurConnexion />} />
        <Route path="/recruteurs/banque"      element={<RecruteurBanque />} />
        <Route path="/admin/recruteurs"       element={<AdminRecruteurs />} />
        <Route path="/blog"           element={<Blog />} />
        <Route path="/blog/:slug"     element={<BlogArticle />} />
        <Route path="/guides"         element={<GuidesMetier />} />
        <Route path="/guide/:slug"    element={<GuideDetail />} />
        <Route path="/about"          element={<About />} />
        <Route path="/contact"        element={<Contact />} />
        <Route path="/privacy"        element={<Privacy />} />
        <Route path="/cgu"            element={<CGU />} />
        <Route path="*"               element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
