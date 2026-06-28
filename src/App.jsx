import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Generate from './Generate'
import Templates from './Templates'
import Auth from './Auth'
import Dashboard from './Dashboard'
import Profile from './Profile'
import Offres from './Offres'
// Dans les routes :
<Route path="/offres" element={<Offres />} />

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App