import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Generate from './Generate'
import Templates from './Templates'
import Auth from './Auth'
import Dashboard from './Dashboard'
import Profile from './Profile'
import Offres from './Offres'
import About from './About'
import Contact from './Contact'
import Privacy from './Privacy'
import CGU from './CGU'
import NotFound from './NotFound'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/auth"      element={<Auth />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/generate"  element={<Generate />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/offres"    element={<Offres />} />
        <Route path="/about"     element={<About />} />
        <Route path="/contact"   element={<Contact />} />
        <Route path="/privacy"   element={<Privacy />} />
        <Route path="/cgu"       element={<CGU />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
