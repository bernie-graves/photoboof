import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Photobooth from './components/Photobooth'
import Gallery from './components/Gallery'
import AdminPanel from './components/AdminPanel'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/photobooth" element={<Photobooth />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </Router>
  )
}

export default App