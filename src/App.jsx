import { Routes, Route } from 'react-router-dom'
import { Navbar, Footer } from './components/index.js'
import Landing from './pages/Landing.jsx'
import Analyzer from './pages/Analyzer.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import About from './pages/About.jsx'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/analyzer" element={<Analyzer />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
