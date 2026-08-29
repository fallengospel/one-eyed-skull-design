import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Nav from './components/Nav.jsx'
import Home from './pages/Home.jsx'
import Vault from './pages/Profile.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <HashRouter>
      <div className="min-h-screen">
        <div className="grain-layer" aria-hidden="true" />
        <Nav />
        <ScrollToTop />
        <main className="mx-auto w-full max-w-7xl px-4 pb-24 pt-8 sm:px-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/vault" element={<Vault />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  )
}
