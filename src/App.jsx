import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Generate from './Generate'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generate />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App